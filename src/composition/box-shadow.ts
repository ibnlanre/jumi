import { toOklch } from '@/helpers/to-oklch'

export const boxShadow = [
  'var(--jumi-box-shadow-offset-x)',
  'var(--jumi-box-shadow-offset-y)',
  'var(--jumi-box-shadow-blur)',
  'var(--jumi-box-shadow-spread)',
  toOklch('var(--jumi-box-shadow-color)', 'var(--jumi-box-shadow-opacity)'),
  'var(--jumi-box-shadow-inset)',
].join(' ')
