import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const backgroundPosition = join([
  css('var', '--jumi-background-position-x'),
  css('var', '--jumi-background-position-y'),
], ' ')

export const backgroundPositionX = join([
  css('var', '--jumi-background-position-x-edge'),
  css('var', '--jumi-background-position-x-offset'),
], ' ')

export const backgroundPositionY = join([
  css('var', '--jumi-background-position-y-edge'),
  css('var', '--jumi-background-position-y-offset'),
], ' ')
