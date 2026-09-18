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
the test suite asserts each one is a value its own syntax admits _by the shape reader's judgement_, so an arm
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
recorded here as a falsification of the census bucket rather than as a defect in the emission: _resting-value
morphology alone cannot always identify the interpolation unit_. The test is the model's own `FUNCTION`
pattern over the emitted frames, not a list of properties, so it generalises past `math-depth`.

**`registration-unsafe` is 0 by construction, and that is a result rather than a gap.** The syntax came from
the resting value's own shape, so the rest is inside the syntax the derivation proposed — and the reach gate's
`registration-unsafe` belongs to the _keyword_ population, where the rest is a keyword and the grammar is a
promise. The pass measures the rest anyway: the emission's rest is read from the sheet rather than assumed from
the model, and the two disagreeing is a reader defect it **fails** on rather than a finding it reports.

### Four traps, each found by the arm disagreeing with itself

- **A probe is also a class name.** `rgba(0, 0, 255, 0.5)` split into four class names, the element matched
  nothing, every `var()` was invalid at computed-value time and the consumer fell back to its initial value —
  so 24 arms reported invalid readings that agreed, five of them as `movable`. The `<color>` probe is
  `#0000ff80` now, and the suite asserts no probe carries whitespace.
- **A fixture that forgets the emitted sheet reads `none` and agrees.** The first run omitted it and produced
  27 `movable` verdicts from two invalid readings each. Two arms that never moved are one reading, so it is now
  a **hard failure**: a flat native series _with_ an identical typed series exits non-zero.
- **The one-value spelling makes the arm motionless.** `-[2]` sets the leaf's _live_ slot to the target, so the
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
representation for it" — so widening it to include declared pairs promptly _dropped_ every pair that is still
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
That entry stands as written. This one corrects it, because later evidence changed the _reading_ rather than the
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

The first two are still true. What changed is the diagnosis of _why_ production was invalid, and that belongs to
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

## 2026-09-17 — D.3.6 · the function-argument reshape: the primitive works, and the subject it changes

### The question

> **Can Jumi represent and animate a typed argument inside a static function shell without introducing a
> family-specific execution path?**

`math-depth` is the proving case, chosen at ruling time because it is the smaller one: one function, one
argument, one slot, and none of `<position>`'s grammar, axis semantics, logical directions, `calc()`,
percentages or edge keywords mixed in. The secondary question was whether the shape generalises past the
property that forced it.

### The survey: 23 leaves, and two places the shell is written

Structural, read from the model rather than remembered — a leaf's value can be wrapped in a function in two
places, and searching only one of them would have missed the case this pass exists to prove:

```text
leaf shape      the entry's own rest is a call        variables/property.ts: value: css('blur', '0')
phrase shape    the candidate's part wraps the value  properties/tween.ts: ['math-depth-add', value => css('add', value)]
```

```text
filter-blur · filter-brightness · filter-contrast · filter-drop-shadow · filter-grayscale ·
filter-hue-rotate · filter-invert · filter-opacity · filter-saturate · filter-sepia · filter-url
backdrop-filter-{the same eleven}
math-depth-add                     ← phrase shape alone; a rest-only survey finds nothing about it
```

`math-depth-add` is in the second shape only, which is the whole reason the survey reads both: the shell is
invisible everywhere except the frames.

### The fact that decides the repair: the emission animates the property, not the leaf

```text
what the class emits        --jumi-math-depth-add-sluPV-0:   add(0)
                            --jumi-math-depth-add-sluPV-100: add(2)
what the frames do          @keyframes jumi-math-depth-sluPV {
                              0%   { math-depth: var(--jumi-math-depth-add-sluPV-0, var(--jumi-math-depth-add)) }
                              100% { math-depth: var(--jumi-math-depth-add-sluPV-100, var(--jumi-math-depth-add)) }
                            }
```

So the shell is written into the **property's** frame variables, the _subject_ the frames animate is
`math-depth` itself, and `math-depth` is not registered — which is why the series is a discrete flip rather
than a series. Moving the shell inside those same frames changes nothing; the first version of the proposal
assumed there was a declaration of the leaf to take the shell out of, and the emission answered that there is
none.

### The proposal, in full

```css
@property --jumi-math-depth-add {
  syntax: '<integer>';
  inherits: false;
  initial-value: 0;
}

#e {
  math-depth: add(var(--jumi-math-depth-add));
} /* the composition owns the shell */
@keyframes {
  from {
    --jumi-math-depth-add: 0;
  }
  to {
    --jumi-math-depth-add: 2;
  }
} /* the frames animate the argument */
```

One registration, one substitution, and the frames' **subject** moved from the property to the argument.
Nothing else. No branch on the property's name, no table of functions, no family-specific execution path.

### The measurement, against the shipped sheet

The emitted arm is the real sheet and the real class, unchanged. The proposal arm is that same sheet plus
exactly the three things above, all of them read out of the emission or the derivation: the syntax and rest
from the derivation, the shell from the survey, the consumer's read from the composition as emitted.

```text
math-depth   0 -> 2    emitted  0 · 0 · 2 · 2 · 2     proposed  0 · 1 · 1 · 2 · 2     canary 2
math-depth   0 -> 7    emitted  0 · 0 · 7 · 7 · 7     proposed  0 · 2 · 4 · 5 · 7     canary 7
```

The emission flips at the midpoint; the proposal interpolates, in the engine's own integer rounding (`0 → 7`
over five samples is `0 · 1.75 · 3.5 · 5.25 · 7`, serialised rounded), with the endpoints unchanged. The
canary pins the leaf to the far frame and reads the property: `2` and `7`, so the fixture can see the
argument it is reporting on.

### Two corrections this pass paid for, both in the harness

**"Moving" is not one thing.** The first classification called the emitted arm `already-moving`, because it
does move — in the two steps of a discrete flip. A discrete series is the two stops and nothing else; an
interpolated one has values between them. The tally now separates the two, and treats _discrete in both
arms_ as an arm defect rather than a finding, alongside _endpoints moved_, which would be a different motion
rather than the same one interpolated.

**A pin is constant by construction.** The first canary asked for variation across the wall and therefore
reported every working pin as blindness. What a canary has to establish is that the consumer _deviates from
its unpinned reading_ when the leaf is pinned — not that the pinned reading varies. And the fixture's
element is part of the observable: `math-depth` applies to MathML, so the first run's `<div>` read the
initial value whatever the frames said, and reported the pair `fixture-unobservable` for the fixture's
shape rather than for the representation's.

### What this says about the reshape machinery

It needs one new capability and no new abstraction. The ruling states the primitive:

> **For a shell-shaped constituent, the static composition owns the shell and the animation owns only the
> independently interpolable argument.**

which is the typed-leaf thesis rather than a departure from it, so no separate "function animation
subsystem" is required. That consistency is structural: the 22 `filter` and `backdrop-filter` slots have the
same shell in their frames, and their compositions already read the leaf — **the same execution
transformation is structurally applicable to the 22 surveyed filter/backdrop-filter leaves; whether it is
behaviorally equivalent remains unmeasured.**

This pass measured only `math-depth-add`, because it is the only surveyed leaf the derivation currently
plans for (`<integer>`, two magnitudes). The other 22 are **not** therefore `movable`, and this entry does
not claim it: they are unmeasured, which is what the release rule says an unmeasured pair is.

### The two origins of the shell are kept apart, deliberately

The survey found the shell in two structural places — the entry's own rest (`value: css('blur', '0')`) and the
candidate's part (`['math-depth-add', value => css('add', value)]`) — and the ruling's instruction is not to
normalize them into "same source metadata": they say **where the shell's semantics currently live**. The
eventual abstraction may unify _execution_, but the reader still has to prove the shell from whichever
structural source owns it, or the model risks inventing a generic wrapper it never declared.

So the invariant, as ruled:

```text
shell-shaped execution is available only when the model can structurally identify:

  leaf · shell function · argument position · static consumer composition · typed representation

no function-name guessing
```

### The ruling that follows

> **Commit D.3.6. Before opening the offset-anchor reshape, run a very small second-family falsification of
> the function-argument primitive using representative filter/backdrop-filter leaves. Do not classify or
> migrate all 22. If the same generic subject relocation survives, implement the primitive generically,
> rerun `math-depth-add` against production, and close the function-argument reshape track. Then move to
> `offset-anchor`.**

The falsification is the D.2-style test this track has used before: _does the same subject relocation work in
a second family without changing core behaviour?_ Two representatives, not a census — and the production
shape it licenses is a detection, never a list:

```text
detect shell-shaped typed constituent → frame animates typed argument → composition retains shell

not:  if math-depth …   /   if filter …
```

### The outstanding state, at route level

```text
measured this pass     math-depth-add · 2 routes · reshape-unlocks, endpoints preserved
surveyed, unmeasured   the 22 filter/backdrop-filter slots — structurally applicable, behaviourally
                       unproven; a second-family falsification is ruled next, on representatives only
reshape-required       offset-anchor-x/y                             2 routes  (report recorded above)
unresolved             rotate-x · rotate-y (no native baseline)      2 routes
fixture-unobservable   rotate-z · mask-border-outset ×4              5 routes
```

**State.** No `src/` change, nothing promoted, no production decision: the pass writes
`scripts/argument-reshape.json` and a survey, and the release rule is unchanged — evidence attaches to the
route and representation that ships. 17/17 stages, 79/79 behaviour, 477 unit tests.

## 2026-09-17 — D.3.6's second family: the primitive survives, and the two origins need different repairs

### The ruling

> **Commit D.3.6. Before opening the offset-anchor reshape, run a very small second-family falsification of
> the function-argument primitive using representative filter/backdrop-filter leaves. Do not classify or
> migrate all 22. If the same generic subject relocation survives, implement the primitive generically,
> rerun `math-depth-add` against production, and close the function-argument reshape track. Then move to
> `offset-anchor`.**

D.3.6 is `817ba21`, with the entry above narrowed as ruled: the 22 leaves are _structurally applicable_,
_behaviourally unproven_.

### The falsification, and what "small" was held to

Three representatives, chosen by the ruling's own criteria rather than for convenience: `filter-blur` and its
`backdrop-filter` twin for family independence, and `filter-hue-rotate` because its grammar is materially
different (`<angle>` rather than `<length>`, so a different type, unit family and probe). No census, no
classification of the remaining 19.

Every input is structurally identified, per the ruling's invariant — **leaf · shell function · argument
position · static consumer composition · typed representation** — or the arm is _refused_ rather than
estimated: the shell from the survey, the argument position from the shell's own rest (and refused when the
call does not take exactly one argument, which is how `drop-shadow(…)` stays out), the syntax from the
candidate's single declared type through the derivation's own `SYNTAX_OF` table rather than a second copy of
it, the consumer from the pair's own route, the composition from the emission, and the two stops from the
shared `PROBES`. The judgement is the **same `judge`** the `math-depth` arms ran through — which is the
difference between testing a primitive and testing a copy of it. All three identified; none refused.

### The measurement

```text
filter ← filter-blur              [<length>]   0 → 20px    equivalent, 5 distinct samples
backdrop-filter ← …-blur          [<length>]   0 → 20px    equivalent, 5 distinct samples
filter ← filter-hue-rotate        [<angle>]    0deg → 45deg  equivalent, 5 distinct samples
```

**Equivalent** is the strongest result this test can produce: the same series sample for sample, with the
emission's shape changed and the motion unchanged. So the answer to _does the same subject relocation work in
a second family without changing core behaviour_ is yes, and the D.2-style family test passes.

The one thing that is **not** the same as `math-depth`, and it is the reason both origins had to be kept
apart rather than normalized:

```text
math-depth-add   shell in the PROPERTY's frames     property unregistered  → discrete  → the relocation UNLOCKS
filter-blur      shell in the LEAF's own value       property unregistered? no —
                 …and the property's frames interpolate natively          → equivalent
```

For the filters the property already interpolates between two shell-carrying values, so the relocation
repairs no motion. What it changes is **representability**: the leaf becomes a bare typed argument the
derivation can name and the release rule can promote. That is the benefit for the 22, and it is a smaller
claim than "the reshape fixes them".

### The two origins really do need different repairs — measured, not reasoned

The leaf-origin leaves write the shell into their own **rest** and into their class's **frame variables**,
and those the proposal's element rule cannot override because they are different properties from the
consumer. Measured: with the shell left written, pinning the leaf to `20px` made the composition read
`blur(20px)` as one filter and `20px` as the next, so the whole declaration voided and `filter` computed to
`none`. The repair therefore has to **strip the shell from every write of the leaf** (rest _and_ frame
variables) and put it on the _read_ inside the composition — where the phrase-origin case needs nothing
stripped, because its shell sits in frames the element rule already overrides. One transformation, two
origins, and the ruling's warning not to normalize them was load-bearing.

### Two harness corrections this increment paid for

**Easing must be held equal in both arms.** The emitted arm's animation carries the phrase's own easing while
the proposal's frames are written `linear`, so the first comparable run reported a _difference_ that was only
the easing — `0 · 8.17 · 16.05 · 19.21 · 20` against `0 · 5 · 10 · 15 · 20` for a `blur` nobody disputed. With
`animation-timing-function: linear` forced on the element in both arms, equality became a statement about the
representation and nothing else.

**A refusal must say what it refused on.** The first version asked the property table for the leaf's rest and
got the _source text_ (`css('blur', '0')`), so all three representatives were refused as "the shell does not
take exactly one argument" when nothing had been read at all. The resolved rest comes from the derivation.

### State

The primitive is proven on two families, with no property-name branch and one `judge`. What the ruling
licenses next is the generic implementation — detect a shell-shaped typed constituent, animate the argument,
retain the shell in the composition — followed by `math-depth-add` rerun against production, then the close
of the track, then `offset-anchor`. Nothing in `src/` changed in this increment and nothing was promoted:
17/17 stages, 79/79 behaviour, 477 unit tests.

## 2026-09-17 — the generic implementation, attempted: the composition half lands, the subject half is gated

### The ruling

> **Implement the function-argument primitive generically, but do not globally apply it to the 23 surveyed
> leaves. Activate it only where route-specific evidence licenses promotion, starting with `math-depth-add`.
> Rerun `math-depth-add` against the shipped implementation and close D.3.6 if it reproduces the measured
> series. Leave the structurally applicable but unmeasured filter/backdrop leaves unchanged.**

### What was attempted, and the two halves it turned out to have

The primitive needs two things, and the machinery already had the second one. `core/index.ts`'s **typed
constituent** path emits `emitKeyframe('jumi-<component>', { from: substrate, to: { ...substrate, [leaf]:
var(--jumi-<component>-100) } })` with `substrate = { [attribute]: var(--jumi-<attribute>) }` — so the frames
animate the leaf and re-assert the composition, which is exactly D.3.6's proposal. The change therefore
looked declarative: make the composition own the shell, make the authored value the bare argument, and declare
the leaf. No branch on a property name, no table of function names — the shell is read off the composition,
which is where it now lives.

```diff
  src/composition/math-depth.ts   css('var', '--jumi-math-depth-add')  →  css('add', 'var(--jumi-math-depth-add)')
  src/properties/tween.ts         ['math-depth-add', value => css('add', value)]  →  ['math-depth-add', value => value]
  src/variables/typed-leaves.ts   'math-depth': { 'math-depth-add': { animationCanonicalizer: integerOnly,
                                    initialValue: '0', syntax: '<integer>' } }
```

**The composition half works, and that is measured.** The emitted sheet becomes

```text
--jumi-math-depth-add-sluPV-0: 0            the frame values are bare
--jumi-math-depth-add-sluPV-100: 2
--jumi-math-depth: add(var(--jumi-math-depth-add))                          the composition owns the shell
@keyframes … { math-depth: add(var(--jumi-math-depth-add-sluPV-0, var(--jumi-math-depth-add))) }
```

i.e. D.3.6's shape _minus the subject relocation_: the frames still animate `math-depth` through the slot
machinery (`@keyframes jumi-math-depth-sluPV`, not `jumi-math-depth-add`), so the series is still the discrete
flip — measured `0 · 0 · 2 · 2 · 2` where the proposal is `0 · 1 · 1 · 2 · 2`.

**The subject half did not engage.** The typed-constituent branch is guarded by

```ts
if (component && isFullyAddressable(attribute))
```

and for this pair it did not admit, so the emission stayed on the composed path. `isFullyAddressable` is
`edges.every(edge => edge.addressable)` over edges derived from the composition; for `math-depth` the single
edge is `math-depth-add`, read through `add(var(--jumi-math-depth-add))`, which `readSlots` should still find
as a bare read and classify `direct`. That expectation is **not** what the emission shows, so the refusal is
either in that derivation or in the branch's other inputs (`typedLeafOf`, `canonicalizeLeaf`) — and it was not
localised within the increment.

Also corrected on the way: a part written as a bare string is not assignable to `PropertyPart`, which requires
the `[PropertyType, (value: string) => string]` pair. The honest spelling is the **identity** transform, since
the shell is gone from the value rather than respelled there.

### Why it was reverted rather than left standing

The change is not shippable in that state: the emission differs while the motion does not, so it would move
`css-snapshot`, the unit tests that pin the composition, and every downstream consumer of `math-depth`'s
frames — for a series that is still discrete. `types`, `unit` and `css` failed exactly as they should, and the
three `src/` files were restored by name (`git restore`, never a blanket discard). The gate is green at 17/17
and `src/` is unchanged from `627f8d6`.

What survives is the half that is worth not re-deriving: **the composition spelling is sufficient to make the
shell static, and the typed-constituent machinery is already the primitive** — the remaining work is finding
the admission test that refused, with `isFullyAddressable('math-depth')` and its `edgesOf` derivation as the
first suspect and the branch's other inputs as the second.

**State.** No `src/` change, nothing promoted, nothing staged. 17/17 stages, 79/79 behaviour, 477 unit tests.

## 2026-09-17 — the admission gate, diagnosed: no predicate refuses, the phrase spelling does

### The ruling

> **Pick up at the admission test. … The next increment should be diagnostic only … Print/assert each one
> independently before changing production code again. The key question is: which exact predicate prevents the
> already-existing typed-constituent path from admitting `math-depth-add`? … If the diagnosis instead reveals
> that enabling `math-depth-add` requires weakening `isFullyAddressable` in a way that accidentally admits
> other shell-shaped leaves, stop there.**

### The diagnostic, one predicate at a time

A throwaway test printed each input rather than inferring the answer from the emitted keyframe name. With the
composition spelling `add(var(--jumi-math-depth-add))` and the leaf declared:

```text
propertyVariables['math-depth'].value                 "add(var(--jumi-math-depth-add))"
readSlots(that value)                                 [{"fallback":"","name":"--jumi-math-depth-add"}]
isDirectlyAddressable('math-depth', 'math-depth-add') true
isFullyAddressable('math-depth')                      true          (and 'filter' is false, as it should be)
typedLeafOf('math-depth', 'math-depth-add')           {"initialValue":"0","syntax":"<integer>"}
canonicalizeLeaf(declaration, '0' | '2' | '7')        "0" | "2" | "7"
```

**Every predicate admits.** The suspected architectural correction — that the addressability taxonomy treats a
function-wrapped read as non-direct and is therefore too coarse for typed arguments — is _not_ what is
happening: `readSlots` finds the read inside `add(...)`, calls it bare, and the edge is already `direct`. So
nothing needed weakening, and the ruling's stop condition is not triggered.

### What actually refused: the authored spelling, not a predicate

A candidate whose value carries **frames** — `animate-math-depth-add-[0:0|100:2]`, the spelling D.3.5 and D.3.6
both use — takes the phrase branch and **returns** from it, above `register(attribute)`, above
`if (!parts.length)`, above the `component && isFullyAddressable(attribute)` branch. The typed-constituent path
is not _refused_ by that spelling; it is **unreachable** from it. That is the constraint D.2 already recorded as
open — _multi-stop constituent phrases decline typed execution and keep the old composed representation_ — and
it is the reason two increments of measurement saw the composed path: the arms were authored in a form the
representation it selects cannot be reached from.

The phrase spelling is not wrong for what it was for: it exists so a composed representation's _frames_ can be
read per stop. It is the wrong instrument for asking what the typed representation does, and D.3.5 chose it for
a reason that did not survive the reshape — the one-value spelling set the leaf's _live_ slot and left the leaf
driving nothing _under the composed path_, which is exactly the situation the typed path replaces.

### Acceptance, measured against the shipped build

With the three declarative changes and the **value** spelling:

```text
--jumi-math-depth: add(var(--jumi-math-depth-add))       the composition owns the shell
@property --jumi-math-depth-add                            the argument is registered as <integer>
@keyframes jumi-math-depth-add {                          the frames animate the argument
  --jumi-math-depth-add: var(--jumi-math-depth-add-100)
  math-depth: var(--jumi-math-depth)                      and re-assert the composition
}

animate-math-depth-add-[2]:  0 · 1 · 1 · 2 · 2            D.3.6 proposed  0 · 1 · 1 · 2 · 2
animate-math-depth-add-[7]:  0 · 2 · 4 · 5 · 7            D.3.6 proposed  0 · 2 · 4 · 5 · 7
```

No property-name branch, no function-name table, no change to the admission rule, and the 22 filter/backdrop
leaves do not opt in (they are undeclared, and `isFullyAddressable('filter')` stays false).

### Why it is not landed yet, and what landing needs

The three declarative lines are written, measured, and were reverted again — not because the mechanism is in
doubt but because the emission change is the _first_ one that the census and the evidence registry have to
absorb, and three things follow from it:

```text
census morphology     (math-depth, math-depth-add) moves value → reshape, because a shell-shaped composition
                      is read as one: asserted counts 107/99/97 become 106/99/98
evidence registry     scripts/validated-representations.json still records math-depth-add@math-depth as
                      reshape-required, so the promotion guard refuses the declaration until the validation
                      pass measures with the representation the model now selects
snapshot              scripts/css-snapshot re-recorded for the new composition
```

`types` and `lint` pass with the change; `unit` and `css` fail on exactly those three, and each failure names
its own repair. That is bookkeeping with a known shape rather than an unsolved question, but it is a second
increment, and a half-landed emission is worse than none — so `src/` is restored by name and the gate is green
at 17/17.

**State.** No `src/` change, nothing promoted, nothing staged. The primitive is proven end to end against the
shipped build and the only remaining work is the bookkeeping above, then `offset-anchor`.

## 2026-09-17 — the landing attempted: the pass is tied to the representation it was built on, in three places

### The ruling

> **Go. Take it as one production increment and close D.3.6 if the rerun matches.** … 1. reapply the three
> production changes … 2. update the validation arm to exercise the representation through the single-value
> spelling that actually selects it … 3. rerun against production … 4. only if the production series reproduces
> … change the route evidence … 5. let the declaration guard admit … 6. update census morphology … 7.
> re-record the CSS snapshot … 8. full gate.

Steps 1–4 are done and the series reproduces. The rerun does **not** yet produce the route evidence, and the
reason is more specific than expected: the validation pass is built on the **composed** representation in three
places, and the shell pair falls outside all three. Each was measured.

### Where the pass is tied, and what each measurement showed

```text
the arm's spelling        the phrase form returns from the phrase branch above the constituent branch, so it
                          measures the composed representation — this was known and is what step 2 corrects

the frame reader          a typed constituent writes no `0` stop: its keyframe is `from: <substrate>` with the
                          leaf named only at `to`, so `framesOf` threw `the sheet carries no 0 frame`
                          → fixed by synthesising the first stop from the component's resting declaration,
                            gated on the sheet actually registering the component (a composed pair with no
                            `0` frame must keep failing loudly). Measured: 8 → 36 movable records restored.

the population filter     `plans()` filters on `bucketOf(parent, component) === 'value'`, and a shell-shaped
                          composition is read as `reshape` — the very move step 6 makes. So the moment the
                          census is truthful about this pair, the pass stops seeing it at all: measured, the
                          route left `reshape-required` and then vanished from the tally entirely (50 arms,
                          36 movable, and no `math-depth` row).
```

Two mistakes were made and corrected on the way, both worth recording because they are the same mistake in
different clothes — **widening a gate past the fact that justifies it**: first the value spelling was applied
to every _declared_ leaf (36 validated routes fell to **8**, because a declared leaf whose composition is a
plain var-list reads perfectly well through the phrase form and always has), then it was narrowed to the
**shape** that actually forces it — the composition matching `^[a-z][a-z0-9-]*\(\s*var\(--jumi-<component>\)\s*\)$`,
which is `math-depth` and nothing else today.

### The correct landing order, which the rerun establishes

The census move is not step 6; it is **step 1**, because the pass's population is defined by morphology:

```text
1  census morphology           value 107 → 106, reshape 97 → 98   (the model becoming truthful: the
                              interpolation unit lives inside a shell, so the pair is `reshape`)
2  the population filter       a pair the model declares a representation for belongs to the pass whatever
                              its morphology — `bucketOf === 'value'` was the workstream's own filter, and
                              it silently dropped the pair the moment the morphology changed
3  the spelling gate           confined to the shell shape, with the record naming which spelling ran
4  rerun → route evidence      reshape-required → movable for `math-depth-add@math-depth`
5  the guard admits            from the refreshed route
6  the regression arm           the frame writes `--jumi-math-depth-add` and re-asserts `math-depth` only as
                              the bridge — structural, so a future regression onto the composed subject is
                              caught even if sampled behaviour happens to look right
7  snapshot, then the gate
```

### What is not in question

The production change works and is measured twice against the shipped build: `@keyframes jumi-math-depth-add`,
the composition owning `add(...)`, the leaf series `0 · 1 · 1 · 2 · 2` and `0 · 2 · 4 · 5 · 7` — D.3.6's
proposal exactly — with no property-name branch, no function-name table, no change to admission, and the 22
filter/backdrop leaves untouched. `isFullyAddressable` was never the obstacle and is not weakened.

**State.** `src/` and `scripts/lib/validation.mjs` restored by name; no `src/` change, nothing promoted,
nothing staged. 17/17 stages, 79/79 behaviour, 477 unit tests. The remaining work is the seven steps above,
and it is bookkeeping with a measured order rather than an open question.

## 2026-09-17 — D.3.6 closed: the function-argument reshape, shipped

> **Function-argument reshape required no new animation subsystem and no weaker admission rule. The existing
> typed-constituent path was already the correct execution primitive; the missing work was making the model own
> the shell, selecting that representation through the correct candidate spelling, and teaching validation not
> to confuse discovery morphology with execution eligibility.**

### What shipped

```text
src/composition/math-depth.ts   add(var(--jumi-math-depth-add))     the composition owns the shell
src/properties/tween.ts         ['math-depth-add', value => value]  the authored value is the argument
src/variables/typed-leaves.ts   'math-depth' family, <integer>, initial 0, guarded by integerOnly
```

which is what makes the emission `@keyframes jumi-math-depth-add` with the leaf in the frames and the
property written only as the bridge — no branch on a property name, no table of function names, and the 22
`filter`/`backdrop-filter` leaves untouched because they carry no evidence and are therefore not declared.

### The seven steps, in the order the rerun established

```text
1  census morphology      value 107 → 106, reshape 97 → 98 — the model becoming truthful about where the
                          interpolation unit lives
2  validator population   membership is the representation the model proposes or declares, NOT the census
                          bucket: `bucketOf === 'value'` was how this workstream was discovered, and
                          encoding discovery as eligibility is how a successful reshape falls out of its own
                          validator
3  the arm's spelling     shape-driven, and recorded: `phrase` for a plain var-list, `value` for a shell,
                          because only one of the two can reach the typed representation through a shell
4  framesOf               a typed constituent writes no `0` stop; the first stop is synthesised from the
                          component's resting declaration, gated on the sheet REGISTERING it
5  the rerun              math-depth/math-depth-add@math-depth → movable, 36 → 37 records
6  the guard              admits the declaration from that route, unchanged
7  snapshot, gate         17/17, 477 unit tests, 79/79 behaviour
```

### Two traps found in the reader, both worth remembering

A candidate entry is read by walking **parentheses and quotes**, so a comment inside a part list can make the
whole entry unreadable: a bare `add(` in a comment unbalanced the walk, and an apostrophe in ("entry's") opened
a string that never closed. Both were measured the same way — the pair lost its candidate, its route and its
derivation, and the symptom was `no candidate addresses the pair` rather than anything pointing at a comment.

### What D.3.6 leaves behind

The phrase spelling still declines typed execution, by D.2's constraint and not by accident; that is now
recorded as a property of two real entrance spellings rather than as a gap, and the evidence record carries the
spelling it was proven through. The 22 filter/backdrop leaves remain structurally eligible and unpromoted.

**Next:** the structural regression arm the ruling asked for (the frame writes the leaf, the property is
bridge-only), then `offset-anchor`.

## 2026-09-17 — the reader hardening closed: the walk is a pure function, and its two failure modes are pinned

### The ruling

> **I would not count the reader hardening as fully closed until those two fixtures exist … Expose the
> structural walk as a small pure helper rather than add a special fixture file if that refactor stays local.**

The refactor stayed local. The walk is now `readCandidate(body)` — a pure function of one entry's text that
removes comments **before** splitting on parentheses and quotes — and `readCandidates` composes it with the
entry's name and file, which are where the text came from rather than what it says.

### The two fixtures, and the falsification that makes them arms rather than prose

```text
a comment carrying add(          and a bare ( of its own
a comment carrying an apostrophe

  the un-stripped walk closes: false | quote open at end: true     ← both cases
```

Both fixtures are checked against a walk with the stripping removed, so their claim is that the _bug_ is
unreachable, not merely that the fix is present. And their fingerprint is the one worth remembering: neither
produced an error. The pair simply had no candidate, no route and no derivation — which is a silent loss of
reach, and the reason the failure mode was preserved in prose for a session before it could be pinned in code.

Three more cases pin the shapes the walk was written for, so the extraction did not quietly narrow it: a whole
candidate addressing its attribute, `token(…)`'s argument being an order rather than a parts list, and an entry
that addresses nothing at all.

**State.** 17/17 stages, 480 unit tests. Next: `offset-anchor`, starting from the browser grammar rather than
from the current four-leaf vocabulary, with "two `<length-percentage>` axes" treated as the hypothesis to
falsify rather than the answer.

## 2026-09-17 — correction: only one of the two comment fixtures is a demonstrated arm

The entry above claims that both fixture shapes were "checked against a walk with the stripping removed". That
was written before the check was run, and the check disagrees. Appended rather than edited, because the log is
append-only and a wrong claim is better corrected in the open than quietly reworded.

Measured, with `readCandidate`'s strip bypassed:

```text
a comment carrying add(          the fixture FAILS — `attribute: null`, parts `[]`
                                 exactly the fingerprint D.3.6 chased for two increments
a comment carrying an apostrophe the fixture PASSES — a part's first quoted string is still found
```

So the parenthesis fixture is an arm for a measured failure; the apostrophe fixture is a guard for a shape that
has to stay inert, and its own docstring now says so. Two further consequences worth stating plainly:

**The apostrophe was never demonstrated to be a cause.** The comment that carried it was reworded a second time
before the run that finally read correctly, so the correction was attributed to a change that was never
isolated. The commit history does not support the inference the earlier entry made, and nothing else does
either.

**A quick reproduction is not a falsification.** Before doing the bypass properly, the same two texts were run
through a hand-written walk, which reported the parenthesis case as failing and the apostrophe case as passing
— and that is what the wrong claim was built on. The walk in the reader is two functions, an outer balanced
read and a separate parts split, and modelling the first is not modelling the reader. The bypass is the
falsification; the reproduction was an illustration.

**State.** 17/17 stages, 480 unit tests.

## 2026-09-17 — D.3.7 opens: the "two axes" hypothesis survives its own falsification

> **D.3.7: `offset-anchor` interpolation-unit falsification, starting from native browser behavior, not Jumi's
> current leaf vocabulary.**

The pass is one experiment, and it was designed to **refute** the hypothesis rather than confirm it: four
hand-written native arms, a canary that separates a resolved representation from a fixture that merely observes
the same endpoints, and a criterion that only reads as evidence if the arms can disagree. No Jumi is involved —
the claim under test is about the browser's grammar, and a pass that started from the four leaves would be
answering a different question.

### Measured

```text
authored                        computed                                        series
50% 50% → 20% 80%               50% 50% → 20% 80%                               interpolated
left top → right bottom         0% 0% → 100% 100%                               interpolated
left 10px top 20px → …          10px 20px → calc(100% - 10px) calc(100% - 20px) interpolated
center → 20% 80%                50% 50% → 20% 80%                               interpolated
0% 0% → 100% 100%  (canary)     0% 0% → 100% 100%          the same series as the edge arm
```

The edge arm and its resolved spelling produce the **same series**, which is the criterion: they differ only in
how the value is written, so equality means native interpolation happens in resolved space. The arms also
disagree with each other — `50% 50% → 20% 80%` reads `50 · 42.5 · 35 · 27.5 · 20`, the edge arm reads
`0 · 25 · 50 · 75 · 100` — so the fixture is not blind, and the equality above is evidence rather than a
constant compared with itself. The intermediate frames of the third arm are the interesting ones:
`calc(0% + 10px) · calc(25% + 5px) · 50% 50% · calc(75% - 5px) · calc(100% - 10px)`, which is one
`<length-percentage>` per axis being interpolated, written out.

### What this settles, and what it does not

**Settled:** native `offset-anchor` already behaves as though its independently interpolable state is **two
resolved positional components**. Edge keywords are _syntax, not semantics_ — `left top` computes to `0% 0%`
and animates identically to it. Edge-plus-offset is a _spelling of one resolved component_ — `left 10px`
computes to `10px`, and an intermediate frame is `calc(0% + 10px)`. And the grammar's rejection of the model's
composition is therefore not evidence of a missing subject: `center 0 center 0` is rejected because it composes
**four** values where the grammar admits **two**, which is the same shape of mistake as D.3.6's, one grammar
further in.

**Not settled, and deliberately not:** whether the reshape ships, and in what form. The hypothesis was the thing
under test here; a surviving hypothesis is not a design. The candidates the measurement now makes concrete are
`resolved-x` + `resolved-y`, and the open questions are the ones the earlier brief recorded — how percentages,
`calc()` and `var()` normalize, whether logical positions survive, and whether an author's edge utilities stay
independently animatable.

**State.** New book `scripts/research/d3-anchor.mjs` (`pnpm research:d3-anchor`), evidence at
`scripts/anchor-falsification.json`. No `src/` change, nothing promoted. 17/17 stages, 480 unit tests.

## 2026-09-17 — D.3.7 · normalizability measured: what the two-axis subject can and cannot carry

### The ruling, and the sentence it corrects first

> **Keep D.3.7 open. Next, test whether the surviving two-axis subject is actually representable as two
> `<length-percentage>` typed leaves across physical edges, percentages, `calc()`, `var()`, and any accepted
> logical-position forms. Separately measure whether the current edge and offset utilities can remain
> independently meaningful once both feed one resolved axis.**

The correction is accepted and the earlier entry stands as written, with its claim narrowed here:

```text
was      "Edge keywords are syntax, not semantics"
now      for the tested physical-position forms, edge spellings resolve to the same interpolable x/y state
         as their computed <length-percentage> equivalents
```

Logical positions, unresolved values and author-time constructs were out of scope until measured. Two of those
three are now measured, and the third turns out not to exist in this property.

### The class table

```text
class                        arms                                              outcome
directly resolved            50% 50% → 20% 80% · 10px 20px → 30px 40px       equivalent, equivalent
physical edge-relative       left 10px → right 10px · left 10% → right 25%    equivalent, equivalent,
                             top 20px → bottom 10px · center → 20% 80%        discrete natively, equivalent
arithmetic / unresolved      calc(…) pair · var(…) pair                       equivalent, equivalent
logical / grammar-sensitive  start top → end bottom · inline-start → …       discrete natively, discrete
                                                                             natively
```

Each `equivalent` means the native series and the two registered `<length-percentage>` leaves produce the
**same series sample for sample** — the arithmetic arm to the digit:

```text
native       calc(50% + 10px) calc(25% - 4px) · calc(42.5% + 8px) · … · calc(20% + 2px)
represented  calc(50% + 10px) calc(25% - 4px) · calc(42.5% + 8px) · … · calc(20% + 2px)
```

### The four answers

**`calc()` is carryable.** A registered `<length-percentage>` holds the exact computed arithmetic form and
interpolates it identically, so the resolved leaf's natural syntax is confirmed rather than assumed.

**`var()` is equivalent _and_ statically undecidable — the distinction the ruling anticipated.** The arm reads
`30% 20% → 70% 60%` and the leaves reproduce it exactly. But those computed forms are the _browser's_
substitution: Jumi reads source at build time and cannot generalise `var(--ax)` into `30%`. So the class
splits the way it was predicted to: **statically normalizable** (`calc()`, keywords, literals) versus
**dynamically composed** (`var()`), and a `var()`-authored anchor can only be typed if something else supplies
the resolved value.

**Logical positions do not exist here.** `start top` and `inline-start` both compute to `auto` — the property
does not accept them — so that class is empty rather than unresolved. Worth recording as a measurement, because
"unsupported" and "unsupported by this property" look identical from the model's side.

**One arm is discrete natively and is not explained by this pass.** `top 20px → bottom 10px` does not
interpolate, while its x-axis twin `left 10px → right 10px` does, and the two arms compute to the same shape of
pair (`20px` against `calc(100% - 10px)`). That is a real browser behaviour this pass measured but did not
account for, and it is the first thing the next increment should pin — either it is a y-axis quirk, or the
`center` on the untouched axis interacts, and the two answers differ for the reshape.

### The independent-control question, answered

```text
offset leaves move under directional edges   offset-anchor: left var(--ox) top var(--oy)
  leaves --ox 10px → 30px, --oy 20px → 40px
  series 10px 20px · 15px 25px · 20px 30px · 25px 35px · 30px 40px
  native 10px 20px · 15px 25px · 20px 30px · 25px 35px · 30px 40px      preserves native motion

edge leaf moves on its own                   offset-anchor: var(--ex) 10px top 20px
  leaves --ex left → right
  series 10px 20px · 10px 20px · calc(100% - 10px) 20px · …             discrete
  native calc(0% + 10px) 20px · calc(25% + 5px) 20px · 50% 20px · …     does not reproduce it
```

So the two utilities are **not** symmetrical, and the asymmetry is what decides the API. An **offset** is a
value, so it can be registered and stays independently animatable — and the four-value form accepts it, because
`left var(--ox) top var(--oy)` uses _directional_ edges, which is exactly what the resting `center` cannot be.
An **edge** is a keyword, not a value: it cannot be registered, so animating one is discrete, and it moves
continuously only through the resolved spelling it normalizes to. Independent edge motion is therefore not a
capability that survives the reshape; independent offset motion is.

### What is still open

Not the design, and deliberately: the arms above establish representability and the API constraint, not an
implementation. Open before anything ships — the unexplained discrete y-axis arm; how a `var()`-authored anchor
is declined or carried; and whether the resolved leaves keep the author's edge utilities meaningful as
_authoring controls that compose into one axis_ rather than as independently animated leaves.

**State.** New book `scripts/research/d3-anchor-normal.mjs` (`pnpm research:d3-anchor-normal`), evidence at
`scripts/anchor-normalization.json`. No `src/` change, nothing promoted. 17/17 stages, 480 unit tests.

## 2026-09-17 — D.3.7 · the y anomaly is the short spelling, and the representation is faithful on both axes

### The ruling

> **Pin the y-axis anomaly with explicit two-axis spellings and resolved controls. No design yet, no production
> changes.** … isolate **axis asymmetry from syntax ambiguity**.

Each arm is therefore a **pair**: the authored spelling against its already-resolved twin, differing in how the
value is written and in nothing else — the same criterion the opening falsification used. Five arms, and the
2×2 of "does the authored form interpolate / does the resolved twin interpolate" reads them all at once.

### Measured

```text
                              authored                          computed                      interpolates
x · explicit   left 10px top 0 → right 10px top 0               10px 0px → calc(100% - 10px) 0px   yes
               twin 10px 0 → calc(100% - 10px) 0                — same series sample for sample      yes
y · explicit   left 0 top 20px → left 0 bottom 10px             0px 20px → 0px calc(100% - 10px)   yes
               twin 0 20px → 0 calc(100% - 10px)                — same series sample for sample      yes
x · short      left 10px → right 10px                           0% 10px → 100% 10px                yes
y · short      top 20px → bottom 10px                           auto → auto                        NO
both · explicit left 10px top 20px → right 10px bottom 20px     10px 20px → calc(…) calc(…)        yes
               twin 10px 20px → calc(100% - 10px) calc(…)       — same series sample for sample      yes
```

### The answer

**It is not axis asymmetry.** With both axes explicit and directional, the y edge interpolates — and to the
digit identically to its resolved twin, `0px calc(0% + 20px) · 0px calc(25% + 12.5px) · 0px calc(50% + 5px) ·
0px calc(75% - 2.5px) · 0px calc(100% - 10px)`. The two-axis representation is faithful on **both** axes; the
earlier anomaly was about the spelling, exactly as the ruling framed the alternatives.

**And the short spelling is worse than ambiguous: `top 20px` is rejected outright** — it computes to `auto`, the
same reading the D.3.5 measurement of `center 0 center 0` produced. Its x-axis counterpart is accepted but does
not mean what it looks like: `left 10px` computes to `0% 10px`, which is _not_ `left 10px` as one component with
the other axis at centre — the arm and its twin are measuring different pairs, and their series differ
accordingly. So the one-component spelling is not a way to say "edge plus offset on one axis" in this property.

That is the actionable result for anyone designing the reshape: **normalization has to start from the explicit
two-axis form.** That is the form whose authored and resolved series agree, on both axes and when both move.

### The sentence narrowed, as ruled

```text
was      logical positions don't exist here
now      the tested logical-position spellings are not accepted by `offset-anchor` in the measured browser
```

Same evidence, smaller claim — and the distinction is the one that matters, because "this property does not
accept them" and "no browser accepts them" are different facts with different consequences.

### Recorded, not designed

The API asymmetry from the previous pass stands and the ruling's reading of it is the one to carry forward:
an **offset** is value-bearing and can remain independently animatable; an **edge** is keyword-bearing and cannot
remain an independently interpolable typed leaf. So edge utilities survive as _authoring controls that compose
into the resolved axis_, not as motion subjects. Likewise the `var()` rule as stated: statically resolvable forms
take the typed path, a source that depends on an unresolved `var()` declines to the native path — no dynamic
normalization layer invented. Neither is a design decision taken here; both are what the measurements now
permit.

**State.** Book extended in place (`pnpm research:d3-anchor-normal`), evidence at
`scripts/anchor-normalization.json`. No `src/` change, nothing promoted, no design recorded as decided.
17/17 stages, 480 unit tests.

## 2026-09-17 — D.3.7 · the normalizer: a declining prototype, differentialled end to end

### The ruling

> **Build a pure, declining normalization prototype from accepted explicit authored syntax to `[x, y]`
> `<length-percentage>` values, and differential its reconstructed result against native behavior. Do not touch
> production or redesign the edge API yet. Short spellings, unresolved `var()`, and unproven grammar forms must
> decline rather than be interpreted.**

### The contract

`normalizeOffsetAnchor(value) → [x, y] | null`, pure, in `scripts/lib/anchor.mjs`, with five contract tests
beside the browser differential. Accepted: an already-resolved pair, two edge keywords, and the explicit
edge-plus-offset form. Declined: short spellings, anything containing `var(`, logical spellings, and any arity
the browser work did not establish.

### The differential: 7/7 identical

```text
authored                          reconstruction                                  identical
50% 50% → 20% 80%                 50% 50% → 20% 80%                               yes
10px 20px → 30px 40px             10px 20px → 30px 40px                           yes
calc(50% + 10px) calc(25% - 4px) → …                                yes
left top → right bottom           0% 0% → 100% 100%                               yes
center center → 20% 80%           50% 50% → 20% 80%                               yes
left 10px top 20px → right 10px bottom 20px   10px 20px → calc(100% - 10px) calc(100% - 20px)   yes
left 10% bottom 25% → right 25% top 10%       10% calc(100% - 25%) → calc(100% - 25%) 10%       yes
```

The criterion was that the browser cannot tell the authored pair from the reconstructed one, and it cannot: the
series agree sample for sample, including the arm whose offsets are percentages and whose reconstruction moves
`75% → 10%` on one axis and `10% → 75%` on the other, and the arithmetic arm to the digit.

### The arities, decided by the browser rather than by reading position syntax

```text
center              computed 50% 50%      normalizer declines
center center       computed 50% 50%      normalizer 50% 50%
center 20px         computed 50% 20px     normalizer declines
20px center         computed 20px 50%     normalizer declines
left center         computed 0% 50%       normalizer 0% 50%
center top          computed 50% 0%       normalizer 50% 0%
left top            computed 0% 0%        normalizer 0% 0%
left 10px top 20px  computed 10px 20px    normalizer 10px 20px
top 20px            computed auto         normalizer declines
left 10px           computed 0% 10px      normalizer declines
start top           computed auto         normalizer declines
```

Three of those refusals are **conservative rather than forced**, and it is worth saying which and why. The
browser resolves `center` to `50% 50%`, `center 20px` to `50% 20px`, and `20px center` to `20px 50%`, so these
are not forms it rejects; they are arities this track has not established, and the ruling's instruction was to
decline rather than interpret. `top 20px` and `start top` are different in kind — the browser computes `auto`,
so there is nothing to normalize — and `left 10px` is the instructive one: it is accepted, and it computes to
`0% 10px`, which is _not_ "left plus 10px with the other axis at centre". Reading position syntax by intuition
would have produced exactly the wrong value here.

### What this establishes

Both halves the reshape needs now exist and are measured: **the browser's actual interpolation unit** (two
resolved positional components, faithful on both axes, established by the falsification and the anomaly pass)
and **a defensible way for Jumi to reach it** (a pure normalizer that declines rather than guesses, whose
reconstruction the browser cannot distinguish from the authored form).

Neither is a decision to ship. What remains is the semantic question the ruling deferred — whether the existing
edge utilities become authoring inputs into the resolved axis or change shape — and it does not need answering
until the representation is asked to carry real candidates rather than fixtures.

**State.** New `scripts/lib/anchor.mjs` (+ 5 contract tests), new book
`scripts/research/d3-anchor-normalizer.mjs` (`pnpm research:d3-anchor-normalizer`), evidence at
`scripts/anchor-normalizer.json`. No `src/` change, nothing promoted, no API decision taken.
17/17 stages, 485 unit tests.

## 2026-09-17 — D.3.7 · the candidate projection: what the existing surface survives

### The ruling

> **Run the existing `offset-anchor` candidate surface through the proven explicit-form normalizer and determine,
> candidate by candidate, which existing semantics survive the resolved-axis model, which become static
> authoring inputs, and which must decline. No production change and no API rewrite yet.**

The projection is structural and runs the ruled pipeline literally: the candidate sets **one** leaf to an authored
probe, every other leaf keeps its resting value, the whole `offset-anchor` value is composed from those, and the
result goes through the normalizer. Both the roles and the probes are read off the model rather than off names —
a leaf whose rest is a keyword is keyword-bearing, one whose rest is a length is value-bearing, one with
dependencies is compound, and a compound leaf is probed with a position because that is what its own candidates
accept.

### The table

```text
candidate / route                role             normalized x/y        independent animation   needs static edge context   var()       verdict
animate-offset-anchor            whole property   10px / 20px           yes                     no                          declines    preserves
  (left 10px top 20px · 20% 80%)
animate-offset-anchor            whole property   —                     —                       —                           yes         declines safely
  (var(--x) var(--y))
animate-offset-anchor-x          compound         declines              no, not as it stands    yes — directional edges     declines    compound normalization
animate-offset-anchor-y          compound         declines              no, not as it stands    yes — directional edges     declines    compound normalization
animate-offset-anchor-x-edge     keyword-bearing  declines              **no**                  yes (it *is* the context)   declines    cannot preserve
animate-offset-anchor-y-edge     keyword-bearing  declines              **no**                  yes (it *is* the context)   declines    cannot preserve
animate-offset-anchor-x-offset   value-bearing    declines as they rest; composes once directional   **yes**   yes             declines    preserves
animate-offset-anchor-y-offset   value-bearing    declines as they rest; composes once directional   **yes**   yes             declines    preserves
```

Nine projections: four preserve independent control, one declines safely, four require compound normalization or
lose their current semantics.

### The four answers, from the browser arms

```text
the composition the model declares today      center 0 center 0                      auto
the same composition, edges directional       left 0 top 0                           0px 0px
an offset leaf under directional edges        left var(--leaf) top 20px              10px · 15px · 20px · 25px · 30px  (y fixed: independent)
an edge leaf moving on its own                var(--leaf) 10px top 20px              10px · 10px · calc(100% - 10px) · …  (discrete)
a per-axis spelling inside the composition    left 10px center                       auto
an unresolved var() in an authored position   var(--missing) var(--missing)          auto
```

The middle reading is the one that decides the API, and it is now measured rather than argued: the offset leaf
moves independently and smoothly under static directional edges, while the edge leaf cannot move at all — its
series flips. And the per-axis short spelling inside the two-axis composition computes to `auto`, which is why
the compound candidates need the explicit form rather than their own value: `left 10px` is a whole position
component but not one the composition can consume as a leaf.

### The API consequence, stated from candidates

> **The existing edge utilities remain valid as configuration and authoring inputs, but edge animation itself
> cannot retain its current independent execution semantics under the resolved-axis representation.**

That is stronger than "edges are keywords" and it comes from the surface rather than from grammar: the offsets
survive as independently animatable values, the axes survive as compound motions once the edges are directional,
and the edges survive as the static context the other two need.

### Two things this pass does not do

It does not widen the normalizer — `center`, `center 20px` and `20px center` remain declined even though the
browser resolves them, because no candidate in this inventory needs them. And it decides nothing: the shape above
is what the evidence now supports, and the production reshape is still unwritten.

### What the pass cost, in its own defects

Three, all in the projection rather than the model, and all worth naming because each produced a confident wrong
answer: the whole-property test read the _attribute_, which every leaf candidate also addresses, so six candidates
were reported as the seventh; the composition was resolved one level deep, leaving `offsetAnchorX` in the form;
and the resting-state map included the intermediate slots, whose source values are those same identifiers, so the
substitution never reached a value.

**State.** New book `scripts/research/d3-anchor-candidates.mjs` (`pnpm research:d3-anchor-candidates`), evidence
at `scripts/anchor-candidates.json`. No `src/` change, nothing promoted, no API rewrite. 17/17 stages, 485 unit
tests.

## 2026-09-17 — D.3.7 · edge motion survives: authoring identity is not interpolation identity

### The ruling

> **Can an edge-addressed motion be normalized at its endpoints into the resolved axis and reproduce native
> whole-property edge motion?** … If those match sample-for-sample, the API consequence changes materially: the
> edge candidate stays a valid independent authoring control that compiles to resolved-axis animation.

### Measured

```text
the keyword mapping, through whole positions
  left top               → 0% 0%              right bottom          → 100% 100%
  center center          → 50% 50%            left 0 top 20px       → 0px 20px
  right 10px bottom 20px → calc(100% - 10px) calc(100% - 20px)

x edge, static y                                    native ≡ executed        yes
  native       left 0 top 20px  →  right 0 top 20px
  executed     --x: 0% → 100%, --y: 20px → 20px
  series       0% 20px · 25% 20px · 50% 20px · 75% 20px · 100% 20px        (both)

y edge, pinned x                                    native ≡ executed        yes
  native       left 0 top 20px  →  left 0 bottom 10px
  executed     --x: 0px → 0px, --y: 20px → calc(100% - 10px)
  series       0px calc(0% + 20px) · 0px calc(25% + 12.5px) · 0px calc(50% + 5px) · …
```

Both arms reproduce the native transition sample for sample, so **an edge-addressed motion can be executed as the
resolved axis**. The candidate keeps its independent authoring identity — an author still writes a motion that
addresses an edge — while the _subject the frames animate_ is the resolved component. That is the same
distinction `math-depth-add` established one track earlier, where the author addresses `add(2)` and the frames
animate the integer argument.

The previous entry's conclusion is therefore narrowed, and the narrowing is the ruling's point: an edge cannot be
an **independently interpolating typed leaf** — measured, the keyword custom property flips while the offset moves
smoothly — but that is a fact about the execution subject and not about the authoring surface. Demoting the edge
utilities to configuration-only would have been a real loss, and the measurements did not require it.

### One correction the arm produced against itself

The obvious native spelling for the x arm, `left top 20px`, is **three components**, which `offset-anchor` does
not accept: both endpoints compute to `auto`, and the arm's own defect guard refused to compare a reading of
nothing. The explicit four-component form `left 0 top 20px` is the one that means what the intent says. Worth
recording because the first spelling is the one that reads correctly, and the guard is the reason the difference
was caught rather than reported as a mismatch.

### The architecture this now supports

```text
public surface                        execution subject
whole position        ───────┐
axis compound         ───────┤
edge motion           ───────┼──→  resolved-x / resolved-y  (<length-percentage> typed leaves)
offset motion         ───────┘

dynamic var() forms  →  decline, and the whole motion stays on the native/composed path
```

Every public class has an execution path, no class is demoted, and the decline boundary is the one already
established: nothing partially typed. What remains before a production reshape is design rather than discovery —
which is the first time in this track that has been true.

> **Authoring identity and interpolation identity do not have to be the same thing.**

**State.** New book `scripts/research/d3-anchor-edge.mjs` (`pnpm research:d3-anchor-edge`), evidence at
`scripts/anchor-edge.json`. No `src/` change, nothing promoted, no API decision taken. 17/17 stages, 485 unit
tests.

## 2026-09-17 — D.3.7 · the production spike: four routes, mapped end to end

### The ruling

> **Model `offset-anchor` as two internal resolved `<length-percentage>` execution leaves, keep edge/offset
> vocabulary at the authoring layer, normalize each public candidate into resolved-axis endpoints where
> statically possible, and decline the entire typed route when normalization cannot be proven. Before shipping,
> run one production-shaped spike across whole, compound, edge, and offset routes to prove the candidate-to-axis
> mapping end to end.**

### The design, as spiked

```text
authoring layer      x-edge · x-offset · y-edge · y-offset        (the public vocabulary, unchanged)
                              ↓ normalization
execution layer      --jumi-offset-anchor-x-position
                     --jumi-offset-anchor-y-position              (both <length-percentage>, internal)

offset-anchor: var(--jumi-offset-anchor-x-position) var(--jumi-offset-anchor-y-position)
```

No public class changes, and no branch names a property: the mapping is from an authored endpoint to a resolved
component, and which component a route moves is a fact about the route rather than a lookup on its name.

### The spike

```text
route                        public class (shipped, unchanged)     native series ≡ proposed    both axes
whole position               animate-offset-anchor                 50% 50% · 42.5% 57.5% · …   yes
x edge                       animate-offset-anchor-x-edge          0% 0% · 25% 0% · …          yes
y offset                     animate-offset-anchor-y-offset        0% 10px · 0% 15px · …       yes
x/y compound                 animate-offset-anchor-x               calc(0% + 10px) 0% · …      yes

decline boundary   var(--x) var(--y) → declines, the whole route stays native
                   center 20px       → declines, the whole route stays native
resting state      today     center 0 center 0 → auto
                   proposed  50% 50%             → 50% 50%
```

Four of four reproduce the native motion with **both axes assigned in every frame**, which is the "no half-typed
execution" criterion asserted structurally rather than trusted.

### The design fixes an invalidity, which is more than expected

The model's composition computes to `auto` **today** — the `center 0 center 0` that D.3.5 measured, and the
reason this track exists. Under the proposed emission the same resting state computes to `50% 50%`, because the
execution layer composes resolved components and never keywords. So the reshape does not merely preserve the
current behaviour: at rest it repairs a form the browser rejects.

That also corrects the earlier projection's conclusion. It said a value-bearing route "preserves independent
control **if the edges become directional**" — inferred from the four-value grammar needing `left|right` and
`top|bottom`. The inference was about the _authoring_ layer, and the execution layer never sees a keyword, so
making the edges directional is **not** required. The spike is what settled it; the projection could only see the
rejection.

### The decline boundary is hard

`var(--x) var(--y)` and `center 20px` both decline, and a decline takes the **whole route** back to the native
path — no `x` typed beside a native `y`, and no best-effort substitution. Same all-or-nothing rule that kept
`scale` honest.

### What the spike cost, in its own defects

Four, all in its plumbing and all reported as mismatches before they were understood: the endpoint arrays were
passed as `from` and `to` whole, so all four arms compared the wrong pair; the whole route normalizes to a
**pair**, not to one component, and its first run fed `50% 50%` into a single registration; which axis a route
moves was assumed rather than declared; and `0%` against `0px` at the zero point is a serialization difference
that the comparison had to treat as one value. None was a defect in the design, and each was caught by the
spike's own guards rather than by a human reading the output.

### What is owed before shipping

The per-axis normalizer (`normalizeAxis`) has no contract tests of its own yet — the spike exercises it, but the
pure contract is unwritten. And the production change itself is untouched: this is a spike plus its evidence.

**State.** `scripts/lib/anchor.mjs` gained `normalizeAxis`; new book
`scripts/research/d3-anchor-spike.mjs` (`pnpm research:d3-anchor-spike`), evidence at
`scripts/anchor-spike.json`. No `src/` change, nothing promoted. 17/17 stages, 485 unit tests.

## 2026-09-17 — D.3.7 · the per-axis contract pinned, and the one capability the production change needs

### The ruling

> **Add the `normalizeAxis` contract tests, then ship the resolved-axis reshape as one production increment.**
> Keep the public API unchanged, the internal execution leaves private, typed execution all-or-nothing across
> both axes, rerun the four route arms against the shipped build, and require the resting-state repair plus full
> gate green before closing D.3.7.

### The contract, pinned

`normalizeAxis` now carries four tests beside `normalizeOffsetAnchor`'s five, and they are the ruled cases: a
bare edge to its own percentage (`left → 0%`, `center → 50%`, `right → 100%`); an edge with an offset in the
direction the edge grows (`left 10px → 10px`, `right 10px → calc(100% - 10px)`, `top 20px → 20px`,
`bottom 20px → calc(100% - 20px)`); any length-percentage including arithmetic and percentages; and a decline
for everything not established — `center` with a non-zero offset, a `var()`, logical spellings, a non-edge first
argument, and both arguments absent. One test asserts the **shape** rather than a value, because it is the
criterion the production design rests on: the function answers one component or nothing, so "every emitted frame
carries both axes" is a property of the boundary rather than of care.

### The reconstruction that must happen before `src/` moves

The production change needs a capability the typed-execution declaration does not have, and this is worth
establishing before writing any of it:

```text
canonicalizeLeaf(declaration, value)     sees ONE leaf's value — cannot see a sibling
TypedExecution.whole(value)              sees a whole attribute value, and is consulted only for one

an axis is (edge, offset)                → one resolved component
and the all-or-nothing rule is           → both axes, or the route declines
```

Neither facet can express that. The constituent path calls `canonicalizeLeaf` at `src/core/index.ts:1606` for a
single authored value, and `whole` is the whole-property path's facet — so a `center 0` x-axis is not something
either can read, and the pair is exactly what the design needs to read. The increment therefore adds one
**axis-pair** capability to the declaration rather than bending either existing facet, and the all-or-nothing
rule lives there with it: a pair that produces one component and not the other returns nothing.

### The increment, scoped

```text
src/composition/offset-anchor.ts      offset-anchor: var(x-position) var(y-position)
src/variables/property.ts             the two internal <length-percentage> execution leaves
src/variables/typed-leaves.ts         declare them, add the axis-pair capability
src/core/index.ts                     the constituent path maps an authored endpoint through that capability
                                      and emits BOTH axes in every frame, or declines the route
then                                  snapshot re-record, census counts, the four route arms rerun against the
                                      shipped build, and the resting-state repair asserted
```

The design is unchanged from the spike; what this establishes is _where_ it attaches, which was the open question
the ruling's "one production increment" left implicit.

### Why it is not started in this entry

It is a `src/` change with a snapshot and census consequence, and the four route arms have to be re-run against
the shipped build to close it — the same shape as D.3.6's landing, which needed its own increment after the
design was proven. Landing the contract tests and the attachment point first keeps the increment itself a single
reviewable change, rather than a half-applied emission nobody can evaluate.

**State.** 9 contract tests in `scripts/lib/anchor.test.mjs`. No `src/` change, nothing promoted. 17/17 stages,
489 unit tests.

## 2026-09-17 — D.3.7 · the generic compound-constituent capability declares itself

### The ruling's correction, accepted

> **Do not land an abstraction literally shaped as "axis-pair."** … a public constituent may require
> family-level normalization into a complete set of execution leaves. `offset-anchor` is the first consumer of
> that capability, not the capability itself.

So the typed execution model gains one optional facet, named for the shape and not the family:

```ts
constituent?: (
  component: string,
  value: string,
  context: Record<string, string>,
) => Array<[string, string]> | null
```

with the contract the ruling stated — the public component addressed, its authored endpoint, and enough
**authoring** state to reconstruct the family's value, returning the complete execution-leaf assignment or
`null` — and with the two boundaries written into it rather than left to the caller:

```text
all or nothing   one leaf of a set the family executes together is the half-typed state a decline exists to
                 prevent, so a partial answer is treated as no answer
one way          the context is authoring state (the family's components and their rests) and never execution
                 state read back out — otherwise normalization depends on what was emitted last rather than
                 on what the author wrote
```

The **simple path is untouched**, and deliberately: a constituent whose authored component _is_ its execution
leaf still resolves through the leaf's own canonicalizer, which is cheaper and already correct for most typed
constituents. This facet is an escape hatch for the case D.3.7 falsified the universal rule with — where the
public component and the interpolation component are not the same thing.

### What landed, and what it is worth on its own

The facet is declared and **inert**: nothing declares an implementation yet and nothing calls it, so the
emission is byte-identical and all 17 stages pass. Landing it separately is not a half-applied change — it is the
capability's own definition, reviewable without an emission moving underneath it.

### The measured constraint that sequences the rest

The remaining work cannot be split the way this step was, and the reason is a guard rather than a preference.
`src/variables/typed-leaves.test.ts` refuses any declared leaf whose route the evidence records as anything but
`movable`, and `offset-anchor-x/y@offset-anchor` is recorded as **`reshape-required`** — correctly, because the
current emission is the thing that is wrong. So the execution leaves cannot be declared before the emission
exists, and the emission cannot be validated before the leaves are declared:

```text
one atomic increment
  composition          offset-anchor: var(x-position) var(y-position)
  execution leaves     offset-anchor-x-position · offset-anchor-y-position  (<length-percentage>)
  declaration          the two leaves, plus the constituent resolver for the family
  core                 the constituent path calls it and emits BOTH axes in every frame, or declines
  then                 snapshot re-record, census counts, four route arms against the shipped build,
                       and the resting repair asserted (`center 0 center 0 → auto` becoming `50% 50%`)
```

Every step of that is scoped and nothing in it is undecided; what it is not is divisible while the tree stays
green, which is the standard this track has held throughout.

**State.** `TypedExecution.constituent` declared in `src/variables/typed-leaves.ts`; no consumer, no emission
change, nothing promoted. 17/17 stages, 489 unit tests.

## 2026-09-17 — D.3.7 · deferred to one atomic incremental, and the two constraints for its call site

### The ruling

> **Keep the tree green. Don't start the atomic `offset-anchor` increment until there's enough room to finish it
> properly.** … take the remaining reshape as one production increment and do not checkpoint a half-working
> emission just to manufacture smaller commits.

The dependency cycle is real and is the reason the split stops here:

```text
execution leaves need movable evidence
movable evidence needs shipped execution
shipped execution needs the leaves
```

`350c1f4` stands on its own because it establishes the execution **contract** without pretending the family
implementation is done. Everything after it is semantically one change, and staging it would be inventing
checkpoints around a single emission.

### The order the increment will follow

```text
1  composition switches to resolved x/y execution leaves
2  declare offset-anchor-x-position · offset-anchor-y-position, both <length-percentage>
3  offset-anchor implements TypedExecution.constituent, from authoring context only, returning both axes or null
4  core invokes the resolver **before** the simple leaf path, and only when the family declares one
5  every typed frame writes both execution leaves
6  rerun whole · compound · edge · offset · the decline cases · the resting-state repair
7  refresh route evidence: reshape-required → movable where proven
8  guard, census, snapshot, behavior, full gate
```

### Two constraints recorded for step 4, because they are easy to get wrong

**The branch stays narrow.** The compound resolver is an escape hatch, not a new default:

```text
execution.constituent exists   → build authoring context → resolve compound execution
otherwise                      → the existing canonicalizeLeaf path, unchanged
```

If it is written as "try the resolver first for every constituent", then simple families begin paying for — or
depending on — context construction they never needed, and the escape hatch becomes the main abstraction. That is
the failure mode to avoid, not a style preference.

**The context is a defined projection, not a bag.** The signature is broad enough for future families, and the
caller is still responsible for handing it a well-defined _authoring_ state:

```text
context = { the family's own components — their authored values where this candidate wrote them,
                                          their rests where it did not }
```

Not whatever model slots happen to be nearby. Together with the one-way rule already written into the facet, that
keeps the layers as D.3.7 measured them: authoring state → normalizer → execution state, and never back.

**State.** No change in this entry. `350c1f4` remains the tip of the track; `src/` is otherwise untouched, nothing
is promoted, and the gate is 17/17 with 489 unit tests.

## 2026-09-17 — the standing ledger for the `offset-anchor` landing

The next session starts at step 1 of the queued plan. These are **fixed**, and the only thing that reopens any of
them is a concrete implementation failure against it — not discomfort with the shape:

```text
two-axis subject                       the interpolable state is two resolved positional components
static composition shell               the composition owns the splice; the motion owns the components
authoring → execution only             context is authoring state, never execution state read back out
whole-route decline on unresolved input   `null` takes the entire route back to the native path
compound resolver only for declared families   reached when a family declares one, never a first attempt
simple constituent path unchanged       the leaf-local canonicalizer stays the default
```

Three of those have measurement behind them rather than preference, which is why the reopen rule is phrased the way
it is:

```text
two-axis subject          falsified-then-survived: the edge arm and its resolved spelling produce the same series
static composition shell  D.3.6: moving the subject into the frames fixed a discrete flip; the shell cannot move
authoring → execution     the one-way rule, which is what keeps `edge` an authoring input rather than a
                          keyword-shaped execution subject
```

What is **not** fixed, and is deliberately left to the implementation: the resolver's exact signature, how the
authoring projection is constructed, and where the execution leaves are named. Those are implementation choices
inside the recorded boundaries.

Also standing: `scripts/research/d3-probe.tmp.mjs` is untracked and not part of this track — leave it alone.

**State.** No change in this entry. Tip `92ff539`, `src/` untouched since `350c1f4`, nothing promoted, gate 17/17
with 489 unit tests.

## 2026-09-17 — how a failure during the landing is classified

Appended to the ledger above, because that entry says "a concrete implementation failure reopens one of the six"
and does not say how to tell one. The ruling does, and the order matters — classify **before** touching
architecture:

```text
plumbing defect            the intent is right and the code carrying it is wrong: a projection built from the
                           wrong slots, an endpoint passed as the pair, a frame missing an axis
                           → fix forward; the ledger is not in question

evidence/guard mismatch    the emission is right and what records it disagrees: a route still marked
                           `reshape-required` because the validation pass has not measured the new shape yet
                           → refresh the evidence; still not the ledger

actual assumption failure  one of the six does not hold against the implementation — measured, not felt
                           → reopen that assumption, and only that one
```

The reason to classify first is visible in this track's own history: several confident "NO" verdicts during
D.3.7's spike were plumbing — a pair passed where two endpoints were wanted — and each looked exactly like a
design that did not work. Only the third category is evidence about the architecture; the first two are evidence
about the code, and treating them as the same thing is how a working design gets reopened for no reason.

**State.** No change in this entry. Tip `262526f`, `src/` untouched since `350c1f4`, nothing promoted, gate 17/17
with 489 unit tests.

---

## The D.3.7 landing was attempted, built, and reverted — two censuses refuse it

Ruling: _"Begin the atomic D.3.7 `offset-anchor` production landing now."_ It was begun, and the whole emission was
written. It compiled and bundled — `bundle`, `types` and `lint` all passed — and it was reverted at the end of the
session, because two things it depends on are decisions rather than edits, and neither had been made.

This is the fourth deferral of this increment, so the entry is written to be the _reason_ the next attempt starts
further along: the code is described below closely enough to be re-applied, and the two refusals are named.

### What was written, and that it built

1. `src/composition/offset-anchor.ts` — the composition composes the two resolved slots,
   `var(--jumi-offset-anchor-x-position) var(--jumi-offset-anchor-y-position)`, instead of the four authoring tokens.
2. `src/variables/property.ts` — `'offset-anchor-x-position'` and `'-y-position'`, two `value` entries with
   `variable: '--jumi-…'`, and the top-level pair's `dependencies` pointing at them.
3. `src/variables/typed-leaves.ts` — the `TypedExecution.constituent` facet takes
   `authoring: (slot: string) => null | string`; the `offset-anchor` family declares `whole: positionComponents` and a
   `constituent` resolver that reads the four authoring slots, resolves each axis, and returns both leaves or `null`;
   the normalization (`axisPosition`, `positionComponents`, `components`) lives in `src/` because production cannot
   import a research book, and it is the same contract the prototype implemented.
4. `src/core/index.ts` — before the simple typed-leaf path, `if (execution?.constituent)` resolves the assignment,
   and on a complete one emits **one** definition with **both** leaves from **one** substrate, returning both
   endpoint slots. `null` falls through to the composed-property representation — the whole-route decline, unchanged.
5. `src/types/index.ts` — the two execution components named in `PropertyType`.

`bundle`, `prepare`, `types` and `lint` pass with all of that in place. The refusal is at `unit` and `css`.

### Refusal one — the authoring-state source is a population act, not an edit

The resolver has to read the family's own authoring state at build time. The obvious source is the model's slot map
for the attribute, which is built from the attribute's dependency closure — and the four authoring components were not
in that closure, because the composition no longer reads them. Adding them so the resolver can read them moved the
census, measurably:

```text
constituent population   307   (was 303)
buckets                  value 110 · keyword 101 · reshape 96   (was 106 · 99 · 98)
```

Four new `(offset-anchor, …)` pairs, and two existing pairs re-classified. **The closure is the population**, so
widening it to feed a resolver is not an implementation detail — it changes what the census counts. That is the
finding, and it is a boundary rather than a defect: the call-site constraint says the resolver's context is _exactly
the components the resolver needs_, and this measurement is what says those components must be **declared as an
authoring surface** rather than smuggled in as dependencies of the resolved family. Classification: not an
assumption failure — none of the six was contradicted.

### Refusal two — the evidence model has no representation for an internal execution leaf

`names only leaves the family declares, and every one of them` fails: the two execution leaves are declared but no
candidate route addresses them, and they never will, because they are the thing the frames animate rather than
something an author writes. The evidence model equates _declared_ with _addressed_.

This is the evidence/guard class — but it is **not** yet a refresh, because a refresh is only honest after the
emission has been observed. The emission was never measured in a browser this session: the gate stops at `unit`
before `behaviour` runs, so §18's subject section — the three arms that read the composition shell, the leaf write
through the endpoint slot, and the `math-depth` slot — did not run against the new emission. So this is recorded as
an **open decision about the evidence model** (what an internal execution leaf is, in the vocabulary of routes),
not as a refreshed record of a verified emission.

### What is still proven, and what is not in question

The spike stands: normalizer reconstructions 7/7 identical, spike routes 4/4 identical, edge motion surviving as
authoring identity executed as the resolved axis. Nothing in this attempt contradicted any of the six assumptions.
The two call-site constraints hold as written and were followed — the compound branch is taken because the family
_declares_ a resolver, and every family that declares none reaches the simple path unchanged.

### The next attempt starts here

Two decisions, then the same code:

1. Give the resolver a declared authoring surface — a place for authored edge/offset state that the census counts
   deliberately rather than as a side effect of a dependency list.
2. Decide what an execution leaf is in the evidence vocabulary — an internal leaf with its own record kind, or a
   route asserted against the family that owns it. Then §18 runs against the real emission.

Then re-apply the five files above, classify the two rewrite lines in the css registry (mechanical), re-run the
production-shaped cases, refresh the census, and take the gate.

**Practice note, measured twice:** two of this session's edits reported success and had not applied — a duplicate
`'offset-anchor'` block in `typedLeaves`, and the facet's signature still carrying the old parameter. Both look like
implementation errors and are not. Read the region back after editing it; the cost is one command and the alternative
is debugging a phantom.

**State.** Tip `1c4f133`. Nothing landed: `src/` is exactly `1c4f133`, restored by name. Gate 17/17, 489 unit tests,
`tsc` clean. The two census refusals and the registry classification are the increment's real gate, and neither is a
rewrite of the design.

---

## D.3.7 landed: the distinction named first, then the emission that needed it

The ruling was to settle both refusals as **one** missing distinction before touching the emission, and to treat the
failed landing as implementation feedback rather than as a deferral. Both corrections landed as their own increment
(`0a48f0e`), green, with the emission untouched; the emission then landed on top of them and is now measured in a
browser.

### The two declarations, and what each one stopped pretending

```text
PUBLIC AUTHORING       x-edge · x-offset · y-edge · y-offset  →  candidates address these
NORMALIZATION          TypedExecution.constituent             →  reads the declared surface
INTERNAL EXECUTION     x-position · y-position                →  no candidate addresses these
STATIC COMPOSITION     offset-anchor: var(x-position) var(y-position)
```

`TypedExecution.authoring` is the family's public authoring components — deliberately **not** `dependencies`, because
after a reshape the composition reads the resolved ones and listing the authoring ones there would say the property is
made of something it is not. Two consumers read it and they are why it is declared: the resolver's projection is
exactly these slots (never a bag of nearby model slots), and the census counts them.

`TypedLeaf.execution` marks a leaf that exists to be written by a frame. The census population became one stated rule
— the composition graph plus the declared authoring surfaces minus the execution machinery — factored as `censusOf`, a
pure function of its three inputs, so the rule is testable without moving the model underneath it. The evidence
invariant was **narrowed, not relaxed**: a route means an author can enter through something, and an execution leaf
cannot; it is evidenced through the public routes that generate it.

### The emission, and the census accounting

`offset-anchor`'s composition now reads the two resolved components; the two execution leaves exist with rests that
are the resolved form of the authoring rests (`center` over `0` is `50%`); the family declares its four authoring
components and a resolver; and the core takes a compound branch only where a family declares one, projecting exactly
the declared surface.

The census moved from 303 to **305**, and the movement is accounted for rather than accepted:

```text
value     106 → 108   the four authoring components arrive as pairs the family exposes
keyword    99 → 101
reshape    98 →  96   the two per-axis group pairs leave: the composition stopped composing them
pairs     324 → 326   (four arrive, two execution leaves are refused, the graph itself unchanged)
declared components 288 → 286   the two leaves are machinery, and machinery is not surface
```

### The measurement — five arms over the shipped build, in `behaviour-check.mjs` §19

Not the spike: the real compiler, the shipped bundle.

```text
the composition composes the two resolved components                      ✓
one definition writes both leaves                                        ✓
`left` over a zero offset → 0% · untouched `center` → 50%                ✓
the resting composition computes (motion applied, paused at zero)        ✓  — D.3.7 measured `auto`
a component with no measured mapping takes the composed representation    ✓
```

The resting arm is the repair, and it is a browser claim: D.3.7's defect was `applied === bare`, meaning the
emission's own declaration computed to what a bare element reads. With the motion applied and paused at zero the
element now reads a position rather than `auto`.

### What the measurement found, and it is not the resolver

The per-axis group route (`animate-offset-anchor-x`, `-y`) is **inert**, measured:

```text
@keyframes jumi-offset-anchor-x { to { offset-anchor: var(--jumi-offset-anchor-x-position) var(--jumi-offset-anchor-y-position); } }
```

That is the same value at both stops. It follows from the reshape rather than from the resolver: `hookSlot` replaces
the group's own leaves inside the attribute's composition, and the composition no longer names them, so there is
nothing to replace and the frame writes the composition verbatim. The group candidates address a slot nothing reads.
The arm states this so it cannot be mistaken for coverage, and the decision it opens — retire the two per-axis groups
or map them onto the axes the resolver reads — belongs to you, because the group's own candidate cannot even carry a
two-token value (`type: 'position'`), which is what made a `var()` decline unreachable through a class in the first
place: the decline had to be measured on a route that compiles.

Classification: **plumbing**, found by measurement, in a route the reshape made vestigial. It is not one of the six
assumptions, and none of them was reopened.

### Outstanding

The validation pass has not been re-run against the reshaped family. The records that name `offset-anchor` still carry
their pre-reshape verdicts, and the unit guard admits what shipped — which is why the tree is green — but the two
authoring pairs the census now counts under `offset-anchor` have no records of their own yet. That, and the group
decision above, are the increment's opening items.

**Practice note, three times now:** the compound arms failed twice on their own fixtures — an element with no class on
it, and a decline spelling that never compiled — and both read exactly like an emission that does not work. Read the
fixture before the emission; the detail strings exist so a failure says which of the two it is.

**State.** Corrections `0a48f0e`, emission `4b2e030`.

**Correction, appended:** the entry above was written with a placeholder for the emission's tip and committed with it
still in place. The emission commit is `4b2e030`; it was first staged with `git add -A`, which took the untracked probe
and a docs reflow that are not this track's, and the commit was redone with only the twelve files this increment
touched. Both facts are recorded here rather than in the entry, because the entry is history. Gate 17/17, 496 unit tests, 87/87 behaviour arms, `tsc` clean.
The six assumptions stand unreopened; the spike's measurements stand; the landing is in and measured, with two items
open rather than deferred.

---

## The historical differential: the group routes were already empty, so they retire

The ruling was to falsify the **historical capability** of the actual `animate-offset-anchor-x` / `-y` candidates
before choosing between mapping and retiring them, and to test only spellings their real grammar accepts.

Run against both plugins — the parent of the reshape (`/tmp/jumi-pre`, worktree at `0a48f0e`, built by the same
`bundle.mjs`) and the landed one — with the same eight spellings, reading `offset-anchor` on a real element with the
motion applied and sampled at two instants:

```text
spelling                              before the reshape        after it
animate-offset-anchor-x-[10px]        auto → auto      inert    auto → 50% 50%
animate-offset-anchor-x-[25%]         auto → auto      inert    auto → 50% 50%
animate-offset-anchor-x-[left]        auto → auto      inert    auto → 50% 50%
animate-offset-anchor-x-[right]       auto → auto      inert    auto → 50% 50%
animate-offset-anchor-x-[0:10px|100:50px]  auto → auto  inert    50% 50% → 50% 50%   inert
animate-offset-anchor-y-[10px]        auto → auto      inert    auto → 50% 50%
animate-offset-anchor-y-[top]         auto → auto      inert    auto → 50% 50%
animate-offset-anchor-y-[0:10px|100:50px]  auto → auto  inert    50% 50% → 50% 50%   inert
```

**Before the reshape, every spelling is inert**: `frames=1`, so an animation exists and is applied, and `offset-anchor`
reads `auto` — the property's own initial value, what an element with no motion reads — at both instants. No spelling
the candidate accepts produces an observable value, let alone a motion.

And the grammar is the reason rather than a coincidence. The group's composition is `edge offset` — **two** tokens —
while its candidate declares `type: ['length', 'percentage', 'position']`, which is **one**. The value the candidate can
carry is never a well-formed axis pair, so the route could not have expressed the compound it was named for. That is
the ruling's second branch exactly: structurally present, functionally empty, and unable to state the intent through
its own grammar.

After the reshape the value spellings read `auto` at zero and `50% 50%` mid — the base composition being applied, not a
motion — and the phrase spellings read `50% 50%` at both instants, which is §19's finding seen from the browser: the
frame writes the composition verbatim, the same value at both stops.

**Decision: retire.** `animate-offset-anchor-x` and `animate-offset-anchor-y` are removed as dead authoring surface
rather than given a meaning during a reshape. A model route existing is not a public capability existing, and the
measurement is what separates them.

**Practice note, and it is the same note a third time.** The first run of this differential reported `frames=0` for
every spelling on both builds, which reads exactly like "the routes were never wired". It was the fixture: `.css` read
off the compiler instead of off its build. Then `.build()` on the right object, then a class on an element, then a
spelling that never compiled. Four false readings in this track have now come from the measurement rather than from
the emission, which is why every arm prints its own evidence.

**State.** Tip `7725f99`. The differential is a temporary book (`scripts/research/anchor-group-history.tmp.mjs`), not
committed; its readings are here. Next: remove the two candidates, re-run the census and the evidence against the
reshaped family, and close D.3.7 on a green gate.

---

## The group routes are removed, and what removing them exposed

`animate-offset-anchor-x` and `-y` are gone from `tween.ts`, with the measurement written where they were. The
retirement was contained: the census reads compositions and a candidate is not a composition, so nothing moved —
303 → 305 stands, 496 unit tests, 87/87 behaviour arms, gate 17/17.

Re-running D.3 validation against the landed family refreshed the topology, and the refresh is itself a finding:

```text
records removed   offset-anchor-x/offset-anchor-x-offset@offset-anchor
                  offset-anchor-y/offset-anchor-y-offset@offset-anchor
records added     none
```

The two pre-reshape verdicts are gone, which is right — they described an emission that no longer exists. But the new
authoring pairs have **no records at all**: `offset-anchor` appears nowhere in `validated-representations.json`. So the
second closure step is half done, and the missing half is the one that would admit the family's public routes to
evidence. That is open work, not a conclusion, and it is why this entry does not close D.3.7.

Removing the group routes also made §19's decline fixture impossible — the class it named no longer exists — and its
replacement measured something new. A multi-stop phrase on an authoring component
(`animate-offset-anchor-x-edge-[0:0px|100:40px]`) emits **whole-property** frames named `jumi-offset-anchor-<id>`, and
those frames write the composition verbatim: the same value at both stops. The single-value spelling on the same
component resolves through the resolver and moves.

So the family ships **one wired spelling and one inert one**, and the inert one is the spelling an author reaches for
when they want a motion rather than an endpoint. It is asserted in §19 so it cannot pass for coverage, and it is left
for a ruling: it is the same class as the group inertness — a hook with nothing in the composition left to replace —
arriving through a different door.

**Practice note, and the count is now five.** Both attempts at that fixture failed on the fixture: a phrase whose stops
were keywords the candidate's `position` type does not carry, so nothing compiled; then a keyframe-name pattern that
assumed the component's name where the phrase path names the attribute. The emission was never the suspect, and twice
looked like it.

**State.** Tip `4b2e030` plus this increment. Gate 17/17, 496 unit tests, 87/87 behaviour arms, `tsc` clean. D.3.7
stays open on two measured items: the family's public routes carry no evidence records, and phrased motions on them
are inert.

---

## The phrase question: the differential says the entrance was never a capability, so it is rejected

The ruling asked for the same historical differential on the **component** phrase routes before deciding whether to
preserve them by extending the compound resolver to phrase stops. Run against the parent of the reshape and the landed
build, eight spellings, sampled as a series at five instants:

```text
spelling                                  before the reshape      after it
animate-offset-anchor-x-edge-[left]       auto ×5        inert    50% 50% → … → 0% 50%     MOVES
animate-offset-anchor-y-edge-[top]        auto ×5        inert    50% 50% → … → 50% 0%     MOVES
animate-offset-anchor-x-offset-[10px]     auto ×5        inert    auto → auto → 50% 50% (constant)
animate-offset-anchor-x-edge-[0:left|100:right]        auto ×5   inert   50% 50% ×5    inert
animate-offset-anchor-x-edge-[0:0px|100:40px]          auto ×5   inert   50% 50% ×5    inert
animate-offset-anchor-x-offset-[0:10px|100:40px]       auto ×5   inert   50% 50% ×5    inert
animate-offset-anchor-y-edge-[0:top|100:bottom]        auto ×5   inert   50% 50% ×5    inert
animate-offset-anchor-y-offset-[0:10px|100:40px]       auto ×5   inert   50% 50% ×5    inert
```

**Before the reshape every spelling was inert**, value and phrase alike — the whole property was invalid then, which is
the D.3.7 finding itself. After it, the value spellings move and they move correctly: `x-edge-[left]` walks the x
position from `50%` to `0%` with y untouched, and its y twin does the mirror. The offsets decline by contract rather
than by defect (`center` over a non-zero offset has no resolved position, which is the measured rule), and the phrase
spellings are constant.

So the branch is the first one, and the conclusion is **not** to extend the resolver to phrase stops. D.3.6's boundary
therefore stands unamended, and it stands _with evidence_: the phrase entrance on a component of a compound family was
not a working capability that the reshape broke, so there is nothing to preserve and no semantics to invent. The phrase
half of the amendment the ruling sketched is not taken.

**Rejected rather than left inert.** A frame whose value comes out equal to the composition cannot move anything: it
writes the same value at every stop. That shape is now not emitted, in both places it can arise — the constituent path,
where the hook finds nothing in the composition, and the phrase path, where the frame is built the same way. The frame's
own values are compared against the composition rather than matched by pattern, and that distinction is measured: the
first attempt tested whether the composition's text contained the part's name, which skipped phrases that _do_ move —
`filter` and `backdrop-filter` reach their part through `url(var(--jumi-filter-url))` — and two behaviour arms caught it
immediately. The predicate is now the exact one, made by the same function the frames are.

What this deliberately does not touch: a phrase addressing the **whole** attribute writes its own frame key and moves as
before, and every constituent whose family still names it in the composition is unaffected. §19's arm now asserts the
rejection in the CSS rather than in a browser reading — the phrased class emits **no keyframes at all**, where the
single-value spelling on the same component emits and moves.

**Still open, and it is the last item.** The four new family-level authoring pairs need evidence records that describe
the representation they **execute through** — the authoring component and its sibling context, mapped to two execution
leaves — rather than pretending they are typed leaves with routes of their own. The record shape should quote §19's
measurement of the shipped build, not the prototype. D.3.7 closes on that, not before.

**State.** Gate 17/17, 496 unit tests, 87/87 behaviour arms, `tsc` clean; both scratch builds and the temporary
differentials removed.

---

## D.3.7 closed: the authoring routes have evidence that describes what they are

The four family-level authoring routes now carry records of their own, produced by a book that measures the **shipped
build** (`scripts/research/d3-authoring-routes.mjs` → `scripts/authoring-route-evidence.json`), in a shape the old
schema cannot express:

```text
route         offset-anchor/offset-anchor-x-edge@offset-anchor
authoring     offset-anchor-x-edge, with x-offset · y-edge · y-offset beside it
execution     offset-anchor-x-position + offset-anchor-y-position, both assigned
representation  resolved positional components
verdict       movable
evidence      50% 50% → 37.5% 50% → 25% 50% → 12.5% 50% → 0% 50%
```

```text
route         offset-anchor/offset-anchor-x-offset@offset-anchor
verdict       declined
evidence      auto ×5 — no execution assignment, and no sibling state unblocks it
```

The offsets are the finding the ruling anticipated, and the measurement came out **stronger** than the vocabulary it
offered. `conditional` would have said "resolves under compatible sibling authoring state", but the shipped build has
no such state: the projection is built when _this_ candidate compiles, from _this_ candidate's own slots, so a second
class on the element cannot supply the edge the offset needs beside it. `center` over a non-zero offset is refused by
contract, and the route that would have to resolve it carries only one of the two values. So the verdict is
`declined`, with the reason recorded — which is the whole point of asking the question rather than asserting
`movable` because the architecture permits it in principle.

The records live in their **own** file rather than in `validated-representations.json`, and that is a decision rather
than an oversight: the latter is regenerated wholesale by a pass whose schema is one component to one leaf, so
hand-written compound records there would be silently dropped by the next run. The separation is the same one this
track is about, applied to the evidence.

**The durable rule, now proven by production rather than by architecture:**

```text
simple constituent evidence     authoring component → execution leaf
compound constituent evidence   authoring component + sibling authoring context
                                → complete execution-leaf assignment, or a stated decline
```

Two guard arms hold it: every authoring component of a family that declares a resolver has exactly one record, and
each record resolves to that family's **complete** execution assignment or says it declines — a route that assigns one
leaf while claiming to work is the half-typed state the decline exists to prevent.

**Two measurement corrections, and both nearly overstated the result.** The first read searched the whole sheet for
assigned leaves, so the sibling edge route's frames were counted as the offset route's, and the offsets came out
`conditional` on the strength of somebody else's motion. The second matched the endpoint form (`--jumi-…-100:`) where
the leaves are written through `var(--jumi-…-100)`, and then _every_ route read `declined`, including the two whose
series plainly move. Both are the same lesson as the rest of this track: the measurement is a fixture, and a fixture
that is wrong looks exactly like an emission that is wrong.

### The lesson this track exists to record

```text
authoring surface   what an author writes, and what a candidate addresses
   ≠
execution surface   what a frame assigns, and what the browser interpolates
   ≠
composition graph   what the property is made of
```

All three were one relation until D.3.7 needed them apart, and each now has its own declaration: `authoring` on the
family, `execution: true` on the leaf, `dependencies` on the property. The census counts the first, the resolver
projects the second from the first, and the composition reads the second — one direction, no readback.

**D.3.7 is closed.** Gate 17/17, 498 unit tests, 87/87 behaviour arms, `tsc` clean. Census 305 with the accounting
above. The six assumptions were never reopened; the one boundary that came close — D.3.6's rule that phrases bypass
typed execution — was tested against the shipped behaviour and **upheld**, with a rejection added for the frame shape
that measurement proved cannot move.

---

## Amendment, one notch: the offset routes are dead surface, not declined surface

The closure above shipped four records, two of them `declined`, and that was the wrong shape for what the
measurement found. A route with verdict `declined` is a **meaningful public capability** with unsupported forms that
falls back safely. The offsets are not that:

```text
never produced meaningful motion before the reshape   auto ×5, measured against the parent
cannot enter the execution model                      the resolver refuses `center` + non-zero offset
cannot be unlocked by a sibling class                 the projection is built when *this* candidate compiles
fallback produces no motion                           the same measurement, after
```

That is the category the two groups were in, found one step later — so the same rule applies, and
`animate-offset-anchor-x-offset` and `-y-offset` are **retired**. The final public surface of the family is its two
edges:

```text
x-edge → movable · y-edge → movable
```

and the evidence file no longer carries a record whose only truth is a permanent decline.

**A constituent can be valid authoring state without deserving an animation candidate.** The two offset leaves stay in
the model, stay in the family's declared authoring surface, and are still what the resolver reads — `center` over a
zero offset is exactly how the edge routes resolve to `50%`. What they no longer have is a class claiming to be a
motion. So the book now derives its routes from the **candidate table** rather than from the surface, which means a
retired candidate's record disappears instead of being memorialised, and the guard's expected set is read the same
way. Validity and addressability were never the same question; this is the increment that had to separate them.

**State.** Gate 17/17, 498 unit tests, 87/87 behaviour arms, `tsc` clean, census 305 unchanged — candidates are not
compositions, which is why this cleanup could be made without moving a single measured number.

---

## D.3.7 closed, unqualified

```text
authoring surface     x-edge · y-edge · x-offset · y-offset
public motion surface x-edge · y-edge
execution surface     x-position · y-position
composition graph     offset-anchor reads x-position + y-position
```

Four surfaces, each doing work rather than bookkeeping: the census counts the first, the candidate table defines the
second, frames write the third, and the property is made of the third. Two rules came out of it proved by production
rather than argued:

```text
valid authoring state does not imply public animation capability
authoring state → normalization → execution state, never back
```

The first is why the offset leaves remain while their classes are gone. The second is why the projection is built from
the declared surface when the candidate compiles, and why no sibling class can supply what a candidate did not carry.

**The verdict class is empty.** Read from the evidence: 49 records — **37 `movable`**, 5 `fixture-unobservable`
(four `mask-border-outset` the engine does not implement, one `rotate-z` that normalises away), 7 `unresolved` — and
**no `reshape-required` record at all**. Both of its members landed: `math-depth-add` in D.3.6, `offset-anchor` here.

**What is left, ranked, and where I would go next.** The census's `reshape` bucket is 96 pairs across 25 parents:

```text
matrix-3d:16  backdrop-filter:11  filter:11  transform:7  matrix:6  filter-drop-shadow:4
backdrop-filter-drop-shadow:4  rotate-3d:4  background:3  scale-3d:3  translate-3d:3  …
```

The largest coherent cluster is the **3D matrix family** — `matrix-3d` 16, `matrix` 6, `rotate-3d` 4, `scale-3d` 3,
`translate-3d` 3, thirty-two pairs, a third of the bucket — and every one of them is the shape D.3.6 solved once:
a component that is an **argument inside a function** (`matrix3d(…)`, `rotate3d(…)`). So it is the leverage pick and
the generalization test for that mechanism in one. The filter cluster is next at thirty (`filter` 11,
`backdrop-filter` 11, the two drop-shadow pairs 4 + 4), with a second argument inside the function to reason about.

Neither is a test of the _three-surface_ model, and that is worth saying plainly: every candidate above still names its
components in its composition. A family that separates all three the way `offset-anchor` did would be a different
search, and the census does not obviously contain one.

---

## Appendix: what "no `reshape-required` records" does and does not mean, and what the 3D cluster actually is

**It does not mean the reshape work is done.** The verdict is a property of a _route the validation pass could plan_,
and the pass plans routes for pairs that are `value`-bucket, declared, or shell-shaped. The 96 pairs in the `reshape`
bucket are mostly none of those, so they carry **no records at all** — un-recorded rather than resolved. Reading the
empty class as "nothing left" would be the mistake the census's ratios exist to prevent, and the bucket is the honest
number: 96 pairs across 25 parents.

**And the 3D cluster is the argument shape, not the function-value shape.** Its components rest on plain values:

```text
matrix-3d (16)   matrix-a1 => 1        matrix-b1 => 0      matrix-c1 => 0     matrix-d1 => 0
matrix (6)       matrix-a => 1         matrix-b => 0       matrix-c => 0      matrix-d => 1
rotate-3d (4)    rotate-x => 0         rotate-y => 0       rotate-z => 1      rotate-angle => 0deg
scale-3d (3)     scale-x => 1          scale-y => 1        scale-z => 1
translate-3d (3) translate-x => 0px    translate-y => 0px  translate-z => 0px
```

None of them is a function _value_ — that is the `filter-blur => blur(0)` shape. They are `reshape` because of the
**depth** test: the parent nests them inside a shell (`matrix3d(var(--jumi-matrix-a1), …)`, `rotate3d(…)`,
`scale3d(…)`, `translate3d(…)`), which is D.3.6's class, solved once at `math-depth`'s `add(...)`.

Thirty-two pairs, one shape, and three sub-cases that are not the same work:

```text
matrix-3d 16 · matrix 6      a shell no other family reads — new leaves, one family each
rotate-3d 4                  rotate-x/y/z are already typed under `rotate`, and their own
                             records are `unresolved` — a second parent for one component
scale-3d 3 · translate-3d 3  the same components as `scale` and `translate`, whose leaves are
                             declared and `movable` — and the registry is keyed by attribute,
                             so the second parent must redeclare them or be keyed differently
```

The last two sub-cases are the generalizing question this cluster actually poses, and it is not the three-surface one:
**can one component be typed under two parents without a declaration per parent?** That is a question about the
registry's key, decidable in one experiment, and it sits inside the largest cluster in the bucket — which is why the
3D cluster is still the recommendation for the next target.

---

## D.3.8 opened as falsification: function-argument shape ≠ argument-level interpolation

The premise to reject first is that "argument inside a function" is a _structural resemblance_ to D.3.6 rather than
evidence that the argument is the browser's interpolation unit. So this pass measures the two routes against each
other — native whole-function motion, and a static shell whose argument is a registered typed leaf — and requires
the `transform` computed value to agree **sample for sample** at five instants. No production change, nothing
promoted, `matrix` left for after `matrix-3d` said which way this goes.

The canary is a perturbed far endpoint: move it and the observable must follow. That is a correction rather than the
first design, and the reason is worth keeping — the first canary was the same typed sheet **without** the
`@property` registration, on the theory that an unregistered slot substitutes discretely. It cannot work:
`@property` is a **document-global** registration, so a second sheet in the same page cannot un-register it, and
five of six arms reported `fixture-blind` at a fixture that was never blind.

```text
arm                        identical  canary  verdict
scale3d                    yes        live    same-series
translate3d                yes        live    same-series
rotate3d (fixed axis)      yes        live    same-series
matrix3d (coefficient)     yes        live    same-series
matrix3d (negative scale)  yes        live    same-series
rotate3d (moving axis)     no         live    differs
```

**The abstraction holds for functions whose arguments are themselves interpolation units, and fails where arguments
participate jointly in the function's own semantics.** The boundary is not "rotate3d is bad": a _fixed_ axis with a
turning angle reproduces native exactly. It is that a turning axis beside a turning angle is one subject to the
engine and several to the proposal:

```text
native  0.96194, 0.0380602, -0.270598 · 0.853553, 0.146447, -0.5    symmetric throughout
typed   0.9308, 0.35307, -0.0946233   · 0.804738, 0.505879, -0.310617   asymmetric at 25%
```

Both move, both share the endpoints, and the interiors differ — the per-argument path normalises a linearly
interpolated axis, which is a different rotation from the one the engine interpolates as a pair.

**One prediction was wrong and is recorded as wrong.** `matrix3d` interpolating a scale through `1 → 0 → -1` was
expected to diverge, on the reasoning that native interpolation decomposes the matrix and normalises the scale.
Measured, it is linear in the coefficient (`1 · 0.5 · 0 · -0.5 · -1`) and identical. The decomposition coincided
here, which is the useful form of the result: the adversarial arm that _did_ split is the joint one, and it split
for the reason the abstraction predicted rather than for the reason this one anticipated.

**So the 32-pair cluster is not one migration class.** It splits by interpolation semantics rather than by
morphology: `scale-3d`, `translate-3d` and the `matrix`/`matrix-3d` coefficients have independently interpolable
arguments and can take the typed shell path; a motion whose arguments move _together_ — `rotate-3d` with a turning
axis — is one subject and stays native. Filters remain the next cluster, and the question there is now sharper:
drop-shadow's arguments beside its blur are a second argument inside the function.

**State.** No production code touched: the pass is `scripts/research/d3-function-shell.mjs`, its readings are
`scripts/function-argument-series.json`. Gate 17/17, 498 unit tests, 87/87 behaviour arms, `tsc` clean.

---

## The compositional question: argument-safe is not compositionally safe, and the matrix cluster is falsified

The single-argument result establishes one condition — **fixed siblings plus one changing argument** — and says
nothing about two migrated arguments moving at once. That second question is the one production has to answer, because
Jumi cannot discover class co-presence at compile time: every route compiles independently, and _"another constituent
is on this element, use native instead"_ is the element-context problem this track already refused. So the same
differential was run with **two or more arguments moving simultaneously**, same endpoints, same timing, interior
sampled:

```text
kind          arm                        identical  canary  verdict
single        scale3d                    yes        live    same-series
single        translate3d                yes        live    same-series
single        rotate3d (fixed axis)      yes        live    same-series
single        matrix3d (coefficient)     yes        live    same-series
single        matrix3d (negative scale)  yes        live    same-series
simultaneous  scale3d (x + y)            yes        live    same-series
simultaneous  translate3d (x + y)        yes        live    same-series
simultaneous  rotate3d (moving axis)     no         live    differs      ← known control
simultaneous  matrix3d (scale + shear)   no         live    differs
simultaneous  matrix3d (rotation-like)   no         live    differs
```

**One coefficient matching was not enough to call sixteen coefficients independent, and the matrix arms are where that
came apart.** A rotation is expressible in coefficients, and the two paths treat it differently in the interior:

```text
rotation-like   native  0.92388, 0.382683, -0.382683, 0.92388   · 0.707107, 0.707107, …
                typed   0.75, 0.25, -0.25, 0.75                 · 0.5, 0.5, …

scale + shear   native  1.26302, 0.0774498, …, 0.99447          · 1.51931, 0.187035, …, 0.992736
                typed   1.25, 0.125, …, 1                       · 1.5, 0.25, …, 1
```

Native keeps the basis a unit vector — it is rotating, which is what the endpoints mean — and per-coefficient
interpolation collapses it to `0.5, 0.5` at the midpoint, a scale-dressed rotation. The shear pair diverges more
quietly and just as really. Both share endpoints; only the interiors differ, which is exactly the shape a fixture
that cannot see the difference would have missed.

**So the families classify by interpolation semantics, and the criterion is compositional:**

```text
separable   scale3d · translate3d     one argument and several arguments alike reproduce native
            → eligible for the generic typed constituent path

coupled     rotate3d                  a fixed axis reproduces native; a turning axis beside a turning
                                      angle does not → its constituents stay native

falsified   matrix3d                  one coefficient and a negative scale reproduce native; two
                                      coefficients do not → coefficients are not independent, and the
                                      family cannot enter transparent per-argument execution
```

`matrix` is untested and inherits the doubt: the ruling was to include it once `matrix-3d` said which way this goes,
and the direction is _falsified_, so the 2-D form is a separate measurement rather than an assumption.

The durable criterion for production, and it is stronger than "arguments are interpolation units": **a function family
is eligible for transparent constituent migration only if independently migrated arguments remain equivalent when
combined.** That is decidable at research time, per family, which is the only time it can be decided.

**State.** No production code moved. Gate 17/17, 498 unit tests, 87/87 behaviour arms, `tsc` clean; the readings are
in `scripts/function-argument-series.json`.

---

## The separability proof is complete, and the class is `separable` or `coupled`

Both loose ends are closed. Three components moving at once, and `matrix` measured on its own rather than inheriting
`matrix3d`'s doubt:

```text
kind          arm                          identical  canary  verdict
single        scale3d                      yes        live    same-series
simultaneous  scale3d (x + y)              yes        live    same-series
simultaneous  scale3d (x + y + z)          yes        live    same-series
single        translate3d                  yes        live    same-series
simultaneous  translate3d (x + y)          yes        live    same-series
simultaneous  translate3d (x + y + z, mixed)  yes     live    same-series
single        rotate3d (fixed axis)        yes        live    same-series
simultaneous  rotate3d (moving axis)       no         live    differs
single        matrix3d (coefficient)       yes        live    same-series
single        matrix3d (negative scale)    yes        live    same-series
simultaneous  matrix3d (scale + shear)     no         live    differs
simultaneous  matrix3d (rotation-like)     no         live    differs
single        matrix (coefficient)         yes        live    same-series
simultaneous  matrix (scale + shear)       no         live    differs
simultaneous  matrix (rotation-like)       no         live    differs
```

`translate3d`'s three-way arm carries the richest grammar the candidates support — `<percentage>` beside `<length>` —
because a difference that only appears when two units interpolate side by side is the kind this pass exists to find,
and there is none.

```text
separable   scale3d · translate3d       every arm, single and simultaneous, reproduces native
coupled     rotate3d · matrix3d · matrix   each passes alone or in one pair and fails when more moves
```

`matrix` was measured rather than inferred, and it fails on both adversarial arms with its control passing: the 2-D
function has its own decomposition and it is not separable either. Nothing more is owed by `rotate3d` or `matrix3d`.

**The taxonomy is production's, not the hypothesis test's.** `falsified` was the right word for a test outcome and the
wrong word for an execution class. The classes are two, and the criterion is one:

> **Transparent constituent migration requires compositional separability, not merely single-argument equivalence.**

And with it a **permanent negative rule**, which this pass earned and which the reach work has to be guarded against
re-learning:

```text
one constituent matches native in isolation
≠
that constituent is safe to migrate
```

Single-route evidence is admission for a _simple_ constituent, where the route is the subject. For a function shell it
is not admission at all: the subject is the function's argument set moving together, so the record that admits a
family has to be a **compositional** one. That is the shape the promotion increment will need — an arm naming the
simultaneous combination, measured, in the place route evidence already lives.

**The research classification of this cluster is closed**, and the promotable set is exactly two families. Promotion is
a production increment of its own and is not part of this one: it needs the two families declared as typed leaves with
the shell owned statically by their compositions, and the compositional arm above as their evidence.

**State.** No production code moved. Gate 17/17, 498 unit tests, 87/87 behaviour arms, `tsc` clean.

---

## The promotion survey: two of its three premises are already true, and the third is not where the ruling put it

Before touching production I surveyed what the two families actually are, and the shape is different enough to
record rather than implement.

```text
the shells are already static, and already the families' own
  transform.ts   scale3d     = scale3d(var(--jumi-scale-x), var(--jumi-scale-y), var(--jumi-scale-z))
                 translate3d = translate3d(var(--jumi-translate-x), …)
  property.ts    'scale-3d'     dependencies ['scale-x','scale-y','scale-z'] value scale3d
                 'translate-3d' dependencies ['translate-x','translate-y','translate-z'] value translate3d

no candidate serves the six pairs as constituents
  scale-3d/scale-x … translate-3d/translate-z   → no candidate, all six, measured with servingCandidates
  animate-translate-3d → property('transform', [['translate-3d', args('translate3d')]])   whole-function
  animate-scale-3d     → absent entirely
```

So:

**The shell half needs nothing.** Both families already own their shells statically in `src/composition` — that is
what "static function shell" means here, and it is the D.2 representation, not a new one.

**The constituent half has no route to promote.** The six components are typed under their _own_ parents (`scale`,
`translate`), whose leaves are `movable`; the pairs under the 3-D parents are `no-candidate`, because the only
candidate near them addresses `transform` with the whole function rather than addressing the parent with a
constituent. Declaring leaves under `scale-3d`/`translate-3d` would therefore be a census claim about a route that
does not exist — legal under D.3.7's rule, and inert for execution.

**The one promotable route is `animate-translate-3d`**, the whole-function candidate, and typing it means a `whole`
facet decomposing `translate3d(a, b, c)` into the three slots. Its justification is not separability — D.3.8 already
settled that — but **co-existence**: today that route animates `transform` at the property level, and a constituent
motion on the same element would be written into slots the property-level frames never read. That is the same
contention D.2 recorded ("the native whole-property animation and a constituent motion over one property contend for
it and the loser goes silent"), and it is **unmeasured here**. It is the measurement that should justify this
increment, and it is cheap: one element carrying both classes, the constituent read through the shell.

**And the survey cost two fixture defects, both mine, both the same mistake.** The first two measurements read
`transform` on an element carrying `animate-scale-x-[0:1|100:2]` and reported `none` at every sample — because that
phrase spelling writes the **`scale`** property's frames (`jumi-scale-1vrwYB`), and `scale` is not `transform`. The
3-D shell lives inside `transform`'s composition and is only exercised by a candidate that addresses `transform`.
That is six fixture defects in this track now, all of the same family: a measurement pointed at the wrong observable
reads exactly like a mechanism that does not work.

**Recommendation, and it is narrower than the ruling.** Promote `animate-translate-3d` to typed per-argument
execution with a `whole` facet, gated on the co-existence measurement above; declare the six 3-D pairs as authors'
surface only if a census claim without a route is wanted, and expect it to be inert; leave `scale-3d` alone
otherwise, since it has no candidate at all. `rotate-3d`, `matrix` and `matrix-3d` stay coupled and untouched, as
ruled.

**State.** No production code moved and no scratch file left behind. Gate 17/17, 498 unit tests, 87/87 behaviour arms,
`tsc` clean.

---

## The co-existence measurement: there is no contention to repair, so the route is left alone

The participant was chosen by architecture and proven before anything was measured, against the compiled sheet:

```text
transform = var(--jumi-perspective-3d) var(--jumi-matrix) var(--jumi-matrix-3d) var(--jumi-rotate-3d)
            var(--jumi-scale-3d) var(--jumi-skew) var(--jumi-translate-3d)

ok  the composition reads --jumi-translate-3d
ok  the composition reads --jumi-rotate-3d
ok  animate-rotate-3d writes --jumi-rotate-3d
```

`animate-rotate-3d` is the verified participant — a whole-function 3-D route whose emitted rule writes a slot that
composition reads — and the observable is the **computed `transform`** throughout.

```text
A   animate-translate-3d alone   0 · (2.5, 5) · (5, 10) · (7.5, 15) · (10, 20)
B   animate-rotate-3d alone      identity → … → 0.853553, 0.146447, -0.5, …
C   both                         rotation **and** translation, both varying at every sample
```

**Coexistence already composes.** The C series carries the rotated basis _and_ the translation in the same matrix at
every instant — `matrix3d(0.990393, 0.00960736, …, 2.52402, 4.97598, 0.344874, 1)` — so the property-level route does
**not** suppress the other participant. The D.2 contention shape is real in general and does not occur here: the
frames' values are the composition itself, so the animation that wins the property still reads every slot the
composition names, and the other route's contribution survives through its own slot.

That is the second branch of the ruling, measured rather than assumed:

```text
alone same, coexistence same → no production benefit; leave the route alone
```

So **`animate-translate-3d` is not promoted.** D.3.8's separability is the reason the route _would_ be safe to
migrate; it is not a reason to migrate it, because nothing is broken by leaving it native. `scale-3d` has no
candidate, the six `(3d-parent, component)` pairs have no route, and none of the three is promoted.

**One arm came out void and is recorded as void.** The prototype's element was selected by `#proto` while the scenario
ids are `A`…`PC`, so its reading is `none` with zero animations and the alone-equivalence comparison against `A`
cannot be made from it. It is moot rather than loss: the prototype existed to test whether typed execution repairs
contention, and there is no contention. Had coexistence failed, this arm would have had to be rebuilt before any
conclusion — which is the ninth fixture defect of this track and the third to be caught only because the readings are
printed rather than summarised.

D.3.8 therefore closes with a research result and **no production change**, which is the correct outcome for a pass
whose hypothesis was falsification: the cluster's separable members turned out to need nothing, and its coupled
members stay native as ruled.

**State.** No production code moved, no scratch file left behind. Gate 17/17, 498 unit tests, 87/87 behaviour arms,
`tsc` clean.

---

## D.3.8 closed, and the second production criterion recorded

The closure is stronger than "nothing changed": the research **prevented a needless migration**. The line that
separates the two is not safety but need:

```text
scale3d / translate3d   separable in interpolation terms
rotate3d / matrix / matrix3d   coupled
animate-translate-3d    already coexists with another transform participant → no contention → no benefit
```

So, alongside separability:

```text
transparent migration requires
  1. semantic safety      the arguments remain native-equivalent when they move together
  2. production necessity the shipped execution has a real defect or limitation the migration repairs
```

Absent either, the family is left alone. That is the correction to the instinct to maximise typed reach, and it is
cheaper to state than to keep rediscovering.

## The filter track opened under both gates

**Gate A — separability. Both properties pass, independently measured, including the nested argument:**

```text
filter · blur + hue-rotate              same-series
filter · brightness + contrast          same-series
filter · blur + drop-shadow             same-series
backdrop-filter · blur + hue-rotate     same-series
backdrop-filter · brightness + contrast same-series
backdrop-filter · blur + drop-shadow    same-series
```

The drop-shadow arms were the ones worth having, because its argument is itself compound — length, length, length,
colour — and they say the argument boundary holds one level down as well as one level up. `filter` and
`backdrop-filter` were measured separately and agree; shared machinery, but not shared evidence.

**Gate B — necessity. Nothing is demonstrated, and the shipped series is informative:**

```text
filter · blur alone          shipped  blur(0px) → blur(2.5px) → … → blur(10px), the whole list explicit
                             native   blur(0px) → … → blur(10px)
backdrop-filter · blur alone shipped  blur(0px) → … → blur(10px), the whole list explicit
                             native   none ×5   ← the reference is void, see below
```

The shipped `blur` interpolates **correctly**, and the difference from native is entirely that Jumi's composition
spells out every filter argument at its resting value. That is a composition-shape difference, not a defect, and it is
the same place `translate-3d` landed: a separable family with nothing to repair.

The `backdrop-filter` native reference read `none` at every sample because the keyframe was written with the
**camelCase** name — `backdropFilter` in CSS rather than `backdrop-filter` — so that comparison is void, and the
shipped series is the only reading from it. And the first run of gate B measured zero animations on both properties
because the probe element carried no class at all: the harness built its body from ids alone, so the shipped class was
never on the element. Both defects were found by the arms' own liveness signals rather than by inspection — which is
the tenth and eleventh fixture defect in this track, and the reason every arm prints its series.

**What gate B does not yet cover, stated rather than implied:** one motion per property, `blur` alone. A defect could
still hide in a multi-argument motion or in `drop-shadow`, where the arguments move together. Necessity is
**undemonstrated, not refuted**, and the probe should be extended to the six gate-A combinations with native
references that are proven live before any conclusion is drawn from them.

**State.** No production code moved. Gate 17/17, 498 unit tests, 87/87 behaviour arms, `tsc` clean; gate A's readings
are in `scripts/filter-shell-series.json`.

---

## Gate B extended to all six combinations: one divergence, classified as a fixture, and then no defect at all

The probe now runs every gate-A combination on the **shipped** classes, against a **live** reference, comparing the
property's computed value per function rather than per string — because Jumi's composition materialises every resting
filter argument, so string equality is impossible by construction and comparing text would report the composition
being explicit as a defect.

```text
filter           blur + hue-rotate        equivalent
filter           brightness + contrast    equivalent
filter           blur + drop-shadow       equivalent
backdrop-filter  blur + hue-rotate        equivalent
backdrop-filter  brightness + contrast    equivalent
backdrop-filter  blur + drop-shadow       equivalent
```

**One arm diverged first, and the classification is the point.** Both `blur + drop-shadow` arms disagreed at every
sample where only the reference differed:

```text
sample 0   native   drop-shadow(rgb(0, 0, 0) 0px 0px 0px)      ← opaque black, the browser's default for an omitted colour
           shipped  drop-shadow(rgba(0, 0, 0, 0) 0px 0px 0px)   ← transparent, Jumi's resting colour
sample 4   native   drop-shadow(rgb(0, 0, 0) 4px 4px 8px)
           shipped  drop-shadow(rgb(0, 0, 0) 4px 4px 8px)      ← identical, and the motion matches at every stop
```

That is `fixture problem` in the ruling's taxonomy, and it is recorded as one: leaving the colour off a
`drop-shadow` does not mean "whatever the rest is" — the browser resolves the omitted form to opaque black — so the
reference was measuring a different motion at the resting end. Corrected, and re-run, all six are equivalent. The
shipped route interpolates the nested arguments of a compound filter function exactly as the browser does.

**So the second criterion fails, and the filter track closes with no production change:**

```text
gate A  separability   pass — six combinations, both properties, drop-shadow nested
gate B  necessity      no defect — six shipped combinations, native-equivalent, live references
→ no migration
```

That is a successful result, not a missed opportunity: `filter` and `backdrop-filter` are the second and third
families this discipline has kept out of a rewrite they did not need.

**And the harness now has its own guard**, which the ruling asked for: `scripts/lib/frames.mjs` holds the
native-reference builder with the property name **converted rather than trusted**, and `frames.test.mjs` pins it —
`backdropFilter` → `backdrop-filter` in the keyframe and never the JavaScript name, the rule and the keyframe named
consistently, and the per-function reader that replaced string comparison. Eleven fixture defects in this track,
several of them silent, is enough evidence that the measuring apparatus deserves the same treatment as the thing it
measures.

**State.** No production code moved. Gate 17/17, 498 unit tests, 87/87 behaviour arms, `tsc` clean; the readings are in
`scripts/filter-shell-series.json`.

---

## The residual reshape ledger: morphology is structure, and structure is not remaining work

Four passes have settled the largest reshape families, several by declining to migrate them, and none of that is
visible in `reshape: 96`. So the priority queue is now two axes: morphology from the census, and **decision status**
from the passes that measured it — declared with the pass that decided it, because a research result is not derivable
from the model — with everything else derived: whether a candidate serves the pair, which families nobody has
measured, and how many public routes an unmeasured family exposes.

```text
reshape pairs 96 across 25 parents
  unmeasured 15 · safe-no-need 6 · migrated 1 · coupled-native 3
```

`safe-no-need` is `scale-3d`, `translate-3d`, `filter`, `backdrop-filter` and the two nested drop-shadow families;
`coupled-native` is `rotate-3d`, `matrix` and `matrix-3d`; `migrated` is `math-depth` from D.3.6. Every entry names
the pass that decided it. Anything absent is `unmeasured` by construction rather than by omission.

**And the family is the wrong unit for the residue.** `transform` is the largest unmeasured parent on a family-level
reading — seven pairs — but five of those name families D.3.8 has already settled:

```text
transform   open=2 of=7   perspective-3d, skew
skew        open=2 of=2   skew-x, skew-y
```

Resolved per pair, its residue is two slots rather than seven, and the rank sees it. A ledger that stopped at the
family would have sent the next pass into work that is already decided — the same failure as reading morphology as a
backlog, one level up.

**What is open, ranked by reachable public routes then open pairs:**

```text
background            routes=3  open=3   background-position, background-repeat, background-size
background-position   routes=2  open=2   background-position-x, background-position-y
border-image          routes=2  open=2   border-image-outset, border-image-repeat
object-position       routes=2  open=2   object-position-x, object-position-y
offset-position       routes=2  open=2   offset-position-x, offset-position-y
skew                  routes=2  open=2   skew-x, skew-y
transform             routes=1  open=2   perspective-3d, skew
```

and a tail worth naming rather than hiding: `animation`, `animation-range`, `animation-timeline`,
`animation-timeline-scroll`, `animation-timeline-view`, `box-shadow`, `border-block` and `border-inline` have **no
candidate that drives them**, so there is nothing to promote or demote whatever their morphology says — the D.3.7
rule arriving from the other side.

**The two-gate rule is now standing admission for all future D.3 work:**

```text
gate A  semantic safety       arguments remain native-equivalent when they move together
gate B  production necessity  the shipped execution has a real defect the migration would repair

both pass → migration may be justified        either fails → leave working code alone
```

`translate-3d`, `filter` and `backdrop-filter` are not to be revisited absent new runtime evidence; neither are the
three coupled families.

**State.** No production code moved. Gate 17/17, 498 unit tests, 87/87 behaviour arms, `tsc` clean. The ledger is
`scripts/reshape-residual.json`, regenerated by `pnpm research:d3-residual`.

**Correction, appended:** the entry above named `pnpm research:d3-residual` before registering it, so for one commit
the book existed and the script it is addressed by did not. Registered now; the readings were always produced by the
book itself and are unchanged.

---

## D.3.9 opened as classification: `background`'s three pairs are three different questions

The survey, from the model rather than from the morphology — route, candidate grammar, resting value, shell,
observable, and the execution path each route actually takes:

```text
pair                        route                       attribute            parts  types
background/background-…     animate-background-position  background-position  []     position, percentage, length, any
                            animate-background-size      background-size      []     length, percentage, any
                            animate-background-repeat    background-repeat    []     any
```

**Every one of the three routes addresses the constituent longhand itself — `attribute === component`, no parts.** So
the subject of the motion is the longhand, not the `background` shorthand, and there is no shorthand-owned execution
path for a migration to repair. That is the ruling's closing hypothesis arriving first: these routes operate on their
own longhands, so the parent's three pairs are not one execution problem and a parent-level verdict would be about a
route nobody uses.

The three constituents classify separately, as expected:

```text
background-position   positional, continuous, edges beside offsets per axis — its x/y sub-pairs are the real
                      subject, and D.3.5 already declared typed <percentage> offset leaves for it
background-size       dimensional with `auto` rests, so the grammar boundary (length ↔ percentage ↔ auto) is part
                      of the question and must not be inferred from <length-percentage> morphology
background-repeat     discrete keywords — repeat / no-repeat / space / round — with a grammar of `any`, so there is
                      no interpolable subject to reshape at all
```

`background-repeat` is therefore recorded as **native** in the ledger under a status the vocabulary did not have:
`keyword-discrete`, distinct from `coupled-native` because nothing is coupled — there is simply nothing to
interpolate. Multilayer syntax is reachable through these routes (the `any` type admits a list by arbitrary value), and
it is recorded as reachable rather than exercised: single-layer equality would not be sufficient for admission if the
comma-separated form can arrive, but it cannot make a discrete keyword interpolable either.

### The ledger gained the column the ruling asked for

```text
pair · route · morphology · decision status · decision granularity
```

`granularity` says at what level the verdict was decided — `family` for the wholesale ones, `route` for the filter
families, `pair` where a family's children were settled individually. It immediately changed a rank: `background` went
from three open pairs to two, because the survey retired `repeat` before any browser was opened. `transform` had
already shown the same shape one level down.

### What that leaves, and the pattern underneath it

```text
background            routes=2  open=2   background-position, background-size
background-position   routes=2  open=2   background-position-x, background-position-y
object-position       routes=2  open=2   object-position-x, object-position-y
offset-position       routes=2  open=2   offset-position-x, offset-position-y
```

Four families now tie at two routes, and three of them are the **same shape**: an axis pair whose constituents are an
edge beside an offset, with the offset already carrying a typed leaf from D.3.5. That is the cheap, high-leverage
question left in the bucket — measure the shape once rather than the families three times — and it is the reason the
rank ties are worth reading as a group instead of broken arbitrarily.

**State.** No production code moved. Gate 17/17, 498 unit tests, 87/87 behaviour arms, `tsc` clean. The ledger is
`scripts/reshape-residual.json`; `pnpm research:d3-residual` regenerates it.

---

## The axis-pair test: two-level structure established, multilayer answered, and the arms inconclusive for a named reason

The ruling's correction is taken: structure is a reusable hypothesis, not transferable evidence, so
`background-position` gets the depth and the other two get one adversarial arm each. The pass is
`scripts/research/d3-position-axis.mjs`, and it reported what it reported — three `fixture-inert` arms and one
decisive multilayer answer — so the honest record is the two things it established and the defect that stopped the
rest.

**Established: the decomposition is two levels deep, not one.** The property's own composition is

```text
background-position = var(--jumi-background-position-x) var(--jumi-background-position-y)
```

and each of _those_ composes an edge beside an offset. So a typed motion animates an `-offset` leaf two levels below
the property, and an arm that looks for offsets in the property's composition finds none. That also corrects the
ledger's phrasing one step further: `background-position`, `object-position` and `offset-position` do not have the
same shape, they have the same _kind_ of shape at different depths — `object-position` composes its offsets directly,
the other two go through an axis.

**Established: multilayer is reachable and does not reach the decomposition.** The public route compiles a
comma-separated value, and its emission is whole-property:

```text
class     animate-background-position-[0%_0%,_100%_100%]
frames    to { background-position: var(--jumi-background-position-Z2vSFXt); }
```

So a two-layer value goes through the property, not through the axis slots, and any admission for this family has to
be stated **single-layer only** rather than left to be inferred. That is the answer the ruling asked for before any
safety claim, and it arrived without needing the safety claim.

A third state to handle, found while running: `offset-position`'s resting composition computes to the _keyword_
`normal`, so its axis decomposition is only exercised once a position is authored — a different starting state from
the other two, and one the arms have to construct rather than read.

**Not established, and the reason is a fixture defect rather than a finding.** The typed arms are inert because the
book resolved the leaves from the **compiled sheet**, and with `source(none)` the sheet carries only the slots the
used class needs: the axis compositions are not in it, so the walk found no leaves and the keyframes were empty. The
fix is named rather than half-done — resolve the composition from `readExpressions()`, the model's own resolved map,
which is what the validation pass uses for exactly this reason — and the arms should be re-run before anything is
concluded about separability for any of the three families.

That is the fourteenth measurement defect in this track, and the pattern has not changed: an arm that measures an
empty subject reports agreement with itself, and only the printed series shows it.

**State.** No production code moved; the book is research-only and the lint stage is green. Gate 17/17, 498 unit
tests, 87/87 behaviour arms, `tsc` clean.

---

## The axis-pair test, re-run: all three pass, and the liveness gate earned its place by rejecting three arms first

The source swap is in — `scripts/lib/sources.mjs` names the three evidence sources and nothing else may choose
between them: the **model's resolved expressions** for structure, the **compiled sheet** for what shipped, the
**computed style** for behaviour. `modelLeaves()` walks the model transitively to the leaves and carries each one's
rest and path; `resolveToLeaves()` resolves a composition to the _reads_; `liveness()` is the three checks.

Every arm now proves three things before its equality is accepted, and the first run proved **why**:

```text
full          background-position  unearned: the observable moved under a perturbed endpoint
corroboration object-position      unearned: the observable moved under a perturbed endpoint
corroboration offset-position      unearned: the observable moved under a perturbed endpoint
```

Three arms measuring a typed series identical to its own perturbed twin — the shape that used to be reported as
"same-series", or as "differs" when the native side happened to disagree. The gate turned all three into `unearned`
before any comparison was made, and three fixture defects came out behind it:

1. leaves resolved from the **compiled sheet**, which under `source(none)` carries only the slots the used class
   needs — no axis compositions, so the walk found nothing and the keyframes were empty;
2. the prototype's property value resolved _through_ the leaves, which **removes the reads** the animation writes to
   — so the property stopped depending on the slot and the motion had nowhere to land;
3. the shell's **edge reads were undefined**, so the declaration was invalid at computed-value time and the property
   fell to its initial value at every instant.

With the shell resolved down to the leaves and every read it makes defined from the model's rests:

```text
background-position   typed 0% 0% · 10% 10% · 20% 20% · 30% 30% · 40% 40%
                      native 0% 0% · 10% 10% · 20% 20% · 30% 30% · 40% 40%   same-series
object-position       typed 50% 50% · … · 90% 90%   native 50% 50% · … · 90% 90%   same-series
offset-position       typed 50% 50% · … · 90% 90%   native 50% 50% · … · 90% 90%   same-series
```

`offset-position` is compared from an **authored** position on both sides rather than from its `normal` rest, which
is what the ruling asked for and what makes the arm an axis test at all: the shipped composition computes to the
keyword `normal`, and a comparison that started there would be measuring the difference between a keyword and a
position.

**Gate A passes for all three, on the shape rather than on one family.** Structures are reusable hypotheses and this
is now the evidence for it: three properties with the same decomposition shape at different depths all reproduce
native motion when their offset leaves move together, single-layer, with the edges held. Gate B runs next and
separately, per property, which is the ruling's ordering — and `background-size` stays out of it entirely, since its
`auto` boundary is a different question.

**State.** No production code moved. Gate 17/17, 498 unit tests, 87/87 behaviour arms, `tsc` clean; the readings are in
`scripts/position-axis-series.json`.

## Gate B, per property: all three routes are inert on a single axis, and the mechanism is the axis slot's arity

The ruling asked for Gate B independently for `background-position`, `object-position` and `offset-position` — x only,
y only, and simultaneous x + y on the shipped build, liveness guards first, `background-position` scoped to
single-layer, `offset-position` to authored positional state, and `background-size` kept separate.

The answer is the same shape three times, and it is not a pass:

```text
background-position   x only   route-inert    shipped 0% 0% · 0% 0% · 0% 0% · 0% 0% · 0% 0%
object-position       x only   route-inert    shipped 50% 50% · 50% 50% · 50% 50% · 50% 50% · 50% 50%
offset-position       x only   route-inert    shipped normal · normal · normal · normal · normal
background-position   y only   route-inert
object-position       y only   route-inert
offset-position       y only   route-inert
background-position   x + y    equivalent     0% 0% · 16.3404% 16.3404% · … · 40% 40%
object-position       x + y    equivalent     0% 0% · 16.3404% 16.3404% · … · 40% 40%
offset-position       x + y    equivalent     0% 0% · 16.3404% 16.3404% · … · 40% 40%
background-size       x / y / x + y   no-route
```

**A single axis authored alone moves nothing, on all three properties; the pair is native-equivalent.** The arms are
not unearned: the class emitted an animation, and the reference moved. `route-inert` is the verdict the guard was
built to be able to say.

### The mechanism, measured rather than inferred

The keyframe's own declaration was lifted out of the emission and applied as a **plain declaration** to an element
carrying the same class, with the animation switched off — so no animation machinery is involved in what follows:

```css
background-position: var(
    --jumi-background-position-x-UqNgw-100,
    var(--jumi-background-position-x)
  )
  var(--jumi-background-position-y-UqNgw-100, var(--jumi-background-position-y));
```

```text
single-axis arm   computes to `0% 0%` / `50% 50%` / `normal`   — the property's resting value
pair arm          computes to `40% 40%`                        — the moved value
```

and the variables that feed it, read from the same element:

```text
--jumi-background-position-x-UqNgw-100   40%          defined by the x route
--jumi-background-position-y-UqNgw-100   (absent)     the sibling arm the route does not carry
--jumi-background-position-x            left 0%       the axis slot: edge + offset, two tokens
--jumi-background-position-y            top 0%        the same, and this is the fallback that fires
```

So the stop substitutes to `40% top 0%` — **three** tokens, where `<position>` in its three-value form requires the
edge keyword first. The declaration is invalid at computed-value time, is dropped, and the property falls to its
resting value at every instant: the animation runs and moves nothing. In the pair arm both arm variables exist, both
stops are single tokens, the position is the valid `40% 40%`, and motion appears.

**Classification — `whole-list ownership/contention`.** The per-axis candidate does not write a leaf: it emits a
**whole-property** keyframe whose per-axis arms fall back to the axis _slot_, which is itself two tokens. One axis
therefore cannot be authored without its sibling, and authoring one alone produces a silently invalid declaration
rather than an error. It is not an ordering defect (no layer or order is involved), not nested coupling (nothing is
nested), and not a fixture problem — the isolation above runs with no animation present, and a page that authors only
`animate-background-position-x-*` is exactly the fixture.

**Gate B therefore passes for all three**, and the migration has a defect to repair that Gate A's eligibility did not
imply: under per-leaf typed execution an axis writes its own leaf and the slot's arity stops being part of the
composed value. `background-size` was asked to stay separate and did — no per-axis route exists for it at all.

### Two fixture defects, both caught by the guards rather than by reading the table

15. **The reference walked a different curve than the route it judged.** `nativeSheet` hard-coded `linear` while the
    plugin's default is `--jumi-animation-timing-function: ease`, so every correctly interpolating arm reported
    `differs` — three findings that were the curve, at 0.4085 progress where `ease` puts it. The timing function is
    now a parameter, read **from the emission** so the comparison follows the plugin, and pinned by a unit test that
    also holds the old default for the tracks that measured against it.
16. **`offset-position` cannot report a resting value.** Chromium reports its used value as the keyword `normal`
    whenever no animation sets it, so the rest read produced no numbers, the reference's endpoints became empty, and
    every arm reported itself. The property is now seated in the authored state the ruling scoped it to, used as a
    fallback **only where a resting read is unavailable** — the pair arm keeps its shipped starting value, which is
    what makes its comparison a comparison.

**State.** No production code moved. Gate 17/17, 505 unit tests, 87/87 behaviour arms, `tsc` clean. The ledger carries
the three routes as `migration-required` at route granularity, and the readings are in
`scripts/position-necessity-series.json`.

## Correction, accepted: the defect is partial-composition invalidity, not contention

The ruling is right and the entry above is wrong in its classification. Nothing contends with another animation
here: the failure reproduces with **one route alone**, which is the opposite of contention.

```text
single-axis candidate
  → whole-property frame
  → substitutes one axis endpoint
  → the sibling axis remains a multi-token composition
  → the resulting <position> has invalid arity
  → the declaration is dropped
  → the animation exists and is inert
```

Recorded as **partial-composition invalidity** (equivalently, incomplete compound execution): the frame owns a
property the route can only partly state, and the partial statement is invalid rather than merged. Recorded, not
edited in place, and the term it replaces is removed from this case only — `whole-list ownership/contention` keeps its
meaning for competing property ownership, which is the `filter` shape D.3.6 measured (a native whole-property
animation and a constituent motion over one property, one winning outright and the other going silent).

The classification has no bearing on the verdict: Gate B still passes for all three, and the ledger's status does not
change on it.

### The question before coding, answered: the axis value is not "the offset"

Enumerated from the candidate table rather than assumed — `src/properties/tween.ts`, the three axis families:

```text
animate-background-position-x          type: position · percentage · length · any   values: empty.position → `center`
animate-background-position-y          type: position · percentage · length · any   values: objectPosition + percentage
animate-object-position-x / -y         type: length · percentage · position         values: empty.position → `center`
animate-offset-position-x / -y         type: length · percentage · position         values: empty.position → `center`
animate-background-position-x-offset   type: percentage · length                    values: percentage
```

So the same public route accepts `[40%]`, `[10px]`, `[calc(100%-2rem)]`, `[right_40%]`, `[var(--x)]`, `center` — and
two facts fall out that the spike has to respect:

**Only an offset that shares its edge is leaf motion.** `[left_10%] → [right_10%]` is accepted, and its motion lives
entirely in the *edge*, which is a keyword: a discrete swap the offset leaf cannot carry. The leaf route is therefore
available only when both endpoints normalize to the same edge, and a motion whose endpoints differ in edge keeps the
shipped whole-property route. This is `axisPosition`'s own clause reading applied to a pair rather than to a value.

**The typed offset leaf is narrower than the public offset route.** `animate-background-position-x-offset` accepts
`length`, while `typedLeaves['background-position']['background-position-x-offset']` is declared `syntax:
'<percentage>'` — and a write to a `<percentage>`-registered property is invalid at computed-value time, which is
exactly the inert-animation shape this pass measured. So `[10px]` is a route an author can write and a leaf value this
declaration cannot hold. Two honest resolutions, and the spike picks one on evidence rather than on convenience:
widen the declared leaf to `<length-percentage>` (which the registration accepts and which `offset-anchor`'s
execution leaves already use), or decline lengths and leave those routes whole. `%` passing must not settle it.

The normalization is to reuse the measured clauses in `axisPosition` rather than invent `value → offset`: a bare
component sits off the axis's own start edge, a keyword is the edge itself over a zero offset, an edge followed by its
offset is that pair, and anything else declines.

### What the spike proves, and what it must not touch

Taken as written. The deep proof case is `background-position-x`: single x → the frame writes `x-offset` and the
property moves; single y → `y-offset`; x + y → both leaves, native-equivalent; the **shell stays static** (edge, axis
and property compositions are untouched); and the comma-separated multilayer spelling still bypasses this path
entirely, since it routes through the whole property and must keep doing so.

The `offset-anchor` precedent is reused as a mechanism and not as a contract. Its `constituent` assigns **both**
execution leaves because partial assignment was unsafe for that family; Gate A established the opposite here — one
positional axis moves safely while the other stays at its static composition — so the abstraction stays
`complete assignment required by this family's execution contract`, not "every execution leaf of the parent". For
these families the complete assignment may legitimately be one offset leaf.

`offset-position: normal` is preserved rather than normalized for uniformity: the typed route activates only once the
public route supplies an authored positional value, `normal` stays `normal` when nothing is authored, and no substrate
turns `normal` into `50% 50%` without browser evidence for that semantic change. Unlike `offset-anchor`, whose invalid
rest was itself the measured defect, nothing here motivates moving it.

Once x only, y only and x + y pass against the shipped build for `background-position`, `object-position` and
`offset-position` are corroborated with one shipped arm each — and the ledger moves all three from
`migration-required` to `migrated`.

## The offset-leaf admission differential: the widening is admitted, and adopting it is not free

The ruling asked for one small browser measurement before choosing between widening the positional offset leaf and
declining lengths. `scripts/research/d3-offset-leaf.mjs` is that measurement: same subject, both edges held, native
property against a registered `<length-percentage>` leaf, one timing function on both sides, liveness guarded on both
arms before anything is compared.

```text
lengths              10px → 40px                       equivalent   10px 0% · 17.5px 0% · 25px 0% · 32.5px 0% · 40px 0%
percentages          10% → 40%                         equivalent   10% 0% · 17.5% 0% · 25% 0% · 32.5% 0% · 40% 0%
length → percentage  10px → 40%                        equivalent   calc(0% + 10px) · calc(10% + 7.5px) · … · 40%
percentage → length  10% → 40px                        equivalent   10% · calc(7.5% + 10px) · … · calc(0% + 40px)
arithmetic           calc(10% + 5px) → calc(40% - 5px)  equivalent   calc(10% + 5px) · calc(17.5% + 2.5px) · … · 25% · …
```

The crossings are byte-identical, `calc()` blend for `calc()` blend, which is the strongest form the answer could
have taken: the leaf and the property live in the same interpolation space, so the widening does not change the
motion, it only stops the route from being unrepresentable. **Outcome: `widen-to-length-percentage`.**

### Fixture defect 17: the arm animated the wrong axis and agreed with itself

The first run wrote both arms as `background-position: left <offset>` — read as *x edge plus offset*. It is not:
that is `<position>`'s **two-value** form, so `left` is the x component and the offset lands on **y**. Both arms
animated y, agreed exactly, and reported `equivalent` for a question that was not asked. Caught by reading the
series rather than the verdict — the moving component was the second one, and the intended subject was the first.

The subject is now named in the four-value form the shell actually emits (`left <offset> top 0%`), and the arm
asserts that **the x component is the one that moves while y stays at its rest**, so the trap reports itself rather
than reading as a pass. Two fixes paid for by the same lesson the earlier passes kept re-learning: a comparison is
only as good as the agreement that the compared thing is the thing in question.

### Adoption is deferred, because widening the declaration is not a local edit

The widening was applied to the three families' offset leaves, and reverted the same hour. What it did, measured:

```text
declaration widened to <length-percentage>
  → the probe table has no <length-percentage> entry
  → those six routes read `unresolved`, magnitudes 0 — evidence *downgraded*, not extended
  → and the admission guard could not see it: it asserts over `movable` records only, so losing one is invisible
the shape reader has no <length-percentage> entry either
  → the probe guard refuses the new probe: `20px` reads as ["length"], and no syntax admits that pair
adding both entries
  → the six return as `movable` at the widened syntax, and 8 more arms run
  → but 5 further records fall from `movable` (2 magnitudes) to `unresolved` (1): under the widened representation
    a second magnitude is lost for pairs whose evidence currently rests on the narrower probe
  → two registry/population guards disagree (38 pairs against a population of 28)
```

So the declaration stays `<percentage>` for now, the differential stays as the admission evidence, and the adoption
is its own increment with three named conditions: a probe for the widened syntax, the shape reader's entry for it,
and an explanation for the five records — measured, not assumed. This is recorded rather than absorbed because the
alternative was a half-working emission: the widened declaration made the six routes *look* fine in the unit suite
while the registry had in fact lost them.

One consequence lands now, and it is the ruling's own boundary: with the leaf still `<percentage>`, a `length` offset
is **unrepresentable** rather than invalid, so the axis resolver declines it and the shipped whole-property route
keeps it. That is the `native-preserved` case, not an error case.

## Correction, accepted: the fallback is `unrepresented`, not `native-preserved` — and it is inert

That last sentence was wrong, and the correction is the ruling's: Gate B proved the shipped single-axis route can be
inert through partial-composition invalidity, so falling back to it is only `native-preserved` **if that declined
spelling has been separately measured to move**. Nobody had measured it. It is measured now, and the answer is the
one the ruling suspected.

```text
same-edge length    animate-background-position-x-[0%|40px]        inert   animation exists, property never moves
                    native reference 0% 0% · calc(0% + 10px) 0% · … · calc(0% + 40px) 0%
edge-changing       animate-background-position-x-[0%|right_40%]   inert   animation exists, property never moves
                    native reference 0% 0% · 15% 0% · 30% 0% · 45% 0% · 60% 0%
```

Both arms passed liveness — the animation exists and the reference moves — so these are findings rather than fixtures.
Neither class is `native-preserved`; both are **inert**, and **declining to the shipped whole-property route is not a
production strategy for either of them**.

Three consequences, recorded now and not acted on beyond naming them:

1. The `<length-percentage>` widening is not a coverage improvement. Length routes are **broken today**, so the
   migration has to own them rather than fall back to them, and the widening moves from improvement to prerequisite.
2. The edge-changing class cannot be repaired by an offset leaf under **any** syntax: its motion lives in the edge,
   a keyword. If it is to be repaired it needs the resolved-component shape (`offset-anchor`'s execution leaves,
   which animate a resolved `<length-percentage>` rather than an edge and an offset) — and that is a question of its
   own, with its own measurement, not something to fold into this migration.
3. Multilayer is unaffected: it routes through the whole property by construction and stays there.

The vocabulary this entry uses, per the ruling: `typed-eligible`, `unrepresented`, `edge-changing`, `multilayer` —
and `native-preserved` is reserved for a spelling a browser has been seen to preserve.

### A standing rule, from fixture defect 17

> **For positional grammar, never infer axis ownership from a visually plausible spelling. Assert which computed
> component actually moved.**

Seventeen defects is enough evidence for the rule, and it is now enforced rather than remembered: the offset-leaf
differential and these fallback arms both name the component they measure, hold the sibling, and fail as
`misattributed` when the wrong one moves.

### A guard-shape lesson from this pass

The first version of these arms put the component assertion in the same list as liveness, so an inert route reported
`unearned` — a fixture complaint about a measurement that was sound, hiding the finding behind it. Liveness and
attribution are different questions, and **"nothing moved" must not share a verdict with "the wrong thing moved"**:
the first is a finding about the route, the second is a defect in the arm. They are separate checks with separate
verdicts now, and the distinction is what let the two inert results be read rather than dismissed.

**State.** No production change. Gate 17/17, 505 unit tests, `tsc` clean; the readings are in
`scripts/fallback-arms-series.json`, and the percentage-only `background-position` spike — a plumbing proof, not the
complete landing — is unaffected by this finding and remains next.

## The resolved-axis falsification: the execution subject is the resolved component, not the offset

That last line is superseded by the ruling that followed it, and the fallback arms are why. A percentage-only spike
would have proven plumbing for a subject already known to be narrower than the public route: the route accepts
percentages, lengths, mixed units, `calc()` and edge-changing positions, while an offset leaf can represent only the
same-edge subset and can represent an edge-changing motion under no syntax at all.

The fallback arms also carried the clue. `left 0% → right 40%` — inert on the shipped route — has a native reference
that walks `0% · 15% · 30% · 45% · 60%`, which is `0% → 60%`: the far endpoint **resolved** through its edge. That is
interpolation in resolved positional-component space, the same architectural split D.3.7 established for
`offset-anchor` — authoring state is not execution state.

So the hypothesis was falsified or confirmed rather than assumed, `offset-anchor` used as a hypothesis and not as a
transfer, single layer only, y pinned on both sides, x first:

```text
same-edge percentage  0% → 40%                                equivalent   0% 0% · 10% 0% · 20% 0% · 30% 0% · 40% 0%
same-edge length      0px → 40px                              equivalent   0px 0% · 10px 0% · 20px 0% · 30px 0% · 40px 0%
mixed units           10px → 40%                              equivalent   calc(0% + 10px) 0% · calc(10% + 7.5px) 0% · … · 40% 0%
edge-changing         0% → calc(100% - 40%)                   equivalent   0% 0% · 15% 0% · 30% 0% · 45% 0% · 60% 0%
arithmetic            calc(10% + 5px) → calc(100% - calc(40% - 5px))  equivalent  calc(10% + 5px) · … · calc(60% + 5px)
```

Every pair agrees sample for sample, and the two books cross-check: the edge-changing reference here is the same
walk the fallback arms measured for `right 40%`, from a different fixture. **Outcome:
`resolved-axis-reproduces-native`** — the hypothesis survived its falsification attempt.

The candidate arm registered the resolved endpoints in a `<length-percentage>` leaf under a static two-value shell
with y pinned, which is the composition a migration would emit; the reference was the browser interpolating the
authored positions, which is the behaviour being claimed. The resolution clauses are restated in the book rather than
imported, following the same precedent as `offset-anchor`'s prototype: production cannot import from `scripts/`, so
the two are read against each other instead.

### What this changes, and what it does not

```text
production subject   authoring  x-edge + x-offset            (unchanged, what an author writes)
execution            x-position <length-percentage>         (resolved, one leaf per moving axis)
```

`background-position`'s public axis routes should normalize each endpoint through the measured clauses and animate
the resolved component, which covers the whole accepted grammar in one subject — lengths, mixed units, `calc()` and
edge-changing positions alike — instead of introducing a second architecture for the edge-changing class.

- **Both axes are not required.** Gate A established independent x/y interpolation, so an x route may animate resolved
  x while static y stays composed. The `offset-anchor` requirement — both execution leaves or none — came from that
  family's own contract and is not inherited.
- **The offset-leaf widening is not needed for this repair**, so it is not touched. Its evidence still stands on its
  own terms: offset *values* inhabit `<length-percentage>` interpolation space. Whether the declaration needs it
  remains an independent production question, and the infrastructure cost it carried — six records recovered, five
  collateral losses, a 38-versus-28 population disagreement — is not paid before that question is answered.
- **Multilayer is untouched**, and `object-position` and `offset-position` stay out until the deep case passes.

**State.** No production change. Gate 17/17, 505 unit tests, `tsc` clean; the readings are in
`scripts/resolved-axis-series.json`, and the next step is the `background-position` spike **with the resolved subject**
— the same five classes proved here, in production, with the shell static and multilayer still on the whole-property
path.

## The spike, encoded and withdrawn: the landing is an increment, and its surface is now measured

The spike was written to the ruling's specification and taken to the point where the model answered back. It is
reverted rather than half-landed, and the tree is green — but the attempt produced the one thing a spike is for: the
**measured surface of the landing**, which is what the next attempt starts from instead of rediscovering.

What was encoded, exactly as ruled:

```text
authoring   x-edge + x-offset, y-edge + y-offset      (unchanged, and the offset leaves were not widened)
execution   x-position / y-position <length-percentage>   (private, execution: true, rests resolved from authoring)
resolver    axis route  → axisEndpoint(value) → axisPosition(edge, offset) → one resolved leaf
            edge/offset route → authoring state → the same normalization
bypass      no `whole` declared, so the whole and multilayer routes keep property-level execution
```

and the model answered with eight failures, none of them a mystery:

```text
TypedExecution.whole is REQUIRED
  → a family cannot omit the whole resolver, so the bypass needs an explicit `whole: () => null` or an optional
    facet. A one-line decision, but a type-level one that the spike should not make silently.

census 326 → 330 pairs, 305 → 309 constituents, buckets 108/101/96 → 110/103/96
  → exactly four pairs arrive: (background-position, background-position-{x,y}-{edge,offset}), the authoring surface
    this family now declares. The same shape D.3.7 recorded when four authoring pairs arrived there — a declared
    consequence, and the numbers belong in the assertions with the reason written beside them.

guards that need an argument, not a number
  names only leaves the family reads, at any depth
    → the offset leaves stop being read by the composition and become authoring vocabulary the resolver consumes.
      They are still correctly declared; the guard's notion of "read" does not yet include "declared as authoring".
  names only leaves the family declares, and every one of them · returns each leaf exactly once
    → the execution declaration's authoring list names components that are not typed leaves of the family
      (`background-position-x` and its edge and offset), so the guard's assumption that authoring entries are
      declared leaves does not hold for this shape.
  evidences every authoring component that has a route, and nothing else — 8 against 2
    → declaring six authoring components for this family demands route evidence for each of them, and the axis and
      edge/offset routes have never been measured. This is the honest cost of the authoring surface, and it is
      evidence to gather rather than a count to move.
  reaches a shorthand the component is two compositions below
    → the reach test's depth changed with the composition, and a structural expectation has to be re-derived.
  says complete exactly where the registry says proven — 36 against 38
    → the completeness guard follows the population, so it moves with the census and has to be reconciled with it.
```

That is the finding: **the `background-position` landing is not a declaration plus a composition, it is a declaration,
a composition, four census numbers, two guard widenings that each need their own argument, route evidence for six
authoring components, and the structural-plus-browser proof the ruling requires.** Each of those is small; several of
them are decisions rather than edits, and the two guard widenings are exactly the kind of thing this track has
established must be argued rather than absorbed — the widening fiasco is the precedent.

Withdrawing it keeps every invariant intact and leaves the next attempt with its surface measured: the browser
semantics are already proven by the falsification, the design is written down here, and the failing assertions are a
checklist rather than a surprise.

**State.** No production change; the offset-leaf declaration is untouched, and `src/composition/background-position.ts`
and `src/variables/property.ts` are byte-identical to what they were before the attempt. Gate 17/17, 505 unit tests,
`tsc` clean.

**State.** No production behaviour changed. Gate 17/17, 505 unit tests, `tsc` clean, and
`scripts/validated-representations.json` is byte-identical to what the previous pass recorded — the differential and
its series are the only new artifacts.
