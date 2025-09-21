import { css } from '@/helpers/css'

export const textShadow = [
  css('var', '--jumi-text-shadow-offset-x'),
  css('var', '--jumi-text-shadow-offset-y'),
  css('var', '--jumi-text-shadow-blur-radius'),
  css('var', '--jumi-text-shadow-color'),
].join(' ')
