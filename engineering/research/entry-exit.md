# Entry and exit — the browser's lifecycle model

Chromium 153.0.8010.12. `pnpm spike:entry-exit` (`scripts/spike-entry-exit.mjs`). No `src/` changes.

## Summary

**The platform already reduces this feature to ordinary transition properties.** An element can enter and
leave the render tree with a transition, and the whole mechanism is four things that already exist:

```text
transition-property   → what may transition
transition-duration / timing-function / delay → how it transitions
transition-behavior: allow-discrete → whether a discrete property may flip at all
@starting-style       → supplies the missing before-style for content that is becoming present
```

There is no fifth thing to invent, and nothing here is a Jumi concept — so the architectural answer to the
question this spike existed for is **no new abstraction**, and the work is a documentation story plus one
finding that makes it cheap on Jumi's side (§6).

## 1 · Entering and leaving, and where the flip lands

Same element, five samples from 0% to 100% of a 300ms transition. `display/opacity` plus whether the browser
considers it visible — `checkVisibility()` with the opacity and visibility checks on.

| case                                       | entering                                                                    | leaving                                                 |
| ------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| `display: none → block` + `allow-discrete` | `block/0.00 → block/0.41 → … → block/1.00` **visible from the first frame** | `block/1.00 → … → none/0.00` **visible until the last** |
| the same, `allow-discrete` as a longhand   | identical                                                                   | identical                                               |
| the same, **no** `allow-discrete`          | no transition at all                                                        | no transition at all                                    |
| `content-visibility: hidden → visible`     | same shape as `display`                                                     | same shape                                              |
| `visibility: hidden → visible`             | `visibility` interpolates, visible from ~25%                                | hides early on the way out                              |
| an ordinary `opacity` change               | baseline                                                                    | baseline                                                |

The asymmetry is the feature: **entry flips at the start and exit flips at the end**, so the element is
present for the whole of its entrance and for the whole of its exit. That is not a coincidence of these
values — it is what `display` and `content-visibility` are specified to do with `allow-discrete`, and it is
why "fade something in and out of existence" works with nothing but a transition.

## 2 · What `allow-discrete` actually changes

Not _whether_ a discrete property flips — **when**. Without it, `display` cannot change at all inside a
transition (row three: nothing runs, in either direction). With it, the flip is placed at the end of the
transition on the way out and at the start on the way in, which is exactly what keeps content on screen
while it animates.

The keyword in the shorthand (`transition: opacity 300ms, display 300ms allow-discrete`) and the longhand
(`transition-behavior: allow-discrete`) behave **identically** — measured as a pair. That matters to the
shorthand-versus-longhand question in §6.

## 3 · What `@starting-style` is for

The four ways an element becomes present, measured:

| how it becomes present                              | without `@starting-style`                                                                                | with it                                                                                             |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| newly inserted into the DOM                         | **no transition** (it just appears at its final style)                                                   | transitions from the starting style                                                                 |
| from `display: none` (a class toggle)               | nothing ran — the "before" state is not rendered, so there is nothing to travel from                     | transitions, and §1 shows the flip placement                                                        |
| entering the top layer (`showModal`, `showPopover`) | `opacity` still transitions, because the UA's own `display`/`overlay` change is what the transition sees | transitions from the starting style; `overlay: auto` is in the property list when its value changes |
| an ordinary style change, already present           | transitions                                                                                              | not needed — there is a before-style already                                                        |

So `@starting-style` is precisely "the before-style that a first render has no previous value to supply".
It is a **conditional at-rule**, which is the one structural fact that matters for Jumi (§6).

## 4 · Do `display` and `content-visibility` have special flip timing?

Yes, and §1 is the measurement. Both keep the content **present** for the whole transition — the entry flip
is not at the midpoint the way a generic discrete property's would be, and the exit flip is pushed to the
end. `visibility` is the contrast: it genuinely interpolates (it becomes visible early in the entry), which
is why it can be used for a fade without `allow-discrete` at all.

## 5 · Can anything other than document time drive one?

`transition-timeline` is **not a property** — refused. Transitions run on document time, so a scroll-driven
entry is not available the way a scroll-driven animation is; the two mechanisms stay distinct.

One question this spike did **not** answer: whether `@keyframes` can carry a discrete property change (the
keyframe analogue of `allow-discrete`). The probe's animation never materialised, so it measured nothing.
That question is now answered — §8 — and the reason it did not materialise is itself the answer.

## 8 · Discrete properties in keyframes — measured

`pnpm spike:discrete-keyframes` (`scripts/spike-discrete-keyframes.mjs`), same browser, every probe element
rendered from the start so that an `Animation` has a chance to exist at all.

| case                                                               | result                                                                                                      |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `display: block → none`, `fill: both`                              | the Animation exists; samples at 0 / 25 / 50 / 75% all read `block`, and only the final sample reads `none` |
| the same for `content-visibility` and `visibility`                 | identical shape                                                                                             |
| the same with **both** keyframes written, sampled at 40 / 50 / 60% | still `block` — so this is not a case of the `from` frame being implicit                                    |
| `fill: none`, read at the end and after it                         | `block` — the keyframe's value is reverted                                                                  |
| `iteration-count: 3`, six samples across the run                   | `block` throughout — no flip per iteration                                                                  |
| `animation-timeline: scroll()`                                     | the same end-only shape: `none` at 100%                                                                     |
| `overlay` in a keyframe, on a modal dialog in the top layer        | inert — the computed value stays `auto`                                                                     |
| `display: none → block` (inwards)                                  | **no Animation object at all**, and `display` stays `none`                                                  |

Two facts, and the second is the load-bearing one:

- **An element that is not rendered gets no animation.** In the entry direction there is nothing to
  animate, and `animation` does not even produce an `Animation` object. Entering cannot be an animation.
- **A discrete change is the animation's end value, not an interpolation.** The property holds its base
  value for the whole active interval and takes the keyframe's value only where a fill applies it; with
  `fill: none` it never changes. So there is no keyframe analogue of `allow-discrete`, no flip placement to
  reason about, and no midpoint rule to exploit — the discrete machinery lives on the _transition_ path,
  and the two mechanisms differ rather than overlap.

Read against the spec, `visibility`'s end flip is its own rule (it flips at 0% on the way to `visible` and
at 100% on the way to `hidden`); `display` and `content-visibility` are the ones a midpoint rule would
predict to flip early and measurably do not. The measurement is reported as the browser's behaviour rather
than as a spec reading, and it is Chromium 153 only.

The answer is therefore **no — and that is the useful answer.** Jumi needs no animation-side support for
discrete state, §6's division of labour stands unchanged, and §7's boundary is now backed by a platform
fact instead of an intuition: an entrance _effect_ is a motion; becoming present is a transition, because
for content that does not yet exist there is nothing else it _could_ be.

## 6 · Jumi, read rather than assumed

Jumi already ships a transition model: `transition-property/<motion>` declares the motion and the other
controls configure it, and the composition writes one `transition` shorthand whose entries are per-motion
variable chains.

The specific question was whether `transition-behavior` suffers the placement problem that
`animation-range` and `animation-timeline` did — the `animation` shorthand resets both, so they have to be
declared _after_ it. Measured on the emitted rule: `transition:` at offset 110, `transition-behavior` at
680 — **already after the shorthand**, and in the same rule. So the shorthand does not eat it, and a
transition-based entry/exit feature needs no placement fix.

The one structural fact that does constrain Jumi: `@starting-style` is a **conditional at-rule**, not a
property. An author writes it; a utility cannot express it any more than a utility can express `@media`. So
the honest division is:

```text
Jumi       → the transition controls that already exist, plus `allow-discrete` as a value
@starting-style → the author's, next to the markup it belongs to
```

## 7 · The boundary with entrance effects

`animate-fade-in` and `@starting-style` + a transition can look identical and are not the same thing:

```text
animate-fade-in            an animation that runs because the author asked for one
@starting-style + transition  the browser interpolating state because the element became present
```

One is explicit keyframe motion with a duration, a timeline, iteration and every control Jumi has; the
other is state interpolation that happens once, when presence changes, and cannot be replayed. Keeping them
conceptually distinct is the recommendation: an entrance _effect_ is a motion, and "appear on entry" is a
transition. They compose (both may run) but neither replaces the other.

## Instrument notes

Three fixture bugs in this spike's first run, each of which read exactly like a platform limitation:

- Comparing the shorthand against the longhand while giving only one of them a `@starting-style` — the
  comparison was confounded by the very thing §3 is about.
- An inserted element with no `transition` declared, so "no transition ran" was the fixture's own doing.
- A top-layer case that called `showModal()` without adding the class whose styles make `opacity` change.

Two more from earlier in this work, worth repeating because they cost the same kind of time: a **square box
cannot reveal `offset-rotate`**, and **`getComputedTiming().duration` is a number for time-driven animations
and a `CSSUnitValue` for progress-driven ones**.

And one that is not a fixture bug at all but a parse error: a browser fixture is a single template literal,
so a backtick _anywhere_ inside it — including in a comment, including around one word — ends the template
and the file does not load. The fix that stops it recurring is structural rather than attentive: prose with
code spans lives above the template, and the fixture carries only plain markers.
