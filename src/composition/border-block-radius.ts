import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderBlockRadius = join([
  css('var', '--jumi-border-block-start-radius'),
  css('var', '--jumi-border-block-end-radius'),
], ' ')
