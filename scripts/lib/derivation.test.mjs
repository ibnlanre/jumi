import { describe, expect, it } from 'vitest'

import { crossTab } from './crosstab.mjs'
import { derivations, OUTCOMES, SYNTAX_OF, UNSPELLABLE } from './derivation.mjs'
import { readCandidates } from './property-model.mjs'

/**
 * The derivation's invariants — and the first of them is the ruling's own warning, written as an assertion.
 *
 * > Do not infer from the resting string alone. The candidate grammar has to agree, otherwise we repeat the
 * > exact mistake D.3 has been designed to avoid.
 *
 * So the grammar is consulted for every pair and the **agreement is checked**: a proposal may only name types
 * the serving candidate actually declares. A test that cannot fail there is a test that would have let the
 * mistake through.
 */
describe('the value-representation derivation', () => {
  const rows = derivations()
  const candidates = readCandidates()

  it('is the cross-tab cell it claims to be', () => {
    // The workstream is `no-representation × value`, taken from the tab rather than restated: a derivation pass
    // that quietly widened its population would be answering for pairs the census routes elsewhere.
    const cell = crossTab().at('no-representation', 'value')

    expect(rows).toHaveLength(cell.length)
    expect(
      rows.map(one => `${one.pair.parent}/${one.pair.component}`).sort(),
    ).toEqual(
      cell.map(one => `${one.pair.parent}/${one.pair.component}`).sort(),
    )
  })

  it('places every pair in one of the four outcomes', () => {
    for (const one of rows) {
      expect(OUTCOMES, `${one.pair.parent}/${one.pair.component}`).toContain(
        one.outcome,
      )

      if (one.outcome !== 'mechanically derivable')
        expect(
          one.reason,
          `${one.pair.parent}/${one.pair.component}`,
        ).toBeTruthy()
    }
  })

  it('never proposes a type the candidate does not declare', () => {
    // The ruling's warning, as an assertion. The lookup parameter is named for what it is: shadowing the loop's
    // `one` here compared a candidate with itself, found nothing, and made this arm read as a failure of the
    // derivation rather than of the test.
    for (const record of rows.filter(
      row => row.outcome === 'mechanically derivable',
    )) {
      const candidate = candidates.find(
        entry => entry.name === record.candidate,
      )

      expect(candidate, record.candidate).toBeTruthy()

      for (const syntax of record.proposal) {
        const type = Object.keys(SYNTAX_OF).find(
          name => SYNTAX_OF[name] === syntax,
        )

        expect(
          candidate.types,
          `${record.pair.parent}/${record.pair.component} proposes ${syntax}`,
        ).toContain(type)
      }
    }
  })

  it('derives only single types and the one union the spec treats as one grammar', () => {
    for (const one of rows.filter(
      row => row.outcome === 'mechanically derivable',
    ))
      expect(
        one.proposal.length === 1 ||
          one.proposal.join(' | ') === '<length> | <percentage>',
        `${one.pair.parent}/${one.pair.component} proposes ${one.proposal.join(' | ')}`,
      ).toBe(true)
  })

  it('gives ambiguity a stated cause, never a shrug', () => {
    for (const one of rows.filter(row => row.outcome === 'ambiguous grammar')) {
      const unspellable = one.unspellable.length > 0
      const twoFamilies = one.proposal.length > 1

      expect(
        unspellable || twoFamilies,
        `${one.pair.parent}/${one.pair.component} is ambiguous with neither an unspellable type nor two families`,
      ).toBe(true)

      if (unspellable)
        for (const type of one.unspellable)
          expect(Object.keys(UNSPELLABLE)).toContain(type)
    }
  })

  it('keeps a keyword rest out of the grammar question entirely', () => {
    // A resting value no type can hold is decided before the grammar is consulted: `background-clip` rests at
    // `border-box`, and no `@property` syntax holds a keyword the model carries no numeric equivalent for.
    for (const one of rows.filter(row => row.outcome === 'no defensible rule'))
      expect(one.shape).toEqual([])
  })
})
