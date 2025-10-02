import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const paddingBlock = join([
  css('var', '--jumi-padding-block-start'),
  css('var', '--jumi-padding-block-end'),
], ' ')
