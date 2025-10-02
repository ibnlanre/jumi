import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const marginBlock = join([
  css('var', '--jumi-margin-block-start'),
  css('var', '--jumi-margin-block-end'),
], ' ')
