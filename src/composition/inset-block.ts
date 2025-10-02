import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const insetBlock = join([
  css('var', '--jumi-inset-block-start'),
  css('var', '--jumi-inset-block-end'),
], ' ')
