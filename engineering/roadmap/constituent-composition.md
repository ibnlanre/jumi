# Constituent composition: writers with no route

Status: **active roadmap.** Opened 2026-09-16, by the restoration of the per-frame component lookup.

## The class

A constituent phrase writes a frame value — `--jumi-<component>-<id>-<offset>` — and no keyframe reads
it. The sheet is well formed, every name is spelled correctly, the motion computes, and it never moves.

Measured across the whole registration table (`node scripts/constituent-check.mjs`: 398 candidates,
one phrase each, `source(none)` so nothing else is in the sheet): **46 candidates**. That number is
recorded in `scripts/constituent-baseline.json` and the audit fails if it grows, or if a candidate that
was consumed becomes unconsumed. A fall is reported as an improvement and re-recorded on purpose.

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
112 dead reads come back. The two small routes are also the closer ones:

- **The 9 "not composed"** — a missing `dependencies` declaration, which is a data correction rather
  than an architectural one: `gap` over `column-gap` + `row-gap`, `transform-origin` over
  `transform-origin-x/y/z`, `border-block-width` over its two logical edges, `outline` over
  `outline-offset`, `transform` over `transform-style`. Declaring the composition is the whole fix, and
  it is the same edit that makes the *value* path name its own parts.
- **The 4 "other name"** — logical against physical. `border-radius` composes the four physical corners
  while the candidates write `border-end-end-radius` and friends. Either the composition reads both
  spellings or the candidates address the physical ones; that is a naming ruling, not new machinery.
- **The 33 nested** — the real work, and the only route where the acceptance test below has to answer
  *how* the value reaches the frame.

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
```
