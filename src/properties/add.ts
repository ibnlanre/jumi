import type { AddProperty } from '@/types'

import { css } from '@/helpers/css'

export const addProperties: AddProperty = {
  '.animate': { animation: css('var', '--jumi-animation') },
}
