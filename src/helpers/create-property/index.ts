import type { Attribute } from '@/types'

import { css } from '@/helpers/css'

export function createProperty(attribute: Attribute) {
  const name = `jumi-${attribute}`

  const duration = css('var', `--jumi-${attribute}-animation-duration`, css('var', '--jumi-animation-duration', '1s'))
  const delay = css('var', `--jumi-${attribute}-animation-delay`, css('var', '--jumi-animation-delay', '0s'))
  const fillMode = css('var', `--jumi-${attribute}-animation-fill-mode`, css('var', '--jumi-animation-fill-mode', 'forwards'))
  const playState = css('var', `--jumi-${attribute}-animation-play-state`, css('var', '--jumi-animation-play-state', 'running'))
  const easingFunction = css('var', `--jumi-${attribute}-animation-timing-function`, css('var', '--jumi-animation-timing-function', 'ease'))
  const iterationCount = css('var', `--jumi-${attribute}-animation-iteration-count`, css('var', '--jumi-animation-iteration-count', '1'))
  const direction = css('var', `--jumi-${attribute}-animation-direction`, css('var', '--jumi-animation-direction', 'normal'))

  return [duration, easingFunction, delay, iterationCount, direction, fillMode, playState, name].join(' ')
}
