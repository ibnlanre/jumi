import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderTop = join([
  css('var', '--jumi-border-top-width'),
  css('var', '--jumi-border-top-style'),
  css('var', '--jumi-border-top-color'),
], ' ')
