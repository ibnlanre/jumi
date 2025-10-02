import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const paddingInline = join([
  css('var', '--jumi-padding-inline-start'),
  css('var', '--jumi-padding-inline-end'),
], ' ')
