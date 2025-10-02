import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

const filterDropShadowValues = join([
  css('var', '--jumi-filter-drop-shadow-offset-x'),
  css('var', '--jumi-filter-drop-shadow-offset-y'),
  css('var', '--jumi-filter-drop-shadow-blur'),
  css('var', '--jumi-filter-drop-shadow-color'),
], ' ')

export const filterDropShadow = css('drop-shadow', filterDropShadowValues)
