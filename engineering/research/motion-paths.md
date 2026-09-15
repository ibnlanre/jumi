# Motion paths — the platform, measured before any syntax

Chromium 153.0.8010.12, `pnpm spike:motion-paths` (`scripts/spike-motion-paths.mjs`). No `src/`
changes: the point was to find out whether Jumi already has the pieces, and it does.

## Summary

Motion paths need **no new subsystem, and no new syntax**. The whole feature is:

```html
<div
  class="[offset-path:path('M0,0_L200,0_L200,200')] animate-offset-distance-100 animate-timeline-scroll"
></div>
```

A path **declared** on the element, a distance **driven** by an existing Jumi tween, and the driver
optionally scrolled. Measured end to end: the element travels `0,0 → 163,0 → 200,121 → 200,184 → 200,200`
across the animation, with `offset-distance` resolving `0% → 40.9% → 80.2% → 96.0% → 100%` — one
keyframe (`jumi-offset-distance-<hash>`), no warnings, and the same motion on a scroll timeline with
`animation-range-[25%_75%]` giving `0,0 → 200,121 → 200,200` at ¼ ½ ¾.

Jumi has shipped the entire `offset-*` family as tweens for some time (`animate-offset-path`,
`-distance`, `-rotate`, `-anchor`, `-position`, and their parts), with correct value types. What was
missing was not surface. It was the boundary below.

## 1 · What matters, and what each property is for

All five properties parse, and 26 of 27 value forms are accepted. The one that is not is not a gap:
`ray(45deg 100px)` is **invalid grammar** — a ray's size is a keyword (`closest-side`,
`farthest-corner`, …), not a length. `ray(45deg)` and `ray(45deg closest-side)` are both fine.

| property          | role                                      | measured                                                                                                                                   |
| ----------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `offset-path`     | where the motion happens                  | `path()`, `ray()`, `circle()`, `ellipse()`, `inset()`, `polygon()`, `border-box`, `content-box`, `view-box`, `none` all parse              |
| `offset-distance` | **how far along it** — the driver         | drives continuously, 0→100%                                                                                                                |
| `offset-rotate`   | the tangent                               | `auto` turns the element: a 40×8 box on a 45° path measures 33.9 wide (40·cos45 + 8·sin45)                                                 |
| `offset-anchor`   | which point of the element rides the path | `top left` sits 20px right of `center` on the same path, half the box's 40px width                                                         |
| `offset-position` | the origin a `ray()` starts from          | `ray(45deg)` + `offset-position: 50% 50%` travels up-and-right, per the CSS convention that a ray's 0° is **up** and positive is clockwise |

Two forms worth naming because they replace authored geometry entirely: `offset-path: border-box` walks
the element's own border box (`0,0 → 420,185 → 0,292 → 0,59 → 0,0` around a 420×320 container), and
`offset-path: circle(60px)` is a closed loop that returns to its start at 100%.

## 2 · One driver, four declarations

This is the classification the spike was for, and it is measured rather than assumed:

- **`offset-distance` is a driver.** Its whole range is meaningful and continuous.
- **`offset-path` animated from `none` is discrete.** Measured on the same element as the working arm:
  `0,0 / 0,0 / 190,111 / 190,174 / 190,190` — nothing, nothing, then the element is on the path and
  travelling. The path does not fade in; it appears, at the halfway point, because that is what
  interpolating `none` to `path()` means.
- **But two compatible paths interpolate.** `path('M0,0 L200,0')` → `path('M0,0 L200,200')` on the same
  element took the endpoint from `y = −4` to `y = 87` at the halfway point, heading for `196`. Same
  command list, so the geometry morphs. (The sample taken exactly at the duration reported the start
  value — a boundary artefact, not a finding.)

So the model is: **set the geometry, drive the distance.** `offset-rotate`, `offset-anchor` and
`offset-position` are in the same class as the path — they describe the geometry and are written once,
not interpolated. `offset-path` is the interesting one: it is a declaration _and_, between two
compatible shapes, a driver. Both are true, and neither needs a subsystem: `animate-offset-path-[…]`
already animates it, and a plain declaration already sets it.

## 3 · Questions the spike did not need to ask twice

- **Can existing Jumi keyframes drive `offset-distance`?** Yes, unchanged — the single-value form is
  enough, and nothing about the slot protocol, the composition, per-slot scoping, naming or the range
  variant needed adjusting. `animate-offset-distance-100` is the whole driver.
- **Scroll timelines and motion paths?** They compose as-is: one `animate-offset-distance-100` with
  `animation-timeline-scroll` and `animation-range-[25%_75%]` measured `0,0 → 200,121 → 200,200` at
  ¼ ½ ¾, and `animation-range-entry:…` is available for a view-driven version.
- **Reduced motion?** The platform does not clamp it — an author's clamp does, exactly as the
  scroll-driven work found. Nothing new.
- **Should `offset-path` be structural?** No. It is a normal property in Jumi's model, with the one
  caveat that animating it from `none` is a snap, so the docs' advice should be "declare the path".
- **Transform and offset together?** Additive: `animate-offset-distance-100 animate-translate-x-[40px]`
  moves 40px further along x at every sample (240,200 rather than 200,200 at the end).
- **Are arbitrary values enough, or do named conveniences earn their place?** Arbitrary is enough
  today: every geometry form is an arbitrary value, and the theme already names the one-word cases
  (`border-box`, `content-box`, `auto`, `reverse`, the anchor keywords). A named convenience would need
  evidence that a path repeats across a project, and this spike produced none. **Recommendation: none.**

## 4 · The one gap found, and it is not architectural

`animate-offset-distance-[0:0%|100:100%]` — a **phrase**, the documented way to give one property its
own frames — emits **nothing at all**, silently. Three spellings measured (`%`, escaped `%`, and `px`),
all silent, which rules out escaping: the cause is the matcher's `type`.

Tailwind validates an arbitrary value against the matcher's `type` **before** Jumi sees it, and a phrase
is neither a length nor a percentage. Measured on the family: `animate-offset-distance` declares
`type: ['length', 'percentage']`, so `[50%]` is accepted and `[0:0%|100:100%]` is dropped. Properties
that declare **no** type default to `'any'` and accept phrases, which is why `animate-opacity-[0:0|100:1]`
and `animate-rotate-[0:16deg|58:0deg]` work.

The blast radius, from the table: **50 matchers declare `type: ['length', 'percentage']`** — the correct
grammar for the property, and phrase-hostile — and a further 15 declare `type: 'length'`, which is the
same shape that silently refused percentages on the timeline insets until that was fixed.

This is a table-wide decision rather than a defect to patch, because the two goals conflict: a `type`
list is validation (`animate-offset-distance-[abc]` should be refused), and a phrase is an arbitrary
value that no single type describes. The options are to relax the type where a phrase is legitimate, or
to accept that those properties are driven by a single value and document it. **Motion paths do not
depend on the answer** — the driver is measured working without phrases — which is why this is a
finding rather than an implementation.

## 5 · Harness notes, for the next spike

Two instrument traps, both of which presented as platform limits:

- **`AnimationEffect.getComputedTiming().duration` is a number for a time-driven animation and a
  `CSSUnitValue` for a progress-driven one.** Reading `.value` on both seeks every time-driven arm to
  zero, which reads as "the platform does not move the element" — the first run of this harness
  reported exactly that for every arm, including a hand-written control, which is what gave it away.
  A control arm is what makes that distinction cheap.
- **Backticks inside a comment inside a template literal end the template** — the eighth time in this
  repo, and always in a browser fixture, because the fixture is one big template literal.

Two fixture artefacts, recorded so nobody re-derives them: a **square** box cannot reveal
`offset-rotate` (a 20×20 box at 90° measures 20 wide — the standalone probe uses 40×8), and
`offset-distance` on an element whose nearest scrollport is the viewport makes a scrolled arm's rect
viewport-relative, so positions have to be read with the scroll offset added.
