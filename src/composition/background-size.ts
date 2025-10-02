import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const backgroundSize = join([
  css('var', '--jumi-background-size-width'),
  css('var', '--jumi-background-size-height'),
], ' ')
