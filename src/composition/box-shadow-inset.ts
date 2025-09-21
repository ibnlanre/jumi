import { css } from '@/helpers/css'

export const boxShadowInset = [
  'inset',
  css('var', '--jumi-box-shadow-inset-offset-x'),
  css('var', '--jumi-box-shadow-inset-offset-y'),
  css('var', '--jumi-box-shadow-inset-blur'),
  css('var', '--jumi-box-shadow-inset-spread'),
  css('var', '--jumi-box-shadow-inset-color'),
].join(' ')
