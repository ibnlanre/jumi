import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const gridArea = join([
  css('var', '--jumi-grid-row-start'),
  css('var', '--jumi-grid-column-start'),
  css('var', '--jumi-grid-row-end'),
  css('var', '--jumi-grid-column-end'),
], ' / ')
