import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const animationRange = join([
  css('var', '--jumi-animation-range-start'),
  css('var', '--jumi-animation-range-end'),
])

export const animationRangeStart = join([
  css('var', '--jumi-animation-range-start-timeline'),
  css('var', '--jumi-animation-range-start-offset'),
])

export const animationRangeEnd = join([
  css('var', '--jumi-animation-range-end-timeline'),
  css('var', '--jumi-animation-range-end-offset'),
])
