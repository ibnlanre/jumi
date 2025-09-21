import { css } from '@/helpers/css'

export const backgroundPosition = [
  css('var', '--jumi-background-position-x'),
  css('var', '--jumi-background-position-y'),
].join(' ')

export const backgroundPositionX = [
  css('var', '--jumi-background-position-x-edge'),
  css('var', '--jumi-background-position-x-offset'),
].join(' ')

export const backgroundPositionY = [
  css('var', '--jumi-background-position-y-edge'),
  css('var', '--jumi-background-position-y-offset'),
].join(' ')
