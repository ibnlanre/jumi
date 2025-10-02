import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const aspectRatio = join([
  css('var', '--jumi-aspect-ratio-width'),
  css('var', '--jumi-aspect-ratio-height'),
], ' ')
