import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const font = join([
  css('var', '--jumi-font-variant'),
  css('var', '--jumi-font-style'),
  css('var', '--jumi-font-weight'),
  join([
    css('var', '--jumi-font-size'),
    css('var', '--jumi-line-height'),
  ], '/'),
  css('var', '--jumi-font-family'),
], ' ')

// font-variant font-style font-weight font-size/line-height font-family
