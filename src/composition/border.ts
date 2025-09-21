import { css } from '@/helpers/css'

export const border = [
  css('var', '--jumi-border-width'),
  css('var', '--jumi-border-style'),
  css('var', '--jumi-border-color'),
].join(' ')
