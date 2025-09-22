import type { AddProperty } from '@/types'

import { css } from '@/helpers/css'

export const addProperties: AddProperty = {
  '.animate': {
    'animation': css('var', '--jumi-animation'),
    'animation-composition': css('var', '--jumi-animation-composition'),
    'animation-range': css('var', '--jumi-animation-range'),
    'animation-range-end': css('var', '--jumi-animation-range-end'),
    'animation-range-start': css('var', '--jumi-animation-range-start'),
    'animation-timeline': css('var', '--jumi-animation-timeline'),
  },
}
