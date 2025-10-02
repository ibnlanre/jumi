import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderLeft = join([
  css('var', '--jumi-border-left-width'),
  css('var', '--jumi-border-left-style'),
  css('var', '--jumi-border-left-color'),
], ' ')
