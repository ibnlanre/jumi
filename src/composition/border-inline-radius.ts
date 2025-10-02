import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderInlineRadius = join([
  css('var', '--jumi-border-inline-start-radius'),
  css('var', '--jumi-border-inline-end-radius'),
], ' ')
