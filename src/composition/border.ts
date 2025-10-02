import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const border = join([
  css('var', '--jumi-border-width'),
  css('var', '--jumi-border-style'),
  css('var', '--jumi-border-color'),
], ' ')
