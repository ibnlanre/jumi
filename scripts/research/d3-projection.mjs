import {
  declaredPairs,
  project,
  proposed,
  recordFor,
} from '../lib/evidence.mjs'
import { describe, population } from '../lib/observation.mjs'
import { bucketOf } from '../lib/property-model.mjs'

/**
 * D.3.5 · pass two: **classification projection**, and nothing else.
 *
 * Pass one asked what the model can justify. This asks the one question that follows, and nothing more:
 *
 *   **of the pairs Jumi can currently describe structurally, how many are already behaviourally proven?**
 *
 * It measures nothing. No browser, no compile, no new representation, no new arm: every verdict below is
 * quoted from a book that landed, with the source, the representation it was measured under, and the scope of
 * what was actually observed. A pass that reached for a browser here would be answering a different question
 * with a number that looks like this one.
 *
 * Two classes stay apart, and the separation is the whole design:
 *
 *   declared   evidence under a representation the model emits (`readTypedLeaves`). The only class that can
 *              count as *coverage*, because it is evidence about a registration the plugin writes.
 *   proposed   evidence under a representation a book justified and measured. Real evidence, and not coverage:
 *              the model declares nothing, so no such pair reaches the descriptor-complete population at all.
 *
 * The second class is nevertheless the *workstream*: every one of those pairs stops pass one on `no declared
 * representation`, so its finding is already in hand and only the declaration is missing. That is why the
 * report ends with the two workstreams rather than with a percentage — 199 pairs await a representation, 98
 * await a candidate, and they are different work.
 *
 * `classification unresolved` is a value, not a gap: a descriptor can be complete while nothing has been
 * measured under its representation, and the projection says exactly that rather than borrowing a verdict from
 * the family.
 *
 * Run: `node scripts/research/d3-projection.mjs` (exits non-zero if a complete descriptor has no answer).
 */
const pairs = population()
const constituent = pairs.filter(
  one => bucketOf(one.parent, one.component) !== 'machinery',
)

const described = constituent.map(describe)
const complete = described.filter(one => one.status === 'complete')
const incomplete = described.filter(one => one.status !== 'complete')

const projected = project(complete)
const proven = projected.filter(one => one.status === 'projected')
const unanswered = projected.filter(one => one.status !== 'projected')

/**
 * The proposed records whose pair is in this population — the workstream, counted rather than described. The
 * pair is the join key here too: a proposal is evidence about *that* parent/component relationship.
 */
const proposedPairs = proposed.flatMap(record =>
  record.pairs
    .map(
      pair =>
        constituent.find(
          one => one.component === pair.component && one.parent === pair.parent,
        ) && pair,
    )
    .filter(Boolean)
    .map(pair => ({ pair, record })),
)

const unreachable = proposed
  .flatMap(record => record.pairs)
  .filter(
    pair =>
      !constituent.some(
        one => one.component === pair.component && one.parent === pair.parent,
      ),
  )

const awaitingRepresentation = incomplete.filter(
  one =>
    one.reason === 'the model declares no representation for the component',
)
const awaitingCandidate = incomplete.filter(
  one => one.reason === 'no candidate addresses the pair',
)

const pad = (text, width) => String(text).padEnd(width)

console.log(
  [
    'D.3.5 · classification projection (pass two: existing evidence, no measurements)',
    '',
    `of the ${constituent.length} pairs Jumi can describe structurally, ${proven.length} of ${complete.length} are behaviourally proven`,
    '',
    `descriptor complete — ${complete.length} of ${constituent.length} constituent pairs`,
    ...projected.map(one => {
      const where = `${one.descriptor.parent} / ${one.descriptor.component}`

      return one.status === 'projected'
        ? `  ${pad(where, 34)}${pad(one.verdict, 12)}${one.record.source}\n` +
            `  ${pad('', 34)}measured under ${one.record.representation}\n` +
            `  ${pad('', 34)}scope: ${one.record.scope}`
        : `  ${pad(where, 34)}${one.status}\n` + `  ${pad('', 34)}${one.reason}`
    }),
    '',
    `${unanswered.length ? `${unanswered.length} complete descriptor(s) have no verdict — reported, not filled in.` : 'every complete descriptor has a verdict on record.'}`,
    '',
    'proposed representations — evidence, deliberately NOT coverage:',
    ...proposed.map(
      one =>
        `  ${one.pairs.map(pair => `${pair.parent}/${pair.component}`).join(', ')}\n` +
        `      verdict          ${one.verdict}\n` +
        `      representation   ${one.representation}\n` +
        `      source           ${one.source}`,
    ),
    '',
    `${proposedPairs.length} of those name a pair in this population (${proposedPairs
      .map(({ pair }) => `${pair.parent}/${pair.component}`)
      .join(', ')})` +
      (unreachable.length
        ? `; ${unreachable.map(pair => `${pair.parent}/${pair.component}`).join(', ')} is measured but not a pair the census counts.`
        : '.'),
    '',
    'where the next engineering decision is, and why it is two workstreams:',
    `  expand the model's representations   ${awaitingRepresentation.length} pairs stop on no declared representation`,
    `  expand candidate coverage            ${awaitingCandidate.length} pairs stop on no candidate`,
    '  candidate coverage without a justified representation reaches the same dead end more often,',
    '  which is why the first number is the one to attack.',
  ].join('\n'),
)

const failures = []

if (!proven.length)
  failures.push('no complete descriptor carries a verdict on record')

for (const one of unanswered)
  if (!one.reason)
    failures.push(
      `${one.descriptor.parent}/${one.descriptor.component} is unanswered with no reason`,
    )

// A projection may not answer for a pair whose descriptor is incomplete: that would be publishing a verdict
// for a pair the model cannot describe, which is pass one's job to refuse. This is how the component-keyed
// version of the registry was caught — it "covered" `(scale-3d, scale-x)`, a pair with no candidate.
for (const one of incomplete)
  if (recordFor({ component: one.component, parent: one.parent }))
    failures.push(
      `${one.parent}/${one.component} has a verdict on record while its descriptor is unknown — the projection would report coverage the model does not have`,
    )

// And the two sets must be the same set of pairs, not merely the same size: a record naming a pair the model
// does not serve, or a served pair with no record, is either a mislabel or a gap.
const covered = declaredPairs()
  .map(pair => `${pair.parent}/${pair.component}`)
  .sort()
const answered = projected
  .filter(one => one.status === 'projected')
  .map(one => `${one.descriptor.parent}/${one.descriptor.component}`)
  .sort()

if (covered.join(' ') !== answered.join(' '))
  failures.push(
    `the coverage class and the projected set are different pairs — covered [${covered.join(', ')}], answered [${answered.join(', ')}]`,
  )

if (failures.length) {
  console.error(`\n✗ ${failures.length} projection(s) disagree:\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  '\n✓ projection is a join: no representation, measurement or verdict was created\n',
)
