import { censusPopulation, servingCandidates } from '../lib/observation.mjs'
import { bucketOf } from '../lib/property-model.mjs'

/**
 * The residual reshape ledger: **what D.3 has left**, as opposed to what the census still calls `reshape`.
 *
 * The census's morphology describes the *structure* of a pair — the interpolation unit is a function, an argument
 * inside one, or a composition of its own — and it was the right priority queue while every reshape pair was an
 * open question. It is not one any more: four passes have settled the largest families, several of them by declining
 * to migrate them, and none of those decisions is visible in `reshape: 96`.
 *
 * So this book separates the two axes. Morphology comes from the census; **decision status** comes from the passes
 * that measured it, and is declared here with the pass that decided it, because a research result is not derivable
 * from the model. What is derivable is everything else: whether a candidate serves the pair, which families still
 * have no measurement at all, and how many public routes an unmeasured family exposes.
 *
 * Run: `pnpm research:d3-residual` — prints the ledger and ranks the unmeasured set.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', '..')

/**
 * The settled families, each with the pass that decided it and the reason in one line. Nothing here is inferred
 * from the model: every entry is the conclusion of a measurement recorded in `engineering/decisions/CTO.md`, and a
 * family absent from this table is `unmeasured` by construction rather than by omission.
 */
const SETTLED = new Map([
  [
    'backdrop-filter',
    {
      granularity: 'route',
      production: 'unchanged',
      reason:
        'separable in six combinations including nested drop-shadow; shipped execution is native-equivalent',
      research: 'safe-no-need',
    },
  ],
  [
    'backdrop-filter-drop-shadow',
    {
      granularity: 'route',
      production: 'unchanged',
      reason:
        'the nested argument of a separable family, measured in both gates',
      research: 'safe-no-need',
    },
  ],
  [
    'background-position',
    {
      granularity: 'route',
      production: 'migrated',
      reason:
        'D.3.9 (096ea5f): resolved-axis execution — each axis route writes a private <length-percentage> leaf, the property reads the resolved pair, whole and multilayer keep property-level execution; six routes inert before, six movable after',
      research: 'migrated',
    },
  ],
  [
    'background-repeat',
    {
      granularity: 'route',
      production: 'native',
      reason:
        'D.3.9 survey: the public route animates the longhand directly (attribute === component, no parts) and its grammar is `any` over the discrete keywords repeat/no-repeat/space/round — there is no interpolable subject to reshape',
      research: 'keyword-discrete',
    },
  ],
  [
    'background-size',
    {
      granularity: 'pair',
      production: 'native',
      reason:
        'Gate B with a native reference: the percentage and auto spellings are sample-for-sample native, so the discrete auto flip is what the property does rather than what the route fails to do',
      research: 'safe-no-need',
    },
  ],
  [
    'border-image',
    {
      granularity: 'route',
      production: 'native',
      reason:
        'Gate B and Gate A with a native reference: every single-value route (number and length) is sample-for-sample native; multi-value spellings emit nothing, which is route reach rather than interpolation',
      research: 'safe-no-need',
    },
  ],
  [
    'filter',
    {
      granularity: 'route',
      production: 'unchanged',
      reason:
        'separable in six combinations including nested drop-shadow; shipped execution is native-equivalent',
      research: 'safe-no-need',
    },
  ],
  [
    'filter-drop-shadow',
    {
      granularity: 'route',
      production: 'unchanged',
      reason:
        'the nested argument of a separable family, measured as an argument and as part of a coexistence arm',
      research: 'safe-no-need',
    },
  ],
  [
    'math-depth',
    {
      granularity: 'family',
      production: 'migrated',
      reason:
        'the function-argument reshape landed in D.3.6: static shell, typed argument, argument as the subject',
      research: 'migrated',
    },
  ],
  [
    'matrix',
    {
      granularity: 'family',
      production: 'native',
      reason:
        'coupled: the control passes and both adversarial simultaneous arms diverge',
      research: 'coupled-native',
    },
  ],
  [
    'matrix-3d',
    {
      granularity: 'family',
      production: 'native',
      reason:
        'coupled: two coefficients moving together diverge from native, and sixteen are not independent',
      research: 'coupled-native',
    },
  ],
  [
    'object-position',
    {
      granularity: 'route',
      production: 'migrated',
      reason:
        'D.3.11: resolved-axis execution, the same repair as `background-position` — each axis route writes a private <length-percentage> leaf and the property reads the resolved pair. Six routes: four movable (x, y, and both offsets) and the two edge routes equivalent-no-op, their endpoint `calc(100% - 50%)` native-equal to the resting `50%`, proved against a native reference that is flat where the discriminating control moves',
      research: 'migrated',
    },
  ],
  [
    'offset-position',
    {
      granularity: 'route',
      production: 'migrated',
      reason:
        'D.3.11: resolved-axis execution again, with the same split — four movable routes and two equivalent-no-op edge routes. `normal` survives because the constituent path compiles no unconditional declaration, so an unauthored value is never asserted over',
      research: 'migrated',
    },
  ],
  [
    'perspective-3d',
    {
      granularity: 'pair',
      production: 'native',
      reason:
        'Gate 0: no candidate addresses it — there is no route to migrate',
      research: 'no-candidate',
    },
  ],
  [
    'rotate-3d',
    {
      granularity: 'family',
      production: 'native',
      reason:
        'coupled: a fixed axis reproduces native, a turning axis beside a turning angle does not',
      research: 'coupled-native',
    },
  ],
  [
    'scale-3d',
    {
      granularity: 'family',
      production: 'unchanged',
      reason:
        'separable (D.3.8, single and three-way); no candidate serves its constituents',
      research: 'safe-no-need',
    },
  ],
  [
    'skew',
    {
      granularity: 'family',
      production: 'native',
      reason:
        'Gate B: interpolates to the named matrix, linearly and exactly (tan of the angle) — separable and unnecessary',
      research: 'safe-no-need',
    },
  ],
  [
    'translate-3d',
    {
      granularity: 'family',
      production: 'unchanged',
      reason:
        'separable (D.3.8); co-existence with another transform participant already composes, so typed-whole migration repairs nothing',
      research: 'safe-no-need',
    },
  ],
])

/** Verdicts already recorded per route, so a family the pass could not observe says so instead of looking open. */
const evidence = JSON.parse(
  fs.readFileSync(
    path.join(root, 'scripts', 'validated-representations.json'),
    'utf8',
  ),
)
const unobservable = new Set(
  (evidence.routes ?? [])
    .filter(one => one.verdict === 'fixture-unobservable')
    .map(one => one.component),
)

const reshape = censusPopulation().filter(
  one => bucketOf(one.parent, one.component) === 'reshape',
)

/**
 * A pair's status, resolved **per pair before per family**.
 *
 * `transform` is why. Its seven reshape pairs are the seven slots its composition reads — `perspective-3d`,
 * `matrix`, `matrix-3d`, `rotate-3d`, `scale-3d`, `skew`, `translate-3d` — and five of those are families D.3.8
 * has already settled. A family-level ledger calls `transform` the largest unmeasured parent in the bucket; resolved
 * per pair, its actual residue is two slots, and the rank has to see that or it will send the next pass into work
 * that is already decided.
 */
const pairStatus = one =>
  SETTLED.get(one.component)?.research ??
  SETTLED.get(one.parent)?.research ??
  null

const families = [...new Set(reshape.map(one => one.parent))].sort()

const ledger = families.map(family => {
  const pairs = reshape.filter(one => one.parent === family)
  const open = pairs.filter(one => !pairStatus(one))
  const routes = open.flatMap(one => servingCandidates(one))
  const settled = SETTLED.get(family)
  const observable = pairs.filter(one => !unobservable.has(one.component))

  /**
   * **Gate 0 before anything else**, and derived rather than declared: a family whose open pairs no candidate
   * addresses has no route to migrate, no behaviour to measure and nothing to repair. Classifying it `unmeasured`
   * says the opposite — that work remains — and ten such families is the difference between a queue and a closed
   * ledger. The candidate table is the authority, so this is a reading of the model rather than a hand-written
   * entry per family.
   */
  const reachable = open.flatMap(one => servingCandidates(one))
  const research =
    settled?.research ??
    (observable.length === 0
      ? 'fixture-unobservable'
      : reachable.length === 0
        ? 'no-candidate'
        : 'unmeasured')

  return {
    candidates: open.filter(one => servingCandidates(one).length > 0).length,
    family,
    /**
     * At what level the verdict was decided. `transform` is why the column exists: a family-level reading of it
     * hides that five of its seven pairs are settled elsewhere, and `background` is the same shape one step on —
     * its three pairs are served by candidates that address the *constituent longhands*, so a verdict about the
     * parent says nothing about the routes that actually exist.
     */
    granularity:
      settled?.granularity ?? (open.length < pairs.length ? 'pair' : 'none'),
    openPairs: open.map(one => one.component),
    pairCount: pairs.length,
    pairs: pairs.map(one => one.component),
    production: settled?.production ?? 'unknown',
    reason:
      settled?.reason ??
      (research === 'fixture-unobservable'
        ? 'every route the validation pass could plan here was unobservable in this environment'
        : open.length < pairs.length
          ? `${pairs.length - open.length} of ${pairs.length} pairs name a family that is already settled, so the family is open only for the rest`
          : 'no pass has measured this family'),
    research,
    routeCount: new Set(routes.map(one => one.name)).size,
  }
})

/**
 * The rank, and it is not the pair count. A family is worth opening when it has **reachable public routes** — pairs
 * a candidate can actually drive — because a family no candidate serves has nothing to demote or promote, whatever
 * its morphology says.
 */
const unmeasured = ledger
  .filter(one => one.research === 'unmeasured' && one.openPairs.length > 0)
  .sort(
    (one, two) =>
      two.routeCount - one.routeCount ||
      two.openPairs.length - one.openPairs.length ||
      one.family.localeCompare(two.family),
  )

const tally = {}
for (const one of ledger) tally[one.research] = (tally[one.research] ?? 0) + 1

const target = path.join(root, 'scripts', 'reshape-residual.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ records: ledger, tally, unmeasured }, null, 2)}\n`,
)

console.log(
  `reshape pairs ${reshape.length} across ${families.length} parents — ${Object.entries(
    tally,
  )
    .map(([status, count]) => `${status} ${count}`)
    .join(' · ')}\n`,
)

for (const one of ledger)
  console.log(
    `${one.family.padEnd(28)} ${one.research.padEnd(20)} ${one.granularity.padEnd(7)} open=${String(one.openPairs.length).padEnd(3)} of=${String(one.pairCount).padEnd(3)} routes=${String(one.routeCount).padEnd(3)} candidates=${one.candidates}`,
  )

console.log('\nopen, ranked by reachable routes then open pairs:')

for (const one of unmeasured)
  console.log(
    `  ${one.family.padEnd(28)} routes=${String(one.routeCount).padEnd(3)} open=${String(one.openPairs.length).padEnd(3)} ${one.openPairs.slice(0, 4).join(', ')}${one.openPairs.length > 4 ? ', …' : ''}`,
  )

console.log(`\nwritten to \`${path.relative(root, target)}\``)
