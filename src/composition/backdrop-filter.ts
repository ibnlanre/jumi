import { css } from '@/helpers/css'

export const backdropFilter = [
  css('var', '--jumi-backdrop-filter-blur'),
  css('var', '--jumi-backdrop-filter-brightness'),
  css('var', '--jumi-backdrop-filter-contrast'),
  css('var', '--jumi-backdrop-filter-drop-shadow'),
  css('var', '--jumi-backdrop-filter-grayscale'),
  css('var', '--jumi-backdrop-filter-hue-rotate'),
  css('var', '--jumi-backdrop-filter-invert'),
  css('var', '--jumi-backdrop-filter-opacity'),
  css('var', '--jumi-backdrop-filter-saturate'),
  css('var', '--jumi-backdrop-filter-sepia'),
].join(' ')
