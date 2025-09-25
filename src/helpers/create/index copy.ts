import type { Attribute } from '@/types'

import { css } from '@/helpers/css'

export const create = {
  animation(attribute: Attribute): string {
    const keyframeName = `jumi-${attribute}`

    // // Also add @property declarations for the attribute animation properties
    // const initials: CssInJs = {
    //   [`@property --jumi-${attribute}-animation-delay`]: {
    //     'inherits': false,
    //     'initial-value': '0s',
    //     'syntax': '"<time>#"',
    //   },
    //   [`@property --jumi-${attribute}-animation-direction`]: {
    //     'inherits': false,
    //     'initial-value': 'normal',
    //     'syntax': '"normal | reverse | alternate | alternate-reverse"',
    //   },
    //   [`@property --jumi-${attribute}-animation-duration`]: {
    //     'inherits': false,
    //     'initial-value': '1s',
    //     'syntax': '"<time>#"',
    //   },
    //   [`@property --jumi-${attribute}-animation-fill-mode`]: {
    //     'inherits': false,
    //     'initial-value': 'none',
    //     'syntax': '"none | forwards | backwards | both"',
    //   },
    //   [`@property --jumi-${attribute}-animation-iteration-count`]: {
    //     'inherits': false,
    //     'initial-value': '1',
    //     'syntax': '"<number> | infinite"',
    //   },
    //   [`@property --jumi-${attribute}-animation-play-state`]: {
    //     'inherits': false,
    //     'initial-value': 'running',
    //     'syntax': '"running | paused"',
    //   },
    //   [`@property --jumi-${attribute}-animation-timing-function`]: {
    //     'inherits': false,
    //     'initial-value': 'ease',
    //     'syntax': '"ease | linear | ease-in | ease-out | ease-in-out | step-start | step-end"',
    //   },
    // }

    // addBase(initials)

    const properties = {
      delay: css('var', `--jumi-${attribute}-animation-delay`, css('var', '--jumi-animation-delay')),
      direction: css('var', `--jumi-${attribute}-animation-direction`, css('var', '--jumi-animation-direction')),
      duration: css('var', `--jumi-${attribute}-animation-duration`, css('var', '--jumi-animation-duration')),
      fillMode: css('var', `--jumi-${attribute}-animation-fill-mode`, css('var', '--jumi-animation-fill-mode')),
      iterationCount: css('var', `--jumi-${attribute}-animation-iteration-count`, css('var', '--jumi-animation-iteration-count')),
      name: keyframeName,
      playState: css('var', `--jumi-${attribute}-animation-play-state`, css('var', '--jumi-animation-play-state')),
      timingFunction: css('var', `--jumi-${attribute}-animation-timing-function`, css('var', '--jumi-animation-timing-function')),
    }

    return Object.values(properties).join(' ')
  },

  effect(attribute: string): string {
    const keyframeName = `jumi-${attribute}`

    const properties = {
      delay: css('var', '--jumi-animation-delay'),
      direction: css('var', '--jumi-animation-direction'),
      duration: css('var', '--jumi-animation-duration'),
      fillMode: css('var', '--jumi-animation-fill-mode'),
      iterationCount: css('var', '--jumi-animation-iteration-count'),
      name: keyframeName,
      playState: css('var', '--jumi-animation-play-state'),
      timingFunction: css('var', '--jumi-animation-timing-function'),
    }

    return Object.values(properties).join(' ')
  },
}
