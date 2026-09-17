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
