import { css } from '@/helpers/css'

export const boxShadowOutset = [
  css('var', '--jumi-box-shadow-offset-x'),
  css('var', '--jumi-box-shadow-offset-y'),
  css('var', '--jumi-box-shadow-blur'),
  css('var', '--jumi-box-shadow-spread'),
  css('var', '--jumi-box-shadow-color'),
].join(' ')

export const boxShadowInset = [
  'inset',
  css('var', '--jumi-box-shadow-offset-x'),
  css('var', '--jumi-box-shadow-offset-y'),
  css('var', '--jumi-box-shadow-blur'),
  css('var', '--jumi-box-shadow-spread'),
  css('var', '--jumi-box-shadow-color'),
].join(' ')

export const boxShadow = css('var', '--jumi-box-shadow-inset', css('var', '--jumi-box-shadow-outset'))
