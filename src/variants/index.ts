import type { MatchVariant } from '@/types'

import { html } from '@/variants/html'

export const variants: Array<MatchVariant> = [
  {
    generator: value => `& ${value}`,
    name: 'if-child-is',
    values: html,
  },
  {
    generator: value => `& > ${value}`,
    name: 'if-direct-child-is',
    values: html,
  },
  {
    generator: value => `& + ${value}`,
    name: 'if-next-sibling-is',
    values: html,
  },
  {
    generator: value => `& ~ ${value}`,
    name: 'if-sibling-is',
    values: html,
  },
]
