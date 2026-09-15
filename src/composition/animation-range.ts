import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

/**
 * One range, from two halves; each half, from its offset default.
 *
 * No half is *joined* from parts any more, and that is the point: the pieces a half used to be
 * composed from — a range name and an offset — are exactly where an illegal value could hide
 * (`normal` beside an offset is not a legal half, measured). A half is now one value, whatever
 * writes it: the offset control writes the offset variable, a named half writes the half itself,
 * and the arbitrary form writes the half with both in it.
 */
export const animationRangeStart = css(
  'var',
  '--jumi-animation-range-start-offset',
)

export const animationRangeEnd = css('var', '--jumi-animation-range-end-offset')

export const animationRange = join([
  css('var', '--jumi-animation-range-start'),
  css('var', '--jumi-animation-range-end'),
])
