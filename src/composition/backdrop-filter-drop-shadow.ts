import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

const backdropFilterDropShadowValues = join([
  css('var', '--jumi-backdrop-filter-drop-shadow-offset-x'),
  css('var', '--jumi-backdrop-filter-drop-shadow-offset-y'),
  css('var', '--jumi-backdrop-filter-drop-shadow-blur'),
  css('var', '--jumi-backdrop-filter-drop-shadow-color'),
], ' ')

export const backdropFilterDropShadow = css('drop-shadow', backdropFilterDropShadowValues)
