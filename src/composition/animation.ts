import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const animation = join([
  css('var', '--jumi-animation-duration'),
  css('var', '--jumi-animation-timing-function'),
  css('var', '--jumi-animation-delay'),
  css('var', '--jumi-animation-iteration-count'),
  css('var', '--jumi-animation-direction'),
  css('var', '--jumi-animation-fill-mode'),
  css('var', '--jumi-animation-play-state'),
  css('var', '--jumi-animation-timeline'),
  css('var', '--jumi-animation-composition'),
], ' ')
