import { css } from '@/helpers/css'

export const animationRange = [
  css('var', '--jumi-animation-range-start'),
  css('var', '--jumi-animation-range-end'),
].join(' ')

export const animationRangeStart = [
  css('var', '--jumi-animation-range-start-name'),
  css('var', '--jumi-animation-range-start-length'),
].join(' ')

export const animationRangeEnd = [
  css('var', '--jumi-animation-range-end-name'),
  css('var', '--jumi-animation-range-end-length'),
].join(' ')
