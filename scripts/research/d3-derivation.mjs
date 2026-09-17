import {
  derivations,
  OUTCOMES,
  SYNTAX_OF,
  UNSPELLABLE,
} from '../lib/derivation.mjs'

/**
 * D.3.5 · the value-representation derivation: **can the representation itself be derived?**
 *
 * The cross-tab turned "199 missing representations" into three morphologies. This pass takes the largest
 * tractable one — the 72 `no-representation × value` pairs — and asks the question the ruling set for it: how
 * many can get their typed representation from a **rule over information the model already carries**, rather
 * than from a declaration written family by family?
 *
 * The information is two pieces and both are already in the model: the leaf's **resting value** and the
 * **grammar of the candidate that serves it** (`readCandidates().types`). The rule is their agreement, and the
 * agreement is checked rather than assumed — inferring a syntax from the resting string alone is the mistake
 * D.3 exists to avoid, so a proposal may only name types its candidate declares, and the test suite fails if
 * one does not.
 *
 * What the pass does **not** do: declare a representation, measure a browser, or claim a verdict. A derived
 * syntax is a **proposal** — it still has to pass D.3.4's observation protocol (rest, then interpolation, then
 * every relevant context) before it means anything. This answers only whether the representation can be
 * derived, and where it cannot, which piece is missing.
 *
 * Run: `node scripts/research/d3-derivation.mjs` (exits non-zero if a pair is unplaced or a proposal overreaches)
 */
const rows = derivations()

const by = outcome => rows.filter(one => one.outcome === outcome)
const countOf = outcome => by(outcome).length

const groupBy = (list, key) => {
  const groups = new Map()

  for (const one of list)
    groups.set(key(one), [...(groups.get(key(one)) ?? []), one])

  return [...groups.entries()].sort(
    ([, one], [, two]) => two.length - one.length,
  )
}

const pad = (text, width) => String(text).padEnd(width)

const proposals = groupBy(by('mechanically derivable'), one =>
  one.proposal.join(' | '),
)

const ambiguity = groupBy(by('ambiguous grammar'), one => one.reason)

/** Which of the eight vocabulary names the rule can spell — derived, not asserted. */
const vocabulary = [...new Set(rows.flatMap(one => one.grammar))].sort()
const spellable = vocabulary.filter(name => SYNTAX_OF[name])
const unspellable = vocabulary.filter(name => UNSPELLABLE[name])

console.log(
  [
    'D.3.5 · value-representation derivation (diagnostic: no declarations, no verdicts)',
    '',
    `the workstream: ${rows.length} pairs (no-representation × value)`,
    '',
    ...OUTCOMES.map(
      outcome =>
        `  ${pad(outcome, 26)}${String(countOf(outcome)).padStart(3)}   ${describeOutcome(outcome)}`,
    ),
    '',
    `the mapping the rule needs — ${spellable.length} of the vocabulary's ${vocabulary.length} names have a syntax:`,
    ...spellable.map(name => `  ${pad(name, 12)}→ \`${SYNTAX_OF[name]}\``),
    ...unspellable.map(
      name => `  ${pad(name, 12)}→ none — ${UNSPELLABLE[name]}`,
    ),
    '',
    'the proposals, by syntax:',
    ...proposals.map(
      ([syntax, list]) =>
        `  ${pad(syntax, 24)}${String(list.length).padStart(3)}   ${list
          .map(one => `${one.pair.parent}/${one.pair.component}`)
          .join(', ')}`,
    ),
    '',
    'the ambiguous grammar, by cause — each one a decision rather than a derivation:',
    ...ambiguity.map(
      ([reason, list]) =>
        `  ${String(list.length).padStart(3)}  ${reason}\n` +
        `       ${list
          .map(one => `${one.pair.parent}/${one.pair.component}`)
          .join(', ')}`,
    ),
    '',
    'the pairs no derivation reaches, named:',
    ...by('no defensible rule').map(
      one =>
        `  ${pad(`${one.pair.parent}/${one.pair.component}`, 36)}rest \`${one.rest}\` — ${one.reason}`,
    ),
    '',
    `${countOf('needs normalization')} pairs needed normalization: every resting value that fits its grammar fits it as written, and the ones that do not fit cannot be written as a syntax at all.`,
    '',
    'what this pass does not license: a derived syntax is a proposal, not a verdict — it still has to pass the',
    'observation protocol (rest, then interpolation, then every relevant context) before anything moves. That',
    'is the whole reason the descriptor and the classification are two passes.',
  ].join('\n'),
)

function describeOutcome(outcome) {
  if (outcome === 'mechanically derivable')
    return 'every type has a spelling and one admits the rest — the rule closes'
  if (outcome === 'ambiguous grammar')
    return 'the grammar names a type with no spelling, or two families at once — a decision, not a derivation'
  if (outcome === 'needs normalization')
    return 'the rest would have to be canonicalised into the grammar (the `scale` mechanism)'

  return 'the resting value is a keyword no type holds, and the model carries no numeric equivalent for it'
}

const failures = []

for (const one of rows)
  if (!OUTCOMES.includes(one.outcome))
    failures.push(`${one.pair.parent}/${one.pair.component}: unplaced outcome`)

for (const one of by('mechanically derivable'))
  if (!one.proposal.length)
    failures.push(
      `${one.pair.parent}/${one.pair.component}: derivable with no proposal`,
    )

for (const one of rows.filter(one => one.outcome !== 'mechanically derivable'))
  if (!one.reason)
    failures.push(`${one.pair.parent}/${one.pair.component}: no reason`)

if (!rows.length) failures.push('the workstream is empty')

if (failures.length) {
  console.error(`\n✗ ${failures.length} derivation(s) disagree:\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(
  `\n✓ ${countOf('mechanically derivable')} of ${rows.length} pairs derive from one rule over the model, and every other pair says which decision it needs\n`,
)
