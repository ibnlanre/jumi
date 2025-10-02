import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const offsetAnchor = join([
  css('var', '--jumi-offset-anchor-x'),
  css('var', '--jumi-offset-anchor-y'),
], ' ')

export const offsetAnchorX = join([
  css('var', '--jumi-offset-anchor-x-edge'),
  css('var', '--jumi-offset-anchor-x-offset'),
], ' ')

export const offsetAnchorY = join([
  css('var', '--jumi-offset-anchor-y-edge'),
  css('var', '--jumi-offset-anchor-y-offset'),
], ' ')
