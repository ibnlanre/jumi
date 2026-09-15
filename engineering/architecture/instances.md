# Motion instances: one derivation

**Status:** settled — the rule below is enforced by `src/helpers/carriers/instance.test.ts`, which
scans the carrier for a second copy of the derivation. Recorded with its measurements in
`../research/addressing-instances.md` and `../research/addressing.md`; approved in `../decisions/CTO.md`
(2026-09-15).

## The rule

> **No pass may independently reconstruct a motion instance from activation/label state. All instance
> derivation goes through `instanceKeys` in `src/helpers/carriers/instance.ts`.**

## Why it has to be a rule

A rule states two facts, and only one of them is where the instance lives:

```css
.animate-scale-110\/loop {
  --jumi-scale-d38-animation-name: jumi-scale-d38; /* the definition */
  --jumi-scale-d38-4RGfw-label: loop; /* the instance */
}
```

The activation variable names a **definition** (identity is the value's text: one keyframe, one variable).
Two definitions under two names share it, which is the whole point of motion-instance identity — so the
declaration cannot tell a reader which motion a rule means. The label declaration can, and it is the only
thing that can.

Two passes read the stylesheet and need that answer:

| pass                                  | what it publishes onto the activating rule                           |
| ------------------------------------- | -------------------------------------------------------------------- |
| the finalizer's hoist (`index.ts`)    | the slot's shallow value, `--jumi-slot-<instance>`                   |
| the range pass (`animation-range.ts`) | the range the variant qualified, `--jumi-<instance>-animation-range` |

Each derived it itself, and they drifted the way independent derivations do. Both failures are measured,
and neither was visible in the emitted text:

- **The hoist published every instance a rule could carry**, base included, so an element that named its
  motion also ran the unnamed instance of the same keyframe — `jumi-scale-d38, jumi-scale-d38` at `0.9s`
  and `1s` — and which one the browser kept depended on the aggregate's position order. The same page
  read `0.9s, 1s` in one candidate order and `1s, 0.9s` in the other.
- **The range pass assumed the definition**, so `animation-range-entry:animate-opacity-[0:0|100:1]/reveal`
  published its range under `--jumi-opacity-sluPU-animation-range` while the named instance's chain read
  its own key. It appeared to work only because of the first bug: the duplicate base instance was the one
  carrying the range.

One fix each, and the second is the argument for the rule rather than for the fix: the range pass did not
have a bug in its own logic, it had a _second_ spelling of a fact another module already owned. The
repository's standing warning — no second list can stay in step — applies to a derivation exactly as it
applies to a list.

## What the derivation returns

`instanceKeys(rule, base)` — the instances a rule means, in the order the rule stated them.

| the rule declares                                    | returns   | why                                                                                            |
| ---------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| only the activation                                  | `[base]`  | nothing named it: the element means the definition's own instance                              |
| activation + one label under that base               | `[named]` | the unnamed instance belongs to a _different_ candidate, which this element did not write      |
| activation + two labels under that base              | both      | `@apply` of two named candidates is one rule and two motions                                   |
| activation + a label belonging to another definition | `[base]`  | a name is scoped to the definition it was declared on                                          |
| a composed tween's label (`--jumi-filter-label`)     | `[base]`  | the two coincide here: the label is keyed by the slot, so the base key _is_ the named instance |

## What is not a violation

- **The model.** `src/core` _declares_ both facts — it formats the activation variable and the label
  declaration, so it cannot reconstruct them from themselves. It does read a name format in one place,
  `registerName`, to register `--jumi-slot-<slot>` non-inheriting in step with the finalizer's
  publication. That is a name-format dependency between two writers, not an instance read off a rule, and
  the invariant does not apply to it.
- **Tests.** A test may restate a pattern to assert against it, and two do. The scan covers non-test
  sources only, which is the set that ships.
- **The transition namespace.** Transitions key a motion by the property it transitions
  (`--jumi-rotate-transition-duration`), so the definition and the instance are the same word there and
  there is nothing to tell apart.

## How it is held

`src/helpers/carriers/instance.test.ts`, two ways:

1. **Behaviourally** — the five cases above, as a table a reader can extend.
2. **Structurally** — a scan of the carrier's non-test sources for either pattern, which fails and names
   the file. Falsified rather than assumed: adding a copy to a scratch file failed the test and named it.

The scan is not defensive plumbing. There is no type that can express "this module and no other may know
this", the failure mode is silent in the output, and the cost of the copy is two lines — which is exactly
the shape of a rule that has to be enforced by something other than memory.

## The slot key spells the name, and states how much of it there is

A named instance's key is `<units>-<name>-<id>-<attribute>`, and an unnamed one keeps `<attribute>-<id>`:

```text
--jumi-slot-5-flick-Z2excak-rotate
--jumi-slot-24-flick-animation-duration-Z2excak-rotate
```

The name is a word in the emitted stylesheet, which is what a person reads while debugging, and the prefix is
what makes it *exact*: the reader takes the name by the count it is given, so the parse boundary is a fact
about the shape rather than about the contents. One format, stated once, in `instanceKey` in
`src/helpers/carriers/instance.ts` — imported by the writer in `src/core` and by the readers, rather than
spelled three times.

**Why not just a readable order.** Every shape that joined the three pieces with hyphens alone lost to the
same defect, one version of it per ordering, and each looked fine until it was measured:

```text
--jumi-slot-flick-rotate-Z2excak        color + accent-color absorb; the attribute is between two
                                        unbounded hyphenated segments
--jumi-slot-flick-Z2excak-rotate        a name whose tail is another instance's id absorbs its key
--jumi-slot-5-flick-Z2excak-rotate      the count is the boundary, and no name can move it
```

The first is 50 collisions over the vocabulary (`scripts/spike-slot-key.mjs`, `pnpm spike:slot-key`, both
halves of each one real attributes); the second was found by the permanent assertion below, with ids that are
hyphen-free but not fixed-length (`shorthash2('50')` is `rI`); the third cannot be reached, because the
reader is a left inverse of the writer. `scripts/spike-slot-boundary.mjs` (`pnpm spike:slot-boundary`) is the
probe: 366,360 of 366,360 triples round-trip for the prefixed shape, against 17,040 failures for a prefix in
raw-name characters (at the names CSS escapes) and 4,260 for a double delimiter (at the name holding `--`).

**The count is of the emitted name, in UTF-16 code units.** Both details are load-bearing. The name a reader
has is the escaped one — `/foo.bar` occupies eight characters as `foo\.bar` — and code units are what
`.length` and `.slice` measure, so a reader slicing by the count cannot disagree with the writer that produced
it. The repo keeps both honest: the probe checks the model's escaping against a real compile, and
`behaviour-check.mjs` arm `o` runs a motion named `/[foo.bar]` in a browser in both candidate orders.

**Both gates keep it.** `src/core/slot-key.test.ts` holds the round trip over the whole vocabulary with
adversarial names, Unicode and characters CSS escapes, and `behaviour-check.mjs` holds two arms for the shapes
the format makes possible: a name that *reads* like a part of the shorthand (`/flick-animation-duration`, where
a pass that guessed the part read `flick`, published the hoist under a key nothing fills, and the motion
silently never ran), and a name the stylesheet escapes. Both arms found real defects before they shipped — the
second exposed a reader whose attribute scan was greedy enough to swallow a chain's fallback, and two label
lookups that escaped an already-emitted key, which no text-level check had noticed.

**Measured on the frozen corpus.** The rename moved bytes and nothing else: `bytes 81836 → 81892` (+56 over
the corpus, the prefix at each of the 24 occurrences), `aggregateBytes 9208 → 9224`, `rawBytes 632453 →
632881` — and `properties` (registrations), `slots`, `publishEvents` (links) and `keyframes` all unchanged at
94 / 33 / 36 / 33. Diffed line by line, the snapshot is 22 lines out and 22 in, identical once the keyed
variables (`--jumi-slot-…`, `--jumi-…-label`, `--jumi-…-animation-…`) are normalized.

## The link layer: measured, and not load-bearing

A named instance currently reaches its controls through an extra hop:

```css
.animate-fade-in\/reveal {
  --jumi-fade-in-label: reveal;
  --jumi-slot-fade-in: … var(--jumi-slot-fade-in-animation-duration, …) …;
  --jumi-slot-fade-in-animation-duration: var(--jumi-label-reveal-animation-duration);   ×10 fills
}
```

The fills are the only place the author's word is bound to a part. The slot key names the definition
(`--jumi-slot-fade-in`), or, for a property utility, the definition _with the author's name spelled into it_
(`--jumi-slot-loop-sluPU-opacity`) — so identity is in the slot, and the labels are where the controls
write. That makes the fills look like plumbing: the hoist could read `var(--jumi-label-reveal-animation-duration, …)`
itself. Once the word is in the emitted name, one element's hoist can name its own instance, and no shared
position has to carry one word for the whole stylesheet.

The ten fills split along the shorthand. Seven parts (`animation-duration` through `animation-play-state`)
are sections of the `animation` value the hoist publishes, so they are written where that value is written.
Three — `animation-composition`, `animation-range`, `animation-timeline` — have no shorthand section at all,
so they are declared on their own beside it, and they are read at those declarations instead of through the
hoist: a different site, with a different emission shape behind it.

**Measured, then implemented — for the seven the shorthand carries.** `scripts/spike-label-link.mjs`
(`pnpm spike:label-link`) deletes the layer from the **compiled** stylesheet with PostCSS and measures both
models in Chromium: the six naming arms from `behaviour:check`, each in both candidate orders, comparing live
animations **in position order** (a sorted bag would miss the historical failure above, which kept the same
set and swapped the order). No arm changes, in either order. On that fixture the layer is 50 declarations and
40 registrations — 8,760 bytes of 34,417.

The generator now writes the name into the hoist's **value** for the seven parts the shorthand carries: the
hoist is published on the rule that named the motion, so it is element-local, and a control's variable
(`--jumi-label-<name>-<part>`) is the value's first link. The chain behind it is untouched, so an unset label
still falls through to the definition and then to the shared default.

**The three the shorthand cannot carry keep their link layer, and that is deliberate.**
`animation-composition`, `animation-range` and `animation-timeline` have no shorthand section, so the
composition declares them — and the composition's aggregate is **selector-grouped rather than rule-local**,
which includes candidates that named nothing. A name in that block would be a name every element matching it
answers to, which is the failure measured above. So those three are reached through a slot-keyed variable the
naming rule fills, and the hop carries a real locality boundary rather than redundant indirection.

Removing the rest of the layer is therefore **not the same cleanup**: it would mean emitting those longhands
rule-locally, which changes the emission topology — and the view-transition emission reads the same aggregate,
so it moves with it. Deferred as its own research track, if CSS-size pressure ever makes it worth the blast
radius: _can `separateParts` be emitted rule-locally without duplicating excessive CSS, breaking VT replay,
changing selector grouping, or reintroducing element-crossing name leakage?_ That needs a probe, not a
continuation of this refactor.

| corpus                                                           | before    | after     |
| ---------------------------------------------------------------- | --------- | --------- |
| canonical (`scripts/css-snapshot/snapshot.css`, 2 named motions) | 85,083 B  | 81,850 B  |
| its slot registrations / fills                                   | 55 / 20   | 41 / 6    |
| probe fixture (6 arms, 4 named motions)                          | 34,417 B  | 27,760 B  |
| carrier corpus (`examples/`, names nothing)                      | 140,006 B | 140,006 B |

The demo corpus is unchanged because it names no motion at all: the layer only exists for a named instance,
so a corpus without names is not merely unaffected, it never had the cost.

Held by: `index.test.ts` (the hoist names its instance; only the three are assigned; an unnamed motion is
untouched), `create.test.ts` (only those three are registered as slot-keyed variables, and the aggregate
still carries no name), and `behaviour:check`'s naming section, which now also asserts the three properties
**resolve** on a named instance. That last one is falsified rather than assumed: with the assignment removed
it reads `{"composition":"replace","duration":"1s","range":"0%","timeline":"auto"}` — all three controls
gone while the motion still runs, which is exactly why text-level checks could not catch it. The arm is worth
more than the bytes: those three can vanish silently, because the animation itself keeps running.
