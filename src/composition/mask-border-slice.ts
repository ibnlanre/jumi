import { css } from '@/helpers/css'

export const maskBorderSlice = [
  css('var', '--jumi-mask-border-slice-top'),
  css('var', '--jumi-mask-border-slice-right'),
  css('var', '--jumi-mask-border-slice-bottom'),
  css('var', '--jumi-mask-border-slice-left'),
].join(' ')

export const maskBorderSliceX = [
  css('var', '--jumi-mask-border-slice-left'),
  css('var', '--jumi-mask-border-slice-right'),
].join(' ')

export const maskBorderSliceY = [
  css('var', '--jumi-mask-border-slice-top'),
  css('var', '--jumi-mask-border-slice-bottom'),
].join(' ')
