import type { Effect } from '@/theme/animation-name'
import type { Attribute } from '@/types'

import { css } from '@/helpers/css'

export function animation(attribute: Attribute | Effect): string {
  const name = `jumi-${attribute}`

  const duration = css('var', `--jumi-${attribute}-animation-duration`, css('var', '--jumi-animation-duration'))
  const delay = css('var', `--jumi-${attribute}-animation-delay`, css('var', '--jumi-animation-delay'))
  const fillMode = css('var', `--jumi-${attribute}-animation-fill-mode`, css('var', '--jumi-animation-fill-mode'))
  const playState = css('var', `--jumi-${attribute}-animation-play-state`, css('var', '--jumi-animation-play-state'))
  const easingFunction = css('var', `--jumi-${attribute}-animation-timing-function`, css('var', '--jumi-animation-timing-function'))
  const iterationCount = css('var', `--jumi-${attribute}-animation-iteration-count`, css('var', '--jumi-animation-iteration-count'))
  const direction = css('var', `--jumi-${attribute}-animation-direction`, css('var', '--jumi-animation-direction'))

  return [duration, easingFunction, delay, iterationCount, direction, fillMode, playState, name].join(' ')
}

export function effect(attribute: string): string {
  const name = `jumi-${attribute}`

  const duration = css('var', '--jumi-animation-duration')
  const delay = css('var', '--jumi-animation-delay')
  const fillMode = css('var', '--jumi-animation-fill-mode')
  const playState = css('var', '--jumi-animation-play-state')
  const easingFunction = css('var', '--jumi-animation-timing-function')
  const iterationCount = css('var', '--jumi-animation-iteration-count')
  const direction = css('var', '--jumi-animation-direction')

  return [duration, easingFunction, delay, iterationCount, direction, fillMode, playState, name].join(' ')
}

export const create = { animation, effect }
