import { css } from '@/helpers/css'

const backdropFilterDropShadowValues = [
  css('var', '--jumi-backdrop-filter-drop-shadow-offset-x'),
  css('var', '--jumi-backdrop-filter-drop-shadow-offset-y'),
  css('var', '--jumi-backdrop-filter-drop-shadow-blur'),
  css('var', '--jumi-backdrop-filter-drop-shadow-color'),
].join(' ')

export const backdropFilterDropShadow = css('drop-shadow', backdropFilterDropShadowValues)
