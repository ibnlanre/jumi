import { css } from '@/helpers/css'

const backdropDropShadowValues = [
  css('var', '--jumi-backdrop-drop-shadow-offset-x'),
  css('var', '--jumi-backdrop-drop-shadow-offset-y'),
  css('var', '--jumi-backdrop-drop-shadow-blur'),
  css('var', '--jumi-backdrop-drop-shadow-color'),
].join(' ')

export const backdropDropShadow = css('drop-shadow', backdropDropShadowValues)
