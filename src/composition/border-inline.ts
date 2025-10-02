import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderInline = join([
  css('var', '--jumi-border-inline-width'),
  css('var', '--jumi-border-inline-style'),
  css('var', '--jumi-border-inline-color'),
], ' ')
