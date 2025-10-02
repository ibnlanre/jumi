import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const perspective = css('perspective', 'none')

export const matrix = css('matrix', join([
  css('var', '--jumi-matrix-a'),
  css('var', '--jumi-matrix-b'),
  css('var', '--jumi-matrix-c'),
  css('var', '--jumi-matrix-d'),
  css('var', '--jumi-matrix-tx'),
  css('var', '--jumi-matrix-ty'),
], ', '))

export const matrix3d = css('matrix3d', join([
  css('var', '--jumi-matrix-a1'),
  css('var', '--jumi-matrix-b1'),
  css('var', '--jumi-matrix-c1'),
  css('var', '--jumi-matrix-d1'),
  css('var', '--jumi-matrix-a2'),
  css('var', '--jumi-matrix-b2'),
  css('var', '--jumi-matrix-c2'),
  css('var', '--jumi-matrix-d2'),
  css('var', '--jumi-matrix-a3'),
  css('var', '--jumi-matrix-b3'),
  css('var', '--jumi-matrix-c3'),
  css('var', '--jumi-matrix-d3'),
  css('var', '--jumi-matrix-a4'),
  css('var', '--jumi-matrix-b4'),
  css('var', '--jumi-matrix-c4'),
  css('var', '--jumi-matrix-d4'),
], ', '))

export const rotate3d = css('rotate3d', join([
  css('var', '--jumi-rotate-x'),
  css('var', '--jumi-rotate-y'),
  css('var', '--jumi-rotate-z'),
  css('var', '--jumi-rotate-angle'),
], ', '))

export const scale3d = css('scale3d', join([
  css('var', '--jumi-scale-x'),
  css('var', '--jumi-scale-y'),
  css('var', '--jumi-scale-z'),
], ', '))

export const skew = css('skew', join([
  css('var', '--jumi-skew-x'),
  css('var', '--jumi-skew-y'),
], ', '))

export const translate3d = css('translate3d', join([
  css('var', '--jumi-translate-x'),
  css('var', '--jumi-translate-y'),
  css('var', '--jumi-translate-z'),
], ', '))

export const transform = join([
  css('var', '--jumi-perspective'),
  css('var', '--jumi-matrix'),
  css('var', '--jumi-matrix-3d'),
  css('var', '--jumi-rotate-3d'),
  css('var', '--jumi-scale-3d'),
  css('var', '--jumi-skew'),
  css('var', '--jumi-translate-3d'),
], ' ')
