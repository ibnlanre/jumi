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
