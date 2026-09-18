import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

/**
 * The property reads the **resolved** axis leaves, and it is asserted **only inside a route's frames** — which is why
 * an untouched element still computes `normal`: no rule declares the property there, so nothing about these leaves is
 * observable on it.
 */
export const offsePosition = join(
  [
    css('var', '--jumi-offset-position-x-position'),
    css('var', '--jumi-offset-position-y-position'),
  ],
  ' ',
)

export const offsetPositionX = join(
  [
    css('var', '--jumi-offset-position-x-edge'),
    css('var', '--jumi-offset-position-x-offset'),
  ],
  ' ',
)

export const offsetPositionY = join(
  [
    css('var', '--jumi-offset-position-y-edge'),
    css('var', '--jumi-offset-position-y-offset'),
  ],
  ' ',
)
