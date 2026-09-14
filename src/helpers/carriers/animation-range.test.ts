import type { RangeReading } from '@/helpers/carriers/animation-range'

import { describe, expect, it } from 'vitest'

import { rangeAccepted, rangeFromSelector, rangeReadings } from '@/helpers/carriers/animation-range'

import postcss from 'postcss'

/**
 * Reading a range qualification back out of an emitted stylesheet.
 *
 * The reader is the whole of this feature's judgement: the variant contributes nothing but the
 * identity selector, so both facts the emission needs — the range, and the slot it qualifies — are
 * recovered here. These tests are named for the rule each one holds.
 */
describe('the range a selector encodes', () => {
  it('reads the range out of the class the author typed', () => {
    expect(rangeFromSelector('.animation-range-entry\\:animate-fade-in')).toBe('entry')
    expect(rangeFromSelector('.animation-range-exit-crossing\\:animate-fade-out')).toBe('exit-crossing')
  })

  it('finds it among stacked conditions, because it is not always first', () => {
    // Measured: an anchored match reads nothing off any of these, which would have been taken for
    // "stacking breaks the variant" rather than "the reader is too naive".
    expect(rangeFromSelector('.hover\\:animation-range-entry\\:animate-fade-in:hover')).toBe('entry')
    expect(rangeFromSelector('.motion-safe\\:animation-range-entry\\:animate-fade-in')).toBe('entry')
    expect(rangeFromSelector('.sm\\:animation-range-entry\\:animate-fade-in')).toBe('entry')
    expect(rangeFromSelector('.motion-safe\\:supports-\\[animation-timeline\\:scroll\\(\\)\\]\\:animation-range-entry\\:animate-fade-in')).toBe('entry')
  })

  it('decodes an arbitrary value: escapes off, underscores as spaces, brackets as syntax', () => {
    expect(rangeFromSelector('.animation-range-\\[entry_20\\%_cover_50\\%\\]\\:animate-fade-in'))
      .toBe('entry 20% cover 50%')
  })

  it('does not confuse the utility for the variant', () => {
    // The one that would have warned about Jumi's own vocabulary on every page: `animation-range-entry`
    // is the element's range, `animation-range-entry:animate-fade-in` qualifies one animation. The
    // difference is that something wraps the variant.
    expect(rangeFromSelector('.animation-range-entry')).toBeNull()
    expect(rangeFromSelector('.animation-range-\\[entry_0\\%_cover_50\\%\\]')).toBeNull()
    expect(rangeFromSelector('.animate-fade-in')).toBeNull()
  })
})

describe('the ranges Jumi will write', () => {
  it('accepts the names, the keyword alone, and the offset shapes', () => {
    const accepted = ['entry', 'cover', 'contain', 'exit', 'entry-crossing', 'exit-crossing']
    const lengths = ['normal', '25%', '25% 75%', '10px 20px', 'entry 25%', 'entry cover', 'entry 25% cover 50%']

    expect([...accepted, ...lengths].filter(range => !rangeAccepted(range))).toEqual([])
  })

  it('refuses the keyword joined to anything, which is not a value', () => {
    // Measured: `normal 0% 100%` and `0% normal 100%` fail to parse — the keyword swallows the token
    // after it — and a value that an engine drops falls back position by position and says nothing.
    const refused = ['normal 0%', '0% normal 100%', 'normal 0% normal 100%', 'entry normal']

    expect(refused.filter(range => rangeAccepted(range))).toEqual([])
  })

  it('refuses what is not a range at all', () => {
    const refused = ['nonsense', '', 'entry nonsense', '25% 75% 50%', 'entry 25% cover 50% 10%']

    expect(refused.filter(range => rangeAccepted(range))).toEqual([])
  })
})

describe('what a rule says about its range', () => {
  const readingsFrom = (css: string) => {
    const collected: RangeReading[] = []

    postcss.parse(css).walkRules((rule) => {
      collected.push(...rangeReadings(rule))
    })

    return collected
  }

  it('pairs the range with the slot the same rule activates', () => {
    const readings = readingsFrom(`
      .animation-range-entry\\:animate-fade-in { --jumi-fade-in-animation-name: jumi-fade-in; }
    `)

    expect(readings).toHaveLength(1)
    expect(readings[0]).toMatchObject({ motions: 1, range: 'entry', slot: 'fade-in' })
  })

  it('reports a range with no motion to qualify, rather than staying quiet', () => {
    const readings = readingsFrom(`
      .animation-range-entry\\:animation-duration-500 { --jumi-animation-duration: 500ms; }
    `)

    expect(readings).toHaveLength(1)
    expect(readings[0]).toMatchObject({ motions: 0, slot: null })
  })

  it('reports a range it cannot attribute when an optimizer merged two motions into one rule', () => {
    // One body cannot hold two ranges, so there is no right answer to pick — and a wrong one would
    // range the wrong animation without saying so.
    const readings = readingsFrom(`
      .animation-range-entry\\:animate-fade-in, .animation-range-exit\\:animate-fade-out {
        --jumi-fade-in-animation-name: jumi-fade-in;
        --jumi-fade-out-animation-name: jumi-fade-out;
      }
    `)

    expect(readings.map(reading => reading.range)).toEqual(['entry', 'exit'])
    expect(readings.every(reading => reading.slot === null && reading.motions === 2)).toBe(true)
  })
})
