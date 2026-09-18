import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

/** The property reads the **resolved** axis leaves; edge and offset stay authoring vocabulary. */
export const objectPosition = join(
  [
    css('var', '--jumi-object-position-x-position'),
    css('var', '--jumi-object-position-y-position'),
  ],
  ' ',
)

export const objectPositionX = join(
  [
    css('var', '--jumi-object-position-x-edge'),
    css('var', '--jumi-object-position-x-offset'),
  ],
  ' ',
)

export const objectPositionY = join(
  [
    css('var', '--jumi-object-position-y-edge'),
    css('var', '--jumi-object-position-y-offset'),
  ],
  ' ',
)
