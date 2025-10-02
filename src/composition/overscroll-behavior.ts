import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const overscrollBehavior = join([
  css('var', '--jumi-overscroll-behavior-x'),
  css('var', '--jumi-overscroll-behavior-y'),
], ' ')
