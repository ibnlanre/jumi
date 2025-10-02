import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderRight = join([
  css('var', '--jumi-border-right-width'),
  css('var', '--jumi-border-right-style'),
  css('var', '--jumi-border-right-color'),
], ' ')
