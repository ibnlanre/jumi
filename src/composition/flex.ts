import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const flex = join([
  css('var', '--jumi-flex-grow'),
  css('var', '--jumi-flex-shrink'),
  css('var', '--jumi-flex-basis'),
], ' ')
