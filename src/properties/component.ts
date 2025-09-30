import type { Collection, MatchComponents, MatchComponentsPropertyValue } from '@/types'

import { animationDelay } from '@/theme/animation-delay'
import { count } from '@/theme/count'

export const component: Collection<MatchComponentsPropertyValue> = {
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
    values: animationDelay,
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
    values: animationDelay,
  },
} satisfies MatchComponents
