const matrixValue = [
  'var(--jumi-matrix-a, 1)',
  'var(--jumi-matrix-b, 0)',
  'var(--jumi-matrix-c, 0)',
  'var(--jumi-matrix-d, 1)',
  'var(--jumi-matrix-tx, 0)',
  'var(--jumi-matrix-ty, 0)',
].join(', ')
export const matrix = 'matrix(' + matrixValue + ')'

const matrix3dValue = [
  'var(--jumi-matrix-a1, 1)',
  'var(--jumi-matrix-b1, 0)',
  'var(--jumi-matrix-c1, 0)',
  'var(--jumi-matrix-d1, 0)',
  'var(--jumi-matrix-a2, 0)',
  'var(--jumi-matrix-b2, 1)',
  'var(--jumi-matrix-c2, 0)',
  'var(--jumi-matrix-d2, 0)',
  'var(--jumi-matrix-a3, 0)',
  'var(--jumi-matrix-b3, 0)',
  'var(--jumi-matrix-c3, 1)',
  'var(--jumi-matrix-d3, 0)',
  'var(--jumi-matrix-a4, 0)',
  'var(--jumi-matrix-b4, 0)',
  'var(--jumi-matrix-c4, 0)',
  'var(--jumi-matrix-d4, 1)',
].join(', ')
export const matrix3d = 'matrix3d(' + matrix3dValue + ')'

const rotateValue = ['var(--jumi-rotate-angle)'].join(', ')
export const rotate = 'rotate(' + rotateValue + ')'

const rotate3dValue = [
  'var(--jumi-rotate-3x)',
  'var(--jumi-rotate-3y)',
  'var(--jumi-rotate-3z)',
  'var(--jumi-rotate-angle)',
].join(', ')
export const rotate3d = 'rotate3d(' + rotate3dValue + ')'

const scaleValue = ['var(--jumi-scale-sx)', 'var(--jumi-scale-sy)'].join(', ')
export const scale = 'scale(' + scaleValue + ')'

const scale3dValue = [
  'var(--jumi-scale-3x)',
  'var(--jumi-scale-3y)',
  'var(--jumi-scale-3z)',
].join(', ')
export const scale3d = 'scale3d(' + scale3dValue + ')'

const skewValue = ['var(--jumi-skew-sx)', 'var(--jumi-skew-sy)'].join(' ')
export const skew = 'skew(' + skewValue + ')'

const translateValue = [
  'var(--jumi-translate-sx)',
  'var(--jumi-translate-sy)',
].join(' ')
export const translate = 'translate(' + translateValue + ')'

const translate3dValue = [
  'var(--jumi-translate-3x)',
  'var(--jumi-translate-3y)',
  'var(--jumi-translate-3z)',
].join(' ')
export const translate3d = 'translate3d(' + translate3dValue + ')'

export const transform = [
  'var(--jumi-matrix)',
  'var(--jumi-matrix-3d)',
  'var(--jumi-perspective)',
  'var(--jumi-rotate)',
  'var(--jumi-rotate-3d)',
  'var(--jumi-rotate-x)',
  'var(--jumi-rotate-y)',
  'var(--jumi-rotate-z)',
  'var(--jumi-scale)',
  'var(--jumi-scale-3d)',
  'var(--jumi-scale-x)',
  'var(--jumi-scale-y)',
  'var(--jumi-scale-z)',
  'var(--jumi-skew)',
  'var(--jumi-translate)',
  'var(--jumi-translate-3d)',
].join(' ')
