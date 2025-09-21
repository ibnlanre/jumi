import { css } from '@/helpers/css'

export const grid = [
  css('var', '--jumi-grid-template-areas'),
  css('var', '--jumi-grid-template-columns'),
  css('var', '--jumi-grid-template-rows'),
  css('var', '--jumi-grid-auto-columns'),
  css('var', '--jumi-grid-auto-rows'),
  css('var', '--jumi-grid-auto-flow'),
].join(' ')
