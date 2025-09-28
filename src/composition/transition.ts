import { css } from '@/helpers/css'

export const transition = [
  css('var', '--jumi-transition-property'),
  css('var', '--jumi-transition-duration'),
  css('var', '--jumi-transition-timing-function'),
  css('var', '--jumi-transition-delay'),
].join(' ')
