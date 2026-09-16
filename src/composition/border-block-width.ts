import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

/**
 * `border-block-width` is a real shorthand over its two logical edges, and the radius sibling
 * (`border-block-radius`) has declared its dependencies since the table was written. This one, and
 * `border-inline-width` beside it, simply were not — measured 2026-09-16, a phrase on
 * `animate-border-block-width` wrote its parts' keys and the keyframe read only the whole property.
 */
export const borderBlockWidth = join(
  [
    css('var', '--jumi-border-block-start-width'),
    css('var', '--jumi-border-block-end-width'),
  ],
  ' ',
)
