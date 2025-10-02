import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const rotate = join([
  css('var', '--jumi-rotate-x'),
  css('var', '--jumi-rotate-y'),
  css('var', '--jumi-rotate-z'),
  css('var', '--jumi-rotate-angle'),
])
