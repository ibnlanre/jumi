import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const overflow = join([
  css('var', '--jumi-overflow-x'),
  css('var', '--jumi-overflow-y'),
], ' ')
