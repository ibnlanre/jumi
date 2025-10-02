import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const marker = join([
  css('var', '--jumi-marker-start'),
  css('var', '--jumi-marker-mid'),
  css('var', '--jumi-marker-end'),
], ' ')
