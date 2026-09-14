# Intrinsic and layout interpolation — the browser's model, and where Jumi already stands

Chromium 153.0.8010.12. `pnpm spike:intrinsic-layout` (`scripts/spike-intrinsic-layout.mjs`). No `src/`
changes. Follows the entry/exit spike's discipline: measure the platform first, read Jumi's own output
second, invent nothing.

## Summary

**The platform can interpolate between a keyword size and a definite one, behind exactly one declaration —
and a Jumi build is already opted in wherever a motion exists.** There is no new subsystem to design:

```text
interpolate-size: allow-keywords  → an inherited opt-in that makes auto / min-content / max-content / fit-content
                                    interpolable against a length
calc-size(auto, size + 1rem)      → a per-declaration escape hatch needing no opt-in at all
```

The two are independent: the inherited opt-in is a document- or element-level switch, `calc-size()` is
written into the value itself. What is left is not architecture but coverage — two of Jumi's size
properties refuse the keyword, and no utility reaches the switch (§5).

## 1 · What turns it on

Each row is a real `@keyframes` writing the property from one endpoint to the other, sampled by seeking the
paused animation to 0 / 25 / 50 / 75 / 100% of its interval.

| motion | sampled values | reading |
| --- | --- | --- |
| `width: auto → 200px`, nothing opted in | `400px 400px 200px 200px 200px` | **no interpolation** — the change lands at the midpoint as a discrete flip |
| the same, `interpolate-size` on the element | `400px 350px 300px 250px 200px` | interpolates |
| the same, `interpolate-size` on `:root` instead | `400px 350px 300px 250px 200px` | **it is inherited** — the root is enough |
| `height: 0 → auto` | `0px 4.19px 8.39px 12.59px 16.80px` | interpolates, and `auto` resolves to the content's own height |
| `block-size: auto → 120px` | `16.80px 42.59px 68.39px 94.19px 120px` | interpolates — the logical properties are not special |
| `inline-size: auto → 90px` | `400px 322.5px 245px 167.5px 90px` | interpolates — including *from* `auto`, not only *to* it |
| `fit-content → 240px` | `209.19px 216.89px 224.59px 232.30px 240px` | interpolates |

A transition behaves identically: `height: 0 → auto` with `allow-keywords` produced
`0.13:2.23px … 0.53:8.95px … 0.98:16.52px` — the same curve as the keyframe above. **So the mechanism sits
in the interpolation of a size, not in either of the two ways a size can change.** That is the opposite of
what the entry/exit spike found for `display`, where the mechanism sits in the *transition* path only.

## 2 · What is not interpolable

`min-content → max-content` under `allow-keywords` sampled `43.30px 43.30px 293.67px 293.67px 293.67px` —
**a discrete flip at the midpoint, with the opt-in on.** Intrinsic keyword against intrinsic keyword has no
number to travel through; the opt-in only pairs a keyword with a *length*.

The practical consequence is that an author cannot smoothly resize between two content-derived sizes with
this mechanism, and Jumi does not need to make one.

## 3 · `calc-size()` is a second, independent mechanism

| motion | nothing opted in | reading |
| --- | --- | --- |
| `calc-size(auto, size + 40px) → 200px` | `440px 380px 320px 260px 200px` | interpolates **with no opt-in anywhere** |
| `calc-size(any, 50% - 20px) → 200px` | `180px 185px 190px 195px 200px` | interpolates, and `any` accepts the percentage |

So the escape hatch is per-declaration and inherits nothing: it works in a keyframe, on an element whose
document never mentions `interpolate-size`. Nothing in Jumi emits `calc-size(` today (§5).

## 4 · Jumi, read rather than assumed

Measured by compiling Jumi's own plugin and reading the finished stylesheet, then loading that stylesheet in
the browser with a carrier and a non-carrier side by side:

| reading | result |
| --- | --- |
| `interpolate-size` on an element with a motion | **`allow-keywords`** |
| `interpolate-size` on an element with no motion | `numeric-only` (the initial value) |
| `animate-width-auto`, base `width: 200px`, sampled | `200px 281.69px 360.47px 392.08px 400px` — **it interpolates**, eased by the default timing function |

The mechanism is Jumi's existing composition, which already carries a real property alongside the animation
longhands: `--jumi-interpolate-size: allow-keywords` ships in the defaults, and
`interpolate-size: var(--jumi-interpolate-size)` is written by the composition payload onto the carriers. So
**any element that animates anything is already opted in, and nothing outside a carrier is** — which is the
right default in both directions, and it means keyword-size motion works today through the ordinary
utilities:

```html
<div class="animate-width-auto w-[200px]">…</div>
```

with no declaration the author has to know about. That is the whole of the integration story: **none.**

## 5 · The gaps, as measured rather than suspected

Build-differential readings — a candidate whose stylesheet is byte-identical to a build without it emitted
nothing at all, which is a refusal, and is a different fact from a rule that happens not to write a size:

| candidate | result |
| --- | --- |
| `animate-width-auto`, `animate-width-[auto]` | emitted; writes `width: var(--jumi-width-…)` |
| `animate-height-auto` | emitted |
| `animate-inline-size-auto` | emitted |
| `animate-block-size-auto` | **refused — emitted nothing at all** |
| `animate-min-width-auto` | **refused — emitted nothing at all** |
| `animate-interpolate-size-allow-keywords`, `[…]-[allow-keywords]`, `animation-interpolate-size-allow-keywords` | all refused |

The refusals are Jumi's, not the host's: `block-auto`, `min-w-auto`, `min-h-auto`, `size-auto`, `w-auto`,
`h-auto` and `inline-auto` are **all** available as Tailwind utilities in the same build. `animate-block-size`
and `animate-width` declare the same type list (`['length', 'percentage', 'any']`), so what differs is the
declared `values:` source — `empty.auto` and `theme('minWidth')` against `theme('height')` and a local
`inlineSize` list. Naming the cause is as far as this spike goes: it is a value-coverage question, not a
design one, and it is left for a decision rather than fixed here.

## Instrument notes

Five fixture bugs, every one of which reads exactly like a platform limitation:

- **A watched property that is not a CSS property name.** `watch: 'blockSize'` put `blockSize:` inside a
  `@keyframes` block, where it is an unknown declaration, so the case measured nothing and reported a snap.
  The measurement table needs the dashed spelling *and* a reader that uses it — both.
- **An empty div makes `auto` resolve to zero.** `height: 0 → auto` on an empty element read `0px` at every
  sample, because `auto` was 0. Every probe element now carries content.
- **`min-height` on a shared selector masks every height case.** The board's own rule quietly supplied the
  value each case appeared to be measuring.
- **A seeked transition lags the seek.** Sampling a `CSSTransition` after `currentTime = …` reported the
  *previous* sample's value; keyframes do not show this, so a discrete measurement would never have revealed
  it. Transitions are now sampled the other way round — let them run, and pair the value with the progress
  the platform reports at that instant.
- **A false positive of my own making.** A grep for `interpolate-size` in the output returned `yes`, and the
  obvious reading is "Jumi already opts in" — but the match was the *variable registration*, not the
  declaration. Matching the value (`interpolate-size:\s*allow-keywords`) is what made the claim true, and
  then finding *which* rule carried it is what made it useful.
