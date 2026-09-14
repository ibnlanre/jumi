import { describe, expect, it } from 'vitest'

import { animationRange, animationRangeName } from '@/theme/animation-range'
import { propertyVariables } from '@/variables/property'
import { animationRange as composed } from '@/composition/animation-range'

/**
 * The range vocabulary and the value it composes, which is the part of this feature that cannot be
 * got wrong quietly.
 *
 * `animation-range` is a list, one entry per animation, resolved through
 * `var(--jumi-<slot>-animation-range, var(--jumi-animation-range))`. That fallback has to be a legal
 * value, and the obvious ways to build one are not. Measured, in a browser:
 *
 *   CSS.supports('animation-range', 'normal')              →  true
 *   CSS.supports('animation-range', 'normal 0% normal 100%') →  false
 *   CSS.supports('animation-range', '0% normal 100%')      →  false
 *   CSS.supports('animation-range', 'normal 0% 100%')      →  false
 *   CSS.supports('animation-range', '0% 100%')             →  true
 *   CSS.supports('animation-range', 'entry 100%')          →  true
 *
 * `normal` is a whole value that swallows the token after it, so a *half* of `normal` produces a
 * declaration that is invalid at computed-value time — and an invalid declaration is dropped
 * **whole**, so a position with a real range loses it because of a neighbour. Measured in a browser
 * on a two-position list: computed `animation-range: normal` with the first position set to
 * `25% 75%`.
 *
 * Hence the shape these tests pin: two halves, each written complete, each defaulting to a bare
 * offset. `0% 100%` is the default and measures identically to `normal` on both timeline types; the
 * keyword itself is available only as a *whole* range, through the bare `animation-range` utility.
 * The runtime half of this is asserted in `pnpm scroll-driven:check`.
 */
describe('the range vocabulary', () => {
  it('offers the range names an author chooses, not the grammar slot they fill', () => {
    expect(Object.keys(animationRangeName)).toEqual([
      'contain',
      'cover',
      'entry',
      'entry-crossing',
      'exit',
      'exit-crossing',
    ])
  })

  it('keeps normal out of the halves, where it is not a legal value', () => {
    // The rule is about halves, not about the keyword: `normal` is legal as a whole range, which is
    // what the bare utility writes, and illegal joined to an offset on one side.
    expect(Object.keys(animationRangeName)).not.toContain('normal')
    expect(animationRange.DEFAULT).toBe('normal')
    expect(animationRange).not.toHaveProperty('normal')
  })

  it('has no name that describes the CSS grammar instead of the motion', () => {
    expect(Object.keys(animationRange).filter(name => name.includes('timeline'))).toEqual([])
  })
})

describe('the composed animation-range', () => {
  it('names two halves, in the order the property reads them', () => {
    expect(composed).toBe('var(--jumi-animation-range-start) var(--jumi-animation-range-end)')
    expect(composed.indexOf('--jumi-animation-range-start')).toBeLessThan(
      composed.indexOf('--jumi-animation-range-end'),
    )
  })

  it('gives each half a complete default, so the pair is a legal value', () => {
    // A half is one value fed by its offset: `0%` and `100%`, which parses and measures identically
    // to `normal` on both timeline types.
    expect(propertyVariables['animation-range-start-offset'].value).toBe('0%')
    expect(propertyVariables['animation-range-end-offset'].value).toBe('100%')
    expect(propertyVariables['animation-range-start'].value).toBe(
      'var(--jumi-animation-range-start-offset)',
    )

    // Nothing in a half is joined from a name and an offset any more, which is where the illegal
    // keyword could have been written. No half value mentions it.
    const halves = [
      'animation-range-start',
      'animation-range-end',
      'animation-range-start-offset',
      'animation-range-end-offset',
    ] as const

    for (const half of halves) expect(propertyVariables[half].value).not.toContain('normal')
  })

  it('keeps the grammar-shaped component gone, not merely unused', () => {
    // `-start-timeline` was the name half: a variable holding a range name, which only made sense
    // joined to an offset. A variable nothing writes is a name the next reader has to disprove.
    expect(propertyVariables).not.toHaveProperty('animation-range-start-timeline')
    expect(propertyVariables).not.toHaveProperty('animation-range-end-timeline')
  })
})
