# Scroll-driven animations

*RESEARCH — platform capability, measured. Not a workstream, and not filed.*

The CTO brief (`engineering/decisions/CTO.md`…) asked for a platform spike before any syntax: can an
animation Jumi already emits be retargeted from the document timeline to a scroll or view timeline,
and what do the existing controls mean once it has been? No public classes, no `src` changes, ending
in a capability matrix and the smallest architectural change required — preferably none.

Everything below is measured against a real build (Tailwind emits, `dist/index.js` finalizes) in
**Chromium 153.0.8010.12** on **2026-09-14**, by `pnpm spike:scroll-driven` — 31 candidates, eight
sections, 31 arms. Arm ids (`aScroll`, `bMixed`, `cDelayS`, …) refer to the report the script prints,
and their markup and candidates are declared in `scripts/spike-scroll-driven/arms.mjs`.

## Summary

**The hypothesis holds, and the emission already implements it.** A scroll timeline is a *control
over an existing Jumi animation*, not a new animation family — and `animation-timeline` is already a
per-slot list in the composition, position-aligned with the `animation` shorthand, so a single slot
can be retargeted while its neighbours stay on the document timeline. Measured: `bMixed` resolves
`animation-name: jumi-rotate-3zWYd, jumi-fade-in` against `animation-timeline: scroll(), auto`, and
`getAnimations()` reports position 0 on a `ScrollTimeline` and position 1 on a `DocumentTimeline`.
The motion, the keyframes, the slot resolution and the per-slot controls are all untouched. **No new
animation model is needed.**

**The time vocabulary keeps a meaning, and it is a better one than "ignored".** A scroll timeline
normalizes each animation to *its own effect end*: resolved `duration` is a percentage of the range
(measured `100%` with no delay; `83.3333%` for `delay 200ms / duration 1s`; `62.5%` for
`delay 600ms / duration 1s`). So `animation-duration` is inert on its own, and `animation-delay`
becomes a share of the scroll that also *compresses* the motion. Full classification in §5.

**Two platform properties cannot be reached at all, and one of them is already half-exposed.**
`animation-timeline` is written as a real declaration by the composition; **`animation-range` is not
written anywhere** — the shipped stylesheet contains **zero** real `animation-range`,
`scroll-timeline-*` or `view-timeline-*` declarations, so the `animation-range*` controls Jumi already
documents write custom properties nothing reads (measured inert twice, §6). A *named* timeline can be
**consumed** through the existing arbitrary path (`animation-timeline-[--page]` → `ScrollTimeline`
sourced from `#pane`) but not **declared**.

**No syntax is needed for the retarget itself.** Everything a scroll-driven slot needs is already
expressible: `animation-timeline-scroll`, `-view`, `-none`, the `-axis`/`-scroller` modifiers, the
`/<slot>` scope, and arbitrary values for anything the named values do not cover. The smallest
change is not to the model but to **one missing part**: `animation-range`.

## 1 · What a build writes today

The composition (measured, `spike-scroll-driven/dump.mjs`):

```css
.animate-rotate-45, .animate-fade-in {
  animation: var(--jumi-slot-rotate-3zWYd, none), var(--jumi-slot-fade-in, none);
  animation-composition: var(--jumi-rotate-animation-composition, …), var(--jumi-fade-in-animation-composition, …);
  animation-timeline: var(--jumi-rotate-animation-timeline, …), var(--jumi-fade-in-animation-timeline, …);
  interpolate-size: var(--jumi-interpolate-size);
}
```

- **`animation-timeline` is already list-per-slot and position-aligned.** It is not a single value:
  it is one entry per slot in the stylesheet, in the same order as the `animation` list. That is the
  property the whole feature hangs on, and it was there before this spike.
- **Per-slot scoping already works.** `animation-timeline-view/rotate` writes
  `--jumi-rotate-animation-timeline: var(--jumi-animation-timeline-view)` on the element, and the
  composition's position 0 reads it. The `/<slot>` vocabulary is the *same* vocabulary the timing
  controls use — nothing new is introduced by addressing a timeline.
- **The global control broadcasts.** `animation-timeline-scroll` (no modifier) writes
  `--jumi-animation-timeline`, the fallback of *every* position, so a two-slot element gets two
  scroll timelines (measured `bBoth`: both positions `ScrollTimeline`). Useful, and it is what an
  author asking for "this element is scroll-driven" means.
- **The order after the shorthand is load-bearing.** `dOrderBefore` (timeline declared *before* the
  `animation` shorthand) computes `animation-timeline: auto`; `dOrderAfter` computes
  `scroll(root)`. **Falsified instrument, corrected reason:** the same test shows
  `animation-composition: add` surviving the shorthand in *both* orders — measured, the shorthand
  resets `animation-timeline` and does **not** reset `animation-composition`. The comment in
  `src/helpers/carriers/index.ts` (`AFTER_SHORTHAND` "the two it resets") is half wrong. The emission
  order is still correct, so this is a comment to fix, not code.

## 2 · Retarget: the same motion, a different driver

`aDtm` is the control (no timeline control): `DocumentTimeline`, `currentTime` in milliseconds and
climbing. Every arm below is the *same* `animate-fade-in` — same keyframes, same slot, same
substrate — and only the driver changes.

| arm | computed `animation-timeline` | resolved as | progress over the sweep 0 · ¼ · ½ · ¾ · 1 |
| --- | --- | --- | --- |
| `aScroll` | `scroll()` | `ScrollTimeline` ← root | 0 · 0.25 · 0.5 · 0.75 · 1 |
| `aScrollRoot` | `scroll(root)` | `ScrollTimeline` ← root | 0 · 0.25 · 0.5 · 0.75 · 1 |
| `aPaneScroll` | `scroll()` | `ScrollTimeline` ← `#pane` | 0 · 0.25 · 0.5 · 0.75 · 1 |
| `aSelfScroll` | `scroll(self)` | `ScrollTimeline` ← itself | 0 · 0.25 · 0.5 · 0.75 · 1 |
| `aArbFn` | `scroll(block root)` | `ScrollTimeline` ← root | 0 · 0.25 · 0.5 · 0.75 · 1 |
| `aView` | `view()` | `ViewTimeline` ← root | 0.51 · 1 · 1 · 1 · 1 |
| `aScrollAxisX` | `scroll(x)` | *inactive* | — · — · — · — · — |
| `aViewAxisX` | `view(x)` | *constant 60%* | 0.6 · 0.6 · 0.6 · 0.6 · 0.6 |
| `aNone` | `none` | *no animation* | 0 · 0 · 0 · 0 · 0 |

- **All four scroller forms and both anonymous functions work**, including `self` (an element that
  is its own scroll container) and `nearest` (which correctly follows `#pane`, not the root).
- **Progress is exact.** `currentTime` reads back as a `CSSUnitValue` percentage — `0%`,
  `25.0158%`, `50%`, `75.0158%`, `100%` — not milliseconds. (Instrument note: a numeric formatter
  renders these `NaN`; the reader normalizes them in the page.)
- **Inactive is silent.** `scroll(x)` on a page with no horizontal overflow yields *no animation at
  all* and `view(x)` reports a constant — the element simply paints its base state. There is no
  warning, no console error and no build-time signal. This is the single most dangerous shape in the
  feature: a typo'd axis or a container that never overflows fails open.
- **`animation-timeline: none` is a kill switch, not a fallback.** The animation exists but never
  progresses (`currentTime` pinned at 0, progress 0, opacity at its base value). Reaching for `none`
  to mean "let it fall back to time" gives the author a motion that never runs.
- **A view timeline reports outside its range.** Before entry, `currentTime` is *negative*
  (measured `-61.0445%` on `eViewSelf` at scroll 0).

## 3 · The aggregate: several slots, more than one timeline

| arm | computed `animation-name` | computed `animation-timeline` | measured result |
| --- | --- | --- | --- |
| `bMixed` | `jumi-rotate-3zWYd, jumi-fade-in` | `scroll(), auto` | pos 0 `ScrollTimeline`, pos 1 `DocumentTimeline` |
| `bBoth` | same | `scroll(), scroll()` | both `ScrollTimeline` |
| `bSplit` | same | `view(), scroll()` | pos 0 `ViewTimeline`, pos 1 `ScrollTimeline` |
| `bDurations` | same | `scroll(), scroll()` | both `ScrollTimeline`, both `100%` resolved duration |
| `bArbNamed` | `none, jumi-fade-in` | `--page, --page` | `ScrollTimeline` ← `#pane` |

**The alignment question the brief asked is answered yes, by the platform itself.** Each entry of
`document.getAnimations()` carries its own `timeline` and `source`, so a position that is
scroll-driven is scroll-driven *for that animation name* — no inference from the list order is
needed. A second instrument agrees: the computed `animation-timeline` list and the computed
`animation-name` list have the same length and the same order, and `bMixed`'s `scroll(), auto` is
exactly the per-position picture.

## 4 · Capability matrix

| behaviour | status | measurement |
| --- | --- | --- |
| retarget one slot, leave the others | **works** | `bMixed` |
| retarget every slot at once | **works** | `bBoth` |
| two slots on two different timelines | **works** | `bSplit` |
| `scroll()` / `nearest` / `root` / `self` | **works** | `aScroll`, `aPaneScroll`, `aScrollRoot`, `aSelfScroll` |
| `view()` | **works** | `aView` |
| axes | **works, fails open** | `scroll(x)` yields no animation when the axis cannot scroll |
| arbitrary timeline value | **works** | `aArbFn`, `animation-timeline-[…]` |
| consume a *named* timeline | **works** | `bArbNamed` ← `--page` on `#pane` |
| declare a named timeline | **not expressible** | no real `scroll-timeline-*` / `view-timeline-*` in the emission |
| `animation-range` | **inert** | computed `animation-range: normal` with range candidates present |
| reduced motion | **author's, not the platform's** | see §7 |
| compositing | **not established** | instrument falsified, see §8 |

## 5 · Every existing control, classified

Measured with the control applied to a scroll-driven slot against the same control on the document
timeline (§4 of the report).

| control | classification | what happens |
| --- | --- | --- |
| `animation-duration` | **inert when `delay` is 0** | resolved duration is `100%` for `1s`, `600ms`, `2s` and `auto` alike |
| `animation-delay` | **meaningful, reinterpreted** | a share of the range *and* a compression: resolved duration `83.3333%` at `delay 200ms/1s`, `62.5%` at `600ms/1s` |
| `animation-timing-function` | meaningful | applies to the progress mapping |
| `animation-direction` | meaningful | `reverse` inverts the sweep exactly |
| `animation-iteration-count` | meaningful | `2` divides the range: resolved duration `50%`, progress `0 · 0.5 · 0 · 0.5 · 1` |
| `animation-fill-mode` | meaningful | unchanged from the document timeline |
| `animation-play-state` | meaningful | `paused` freezes progress regardless of scroll |
| `animation-composition` | meaningful | and **not** reset by the shorthand (§1) |
| `animate-stagger-*` | **dangerous** | `--jumi-stagger-animation-delay` becomes a per-child range offset, so each child's motion is compressed into the tail |
| `animation-timeline: none` | **dangerous** | silently kills the motion (§2) |

**The timing model, fitted to every arm:** 100% of the scroll corresponds to the animation's own
effect end (`delay + duration × iterations`), so a lone scroll-driven slot with default timing always
spans the whole range, two slots with different durations each span the whole range
(`bDurations`: `100%` and `100%`), and a delay trades motion length for a late start. This is the
behaviour a "driver swap" wants — the motion's shape is preserved and the controls redistribute it —
but it is worth stating plainly because it is not what "duration" looks like on the document
timeline, and because the stagger system is the one existing feature whose meaning changes.

## 6 · `animation-range`: written by Jumi, read by nobody

*(This section is the state before the implementation below — kept because it is the measurement the
change was justified by, not because it is still true.)*

Two independent instruments, because this is the finding with shipped-code consequences:

1. **The property never reaches the element.** `dRangeJumi` (`animation-range-start-timeline-entry`,
   `animation-range-end-timeline-cover`) and `dRangeJumiArb`
   (`animation-range-[entry_0%_cover_50%]`) both compute `animation-range: normal`, and both produce
   the *same* progress series as each other — i.e. as a bare `view()`.
2. **The emission contains no such declaration at all.** Across the whole frozen corpus
   (`scripts/css-snapshot/snapshot.css`), the only real `animation-*` longhands are
   `animation-composition` and `animation-timeline`; `animation-range`, `scroll-timeline*` and
   `view-timeline*` appear **zero** times as properties. The controls write `--jumi-animation-range*`
   custom properties that nothing consumes.

That the platform honours a range is measured on the plain arm (`plain-fade` + hand-written CSS):

| range | computed | progress over a 13-point sweep |
| --- | --- | --- |
| `25% 75%` | `25% 75%` | starts late (step 5), reaches 1 at step 6 |
| `entry` | `entry` | reaches 1 at step 4 |
| `entry 0% cover 50%` | `entry cover 50%` | ramps through steps 4–6 |
| `entry 25%` / `exit 75%` | `entry 25% exit 75%` | ramps through steps 5–7 |

and it needs no special handling: it is an ordinary longhand, per position, and Chromium normalizes
the redundant forms (`entry 0% cover 50%` → `entry cover 50%`) on its own.

## 7 · Named timelines

| arm | computed | timeline | source |
| --- | --- | --- | --- |
| `eNamed` | `--page` | `ScrollTimeline` | `#pane` |
| `bArbNamed` (through Jumi's arbitrary path) | `--page` | `ScrollTimeline` | `#pane` |
| `eNamedOutside` (outside the declaring subtree) | `--page` | *(none)* | — |
| `eNamedMissing` (a name nothing declares) | `--nope` | *(none)* | — |
| `eViewSelf` (subject consuming its own view timeline) | `--card` | `ViewTimeline` | root scrollport |
| `eViewNamed` (child consuming the parent's) | `--card` | `ViewTimeline` | root scrollport |
| `eDup` (two scrollers in scope declare `--dup`) | `--dup` | `ScrollTimeline` | `dupB` (the innermost) |

Consuming works, including through Jumi; **declaring does not exist in Jumi today**. A name that
resolves to nothing is silent (inactive, no animation) — the same fails-open shape as a bad axis.
A view timeline is usable by the declaring subject *and* its descendants, which matters for the
emission question below.

## 8 · Reduced motion

Measured in a context with `reducedMotion: 'reduce'`:

| arm | `reduce` | `no-preference` |
| --- | --- | --- |
| `fScroll` (`animate-fade-in animation-timeline-scroll`) | `ScrollTimeline`, still scrubbed | same |
| `fClamped` (`… motion-reduce:animation-timeline-none`) | `none` — motion dead | `ScrollTimeline` |
| `fMotionSafe` (`animate-fade-in motion-safe:animation-timeline-scroll`) | **`DocumentTimeline` — the motion runs on time** | `ScrollTimeline` |
| `aScroll` (a bare scroll-driven arm) | `ScrollTimeline`, still scrubbed | same |

- **The platform does nothing.** Scroll progress drives the animation under `reduce` exactly as
  without it; there is no clamp to inherit.
- **The clamp is the author's, and the obvious spelling is a trap.** `motion-reduce:…-none` works
  (it removes the motion), but wrapping the *timeline* in `motion-safe:` does not: under `reduce` the
  slot falls back to `animation-timeline: auto` and the entrance plays on the **document timeline**.
  The author asked for "no motion" and got a time-based animation instead — strictly worse for a
  scroll-driven entrance whose whole point was to be scrubbed, and it is the arm an author is most
  likely to write first.

## 9 · Cost

| measurement | value |
| --- | --- |
| composition with 2 slots | 526 bytes, `animation-timeline` 2 entries |
| composition with 31 slots | 6 453 bytes, `animation-timeline` **31 entries**, timeline list 2 200 bytes |
| `CSS.getMatchedStylesForNode` bytes, `aDtm` (no timeline) | 87 109 |
| … `aScroll` (one timeline control) | 88 366 |
| … `bMixed` / `bBoth` (two slots) | 94 860 / 94 805 |
| `RecalcStyleCount` over a 40-step scroll, timelines live | 41 (4–5 ms, 0 layouts) |
| … the same page with the timeline classes removed | 42 (3–4 ms, 1 layout) |

- **The timeline list is the one list that is not hoisted.** `animation-timeline` and
  `animation-composition` still live in the composition, so a page with N slots carries N entries per
  animating element, exactly the shape the hoist was introduced to remove for the shorthand's eight
  parts. At 31 slots the timeline list alone is 2.2 KB of a 6.4 KB composition. It costs ~1.3 KB of
  inspector payload per element for one timeline control, which is the same order as the other
  longhands — no new tooling problem, but the scaling is real and the fix is the one already applied
  once.
- **Scrolling costs the renderer nothing measurable.** No style recalculation beyond what the scroll
  itself needs, with the timeline arms live or removed.

**Not established — compositing.** The instrument was `Animation.animationUpdated`, on the theory
that an animation the compositor drives never reports progress to the main thread. It was given a
**control** (`gWidthTime`: the same non-compositable `width` animation on the document timeline) so
it could be falsified, and **the control reported nothing either** — so the zero measured the
protocol's silence, not the subject's threading. The Animation domain in 153.0.8010.12 carries
`cssId, currentTime, id, name, pausedState, playState, playbackRate, source, startTime, type` and no
thread field. No claim about the compositor is made here; the honest instrument is a compositor-side
wheel scroll with the main thread blocked, which this spike did not build.

## 10 · The separate track: scroll-*triggered* animations

Recorded, deliberately not folded in. `CSS.supports` in this build:
`timeline-trigger` **true**, `animation-trigger` **false**, `animation-timeline`/`view()`/
`animation-range`/`scroll-timeline-name` all true. Scroll-triggered animations are time-driven after
a scroll condition is crossed, so the control vocabulary is ordinary timing; the Jumi motion model
would be reused, not extended — but nothing about that is measured here.

## The smallest architectural change

**One part is missing, and it is `animation-range`.** Everything the retarget needs is already
expressible and already works; the range is the one control that exists, is documented, and cannot
reach the element. The change is additive and follows the shape the model already has:

1. **`animation-range` becomes a slot part.** It is an ordinary per-position list in CSS (a reset-only
   longhand, like `animation-timeline`), so the composition declares it in the same family: one entry
   per slot, declared after the shorthand, read through a `--jumi-<slot>-animation-range`-shaped
   fallback chain with the global `--jumi-animation-range` beneath it. `slotParts` gains one name;
   `AFTER_SHORTHAND` gains one; the eight existing `animation-range*` controls keep writing what they
   write but gain the `/<slot>` scope the timeline control already has, so a range can address one
   motion without touching its neighbours.
2. **Nothing else is required for the feature as measured.** No new animation family, no new class
   vocabulary, no change to the carrier, no variant, no `@supports` — with one caveat the spike did
   not have when it first said "free": see *The fallback is a decision* below.
3. **Named-timeline *declaration* stays unexposed.** Anonymous `scroll()`/`view()` cover the shipped
   use cases, consumption of a name already works through the arbitrary path, and a declaration
   control would be a new element-level list for a capability no measured arm needed.

---

# IMPLEMENTED — same day

Points 1 and 2 above are in the emission, with `pnpm scroll-driven:check` as gate stage 11 and twelve
assertions over a real browser. `animation-range` is now in `slotParts`; the composition declares it
after the shorthand; `animation-range-[…]/<slot>` addresses one position; and the whole existing
`animation-range*` vocabulary — `-start`, `-end`, `-start-timeline`, `-start-offset` and the rest —
composes for the first time instead of writing to nothing.

## What the implementation cost, and the one trap it had to avoid

The part itself was mechanical. The **value grammar** was not, and it is the reason this took a
measurement pass rather than an edit:

- **`normal 0% normal 100%` is not a legal `animation-range`.** It is what the existing variable
  composition produced (`<start-timeline> <start-offset> <end-timeline> <end-offset>` with both names
  defaulting to `normal`), and `CSS.supports('animation-range', …)` says **false** — where
  `normal 0%` alone says true, because `normal` is a whole value that swallows the next token as the
  *end*. Measured with a list that had one position set and one falling back: computed `normal`, i.e.
  **the position that had a real range lost it too**. That is the same failure mode the carriers'
  `FALLBACK` map was written for, one property over.
- **So the two timeline-name halves declare no default at all**, deliberately, and the composition
  supplies an empty `var()` fallback (`var(--jumi-animation-range-start-timeline, )`) — the only
  spelling of "this half contributes nothing". Nothing set resolves to **`0% 100%`**, which parses and
  measures *identically to `normal`* on both a scroll and a view timeline (progress series equal to
  the last digit, four spellings compared on one box). `src/helpers/css/index.ts`'s `css()` now treats
  an empty fallback as a value rather than an absence, which is what makes that expressible.
- **The shorthand resets `animation-range`.** Declared before the `animation` shorthand it computes
  back to `normal`, so the after-shorthand placement is load-bearing and not tidiness. The same probe
  re-confirms that `animation-composition` is **not** reset, which is what the stale comment in
  `src/helpers/carriers/index.ts` had wrong; both comments now carry the measurement.

## The fallback is a decision, and it is measured now

The spike said an unsupported browser degrades "for free". Mechanically true — an unrecognised
`animation-timeline` declaration is dropped and the rest of the rule stands — but that is a statement
about the cascade, not about the reader. `pnpm scroll-driven:check` now models the unsupported browser
by **removing the declaration the browser would drop** and leaves the page alone, scrolling nothing:

| stylesheet | arm | result |
| --- | --- | --- |
| as emitted | `animate-fade-in animation-timeline-view` | `ViewTimeline`, progress **0.51 held** for 700ms |
| minus `animation-timeline` | the same arm | `DocumentTimeline`, progress **0.03 → 0.77 in 700ms** |

So `animation-timeline-view` means "fade in as I enter" and falls back to "fade in, immediately, on
load". Both are animations; only one is the one the author asked for. **That is a product decision
Jumi has not made**, and this record deliberately does not make it:

- **Progressive (today).** The motion runs on document time where timelines are unsupported. Simple,
  nothing emitted, and the degradation is visible-but-wrong rather than absent.
- **Strict.** Emit the motion's `animation-timeline`-dependent half inside a capability query
  (`@supports (animation-timeline: scroll())`) so a browser without timelines runs **nothing** — the
  element keeps its base state. Strictly worse if the base state is invisible (an entrance that starts
  at `opacity: 0` would leave the element missing), so the two are not interchangeable and the choice
  belongs to whoever owns the promise, not to this pass.

What the gate does about it: the assertion names the current behaviour as **the accepted fallback**, so
changing it is a deliberate edit to a failing check rather than a silent drift.

## Coverage — `pnpm scroll-driven:check` (gate stage 11)

25 assertions, all against a real browser and the finalized emission, plus a 35-spelling sweep of the
control vocabulary compiled in one build. Three of them exist because the failure they catch is
silent, and each was **falsified before being trusted**:

- Reverting the composed default to `normal 0% normal 100%` failed the range arms at runtime — the
  live position resolved to `normal` and its progress became the scroll fraction. *7/10.*
- Declaring the after-shorthand parts **before** the shorthand failed thirteen assertions, every arm
  falling back to document time (`0.08 0.12 0.15` while scrolling) — the whole feature quietly
  becoming a time-based one. This is the falsification that shows the order matters.
- Dropping `scripts/lib/css.mjs`'s `PARTS`/`RESET_BY_SHORTHAND` update would have left the invariant
  `aggregateWrites === expectedDeclarations` measuring the old arithmetic.

The arms are: the range lands on the position that asked for it; it moves the motion; an un-ranged
slot still fills the whole range (the regression that matters to every existing page); mixed drivers
on one element; a delay as a share of the scroll; a delay and a range composing; `scroll(x)` with
nothing to scroll moving nothing; the platform not clamping under `reduce` while an author's clamp
does; the clamp saying nothing outside its query; the two fallback readings above; and the author's
strict path in both directions.

The summary line counts the checks that ran rather than a constant kept beside them, because that
constant had already drifted from the number of assertions in the file — the failure mode
`scripts/check.mjs` exists to prevent, reproduced inside a check.

# Public API review — the class names, against the semantics

The architecture closed, so the next question was whether the vocabulary still reads well now that
the meanings are measured. It found one defect, and one naming decision that needed a call: the
question below, applied to every scroll control, is the whole of the review.

> Does the class name describe what the author is trying to control, or how the CSS grammar happens
> to be written?

**Reads naturally — kept.** `animation-timeline-{auto|none|scroll|view}` is value-shaped and matches
the property's own grammar. `animation-timeline-axis-{block|inline|x|y}` and
`animation-timeline-scroller-{nearest|root|self}` use the spec's own argument names, and those two are
the author's concepts rather than the grammar's — which *scroller*, along which *axis*. The arbitrary
range forms — `animation-range-[entry_0%_cover_50%]`, `animation-range-start-[entry_25%]` — *are* the
CSS value, with nothing composed to get wrong. `/<slot>` reaches them all the same way it reaches the
timing controls.

**Renamed before 1.0, on the CTO's call.** `-timeline-` named a `<timeline-range-name>` — `entry`,
`cover`, `exit` — which is not a timeline, so `animation-range-start-timeline-entry` read as "set the
range start's timeline to entry". There is no compatibility burden yet, so it is not kept as legacy:
the two component controls are **gone**, not deprecated, and the range names are the values of the
halves they always belonged to:

```text
animation-range-entry  cover  contain  exit  entry-crossing  exit-crossing
animation-range-start-entry                 animation-range-end-exit
animation-range-start-offset-25             animation-range-end-offset-75
animation-range-[entry_0%_cover_50%]        animation-range-start-[entry_25%]
```

The rule the surface now follows, stated so the next control can be judged against it: **a simple
native concept gets a named utility; anything with grammar combined into it gets the arbitrary
form.** `animation-range-start-entry` is one concept; `entry 25%` is two, so it is
`animation-range-start-[entry_25%]` rather than another component vocabulary.

**The rename also removed a landmine.** The old component sets included `normal`, so
`animation-range-start-timeline-normal` wrote a *half* of `normal` — and measured,
`CSS.supports('animation-range', 'normal 0% 100%')` and `…('0% normal 100%')` are both **false**: the
declaration is dropped whole and the motion loses its range with no signal. `normal` is legal only as
a *whole* range, which is what the bare `animation-range` utility writes, so it stays in that set and
is absent from the halves — pinned by a unit test and by a gate arm that compiles
`animation-range-{start,end}-normal` and fails if either ever emits again (falsified by adding the
keyword back: 25/26).

**The halves got simpler as a consequence.** A half used to be a *composition* of a name and an
offset, and a composition is where an illegal joined value can hide. Each half is now one value fed
by its offset variable: the offset control writes the offset, a named half writes the half, the
arbitrary form writes the half with both in it, and nothing joins two pieces into one value. The
name-half variables are deleted rather than left behind, because a variable nothing writes is a name
the next reader has to disprove.

**A defect the review found and fixed.** `animation-timeline-inset-{start,end}` carried
`type: 'length'`, so `animation-timeline-inset-start-[10%]` emitted **nothing at all** while `[2rem]`
emitted — a silent refusal of the *common* case, since the inset is a `<length-percentage>` and a
percentage is how a view-timeline inset is normally written. Fixed to `['length', 'percentage']`, the
shape its sibling `animation-range-start-offset` already used. It is now covered by a vocabulary
sweep: one build, one candidate per value each scroll control declares, failing with the names of
whatever was refused (falsified by reverting the fix — 2 spellings refused, 23/25).

**Options not taken.** A demo page is the natural next artefact: the view transition work earned one,
it is a control surface over candidates the build already emitted, and it would show which arbitrary
values actually repeat — the evidence that should decide whether any of them earn a shorter spelling
later. The frozen public story is `animation-timeline-scroll` / `-view` / `-[--name]` for the driver,
the arbitrary range forms for anything compound, and named range utilities for the six range names.

**And one addition after the story was frozen: the same vocabulary as a prefix on one motion.** An
`animation-range-*` utility places the element's animations; `animation-range-entry:animate-fade-in`
places *one* of them and leaves its neighbours where they are:

```text
animation-range-entry:animate-fade-in          this animation uses the entry range
animation-range-[25%_75%]:animate-fade-in      this animation runs between 25% and 75%
animation-range-entry                          this element's animations do
```

The two compose through the slot chain rather than competing for one meaning, so no utility was
removed to make room. The full record — the shape, the five arms the spike measured, the traps, and
the two harness pitfalls the gate hit — is `engineering/research/scroll-variant.md`; the gate holds 13
assertions for it inside stage 11, including the CTO's stacking test. It sits **beside** the range
utilities by decision, not by omission.

## Three corrections that were not measurements

- `src/helpers/carriers/index.ts`'s `AFTER_SHORTHAND` comment said the shorthand resets
  `animation-composition`; measured, it does not (above), so both comments now carry the measurement.
- `docs/src/pages/docs/controls.md` claimed Jumi exposes `animation-range` controls while they wrote
  variables nothing read. The claim is true now, so the page keeps it — and gains the two things a
  reader needs from this measurement pass: that a scroll-driven motion falls back to *document time*
  where timelines are unsupported, and that the time controls are reinterpreted rather than ignored.
- `scripts/lib/css.mjs`'s `PARTS` and `RESET_BY_SHORTHAND` are the shared arithmetic the byte
  snapshot, the incremental harness, the Vite and PostCSS checks and the behaviour check all read; a
  new part that skipped them would have left four checks measuring a stylesheet that no longer exists.

## Two pieces of release hygiene found on the way

- **The lint stage could not pass, on the committed tree.** `scripts/check.mjs` hands ESLint `src
  scripts docs/src docs/astro.config.ts`, and `eslint.config.mts` ignored `**/scripts/**` — ESLint 9
  *errors* when a path it is given is entirely ignored, so `lint` failed before checking anything and
  the ten stages below it never ran (`pnpm check` reported 3/14). Verified pre-existing: a committed
  harness was already reported "File ignored". The ignore now names the generated output
  (`scripts/tmp-*`, `scripts/.*-*`, `scripts/vite-check`) and the harnesses under `scripts/` are
  linted again — 415 warnings, no errors, and the gate walks past lint for the first time in a while.
- **`structure.json` was a stale record.** Its `animations` and `slots` rows read `0` for both corpora
  while `compositionRules` reports `1` and `33` on the very CSS it was recorded beside: nothing
  asserts those fields (`previous` is only printed, never compared), so they had been frozen since
  before the composition detector was rewritten. Re-recorded. The counters a reader would trust are
  the ones no check reads, which is worth knowing about the file.

