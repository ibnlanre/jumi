import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const padding = join([
  css('var', '--jumi-padding-top'),
  css('var', '--jumi-padding-right'),
  css('var', '--jumi-padding-bottom'),
  css('var', '--jumi-padding-left'),
], ' ')
