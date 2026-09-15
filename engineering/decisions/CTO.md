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

### Call

> **Accept the syntax; implementation waits on the granularity ruling.** Unaddressed refused for 1.0,
> addressed allowed, the destructive spelling warns and is structurally blocked, scalar easing unchanged, and
> placement measured before it lands.

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
