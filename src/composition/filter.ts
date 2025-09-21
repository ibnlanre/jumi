import { css } from '@/helpers/css'

export const filter = [
  css('var', '--jumi-filter-blur'),
  css('var', '--jumi-filter-brightness'),
  css('var', '--jumi-filter-contrast'),
  css('var', '--jumi-filter-grayscale'),
  css('var', '--jumi-filter-hue-rotate'),
  css('var', '--jumi-filter-invert'),
  css('var', '--jumi-filter-saturate'),
  css('var', '--jumi-filter-sepia'),
  css('var', '--jumi-filter-opacity'),
  css('var', '--jumi-filter-drop-shadow'),
].join(' ')
