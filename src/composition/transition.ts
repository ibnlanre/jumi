import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const transition = join([
  css('var', '--jumi-transition-property'),
  css('var', '--jumi-transition-duration'),
  css('var', '--jumi-transition-timing-function'),
  css('var', '--jumi-transition-delay'),
], ' ')
