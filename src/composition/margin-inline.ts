import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const marginInline = join([
  css('var', '--jumi-margin-inline-start'),
  css('var', '--jumi-margin-inline-end'),
], ' ')
