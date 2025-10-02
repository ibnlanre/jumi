import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderBottom = join([
  css('var', '--jumi-border-bottom-width'),
  css('var', '--jumi-border-bottom-style'),
  css('var', '--jumi-border-bottom-color'),
], ' ')
