import { css } from '@/helpers/css'

export const objectPosition = [
  css('var', '--jumi-object-position-x'),
  css('var', '--jumi-object-position-y'),
].join(' ')

export const objectPositionX = [
  css('var', '--jumi-object-position-x-edge'),
  css('var', '--jumi-object-position-x-offset'),
].join(' ')

export const objectPositionY = [
  css('var', '--jumi-object-position-y-edge'),
  css('var', '--jumi-object-position-y-offset'),
].join(' ')
