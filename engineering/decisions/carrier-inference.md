# Carrier inference: accepted, not yet implemented

The decision is that `animations` and `transitions` leave userland. A carrier stops being a class the
author writes and becomes a selector set the finalizer derives from the stylesheet it is given —
whichever rules demonstrably activate a Jumi slot. Nothing in this file is implemented yet; it is the
record of what was measured, what the implementation has to preserve, and what is left to do.

---

## The change, in one line

> Preserve the carrier's cascade position; replace only its selector set.

Today the carrier is a candidate, so it lands in `@layer utilities` where `animations` sorts, and the
finalizer materializes into every rule that carries `--jumi-carrier`. After this change the carrier is
an **internal shell** emitted with `addUtilities` — always, because no author writes it — whose marker
names the kind and whose selector the finalizer rewrites to the list of activating selectors.

That is the whole mechanism. Everything else is surface.

## Why, produced by measurement rather than argument

| question | result |
| --- | --- |
| does an implicit carrier behave the same? | yes — every case in the correctness matrix and every cascade context, including `@media` matching and not, `@supports`, another layer, a pseudo-element, hover with the pointer actually over the element, and `@apply` of a utility alone (which starts working) |
| is a universal `*` carrier viable? | no — about 1 ms per 1,000 elements per style recalc, where the opt-in holds it at zero |
| does grouping selectors across contexts change the cascade? | no — the *activation* is a variable the utility declares inside its own context, and the composition only reads it |
| does it survive a growing sheet and two entrypoints? | yes — one rule rewritten in place; two compilers, two independent rules |
| is a per-activating-rule aggregate affordable? | no — 68× the stylesheet at 100 slots |
| is a grouped aggregate affordable? | yes — within 2% of today's bytes |
| does `addBase` work as the shell's sink? | **no** — a `@layer components` declaration that loses to the utility-layer carrier beats a base-layer one; specificities match and the layer decides |
| what happens with nothing to annotate? | the shell must be dropped — an empty selector list is not a rule, and a leftover marker trips the zero-occurrence invariant on a stylesheet that is not wrong |

The carrier is located by an activation, not by a namespace: a rule declaring a generated
`--jumi-<label>-animation-name`, or `--jumi-<motion>-transition-<part>`. Both patterns require a
segment between `--jumi-` and the suffix, which is what excludes the substrate
(`--jumi-animation-name`, `--jumi-transition-property`) by construction rather than by a blocklist,
and a control declares a different property again — so a control alone stays inert.

## What the implementation must preserve

1. **Cascade position.** `addUtilities`, not `addBase`. The shell keeps the layer the carrier utility
   occupied, so every fight with author CSS resolves as it does today.
2. **Selector order is deterministic.** The list is synthesized from many rules, so it is deduped and
   ordered by document position. Byte-stable output across a fresh build and an incremental rebuild is
   a requirement, not an outcome of whatever a PostCSS walk happens to visit first.
3. **Zero activators drops the shell.** No empty rule, no marker.
4. **The substrate goes to `:root`**, where it is inherited and costs nothing per element — with
   `interpolate-size` staying on the shell, because it is an inherited *real* property and moving it to
   `:root` would turn it on for every element on the page.
5. **The marker stays** as the rendezvous between the shell and the finalizer. It remains build-time
   only, and the zero-occurrence invariant still holds.
6. **The carrier's own declarations stay the contract.** A part is written only where the shell
   declares it, so the two kinds never receive each other's lists.

## Consequences

- The public story becomes `class="animate-rotate-45 animation-duration-500"`, with no opt-in.
- `@apply`ing a Jumi utility without also applying the carrier starts working, which it does not today.
- `animations` and `transitions` are removed from the utilities, the tests, the harnesses, the byte
  snapshot and the eight documentation pages that teach them.
- A stylesheet with no Jumi motion gets *smaller*, not an inert internal rule.

## What this does not fix

The aggregate's evaluation cost. Each animated element still resolves every position in the
stylesheet-wide slot vector, and flattening or hoisting those chains moves the number by 11–19% while
changing semantics for shared controls. See `architecture/aggregate-representation.md`. Reducing it
means reducing the number of positions an element resolves, which is a change to what a slot universe
*is*.

## Status of the evidence

`scripts/spike-carrier-placement.mjs` carries the results in its header and stays until the migration
lands, at which point it describes an architecture that no longer exists and should be retired under
the usual rule. `scripts/spike-aggregate-cost.mjs` has been retired, with its conclusion in
`architecture/aggregate-representation.md`.
