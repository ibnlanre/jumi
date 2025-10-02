import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderInlineStart = join([
  css('var', '--jumi-border-inline-start-width'),
  css('var', '--jumi-border-inline-start-style'),
  css('var', '--jumi-border-inline-start-color'),
], ' ')
