import { describe, expect, it } from 'vitest'

import { crossTab, MORPHOLOGIES, STATUSES } from './crosstab.mjs'
import { declaredPairs } from './evidence.mjs'

/**
 * The tab's invariants, and one that is worth more than the rest.
 *
 * The counts will move as families are typed, so what is asserted is where the pairs are *relative to each
 * other*: the columns against the census's own bucket totals, and the complete cell against the coverage class
 * in the evidence registry. That second one is the join between the two passes — a pair the registry calls
 * proven must be a pair the tab calls complete, and the other way round — and it is the assertion that would
 * catch the passes drifting apart while each looked internally consistent.
 */
describe('the descriptor × morphology tab', () => {
  const table = crossTab()

  it('holds the constituent population, machinery excluded', () => {
    expect(table.constituents).toBe(309)
  })

  it('places every constituent pair exactly once', () => {
    const placed = STATUSES.reduce(
      (total, status) => total + table.rowTotal(status),
      0,
    )

    expect(placed).toBe(table.constituents)

    for (const status of STATUSES)
      for (const morphology of MORPHOLOGIES)
        for (const one of table.at(status, morphology))
          expect(
            one.morphology,
            `${one.pair.parent}/${one.pair.component}`,
          ).toBe(morphology)
  })

  it('agrees with the census on the morphologies', () => {
    // The census asserts these three over the constituent population, from the same shared predicate. A tab
    // whose columns disagreed would be a second reading of the vocabulary — the drift the pair key and the one
    // predicate exist to make impossible.
    expect(MORPHOLOGIES.map(name => table.columnTotal(name))).toEqual([
      110, 103, 96,
    ])
  })

  it('says complete exactly where the registry says proven', () => {
    // Pass one's completeness and pass two's coverage must be the same set of pairs. Neither is allowed to be
    // the more generous of the two.
    const complete = table
      .row('complete')
      .flatMap(cell =>
        cell.map(one => `${one.pair.parent}/${one.pair.component}`),
      )
      .sort()

    const proven = declaredPairs()
      .map(pair => `${pair.parent}/${pair.component}`)
      .sort()

    expect(complete).toEqual(proven)
  })

  it('keeps the unresolved rows disjoint from the complete one', () => {
    const complete = table.row('complete').flatMap(cell => cell)

    for (const status of STATUSES.filter(name => name !== 'complete'))
      for (const cell of table.row(status))
        for (const one of cell)
          expect(
            complete.some(
              other =>
                other.pair.component === one.pair.component &&
                other.pair.parent === one.pair.parent,
            ),
            `${one.pair.parent}/${one.pair.component}`,
          ).toBe(false)

    expect(table.rowTotal('complete')).toBeGreaterThan(0)
  })
})
