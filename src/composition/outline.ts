import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const outline = join([
  css('var', '--jumi-outline-width'),
  css('var', '--jumi-outline-style'),
  css('var', '--jumi-outline-color'),
], ' ')
