import { css } from '@/helpers/css'

export const overscrollBehavior = [
  css('var', '--jumi-overscroll-behavior-x'),
  css('var', '--jumi-overscroll-behavior-y'),
].join(' ')
