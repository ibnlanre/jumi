import { css } from '@/helpers/css'

export const borderImageOutset = [
  css('var', '--jumi-border-image-outset-top'),
  css('var', '--jumi-border-image-outset-right'),
  css('var', '--jumi-border-image-outset-bottom'),
  css('var', '--jumi-border-image-outset-left'),
].join(' ')

export const borderImageOutsetX = [
  css('var', '--jumi-border-image-outset-right'),
  css('var', '--jumi-border-image-outset-left'),
].join(' ')

export const borderImageOutsetY = [
  css('var', '--jumi-border-image-outset-top'),
  css('var', '--jumi-border-image-outset-bottom'),
].join(' ')
