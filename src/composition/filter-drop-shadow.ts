import { css } from '@/helpers/css'

const filterDropShadowValues = [
  css('var', '--jumi-filter-drop-shadow-offset-x'),
  css('var', '--jumi-filter-drop-shadow-offset-y'),
  css('var', '--jumi-filter-drop-shadow-blur'),
  css('var', '--jumi-filter-drop-shadow-color'),
].join(' ')

export const filterDropShadow = css('drop-shadow', filterDropShadowValues)
