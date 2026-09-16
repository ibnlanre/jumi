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

4. **The `column-rule` identities — fixed.** `column-rule-width` rested at `currentColor` and
   `column-rule-color` at `medium`: each other's default. Both are back where their families put them,
   and the invariant that catches it is a test rather than an eye — a `*-width` leaf may never rest at a
   colour, and a `*-color` leaf never at a line width. Verified to fail on the transposition before being
   relied on. Latent in every sense: the `column-rule` composition's grammar is order-insensitive, the
   canonical corpus never registers it, and both were found only because the census read every identity
   and tried to register `--jumi-column-rule-width` as a `<length>`. No shipped byte changed.
5. **The typed-leaf compiler prototype — built, and the two mandatory questions answer in the pivot's
   favour.** `scripts/prototype/typed-leaves.mjs` is a **second finalizer** over the sheet the shipping
   finalizer produces, so everything the pivot does not change is the real machinery rather than a
   reimplementation. **Ownership:** with `animate-scale-[0:1|100:2]` and `animate-scale-x-[0:1|100:5]` on
   one element, the prototype reads `5 2 2` at 100% — the constituent owns x, the whole keeps y and z —
   and today reads `5 1` or `2`, all-or-nothing in both orders. **Determinism:** today the aggregate list
   _reverses_ with the candidate compilation order; the prototype emits the same list in both orders,
   keyed whole-before-constituent with the candidate name as tiebreak. **And the surface it never touched
   still works** — a named motion with an independent duration reads `2s, 0.5s` identically through both
   paths, which is the evidence that this is a first-class path rather than a parallel one. Three things
   the pivot must build at compile time: registrations (**additive** — no leaf is registered today),
   **list normalisation, which is grammar rather than padding** (`scale: 2` means `2 2 2`; `translate:
100px` means `100px 0`), and the function reshape. Independence is narrower
   than the question: a part motion expressed as a _phrase_ is already its own animation, while the
   _tween_ form shares its parent's slot — and that is a keying question in `computeSlots()`, not a
   finalizer one. See [`engineering/research/typed-leaves.md`](../research/typed-leaves.md).
6. **The function reshape — built and measured, and it is cheaper than it looked.** The composition owns
   the function and the typed slot owns only the argument (`blur(var(--jumi-filter-blur-amount))`, and no
   function string in the animated slot). Keyframe bytes fall **73–92%** because shipping writes the whole
   11-operand filter expression into every frame, and total bytes fall with them — −12.2% for two
   arguments, −8.4% for a whole filter plus a blur constituent, −7.9% for a named control, −1.9% on a
   scroll range. **Every case the reshape owns shrinks and every case it declines is byte-identical.**
   Registrations are the recurring price, nine for a function-shaped family, and are the one part a real
   build can gate on a used-in-the-sheet check. Two of the ruling's cases were **capability losses, not
   byte costs**: a whole filter motion and a
   blur constituent, or a blur and a brightness constituent, contend for one property and shipping lets
   one of them go silent — `blur(0px)` where it should read `blur(8px)`. The rule that keeps it safe is
   that **a native instance blocks the reshape for its whole attribute**, since a native instance writes
   the property itself as one self-contained expression and therefore overwrites a reshaped one rather
   than composing with it; and that **the semantic ordering is only applied to attributes the reshape
   actually carries**, because ordering an attribute the reshape declines changed which motion won its
   property. Neither corpus (`variant.css`, `input.css`) contains a single argument instance, so the
   reshape's own category is measured on purpose-built sheets rather than on the corpus. The required
   tests earned their place: they exposed two defects that each paid bytes for nothing — a
   function-holding leaf typed as its argument's grammar (with the model's source as the
   `initial-value`), and a slot id sliced off the variant-carrying key, which made the reshape a silent
   no-op for every `scroll`/`@supports`/segment-easing instance while still emitting its registrations.
7. **Then define the stable ordering key and the decomposition boundary together**, because the transform
   result is what says which whole motions may decompose at all. Nothing in `computeSlots()` moves before
   that. The compiler-order-dependent ordering is an independent bug to fix whether or not the pivot
   ships — the two-phrase case computes `5 1` or `2` from identical markup — but the semantic key should
   not be chosen until the boundary is known. The reshape's result narrows this: the key has to be
   **per attribute**, and an attribute may only be re-keyed when the reshape carries all of it.
   7b. **Addressability is now a fact the model graph owns.** `src/variables/composition.ts` derives a
   `CompositionEdge` per (composite, dependency) — `kind` `direct` / `fallback` / `composite`, plus
   `addressable` — from the composition the graph already declares, and exposes
   `isDirectlyAddressable(attribute, dependency)`. `src/helpers/slots` states the slot syntax once, so the
   derivation and `hookSlot` cannot come to disagree about what a slot is. **97 of 104 composites have at
   least one directly addressable dependency**; `filter` is 9/11 (the two failures are the composite
   `filter-drop-shadow` and the fallback-read `filter-url`), and `transform` is 0/7 because every one of
   its dependencies is itself a composite — which is why `skew-x` is a second-level routing problem and
   `scale-x` is not. Nothing consumes the predicate yet; no emitted byte changed.
8. **Then** the surface the prototype did not reach: Studio export/replay, DevTools inspection, and the
   broader byte accounting on a real page.
9. **Only then decide whether to migrate the broader 79%.**

### C.5 — the `scale` migration, fully specified

Everything before this reduced uncertainty; C.5 is implementation. The three interfaces it consumes are
merged and tested, and the two behaviours it must reproduce were **proven by hand in the browser**:

```text
multi-axis whole 1 → 2 3        native == typed leaves at 0/25/50/75/100%
ownership        whole 1→2 + x 1→5    5 2 2 at 100%, x from the constituent
                                      and y/z from the whole at every sample
```

**The two execution models, and the gate between them.** Direct typed-leaf animation is the production
representation; the property-level `scale` animation is the fallback for what the proof predicate
declines. No intermediate representation, and no partial entry:

```text
whole scale      → scaleLeafEndpoints(value)
  success        →   keyframe writes --jumi-scale-x/y/z directly, values already canonical
  null           →   the existing scale-property path, byte-for-byte

scale-x/y/z      → scaleFactorToNumber(frame value)
  success        →   write the canonical value to that typed leaf
  null           →   preserve the existing composed-property representation

ordering         → explicit `kind: whole-decomposed | constituent` on the slot,
                   not inferred from a name's string shape
```

The constituent decline matters: a family being migrated must not mean every value the `any` escape
hatch accepts is forced through the typed path.

**Identities are preserved, not re-made.** A phrase was already per-instance; Commit B extended that to
eligible part tweens. C.5 keeps both keys and changes only what their frames write.

**The structural before/after** — the clearest proof that the execution model changed rather than gaining
metadata around the old one, measured on four sheets before C.5:

```text
sheet              bytes   kfBytes   slots  var()   frame declarations
                                                    scale(property)  leaf
lone scale          8135     70        1      55           1            0
lone scale-x        8648    135        1      68           1            0
scale + scale-x     9923    205        2      93           2            0
scale + x + y      11711    340        3     131           3            0
```

Every scale frame declaration today is property-level and there are **zero** leaf assignments. After
C.5 the decomposed cases must invert that, for `lone scale-x` as well as the wholes. (A sheet touching
`scale` carries exactly three typed registrations — established end to end in C.2.)

_(Amended 2026-09-16: the inversion is real but not total — typed keyframes carry `scale` again as a
composition bridge, so "a frame writes `scale`" stops separating the two execution models. The reading
that still does is which `scale`; see the result, below.)_

**Acceptance, four classes:**

```text
equivalence   lone whole and lone constituent identical to before, including the
              mixed number/percentage curves already measured
composition   whole 2 + x 5 → 5 2 2, whole 2 + x 5 + y 7 → 5 7 2, sampled through
              the curve rather than only at 100%
determinism   reverse candidate discovery → identical aggregate lists and samples
escape hatch  a whole that scaleLeafEndpoints() declines keeps its `scale:` frame
              declaration with **no** typed-leaf frame declarations for that motion,
              and a constituent beside it does not acquire the new ownership semantics
```

The escape hatch is asserted on **emitted CSS as well as computed output**, so "does not partially
enter" is a structural invariant rather than only a behavioural observation — C.5 puts two execution
models for one property into production at once and the boundary has to be observable.

Then the gate, plus `dead-links --strict`, `constituent-check` and the serialize differential, because
C.5 changes exactly the frame/write topology those police. If those pass, `scale` is migrated and C
closes. **D then extracts the generic mechanism from the `scale` implementation — not another proving
family, and not by generalizing the preparatory abstractions.**

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

### C.5 — result: `scale` is migrated

Landed in `efbab29`, and the falsification set passes in full. Four things were
proven rather than assumed, and each changed a decision:

**Determinism — and the `kind` field was not needed.** The same three candidates
compiled in both discovery orders produce **byte-identical** full animation
longhand lists, because `values` and `partTweens` are separate groups in
`computeSlots()` and are sorted independently. Whole-before-constituent therefore
holds by construction, so the explicit `kind: whole-decomposed | constituent` was
_not_ added: metadata that cannot change behaviour is machinery, and the falsifying
test that would have justified it came back negative.

**Variant scoping — the substrate follows the variant for free.** `hover:`-prefixed,
the declaration lands inside `@media (hover: hover) { .hover\:…:hover { … } }`.
That is the property of candidate ownership that aggregate publication could not
have had.

**Escape hatch — observable in the emitted CSS.** A declined whole beside a typed
constituent leaves the whole's frame as `to { scale: var(--jumi-scale-…); }` with
**no** typed-leaf frame declarations, and only one rule carries the substrate (the
constituent's). The declined whole does not acquire the ownership model, as
instructed.

**Equivalence, with the sampling race fixed** (pause and delay set inline, so no
turn elapses between them). Curves 100% → 0%:

| sheet                  | result                                                                           |
| ---------------------- | -------------------------------------------------------------------------------- |
| `lone whole 2`         | `2 2 2 \| 1.75 1.75 1.75 \| 1.5 1.5 1.5 \| 1.25 1.25 1.25 \| 1`                  |
| `lone x 5`             | `5 1 \| 4 1 \| 3 1 \| 2 1 \| 1` — identical to the pre-C.5 baseline              |
| `lone whole 2 3`       | `2 3 \| … \| 1` — matches native `scale: 2 3`                                    |
| `lone x 50%`           | `0.5 1 \| … \| 1` — matches native `scale: 50%`                                  |
| `lone x 0:1\|100:150%` | `1.5 1 \| 1.375 1 \| 1.25 1 \| 1.125 1 \| 1` — the multi-stop form canonicalizes |

**The structural inversion.** At `efbab29` it was read as "every property-level
`scale` frame declaration is gone, and leaf assignments replaced them" — 1/1/2/3
frame declarations down to zero, 0 leaf declarations up to 3/1/4/5. The bridge
puts `scale` back into those keyframes, so that reading no longer separates the
two execution models. The distinction that does is _which_ `scale`, which is the
one the earlier pass was reaching for:

| declaration in a frame          | pre-C.5            | after C.5 + bridge               |
| ------------------------------- | ------------------ | -------------------------------- |
| `scale: var(--jumi-scale-<id>)` | the animated value | **zero** under typed execution   |
| `scale: var(--jumi-scale)`      | absent             | the **bridge**, present          |
| `--jumi-scale-x/y/z`            | absent             | carries **every** animated value |

That table is the standing audit taxonomy for the typed path, and it replaces
"no `scale` declarations in typed keyframes":

```text
typed path
- animated value carried by leaf declarations
- scale declarations are bridge-only: scale: var(--jumi-scale)
- no typed keyframe carries an authored scale value directly
```

Measured on the same four sheets, at the levels the earlier pass could not be
directly compared across:

| sheet             | bytes         | kfBytes   | slots | `var()`   | animated  | bridge | leaf      |
| ----------------- | ------------- | --------- | ----- | --------- | --------- | ------ | --------- |
| `lone scale`      | 8135 → 8252   | 70 → 180  | 1     | 55 → 57   | **1 → 0** | 0 → 2  | **0 → 3** |
| `lone scale-x`    | 8648 → 8627   | 135 → 134 | 1     | 68 → 67   | **1 → 0** | 0 → 2  | **0 → 1** |
| `scale + scale-x` | 9923 → 10019  | 205 → 315 | 2     | 93 → 94   | **2 → 0** | 0 → 4  | **0 → 4** |
| `scale + x + y`   | 11711 → 11786 | 340 → 450 | 3     | 131 → 131 | **3 → 0** | 0 → 6  | **0 → 5** |

The bridge is exactly 73 bytes per typed keyframe — the four deltas over
`efbab29` are 73, 73, 146, 219 — and that is the whole of the difference between
this table and the one this section first recorded. Only `lone scale-x` is still
smaller than pre-C.5, by 21 bytes. "Three of four sheets shrank" was true of the
bridge-less `efbab29` and is not true of what ships.

**The multi-stop form twice, and a correction to the correction.** This row was
got wrong in both directions in one pass, and both times by trusting a spelling
it had not written down:

- It was first recorded as `1.5 1 | … | 1`, "the mixed form canonicalizes", with
  no class named.
- It was then **withdrawn** as unreproducible. That measurement used
  `animate-scale-x-[0:1/100:150%]` and three near-misses, and all four flat-lined
  at `1 | 1 | 1 | 1 | 1`. They are different classes: Jumi separates frame stops
  with `|`, so `0:1|100:150%` is two stops and `0:1/100:150%` is one — one frame,
  hence a no-op animation, hence a flat line. The withdrawal measured a typo.

Re-measured with the separator the harness itself uses, the row stands and is
byte-identical at `07e2b23` and at HEAD:

```text
animate-scale-x-[0:1|100:150%]
  100% → 0%   1.5 1 | 1.375 1 | 1.25 1 | 1.125 1 | 1
  frames      two: 0% and 100%, reading --jumi-scale-x-<id>-0 and <id>-100
  substrate   no rule carries it — this sheet declines typed execution
```

So the percentage **is** canonicalized (`150%` → `1.5`) and the sheet is unchanged
by C.5, but not because the typed path handled it: the multi-stop form declines
typed execution entirely and keeps the old composed representation, frame for
frame. That is the opt-in rule behaving correctly — a value the proof predicate
cannot read is not pushed through the typed path — and it belongs to D as a
**constraint, not a bug to fix casually**:

> multi-stop constituent phrases currently decline typed execution; do not
> generalize typed-leaf support to them until their frame model is explicitly
> represented and measured.

Both halves of that mistake are worth keeping visible, because a sheet's _name_ is
not its spelling, and this pass produced two measurements that looked like
findings while measuring a typo and a stale `dist` respectively.

**Audits:** `dead-links --strict` reports no dead reads and no unconsumed frame
writes; `constituent-check` introduces no `scale` residual (its list is unchanged:
`backdrop-filter`, `background-position`, `box-shadow`, `filter`, `object-position`);
the serialization audit and differential pass. `pnpm check` is green on all 17
stages, 400 unit tests.

**And the boundary is now a browser gate** (`1f5dcf3`, section 16 of
`scripts/behaviour-check.mjs`), because nothing else in the suite can see it. Five
arms on computed `scale` at 0/25/50/75/100%: the mixed sheet, the same sheet with
candidate discovery reversed, both motions still live, a lone typed constituent,
and a lone typed whole. Both halves are falsified against a build carrying the
defect — removing the pins reproduces the quadratic (64/68), removing the bridge
reproduces `1 | 1 | 1 | 1 | 1` (66/68) **while both lone arms stay green**, which is
what makes the arm specific to the mixed boundary rather than broad.

### C.5 — the mixed-execution boundary, found after the close (2026-09-16)

`efbab29` was written up here as closing C, and it did not. A reviewed case
computed `1` where the pre-C.5 baseline computes `5 1`:

```text
animate-scale-[none] + animate-scale-x-[5]
  pre-C.5  07e2b23   5 1   4 1   3 1   2 1   1
  C.5      efbab29   1     1     1     1     1
```

The whole had declined, so its keyframe wrote `scale: var(--jumi-scale-…);` — the
native escape hatch doing exactly its job — and **a keyframe beats a rule**, so it
beat the candidate's static substrate `scale: var(--jumi-scale)` outright. The
constituent's leaf contribution was not weakened, it was invisible: nothing
downstream could read it. Two execution models for one property had met at a
boundary the topology had only been argued to be safe, and the argument was wrong.
The record above is amended rather than left standing.

**The fix is a composition bridge inside the typed keyframes** (`c4f2ffb`), not a
runtime set and not an accepted regression: every typed keyframe re-asserts
`scale: var(--jumi-scale)`, so the same animation-list precedence that defined the
pre-C.5 behaviour decides the property again and the leaves decide the value.

**It is pinned at both ends, and that is a measurement rather than a style
choice.** A keyframe that names `scale` only at `to` turns `scale` into a second
animation whose implicit `from` is the _un-animated_ underlying value; substituted
per frame against the animated leaf, that composes to `scale(p) = 1 + p(x(p) − 1)`.
With that shape `lone x 5` curved `5 1 | 3.25 1 | 2 1 | 1.25 1 | 1` — $1 + 4p^2$
where $1 + 4p$ is correct, and the fault was in the _leaf_, not in the bridge.
Pinning `from` makes both ends the same expression, so there is nothing to
interpolate and the frame's own composition passes through. Neither pin is
redundant: dropping `from` from the constituent path restores $1 + 4p^2$ on
`lone x 5`, and dropping it from the whole path curves `lone whole 2` to
$1 + p^2$.

**Re-run against pre-C.5**, all twelve sheets of the falsification set. The only
curves that differ are the whole-value corrections C.5 intended: `scale: 2` is
`2 2 2`, and pre-C.5 computed `2 1 1` because the whole only ever fed the x leaf
(`1.5` for `scale: 150%`, the same reason). Everything else is unchanged,
including the two that matter most here — `declined whole + x` and
`x + declined whole` are byte-identical to pre-C.5 in **both** discovery orders,
and reversing candidate discovery still yields byte-identical animation longhand
lists. The intended rule holds without a special case: property ownership follows
animation-list precedence, exactly as before C.5.

**C is closed by `c4f2ffb`.** `scale` is no longer a prototype, and the
mixed-execution boundary is now measured against the pre-C.5 baseline rather than
argued from the topology. D extracts the mechanism this implementation proved —
typed substrate published by the candidate, direct-leaf keyframes, canonicalized
frame values, family-level decline-to-native fallback, and the composition bridge
that lets leaves own an animated property beside a native motion — rather than
generalizing any of the preparatory abstractions.
