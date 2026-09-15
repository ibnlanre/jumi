# Addressing against the instance model

Measured 2026-09-15 with `pnpm spike:instances` (`scripts/spike-instance-models.mjs`) and
`pnpm spike:addressing`, after motion instances became separable from keyframe definitions. Every number
comes out of a real browser; the model they describe is now the one in `src/`.

The CTO's ruling, as implemented:

```text
1. adopt structural precedence via internal label namespace
2. keep duplicate-control behavior, warn only
4. keep compounds atomic, warn on unusable member labels
```

Item 1 is in `src/` and measured below. Item 2 is unchanged and still a warning. Item 4's semantics are
unchanged — but its _warning_ has no subject, and the reason is a measurement error in this file's own
first version, recorded under "Correction" below.

## Finding 1 — a token is a property or a name, and the build says which

The corpus is chosen so the two readings are distinguishable: `animate-scale-110`,
`animate-rotate-45/scale`, `animation-duration-1000/scale`, **and** `animation-duration-400/rotate`. The
last control is the tell — if the name `scale` also reaches the rotate motion, the author's own control
for it loses.

|                               | names                               | durations    |
| ----------------------------- | ----------------------------------- | ------------ |
| before (one namespace)        | `jumi-scale-d38, jumi-rotate-3zWYd` | **1s, 1s**   |
| after (structural precedence) | `jumi-scale-d38, jumi-rotate-3zWYd` | **1s, 0.4s** |

Before, `animation-duration-400/rotate` was ignored: the labelled slot's link to `--jumi-scale-…` sat
outermost in its chain, so a control the author never wrote for that motion won. After, the author's
control wins, the label link is gone, and the name is reported:

```text
"scale" names a motion, but it is also a property Jumi animates, so a control written `/scale` reads that
property — every motion animating it, not this one. Reword the name to time this motion on its own.
```

The mechanism is one discriminator plus one namespace:

```text
structural token (a property Jumi animates, or an effect)  →  --jumi-rotate-animation-duration
anything else                                              →  --jumi-label-flick-animation-duration
```

- `structuralAddress` (`@/core`) is **static**: `propertyVariables` keys plus `effectKeyframes` keys. A
  sheet-dependent reading — "does this stylesheet animate scale?" — would make `/scale` change meaning
  when an unrelated element elsewhere started animating scale, which is the element-local inference this
  work exists to remove, one level up.
- The finalizer's label link reads `var(--jumi-label-<name>-<part>)`, so a name can never fill a property
  scope, and an identity label (`animate-rotate-45/rotate`) simply keeps the scope it always read.
- A name that is a structural address is recorded (`--jumi-name-<hash>-shadowed`) instead of linked, so
  the stylesheet carries no address nothing fills.

**Rejected models.** _Explicit-label precedence_ ("`/scale` reaches the labelled motion because a label
exists on this element") needs the element's class list, which the matcher never sees and the finalizer
cannot reconstruct. _A disambiguation spelling_ is new public syntax, which the ruling rules out. Writing
**both** namespaces from one control is also wrong, and measurable: the label link would then be filled
for the colliding token and the hijack would return unchanged — which is why the classification has to
happen before the declaration is written.

**Cost.** Six characters per labelled control declaration. Canonical fixture bytes 45,689 → 45,929
(+0.53%); `rawBytes` +120 on the corpus. Two unit tests moved with the namespace, and the old
"leaves the link inheritable when a label is the attribute name" test became the stronger invariant it was
reaching for: no name is ever registered outside the label namespace.

**Accepted behaviour change.** A motion labelled with the exact name of a property it does not animate can
no longer be addressed by that word (`animate-rotate-45/opacity` + `animation-duration-500/opacity` reaches
the opacity property and no longer the rotate motion). That is the side the ruling chose deliberately:
structural addresses are implicit, stable and part of the model. The build reports it, so it is a rename
rather than a mystery.

**What did not change.** Finding 2 (`animation-duration-1000/scale` then `animation-duration-400/scale` →
`1s`) and finding 3 (two names over one phrase → `0.2s, 1.8s`) are untouched, as is every addressing case
in `pnpm spike:addressing`: baseline `1.2s`, label `0.8s`, orphan label and orphan slot inert, same name
twice one instance.

## Finding 4 — atomic, and the browser is why

**The plain-CSS question** (no Jumi involved): can two animations of one compound property both take
effect? Sampled at 50% of a one-second animation, under Jumi's default composition and with `add`:

| property    | `animation-composition: replace`      | `animation-composition: add`         |
| ----------- | ------------------------------------- | ------------------------------------ |
| `filter`    | `brightness(1.8024)` — **blur gone**  | `blur(8.81442px) brightness(1.8024)` |
| `transform` | one matrix — the later animation wins | a combined matrix                    |

So splitting a compound into independently timed members would make a label change rendering: under the
default, half the value disappears. That is the ruling's "keep compounds atomic", and it is what the
shipped model does — one keyframe per attribute, one position, one timing:

```text
animate-filter-blur-[4px]/foo  animate-filter-brightness-125
animation-duration-900/filter   animation-duration-500/foo

selectors: .animate-filter-blur-\[4px\]\/foo, .animate-filter-brightness-125
name:      jumi-filter        ← one motion, both members
duration:  0.5s               ← /foo names that one motion
/foo wrote: --jumi-label-foo-animation-duration: 500ms
link:       --jumi-slot-filter-animation-duration: var(--jumi-label-foo-animation-duration)
```

A label on a member is therefore **usable**, and it names the compound: `/foo` times the whole `filter`
motion, not the blur member on its own. Nothing is unusable, so nothing is warned about.

**Why model C — "a labelled member becomes its own instance" — was never on the table.** A composed tween
resolves one shared `jumi-<attribute>` keyframe, so two elements composing different members must all run
the same keyframe; giving an instance its own definition would mean cloning it, which is exactly the
conflation the identity refactor removed. The measurement above is the second reason, and the stronger
one: it is not merely expensive, it changes the rendering.

### Correction: the first version of this file measured a class that never existed

The probe that produced the CTO's ruling used `animate-filter-blur-4`, which is **not a candidate**:
`animate-filter-blur` is `type: 'length'` against the blur theme, so a bare `4` resolves to nothing and
Tailwind drops the whole candidate silently — no rule, no warning. Only `animate-filter-brightness-125`
compiled, which made the page animate anyway and look correct. The measurements built on it were
therefore about a member that was never emitted:

| corpus                          | earlier reading          | actual                                         |
| ------------------------------- | ------------------------ | ---------------------------------------------- |
| `animate-filter-blur-4` alone   | "compiles, one member"   | **dropped — no rule**                          |
| `animate-filter-blur-4/foo`     | "the label is discarded" | the label never existed                        |
| `animate-filter-blur-[4px]/foo` | —                        | label declared, compound answers to it, `0.5s` |

`engineering/research/addressing.md` finding 4 and its table row carried the same error and are corrected
in place. The lesson is the one this repository keeps paying for: a probe that does not print what
actually compiled cannot tell "dropped" from "did nothing" — so `scripts/spike-instance-models.mjs` now
prints the selectors it compiled next to the durations it measured, and `pnpm spike:addressing` uses the
`[4px]` spelling.

## Two defects the implementation exposed

Neither was in the ruling, and both were found by the permanent assertions rather than by reasoning about
the change — the first because a new arm was added to `behaviour:check`, the second because that arm's fix
broke a range check that had been passing for the wrong reason.

**A named instance also ran the unnamed one.** `hoist` published the definition's base key _in addition to_
every name a rule wrote down, on the reasoning that a rule activating a definition could mean either
instance. It cannot: the unnamed instance is what a _different_ candidate declared. Measured, with
`animate-scale-110` and `animate-scale-110/loop` in one sheet, an element carrying only the named candidate
resolved `jumi-scale-d38, jumi-scale-d38` — the keyframe twice, at `0.9s` and `1s` — and which one the
browser kept depended on the aggregate's position order: `0.9s, 1s` in one candidate order, `1s, 0.9s` in
the other. Now a rule publishes the instances it named, or the definition's own when it named none
(`instanceKeys`, `src/helpers/carriers/instance.ts`), and the new assertion holds: _candidate order cannot
decide which name wins_.

**The range publication ranged the definition, not the instance.** `rangeReadings` read the slot off the
activation alone, so `animation-range-entry:animate-opacity-[0:0|100:1]/reveal` published
`--jumi-opacity-sluPU-animation-range` while the named instance's chain read its own key. It passed before
only because of the duplicate above: the element also activated the base instance, which is the one the
range landed on. Both passes now derive the instance the same way, from the same helper — measured,
`43/43 scroll-driven behaviours hold` where the named phrase had fallen back to the whole range.

The second one is the argument for the refactor as much as the fix: two passes needed the same two facts
about a rule, and each derived them itself. The repository's own warning about "no second list can stay in
step" applies to a derivation as much as to a list. Both are now held by
`../architecture/instances.md` — the rule, the cases, and the assertion that keeps a third pass from writing
a fourth copy.

## Recommendation, as taken

```text
1. structural precedence via the internal label namespace — implemented, measured 1s, 0.4s
2. duplicate controls for one address — unchanged behaviour, reported rather than ordered
4. compounds stay atomic; a member label names the compound — unchanged behaviour, nothing to warn
```

The one warning the ruling asked for that this work does not add is "a label/control address that nothing
reads". It is deliberately absent for a documented reason (`src/helpers/carriers/index.ts`, "Deliberately
not here: an unused name warning"): a control configures motion and does not create it, so
`animation-duration-500/reveal` with no `reveal` is as inert as `animation-duration-500` — and a
conditional motion beside an unconditional named control (`motion-safe:animate-fade-in/reveal`) is a real
pattern, not an authoring mistake. The workable half of that signal is the one shipped here: the address
that _cannot_ work — a name a property already owns — is reported, because there is a specific remedy.

---
