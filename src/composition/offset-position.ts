import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const offsePosition = join([
  css('var', '--jumi-offset-position-x'),
  css('var', '--jumi-offset-position-y'),
], ' ')

export const offsetPositionX = join([
  css('var', '--jumi-offset-position-x-edge'),
  css('var', '--jumi-offset-position-x-offset'),
], ' ')

export const offsetPositionY = join([
  css('var', '--jumi-offset-position-y-edge'),
  css('var', '--jumi-offset-position-y-offset'),
], ' ')
