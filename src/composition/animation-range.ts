import { css } from '@/helpers/css'

export const animationRange = [
  css('var', '--jumi-animation-range-start'),
  css('var', '--jumi-animation-range-end'),
].join(' ')

export const animationRangeStart = [
  css('var', '--jumi-animation-range-start-timeline'),
  css('var', '--jumi-animation-range-start-offset'),
].join(' ')

export const animationRangeEnd = [
  css('var', '--jumi-animation-range-end-timeline'),
  css('var', '--jumi-animation-range-end-offset'),
].join(' ')
