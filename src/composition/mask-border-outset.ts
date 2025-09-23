import { css } from '@/helpers/css'

export const maskBorderOutset = [
  css('var', '--jumi-mask-border-outset-top'),
  css('var', '--jumi-mask-border-outset-right'),
  css('var', '--jumi-mask-border-outset-bottom'),
  css('var', '--jumi-mask-border-outset-left'),
].join(' ')

export const maskBorderOutsetX = [
  css('var', '--jumi-mask-border-outset-left'),
  css('var', '--jumi-mask-border-outset-right'),
].join(' ')

export const maskBorderOutsetY = [
  css('var', '--jumi-mask-border-outset-top'),
  css('var', '--jumi-mask-border-outset-bottom'),
].join(' ')
