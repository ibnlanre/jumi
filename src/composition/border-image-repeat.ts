import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderImageRepeat = join([
  css('var', '--jumi-border-image-repeat-x'),
  css('var', '--jumi-border-image-repeat-y'),
], ' ')
