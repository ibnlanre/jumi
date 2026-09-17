import { crossTab, MORPHOLOGIES, STATUSES } from '../lib/crosstab.mjs'

/**
 * D.3.5 · the diagnostic: **descriptor status × morphology**, and nothing else.
 *
 * Pass one measured what the model can describe and pass two projected what is already proven. Both come back
 * as single numbers, and the number that follows — 199 pairs awaiting a representation — is not one kind of
 * problem. The census already separates three morphologies, and each one points at different work, so this tab
 * says *where* the 199 are before anything is declared:
 *
 *   value       a typed syntax is plausibly derivable from information the model already carries
 *   keyword     the observation protocol (D.3.4) is the path
 *   reshape     no declaration alone helps; the interpolation unit is what D.1's work has to reach
 *
 * It creates nothing: no representation, no measurement, no verdict. It is a map, and its value is that it
 * makes the next decision a choice between counted blocks rather than a belief about 199 being one thing.
 *
 * Run: `node scripts/research/d3-crosstab.mjs` (exits non-zero if the cells disagree with the population).
 */
const table = crossTab()

const cell = (status, morphology) => table.at(status, morphology)
const width = Math.max(...MORPHOLOGIES.map(name => name.length), 7)

const head =
  '  ' +
  'descriptor status'.padEnd(20) +
  MORPHOLOGIES.map(name => name.padStart(width + 2)).join('') +
  '   total'

const rows = STATUSES.map(status => {
  const cells = MORPHOLOGIES.map(name =>
    String(cell(status, name).length).padStart(width + 2),
  ).join('')

  return `  ${status.padEnd(20)}${cells}${String(table.rowTotal(status)).padStart(8)}`
})

const totals =
  '  ' +
  'total'.padEnd(20) +
  MORPHOLOGIES.map(name =>
    String(table.columnTotal(name)).padStart(width + 2),
  ).join('') +
  String(table.constituents).padStart(8)

/** The largest tractable cell among the unresolved rows, named rather than asserted to be tractable. */
const awaiting = STATUSES.filter(status => status !== 'complete')
  .flatMap(status =>
    MORPHOLOGIES.map(name => ({
      count: cell(status, name).length,
      name,
      status,
    })),
  )
  .sort((one, two) => two.count - one.count)

const [largest] = awaiting

console.log(
  [
    'D.3.5 · descriptor status × morphology (diagnostic: no declarations, no verdicts)',
    '',
    `  the constituent population, ${table.constituents} pairs`,
    '',
    head,
    '  ' + '─'.repeat(head.length - 2),
    ...rows,
    '  ' + '─'.repeat(head.length - 2),
    totals,
    '',
    `largest unresolved cell: ${largest.status} × ${largest.name} — ${largest.count} pairs`,
    `  unresolved by morphology: ${MORPHOLOGIES.map(name => `${name} ${awaiting.filter(one => one.name === name).reduce((total, one) => total + one.count, 0)}`).join(' · ')}`,
    '',
    'what each column would mean for the next increment, stated before the counts are read:',
    '  value     a typed syntax plausibly derivable from what the model already carries — possibly a rule',
    "  keyword   D.3.4's observation protocol is the path, and the questions are surface and contexts",
    "  reshape   no declaration alone helps; the interpolation unit is D.1's decomposition work",
    '',
    `${table.rowTotal('complete')} pairs are complete; ${table.rowTotal('no-representation')} stop on a missing representation; ${table.rowTotal('no-candidate')} on a missing candidate.`,
  ].join('\n'),
)

const failures = []

const placed = STATUSES.reduce(
  (total, status) => total + table.rowTotal(status),
  0,
)

if (placed !== table.constituents)
  failures.push(
    `the cells hold ${placed} pairs but the population has ${table.constituents} — a pair is missing or counted twice`,
  )

for (const status of STATUSES)
  if (
    table.rowTotal(status) !==
    MORPHOLOGIES.reduce((total, name) => total + cell(status, name).length, 0)
  )
    failures.push(`${status}: the row does not sum to its cells`)

// Every constrained pair must carry one morphology out of the three: a fourth bucket appearing here would mean
// the census and this tab are reading different vocabularies, which is the drift the pair-keyed work exists to
// prevent.
const strays = table.described.filter(
  one => !MORPHOLOGIES.includes(one.morphology),
)

if (strays.length)
  failures.push(
    `${strays.length} pair(s) have a morphology outside ${MORPHOLOGIES.join('/')}: ${strays
      .map(
        one => `${one.pair.parent}/${one.pair.component} (${one.morphology})`,
      )
      .join(', ')}`,
  )

if (!largest.count)
  failures.push('no unresolved cell holds a pair — the tab is empty')

if (failures.length) {
  console.error(`\n✗ ${failures.length} cell(s) disagree:\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log('\n✓ the tab holds every constituent pair, once\n')
