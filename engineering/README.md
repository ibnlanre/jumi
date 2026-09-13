# Engineering records

This directory explains **how and why Jumi is built**. It is deliberately not part of `docs/`, which
is the public documentation site and nothing else.

Nothing here is private — this is a public repository, and the split is about **intended audience**,
not access control. A reader looking for how to use Jumi wants `docs/`; a reader changing Jumi wants
this.

```text
engineering/
  architecture/   how the machine works, and why it is shaped this way
  decisions/      proposals and decisions, including ones not acted on
  research/       investigations, measurements, and their conclusions
  roadmap/        what is planned, in what order, and what was closed
```

## What lives where

| File | Why it is here |
| --- | --- |
| `architecture/aggregate-representation.md` | the carrier protocol and the measurement that rejected the linked representation |
| `architecture/carrier-locality.md` | why the aggregate resolves on the carrier, with the browser measurement |
| `architecture/dependency-gap.md` | what still stands between Jumi and independent emission, and why that is a product decision |
| `architecture/effect-model.md` | what an effect is mechanically — one element, one keyframe timeline |
| `architecture/phrases.md` | the shipped phrase grammar, and the host value-parser constraints it works within |
| `decisions/hooks-proposal.md` | a lifecycle-hooks proposal that was never implemented |
| `decisions/CTO.md` | the running record of architectural direction and its approvals |
| `research/deployment.md` | the Vercel contract, and the 2026-09-12 diagnosis of a stale deploy |
| `research/scanner-inventory.md` | candidate discovery: what the host hands a matcher, per candidate |
| `research/upstream-limitation.md` | a parked investigation into a host limitation |
| `research/view-transitions.md` | the View Transition API measured against the emitted model: the composition retargets onto the pseudo-elements, and cannot be reached from the source element |
| `roadmap/migration.md` | the migration: its phases, what closed, and what was decided along the way |

## Rules of the split

- **`docs/` is product documentation.** Its audience is someone using Jumi. If a page would not be
  linked from the site's navigation, it does not belong there.
- **`engineering/` is build history and rationale.** Its audience is someone changing Jumi, including
  a future agent, and it is where measurements, rejected options and settled decisions are recorded.
- **Root markdown is the entry point, and only that.** `README.md` introduces the package — it is
  also what npm shows — and `CONTRIBUTING.md` states the rules. Neither is a place for notes,
  incidents or dates; those live here.

## Spikes

`scripts/spike-*.mjs` are throwaway probes: each exists to answer a question by measurement, and each
carries its result in its own header. The rule for keeping one:

> Keep a spike if it still reproduces the phenomenon it documents. Retire it once the architecture it
> probes no longer exists and the result has been captured here.

A stale spike is worse than an absent one, because a reader cannot tell a probe that measures nothing
from one that measures correctly. Two ways to go stale, both seen:

- **it encodes a protocol that changed.** The carrier-protocol spikes read `--jumi-aggregate-*` and
  counted `--jumi-carrier` markers out of emitted CSS. Once the finalizer began materializing the
  carrier's longhands and erasing both, they measured zero — and one of them still exited `0`.
- **it probes a rejected design.** The linked-representation spikes measured an alternative that was
  evaluated and not shipped.

Retired 2026-09-12, with the conclusions kept in `architecture/aggregate-representation.md`,
`architecture/carrier-locality.md` and `roadmap/migration.md`: `spike-aggregate-order`,
`spike-aggregate-read`, `spike-carrier-finalize`, `spike-carrier-seam`, `spike-css-slots`,
`spike-depth-engines`, `spike-linked-order.test`, `spike-real-cost`, `spike-style-cost`, and the
`lib/linked-aggregate.mjs` they shared.

`spike-shared-runtime` was retired under the same rule the day it was written. It answered its
question — module identity across the `@plugin` boundary — and the answer removed the design it was
probing, because a shared instance turned out to be one per *process* rather than one per
stylesheet. The conclusion is in `architecture/carrier-locality.md`.

Kept, because they still reproduce current behaviour: `spike-candidates` (candidate parsing and
order), `spike-variants` (the host variant model, 12/12), and `spike-precedence.html` (a browser
probe for `animation-composition` semantics — a language fact, not Jumi's).

`spike-view-transitions` is kept for the same reason as `spike-precedence.html`, and it is the
larger version of it: it probes the platform, not Jumi, and the platform facts it records — that
`::view-transition-*` pseudo-elements accept the emitted composition unchanged, that a value
declared on the source element cannot reach them, that an author animation on
`::view-transition-group(name)` replaces a shared element's travel — are not facts about a design
Jumi might abandon. Its fixtures are templated by the harness's own server rather than duplicated
per variant, and it is the *only* spike here that needs a served origin: a cross-document transition
requires a same-origin navigation, and `file://` cannot provide one.

`spike-marker-elimination` was retired the same day, under the rule it was written to satisfy: its
question was answered — a semantic fallback declaration survives variants and `@apply`, but is not
unique enough to identify a Jumi-owned carrier rule — and the defect it found on the way was fixed,
so the fixture that documented that defect now measures nothing. The conclusion is in
`architecture/carrier-locality.md`.

`spike-carrier-placement`, `spike-global-carrier` and `spike-inference-placement` were retired
together, when the migration they argued for landed. The first settled that a carrier can be
implicit and that `addBase` is not a safe home for one — a `@layer components` declaration that loses
to a utility-layer carrier beats a base-layer one. The second asked whether the composition could
simply live on `*`, found it correctness-equivalent and retired on cost: a universal carrier scales
with total DOM size rather than with the elements that animate, and splitting inherited substrate
from applied longhands reduced that tax without removing it. The third pinned where inside
`@layer utilities` a synthesized composition belongs, and falsified the start of the layer, which
loses to Tailwind's own arbitrary utilities. All three describe an architecture that no longer
exists — the carrier class is gone, and with it the marker. Their conclusions are in
`architecture/carrier-locality.md`, and the properties they established are now asserted by the
production harnesses rather than by a probe — `behaviour:check` covers the pseudo-element and the
precedence triangle in a browser, `incremental:check` covers the derived-rule count and cache
stability, and `css:check` holds the bytes.

`spike-aggregate-cost` was retired once its question was answered and the conclusion was recorded in
`architecture/aggregate-representation.md`: flattening and hoisting the aggregate's `var()` chains
reduce the cost modestly but do not remove it, because the expense is the number of positions each
animated element resolves. Its corpus measured the realistic scale on the way out — the canonical
corpus discovers 33 slots and the examples app 60 — and it carries a known gap, that the label-scoped
control row never exercised the collision it was written for.

This is principle 10 of `CONTRIBUTING.md`.
