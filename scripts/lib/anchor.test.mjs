import { describe, expect, it } from 'vitest'

import { normalizeAxis, normalizeOffsetAnchor } from './anchor.mjs'

/**
 * The normalizer's contract, pinned as a pure function.
 *
 * The browser work is what justifies each accepted branch and each refusal, and the differential alongside this
 * file is what proves the accepted ones end to end. What this file holds is the **shape** of the contract, so a
 * later edit that widens it — accepting a short spelling, or reading a `var()` — fails here rather than
 * silently changing what the model will do with an authored value.
 */
describe('normalizeOffsetAnchor', () => {
  it('resolves the explicit edge form against the box', () => {
    // The four shapes the browser work proved, with the offset being the whole of what moves.
    expect(normalizeOffsetAnchor('left 10px top 20px')).toEqual([
      '10px',
      '20px',
    ])
    expect(normalizeOffsetAnchor('right 10px bottom 20px')).toEqual([
      'calc(100% - 10px)',
      'calc(100% - 20px)',
    ])
    expect(normalizeOffsetAnchor('left 10% bottom 25%')).toEqual([
      '10%',
      'calc(100% - 25%)',
    ])
    // Offsets may be any length-percentage, including arithmetic.
    expect(
      normalizeOffsetAnchor('right calc(10px + 1em) top calc(50% - 2px)'),
    ).toEqual(['calc(100% - calc(10px + 1em))', 'calc(50% - 2px)'])
  })

  it('resolves edge keywords to their resolved components', () => {
    expect(normalizeOffsetAnchor('left top')).toEqual(['0%', '0%'])
    expect(normalizeOffsetAnchor('right bottom')).toEqual(['100%', '100%'])
    expect(normalizeOffsetAnchor('center center')).toEqual(['50%', '50%'])
    expect(normalizeOffsetAnchor('center top')).toEqual(['50%', '0%'])
  })

  it('passes an already-resolved pair through unchanged', () => {
    expect(normalizeOffsetAnchor('20% 80%')).toEqual(['20%', '80%'])
    expect(normalizeOffsetAnchor('10px 20px')).toEqual(['10px', '20px'])
    expect(normalizeOffsetAnchor('calc(50% + 10px) calc(25% - 4px)')).toEqual([
      'calc(50% + 10px)',
      'calc(25% - 4px)',
    ])
    // A nested call stays one component: splitting on every space was a measured defect in this track.
    expect(normalizeOffsetAnchor('calc(10px + calc(2% * 3)) 4px')).toEqual([
      'calc(10px + calc(2% * 3))',
      '4px',
    ])
  })

  it('declines the short spellings rather than reading position syntax', () => {
    // Measured: rejected outright by the browser, computing to `auto`.
    expect(normalizeOffsetAnchor('top 20px')).toBeNull()
    // Measured: accepted by the browser, but as something else — it computes to `0% 10px`, not to
    // "left plus 10px with the other axis at centre".
    expect(normalizeOffsetAnchor('left 10px')).toBeNull()
    // Measured: the browser accepts it as `50% 20px`, and this still declines it, because an arity the track
    // has not established is not one to interpret.
    expect(normalizeOffsetAnchor('center 20px')).toBeNull()
    expect(normalizeOffsetAnchor('20px center')).toBeNull()
  })

  it('declines anything that cannot be resolved statically', () => {
    expect(normalizeOffsetAnchor('var(--ax) var(--ay)')).toBeNull()
    expect(normalizeOffsetAnchor('left var(--d) top 20px')).toBeNull()
    expect(normalizeOffsetAnchor('start top')).toBeNull()
    expect(normalizeOffsetAnchor('left 10px top')).toBeNull()
    expect(normalizeOffsetAnchor('')).toBeNull()
    expect(normalizeOffsetAnchor('left')).toBeNull()
    expect(normalizeOffsetAnchor(undefined)).toBeNull()
  })
})

/**
 * The per-axis boundary, which is the one the production design rests on.
 *
 * The browser spike proves the mapping end to end; this pins the function that performs it, because a later
 * widening here would show up in the spike as a route behaving differently without saying *why*. The offsets
 * below are the model's own resting `0` wherever an edge is given alone, which is the state a lone edge
 * candidate is normalized in.
 */
describe('normalizeAxis', () => {
  it('resolves a bare edge to its own percentage', () => {
    // The offset is `0`, and both spellings are the same value: the measured arm for `left 0 top 0` reads
    // `0px 0px`, so nothing is being smoothed over by preferring the keyword's percentage.
    expect(normalizeAxis('left', '0')).toBe('0%')
    expect(normalizeAxis('center', '0')).toBe('50%')
    expect(normalizeAxis('right', '0')).toBe('100%')
    expect(normalizeAxis('top', '0')).toBe('0%')
    expect(normalizeAxis('bottom', '0')).toBe('100%')
  })

  it('resolves an edge with an offset, in the direction the edge grows', () => {
    expect(normalizeAxis('left', '10px')).toBe('10px')
    expect(normalizeAxis('right', '10px')).toBe('calc(100% - 10px)')
    expect(normalizeAxis('top', '20px')).toBe('20px')
    expect(normalizeAxis('bottom', '20px')).toBe('calc(100% - 20px)')
    // Any length-percentage, including arithmetic and percentages.
    expect(normalizeAxis('left', '25%')).toBe('25%')
    expect(normalizeAxis('top', 'calc(10px + 2em)')).toBe('calc(10px + 2em)')
    expect(normalizeAxis('right', 'calc(50% - 4px)')).toBe(
      'calc(100% - calc(50% - 4px))',
    )
  })

  it('declines everything it has not established, as one component or nothing', () => {
    // A `center` edge with an offset is an arity this track did not establish, even though the browser
    // resolves it: the same conservative line the anchor normalizer holds.
    expect(normalizeAxis('center', '20px')).toBeNull()
    // A `var()` cannot be resolved at build time.
    expect(normalizeAxis('left', 'var(--d)')).toBeNull()
    // Logical spellings are not accepted by this property in the measured browser.
    expect(normalizeAxis('start', '10px')).toBeNull()
    expect(normalizeAxis('inline-start', '0')).toBeNull()
    // And an edge that is not an edge at all.
    expect(normalizeAxis('10px', '0')).toBeNull()
    expect(normalizeAxis(undefined, '10px')).toBeNull()
    expect(normalizeAxis('left', undefined)).toBeNull()
    expect(normalizeAxis('left', '')).toBeNull()
  })

  it('answers one component or nothing, so a route can never be half-typed', () => {
    // The criterion the production design requires: this function cannot return a partial assignment, which is
    // what makes "every emitted frame carries both axes" a property of the boundary rather than of care.
    const answers = [
      ['left', '0'],
      ['right', '10px'],
      ['center', '0'],
      ['center', '20px'],
      ['left', 'var(--d)'],
      ['start', '0'],
    ].map(([edge, offset]) => normalizeAxis(edge, offset))

    for (const answer of answers)
      expect(answer === null || typeof answer === 'string').toBe(true)
  })
})
