import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const listStyle = join([
  css('var', '--jumi-list-style-type'),
  css('var', '--jumi-list-style-position'),
  css('var', '--jumi-list-style-image'),
], ' ')
