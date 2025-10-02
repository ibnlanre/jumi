import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderRadius = join([
  css('var', '--jumi-border-top-left-radius'),
  css('var', '--jumi-border-top-right-radius'),
  css('var', '--jumi-border-bottom-right-radius'),
  css('var', '--jumi-border-bottom-left-radius'),
], ' ')
