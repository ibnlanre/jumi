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
| `architecture/aggregate-representation.md` | the carrier protocol, the linked representation that was rejected, and the evaluation cost that set the terms of the hoist — annotated where the two conflict |
| `architecture/carrier-locality.md` | why the aggregate resolves on the carrier, with the browser measurement |
| `architecture/dependency-gap.md` | what still stands between Jumi and independent emission, and why that is a product decision |
| `architecture/effect-model.md` | what an effect is mechanically — one element, one keyframe timeline |
| `architecture/instances.md` | the one derivation of a motion instance from a rule, the two conflation defects that made it a rule rather than a convention, and the test that holds it |
| `architecture/phrases.md` | the shipped phrase grammar, and the host value-parser constraints it works within |
| `decisions/hooks-proposal.md` | a lifecycle-hooks proposal that was never implemented |
| `decisions/CTO.md` | the running record of architectural direction and its approvals |
| `research/deployment.md` | the Vercel contract, and the 2026-09-12 diagnosis of a stale deploy |
| `research/scanner-inventory.md` | candidate discovery: what the host hands a matcher, per candidate |
| `research/upstream-limitation.md` | a parked investigation into a host limitation |
| `research/view-transitions.md` | the View Transition API measured against the emitted model: the composition retargets onto the pseudo-elements and cannot be reached from the source element, the incoming document governs the tree cross-document, the group stays browser-owned, and the hoist means the slot publication must be re-materialized alongside the composition — then the shipped emitter, its eleven invariants, and the falsifications that hold them |
| `research/style-cost.md` | what the aggregate costs DevTools: 863 KB of protocol response for one selected element at 228 slots, 82% of it the declaration payload, and the hoisted representation that removes 61% of it and 60% of the recalc — confirmed by hand at 47 s → 2.7 s in the Inspector, and by the shipped build at 965,683 → 419,673 bytes with 228/228 live animations unchanged |
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

`spike-vt-syntax` is the same workstream one layer down, and it probes the *host* rather than the
platform: given a spelling for "animate the old side of `hero` with this motion", does Tailwind resolve
the candidate, what does it hand Jumi's matcher, and does a label written in one class resolve to the
slots named in another. It compiles one candidate per build on purpose — a candidate the host drops
leaves no row in a batch, which is indistinguishable from one that resolved and did nothing.

`spike-cdp-cost`, `spike-recalc` and `spike-local-list` are kept under the same rule, and together
they are one question seen from three sides. `spike-cdp-cost` measures the aggregate through the
DevTools protocol rather than through the renderer — the cost no other harness looks at, and the one
that made Inspector unusable at 228 slots; it can also park a page on a port so the human-visible
half is checked by hand rather than asserted. `spike-recalc` prices the same representation through
the renderer. `spike-local-list` enumerates the CSS primitives that could remove the cost at the
root and shows each of them selecting rather than accumulating, so that direction stays falsified
instead of being re-proposed. All three build their corpora through the real pipeline, and the two
that construct an alternative representation take it from `scripts/lib/aggregate.mjs` rather than
rebuilding it — shared, so the harnesses cannot disagree about what they are measuring, which is
exactly the failure mode the carrier-protocol spikes died of.

`measure-real-page` is the fourth side, and it is the one that closes the question. The three above
price a *fixture*: `spike-cdp-cost` compiles its own slots from the real plugin, so its activating
selectors are escaped arbitrary values averaging 57 characters against the shipped catalogue's 22 —
a difference that decides the conclusion, because the frontend's cost tracks selector *text*. So the
real page gets its own instrument, which serves a built site, reads every animating element's live
positions, and inspects one element through CDP. It has two modes and they depend on different things:
by default it asserts what needs no baseline at all — every element resolves its own effect, and every
live position resolved its own control — which is what makes it runnable against any build, including
a deployed one; `--compare` adds a diff against a baseline captured before a representation change,
which is an artifact of that change rather than a fixture. It taught itself three things the hard way
— that headless Chromium reports `prefers-reduced-motion: reduce` and the catalogue honours it, that
the catalogue plays a card only while it carries `is-playing`, and that neither of its assertions
means anything until they have been falsified against a tampered baseline and a removed control.

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
