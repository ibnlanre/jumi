import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderImage = join([
  css('var', '--jumi-border-image-outset'),
  css('var', '--jumi-border-image-repeat'),
  css('var', '--jumi-border-image-slice'),
  css('var', '--jumi-border-image-source'),
  css('var', '--jumi-border-image-width'),
], ' ')
