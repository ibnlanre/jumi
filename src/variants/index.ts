import type { MatchVariant } from '@/types'

import { css } from '@/helpers/css'
import { html } from '@/theme/html'

export const variants: Array<MatchVariant> = [
  {
    generator: value => css(':is', value),
    name: 'is',
    values: html,
  },
  {
    generator: value => css(':has', value),
    name: 'has',
    values: html,
  },
  {
    generator: value => css(':where', value),
    name: 'where',
    values: html,
  },
]
