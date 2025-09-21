import type { AddProperty } from '@/types'

import { css } from '@/helpers/css'

export const addProperties: AddProperty = {
  '.animate': {
    'animation-composition': css('var', '--jumi-animation-composition'),
    'animation-delay': css('var', '--jumi-animation-delay'),
    'animation-direction': css('var', '--jumi-animation-direction'),
    'animation-duration': css('var', '--jumi-animation-duration'),
    'animation-fill-mode': css('var', '--jumi-animation-fill-mode'),
    'animation-iteration-count': css('var', '--jumi-animation-iteration-count'),
    'animation-name': css('var', '--jumi-animation-name'),
    'animation-play-state': css('var', '--jumi-animation-play-state'),
    'animation-range': css('var', '--jumi-animation-range'),
    'animation-range-end': css('var', '--jumi-animation-range-end'),
    'animation-range-start': css('var', '--jumi-animation-range-start'),
    'animation-timeline': css('var', '--jumi-animation-timeline'),
    'animation-timing-function': css('var', '--jumi-animation-timing-function'),
  },
}
