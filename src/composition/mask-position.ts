import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const maskPosition = join([
  css('var', '--jumi-mask-position-x'),
  css('var', '--jumi-mask-position-y'),
], ' ')
