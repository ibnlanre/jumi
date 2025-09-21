import { css } from '@/helpers/css'

export const gridArea = [
  css('var', '--jumi-grid-row-start'),
  css('var', '--jumi-grid-column-start'),
  css('var', '--jumi-grid-row-end'),
  css('var', '--jumi-grid-column-end'),
].join(' / ')
