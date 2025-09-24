import { css } from '@/helpers/css'

export const offsetAnchor = [
  css('var', '--jumi-offset-anchor-x'),
  css('var', '--jumi-offset-anchor-y'),
].join(' ')

export const offsetAnchorX = [
  css('var', '--jumi-offset-anchor-x-edge'),
  css('var', '--jumi-offset-anchor-x-offset'),
].join(' ')

export const offsetAnchorY = [
  css('var', '--jumi-offset-anchor-y-edge'),
  css('var', '--jumi-offset-anchor-y-offset'),
].join(' ')
