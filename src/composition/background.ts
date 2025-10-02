import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const background = join([
  css('var', '--jumi-background-attachment'),
  css('var', '--jumi-background-clip'),
  css('var', '--jumi-background-color'),
  css('var', '--jumi-background-image'),
  css('var', '--jumi-background-origin'),
  css('var', '--jumi-background-position'),
  css('var', '--jumi-background-repeat'),
  css('var', '--jumi-background-size'),
], ' ')
