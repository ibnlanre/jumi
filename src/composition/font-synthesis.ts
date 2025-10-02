import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const fontSynthesis = join([
  css('var', '--jumi-font-synthesis-weight'),
  css('var', '--jumi-font-synthesis-style'),
  css('var', '--jumi-font-synthesis-small-caps'),
], ' ')
