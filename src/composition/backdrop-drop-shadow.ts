import { toOklch } from '@/helpers/to-oklch'

const backdropDropShadowValues = [
  'var(--jumi-backdrop-drop-shadow-offset-x)',
  'var(--jumi-backdrop-drop-shadow-offset-y)',
  'var(--jumi-backdrop-drop-shadow-blur)',
  toOklch('var(--jumi-backdrop-drop-shadow-color)', 'var(--jumi-backdrop-drop-shadow-opacity)'),
].join(' ')

export const backdropDropShadow = 'drop-shadow(' + backdropDropShadowValues + ')'
