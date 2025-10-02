import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const gap = join([
  css('var', '--jumi-row-gap'),
  css('var', '--jumi-column-gap'),
], ' ')
