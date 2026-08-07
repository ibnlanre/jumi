import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const textShadow = join([
  css('var', '--jumi-text-shadow-offset-x'),
  css('var', '--jumi-text-shadow-offset-y'),
  css('var', '--jumi-text-shadow-blur-radius'),
  css('var', '--jumi-text-shadow-color'),
], ' ')
