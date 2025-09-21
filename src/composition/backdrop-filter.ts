import { css } from '@/helpers/css'

export const backdropFilter = [
  css('var', '--jumi-backdrop-blur'),
  css('var', '--jumi-backdrop-brightness'),
  css('var', '--jumi-backdrop-contrast'),
  css('var', '--jumi-backdrop-drop-shadow'),
  css('var', '--jumi-backdrop-grayscale'),
  css('var', '--jumi-backdrop-hue-rotate'),
  css('var', '--jumi-backdrop-invert'),
  css('var', '--jumi-backdrop-opacity'),
  css('var', '--jumi-backdrop-saturate'),
  css('var', '--jumi-backdrop-sepia'),
].join(' ')
