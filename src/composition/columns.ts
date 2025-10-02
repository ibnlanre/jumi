import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const columns = join([
  css('var', '--jumi-column-count'),
  css('var', '--jumi-column-width'),
], ' ')
