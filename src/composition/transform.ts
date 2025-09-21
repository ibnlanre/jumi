import { css } from '@/helpers/css'

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

const rotateValue = css('var', '--jumi-rotate-angle')
export const rotate = css('rotate', rotateValue)

const rotate3dValue = [
  css('var', '--jumi-rotate-3x'),
  css('var', '--jumi-rotate-3y'),
  css('var', '--jumi-rotate-3z'),
  css('var', '--jumi-rotate-angle'),
].join(', ')
export const rotate3d = css('rotate3d', rotate3dValue)

const scaleValue = [
  css('var', '--jumi-scale-sx'),
  css('var', '--jumi-scale-sy'),
].join(', ')
export const scale = css('scale', scaleValue)

const scale3dValue = [
  css('var', '--jumi-scale-3x'),
  css('var', '--jumi-scale-3y'),
  css('var', '--jumi-scale-3z'),
].join(', ')
export const scale3d = css('scale3d', scale3dValue)

const skewValue = [
  css('var', '--jumi-skew-sx'),
  css('var', '--jumi-skew-sy'),
].join(', ')
export const skew = css('skew', skewValue)

const translateValue = [
  css('var', '--jumi-translate-sx'),
  css('var', '--jumi-translate-sy'),
].join(', ')
export const translate = css('translate', translateValue)

const translate3dValue = [
  css('var', '--jumi-translate-3x'),
  css('var', '--jumi-translate-3y'),
  css('var', '--jumi-translate-3z'),
].join(', ')
export const translate3d = css('translate3d', translate3dValue)

export const transform = [
  css('var', '--jumi-matrix'),
  css('var', '--jumi-matrix-3d'),
  css('var', '--jumi-perspective'),
  css('var', '--jumi-rotate'),
  css('var', '--jumi-rotate-x'),
  css('var', '--jumi-rotate-y'),
  css('var', '--jumi-rotate-z'),
  css('var', '--jumi-rotate-3d'),
  css('var', '--jumi-scale'),
  css('var', '--jumi-scale-x'),
  css('var', '--jumi-scale-y'),
  css('var', '--jumi-scale-z'),
  css('var', '--jumi-scale-3d'),
  css('var', '--jumi-skew'),
  css('var', '--jumi-skew-x'),
  css('var', '--jumi-skew-y'),
  css('var', '--jumi-translate'),
  css('var', '--jumi-translate-x'),
  css('var', '--jumi-translate-y'),
  css('var', '--jumi-translate-z'),
  css('var', '--jumi-translate-3d'),
].join(' ')
