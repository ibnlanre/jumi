import type { AddProperty } from '@/types'

import { css } from '@/helpers/css'
import { animationName } from '@/keyframes/property'

export const addProperties: AddProperty = {
  '.animate': {
    '--jumi-animation': animationName,
    'animation': css('var', '--jumi-animation'),
  },
}
