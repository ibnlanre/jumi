import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

/**
 * The inline counterpart of `border-block-width`, in the same start-then-end order — the order the
 * logical shorthand itself uses, so the two-value form reaches the browser as written.
 */
export const borderInlineWidth = join(
  [
    css('var', '--jumi-border-inline-start-width'),
    css('var', '--jumi-border-inline-end-width'),
  ],
  ' ',
)
