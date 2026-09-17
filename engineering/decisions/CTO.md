## 2026-09-15 — segment easing: phrase-valued control accepted, last edge measured

**Syntax — accepted.** `animate-rotate-[0:0deg|100:45deg]/test` beside
`animation-timing-function-[0:ease-out-back]/test`: the motion phrase keeps its strict `offset:value`
meaning, and all easing stays under `animation-timing-function-*`. The probe's catch does not invalidate the
syntax, it routes it — a keyframe-local timing function cannot read a `var()`, so a timing phrase is not an
ordinary control but a **specialization** of the addressed motion's definition.

**Unaddressed — refused for 1.0.** `animation-timing-function-[0:ease-out-back]` measured +4,844 bytes on
the probe sheet (19 clones, 19 selection declarations in one rule). Too much hidden cost for syntax whose
scope is also vague: segments belong to a motion instance or a property scope, and the unaddressed form has
neither.

**Destructive path — warning, and structurally blocked.** A phrase that reaches the control chain is not a
mis-set property: the composition's whole `animation` shorthand becomes invalid at computed-value time and
the motion disappears (`animation-name: none`, zero animations). Measured twice — as a global variable, and
again in the fan-out section, where leaving the phrase in place gave both elements _nothing animates_ until
it was dropped. Statically provable, so it ships as a warning even before the feature.

**Selection placement — measure before landing.** The invariant to satisfy is
`motion activation < segment-specialization selection < aggregate consumption`, with the control's own rule
owning selection: placement in the motion's rule leaked to every element animating that motion (`90` vs
`86.441` on the probe).

**Hard rule.** Specialization may change the selected keyframe definition; it must not alter the slot/control
fallback chain. Scalar easing stays the fallback for every unclaimed segment (measured: `250ms` claim, `750ms`
fallback).

### The last semantic edge, measured: structural fan-out

`…/rotate` beside a named `/spin` rotate motion, four rotate definitions in the sheet
(`spike-timing-phrase` §8):

| semantics                                       | element carrying both rotate motions            | cost                             |
| ----------------------------------------------- | ----------------------------------------------- | -------------------------------- |
| A · property scope, as every other `/…` control | both specialized                                | 4 clones, 4 selections, +2,799 B |
| B · the structural instance only                | only the unaddressed one — `/spin` keeps `ease` | 3 clones, 3 selections, +2,078 B |

Both keep the locality that matters: an element without the control class stays unspecialized.

**And the granularity is the definition, not the instance.** The activation variable is keyed by the
_definition_ (`--jumi-rotate-<hash(value)>-animation-name`) while only the label declaration carries the name
hash (`--jumi-rotate-…-fzwY-label`), so a selection written into the activation lands on every motion sharing
that definition — a `/<name>` control cannot be instance-precise today, and two names over one definition
would be specialized together. Instance-precise selection needs a name-keyed variable the model does not
emit, since the hoist reads the definition-keyed activation.

So the question is no longer "instance or property" but **definition or instance**, and it has to be settled
before the handler is written:

- definition granularity — today's mechanism: `/rotate` and `/<name>` both mean "the definitions this token
  reaches", one clone for a name and priced by the sheet for a property scope, and two names over one
  definition cannot be eased apart;
- instance granularity — a name-keyed selection variable, so `/<name>` means exactly one instance.

**Ruled: instance granularity.** Accepting definition granularity would reintroduce the old limitation
through a side door — same keyframes, shared activation, shared segment easing — so
`animate-rotate-[0:0deg|100:45deg]/enter` beside `…/exit` could not carry two easing profiles even though the
instance model says they are two motions, and that is exactly the distinction the identity work exists to
make. The split that follows:

```text
definition identity → shared keyframes
instance identity   → which specialized definition this motion selects
```

So the base activation stays definition-keyed
(`--jumi-rotate-Z1WIhuk-animation-name` → `jumi-rotate-Z1WIhuk`) and segment easing adds an
**instance-keyed selection override** — the shape `--jumi-slot-<instance>-animation-name` or whatever the
carrier model prefers. The fan-out rule becomes:

| address       | reach                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| `/<name>`     | one instance — even when another instance shares its definition                                               |
| `/<property>` | every instance of that property on the element, named or unnamed; may produce several specialized definitions |
| unaddressed   | refused for 1.0                                                                                               |

Property scope is allowed to cost more, and that is not the same kind of cost as the refused form: it is
proportional to what the author explicitly asked for, where the unaddressed phrase silently cloned every
definition in the stylesheet.

### Call

> **Accept the syntax with instance-precise specialization.** Preserve the definition-keyed base activation
> and add an instance-keyed selection path; keep property scope fanning out across instances; keep
> unaddressed refused for 1.0; make the destructive shape emit nothing rather than warn; then measure cascade
> placement against `base motion activation < instance specialization selection < aggregate consumption` and
> verify: two names over one definition take different easings, one instance is specialized while its sibling
> is untouched, property scope reaches every same-property instance, scalar easing still supplies the
> fallback, nothing leaks to elements without the phrase, and Studio export/replay parity stays exact.

**Shipped: the destructive shape emits nothing** (independent of the feature, and before it). This supersedes
the earlier "ship the warning" ruling, and the distinction is the reason:

```text
destructive acceptance     the candidate compiles, writes an invalid timing value,
                           and the animation shorthand dies
silent non-emission        the candidate is unsupported, emits no rule, and nothing dies
```

The second is what a framework does with a candidate it does not recognize, so Jumi answers the same way: a
phrase on a part the `animation` shorthand carries returns `{}` from the control — no declaration, and no
record either, because with no address there is no intent to report on. `carriedByShorthand` derives the
guarded parts from `separateParts`, so the guard cannot drift from the split it depends on, and it runs
before the modifier is read, so it holds at every address. Measured: the candidate leaves no rule and no
declaration in the output whatsoever, while `animation-timing-function-ease-out` still writes its scalar.

The grammar that follows is strict without needing documentation about clone counts:

```text
animation-timing-function-ease-out                  valid — scalar control
animation-timing-function-[cubic-bezier(…)]         valid — scalar arbitrary control
animation-timing-function-[0:ease-out]/reveal       valid — segment easing, addressed to a motion
animation-timing-function-[0:ease-out]/rotate       valid — segment easing, property-scoped
animation-timing-function-[0:ease-out]              unsupported shape, ignored
```

**And warnings stay where acceptance proves the author wrong.** An unsupported candidate is not a diagnosis
waiting to happen: Jumi has no address, so it has nothing to act on, and explaining the shape would be a
second language for the same candidate. The existing name warnings are the contrast — there the build _did_
accept a name and can prove it cannot be addressed.

Asserted and falsified: `controls.test.ts` (nothing at every address, scalar untouched, the three separate
parts deliberately out of scope), `behaviour:check`'s arm `h`, which reads no animation at all the moment the
guard is removed, and the emission check above. The addressed forms are where the segment-easing path will
attach, and that is the one thing the guard is written to leave room for.

## 2026-09-15 — the per-instance link layer: closed, with the residual recorded as intentional

**Removing the link for the seven shorthand-carried parts — accepted.** A name reached those parts through a
slot-keyed variable filled on the naming rule: ten declarations and ten registrations per named instance, to
bind a word the rule publishing the value already knew. The hoist is published on that rule, so it is
element-local, and the name can go in its value instead. Measured: 85,083 → 81,850 bytes on the recorded
corpus (55 → 41 slot registrations, 20 → 6 fills), 34,417 → 27,760 on the probe fixture, and no behaviour
change across the six naming arms in either candidate order. The demo corpus is unchanged because it names no
motion — the cost only ever existed for a named instance. The `--jumi-slot-<slot>` registration stays, so
descendant isolation is untouched.

**The residual for `animation-composition`, `animation-range` and `animation-timeline` — kept.** Their
aggregate emission is selector-grouped rather than rule-local, so their indirection carries a real locality
boundary. Putting those declarations into each activating rule would change the emission topology rather than
remove a hop, and it moves the view-transition emission with it. Two and a half kilobytes on the fixture is
not worth that blast radius.

**Falsification over text assertions — the pattern to keep.** The new naming arm is worth more than the byte
saving: with the assignment removed, the three controls read `replace` / `0%` / `auto` while the animation
still runs. A text snapshot cannot see that, and no other harness here would have caught it.

### Call

> **Close the refactor here.** Further rule-local emission is deferred to its own research item, not a
> continuation of this work: _can `separateParts` be emitted rule-locally without duplicating excessive CSS,
> breaking VT replay, changing selector grouping, or reintroducing element-crossing name leakage?_ That
> deserves a probe.

## 2026-09-15 — addressing and motion instances: closed for 1.0

The instance refactor has paid for itself twice over: it is what made the address collision fixable, and
the two defects the fix exposed were both instance-conflation bugs of the kind the refactor exists to
remove. Ruled as follows.

**Structural precedence — accepted.** A control's token is classified against a static vocabulary
(`propertyVariables` plus `effectKeyframes`): a known structural token reads the property scope, anything
else reads the label namespace. The static part is the important part. Classifying against "what this
stylesheet animates" would make `/scale` mean one thing on a page that animates scale and another on a
page that does not, which is unacceptable for an address that authors write down. Measured on the
distinguishing corpus, the collision resolves `1s, 1s` → `1s, 0.4s`: the author's own control wins, so the
collision is resolved rather than renamed internally.

**Compound labels name the whole compound — accepted.** `animate-filter-blur-[4px]/foo` beside
`animation-duration-500/foo` is one `filter` motion at `0.5s`: compound atomicity preserved, and the label
is still useful. The earlier "a member label is discarded" conclusion came from an invalid candidate
(`animate-filter-blur-4` is not a candidate at all — `type: 'length'` against the blur theme), so it never
measured Jumi. `../research/addressing.md` finding 4 and `../research/addressing-instances.md` both carry
the correction.

**One instance derivation — architectural invariant, kept.** No pass may independently reconstruct a
motion instance from activation/label state; all derivation goes through `instanceKeys`. Written up with
its two measurements in `../architecture/instances.md` and enforced by behavioural tests plus a source scan
that fails and names the offending file. This is the item to hold onto: it was always going to drift, and
the second defect was architectural rather than local — two passes answering the same question, one of them
wrong, and the wrong one only appearing to work because of the other bug.

**A broad "nothing reads this token" warning — rejected.**
`motion-safe:animate-fade-in/reveal` beside an unconditional `animation-duration-500/reveal` is a
legitimately latent control, not dead weight. Warnings stay where impossibility is statically provable, and
finding 2 (`contradictory same-address controls`) turns out to be one case that **is not**: two
unconditional control rules writing one variable with different values is also how two elements get
different timings — `animation-duration-300` on cards and `animation-duration-900` on a hero is one
stylesheet, one variable, two values, and no contradiction anywhere. It is provable only _within a single
rule_, which is rare enough to be a typo rather than a pattern, so the contradiction stays where it is
visible: on the element, which is Studio's side of the fence and not the finalizer's. Finding 2's measured
behaviour is unchanged (`1s`), and the reason it is not a rule is unchanged too: CSS guarantees nothing
about authored class order.

**Shadowed/impossible addresses — kept.** Reported rather than dropped, with the remedy in the message.

### Call

> **Consider the addressing/instance work closed for 1.0.** The gate is 17/17, the range checks 43/43, the
> Studio checks 48, and the new browser assertions cover the two failure modes directly — one name a property
> already owns, and candidate order deciding which name wins.

Next: revisit **segment easing**, which had to wait for a motion-instance model that would not contaminate
it. `../architecture/phrases.md` holds the constraint that shaped it: a keyframe's own
`animation-timing-function` cannot be driven by a variable, so per-segment easing is a property of the
keyframe itself. Now probed as a **phrase-valued `animation-timing-function-*` control** (ruled 2026-09-15
in favour of the suffix form, for public API coherence) — seven measurements in `segment-easing.md`,
including the two that decide the shape: the phrase must never reach the control chain (it kills the
animation outright), and the specialization must be selected in the control's own rule (written in the
motion's rule it leaks to every element animating that motion). Awaiting a ruling on the unaddressed form.

## 2026-09-13 — the hoisted shallow-shorthand representation: closed for 1.0

This is enough to close the hoist work.

The production implementation now has the important properties we wanted: the composition detector
reflects the shipped shorthand shape structurally, the slot publication variables are registered
non-inheriting alongside their activation names, `@apply`/variants/pseudos all follow emitted
activation rather than source candidates, and the authentic catalogue preserves **228/228 live
positions with zero differences** while cutting matched-style payload by **57%**. The stylesheet
growing about 10% is acceptable given the tooling/runtime wins measured.

The first flag is the only one I'd treat as process-significant: if `incremental:check` was being
skipped because `pnpm check` short-circuited earlier, make sure the CI output makes individual stages
visible enough that this can't be mistaken for "everything after `test:run` passed." Not necessarily
a redesign, just avoid a green-summary illusion when earlier failures prevent later checks from
running.

I would not require another manual 47s → 2.7s Inspector timing before landing. The authentic CDP
number reproduced within 1.7% of the spike, and the live-behavior diff is zero. That is strong enough
evidence that the production implementation is the same shape that produced the human improvement.
Re-check the Inspector manually after deploy as a confidence check, but do not block the code on it.

Annotating `aggregate-representation.md` rather than rewriting it was also the right call. The old
research was not "wrong"; it measured a different hoist and established the cost model that
eventually led to the better one. Preserving that history is useful.

### Call

> **Land the hoisted shallow-shorthand representation. Mark the representation investigation closed
> for 1.0. Keep the CDP/real-page measurement as a permanent regression path. Do not reopen carrier
> placement or element-local vectors unless a new platform primitive changes the constraints.**

And yes, once that is landed, return to View Transitions. We've done enough foundational work on the
animation core that we can explore them without carrying a known DevTools scalability defect
underneath the experiments.

## 2026-09-15 — the readable instance key, adopted with its boundary recorded

I took the recommendation, and making it permanent turned the probe's argument into an assertion that then
corrected it — which is what the assertion was for.

The naive readable order is dead on measurement rather than on taste. `--jumi-slot-<name>-<attribute>-<id>`
is not injective over Jumi's own vocabulary — `color` under `accent-color`, `width` under `stroke-width` — 50
collisions in the probe's enumeration, and none of them needs a crafted input: any name that ends where
another attribute's name begins produces one.

The shipped order is `<name>-<id>-<attribute>`, for named instances only; unnamed slots keep
`<attribute>-<id>`. It is readable, cheap and drift-free: canonical bytes 81,850 → 81,836 and
`properties`/`slots`/`publishEvents`/`keyframes` unchanged at 94 / 33 / 36 / 33. Diffed line by line the
snapshot is 22 lines out and 22 in, byte-identical once the two instance keys are renamed.

What the permanent assertion corrected: the id is hyphen-free but **not fixed-length** (`shorthash2('50')` is
`rI`), so it delimits without being unforgeable. A name crafted to end in another instance's id, on an
overlapping attribute, still absorbs. That is not reachable by accident, and not reachable without computing
another motion's hash first. I am recording it rather than paying for it: the two ways to close it cost
hyphen-free names or a reserved separator, and both give back what this shape bought.

### Call

> **Adopt `--jumi-slot-<name>-<id>-<attribute>` for named instances, with the counts unchanged and the
> residual documented in `instances.md` and asserted in `src/core/slot-key.test.ts`. Keep the adversarial
> corpus permanent — a corpus of generic samples reports no collisions in either shape, which is how a wrong
> order looks safe. Do not add a collision warning to the model yet: the diagnostic exists in the assertion,
> and instrumenting the writer for a case that needs a computed hash is not worth the bytes.**

## 2026-09-15 — the readable key is readable, not exact: probe a real boundary

The assertion did its job and disproved the property the shape was adopted for. `<name>-<id>-<attribute>` is
readable but not injective: an id is hyphen-free but not fixed-length, so a name whose tail is another
instance's id still absorbs its key. Adversarial and hard to stumble into, but the same class of defect the
hash was there to remove, and I will not freeze that into 1.0 after finding it — nor make "nobody will
compute another motion's hash" part of Jumi's correctness model.

No permutation of hyphen-joined pieces fixes it. The name is unbounded and hyphenated, the attribute is
hyphenated, the id is variable-length: joined only by `-`, the parse boundary is a function of the _contents_,
so some pair of contents can move it. The representation needs a boundary that is a fact about the _shape_.

Keep the `instanceKeys` and `linkedSlot` refactors and their regressions — they found real assumptions (a
prefix relationship that no longer holds, and a part guessed from a suffix rather than supplied, which made a
legal name silently stop the motion) and those stay fixed. Keep the behavioural gates and the topology counts
exactly as they are.

### Call

> **Do not accept `<name>-<id>-<attribute>` as the final vocabulary. Probe a genuinely delimited readable
> representation — preferably a length-delimited author name, which takes nothing away from authors — against
> the same adversarial full-vocabulary corpus. The acceptance criterion is strict: zero collisions _by
> construction_, which means a reader that is a left inverse of the writer, not merely zero ordinary
> collisions. Probe the encoding details too: what "length" counts, and Unicode.**

## 2026-09-15 — adopt the length-prefixed key: readable and exact at last

The probe gives us the property we were actually after: readable, exact, round-trippable, and with no reserved
author syntax. The result that decides it is not "no collisions in the corpus" but that
`decode(encode(x)) = x` held across all 366,360 triples — that is the right standard, and it is the one the
later shapes will have to meet too.

So the named key is `--jumi-slot-<length>-<escaped-name>-<id>-<attribute>`; unnamed slots are unchanged; the
length counts the **emitted** name in UTF-16 code units, which is what `.length` and `.slice` measure and what
the `foo.bar → foo\.bar` measurement proves is the text a reader actually has.

The extra recommendation is adopted as well, and it is the part that removes the last assumption rather than
merely narrowing it: `instanceKeys` parses the canonical key instead of reconstructing identity from the
activation base, so nothing depends any more on the shape of `attribute-id` or on an id's hyphens.
`linkedSlot` stays explicit about the part, and the round-trip corpus becomes a permanent unit test.

### Call

> **Adopt `--jumi-slot-<length>-<escaped-name>-<id>-<attribute>` for named instances, counting the emitted
> name in UTF-16 code units, with unnamed slots unchanged. Keep `instanceKeys` parsing the key rather than
> inferring it, keep `linkedSlot` explicit about the part, and keep the round-trip corpus as a gate. The byte
> cost is trivial beside the correctness win: this is the first version of the readable key I would call
> structurally exact before 1.0.**

## 2026-09-16 — close C on measurement, not on topology

The C.5 pass reported C closed with its falsification set green. It was not closed.
`animate-scale-[none]` beside `animate-scale-x-[5]` computed `1` where the pre-C.5 baseline computes
`5 1`, and every structural audit stayed green, because the regression is not a shape: every name was
still in the sheet and only computed style could tell.

The boundary is nobody's blunder in particular. A declined motion writes the property in its own
keyframe — that is what the native escape hatch _is_ — and a keyframe beats a rule, so it beat the
typed motion's candidate-owned substrate outright. Two execution models for one property met at a
boundary that had been argued from the topology, and the argument was wrong.

### Call

> **Fix the mixed boundary with a composition bridge in typed keyframes, not a runtime set and not an
> accepted regression. Baseline the declined whole beside a typed constituent against pre-C.5. If
> unchanged: close C definitively. If changed: fix only that mixed-execution boundary, re-run the C
> falsification set, then close.**

The bridge is pinned at `from` **and** `to`, and the pin is a measurement rather than a style. Naming
the property only at `to` makes it a second animation whose implicit `from` is the un-animated
underlying value, which composes to `1 + p(x(p) − 1)` — a quadratic that still looks like a curve.
That is precisely why it needed a curve to catch rather than a shape, and the record of the C.5 close
was amended rather than left standing.

## 2026-09-17 — the gate before D, and D.1 extracts shape only

The bridge is a release-critical invariant and nothing in the suite proved it, so C is not closed
until it is a gate. The arm is narrow and explicit rather than broad: the mixed sheet, the same sheet
with candidate discovery reversed, and the two bridge-shape curves — the from/to pinning failure
produced its quadratic while looking superficially valid, and no structural audit will ever catch
that.

It distinguishes three failure classes, which is the standard it was held to: with the bridge missing
the mixed arms fail **while the lone arms stay green**; with the pins missing both lone curves distort;
an ordering regression diverges the reversed arm. A gate that fails specifically enough to name the
architectural break is worth more than a broad one that only says something is wrong.

Two process findings are recorded with it, because both contaminated measurements before they were
caught: cross-commit browser comparisons must rebuild `dist` for each revision, and stash restoration
can resurrect superseded edits — always diff after a pop or apply.

### Call

> **85e68f4 stays — the declaration-order swap changes no semantics, passes all 68 arms both ways, and
> the snapshot records the chosen form, so it is not worth churning over provenance. C is closed. D.1
> is structural extraction only: extract shape, do not migrate behaviour, with zero semantic/output
> change preferred and proven by a byte-identical snapshot plus 68/68 behaviour. If D.1 cannot extract
> the mechanism without changing emitted CSS, it is extracting too much at once.**

Held to that: D.1 moved exactly one facet into the family declaration — the whole-value decomposition,
the only family-shaped data there is — and derived the substrate and the bridge in the core rather
than handing families two functions that could not change behaviour. The snapshot is byte-identical,
the 68 arms are unchanged, and `src/core/index.ts` no longer contains the `scale` token outside its
comments. Phrase migration, nested composite recursion, filter/function reshape, transform
decomposition and attribute-wide conflict policy are separate evidence tracks and were left alone.

## 2026-09-17 — transparent aggregate batching is closed, and definition identity is split

The offset-aggregate research asked whether one `@keyframes` could carry several constituents with the
authored values living outside it in element-scoped buckets. The answer narrowed twice. Sheet-level
equality of timing writes was proposed as proof that two constituents share a program, and then
falsified: a sheet can write both component rungs identically while the element carries only one of the
controls, so production resolves two clocks and a batched instance resolves one — measured at 250ms and
500ms in `scripts/research/batching-eligibility.mjs`.

Two negative existence claims survived that falsification, and they are the wrong thing to build on.
"A sheet with no constituent-addressable rung" is not semantic proof; it is proof about what the
compiler happened to see. Jumi's control model is cascade-first, so a constituent rung such as
`--jumi-translate-x-animation-duration` is meaningful precisely because **any** CSS source can establish
it — an inline style, an authored rule, a dynamically changed variable — whether or not a utility in the
compiled sheet writes one. The per-leaf representation stays live under all of them because the timing
chain is still resolved per constituent. A batched instance has already collapsed two clocks into one
and cannot respond. That is an optimization changing observable behaviour under a supported part of the
architecture, and being conservative about it would not repair it.

The same round produced a second, independent finding on the path D.2 is about to build on, and it is
what makes the identity correction load-bearing rather than terminological. A typed **constituent** emits
its definition under a name that carries no value — `jumi-scale-x` — while the body bakes the authored
value (`--jumi-scale-x: 5`). Two values of one constituent therefore collide on that name, and the first
candidate compiled wins: `animate-scale-x-[5]` beside `animate-scale-x-[7]` gives one definition, and the
`[7]` element settles at `5 1`; reverse the order and the `[5]` element settles at `7 1`. Measured, and
uncovered — every existing arm uses one value per constituent. The non-typed constituent path does the
opposite and always has: one value-free definition per channel (`jumi-backdrop-filter`, body reading
`var(--jumi-backdrop-filter)`) serving every value correctly. So the target shape already ships, one path
over, and the typed constituent is a value-free name over a value-bearing body.

### Call

> **Close transparent aggregate batching. The inline override arm proves that sheet-level absence cannot
> establish semantic equality, because constituent timing rungs remain live cascade surfaces even when no
> utility in the compiled sheet writes them. An optimization cannot erase that behaviour. Keep the
> aggregate work as research evidence, and possibly as a future explicit semantic mode, but do not use it
> to choose the production representation. Proceed with the per-leaf typed representation using
> value-free bucket-driven keyframes. Revisit definition identity before implementation: `(family, stop
set)` applies to aggregate definitions; a per-leaf definition must also include its ownership
> channel/program shape. The next production question is no longer "can we batch?" It is: can value-free
> per-leaf definitions replace authored-value-specific definitions without regressing phrases,
> whole+constituent ownership, segment timing, scroll/range, or the existing timing chain?**

Held to that, and the shape of what stands is worth stating plainly, because the detour cost real time
and paid for itself:

```text
definition reuse     yes — one definition, many elements, different values and clocks
value hashing        unnecessary
cross-element reuse  yes
automatic batching   no — closed, not merely deferred
per-leaf ownership   the general semantic model
cascade semantics    preserved
```

The identity correction is not cosmetic. Confirmed against the emitted sheet (`scripts/research/identity-collision.mjs`,
12 assertions): a **typed constituent** today has a value-free name and a value-bearing body, which is
exactly the combination that collides, so `(family, stop set)` read as "the name carries no value" would
have ratified a defect. A per-leaf definition's identity must include its ownership channel — `jumi-scale-x`
and `jumi-scale-y` are not the same definition and never can be, since a definition body names the leaf it
writes. The whole-value path and the legacy phrase path are the ones that still hash values into the name
(`jumi-scale-O` for `animate-scale-[2]`, `jumi-scale-P` for `[3]` — two definitions whose bodies differ only
in the value they bake), and those are what a value-free identity would actually consolidate.

Two smaller records, both from the same measurement: the legacy phrase path's duplication is **structural**
rather than incidental — its bodies are already value-free and read per-candidate slots, so two definitions
with the same stop set differ only in the slot names they read — and the typed constituent collision means
the arm `[7]` settles at `7 1` belongs in `behaviour-check.mjs` once the typed body reads its slot instead of
baking the value. Until that fix lands, the reading lives in the research book rather than in the gate, since
a gate arm that fails cannot be landed.

## 2026-09-17 — the typed constituent body contract is repaired, and gated

The collision was fixed first, as its own narrow correctness increment, before D.2 touches the same
contract. The repair is convergence rather than invention: the typed constituent now reads the
candidate's **endpoint slot** (`--jumi-scale-x-100`) instead of baking the canonical value into the
`@keyframes` body — the same element-local surface the composed-property representation has always read
for the same purpose:

```diff
-emitKeyframe(`jumi-${component}`, { from: substrate, to: { ...substrate, [leaf]: canonical } })
+emitKeyframe(`jumi-${component}`, { from: substrate, to: { ...substrate, [leaf]: css('var', endpoint) } })
```

so the returned rule carries the value (`--jumi-scale-x-100: 5`) and the shared definition reads it. One
definition, every authored value, each element resolving its own. The fallback is deliberately **absent**
rather than the resting leaf, because a frame animating `--jumi-scale-x` may not name `--jumi-scale-x` as
the fallback of the value it assigns to it — that is the cycle measured in the cross-element research.

The naming correction is recorded in the implementation comments rather than only here, because it is the
part that is easy to get wrong twice:

```text
value-free name     insufficient
value-free body     required
```

A stable-looking keyframe name is not deduplication while the body still holds candidate-specific data.

### Call

> **Land the collision repair first as a narrow correctness increment with its gate arm. Then resume D.2.
> Do not combine the bug fix and the second-family migration into one change.**

Held to that. `behaviour-check.mjs` section 17 is the permanent guard, and it asserts **both halves** so a
regression that trades one for the other cannot pass: one definition for two authored values (the reuse)
and each element resolving its own (the correctness). Re-hashing the value into the name would restore
correctness by giving up the reuse, which is exactly the move the section exists to refuse. It covers
`scale-x` and the `translate` prototype, and reversed candidate discovery. The section also carries its own
falsification — the pre-fix shape reconstructed by text, the device section 15 already uses — so the guard
tests this build rather than a remembered one: baking the first candidate's endpoint back into the body
collapses the second element to `5 1`. 73/73 contexts and carriers behave.

**The emitted output change is fully accounted for**, since a snapshot diff is where a repair like this
should be challenged. Three of the four hunks are one thing: the two carriers swapped position in the
sheet, which moves them in both aggregate selector lists as well. That is a property of the pipeline rather
than of this change — a carrier rule's position follows its declaration set, and adding _any_ declaration to
it flips the order, measured with a dummy declaration that reproduced the swap exactly. It is inert here:
the two rules' declarations are disjoint except `scale: var(--jumi-scale)`, written to the identical value
in both, which is also why all 68 pre-existing arms stay green. The fourth hunk is the intended
substitution. Bytes 99660 → 99709, and `themeResolution.literal` 221 → 222 — the latter is exactly the new
`--jumi-scale-y-100: 0.2` declaration, since that metric walks tween declaration values and not keyframe
bodies.

D.2 now starts from a baseline where "typed constituent definitions are value-free and reusable across
authored values" is independently true and independently gated, which is what makes the broader question
askable: can that per-leaf model support the second family and the rest of the typed execution surface?

## 2026-09-17 — instance identity travels as data, and the timing chain keeps its precedence

A **named** motion on a composite constituent stopped animating entirely — `animation-name: none`, zero
instances — and the first suspect was wrong. It looked like the typed-leaf migration; the arms that
reproduced it were `blur` and `skew-x`, which have no typed leaves at all. Bisecting `cee40e2..38412b5`
named `3b15b84` ("make the timing chain resolve from the component address first"), and the emitted diff
was unambiguous: the `--jumi-slot-<key>` hoist disappeared and the position read fell back to `none`.

The cause was a **coupling**, not a fault in either half. The pass recovered which _instance_ a composition
position belonged to by matching the **head** of that position's timing entry
(`^var\(\s*--jumi-slot-<count>-…`). So `component → slot → property → global` and _this position is instance
K_ were one fact, and `component`-outermost displaced the slot link: every position read as the
_definition_, no hoist was published, and the motion vanished. Taking the reorder as the repair would have
paid for an implementation constraint with cascade precedence — **ruled against**, and the two facts were
separated instead:

```text
component → addressed instance → property → global     the chain states precedence, and keeps it
the slot at each position, published as data           identity, matched as text, never parsed
```

`linkedSlot` and `referencedSlot` are **deleted** — this supersedes the 2026-09-15 call to keep `linkedSlot`
explicit about the part. The composition publishes the slot at each position (payload entry `slot`, in the
same publication as the lists it indexes, so the two cannot arrive out of step) and `hoist` matches it
against `instanceKeys`. Both sides are produced by `instanceText`, so identity is a comparison of identical
text and nothing is reconstructed from an expression's shape.

The edge that justifies carrying it structurally: a slot whose name was **refused** or **shadowed**
(`animate-rotate-45/scale`) keeps the name in its _key_ while publishing under its **definition** —
`rotate-3zWYd`, not `5-scale-3zWYd-rotate`. Slot key and published key are not always the same string, so
treating the instance key as canonical would have been wrong. `publishedKey` states the rule, and behaviour
arm `f` is what caught its absence.

Transport is staging-only by construction: read by `hoist`, skipped by the emission loop through an explicit
`TRANSPORT` set, asserted by a unit test that no `slot:` declaration ships, and reported by a warning when a
composition arrives with activators and no position list — a failure that would otherwise lose every address
silently while the motion still ran.

### Call

> **Instance identity must travel as model data; it must not be reconstructed from the shape or ordering of
> serialized CSS expressions. Preserve `component → addressed instance → property → global`; move the
> plumbing, not the contract. Keep the slot publication staging-only, and keep the no-shipped-transport
> assertion. Do not file the corner issue.**

Held to that. The **falsification triangle** closes the precedence question rather than relocating the
regression, and its three arms fail in different directions: a named constituent phrase animates, the
`/part` control **beats** the name, and the name is still reachable when no part control is set. A repair
that pushed the label outward passes the first and third; one that searched the chain for a slot-shaped
`var()` passes the first and second and is the coupling being removed. 79/79 contexts and carriers behave,
17/17 stages.

**Cost, measured rather than asserted.** The shipped stylesheet is **byte-identical** — `snapshot.css`
unchanged, `publishEvents` unchanged at 44/21 — because the entry rides the publication that already
existed. Only `rawBytes` and `stagingBytes` grow, by 2.1%, and both are deleted before anything ships, so the
recorded structure is re-recorded deliberately. The version that gave the entry a payload kind of its own
cost an emptied `@layer base` and +16 shipped bytes, which is why it is not the version that landed.

**A finding withdrawn.** The "corner" case that appeared to fail before the regression
(`animate-border-radius-top-left-…/drift`) does not exist. The attribute is `border-top-left-radius`, and the
spelling in the arm was never a candidate, so it emitted no rule and read zero instances at _every_ revision
including the pre-regression baseline; correctly spelled it animates, named and unnamed. It is a measurement
artefact rather than a defect, so it is withdrawn from the narrative rather than carried as a known-bad
baseline, and it is not filed.

D.2 lands **after** this, with its own acceptance book and no timing-infrastructure change mixed in.

## 2026-09-17 — D.2: the second family uses the mechanism without a branch of its own

D.2 was re-pointed at the question the first family cannot answer: does the value-free per-leaf mechanism
**generalize**, or did it work once? `translate` is the family that differs exactly where it can — a
`<length-percentage>` leaf is one interpolation branch, so `translate` declares **no** animation
canonicalizer, and a missing component takes the **identity** where `scale` repeats the first value
(`translate: 10px` is `10px 0 0`; `scale: 2` is `2 2 2`). Both are declared in the family, not in core,
which is what makes this a test of the extraction rather than of a second implementation.

The answer is **yes, and it is the useful kind of yes**: the second family needed **no branch in core**.
Asked of the source rather than of the browser, all six surfaces hold — `typedLeaves`, `typedExecutions`,
`typedLeafOf`/`canonicalizeLeaf`, endpoint emission, definition naming, and whole decomposition — core's
code contains no `'scale'` or `'translate'` literal, it reads the family declarations, and the whole
decomposition lives in the family (`translateLeaves`), not in core.

The acceptance set is `scripts/research/d2-acceptance.mjs` (`pnpm research:d2-acceptance`), and it tests the
five surfaces a definition strategy breaks silently if it breaks anything: phrases, whole+constituent
ownership, segment timing, scroll/range, and the timing chain — 14 assertions, all holding. It is derived
from the **authored** frames rather than from remembered readings.

Four of those assertions were corrected while grounding it, and each correction was a test-model fault
rather than a relaxed criterion: one-slot timing was asserting two duration positions that could not exist
(a single slot yields one position, so the expectation was unsatisfiable and read as a failure); the scroll
arm sampled at share `0`, **outside** the authored `25% 75%` range, where the resting value is `none` by
specification, and without forcing `linear` it measured the default `ease` curve (`26.0481px` at the
midpoint of a `10px -> 30px` line instead of `20px`); the same arm raced the frame boundary, because a
scroll-driven animation is updated **after** the `requestAnimationFrame` callbacks, so a read taken in the
first callback after setting `scrollTop` sees the previous position and a freshly loaded page reads its
resting value unless the wait is two frames; and the chain arm encoded the order that the repair above
withdrew.

The immediate value is negative evidence, and it is the strongest outcome available: D.2 did not surface a
translate exception. It surfaced an unrelated coupling in the shared infrastructure — the instance-identity
reader — which the previous entry repaired. A second-family test that finds nothing family-specific is
what says the family abstraction is holding.

### Call

> **D.2 passes architecturally. Land its acceptance book as its own commit, with no timing-infrastructure
> change mixed in. The family abstraction holds: the second family reuses the mechanism without a
> branch of its own, and the one defect the test surfaced was in shared plumbing rather than in the
> abstraction.**

## 2026-09-17 — D.3 opens on reach, and the surface is three comparable populations

D.3 is framed narrowly around **reach** rather than another family proof — how much of the constituent
surface can move onto value-free per-leaf typed execution before it hits cases that cannot move? Starting
from the latest census rather than another family, and keeping the standard: no family-specific core
branch, no value-bearing shared definition, no element-context inference, no regression to
cascade-addressable timing, and browser behaviour over textual resemblance.

The first increment is a census, and it had to be corrected twice before it was true.

**The unit is the pair, not the leaf.** `translate-x` is a bare component of `translate` and an _argument_
of `translate3d(…)` — the same token participates two ways — so a per-leaf verdict would have to be wrong
about one of them. Over (parent, component) pairs the surface is 324, of which 21 are parts of the
`animation`/`transition`/`*-timeline` shorthands: the motion machinery, not constituents, and excluded
from reach.

**The remaining 303 split almost exactly three ways**, which is the architectural result:

```text
reshape    97   ≈ 32%   typing requires changing the interpolation unit or static composition shape
value     107   ≈ 35%   the resting constituent already has a scalar-like typed representation
keyword    99   ≈ 33%   the leaf rests on an identifier -- none, auto, medium, normal, left
```

Reach is therefore **not** "mostly easy values with a few ugly cases": it is three comparably large
populations that succeed or fail for fundamentally different reasons. D.3 does not become "migrate the
remaining leaves"; it becomes three separate reach questions. The buckets are recorded as **census
morphology, not execution classes** — `reshape` does not mean "cannot be typed", it names the work
(typed function arguments, static function wrappers, nested composition) that D.1 deliberately deferred,
and `value` does not claim readiness either, since execution still depends on the authored grammar.

**The keyword bucket is a candidate list, and the browser measures a narrower property than the one the
first draft claimed.** `pnpm research:d3-reach` registers a leaf typed and compares the parent property's
computed value at rest:

```text
column-gap                 gap                   0px normal -> 0px        registration-unsafe at rest
aspect-ratio-width         aspect-ratio          auto 0 / 1 -> auto       registration-unsafe at rest
background-size-width      background-size       auto 0px   -> 0px 0px    registration-unsafe at rest
background-position-x-edge background-position-x 0%         -> 0%         registration-safe at rest
translate-x                translate             0px        -> 0px        registration-safe at rest
border-bottom-width        border-bottom-width   0px        -> 0px        not exercised
```

Registration-unsafety is **sufficient** to keep a leaf on the property/native path; registration-safety
is **not sufficient** to type it. It makes the leaf _eligible_ for the interpolation differential —
native against typed-leaf, for representative authored values — and only both stages together would
license `movable`. `background-position-x-edge` is why the gate is worth having: `left` is a keyword, so
the shape of the resting text says "unsafe", and `left` is also exactly `0%`, so the resting rendering is
identical and it is safe. Two fixture errors were found by getting them wrong first and are recorded in
the book: animating the leaf under test hides the resting value behind the animated one, and an arm whose
family computes its resting value to `0px` — a `border-*-width` with no border style — was never
exercised at all while looking exactly like a gate that held.

**A conflation corrected before it became durable.** `scale` needed a leaf `animationCanonicalizer`
because its leaf grammar admitted number/percentage spellings that native `scale` cross-interpolates and
the registered union does not. `translate` is the opposite example and the reason it was chosen for D.2:
`<length-percentage>` is **one** interpolation grammar, so no leaf canonicalizer should be required
merely to make `10px` interpolate. What translate needs is **whole decomposition** (`translate: 10px` →
`x = 10px, y = 0, z = 0`), which is a different mechanism. The distinction is kept explicitly:

```text
whole normalization / decomposition   ≠   leaf animation canonicalization
```

### Call

> **Keep D.3 open and keep the pair-based census. Do not commit the census with the wider verdicts:
> rename them to the narrower measured property — registration-safe / registration-unsafe at rest —
> correct the scale/translate statement so whole decomposition is not conflated with leaf
> canonicalization, and report reach over the 303 non-machinery pairs. Then land it as the D.3 census
> increment.**

> **The next increment classifies the keyword population using typed representations the model or the
> family itself justifies, followed by a browser differential for both resting and interpolation
> behaviour. Do not infer syntax from computed text merely to fill the table — a pair with no defensible
> syntax mapping is `unresolved`, not guessed.**

Landed as the census increment: `src/variables/reach.test.ts` for the morphology and
`pnpm research:d3-reach` for the gate. 17/17 stages, 79/79 behaviour.

## 2026-09-17 — the interpolation differential runs on three shapes, and starts with two fixture defects

### Call

> **One thing I would be strict about: the interpolation differential should compare against the native
> parent property behavior, not just check that the typed leaf itself interpolates smoothly. Otherwise
> you can accidentally prove the custom property is continuous while still changing the parent's
> semantics. […] I'd also avoid trying to classify all 99 keyword pairs in one pass. Take a
> representative set across distinct semantic shapes first.**

> **Do not try to resolve B or C before landing the increment. The book has done its job by proving that
> the first interpolation criterion itself has different observability requirements.** […] **Keep the
> other two unresolved. Next, classify the observation surface required for equivalence before expanding
> the keyword population.**

The four shapes named were an alias with a numeric equivalent, a sentinel with none, a keyword inside a
multi-part grammar, and a keyword whose computed value depends on sibling state. Three are asked here;
the fourth is the gate's `border-bottom-width` arm, which cannot be observed at rest at all and so is
recorded rather than decided (`pnpm research:d3-reach`, `not exercised`).

`pnpm research:d3-interpolation` holds the animation, steps it across a fixed wall, and reads the
**computed parent property** in both arms — native, and typed-driving-the-emission's-own-application:

```text
A  font-weight                  movable
     rest `normal` = 400 · far `bold` = 700 (engine's numbers)
     slot `--jumi-font-weight-eBE` applied by `var(--jumi-font-weight-eBE)` · candidates normal
     native 400 · 475 · 550 · 625 · 700
     typed  400 · 475 · 550 · 625 · 700

B  column-gap (rests at normal)  unresolved
     computed `normal` in both, but it RENDERS 0px in flex and 630px in columns — no context-free typed
     rest can stand in for it

C  background-position-x-edge   unresolved
     rest `left` = 0% · far `right` = 100% (engine's readings)
     longhand: `background-position-x: 100%` reads 100%, but `100% 0%` reads 0% — the pair is dropped,
     not honoured
     shorthand: `background-position: left 0% top 0%` reads 0% 0% (its own initial is `50% 50%`) —
     honoured there, and that is a different parent
     leaf   0% · 25% · 50% · 75% · 100%
     parent 0% · 0% · 0% · 0% · 0%
```

**The strict version of the question found two fixture defects that the loose version would have
published as results.** Reading a declaration out of the sheet with a first-match regex read a _staging
name_ — `--jumi-staging-animations---jumi-background-position-x` contains the declaration it stages — so
the fixture wrote `0%` where the model's pair belonged and the typed arm read a constant. That is a
textbook `registration-safe, interpolation-unsafe`, and it was nothing of the kind. The extractor now
selects the candidate containing the slot under test and throws when none does. The second: arm A's
registration was aimed at an unversioned slot name, when the emission's keyframes hand the property to a
**versioned** one (`--jumi-font-weight-eBE`). Both are in the book as comments and in the measurement
traps, because both are ways for a differential to manufacture the verdict it is looking for.

What each verdict now rests on:

- **`movable` (A)** is a curve identity, not a resemblance — five samples, `400 · 475 · 550 · 625 · 700`
  in both arms, with the rest and the endpoint numbers **read from the engine** (`normal` = `400`,
  `bold` = `700`) and the slot and application **read from the emission**. An arm that states `400`
  itself would be testing its own arithmetic.
- **`unresolved` (B)** is a reason, not a refusal: `normal` is context-dependent, so no context-free
  typed rest can stand in for it. Measured as the rendered gap, because the computed value is `normal`
  in both containers.
- **`unresolved` (C)** is a boundary the engine drew, not one inferred from the text: the model's
  composition for `background-position-x` is a **pair**, and the longhand drops it (`100% 0%` → `0%`).
  The leaf interpolates `0% → 100%` and the parent never moves. The pair _is_ honoured by the shorthand
  the model composes above it, which is a **different parent** — measured so the boundary is a reading
  rather than an attribution, and deliberately not asked to a verdict here.

**The finding that outlives the three verdicts: an observability class.** The result is not "one movable,
2 unresolved" — it is that a keyword case can stay unresolved for two _different_ reasons, and neither is
a failure of typed execution. So the relation the census unit needs is not only `(parent, component)`:

```text
(parent, component)  →  effective CSS observation surface

computed-value observable        font-weight
used-value / layout observable   column-gap (normal)
composed-property observable     background-position-x-edge — real consumer `background-position`
currently unobservable           the border-width fixture, until its family state shows the value
```

`font-weight → font-weight` is easy. `background-position-x-edge → background-position` is **not** the
longhand the component is named after, and that mapping has to come from the model's composition
structure rather than from guessing CSS property names. For the used-value class the consequence is
sharper still: comparing `getComputedStyle(el).columnGap` **cannot** establish behavioural equivalence
between two contexts that both compute to `normal` and render `0px` and `630px`. That surface has to be
measured geometrically (child B's start minus child A's end).

**`unresolved ≠ unsafe`** is unchanged, and worth restating where it is easy to lose: only a measured
divergence earns `unsafe`.

**Landed as the interpolation increment**, committed unchanged on the CTO's instruction: `font-weight` is
the first genuinely `movable` keyword pair, the other two stay `unresolved`, the two fixture defects stay
in the book as traps. `scripts/research/d3-interpolation.mjs` + its `package.json` entry + three memories;
17/17 stages, 79/79 behaviour. Nothing in `src/` or the emitted CSS is touched, so the shipped bytes and
the behaviour book are unchanged — this increment classifies, it does not move execution.

## 2026-09-17 — D.3.4: a pair does not name the surface that proves it

### Call

> **It is really: `(parent, component) → consumer surface → observation method → semantic context(s)`.** […]
> **I'd rename that last category from `currently unobservable` to something like `fixture-unobservable`.
> The property itself is observable; our current setup simply does not expose the constituent because
> `border-style: none` collapses the width to `0px`. We should avoid letting a fixture limitation become a
> semantic category.** […] **For used/layout-value comparisons, make the fixtures deliberately controlled.
> Fixed container dimensions, fixed font size where relevant, no viewport-dependent values.** […]
> **`movable` = justified typed representation + rest equivalence + interpolation equivalence + equivalence
> across every relevant semantic context. Anything less remains `unresolved`, not `unsafe`.** […] **I would
> also keep `background-position-x-edge` unresolved until the composed consumer test runs. Its current
> failure is actually a useful warning that the vocabulary hierarchy and the browser observation hierarchy
> are not necessarily the same thing.**

> **Build the model-backed observation descriptor and prove one example from each observation class
> end-to-end. Include semantic contexts where the browser gives a keyword context-dependent used meaning.
> Do not expand the keyword census yet.**

Then, on landing:

> **Land D.3.4 unchanged as its own commit. Close the observation-protocol increment. Open D.3.5 as
> population scaling: derive model-backed descriptors first, classify second, and never invent a consumer,
> syntax, context, or observation method merely to avoid `unresolved`.**

> **All three structural readings of the consumer have to agree: candidate table, composition graph, emitted
> application. If they do not, the book stops instead of measuring something nearby. Keep that invariant.**

> **An observation fixture must demonstrate that it can detect a known perturbation before its equality
> result counts as evidence.**

> **An unsafe verdict belongs to the tested representation, not automatically to the conceptual constituent
> forever.** So enough identity is recorded with the verdict to know _what_ failed: `background-position-x-edge`
> under a percentage representation is `interpolation-unsafe`, which is not the claim that the edge can never
> be typed in any form — a representation preserving the edge keyword semantics could change the answer.

`pnpm research:d3-observation` (+ `scripts/lib/observation.mjs` and its 14 unit tests) builds the descriptor
and runs one example per class. The descriptor has four fields, and three of them are the model's:

```text
pair              (parent, component) — the census unit
consumer surface  the property the candidate hands the value to
                  from the candidate table (`animate-column-gap` addresses `gap` with part `column-gap`)
                  checked against the composition graph (reachable from the component by walking
                  `dependencies` — the same relation the census counted its pairs from)
                  checked against the emission (the declaration the emitted keyframe hands the value to)
observation       computed · used-gap · border-box          declared per class
contexts          the semantics the claim covers             declared per class
```

```text
A  font-weight                  movable
     pair `(font, font-weight)` whole · consumer `font-weight` · method `computed` · contexts text
     native 400 · 475 · 550 · 625 · 700   typed 400 · 475 · 550 · 625 · 700

B  column-gap                   unresolved — and the harm is in one context of three
     pair `(gap, column-gap)` as a part of it · consumer `gap` · method `used-gap`
     contexts flex + grid + multicol; container fixed at 600px, font at 16px, canary `column-gap: 20px`
     flex     native `normal` used 0px    · typed `0px` used 0px    · canary 20px
     grid     native `normal` used 0px    · typed `0px` used 0px    · canary 20px
     multicol native `normal` used 298px  · typed `0px` used 290px  · canary 300px

C  the slot decides — 1 of 2 halves of one pair moves the consumer
     background-position-x-edge    registration-safe, interpolation-unsafe
        leaf moves 0% → 100%, the model's composition moves with it, the consumer never leaves `0% 0%`
     background-position-x-offset  movable
        native 0% 0% · 5% 0% · 10% 0% · 15% 0% · 20% 0%   typed identical
     pair `(background-position-x, background-position-x-edge)` · consumer `background-position`
     the emission applies `background-position: var(--jumi-background-position-x) var(--jumi-background-position-y)`
     and applies to `background-position-x` nothing — asked of the longhand, the composition is not a value

D  border-bottom-width          fixture-unobservable — no execution verdict, in either direction
     style none   `0px tall, computed 0px`
     style solid  `3px tall, computed 3px`
     the property was observable all along; the fixture was not
```

**C is the finding, and it is sharper than the differential could state it.** The composed consumer test ran,
and it separates the two halves of one pair under one registration shape in one composition: the _edge_ slot
is `registration-safe, interpolation-unsafe` while the _offset_ slot is `movable`. `left` is `0%` on the
longhand — the gate measured that — so a `<length-percentage>` looks justified; inside the shorthand's
four-value grammar the first value is an edge **keyword** and a percentage there is not a value, so the leaf
moves, the composition moves, and the user-visible property does not. That is the class's whole content: the
observation surface is what decides whether a representation is justified, and it is not the pair's name. It
is also why D.3.5 cannot classify at family level, or from syntax alone — **the slot remains the unit**.

**B is the other half of the same lesson, in the other direction.** The computed surface reports a
difference in all three contexts; the used value diverges in one and is unchanged in two. A `used-gap`
reading is only evidence if it can _see_ a gap, so every context carries a canary (`column-gap: 20px`) — an
observable that reads the same with and without one cannot distinguish `preserved` from `blind`. That is the
gate's own `border-bottom-width` lesson arriving in a second class, and it is now a standing rule.

**Three reader defects were found by getting them wrong, and each is unit-tested.** A first-match extractor
read Tailwind's own `font-weight: bolder` before Jumi's application and reported that the emission never
applies the property. A whole-value candidate writes both ends of its motion as `var(<frame>, var(<live>))`,
so a fixture that applies the _frame_ is measuring frame zero and calling it the rest — read as `0px tall`
for a border that should be `3px`. Resolving to the live slot beneath a frame then leaked the wrapper's `)`,
emitting `var(--jumi-border-bottom-width))`: an unbalanced pair in a declaration, which reads exactly like a
property that never resolves. Three shapes of one mistake — reading the emission's _text_ where its
_structure_ carries the meaning.

**The durable verdict vocabulary**, five values, with the two `unsafe` classes deliberately not collapsed:

```text
movable                 justified representation, rest preserved, interpolation preserved,
                        equivalence across every relevant semantic context
registration-unsafe     typing already changes rest semantics
interpolation-unsafe    rest survives, motion does not
unresolved              no defensible typed syntax mapping yet
fixture-unobservable    the fixture cannot see the constituent; no verdict, in either direction
```

`registration-unsafe ≠ interpolation-unsafe`: the first says the representation is wrong at rest, the second
says it is wrong in motion, and they point at different rescues (a reshape versus different syntax). The
book's longer phrase `registration-safe, interpolation-unsafe` is the same verdict as `interpolation-unsafe`
with its precondition stated, and the precondition is what makes the divergence attributable to motion
rather than to rest.

**D.3.5 is two passes, not a loop over 99 pairs.** First derive the descriptor population — `pair`,
`consumer`, `method`, `contexts`, typed representation — and mark anything the model cannot justify
`unresolved-descriptor`, without guessing. Then classify only where the descriptor is complete.

**Landed as D.3.4**, unchanged on the CTO's instruction: `scripts/lib/observation.mjs` (the descriptor and
the emission readers), `scripts/lib/observation.test.mjs` (14 tests, including the three reader defects),
`scripts/research/d3-observation.mjs`, the `research:d3-observation` entry, and three memories. No `src/` or
emitted-CSS change; 17/17 stages, 79/79 behaviour.

**The theme the three reader defects restate**, now spanning carriers, staging variables, emitted
applications and research tooling:

```text
when structure carries meaning, do not recover it from serialized text
```

## 2026-09-17 — D.3.5 opens on coverage, not classification

### Call

> **Scale the protocol, not the guesses.** […] The next useful milestone is not "all 99 keywords classified".
> It is something like descriptor coverage — `complete` / `unresolved-descriptor` — and classification
> coverage — `movable` / `registration-unsafe` / `interpolation-unsafe` / `unresolved` /
> `fixture-unobservable`. That will tell us whether the bottleneck is actually browser behavior, missing model
> metadata, or observation design. […] **If a large chunk lands in `unresolved-descriptor`, that is still a
> useful result. It means the model itself does not yet contain enough semantics to justify automated
> migration.** […] I'd also keep the unit exactly as it is now:
> `(parent, component, representation, consumer, contexts)`.

Pass one derives and stops. `pnpm research:d3-coverage` asks the **model** what it can justify for every
census pair — a class that addresses it, the consumer that class hands the value to through _this_ pair's
chain, and the typed leaf the model declares — and records where it stops and why. No browser, no compile, no
verdict: a pass that derived and classified together is the one that starts inventing things to avoid an
empty cell.

```text
pairs (the census unit)                        324
  machinery — reported, not counted as reach    30
  reach                                        294
    descriptor complete                          6
    unresolved-descriptor                      288
      the model declares no representation for the component   199
      no candidate addresses the pair                            89

descriptor coverage, in full — what the model can already carry:
  scale / scale-x        animate-scale-x        → `scale`      [<number> | <percentage>]
  scale / scale-y        animate-scale-y        → `scale`      [<number> | <percentage>]
  scale / scale-z        animate-scale-z        → `scale`      [<number> | <percentage>]
  translate / translate-x  animate-translate-x  → `translate`  [<length-percentage>]
  translate / translate-y  animate-translate-y  → `translate`  [<length-percentage>]
  translate / translate-z  animate-translate-z  → `translate`  [<length>]
```

**The bottleneck, read off the reasons: missing model metadata first (199), candidate coverage second (89),
and browser behaviour not yet — nothing measured has ever stopped at the engine.** That is the answer the
coverage pass exists to give, and it inverts the intuition the census invited: the keyword population is not
blocked by what the browser will refuse, it is blocked by what the model has not yet said.

Completeness is _exactly_ the declared-representation set restricted to served pairs, and that is asserted
rather than counted — `scripts/lib/observation.test.mjs` holds that a declared leaf whose pairs are not all
complete is a defect, so the pass keeps telling the truth as families are typed instead of needing its
numbers updated.

**Classification coverage is a citation list, not a re-measurement.** Pass two classifies; anything a landed
book already measured is quoted with its source and with the representation it was measured under, because a
verdict belongs to that representation and not to the constituent forever:

```text
scale-x/y/z          movable                declared `<number> | <percentage>`      d2-acceptance.mjs
translate-x/y/z      movable                declared `<length-percentage>`          d2-acceptance.mjs
font-weight          movable                proposed `<number>`                     d3-interpolation.mjs A
column-gap           unresolved             proposed `<length>`                     d3-observation.mjs B
background-position-x-edge    interpolation-unsafe   proposed `<length-percentage>`  d3-observation.mjs C
background-position-x-offset  movable                proposed `<length-percentage>`  d3-observation.mjs C
border-bottom-width  fixture-unobservable    proposed `<length>`                     d3-observation.mjs D
```

**Two findings about the population itself came out of deriving it.** A component can be composed by _two_
parents and a candidate serves one of them: `scale-x` is composed by `scale` and by `scale-3d`, and
`animate-scale-x` addresses `scale` — so `(scale, scale-x)` is complete and `(scale-3d, scale-x)` has no
candidate. Selecting by component alone made the second look like a broken descriptor instead of an unserved
pair, which is a different finding and a different piece of work. And 20 pairs are served at _two_ levels at
once; the nearest surface is taken as the motion's, and the alternative is recorded rather than dropped,
because a pair served twice is a fact the classification pass has to know.

**A reader limitation, recorded rather than reconciled.** This pass counts 30 machinery pairs by the parent
rule while the census reports 21, because the census's `reshape` check runs first and reads a _composed_
expression where this reader sees the identifier a composition module exports (`value: animationTimelineScroll`
— `property-model.mjs` reads the source, not the evaluated value). The difference is a property of the reader,
not a correction of the census, and it is written down here so the next reader does not rediscover it as a
discrepancy.

## 2026-09-17 — D.3.5 pass one lands, over one population

### Call

> **I would not land this exact D.3.5 pass yet.** The blocker is the unresolved 30 vs 21 machinery-pairs
> discrepancy, because it changes the denominator: the census has `324 - 21 = 303` constituent pairs and the
> D.3.5 reader had `324 - 30 = 294` reach pairs. **D.3.5 is supposed to scale the census. It should not
> silently operate over a different population, even if we understand roughly why.** […] **Make the D.3.5
> reader consume the same structural notion of machinery as `reach.test.ts`. Do not make one reader imitate
> the other's serialized output. Extract or share the structural predicate if possible.** We want
> `population() constituent count === census constituent count === 303`, and ideally **the exact set of
> machinery (parent, component) pairs matches between the census and descriptor reader** — not merely
> `21 === 21`, because that prevents two wrong classifications from cancelling numerically. […] **Do not
> change any descriptor verdict merely to make the totals agree.** […] Say **at population scale, the
> immediate bottleneck is model metadata and candidate coverage; most pairs do not yet reach the
> browser-classification stage** — and call pass two **classification projection for complete descriptors**,
> so that `descriptor completeness ≠ behavioral classification` stays visible.

**The disagreement was about the representation, not the rule.** The census evaluated the model and saw
`scroll(var(--jumi-animation-timeline-axis) var(--jumi-animation-timeline-scroller))`; a Node reader read the
source and saw the identifier `animationTimelineScroll`. The bucket order puts the reshape tests first, so the
depth test could not fire and **nine** pairs were counted as machinery:

```text
animation/animation-delay                      (a resting value that is itself a composition)
animation-range/animation-range-start|end
animation-timeline/animation-timeline-scroll|view
animation-timeline-scroll/animation-timeline-scroller|axis
animation-timeline-view/animation-timeline-axis|inset
```

Two readers, one model, two populations, each self-consistent.

**The fix is a structural resolver, not a shared number.** `scripts/lib/property-model.mjs` resolves a
composition module to the expression it builds — `css('fn'[, value[, fallback]])`, `join([…], 'separator')`
with the helper's space default, identifiers resolved within their own module, comments stripped
structurally before parsing, and an unknown shape **throwing** rather than returning something plausible. One
predicate, `bucketOf`, is consumed by the census and by the coverage reader, so there is no second copy to
drift.

**And the reader is pinned against the model it reads.** `scripts/lib/property-model.test.mjs` asserts that
**every one of the 624 entries resolves to exactly the value the plugin evaluates** — `String(entry.value)`
against `readExpressions().get(slot)`, entry for entry. That is stronger than sharing a predicate: it makes
the whole class of disagreement unrepresentable, whichever door it comes back through. The census keeps its
own numbers (324 / 21 / 303 / 97 / 107 / 99) and now also asserts that the source reader's parent set equals
the evaluated model's.

```text
pairs (the census unit)                        324
  machinery — reported, not counted as reach    21   the census's own 21, from the shared predicate
  constituent (reach)                          303   the census's own 303
    descriptor complete                          6
    unresolved-descriptor                      297
      the model declares no representation for the component   199
      no candidate addresses the pair                            98
```

**The bottleneck, in the CTO's phrasing, with the record it rests on:** at population scale the immediate
bottleneck is model metadata and candidate coverage — most pairs do not yet reach the browser-classification
stage. Browser behaviour has already been the limit _where a representation was proposed_: the
`background-position-x-edge` slot is `interpolation-unsafe` under a percentage, `column-gap` is
context-dependent, and the six complete descriptors were decided there.

**No verdict changed to make the totals agree.** The nine pairs moved _upward into the census's own reach_,
exactly as the census had always counted them; the sub-counts moved because the population did (199/98 rather
than 199/89) and are not treated as durable — the assertions hold the _shape_ (completeness is exactly the
declared-representation set restricted to served pairs, every incomplete pair carries a reason), so they keep
telling the truth as families are typed.

**Landed as D.3.5 pass one**, committed once the sets agreed: the composition resolver, `readExpressions`,
`readTypedLeaves` and `bucketOf` in `scripts/lib/property-model.mjs` with its declaration file; the
equivalence test in `scripts/lib/property-model.test.mjs`; `population`, `chainOf`, `servingCandidates` and
`describe` in `scripts/lib/observation.mjs`; the shared predicate and the population assertions in
`src/variables/reach.test.ts`; `scripts/research/d3-coverage.mjs` and its `package.json` entry; and these
memories. No `src/` behaviour change and no emitted-CSS change — 17/17 stages, 79/79 behaviour, and **one**
machinery set.

## 2026-09-17 — D.3.5 pass two: projection, and nothing else

### Call

> **The next move should therefore be pass two, but only as projection. I would not run new browser
> experiments yet.** Take the six complete descriptors and attach the already-established evidence […], and
> explicitly allow `descriptor complete / classification unresolved` if evidence is insufficient for a
> specific pair. At the same time, keep the proposed-only research results separate […] because those are
> useful evidence about potential representations, but they should not silently count as model coverage
> until their representation becomes declared. […] **Project behavioral classifications onto the
> descriptor-complete population without creating new representations or new browser evidence.** […] One
> thing I would preserve from this whole episode as a hard rule: **if two readers claim to describe the same
> model, compare their exact structural outputs, not just their totals.**

`pnpm research:d3-projection` measures nothing. No browser, no compile, no new representation, no new arm:
every verdict is quoted from a book that landed, with the source, the representation it was measured under,
and the scope of what was actually observed. The evidence lives in `scripts/lib/evidence.mjs` as **records,
not verdicts**, and both this pass and the coverage pass quote it from there — a citation list that lives in
two files is a list that will disagree with itself eventually.

```text
of the 303 pairs Jumi can describe structurally, 6 of 6 are behaviourally proven

  scale / scale-x|y|z         movable   declared `<number> | <percentage>`  §16's five composition curves
  translate / translate-x|y   movable   declared `<length-percentage>`      §17 + the D.2 landing record
  translate / translate-z     movable   declared `<length>`, `lengthOnly`   the D.2 landing record
```

**The scope column is the honest part.** `§16`'s five curve arms are **scale's**; for translate the standing
gate holds the _definition_ contract (§17) and the curve equivalence is the D.2 landing record, not a
standing arm. `translate-z` is a separate record because its declaration differs from its siblings' — a verdict
belongs to the representation it was measured under, and a family is not a representation. Every record says
which of the two kinds of evidence it is, so no row reads as "the gate holds this" when it does not.

**The pair is the key, and getting that wrong was instructive.** The first registry was keyed by component, and
the projection's own assertions caught it: it "covered" `(scale-3d, scale-x)` — a pair through a parent the
arms never animate, and one with no candidate at all, so it is not even describable. A verdict measured through
one parent says nothing about the same component through another; that is the same fact that made the pair the
census unit in the first place, arriving from the other direction. The assertions now compare the coverage
class and the projected set as **sets of pairs**, not as counts.

**Proposals stay out of coverage, and are named as the workstream:**

```text
font/font-weight                                movable
gap/column-gap                                  unresolved — `normal` cannot be held by `<length>`
background-position-x/…-edge                    interpolation-unsafe — the shorthand wants an edge keyword
background-position-x/…-offset                  movable
border-bottom/border-bottom-width               fixture-unobservable
```

All five are pairs in the population, all five stop pass one on `no declared representation`, and none of
them counts as coverage — the `proposed` class is never consulted by the projection. That is what makes the
next decision a decision: **199 pairs await a representation, 98 await a candidate**, and candidate coverage
without a justified representation only reaches the same dead end more often.

`classification unresolved` is a value in the report rather than a gap, so a descriptor can be complete and
behaviourally unproven without anything being invented to fill the row. The invariants that hold the pass
together: coverage holds only declared representations; the proposed class is disjoint from them; the
projection is total; and no record may answer for a pair whose descriptor is incomplete.

**The rule this episode leaves behind, recorded as a rule** — it arrived as the reason D.3.5 pass one was held
back, and it is cheaper to state than to rediscover:

```text
if two readers claim to describe the same model,
compare their exact structural outputs, not just their totals
```

`30 vs 21` was the shape that could have looked harmless while poisoning every percentage downstream, and the
assertion that now holds the line compares sets — the coverage class against the projected set as **pairs**, the
source reader against the evaluated model **entry for entry** — rather than counts.

**Not yet committed.** Working tree only: `scripts/lib/evidence.mjs` and its 8-test suite,
`scripts/research/d3-projection.mjs` and its `package.json` entry, and `d3-coverage.mjs` now taking its
citations from the registry. No `src/` behaviour change and no emitted-CSS change; 17/17 stages,
79/79 behaviour, and no measurement was taken to produce any of it.

## 2026-09-17 — D.3.5's diagnostic: the 199 are three different problems

### Call

> **After that, I would move to the 199 missing representations, not the 98 missing candidates.** But I would
> not attack those 199 as one migration queue. The next decision should be: **what representation metadata is
> missing, and how many of the 199 can be justified mechanically from the model rather than hand-authored
> family by family?** We already know the 199 contain three very different morphologies from the census […]
> So before adding declarations, I would project the unresolved-descriptor population back onto those buckets.
> […] So I would make the next increment **diagnostic before migratory**: `303 reach pairs × morphology ×
descriptor failure reason`. No new representation yet.

`pnpm research:d3-crosstab` is that map, and it creates nothing — no representation, no measurement, no verdict:

```text
  descriptor status       value  keyword  reshape   total
  ───────────────────────────────────────────────────────
  complete                    6        0        0       6
  no-representation          72       79       48     199
  no-candidate               29       20       49      98
  ───────────────────────────────────────────────────────
  total                     107       99       97     303
```

**The columns are the census's own totals**, computed from the same shared predicate, which is the tab's
cross-check rather than a coincidence: 107 value / 99 keyword / 97 reshape, and 303 constituent pairs. The rows
are pass one's status. The cells are therefore the join of the two passes, and a test asserts the one that
matters most — the `complete` cell must be exactly the coverage class in the evidence registry, pair for pair,
so neither pass can be the more generous of the two while both look internally consistent.

**Read off the counts, before any interpretation:** the largest unresolved cell is
`no-representation × keyword` (79), with `no-representation × value` close behind (72) and
`no-representation × reshape` at 48. The 98 missing candidates split almost evenly across the morphologies
(29 / 20 / 49), so "no candidate" is not confined to the awkward shapes either.

**What each column would mean for the increment that follows, stated in the ruling before the counts were
read** — and it is this, not the numbers, that decides the next move:

```text
value      a typed syntax plausibly derivable from what the model already carries — possibly a rule
keyword    D.3.4's observation protocol is the path, and the questions become surface and contexts
reshape    no declaration alone helps; the interpolation unit is D.1's decomposition work
```

The nuance the tab adds to the ruling's own guess is in the reshape column: those pairs split between a missing
representation (48) and a missing candidate (49), so reshape is _not_ uniformly an interpolation-unit problem —
half of it is the candidate table.

**Not yet committed.** Working tree only: `scripts/lib/crosstab.mjs` with its 5-test suite,
`scripts/research/d3-crosstab.mjs`, and its `package.json` entry. No `src/` behaviour change, no emitted-CSS
change, and no representation declared; 17/17 stages, 79/79 behaviour.

## 2026-09-17 — D.3.5's derivation: 41 of 72 value pairs close under one rule

### Call

> **After the cross-tab lands, I would choose `no-representation × value` as the next workstream. Not because
> it is the largest block. […] I would choose it because it has the highest chance of producing a reusable
> rule.** […] The next increment should be diagnostic again […] **whether a typed syntax can be derived
> mechanically** — and if yes, which syntax. […] **But do not infer from the resting string alone. The
> candidate grammar has to agree, otherwise we repeat the exact mistake D.3 has been designed to avoid.** […]
> **No browser classification yet. First prove whether the representation itself can be derived.**

`pnpm research:d3-derivation` does exactly that, over the 72 `no-representation × value` pairs, using two
things the model already carries: the leaf's **resting value** and the **grammar of the candidate that serves
it** (`readCandidates().types`). The rule is their agreement, and the agreement is an **assertion** — a
proposal may only name types its candidate declares, so the mistake the ruling warns about cannot pass the
suite.

```text
the workstream: 72 pairs (no-representation × value)

  mechanically derivable     41   every type has a spelling and one admits the rest — the rule closes
  ambiguous grammar          29   a type with no spelling, or two families at once — a decision
  needs normalization         0   the rest would have to be canonicalised into the grammar
  no defensible rule          2   the rest is a keyword no type holds
```

**The rule needs one mapping, and the model already demonstrates it**: `length → <length>`, `percentage →
<percentage>`, `number → <number>`, `integer → <integer>`, `angle → <angle>`, `color → <color>` — six of the
candidate vocabulary's eight names. `scale`'s existing declaration (`<number> | <percentage>`) is the worked
example of the mapping and of the one union the spec treats as a single grammar. The two names left over are
the whole cause of one ambiguity class: **`any` would be `syntax: "*"`, which is permissive and does not
interpolate, and `<position>` is not a syntax component at all.**

```text
mechanically derivable — the proposals, by syntax
  <length>      22   box-shadow's offsets and blur, border-radius corners, text-shadow offsets, …
  <color>        8   background-color, border-color, outline-color, box-shadow-color, …
  <percentage>   6   the `-offset` halves of background-position, object-position, offset-position
  <number>       3   rotate-x/y/z
  <integer>      1   math-depth-add
  <angle>        1   rotate-angle

ambiguous grammar — each one a decision, not a derivation
  23  `any` is in the candidate's grammar (margin, padding, flex-grow, gap's row half, …)
   4  `<number> | <length>` is two families: the model records for `border-image-outset` that a number there
      is a multiple of the border width, so the two spellings are not one grammar
   2  `<position>` is not a syntax component (transform-origin-x/y)

no defensible rule — named, not summarised
  background/background-clip    rest `border-box`   background/background-origin   rest `padding-box`
```

**Two shapes the rule had to be taught, and both came out of the data rather than from the string.** A bare
integer literal is a `<number>` _and_ an `<integer>`, and `0` is a `<length>` too — so the _shape_ answers with
every reading it can support and the _grammar_ decides which one is meant. That is the ruling's rule made
operational: `0` under `[length | percentage | any]` and `0` under `[number | length]` are the same string and
different derivations. And a union of two families is not a derivation even when every name has a spelling: the
same text means different things in each branch, which the model records for `border-image-outset` and which
`typed-leaves.ts` records for unions generally ("a union interpolates only between two spellings of the
**same** component").

**The `needs normalization` bucket is empty, and that is a result.** Every resting value that fits its grammar
fits it as written; the ones that do not fit cannot be written as a syntax at all. The bucket stays in the
table, at zero, because it is the one that would open if a resting value were re-expressible in the grammar by
a canonical transform — `scale`'s `scaleFactorToNumber` is the mechanism, and nothing in this cell needs it.

**What this does not license.** A derived syntax is a **proposal**, not a verdict: it still has to pass the
observation protocol — rest, then interpolation, then every relevant context — before anything moves. The
descriptor and the classification remain two passes, which is the whole reason this one is allowed to be a
diagnostic.

**The next decision, with both sides counted.** The 41 are one rule away from being model metadata; the 29 are
a _narrowing_ decision the model cannot make for us (do the `margin`/`padding` motions stop accepting `any`?);
the 2 are keyword rests that belong to the observation protocol or to nothing.

**Not yet committed.** Working tree only: `scripts/lib/derivation.mjs` with its 6-test suite,
`scripts/research/d3-derivation.mjs`, and its `package.json` entry. No `src/` behaviour change, no emitted-CSS
change, no representation declared, no browser reached; 17/17 stages, 79/79 behaviour.

## 2026-09-17 — D.3.5's third pass: the 41 derived representations, validated in a browser

### Call

> **"Validate the 41 derived proposals by rule."** […] If we immediately write those 41 into `typedLeaves`, we
> would turn a grammar inference into production semantics before proving that registration and interpolation
> preserve the browser behavior. […] **"How many of the 41 mechanically derivable representations are also
> behaviorally equivalent?"** […] I would leave the 29 ambiguous cases entirely alone for now. […] **Commit
> the 72-pair derivation diagnostic unchanged. Do not promote the 41 into live typed metadata yet. Next, run
> those 41 model-derived proposals through the established observation protocol, generated wherever possible.**

`pnpm research:d3-validation` is that protocol, generated end to end: 41 pairs × 2 magnitudes = **82 arms**,
41 Tailwind compiles, 42s, no hand-written fixture anywhere.

### What each arm is made of

Everything except one probe per syntax comes out of the emission — the rest the registration has to stand in
for (`restOf`), the frame the motion goes to (`framesOf`), the surface the pair is read on and the wiring that
hands the value there (`applicationOf`), and the slot the leaf actually is (`pinningOf`, which follows the
sheet's own compositions rather than the first `var(` it sees). The probe is the arm's only authored input, and
the test suite asserts each one is a value its own syntax admits *by the shape reader's judgement*, so an arm
cannot test a representation against a value the representation does not cover.

```text
rest differential  →  native-vs-typed interpolation  →  contexts  →  verdict

movable                31
registration-unsafe     0
interpolation-unsafe    1
fixture-unobservable    5
unresolved              2
blocked-by-emission     2
```

**Every exclusion, with the measurement behind it:**

```text
no computed form        4   mask-border-outset/mask-border-outset-{top,right,bottom,left}
                            Chromium computes nothing for `mask-border-*` — `''` with and without motion
no native baseline      2   rotate/rotate-x, rotate/rotate-y
                            `rotate: 0deg -> 2 0 1 0deg` is one form to the other and the engine declines,
                            so there is nothing native to compare the typed arm against — the typed arm
                            *does* move, and `unresolved` is the honest class for "nothing here decides it"
constituent invisible   1   rotate/rotate-z
                            scaling the z axis does not change `0 0 2 0deg` once normalised to `0deg`
```

**`blocked-by-emission` is a class of its own, added by the ruling, and it is outside the four census
classes on purpose.** `offset-anchor-x/…-x-offset` and `offset-anchor-y/…-y-offset` were never tested:
their application composes to `center 0 center 0`, which the property rejects, so the pair reads `auto` with
the arm's declaration and with none at all. Production does not currently produce a valid consumer value
for them — that is an emission defect with its own increment, and `unresolved` would have filed it inside a
workstream that does not own it.

**And one divergence that is not a representation finding at all.** `math-depth/math-depth-add` measures
`interpolation-unsafe`, and the honest reading is larger than the verdict:

```text
resting leaf     0
emitted motion   add(0) -> add(2)
proposed syntax  <integer>
```

The moving thing is an argument inside `add(...)`, not the scalar leaf the resting value suggested — so the
interpolation unit is **not** the leaf this pair was bucketed as. That is **reshape**, D.1's subject, and it is
recorded here as a falsification of the census bucket rather than as a defect in the emission: *resting-value
morphology alone cannot always identify the interpolation unit*. The test is the model's own `FUNCTION`
pattern over the emitted frames, not a list of properties, so it generalises past `math-depth`.

**`registration-unsafe` is 0 by construction, and that is a result rather than a gap.** The syntax came from
the resting value's own shape, so the rest is inside the syntax the derivation proposed — and the reach gate's
`registration-unsafe` belongs to the *keyword* population, where the rest is a keyword and the grammar is a
promise. The pass measures the rest anyway: the emission's rest is read from the sheet rather than assumed from
the model, and the two disagreeing is a reader defect it **fails** on rather than a finding it reports.

### Four traps, each found by the arm disagreeing with itself

- **A probe is also a class name.** `rgba(0, 0, 255, 0.5)` split into four class names, the element matched
  nothing, every `var()` was invalid at computed-value time and the consumer fell back to its initial value —
  so 24 arms reported invalid readings that agreed, five of them as `movable`. The `<color>` probe is
  `#0000ff80` now, and the suite asserts no probe carries whitespace.
- **A fixture that forgets the emitted sheet reads `none` and agrees.** The first run omitted it and produced
  27 `movable` verdicts from two invalid readings each. Two arms that never moved are one reading, so it is now
  a **hard failure**: a flat native series *with* an identical typed series exits non-zero.
- **The one-value spelling makes the arm motionless.** `-[2]` sets the leaf's *live* slot to the target, so the
  application's frame reference wins and the leaf drives nothing; the phrase form `-[0:<rest>|100:<probe>]`
  keeps the live slot at its rest and is the only spelling under which the leaf is the source of truth.
- **The report is part of the instrument.** The assembler returned an object per verdict while the tally
  compared strings, so six exclusions printed as `[object Object]` and vanished from the counts — a smaller
  population that looked like a result.

### What this does not license

Nothing is declared and nothing is promoted: `typedLeaves` is untouched, and `movable` here means the derived
representation held at rest and through the motion, at both magnitudes, for the values the emission animates
this pair to. An unsafe verdict belongs to **the tested representation**, not to the conceptual constituent
forever. The two cases that are findings are not promotion candidates and not this workstream's work either:
`math-depth-add` is a **reshape** misclassification, and `offset-anchor`'s application does not compute at all.

### Next, in the ruling's order

```text
1. land the validation research book as its own commit          ✓ this increment
2. land the gate/single-build-owner change separately           its own commit
3. production increment: declare only the 31 movable pairs      guarded by evidence
4. permanent gate: a declared typed pair must have a movable evidence record
   for that exact pair and representation — so nobody later "rounds up"
   a sibling because the family looks similar
5. math-depth-add: falsified `value` bucket, moved toward reshape work
6. offset-anchor x/y: reproduce the invalid composition, determine the intended
   grammar, fix the emission, add a permanent behaviour arm, rerun validation
```

Steps 3 and 4 are one decision and two commits: the declaration, then the guard that makes the next
declaration as expensive as this one. Steps 5 and 6 leave the D.3 path entirely — they are the two places this
pass found real defects standing behind a representation question, and neither is fixed by choosing a syntax.

**State at the time of writing.** Working tree only: `scripts/lib/validation.mjs` with its 16-test suite,
`scripts/research/d3-validation.mjs`, and its `package.json` entry. No `src/` behaviour change, no emitted-CSS
change, no representation declared; 17/17 stages, 79/79 behaviour.

## 2026-09-17 — D.3.5 · the accounting correction, and the evidence a declaration has to name

### Call

> **"If `math-depth-add` has been reclassified as 'the interpolation unit is actually inside `add(...)`,' then it
> should not remain `interpolation-unsafe`. We did not prove that its typed representation interpolates
> incorrectly. We proved that the proposed representation was aimed at the wrong unit."** […] **"That keeps the
> evidence honest. `math-depth-add` falsified its morphology, not its interpolation behavior."** […] **"the
> permanent guard should be stronger than 'every declaration has some movable evidence.' Make it exact."**

### The accounting, corrected

```text
movable                 31
registration-unsafe      0
interpolation-unsafe     0
fixture-unobservable     5   mask-border-outset ×4 · rotate-z
unresolved               2   rotate-x/y — no native baseline
blocked-by-emission      2   offset-anchor x/y
reshape-required         1   math-depth-add
                        ──
                        41
```

`reshape-required` is a class of its own rather than a soft note on an unsafe verdict, and it is decided **before**
the interpolation differential in `verdictOf`'s precedence — after the canary and after the rest, and before the
series are compared. The order carries the argument: a unit the syntax cannot name makes "does it interpolate the
same?" the wrong question rather than a failed one, so a rest that does not survive the registration is still
`registration-unsafe` (the test pins that) while an expression unit is `reshape-required` even when the series also
disagree. Two tests cover it, and the class is in the vocabulary with its reason attached rather than in a comment
beside it.

### The evidence a declaration has to name

`pnpm research:d3-validation` now writes **`scripts/validated-representations.json`**: one record per pair, with the
pair, the candidate, the consumer, the **syntax**, the **initial value**, the number of magnitudes actually
exercised, and the verdict. It is data — written by a research book, read by a unit test — and `src/` never imports
it, so nothing in production depends on the pass that produced it.

Two fields are there because a declaration can be compared against them **exactly**, which is what the ruling's
guard needs: not "this pair has some evidence" but "this pair has a `movable` record whose representation is the
representation that shipped".

And the arms themselves changed one thing: when the model declares a component, they register **that** metadata
rather than the proposal, and a declaration that disagrees with the proposal is a **failure** rather than a second
measurement. That is the promotion proof — the research run proved the proposal, and the rerun proves that what
landed in `typedLeaves` is the same thing that was validated. Before the promotion there is nothing declared, so
this is inert; it exists now so the promotion commit needs no research edit of its own.

**State.** 41 records · 31 `movable` · 18 tests in `validation.test.mjs`. No `src/` behaviour change, no emitted-CSS
change, no declaration; 17/17 stages, 79/79 behaviour.

## 2026-09-17 — D.3.5's promotion, and the route as part of the evidence identity

### Call

> **"Do not merely duplicate the four corner declarations under every serving attribute. Change the research and
> promotion model so route is part of the evidence identity, then regenerate the declarations from that model."**
> […] **"per-route validation, 30 resulting declarations, guard keyed by route."** […] **"for every promoted
> (parent, component) pair: every serving route that can execute that pair must either have matching movable
> evidence and receive the declaration, OR carry an explicit non-promotion reason."**

That is what landed. The evidence record is keyed `(parent, component, consumer)` — a **route** — and the map is
generated from it rather than from a pair's first serving candidate.

### What the collapse was

`describe()` took the first result of `servingCandidates`, which was indistinguishable from "the only one" while
every pair had one route. The four `border-radius` corners are the first batch where that is false: each is served
both through the shorthand (`animate-border-left-radius`, attribute `border-radius`, the corner as a part) and
through its own property (`animate-border-bottom-left-radius`). Which one came first is alphabetical order, and it
put three corners under `border-radius` and the fourth under its own property — an asymmetry with no architectural
meaning.

**The consequence was not cosmetic.** `animate-border-left-radius` addresses `border-radius` with
`border-bottom-left-radius` **and** `border-top-left-radius` as parts. Registering the first and not the second
leaves one motion half-typed: one leaf interpolating, its sibling stepping, and the property reading a composition
whose two halves disagree. A registration keyed on one route is a silent failure waiting for the other route to be
used.

### What changed

```text
plans()        one plan per route, not per pair        41 pairs → 51 routes
artifact       one record per route, with consumer     51 records
declarations   generated from movable routes           36 leaves over 19 families
               of which the batch is 30 — the four corners under both families
guard          keyed (pair, consumer, syntax, initial) exact, both directions
```

The guard is the part worth stating precisely, because it is what the ruling asked for rather than what was easy:

- every `movable` route admits a declaration **under that consumer**, with **that syntax** and **that initial
  value** — so an edit after the fact to something the browser never saw fails;
- a key whose records include any non-`movable` route is **refused**: one registration serves every route through
  it, so it is only as good as its worst one;
- a route the pass could not decide (other than through a refused probe) must be **undeclared**, named rather than
  counted;
- and the pass itself refuses to run quietly past a route: its population is built from `routesOf`, so a serving
  attribute that has no record cannot exist — a future pair with three routes gets three measurements or three
  written reasons.

### Two defects the correction exposed, both real

`readBareEntries` only accepted **unquoted** family keys, and prettier's `quoteProps: consistent` quotes every key
in an object once one needs it. So the moment `background-position` joined `scale`, the reader silently returned
**zero** leaves — the map was correct and the reader could no longer see it. It accepts both forms now, which is
the general statement the file always needed.

And the pass's population filter read `status !== 'unresolved-descriptor'`, which means "the model declares a
representation for it" — so widening it to include declared pairs promptly *dropped* every pair that is still
undecided, taking `mask-border-outset`, the rotate axes, `math-depth-add` and the two `offset-anchor` pairs out of
a pass whose job is to keep deciding them. Measured: the population fell to 37 pairs and the tally lost every
exclusion it had found. The filter is `reason !== 'no candidate addresses the pair'` — "the model serves it" is
what a validation pass needs, not "the model has already decided it".

### The rerun

`pnpm research:d3-validation` now registers the **declared** metadata when the model carries it, so the run
measures what shipped rather than what was proposed, and a declaration that disagrees with the proposal is a
failure rather than a second measurement. After the promotion the rerun produced a **byte-identical**
`scripts/validated-representations.json` — 36 `movable` routes of 51, the same five `fixture-unobservable`
(`mask-border-outset` ×4, `rotate-z`), the same two `unresolved` (the rotate axes), the same two
`blocked-by-emission` (`offset-anchor` ×2) and the same one `reshape-required` (`math-depth-add`).

```text
51 routes over 47 pairs

movable                36   of which the batch's 35 admit 30 declarations
registration-unsafe     0   by construction, and measured anyway
fixture-unobservable    5   mask-border-outset ×4 · rotate-z
unresolved              7   rotate-x/y (no native baseline) · 5 union routes this pass cannot probe
blocked-by-emission     2   offset-anchor x/y
reshape-required        1   math-depth-add
```

**State.** 17/17 stages, 79/79 behaviour, 477 unit tests, the emission snapshot re-recorded (one registration
added: the fourth corner under its own family). `math-depth-add`, `offset-anchor` and the rotate axes remain
undecided and uncommitted to any representation, as ruled.

## 2026-09-17 — correction to D.3.5's validation: `math-depth-add` is reshape-required

### Superseded

The pass-three entry above records `math-depth-add` as **`interpolation-unsafe`**, and that was the conclusion the
measurement supported at the time: the registered leaf never left `0` while the property read `0 · 1 · 1 · 2 · 2`.
That entry stands as written. This one corrects it, because later evidence changed the *reading* rather than the
measurement:

```text
resting leaf     0
emitted motion   add(0) -> add(2)
proposed syntax  <integer>

old reading    the typed representation interpolates incorrectly
actual reading the representation was aimed at the wrong unit
               — the moving thing is an argument inside `add(...)`, not the scalar leaf
               → reshape-required
```

`reshape-required` is a class of its own and is decided **before** the interpolation differential — after the canary
and after the rest, before the series are compared — because a unit the syntax cannot name makes "does it interpolate
the same?" the wrong question rather than a failed one. Two tests pin the precedence, including that a rest which
does not survive the registration is still `registration-unsafe` whatever the unit turns out to be.

The general statement, which is why this is a class rather than a note beside the old verdict: **a resting value's
morphology cannot always identify the interpolation unit.** The test is structural — the model's own `FUNCTION`
pattern over the emitted frames — so the next pair of this shape is found without anyone remembering `math-depth`.

### And one distinction this log has to keep

A pass reports only what **it** established. `unresolved` in a validation report means "this probe strategy could not
decide it", and it must never be read as "the declaration has no evidence":

```text
validation-pass result   unresolved for this probe strategy   the five union-syntax routes of `scale`/`translate`
standing evidence        proven elsewhere                     their landing records in `scripts/lib/evidence.mjs`
production eligibility   yes, from the standing evidence      the declarations those records admit
```

The registry is the authority for the production decision; a research pass is not. The five union routes are the case
that makes this concrete — this pass cannot probe a union with a single value, and their declarations are carried by
their own landing records rather than by this batch, which is what the promotion's guard asserts.

## 2026-09-17 — `offset-anchor` moves to the reshape track, and D.3's whole lesson in one line

### Ruling

> **Reclassify `offset-anchor` from `blocked-by-emission` to `reshape-required`. Preserve the earlier
> blocked-by-emission finding as historical evidence, because it correctly identified that validation could not
> proceed. Do not patch the current composition. Open a reshape investigation around the actual `<position>`
> interpolation unit, likely one resolved positional value per axis rather than independent edge and offset
> leaves.**

### The history, preserved

```text
initial finding       blocked-by-emission
                      the representation was never tested, because production produced no valid consumer value

later diagnosis       the emission cannot be repaired locally: the model's interpolation units do not correspond
                      to `CSS <position>`'s structure

superseding class     reshape-required
```

The first two are still true. What changed is the diagnosis of *why* production was invalid, and that belongs to
the representation model rather than to the emission — so `blocked-by-emission` leaves the live vocabulary and the
finding stays here, which is what this log is for.

### The measurement behind the reclassification

```text
the emission composes    offset-anchor: var(--jumi-offset-anchor-x) var(--jumi-offset-anchor-y)
each axis composes       --jumi-offset-anchor-x: var(--jumi-offset-anchor-x-edge) var(--jumi-offset-anchor-x-offset)
their rests              `center 0` and `center 0`   →   the property reads `center 0 center 0`

offset-anchor: center 0 center 0   → discarded, the property falls to its initial `auto`
offset-anchor: center 0            → `50% 0px`        one axis alone is a whole position
offset-anchor: left 0 top 0        → `0px 0px`        the four-value form wants left/right and top/bottom
offset-anchor: center top          → `50% 0%`
```

`<position>`'s four-value form is `[left|right] <length-percentage> [top|bottom] <length-percentage>`, so `center`
is not permitted in it — and the two axes concatenate into that form whenever both carry an offset from a `center`
edge, which is the family's own rest. The decomposition is not wrong about the values; it is wrong about the
**unit**: an "edge plus offset" pair is already a whole position expression, so joining two of them asks the grammar
for something it does not have.

Two repairs were considered and rejected, and both are recorded rather than lost: **compose one axis only** gives a
value the engine accepts (`center 0`) and silently drops the y axis, and a composition is a static string that
cannot choose its spelling by the values its leaves hold; **make the resting edge directional** (`left 0 top 0` is
accepted) changes what an author's edge utility means, which is a semantics decision and not a correctness fix.

### The reshape the family needs, as a brief

Not implemented, and deliberately not patched around. The promising direction is that each axis resolves to **one
position component** before animation — `x-position` and `y-position`, each a valid positional value — with the
property composing those two directly:

```text
left + 20px      → 20px
right + 20px     → calc(100% - 20px)
center           → 50%
top + 10px       → 10px
bottom + 10px    → calc(100% - 10px)
```

and the questions that need answering before anything moves: can every edge/offset combination be normalised
without changing native semantics; what happens to percentages, `calc()`, `var()` and logical positions; is
`center + offset` a real authoring concept or one the existing model invented; and should edge utilities stay
independently animatable, or does edge+offset become one compound positional channel.

### And the lesson this is one instance of

> **A composition graph can be structurally valid in Jumi while still decomposing a native CSS grammar along
> boundaries the browser does not recognise.**

### The outstanding state, at route level

```text
reshape-required       math-depth-add · offset-anchor-x/y           3 routes
unresolved             rotate-x · rotate-y (no native baseline)     2 routes
fixture-unobservable   rotate-z · mask-border-outset ×4             5 routes
and, kept apart:       the five union-syntax routes of scale/translate are NOT undecided —
                       this pass cannot probe a union with one value, and their declarations
                       are carried by their landing records
```

**State.** No composition patched, no production change: `src/` is untouched by this increment and the generated
map is unchanged, so the rerun proof from the promotion still stands. 17/17 stages, 79/79 behaviour, 477 unit
tests.
