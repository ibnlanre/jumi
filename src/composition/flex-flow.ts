import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const flexFlow = join([
  css('var', '--jumi-flex-direction'),
  css('var', '--jumi-flex-wrap'),
], ' ')
