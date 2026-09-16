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

Counted from the audit's own output at 46, which groups by the attribute each candidate declares. The
standings as of 2026-09-16: the 9 and the 4 are retired, and 2 of the 33 have landed with the url slots,
which leaves **31** — all of them the nested route, and all of them the one-level expansion.

**Nested — 33 candidates, 31 left.** The writer is a component of an _intermediate_ composition, one
level below the one the frame reads. `box-shadow` reads `box-shadow-inset`/`-outset`, which are
themselves compositions over `box-shadow-blur`, `-color`, `-offset-x/y`, `-spread`; `transform` reads
`skew`, which reads `skew-x`/`skew-y`; `background-position` reads `background-position-x`, which reads
`…-x-edge`/`…-x-offset`. Also `filter`, `backdrop-filter`, `object-position`, `offset-anchor`,
`offset-position`. Two of these were not nested at all — the `*url` slots, referenced by nothing — and
they are the two that have landed.

**Not composed — 9 candidates, retired.** The attribute declares no dependencies at all, so no part is
ever read: `gap` (`column-gap`, `row-gap`), `transform-origin` (x/y/z), `border-block-width`,
`border-inline-width`, `outline` (`outline-offset` is not part of the `outline` shorthand), `transform`
(`transform-style` is its own property).

**Other name — 4 candidates, retired.** The composition reads a different name than the candidate
writes: `border-radius` reads the four physical corners (`border-top-left-radius`, …) while the
candidates write the logical ones (`border-end-end-radius`, `border-start-start-radius`, …).

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

### What is left — 31, and the arithmetic goes to zero

Two of the 33 were never a depth problem, and they are the two to fix first: the composition omitted the
slot that would read `--jumi-filter-url`, so the omission was a data correction rather than the
one-level expansion. Landed 2026-09-16: **33 → 31**, `dead-links --strict` 0 dead / 0 unconsumed,
behaviour 63/63 with arms for the route, and the baseline and snapshot re-recorded with it.

- **The 2 `*url` slots — done.** `filter` and `backdrop-filter` now name a url slot, and the
  substitution over the composition had to learn to keep a slot's own fallback.
- **The 31 nested** — the real work, and the only route where the acceptance test below has to answer
  _how_ the value reaches the frame. `box-shadow` 5, `filter` 5, `backdrop-filter` 5, `transform` 2
  (`skew-x`/`skew-y`), and the four position families 4 each (`background-position`, `object-position`,
  `offset-anchor`, `offset-position`).

**The endpoint is therefore zero, not 29.** An earlier reading subtracted the two data corrections from
31 and stopped at 29; but the 31 nested cases are not a residual to be trimmed, they are the one-level
expansion and nothing else, so the audit should reach 397 of 397 and the baseline should become empty.
That is also what makes it worth converting the baseline into a zero-residual gate: a number left in it
after this pass is a claim that some candidate has no consumer by design, and none does.

### The probe that had to be corrected (2026-09-16)

The url slot was built on a probe that concluded an empty or unresolved `url()` voids the filter chain,
and the conclusion was wrong. Re-measured with a sibling whose effect is visible — `grayscale(1)` on a
red box is grey when the chain resolves and red when it does not — in Chromium:

| declaration | box | computed `filter` |
| --- | --- | --- |
| `grayscale(1)` | grey | `grayscale(1)` |
| `grayscale(1) url(#black)` | black | `grayscale(1) url("#black")` |
| `grayscale(1) url()` / `url("")` / `url(#missing)` | grey | the chain, with the url inert |
| `grayscale(1) var(--jumi-nothing)` | red | `none` |

So an unresolved url is **ignored**, and what voids the declaration is a read that references nothing.
The first probe could not tell the two apart because its sibling filter *and* its baseline were both
`blur(0px)`, the identity — "looks the same as plain" meant "no visible change", which is the answer to
neither question. The lesson is worth more than the measurement: a baseline that does not itself move
cannot distinguish *inert* from *fatal*, and the arm written from the wrong reading is what failed, not
the reasoning about the fix.

### The detector that had to be corrected twice (2026-09-16)

`LOOKUP` in `scripts/lib/dead-links.mjs` required `)` immediately after the inner variable name, so the
new shape `var(key, var(base, opacity(1)))` was invisible to it and the two url hooks on the
`backdrop-filter` composition were reported as dead reads while the CSS was correct. The first fix —
letting the fallback group be greedy — was worse: the outer read matched, its match consumed the `var(`
of the hook nested inside its fallback, and the scan never visited those hooks, turning 20 reads
(`rotate-x`, `scale-x`, the logical corners) into dead ones. What works is reaching the inner `var(`
through a **lookahead**, so both the outer read and the hook inside it are visited and a slot's fallback
is irrelevant to the pattern. Pinned by `scripts/lib/dead-links.test.mjs`.

Both failures are the same failure the whole track is about: a check that encodes an outdated belief
reports the CSS as wrong instead of itself. A detector for a shape has to be updated with the shape, and
the cost of not doing it is a false accusation rather than a missed one.

### The 33 traced: two topologies, not one (2026-09-16)

One representative per family, traced from the model's own tables plus the compiled emission — candidate,
what it writes, which entry claims the part, what that entry's template reads, what the attribute's
composition reads. No production change.

| representative | intermediate that claims the written part | attribute reads | where it stops |
| --- | --- | --- | --- |
| `skew-x` | `skew` (authorable) | `… var(--jumi-skew) …` | the intermediate |
| `box-shadow-blur` | `box-shadow-inset` **and** `-outset` (both internal) | `var(--jumi-box-shadow-inset), var(--jumi-box-shadow-outset)` | both, 2-way |
| `filter-drop-shadow-blur` | `filter-drop-shadow` (authorable) | `… var(--jumi-filter-drop-shadow) …` | the intermediate |
| `background-position-x-edge` | `background-position-x` (authorable) | `… var(--jumi-background-position-x) …` | the intermediate |
| `object-position-x-edge`, `offset-anchor-x-edge`, `offset-position-x-edge` | the axis entry, authorable | `… var(--jumi-<axis>) …` | the intermediate |

**31 of the 33 are that shape** — one level deeper, box-shadow being the only family whose leaf is claimed
by two intermediates. **The other two are not nested at all**: `filter-url` and `backdrop-filter-url` are
referenced by nothing (`--jumi-filter-url` appears only on its own entry), so `filter`'s composition simply
omits the `url()` filter function. That is the orphaned-`gap.ts` omission again — a data correction, not a
depth problem.

The four questions:

1. **One level, always** — bar box-shadow's 2-way fan-out and the two `*url` cases, which have no level.
2. **Yes, every intermediate already has a template reading its parts.** One reader artefact to record:
   `filter-drop-shadow.ts` builds its parts in a local const (`filterDropShadowValues`), so a scan of the
   symbol body alone reports no reads — the template is fine.
3. **Six of seven intermediates are authorable**; `box-shadow-inset`/`-outset` are purely internal. A fix
   keyed on "expand only authorable intermediates" would therefore miss box-shadow: the walk has to expand
   whatever the composition reads, and earn its safety elsewhere.
4. **Yes — and the safety is already in the model.** Expanding an intermediate *in place* (replacing
   `var(--jumi-skew)` with `skew`'s own template) lets the frame hook the leaf the phrase actually wrote,
   and only that leaf. Such a hook has the two properties the old 112 dead reads lacked: its base is a
   declared variable, and its frame key has *this phrase* as its writer — nothing is hooked merely because
   a writer *class* exists.

The shape, for `skew-x` — `transform`'s composition with `var(--jumi-skew)` replaced by `skew`'s template,
the written leaf read frame-first inside it:

```css
transform: … skew(var(--jumi-skew-x-<id>-0, var(--jumi-skew-x)), var(--jumi-skew-y)) …
```

Scope note: only the *phrase* path needs this. The tween path already works for these families, because
the element-level chain (`--jumi-transform` → `--jumi-skew` → `--jumi-skew-x`) resolves without a frame.

## The acceptance test for closing it

A change is finished when `node scripts/constituent-check.mjs` is run and the names it repaired have
left the residual — then the baseline is re-recorded with `--record` in the same commit, which is the
record of the improvement.

It must hold while it does:

- `node scripts/dead-links.mjs --strict` stays green. The restored component lookups are `conditional`
  — a known writer _class_, possibly absent from the sheet — and must not be re-classified as dead. The
  detector has already been wrong twice in this direction (see above), so a shape change is a change to
  `scripts/lib/dead-links.mjs` and to its test in the same commit.
- `pnpm behaviour:check` gains an arm per route: the computed value has to move across the animation,
  and the arm has to be able to fail (see §10, which strips the lookups from its own sheet). An arm
  asserts a **pixel or a colour**, never `getComputedStyle().filter` — the computed string lists a chain
  whose filter was dropped.
- The predicate does not simply widen. Hooking a component no candidate addresses is exactly what
  `bb39449` measured as the sheet's only dead reads (112 of them, eight families) before it deleted
  them, and `surfaces` exists to stop that.

## Reproducing the measurement

```bash
pnpm bundle                                  # the sheet is compiled against the shipped plugin
node scripts/constituent-check.mjs            # the audit, against the baseline
node scripts/constituent-check.mjs --record   # re-record after a deliberate improvement
```

The same audit against four trees, 2026-09-16:

```text
bb39449^ (before the regression)   351 read back ·  46 not · but 112 dead reads
bb39449  (shipped)                 350 read back ·  47 not ·   0 dead reads
restored lookup                    351 read back ·  46 not ·   0 dead reads
route 1 landed (three changes)     360 read back ·  37 not ·   0 dead reads
route 2 landed (the url slots)     366 read back ·  31 not ·   0 dead reads
```
