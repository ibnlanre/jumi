import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

/**
 * `transform-origin` is **not** a shorthand. It is one property taking one to three components — the
 * two positions, and then a length — and the platform's grammar only accepts the length when both
 * positions are present. So this composition always states all three, which is what keeps every
 * intermediate state a valid value: the parts default to `50% 50% 0px`, and a phrase that writes only
 * `z` still reaches the browser as a complete `transform-origin` rather than as a lone length.
 *
 * That is why this is declared apart from the two-part shorthands around it: `gap` and the logical
 * border widths can pass one component through unaccompanied, and this cannot.
 */
export const transformOrigin = join(
  [
    css('var', '--jumi-transform-origin-x'),
    css('var', '--jumi-transform-origin-y'),
    css('var', '--jumi-transform-origin-z'),
  ],
  ' ',
)
