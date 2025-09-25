import type { Effect } from '@/theme/effects'
import type { Attribute } from '@/types'

import { css } from '@/helpers/css'

export const create = {
  animation(attribute: Attribute): string {
    const name = `jumi-${attribute}` as const

    return [
      css('var', `--jumi-${attribute}-animation-duration`, css('var', '--jumi-animation-duration')),
      css('var', `--jumi-${attribute}-animation-timing-function`, css('var', '--jumi-animation-timing-function')),
      css('var', `--jumi-${attribute}-animation-delay`, css('var', '--jumi-animation-delay')),
      css('var', `--jumi-${attribute}-animation-iteration-count`, css('var', '--jumi-animation-iteration-count')),
      css('var', `--jumi-${attribute}-animation-direction`, css('var', '--jumi-animation-direction')),
      css('var', `--jumi-${attribute}-animation-fill-mode`, css('var', '--jumi-animation-fill-mode')),
      css('var', `--jumi-${attribute}-animation-play-state`, css('var', '--jumi-animation-play-state')),
      name,
    ].join(' ')
  },
  effect(attribute: string): string {
    const name = `jumi-${attribute as Effect}` as const

    return [
      css('var', '--jumi-animation-duration'),
      css('var', '--jumi-animation-timing-function'),
      css('var', '--jumi-animation-delay'),
      css('var', '--jumi-animation-iteration-count'),
      css('var', '--jumi-animation-direction'),
      css('var', '--jumi-animation-fill-mode'),
      css('var', '--jumi-animation-play-state'),
      name,
    ].join(' ')
  },
}
