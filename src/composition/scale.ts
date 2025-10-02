import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const scale = join([
  css('var', '--jumi-scale-x'),
  css('var', '--jumi-scale-y'),
  css('var', '--jumi-scale-z'),
])
