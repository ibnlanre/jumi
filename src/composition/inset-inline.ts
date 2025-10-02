import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const insetInline = join([
  css('var', '--jumi-inset-inline-start'),
  css('var', '--jumi-inset-inline-end'),
], ' ')
