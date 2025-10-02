import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const boxShadowOutset = join([
  css('var', '--jumi-box-shadow-offset-x'),
  css('var', '--jumi-box-shadow-offset-y'),
  css('var', '--jumi-box-shadow-blur'),
  css('var', '--jumi-box-shadow-spread'),
  css('var', '--jumi-box-shadow-color'),
], ' ')

export const boxShadowInset = join([
  'inset',
  css('var', '--jumi-box-shadow-offset-x'),
  css('var', '--jumi-box-shadow-offset-y'),
  css('var', '--jumi-box-shadow-blur'),
  css('var', '--jumi-box-shadow-spread'),
  css('var', '--jumi-box-shadow-color'),
], ' ')

export const boxShadow = css('var', '--jumi-box-shadow-inset', css('var', '--jumi-box-shadow-outset'))
