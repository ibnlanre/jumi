import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const backgroundRepeat = join([
  css('var', '--jumi-background-repeat-x'),
  css('var', '--jumi-background-repeat-y'),
], ' ')
