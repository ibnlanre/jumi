import { css } from '@/helpers/css'

export const perspective = css('perspective', 'none')

const matrixValue = [
  css('var', '--jumi-matrix-a'),
  css('var', '--jumi-matrix-b'),
  css('var', '--jumi-matrix-c'),
  css('var', '--jumi-matrix-d'),
  css('var', '--jumi-matrix-tx'),
  css('var', '--jumi-matrix-ty'),
].join(', ')
export const matrix = css('matrix', matrixValue)

const matrix3dValue = [
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
].join(', ')
export const matrix3d = css('matrix3d', matrix3dValue)

const rotate3dValues = [
  css('var', '--jumi-rotate-x'),
  css('var', '--jumi-rotate-y'),
  css('var', '--jumi-rotate-z'),
  css('var', '--jumi-rotate'),
].join(', ')
export const rotate3d = css('rotate3d', rotate3dValues)

const scale3dValues = [
  css('var', '--jumi-scale-x'),
  css('var', '--jumi-scale-y'),
  css('var', '--jumi-scale-z'),
].join(', ')
export const scale3d = css('scale3d', scale3dValues)

const skewValues = [
  css('var', '--jumi-skew-x'),
  css('var', '--jumi-skew-y'),
].join(', ')
export const skew = css('skew', skewValues)

const translate3dValues = [
  css('var', '--jumi-translate-x'),
  css('var', '--jumi-translate-y'),
  css('var', '--jumi-translate-z'),
].join(', ')
export const translate = css('var', '--jumi-translate')
export const translate3d = css('translate3d', translate3dValues)

export const transform = [
  css('var', '--jumi-perspective'),
  css('var', '--jumi-matrix'),
  css('var', '--jumi-matrix-3d'),
  css('var', '--jumi-rotate-3d'),
  css('var', '--jumi-scale-3d'),
  css('var', '--jumi-skew'),
  css('var', '--jumi-translate-3d'),
].join(' ')
