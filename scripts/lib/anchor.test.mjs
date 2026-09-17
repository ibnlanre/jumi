import { describe, expect, it } from 'vitest'

import { normalizeOffsetAnchor } from './anchor.mjs'

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
    expect(normalizeOffsetAnchor('left 10px top 20px')).toEqual(['10px', '20px'])
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
