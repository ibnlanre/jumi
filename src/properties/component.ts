import type { GetMatchComponents, MatchComponents } from '@/types'

import { getCreator } from '@/helpers/create'
import { count } from '@/theme/count'

export const getMatchComponents: GetMatchComponents = (api) => {
  const { theme } = getCreator(api)

  const matchComponent: MatchComponents = {
    'animation-delay-backward': {
      modifiers: count,
      property: (value, { modifier }) => {
        const length = modifier ? parseInt(modifier) : 3

        return Object.fromEntries(
          Array.from({ length }, (_, index) => [
            `& > :nth-child(${index + 1})`,
            { 'animation-delay': `calc(${value} * ${length - index - 1})` },
          ]),
        )
      },
      values: theme('transitionDelay'),
    },
    'animation-delay-forward': {
      modifiers: count,
      property: (value, { modifier }) => {
        const length = modifier ? parseInt(modifier) : 3

        return Object.fromEntries(
          Array.from({ length }, (_, index) => [
            `& > :nth-child(${index + 1})`,
            { 'animation-delay': `calc(${value} * ${index})` },
          ]),
        )
      },
      values: theme('transitionDelay'),
    },
  }

  return matchComponent
}
