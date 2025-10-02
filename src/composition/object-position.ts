import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const objectPosition = join([
  css('var', '--jumi-object-position-x'),
  css('var', '--jumi-object-position-y'),
], ' ')

export const objectPositionX = join([
  css('var', '--jumi-object-position-x-edge'),
  css('var', '--jumi-object-position-x-offset'),
], ' ')

export const objectPositionY = join([
  css('var', '--jumi-object-position-y-edge'),
  css('var', '--jumi-object-position-y-offset'),
], ' ')
