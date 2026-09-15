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
  --jumi-scale-d38-animation-name: jumi-scale-d38;   /* the definition */
  --jumi-scale-d38-4RGfw-label: loop;                /* the instance */
}
```

The activation variable names a **definition** (identity is the value's text: one keyframe, one variable).
Two definitions under two names share it, which is the whole point of motion-instance identity — so the
declaration cannot tell a reader which motion a rule means. The label declaration can, and it is the only
thing that can.

Two passes read the stylesheet and need that answer:

| pass | what it publishes onto the activating rule |
| --- | --- |
| the finalizer's hoist (`index.ts`) | the slot's shallow value, `--jumi-slot-<instance>` |
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
have a bug in its own logic, it had a *second* spelling of a fact another module already owned. The
repository's standing warning — no second list can stay in step — applies to a derivation exactly as it
applies to a list.

## What the derivation returns

`instanceKeys(rule, base)` — the instances a rule means, in the order the rule stated them.

| the rule declares | returns | why |
| --- | --- | --- |
| only the activation | `[base]` | nothing named it: the element means the definition's own instance |
| activation + one label under that base | `[named]` | the unnamed instance belongs to a *different* candidate, which this element did not write |
| activation + two labels under that base | both | `@apply` of two named candidates is one rule and two motions |
| activation + a label belonging to another definition | `[base]` | a name is scoped to the definition it was declared on |
| a composed tween's label (`--jumi-filter-label`) | `[base]` | the two coincide here: the label is keyed by the slot, so the base key *is* the named instance |

## What is not a violation

- **The model.** `src/core` *declares* both facts — it formats the activation variable and the label
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
