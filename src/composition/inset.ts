import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const inset = join([
  css('var', '--jumi-top'),
  css('var', '--jumi-right'),
  css('var', '--jumi-bottom'),
  css('var', '--jumi-left'),
], ' ')
