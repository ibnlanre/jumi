import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderBlockEnd = join([
  css('var', '--jumi-border-block-end-width'),
  css('var', '--jumi-border-block-end-style'),
  css('var', '--jumi-border-block-end-color'),
], ' ')
