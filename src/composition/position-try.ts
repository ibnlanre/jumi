import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const positionTry = join([
  css('var', '--jumi-position-try-order'),
  css('var', '--jumi-position-try-fallbacks'),
], ' ')
