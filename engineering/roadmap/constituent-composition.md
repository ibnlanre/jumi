# Constituent composition: writers with no route

Status: **active roadmap.** Opened 2026-09-16, by the restoration of the per-frame component lookup.

## The class

A constituent phrase writes a frame value — `--jumi-<component>-<id>-<offset>` — and no keyframe reads
it. The sheet is well formed, every name is spelled correctly, the motion computes, and it never moves.

Measured across the whole registration table (`node scripts/constituent-check.mjs`: 398 candidates,
one phrase each, `source(none)` so nothing else is in the sheet): **46 candidates** when the audit was
written, **37** after the first route landed the same day. That number is recorded in
`scripts/constituent-baseline.json` and the audit fails if it grows, or if a candidate that was consumed
becomes unconsumed. A fall is reported as an improvement and re-recorded on purpose.

## Why it is not the `scale-x` regression

Same symptom, opposite cause, and the difference decides the fix:

|                    | `scale-x` (`bb39449`)                     | these 46                                          |
| ------------------ | ----------------------------------------- | ------------------------------------------------- |
| the writer         | exists (`--jumi-scale-x-<id>-0`)          | exists                                            |
| the consumer       | **was deleted**                           | **has no expression in the current architecture** |
| what to change     | the keyframe (`propertyKeyframeValue`)    | how a nested component value reaches the value    |
| protection         | both directions in `dead-links --strict`  | this audit's baseline                             |

The `scale-x` fix restored a read that had been removed. Nothing here was removed: the composition
simply never referenced these names.

## The three routes

Counted from the audit's own output, which groups by the attribute each candidate declares:

**Nested — 33 candidates.** The writer is a component of an _intermediate_ composition, one level below
the one the frame reads. `box-shadow` reads `box-shadow-inset`/`-outset`, which are themselves
compositions over `box-shadow-blur`, `-color`, `-offset-x/y`, `-spread`; `transform` reads `skew`, which
reads `skew-x`/`skew-y`; `background-position` reads `background-position-x`, which reads
`…-x-edge`/`…-x-offset`. Also `filter`, `backdrop-filter`, `object-position`, `offset-anchor`,
`offset-position`.

**Not composed — 9 candidates.** The attribute declares no dependencies at all, so no part is ever read:
`gap` (`column-gap`, `row-gap`), `transform-origin` (x/y/z), `border-block-width`,
`border-inline-width`, `outline` (`outline-offset` is not part of the `outline` shorthand), `transform`
(`transform-style` is its own property).

**Other name — 4 candidates.** The composition reads a different name than the candidate writes:
`border-radius` reads the four physical corners (`border-top-left-radius`, …) while the candidates write
the logical ones (`border-end-end-radius`, `border-start-start-radius`, …).

## Order to attack it in

By **route**, not by candidate count (ruling, 2026-09-16). There is no single nested-writer fix waiting
to be discovered, and trying to reach all three routes with one broader predicate is precisely how the
112 dead reads come back.

### The 9 "not composed" — traced, and it is two classes (2026-09-16)

Candidate by candidate, no production change: each one compiled as a phrase and as a value, then read
for the keyframe it emits, the property in that keyframe, the key the phrase writes, and whether
anything reads it. **Seven are real missing composition metadata. Two are independent CSS properties
this table groups under a composition they are not part of — and for those the emitted animation is not
inert, it is wrong.**

**Landed the same day, in three changes, with the baseline re-recorded each time:** declarations
corrected for the two wrong-property candidates (46 → 44), then the four straightforward compositions
including the orphaned `gap.ts` (44 → 40), then `transform-origin` on its own because its grammar is
qualitatively different (40 → 37). Each change carried a browser arm for the computed property, a
falsification arm, and — for the wrong-property pair — the negative assertion that the property which
used to move no longer does. The nine are retired; what follows is history.

**The seven.** `gap` (2 candidates): `gap` *is* the shorthand for `row-gap` + `column-gap`, and
`src/composition/gap.ts` **already exists**, already in the correct row-then-column order, and is
imported nowhere. `border-block-width` and `border-inline-width`: both real shorthands, and their
*radius* siblings (`border-block-radius`, `border-inline-radius`) are already wired, so these look
missed rather than modelled. `transform-origin` (3 candidates): not a shorthand at all — one property
taking one to three components — so it needs a new decomposition rather than a longhand list, and the
browser's grammar makes `z` imply `x` and `y`.

**The two.** `animate-outline-offset` declares `property('outline', ['outline-offset'])` and
`animate-transform-style` declares `property('transform', ['transform-style'])`. Neither part belongs to
the property it is declared under, so adding dependencies would invent a relationship CSS does not have
— and measured, both animate the **wrong property** today: a phrase on `animate-outline-offset` emits
`outline: <width> <style> <color>` and never touches `outline-offset`, and a phrase on
`animate-transform-style` emits the whole `transform` composition. The treatment is the declaration, not
the graph: `property('outline-offset')` and `property('transform-style')`, one line each — after which
the frame reads the key the phrase wrote, because part and attribute are by then the same name.

### The 4 logical/physical cases — probed 2026-09-16

The four `*radius` candidates declare `property('border-radius', ['border-end-end-radius', …])` — logical
corner names — while `border-radius` composes the four **physical** corners, so the parts are never read.
The question is which representation should be canonical. Measured in Chromium, three contexts, same
declared values:

| context        | `border-radius: 10 20 30 40` | logical longhands `ss se ee es` = 10 20 30 40 |
| -------------- | ---------------------------- | --------------------------------------------- |
| `ltr`          | 10px 20px 30px 40px          | 10px 20px 30px 40px                           |
| `rtl`          | 10px 20px 30px 40px          | **20px 10px 40px 30px**                        |
| `vertical-rl`  | 10px 20px 30px 40px          | **40px 10px 20px 30px**                        |

The physical shorthand is context-independent; the logical names are resolved **by the browser, per
context**. So converting logical candidates to physical corners inside Jumi — the easy-looking option —
would bake in LTR/horizontal assumptions, since a class is used in any context and the build has no
direction to consult. That model is falsified by the table above.

What does work, measured: a keyframe that animates the **logical longhands themselves** drives the
physical corners through the browser's own resolution in all three contexts (at 999ms of a 1s
linear from `10 20 30 40` to `40 30 20 10`: `39.97 29.99 20.01 10.03` under `ltr`, `29.99 39.97 10.03
20.01` under `rtl`, `10.03 39.97 29.99 20.01` under `vertical-rl`). Both `border-start-start-radius` and
`border-block-start-start-radius` are supported.

**Recommended representation:** the candidate's parts are the *animated properties*. The frame declares
each logical longhand it addresses,
`border-end-end-radius: var(--jumi-border-end-end-radius-<id>-0, var(--jumi-border-end-end-radius))`, and
the browser resolves. Nothing is mapped in Jumi, no dependency read is widened, and the variables stay
per-part.

That needed one model extension — a generated frame carrying one declaration per addressed property —
and it landed the same day: **37 → 33**, `dead-links --strict` still green, and a browser arm that reads
the *physical* corners under `ltr` and `vertical-rl` to show the browser doing the placing (the same
animation lands on {top-left, top-right} and {bottom-left, bottom-right} under `ltr`, and on the
diagonals under `vertical-rl`; RTL is not asserted because with these groupings the RTL permutation
swaps each pair for itself, so the physical sets would be identical and the assertion would prove
nothing). The rule is deliberately narrow — one recorded set of properties, no general multi-property
engine — and it applies to the tween path as well, so the value form is not inert either.

### What is left — 33

- **The 33 nested** — the real work, and the only route where the acceptance test below has to answer
  _how_ the value reaches the frame. `box-shadow` 5, `filter` 5, `backdrop-filter` 5, `transform` 2
  (`skew-x`/`skew-y`), and the four position families 4 each (`background-position`, `object-position`,
  `offset-anchor`, `offset-position`).

## The acceptance test for closing it

A change is finished when `node scripts/constituent-check.mjs` is run and the names it repaired have
left the residual — then the baseline is re-recorded with `--record` in the same commit, which is the
record of the improvement.

It must hold while it does:

- `node scripts/dead-links.mjs --strict` stays green. The restored component lookups are `conditional`
  — a known writer _class_, possibly absent from the sheet — and must not be re-classified as dead.
- `pnpm behaviour:check` gains an arm per route: the computed value has to move across the animation,
  and the arm has to be able to fail (see §10, which strips the lookups from its own sheet).
- The predicate does not simply widen. Hooking a component no candidate addresses is exactly what
  `bb39449` measured as the sheet's only dead reads (112 of them, eight families) before it deleted
  them, and `surfaces` exists to stop that.

## Reproducing the measurement

```bash
pnpm bundle                                  # the sheet is compiled against the shipped plugin
node scripts/constituent-check.mjs            # the audit, against the baseline
node scripts/constituent-check.mjs --record   # re-record after a deliberate improvement
```

The same audit against three trees, 2026-09-16:

```text
bb39449^ (before the regression)   351 read back ·  46 not · but 112 dead reads
bb39449  (shipped)                 350 read back ·  47 not ·   0 dead reads
restored lookup                    351 read back ·  46 not ·   0 dead reads
route 1 landed (three changes)     360 read back ·  37 not ·   0 dead reads
```
