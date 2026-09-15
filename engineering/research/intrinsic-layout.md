# Intrinsic and layout interpolation — the browser's model, and where Jumi already stands

Chromium 153.0.8010.12. `pnpm spike:intrinsic-layout` (`scripts/spike-intrinsic-layout.mjs`). No `src/`
changes. Follows the entry/exit spike's discipline: measure the platform first, read Jumi's own output
second, invent nothing.

## Summary

**The platform can interpolate between a keyword size and a definite one, behind exactly one declaration —
and Jumi deliberately does not turn it on for you.** There is no new subsystem to design:

```text
interpolate-size-allow-keywords   → an ordinary utility, because the declaration is inherited and reaches a
                                    whole subtree: the author opts in, and knows what they are opting in to
calc-size(auto, size + 1rem)      → a per-declaration escape hatch needing no opt-in at all, no Jumi concept
```

The first version of this record claimed the opt-in was already handled — "any element that animates anything
is already opted in, and nothing outside a carrier is". **That claim was wrong, and the way it was wrong is
the most useful thing in this document**: it tested a carrier and a sibling, and never a descendant. A
carrier's whole subtree was being opted in by an unrelated animation (§4). The opt-in now belongs to the
author, and the consequence is visible in the markup rather than hidden in a substrate:

```html
<div class="interpolate-size-allow-keywords animate-width-auto w-[200px]">
  …
</div>
```

What is left is coverage, not architecture, and the size family is now consistent about `auto` (§5).

## 1 · What turns it on

Each row is a real `@keyframes` writing the property from one endpoint to the other, sampled by seeking the
paused animation to 0 / 25 / 50 / 75 / 100% of its interval.

| motion                                          | sampled values                              | reading                                                                    |
| ----------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| `width: auto → 200px`, nothing opted in         | `400px 400px 200px 200px 200px`             | **no interpolation** — the change lands at the midpoint as a discrete flip |
| the same, `interpolate-size` on the element     | `400px 350px 300px 250px 200px`             | interpolates                                                               |
| the same, `interpolate-size` on `:root` instead | `400px 350px 300px 250px 200px`             | **it is inherited** — the root is enough                                   |
| `height: 0 → auto`                              | `0px 4.19px 8.39px 12.59px 16.80px`         | interpolates, and `auto` resolves to the content's own height              |
| `block-size: auto → 120px`                      | `16.80px 42.59px 68.39px 94.19px 120px`     | interpolates — the logical properties are not special                      |
| `inline-size: auto → 90px`                      | `400px 322.5px 245px 167.5px 90px`          | interpolates — including _from_ `auto`, not only _to_ it                   |
| `fit-content → 240px`                           | `209.19px 216.89px 224.59px 232.30px 240px` | interpolates                                                               |

A transition behaves identically: `height: 0 → auto` with `allow-keywords` produced
`0.13:2.23px … 0.53:8.95px … 0.98:16.52px` — the same curve as the keyframe above. **So the mechanism sits
in the interpolation of a size, not in either of the two ways a size can change.** That is the opposite of
what the entry/exit spike found for `display`, where the mechanism sits in the _transition_ path only.

## 2 · What is not interpolable, which is worth documenting

| pair                        | with `allow-keywords`                                             |
| --------------------------- | ----------------------------------------------------------------- |
| `200px ↔ auto`              | smooth                                                            |
| `200px ↔ min-content`       | smooth — the keyword pairs with a _length_                        |
| `min-content ↔ max-content` | **still discrete** — `43.30px 43.30px 293.67px 293.67px 293.67px` |

The opt-in does not make every intrinsic value pair numerically interpolable. `min-content → max-content`
sampled a discrete flip at the midpoint _with the opt-in on_: two content-derived sizes have no number to
travel through. An author cannot smoothly resize between two content-derived sizes with this mechanism, and
Jumi does not need to invent one.

## 3 · `calc-size()` is a second, independent mechanism

| motion                                 | nothing opted in                | reading                                        |
| -------------------------------------- | ------------------------------- | ---------------------------------------------- |
| `calc-size(auto, size + 40px) → 200px` | `440px 380px 320px 260px 200px` | interpolates **with no opt-in anywhere**       |
| `calc-size(any, 50% - 20px) → 200px`   | `180px 185px 190px 195px 200px` | interpolates, and `any` accepts the percentage |

So the escape hatch is per-declaration and inherits nothing: it works in a keyframe, on an element whose
document never mentions `interpolate-size`. Nothing in Jumi emits `calc-size(` today (§5).

## 4 · Jumi, read rather than assumed — and the leak that reading missed

Measured by compiling Jumi's own plugin and loading the finished stylesheet in the browser.

### What was wrong

`interpolate-size` was written on every carrier by the composition payload, and the platform made it
**inherited**. The right differential is not a carrier against a sibling — it is a carrier's **descendant**
against a control outside the subtree:

```html
<div
  id="parent"
  class="animate-opacity-50"
>
  <div
    id="child"
    class="width-transition"
  >
    …
  </div>
</div>
<div id="control">
  <div
    id="control-child"
    class="width-transition"
  >
    …
  </div>
</div>
```

Same child CSS on both sides, `width: 200px` with `transition: width 600ms linear`, both toggled to
`width: auto`, the child's only ancestor motion being `animate-opacity-50` — an animation with no relationship
to size at all:

| element                                | `interpolate-size`   | its own `200px → auto`                                          |
| -------------------------------------- | -------------------- | --------------------------------------------------------------- |
| `#parent` — the carrier                | `allow-keywords`     | —                                                               |
| `#child` — **no motion of its own**    | **`allow-keywords`** | **1 transition started**, interpolating `211px → 300px → 394px` |
| `#control-child` — no carrier above it | `numeric-only`       | **0 transitions started**, jumps to `400px`                     |

So an unrelated ancestor animation changed how a child's own ordinary CSS transition behaved. That is not a
configuration default; it is Jumi editing the semantics of CSS it does not own, in a subtree, silently. The
contract it created was:

```text
Jumi motion element → opt its entire descendant subtree into intrinsic-size interpolation
```

### The fix, and its verification

The declaration left the generic composition payload and the defaults rule, and became an explicit utility —
written as the **real property** rather than a `--jumi-*` variable, because a control configures a motion Jumi
is running while this changes how the browser treats the author's own CSS. Same fixture, after the change:

| reading                                            | before                      | after                                                       |
| -------------------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| an element with a motion                           | `allow-keywords`            | **`numeric-only`**                                          |
| the same plus `interpolate-size-allow-keywords`    | —                           | `allow-keywords`                                            |
| an element with no motion                          | `numeric-only`              | `numeric-only`                                              |
| `animate-width-auto` alone, `200px → auto`         | interpolated                | **snaps at the midpoint** (`200px 200px 400px 400px 400px`) |
| the same with the utility                          | —                           | interpolates (`200px 281.7px 360.5px 392.1px 400px`)        |
| `#child` under an unrelated carrier                | 1 transition, interpolating | **0 transitions** — identical to the control                |
| `#opted-child` under an explicitly opted-in parent | —                           | 1 transition, interpolating                                 |

The last row is the point of the design rather than a return of the bug: the opt-in is inherited because
that is what CSS says, and it is now an informed choice written in the markup instead of a side effect of
declaring an animation. `interpolate-size-numeric-only` is offered for the same reason — it is how a subtree
stops inheriting one.

The unit test that asserted `interpolate-size` rode the payload was turned into the opposite assertion, so
reintroducing it fails loudly rather than quietly.

## 5 · The size family, swept

Build-differential readings — a candidate whose stylesheet is byte-identical to a build without it emitted
nothing, which is a refusal, and is a different fact from a rule that happens not to write a size. The
browser's own grammar is the authority on whether the keyword is legal for the property.

| property                                                       | CSS accepts `auto`            | before                                                        | after                             |
| -------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------- | --------------------------------- |
| `width`, `height`                                              | yes                           | `animate-X-auto` emitted                                      | unchanged                         |
| `inline-size`                                                  | yes                           | `animate-X-auto` emitted                                      | unchanged                         |
| `block-size`                                                   | yes                           | refused as `-auto`; answered to **bare** `animate-block-size` | `animate-block-size-auto` emitted |
| `min-width`, `min-height`, `min-inline-size`, `min-block-size` | yes                           | **all refused**                                               | all emit `animate-X-auto`         |
| `max-width`, `max-height`, `max-inline-size`, `max-block-size` | **no** — CSS spells it `none` | refused                                                       | unchanged, correctly              |
| `size`                                                         | n/a (an at-rule descriptor)   | refused                                                       | unchanged                         |

Two causes, both in `values:` rather than in the browser or Tailwind:

- **A `DEFAULT` key answers to the bare spelling.** `values: empty.auto` is `{ DEFAULT: 'auto' }`, which is
  Tailwind's bare-utility convention, so `block-size` answered to `animate-block-size` while its logical twin
  `inline-size` answered to `animate-inline-size-auto` — two properties with identical grammars differing in
  _spelling_. `block-size` now takes the same vocabulary as `inline-size`.
- **`auto` is not a theme token.** Tailwind spells `min-w-auto` as a utility rather than a theme value, so
  `theme('minWidth')` has no key for it and the `min-*` family could not name the keyword at all. They now
  spread the theme and add `auto` last, deliberately: it is CSS grammar, and it wins if the theme ever grows
  a key for it.

The `max-*` family staying closed is not an oversight: `CSS.supports('max-width', 'auto')` is false, and the
property's keyword is `none` — which `empty.none` already provides.

No new intrinsic-size abstraction was added, and no `calc-size()` syntax: arbitrary values already carry the
native grammar, and `calc-size()` is measured working in §3 without any opt-in.

## Instrument notes

Five fixture bugs, every one of which reads exactly like a platform limitation:

- **A watched property that is not a CSS property name.** `watch: 'blockSize'` put `blockSize:` inside a
  `@keyframes` block, where it is an unknown declaration, so the case measured nothing and reported a snap.
  The measurement table needs the dashed spelling _and_ a reader that uses it — both.
- **An empty div makes `auto` resolve to zero.** `height: 0 → auto` on an empty element read `0px` at every
  sample, because `auto` was 0. Every probe element now carries content.
- **`min-height` on a shared selector masks every height case.** The board's own rule quietly supplied the
  value each case appeared to be measuring.
- **A seeked transition lags the seek.** Sampling a `CSSTransition` after `currentTime = …` reported the
  _previous_ sample's value; keyframes do not show this, so a discrete measurement would never have revealed
  it. Transitions are now sampled the other way round — let them run, and pair the value with the progress
  the platform reports at that instant.
- **A false positive of my own making.** A grep for `interpolate-size` in the output returned `yes`, and the
  obvious reading is "Jumi already opts in" — but the match was the _variable registration_, not the
  declaration. Matching the value (`interpolate-size:\s*allow-keywords`) is what made the claim true, and
  then finding _which_ rule carried it is what made it useful.
- **The instrument that could not have caught the leak, by construction.** The carrier-versus-sibling
  fixture was the wrong shape for an _inherited_ property, and it passed. "Integration story: none" was a
  conclusion drawn from a measurement that could not have contradicted it — the cheapest fix is not a better
  assertion but a different _pair_ of elements, which is why the descendant and an outside control now sit in
  the same fixture.
- **A harness count that was a text search.** Removing one declaration from the payload made the Vite stage
  report "6 declarations for 2 + 1 compositions, expected 7" — and the transition composition plainly declared
  `transition:`, present in the text, surviving the prelude strip, visible in its own parsed nodes. The
  file-wide `LONGHAND` regex had always been one short somewhere and the old totals had absorbed it. The count
  now comes from the rules `compositionRules`/`transitionRules` find structurally, with the old file-wide
  reading kept as a reported `unaccounted` value — the same lesson this file already learned about detecting
  compositions, applied to counting them.
