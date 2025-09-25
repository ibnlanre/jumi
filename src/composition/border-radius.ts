import { css } from '@/helpers/css'

export const borderRadius = [
  css('var', '--jumi-border-top-left-radius'),
  css('var', '--jumi-border-top-right-radius'),
  css('var', '--jumi-border-bottom-right-radius'),
  css('var', '--jumi-border-bottom-left-radius'),
].join(' ')
