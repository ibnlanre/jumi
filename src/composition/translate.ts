import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const translate = join([
  css('var', '--jumi-translate-x'),
  css('var', '--jumi-translate-y'),
  css('var', '--jumi-translate-z'),
])
