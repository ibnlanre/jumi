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

|                | `scale-x` (`bb39449`)                    | these 46                                          |
| -------------- | ---------------------------------------- | ------------------------------------------------- |
| the writer     | exists (`--jumi-scale-x-<id>-0`)         | exists                                            |
| the consumer   | **was deleted**                          | **has no expression in the current architecture** |
| what to change | the keyframe (`propertyKeyframeValue`)   | how a nested component value reaches the value    |
| protection     | both directions in `dead-links --strict` | this audit's baseline                             |

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

**The seven.** `gap` (2 candidates): `gap` _is_ the shorthand for `row-gap` + `column-gap`, and
`src/composition/gap.ts` **already exists**, already in the correct row-then-column order, and is
imported nowhere. `border-block-width` and `border-inline-width`: both real shorthands, and their
_radius_ siblings (`border-block-radius`, `border-inline-radius`) are already wired, so these look
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

| context       | `border-radius: 10 20 30 40` | logical longhands `ss se ee es` = 10 20 30 40 |
| ------------- | ---------------------------- | --------------------------------------------- |
| `ltr`         | 10px 20px 30px 40px          | 10px 20px 30px 40px                           |
| `rtl`         | 10px 20px 30px 40px          | **20px 10px 40px 30px**                       |
| `vertical-rl` | 10px 20px 30px 40px          | **40px 10px 20px 30px**                       |

The physical shorthand is context-independent; the logical names are resolved **by the browser, per
context**. So converting logical candidates to physical corners inside Jumi — the easy-looking option —
would bake in LTR/horizontal assumptions, since a class is used in any context and the build has no
direction to consult. That model is falsified by the table above.

What does work, measured: a keyframe that animates the **logical longhands themselves** drives the
physical corners through the browser's own resolution in all three contexts (at 999ms of a 1s
linear from `10 20 30 40` to `40 30 20 10`: `39.97 29.99 20.01 10.03` under `ltr`, `29.99 39.97 10.03
20.01` under `rtl`, `10.03 39.97 29.99 20.01` under `vertical-rl`). Both `border-start-start-radius` and
`border-block-start-start-radius` are supported.

**Recommended representation:** the candidate's parts are the _animated properties_. The frame declares
each logical longhand it addresses,
`border-end-end-radius: var(--jumi-border-end-end-radius-<id>-0, var(--jumi-border-end-end-radius))`, and
the browser resolves. Nothing is mapped in Jumi, no dependency read is widened, and the variables stay
per-part.

That needed one model extension — a generated frame carrying one declaration per addressed property —
and it landed the same day: **37 → 33**, `dead-links --strict` still green, and a browser arm that reads
the _physical_ corners under `ltr` and `vertical-rl` to show the browser doing the placing (the same
animation lands on {top-left, top-right} and {bottom-left, bottom-right} under `ltr`, and on the
diagonals under `vertical-rl`; RTL is not asserted because with these groupings the RTL permutation
swaps each pair for itself, so the physical sets would be identical and the assertion would prove
nothing). The rule is deliberately narrow — one recorded set of properties, no general multi-property
engine — and it applies to the tween path as well, so the value form is not inert either.

### Superseded — the 31 nested cases (2026-09-16)

Route 2 landed the two `*url` slots as a data correction: **33 → 31**, `dead-links --strict` 0 dead / 0
unconsumed, behaviour 63/63, and the baseline and snapshot re-recorded with it. `filter` and
`backdrop-filter` now name a url slot, and the substitution over the composition learned to keep a
slot's own fallback.

**The remaining 31 were the one-level expansion — `box-shadow` 5, `filter` 5, `backdrop-filter` 5,
`transform` 2 (`skew-x`/`skew-y`), and the four position families 4 each — and that route is
discarded.** It was implemented, reached 397 of 397 with an empty baseline, and was reverted before
landing.

It was discarded because an architectural spike showed it to be a good answer to a question the
representation should not have been asking. The expansion exists to keep a _generated
parent-property keyframe_ consistent when several constituent phrases write into one composed property:
under it, every frame re-composes the CSS property out of its leaves. The spike measured the
alternative — each constituent animates its own registered custom property, and the real property is
composed **once**, outside the animation — and found that it interpolates identically, makes sibling
components independent by default, and removes about seven eighths of the frame bytes. See
[`engineering/research/variable-animation.md`](../research/variable-animation.md).

The route was paused before the pivot for a defect worth recording, because the pivot is argued from
it. A keyframe is shared by every phrase whose frames hash to the same id and is emitted on first use,
so **which body won depended on compilation order**: `animate-scale-[0:1|100:2] animate-scale-x-[0:1|100:2]`
and the same pair reversed emitted different bodies and computed `scale: 2` against `scale: 2 1`. That is
compiler nondeterminism, and the rule it has to satisfy is that _any shared keyframe definition must
have a canonical body independent of which candidate caused that definition to be emitted._ The variable
model removes the shared definition rather than making it canonical, so the defect evaporates wherever
the model reaches instead of being managed.

**The residual stays 31 and the baseline stays at 31** — not as a target, but as an honest count of what
this representation cannot read back, until the typing census and the compiler prototype decide what
replaces it. The discarded implementation is archived at `/tmp/route-3-full.patch` and does not belong in
the repository. Routes 1 and 2 stand.

### The direction it pivots to

Jumi should animate variables **when the variable is the natural interpolation unit**, and CSS
properties when it is not. That is a hybrid, not a rewrite, and the spike draws the line:

| category                    | motion                                                              | mechanism                                                                           |
| --------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| typed scalar constituent    | `scale-x`, `rotate-angle`, `translate-x`, `skew-x`, a `blur` amount | animate the slot's own registered custom property                                   |
| function-shaped constituent | `filter: blur(…)`, `backdrop-filter: brightness(…)`                 | animate a typed **argument** variable; the function stays in the static composition |
| whole / complex / effect    | effects, keyword-bearing values, arbitrary values                   | animate the actual CSS property; its native semantics are the right abstraction     |

The composite property is composed once from its slots wherever that applies, so the browser does the
combining and no compiler machinery is built to make property-level keyframes cooperate.

Two things are now **model data, not implementation detail**, because the experiment proved they
decide both interpolation and fallback behaviour: a leaf's CSS Properties & Values API `syntax`, and its
identity `initial-value`. A registered property always has a computed value, so an animated slot's
`var()` fallback is unreachable — an animated slot is read _directly_, and only the
whole-versus-leaves boundary keeps a fallback, by staying permissive.

Open workstreams, in order:

1. **The typing census — measured.** Every animated leaf classified against whether the identity the
   model already declares fits the syntax its candidate implies: **187 of 316 addressable leaves can be
   typed, 129 cannot** (103 keyword-valued, 24 whose grammar is wider than one component). Two findings
   carry forward: `<number-percentage>` is not an implemented syntax, so unions of components are the
   spelling that works; and the identity becomes load-bearing, which makes `column-rule-width`'s
   transposed default fatal where it is invisible today. See
   [`engineering/research/property-typing.md`](../research/property-typing.md).
2. **The transform prototype — measured, and it is outcome B.** Decomposing a whole `transform` motion
   into typed leaves is **exact** when the author's list is matched and in Jumi's composition order (4 of
   4 matched cases, identical to <1e-6 at every sampled point). It **diverges along the path** when the
   ends are unmatched but the order agrees (2 cases, up to 35.4 in a matrix component). And it describes
   **a different motion** when the order differs (3 cases, up to 100.0), because Jumi's composition is one
   fixed sequence — `perspective · matrix · matrix3d · rotate · scale · skew · translate` — while a native
   list applies its functions in the order the author wrote them. Today a whole transform phrase emits the
   author's list verbatim (`--jumi-transform-<id>: translate(100px,0px) rotate(90deg)`), so decomposing is
   the operation that would lose the order. The rule is therefore three-way: a component transform motion
   types its leaf; a matched whole in Jumi's order types its leaves; **every other whole keeps the actual
   `transform` property**. That third row is broad — `translate(…) rotate(…)` is an author's habit and is
   not Jumi's order — so the component-override guarantee applies to `transform` only where the whole
   participates in the decomposed representation. See
   [`engineering/research/transform-interpolation.md`](../research/transform-interpolation.md).
3. **Aggregate ordering — measured.** The list _is_ the precedence order, and it is **not** currently
   independent of candidate compilation order: `computeSlots()` emits two of its four groups in `Map`
   insertion order, so two motions in one group are ordered by Tailwind's compile order. Two phrases of
   `scale` with different frames compile to reversed lists, and the same two classes on the same element
   then compute `5 1` or `2` — identical markup, an order nobody wrote. The four pairs in the ruling are
   mostly shielded from this by a grouping artefact (`values` before `shared`), and two of the four
   (`skew`+`skew-x`, `filter-drop-shadow`+`drop-shadow-blur`) collapse to one slot and have no order
   question at all. **The semantics the ruling wants are real and measured:** under the pivot's slot
   representation, whole-first reads `3 2` — the component owns x, the whole keeps y and z — while
   whole-last reads `2`; today's representation is all-or-nothing in both orders. **But the rule is
   necessary and not sufficient:** a whole motion that writes a composed value bypasses a component
   nested inside it and no ordering recovers it (both orders read the whole's value), so the rule needs
   the companion requirement that a whole motion writes its constituents' slots. See
   [`engineering/research/aggregate-order.md`](../research/aggregate-order.md).

What remains, in the order the ruling set:

4. **Fix the swapped `column-rule-width` / `column-rule-color` identities.** Latent today because the
   shorthand's `||` grammar absorbs the transposition — measured, both spellings compute `medium` and
   `currentColor`. Fatal under the variable model, where a slot is read on its own, and the union rung
   would hide it again (`<length> | currentColor` registers), which is why it has to be fixed rather than
   accommodated.
5. **A compiler prototype on a real page** with typed leaves, the current implementation against the
   pivot, across document-time animation, named motions, independent durations, segment easing, scroll
   timelines, animation ranges, reduced motion, siblings, whole-plus-constituent conflict, DevTools
   readability, CSS size, and Studio export/replay. It carries one question of its own: whether
   `skew`+`skew-x` and `filter-drop-shadow`+its blur — which today collapse into one shared slot — should
   become independently animated slots under the pivot, or whether that collapse is an aggregation
   artefact the new model no longer needs.
6. **Then define the stable ordering key and the decomposition boundary together**, because the transform
   result is what says which whole motions may decompose at all. Nothing in `computeSlots()` moves before
   that. The compiler-order-dependent ordering is an independent bug to fix whether or not the pivot
   ships — the two-phrase case computes `5 1` or `2` from identical markup — but the semantic key should
   not be chosen until the boundary is known.
7. **Only then decide whether to migrate the broader 79%.**

The whole-plus-constituent case does **not** disappear in this model, and it is not the same defect:
candidate-arrival order deciding the body of a shared definition is compiler nondeterminism;
animation-list order deciding which animation owns an animated custom property is ordinary CSS conflict
resolution.

### The probe that had to be corrected (2026-09-16)

The url slot was built on a probe that concluded an empty or unresolved `url()` voids the filter chain,
and the conclusion was wrong. Re-measured with a sibling whose effect is visible — `grayscale(1)` on a
red box is grey when the chain resolves and red when it does not — in Chromium:

| declaration                                        | box   | computed `filter`             |
| -------------------------------------------------- | ----- | ----------------------------- |
| `grayscale(1)`                                     | grey  | `grayscale(1)`                |
| `grayscale(1) url(#black)`                         | black | `grayscale(1) url("#black")`  |
| `grayscale(1) url()` / `url("")` / `url(#missing)` | grey  | the chain, with the url inert |
| `grayscale(1) var(--jumi-nothing)`                 | red   | `none`                        |

So an unresolved url is **ignored**, and what voids the declaration is a read that references nothing.
The first probe could not tell the two apart because its sibling filter _and_ its baseline were both
`blur(0px)`, the identity — "looks the same as plain" meant "no visible change", which is the answer to
neither question. The lesson is worth more than the measurement: a baseline that does not itself move
cannot distinguish _inert_ from _fatal_, and the arm written from the wrong reading is what failed, not
the reasoning about the fix.

### The detector that had to be corrected twice, and then replaced (2026-09-16)

`LOOKUP` in `scripts/lib/dead-links.mjs` required `)` immediately after the inner variable name, so the
new shape `var(key, var(base, opacity(1)))` was invisible to it and the two url hooks on the
`backdrop-filter` composition were reported as dead reads while the CSS was correct. The first fix —
letting the fallback group be greedy — was worse: the outer read matched, its match consumed the `var(`
of the hook nested inside its fallback, and the scan never visited those hooks, turning 20 reads
(`rotate-x`, `scale-x`, the logical corners) into dead ones.

**Both failures are one failure, and the second is why the regex was not extended a third time.** A
pattern over `var(...)` is a description of one expression's _text_, and the expressions this pass emits
are nested — so every shape it does not anticipate is either invisible or swallowing. The reader is now
structural (`scripts/lib/var-references.mjs`): it walks the value, balancing parentheses and stepping
over strings, and reports **every reachable `var()` exactly once**, whatever the fallback is — a
variable, a function call, a quoted data URI with commas, a whole chain of both. The classification
above it is unchanged; only the discovery is.

Verified as a differential rather than by eye: the previous detector reconstructed from `HEAD` and the
new one classify all 560 reads in the frozen sheet **identically** — no read added, none lost, none
re-classified. The scanner is pinned by `scripts/lib/var-references.test.mjs` with the shapes that broke
the pattern plus quoted and escaped strings, deep chains, adjacent functions, truncated input, and the
exactly-once invariant; the detector's own test covers the three hook shapes and the boundary between
them.

This was hardened as a **prerequisite commit**, before the one-level expansion, for the reason the
failures make plain: the expansion's whole purpose is to deepen these expressions, and the detector's
correctness had been depending on their textual shape.

### The 33 traced: two topologies, not one (2026-09-16)

One representative per family, traced from the model's own tables plus the compiled emission — candidate,
what it writes, which entry claims the part, what that entry's template reads, what the attribute's
composition reads. No production change.

| representative                                                             | intermediate that claims the written part            | attribute reads                                               | where it stops   |
| -------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- | ---------------- |
| `skew-x`                                                                   | `skew` (authorable)                                  | `… var(--jumi-skew) …`                                        | the intermediate |
| `box-shadow-blur`                                                          | `box-shadow-inset` **and** `-outset` (both internal) | `var(--jumi-box-shadow-inset), var(--jumi-box-shadow-outset)` | both, 2-way      |
| `filter-drop-shadow-blur`                                                  | `filter-drop-shadow` (authorable)                    | `… var(--jumi-filter-drop-shadow) …`                          | the intermediate |
| `background-position-x-edge`                                               | `background-position-x` (authorable)                 | `… var(--jumi-background-position-x) …`                       | the intermediate |
| `object-position-x-edge`, `offset-anchor-x-edge`, `offset-position-x-edge` | the axis entry, authorable                           | `… var(--jumi-<axis>) …`                                      | the intermediate |

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
4. **Yes — and the safety is already in the model.** Expanding an intermediate _in place_ (replacing
   `var(--jumi-skew)` with `skew`'s own template) lets the frame hook the leaf the phrase actually wrote,
   and only that leaf. Such a hook has the two properties the old 112 dead reads lacked: its base is a
   declared variable, and its frame key has _this phrase_ as its writer — nothing is hooked merely because
   a writer _class_ exists.

The shape, for `skew-x` — `transform`'s composition with `var(--jumi-skew)` replaced by `skew`'s template,
the written leaf read frame-first inside it:

```css
transform: …
  skew(var(--jumi-skew-x-<id>-0, var(--jumi-skew-x)), var(--jumi-skew-y)) …;
```

Scope note: only the _phrase_ path needs this. The tween path already works for these families, because
the element-level chain (`--jumi-transform` → `--jumi-skew` → `--jumi-skew-x`) resolves without a frame.

## The acceptance test

This is the test routes 1 and 2 were accepted by, and it is what any change to the read model still has
to satisfy. It is no longer a test for closing the residual to zero: the residual counts what the current
representation cannot read back, and the pivot changes the representation rather than the read model.

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
route 3 (the one-level expansion)  397 read back ·   0 not ·   0 dead reads   ← discarded, reverted
```

`HEAD` is the route-2 row. Route 3 is kept as a measurement rather than a destination: it is what this
representation is _capable_ of reading back once every phrase writes a key a frame can hook, and the
pivot is an argument that the representation, not the expansion, is the thing to change.
