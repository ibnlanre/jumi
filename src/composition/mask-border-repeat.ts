import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const maskBorderRepeat = join([
  css('var', '--jumi-mask-border-repeat-y'),
  css('var', '--jumi-mask-border-repeat-x'),
], ' ')
