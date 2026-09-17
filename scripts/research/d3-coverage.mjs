import { describe, population } from '../lib/observation.mjs'
import { bucketOf } from '../lib/property-model.mjs'

/**
 * D.3.5 · pass one: descriptor coverage. **Scale the protocol, not the guesses.**
 *
 * The CTO's ordering for the scale-up is derive → mark → classify, and this book is only the first two
 * steps: it asks what the **model** can justify for each pair, stops there, and reports where it stopped and
 * why. No browser, no compile, no verdict — asking the engine here would answer a different question, and a
 * pass that both derives and classifies is the one that starts making things up to avoid an empty cell.
 *
 * A descriptor is **complete** when the model carries all of it:
 *
 *   candidate        a class that addresses the pair — as a part of its parent, or as the attribute whole
 *   consumer         the property that class hands the value to, reachable through *this* pair's chain
 *   representation   the typed leaf the model declares for the component (syntax + value at rest)
 *
 * `d3-observation.mjs` measured one example per observation class by hand; this pass asks how much of the
 * population could be measured that way at all. The answer is deliberately not a migration plan — it is a
 * map of which kind of work each pair needs next, and the two reasons a pair stops are different work:
 *
 *   no candidate            the candidate table does not address this pair (or addresses it through the
 *                           other of two parents); authoring a motion is the work
 *   no representation       the model declares no typed leaf; supplying the semantics the migration needs
 *                           is the work — and it is the honest answer to "is this ready?", not a defect
 *
 * Machinery is reported rather than counted as reach, and **which pairs those are comes from the census's own
 * predicate** (`bucketOf` in `scripts/lib/property-model.mjs`). That predicate used to exist twice — here and
 * in `src/variables/reach.test.ts` — and the two copies disagreed about the *representation* rather than about
 * the rule: the census evaluated the model and saw `scroll(var(--jumi-animation-timeline-axis) var(…))` while a
 * source reader saw the identifier `animationTimelineScroll`, so a depth test could not fire and nine reshapes
 * were counted as machinery — `324 - 30 = 294` "reach" against the census's `324 - 21 = 303`. Two readers,
 * one model, two populations. There is now one predicate, and `scripts/lib/property-model.test.mjs` pins it
 * against the evaluated model **entry for entry**: every one of the 624 values must resolve to the value the
 * plugin evaluates, so the same disagreement cannot return through a different door.
 *
 * The classification section is a **citation list, not a re-measurement**: pass one derives, pass two projects,
 * and anything already measured by a landed book is quoted with its source rather than measured again. Each
 * entry records the representation it was measured under, because a verdict belongs to the tested
 * representation and not to the constituent forever.
 *
 * The two passes are kept apart for a reason worth stating: **descriptor completeness is not a verdict**, and
 * a complete descriptor with no qualifying evidence is a state pass two has to be able to report rather than a
 * gap to paper over.
 *
 * Run: `node scripts/research/d3-coverage.mjs` (exits non-zero if the shape changes unexpectedly).
 */

/**
 * The verdicts already on record, with the representation each was measured under and where it was measured.
 *
 * `declared` means the model carries the representation; `proposed` means a book justified one and measured
 * it, which is evidence about *that representation* and not yet model metadata.
 */
/** The population's buckets come from `bucketOf`, so this file keeps no copy of the rule. */
const ON_RECORD = [
  {
    component: 'scale-x/y/z',
    representation: 'declared — `<number> | <percentage>`, rests at `1`',
    source: 'scripts/research/d2-acceptance.mjs',
    verdict: 'movable',
  },
  {
    component: 'translate-x/y/z',
    representation:
      'declared — `<length-percentage>` (`z`: `<length>`), rests at `0px`',
    source: 'scripts/research/d2-acceptance.mjs',
    verdict: 'movable',
  },
  {
    component: 'font-weight',
    representation: 'proposed — `<number>` (the engine reads `normal` = 400)',
    source: 'scripts/research/d3-interpolation.mjs · arm A',
    verdict: 'movable',
  },
  {
    component: 'column-gap',
    representation: "proposed — `<length>` at the candidate's own first frame",
    source: 'scripts/research/d3-observation.mjs · arm B',
    verdict: 'unresolved (the rest is `normal`, which `<length>` cannot hold)',
  },
  {
    component: 'background-position-x-edge',
    representation:
      'proposed — `<length-percentage>` (the longhand reads `left` = `0%`)',
    source: 'scripts/research/d3-observation.mjs · arm C',
    verdict:
      'interpolation-unsafe (the shorthand wants an edge keyword, not a percentage)',
  },
  {
    component: 'background-position-x-offset',
    representation: 'proposed — `<length-percentage>`',
    source: 'scripts/research/d3-observation.mjs · arm C',
    verdict: 'movable',
  },
  {
    component: 'border-bottom-width',
    representation:
      'proposed — `<length>`; the fixture is blind at `border-style: none`',
    source: 'scripts/research/d3-observation.mjs · arm D',
    verdict: 'fixture-unobservable (no architectural verdict)',
  },
]

const pairs = population()
const described = pairs.map(one => ({
  ...describe(one),
  // The census's own bucket, from the shared predicate: machinery is *reported*, never counted as reach.
  machinery: bucketOf(one.parent, one.component) === 'machinery',
}))

const machinery = described.filter(one => one.machinery)
const reach = described.filter(one => !one.machinery)
const complete = reach.filter(one => one.status === 'complete')
const incomplete = reach.filter(one => one.status !== 'complete')

const reasons = new Map()

for (const one of incomplete)
  reasons.set(one.reason, [...(reasons.get(one.reason) ?? []), one])

const groups = [...reasons.entries()].sort(
  ([, one], [, two]) => two.length - one.length,
)

const line = (label, count, note = '') =>
  `  ${label.padEnd(46)}${String(count).padStart(4)}${note ? `   ${note}` : ''}`

console.log(
  [
    'D.3.5 · descriptor coverage (pass one: the model, no browser, no verdicts)',
    '',
    line('pairs (the census unit)', pairs.length),
    line(
      '  machinery — reported, not counted as reach',
      machinery.length,
      "the census's own 21, from the shared predicate",
    ),
    line('  constituent (reach)', reach.length, "the census's own 303"),
    line('    descriptor complete', complete.length),
    line('    unresolved-descriptor', incomplete.length),
    '',
    ...groups.map(([reason, list]) => line(`      ${reason}`, list.length)),
    '',
    'descriptor coverage, in full — what the model can already carry:',
    ...complete.map(
      one =>
        `  ${`${one.parent} / ${one.component}`.padEnd(34)}${one.candidate.padEnd(34)}→ \`${one.consumer}\`  [${one.representation.syntax}]`,
    ),
    '',
    'classification projection — cited, not re-measured (pass two projects a verdict):',
    ...ON_RECORD.map(
      one =>
        `  ${one.component}\n` +
        `      verdict          ${one.verdict}\n` +
        `      representation   ${one.representation}\n` +
        `      source           ${one.source}`,
    ),
    '',
    `  unclassified: ${incomplete.length} constituent pairs whose descriptor is incomplete, and ${machinery.length} machinery pairs that are not reach.`,
    '',
    'the bottleneck, read off the reasons:',
    '  at population scale, the immediate bottleneck is model metadata and candidate coverage;',
    '  most pairs do not yet reach the browser-classification stage.',
    '  browser behaviour has already been the limit *where a representation was proposed* —',
    '  `background-position-x-edge` is interpolation-unsafe and `column-gap` is context-dependent —',
    '  and it is where the six complete descriptors were decided.',
  ].join('\n'),
)

/**
 * The assertions hold the *shape* rather than the numbers, so this pass keeps telling the truth as families
 * are typed: completeness must be exactly the declared-representation set (restricted to served pairs), every
 * incomplete pair must carry a reason, and the population must stay the census's unit.
 */
const failures = []

if (!described.length) failures.push('the population is empty')

for (const one of incomplete)
  if (!one.reason)
    failures.push(`${one.parent}/${one.component} is incomplete with no reason`)

for (const one of complete)
  if (!one.representation?.syntax)
    failures.push(`${one.parent}/${one.component} is complete without a syntax`)

const completed = new Set(complete.map(one => one.component))
const declared = new Set(
  described.filter(one => one.representation).map(one => one.component),
)

for (const component of declared)
  if (!completed.has(component))
    failures.push(
      `${component} declares a representation but no pair of it is complete — the model carries semantics the descriptor cannot place`,
    )

if (failures.length) {
  console.error(`\n✗ ${failures.length} descriptor(s) disagree:\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  '\n✓ descriptor coverage is asked of the model alone, and every pair says where it stops\n',
)
