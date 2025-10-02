import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderBlock = join([
  css('var', '--jumi-border-block-width'),
  css('var', '--jumi-border-block-style'),
  css('var', '--jumi-border-block-color'),
], ' ')
