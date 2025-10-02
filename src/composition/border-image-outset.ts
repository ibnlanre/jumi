import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const borderImageOutset = join([
  css('var', '--jumi-border-image-outset-top'),
  css('var', '--jumi-border-image-outset-right'),
  css('var', '--jumi-border-image-outset-bottom'),
  css('var', '--jumi-border-image-outset-left'),
], ' ')

export const borderImageOutsetX = join([
  css('var', '--jumi-border-image-outset-right'),
  css('var', '--jumi-border-image-outset-left'),
], ' ')

export const borderImageOutsetY = join([
  css('var', '--jumi-border-image-outset-top'),
  css('var', '--jumi-border-image-outset-bottom'),
], ' ')
