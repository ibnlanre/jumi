import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const gridRow = join([
  css('var', '--jumi-grid-row-start'),
  css('var', '--jumi-grid-row-end'),
], ' / ')
