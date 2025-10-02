import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const container = join([
  css('var', '--jumi-container-name'),
  css('var', '--jumi-container-type'),
], ' ')
