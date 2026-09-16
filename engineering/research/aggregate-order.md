# Can the animation list be ordered whole-before-component?

_RESEARCH — measured, not shipped. Not a workstream, and not filed._

The ruling, after the census:

> Take the aggregate-ordering probe first. That is the cheapest question with the biggest architectural
> consequence. If Jumi can make `whole → earlier in animation list` / `component → later`
> deterministically, then the whole + constituent case stops being a compiler identity problem and
> becomes ordinary CSS precedence that Jumi can explain and guarantee.
>
> The acceptance question is simple: **can Jumi deterministically produce the same final animation list
> regardless of candidate compilation order, and does component-after-whole give the ownership semantics
> we want?**

Measured by `node scripts/spike-aggregate-order.mjs` in Chromium 153.0.8010.12 on 2026-09-16 — the first
half against the real build (Tailwind emitting, the shipping finalizer completing), the second in the
browser with the list forced each way. Nothing in `src/` was touched.

## The two answers

**No, not today.** Two motions that land in the same group of `computeSlots()` are ordered by `Map`
insertion order, which is Tailwind's compilation order. For the four pairs the ruling names this is
mostly invisible, because a whole-value motion and a part motion land in **different** groups — `values`
before `shared` — so they happen to come out whole-first. It is not a rule, and it breaks the moment two
motions land in the same group, where the observable precedence flips.

**Yes, component-after-whole gives the ownership semantics — under the pivot's representation and only
there.** Measured: whole-first reads the component's value for the component's slot while the whole keeps
the others; component-first lets the whole win everything. Today's representation cannot express
ownership at all.

## §1 The four pairs, and which of them have an order question

Spelled with arbitrary values: the first attempt used theme keys and three of the eight candidates
emitted nothing at all, which reads as "no animation" rather than "that utility does not exist".

| pair                                               | the composed list                              | entries | order       | stable? |
| -------------------------------------------------- | ---------------------------------------------- | ------- | ----------- | ------- |
| `animate-scale-[2]` + `animate-scale-x-[3]`        | `--jumi-slot-scale-O, --jumi-slot-scale`       | 2       | whole first | **yes** |
| `animate-rotate-[45deg]` + `animate-rotate-x-[30]` | `--jumi-slot-rotate-3zWYd, --jumi-slot-rotate` | 2       | whole first | **yes** |
| `animate-skew-[10deg]` + `animate-skew-x-[10deg]`  | `--jumi-slot-transform`                        | **1**   | —           | yes     |
| `animate-filter-drop-shadow-[…]` + `…-blur-[12px]` | `--jumi-slot-filter`                           | **1**   | —           | yes     |

**Two of the four pairs have no order question at all.** `animate-skew` and `animate-skew-x` are both
_parts of `transform`_, not an attribute and its part, so both resolve the one shared `jumi-transform`
slot and the list has one entry. The same is true of `filter-drop-shadow` and its blur, which are both
parts of `filter`. What decides those is not animation-list order — it is which utility rule writes
`--jumi-transform` last, an ordinary declaration cascade. The ruling's four pairs are therefore two
instances of one shape, not four.

The two that do have two entries are ordered whole-first because the whole-value form lands in `values`
and the part form in `shared`, and `computeSlots()` emits `values` first. **That is a grouping artefact,
not a key**, which is what §2 shows.

Two controls confirm the same thing from the other side: two components of one attribute
(`scale-x` + `scale-y`) and two phrases with identical frames each collapse to **one** entry, so neither
raises an order question either.

## §2 The case the grouping does not order: two phrases

Two phrases of one attribute with **different** frames are both in the `phrases` group, so their order is
insertion order — the order Tailwind compiled them in.

```
animate-scale-[0:1|100:2]  animate-scale-x-[0:1|100:5]
  as given    var(--jumi-slot-scale-1vrwYB, none), var(--jumi-slot-scale-1vrwYE, none)
  reversed    var(--jumi-slot-scale-1vrwYE, none), var(--jumi-slot-scale-1vrwYB, none)
```

**The list reverses.** And it is not a cosmetic difference, because the same two classes on the same
element then compute different values:

| which candidate Tailwind compiled first | `scale` at 100%                     |
| --------------------------------------- | ----------------------------------- |
| the whole                               | **`5 1`** — the component owns x    |
| the component                           | **`2`** — the whole owns everything |

Identical markup, identical classes, one element. The only input that changed is an order nobody wrote
and nothing can see. That is the same class of defect as the shared-keyframe body: **compiler order
reaching the browser through a semantically significant list.**

## §3 The semantics, with the list forced each way

The whole motion is `scale: 1 1 1 → 2 2 1` (it owns x, y and z); the component is `scale-x: 1 → 3` (it
owns x alone). So the component owning x while the whole keeps y is `3 2 1` at 100%.

| representation                                                    | order             | 50%     | 100%      |
| ----------------------------------------------------------------- | ----------------- | ------- | --------- |
| **today** — keyframes write the composed property                 | whole → component | `2 1`   | `3 1`     |
|                                                                   | component → whole | `1.5`   | `2`       |
| **pivot** — keyframes write typed slots, whole writes all of them | whole → component | `2 1.5` | **`3 2`** |
|                                                                   | component → whole | `1.5`   | `2`       |
| **pivot**, two components of different slots                      | either            | `2 2.5` | `3 4`     |

(`3 2` is `3 2 1` with the trailing identity elided by `getComputedStyle`.)

Three things fall out:

1. **Today cannot express ownership at all.** Both orders are all-or-nothing: the later animation
   replaces the composed property wholesale, so the earlier one survives in nothing. The choice is which
   motion wins, never which _component_ of which motion wins.
2. **The pivot's whole-first gives exactly the ownership rule.** `3 2` — the component owns x, the whole
   keeps y and z.
3. **Components of different slots never meet**, in either order. That is the property the architecture
   spike already measured for sibling timing, and it holds here too: two component motions give `3 4`
   with no interference.

## §4 Where the rule stops

The rule is not "order the list". It is "**order the list, and have the whole write the slots**". The
same pair with the whole writing a _composed value_ instead:

| the whole writes                               | order             | `filter` at 100%          |
| ---------------------------------------------- | ----------------- | ------------------------- |
| the **function** — `drop-shadow(0 0 20px red)` | whole → component | `drop-shadow(… 20px)`     |
|                                                | component → whole | `drop-shadow(… 20px)`     |
| the **slot** — `--n-amount: 20px`              | whole → component | `drop-shadow(… **40px**)` |
|                                                | component → whole | `drop-shadow(… 20px)`     |

When the whole animates the composed `filter`, nothing reads the component's argument slot at all, and
**no ordering recovers it** — both orders read the whole's value. When the whole writes the slot, the
order decides and whole-first hands the component its own.

So the ordering rule is necessary and **not sufficient**. It needs a companion requirement: a whole
motion whose property has constituents must be emitted as writes to those constituents' slots. That is
the same boundary the census drew from the other side — 106 leaves are written as a part and 185 as the
property itself — and it says the boundary is not a matter of taste: it is the difference between a
component being reachable and being dead.

## §5 What adopting the rule would require

1. **A deterministic order key in `computeSlots()`.** Today two of its four groups iterate a `Map` in
   insertion order. The natural key is whole-before-component, with a stable tiebreak under it
   (the resolved slot name is already there and is unique per instance). This is a small change in one
   function and it is testable by compiling the same candidates in both orders and diffing the list —
   which is what §1 and §2 do.
2. **Whole motions write slots** for properties that have constituents, so the rule has something to
   order. Where a whole motion has no slot decomposition — effects, keyword-valued properties, the 96
   census leaves that are keyword-valued — the property-level keyframe stays and the rule does not
   apply, because there is no component to override it.
3. **The 23 constituents the census cannot type** stay property-level too, for the same reason, and are
   covered by the same "no decomposition, no rule" case.

That is a rule Jumi can state in one line and a test can hold: _a whole motion establishes the base
animated value; a component motion overrides only the component it owns._ It is much easier to explain
than a canonical shared body, and unlike a canonical shared body it is a property of the list, which is
data the finalizer already owns.

## What this does not measure

- **Whether Tailwind's compilation order is itself stable for a given source tree.** Every measurement
  here contrasts _two_ orders deliberately; whether a real build always produces the same one is a
  separate question, and it does not matter, because the acceptance test is that the output must not
  depend on it.
- **The `interpolate-size` and view-transition families**, which have no constituents and so no
  ordering question.
- **Whether reordering changes anything else.** The list order feeds `animation-name`, `-duration`,
  `-delay` and the rest as parallel lists, so an order key changes all of them together; that is what
  the existing list assertions are for, and none was run here.
- **Cost.** Ordering is free; requiring whole motions to write slots is not, and the census's byte figure
  (10,820 → 1,441 for the corpus) already assumes the decomposed form.

## Reproducing

```bash
pnpm bundle && node scripts/spike-aggregate-order.mjs
```
