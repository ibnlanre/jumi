import type { GetMatchComponents, MatchComponents } from '@/types'

import { css } from '@/helpers/css'
import { count } from '@/theme/count'

export const getMatchComponents: GetMatchComponents = (creator) => {
  const { theme } = creator

  const matchComponent: MatchComponents = {
    'animation-delay-backward': {
      fn: (value, { modifier }) => {
        const length = modifier ? parseInt(modifier) : 3

        return Object.fromEntries(
          Array.from({ length }, (_, index) => [
            `& > ${css(':nth-child', index + 1)}`,
            { '--jumi-animation-delay': `calc(${value} * ${length - index - 1})` },
          ]),
        )
      },
      modifiers: count,
      values: theme('transitionDelay'),
    },
    'animation-delay-forward': {
      fn: (value, { modifier }) => {
        const length = modifier ? parseInt(modifier) : 3

        return Object.fromEntries(
          Array.from({ length }, (_, index) => [
            `& > ${css(':nth-child', index + 1)}`,
            { '--jumi-animation-delay': `calc(${value} * ${index})` },
          ]),
        )
      },
      modifiers: count,
      values: theme('transitionDelay'),
    },
  }

  return matchComponent
}
