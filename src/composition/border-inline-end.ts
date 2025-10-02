import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderInlineEnd = join([
  css('var', '--jumi-border-inline-end-width'),
  css('var', '--jumi-border-inline-end-style'),
  css('var', '--jumi-border-inline-end-color'),
], ' ')
