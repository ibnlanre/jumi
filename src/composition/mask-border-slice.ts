import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const maskBorderSlice = join([
  css('var', '--jumi-mask-border-slice-top'),
  css('var', '--jumi-mask-border-slice-right'),
  css('var', '--jumi-mask-border-slice-bottom'),
  css('var', '--jumi-mask-border-slice-left'),
], ' ')

export const maskBorderSliceX = join([
  css('var', '--jumi-mask-border-slice-left'),
  css('var', '--jumi-mask-border-slice-right'),
], ' ')

export const maskBorderSliceY = join([
  css('var', '--jumi-mask-border-slice-top'),
  css('var', '--jumi-mask-border-slice-bottom'),
], ' ')
