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
