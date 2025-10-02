import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const margin = join([
  css('var', '--jumi-margin-top'),
  css('var', '--jumi-margin-right'),
  css('var', '--jumi-margin-bottom'),
  css('var', '--jumi-margin-left'),
], ' ')
