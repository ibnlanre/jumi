import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderBlockStart = join([
  css('var', '--jumi-border-block-start-width'),
  css('var', '--jumi-border-block-start-style'),
  css('var', '--jumi-border-block-start-color'),
], ' ')
