import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const gridColumn = join([
  css('var', '--jumi-grid-column-start'),
  css('var', '--jumi-grid-column-end'),
], ' / ')
