import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const maskBorderOutset = join([
  css('var', '--jumi-mask-border-outset-top'),
  css('var', '--jumi-mask-border-outset-right'),
  css('var', '--jumi-mask-border-outset-bottom'),
  css('var', '--jumi-mask-border-outset-left'),
], ' ')

export const maskBorderOutsetX = join([
  css('var', '--jumi-mask-border-outset-left'),
  css('var', '--jumi-mask-border-outset-right'),
], ' ')

export const maskBorderOutsetY = join([
  css('var', '--jumi-mask-border-outset-top'),
  css('var', '--jumi-mask-border-outset-bottom'),
], ' ')
