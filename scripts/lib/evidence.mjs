import { readFileSync } from 'node:fs'

import { readTypedLeaves } from './property-model.mjs'
import { root } from './property-model.mjs'

import path from 'node:path'

/**
 * The evidence on record, as **records rather than verdicts**, and keyed by **pair**.
 *
 * Pass two projects; it does not measure. So what lives here is what already exists — the source it came from,
 * the representation it was measured under, the scope of what was actually observed — and the projection is a
 * join, not a re-derivation.
 *
 * The unit is the pair `(parent, component)`, because that is the census's unit and because a verdict measured
 * through one parent says nothing about the same component through another: `scale-x` is composed by `scale`
 * and by `scale-3d`, and the arms animate the first. Keying by component was a **real error here** — it made
 * `(scale-3d, scale-x)` look covered when nothing has ever been measured through that parent, and that pair has
 * no candidate of its own, so it is not even describable. The projection's assertions caught it, which is the
 * argument for having them rather than for trusting the data.
 *
 * Two classes stay apart:
 *
 *   `declared`   the model carries the representation (`readTypedLeaves`). The only class that can count as
 *                *coverage*, because it is evidence about a registration the plugin emits.
 *   `proposed`   a book justified a representation and measured it. Real evidence about a *potential*
 *                representation, and not coverage: nothing in the model declares it, so no such pair reaches
 *                the descriptor-complete population at all.
 *
 * A verdict belongs to the representation it was measured under: `translate-z` is declared `<length>` with
 * `lengthOnly` while its siblings are `<length-percentage>` with `lengthish`, so the records are separate even
 * though one book measured both.
 */

const pairOf = (parent, component) => ({ component, parent })

/**
 * Evidence measured under a representation the **model declares**.
 *
 * `scope` is deliberately narrow — what was observed, and which standing arms hold it. The distinction it
 * keeps is the one D.2 left behind: a *curve* arm and a *definition* arm are different evidence, and only one
 * of the two is a standing gate for the second family.
 */
export const declared = [
  {
    pairs: ['scale-x', 'scale-y', 'scale-z'].map(component =>
      pairOf('scale', component),
    ),
    representation:
      'declared — `<number> | <percentage>`, rests at `1`, `scaleFactorToNumber`',
    scope:
      'rest and interpolation: five composition curves on computed `scale` at 0/25/50/75/100%, held by the standing gate',
    source: 'scripts/behaviour-check.mjs · §16 (five typed composition curves)',
    verdict: 'movable',
  },
  {
    pairs: ['translate-x', 'translate-y'].map(component =>
      pairOf('translate', component),
    ),
    representation:
      'declared — `<length-percentage>`, rests at `0px`, `lengthish`',
    scope:
      "rest and interpolation: D.2's landing measured curves identical to the old path in every case; the standing gate holds the definition contract (one definition, each element settling at its own value), not a curve arm for this family",
    source:
      'scripts/behaviour-check.mjs · §17 (the translate reuse arm) + the D.2 landing record in this log',
    verdict: 'movable',
  },
  {
    pairs: [pairOf('translate', 'translate-z')],
    representation: 'declared — `<length>`, rests at `0px`, `lengthOnly`',
    scope:
      "rest and interpolation, measured at D.2's landing under this leaf's own declaration — which differs from its siblings' (`<length>` and `lengthOnly`, because a percentage on the z axis has no meaning to give it)",
    source: 'the D.2 landing record in this log',
    verdict: 'movable',
  },
]

/**
 * Evidence measured under a representation a **book proposed**.
 *
 * None of these is model coverage, and the projection must not count them as such. They are the *workstream*
 * evidence: every one of these pairs stops pass one on `no declared representation`, so the finding is already
 * in hand and only the declaration is missing.
 */
export const proposed = [
  {
    pairs: [pairOf('font', 'font-weight')],
    representation: 'proposed — `<number>` (the engine reads `normal` = 400)',
    source: 'scripts/research/d3-interpolation.mjs · arm A',
    verdict: 'movable',
  },
  {
    pairs: [pairOf('gap', 'column-gap')],
    representation: "proposed — `<length>` at the candidate's own first frame",
    source: 'scripts/research/d3-observation.mjs · arm B',
    verdict: 'unresolved (the rest is `normal`, which `<length>` cannot hold)',
  },
  {
    pairs: [pairOf('background-position-x', 'background-position-x-edge')],
    representation:
      'proposed — `<length-percentage>` (the longhand reads `left` = `0%`)',
    source: 'scripts/research/d3-observation.mjs · arm C',
    verdict:
      'interpolation-unsafe (the shorthand wants an edge keyword, not a percentage)',
  },
  // Retired, and kept as a note rather than dropped silently: `(background-position-x,
  // background-position-x-offset)` was proposed here from D.3.4's arm C, then D.3.5's pass three measured it
  // under a derived syntax and the model declared it. A proposal that has become a declaration is no longer a
  // proposal, and `promoted()` exists to fail when one stays in this list.
  {
    pairs: [pairOf('border-bottom', 'border-bottom-width')],
    representation:
      'proposed — `<length>`; the fixture is blind at `border-style: none`',
    source: 'scripts/research/d3-observation.mjs · arm D',
    verdict: 'fixture-unobservable (no architectural verdict)',
  },
]

/**
 * Evidence measured under a representation the model declares **because this pass validated it**.
 *
 * Read from the record `scripts/research/d3-validation.mjs` writes rather than restated here, and that is the
 * whole point: a registry transcribed by hand is a second copy of the measurement, and the two would disagree
 * the first time a pair was re-measured. The record carries the pair, the syntax, the initial value and the
 * verdict, so everything below is a projection of it rather than an assertion beside it.
 *
 * Nothing here is *coverage* on its own — the model's declarations are, and this is the evidence they are
 * admitted by. `typed-leaves.test.ts` is where the two are tied together, exactly.
 */
export const validated = () =>
  JSON.parse(
    readFileSync(
      path.join(root, 'scripts', 'validated-representations.json'),
      'utf8',
    ),
  )
    // One record per **route** — a pair and the family it is executed through — because a declaration is keyed
    // `(family, leaf)` and a pair reached two ways has two registrations to justify. Reading `pairs` was the
    // shape that let three corners be declared under `border-radius` and the fourth under its own property.
    .routes.filter(one => one.verdict === 'movable')
    .map(one => ({
      pairs: [pairOf(one.parent, one.component)],
      representation: `declared — \`${one.syntax}\`, rests at \`${one.initialValue}\``,
      scope: `rest and interpolation on \`${one.consumer}\`, ${one.magnitudes} authored magnitude(s), generated arm`,
      source: 'scripts/research/d3-validation.mjs · pass three',
      verdict: 'movable',
    }))

/** The record covering one pair, among the records of one class. */
export const recordFor = ({ component, parent }, records = coverage()) =>
  records.find(one =>
    one.pairs.some(
      pair => pair.component === component && pair.parent === parent,
    ),
  ) ?? null

/** Every class a pair can be covered by: a declaration the model carries, or one this pass validated. */
export const coverage = () => [...declared, ...validated()]

/**
 * Pass two, as a join: every descriptor-complete pair gets a verdict and a citation, or an explicit
 * `unresolved` with the reason it has none.
 *
 * It cannot invent a representation (the descriptor's came from `readTypedLeaves`), it cannot invent a
 * measurement (the verdict comes from a record, with its source), and it cannot promote a proposal to coverage:
 * the `proposed` class is never consulted here.
 */
export const project = descriptors =>
  descriptors.map(descriptor => {
    const record = recordFor({
      component: descriptor.component,
      parent: descriptor.parent,
    })

    return record
      ? { descriptor, record, status: 'projected', verdict: record.verdict }
      : {
          descriptor,
          reason:
            'no evidence on record under the representation the model declares for this pair',
          record: null,
          status: 'classification unresolved',
          verdict: 'unresolved',
        }
  })

/** Every **pair** the coverage class names — distinct, because a class is a set of relationships and not of routes. */
export const declaredPairs = () => {
  const pairs = coverage().flatMap(one => one.pairs)
  const seen = new Set()

  return pairs.filter(one => {
    const key = `${one.parent}\u0000${one.component}`

    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

/**
 * The proposals whose pair the model also declares — the intersection that must stay empty, because a proposal
 * that has become a declaration is no longer a proposal and belongs in `declared` with the declaration as its
 * source.
 */
export const promoted = () => {
  const leaves = readTypedLeaves()

  return proposed.filter(one =>
    one.pairs.some(pair => leaves.has(pair.component)),
  )
}
