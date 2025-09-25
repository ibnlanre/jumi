import type { Effect } from '@/theme/effects'
import type { Api, Attribute, Collection, CssInJs } from '@/types'

import { css } from '@/helpers/css'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyKeyframes } from '@/keyframes/property'
import { propertyVariables } from '@/variables/property'

export function getCreator({ addBase }: Api) {
  return {
    animation(attribute: Attribute): string {
      const name = `jumi-${attribute}` as const
      const keyframeName = `@keyframes ${name}` as const
      const propertyName = `@property --${name}-keyframes`
      const keyframes = getKeyframes(propertyKeyframes, keyframeName)

      // propertyVariables[`--${name}` as const]

      if (keyframes) {
        addBase({
          [keyframeName]: keyframes,
        })
      }

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
      const keyframeName = `@keyframes ${name}` as const
      const propertyName = `@property --${name}-keyframes`
      const keyframes = getKeyframes(effectKeyframes, keyframeName)

      if (keyframes) {
        addBase({
          [keyframeName]: keyframes,
        })
      }

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
}

function getKeyframes<T extends Collection, K extends keyof T>(record: T, key: K): CssInJs {
  return record[key] as CssInJs
}
