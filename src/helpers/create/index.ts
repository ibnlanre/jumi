import type { AnimatableStandardPropertyType, Api, CssInJs, Effect } from '@/types'

import { css } from '@/helpers/css'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyKeyframes, propertyNames } from '@/keyframes/property'

/**
 * Set of all properties that should be skipped on first run
 */
const properties = new Set<string>(propertyNames)

/**
 * Set to track already generated keyframes to prevent duplicates
 */
const generated = new Set<string>()

export function getCreator(api: Api) {
  const create = {
    animation(attribute: AnimatableStandardPropertyType): string {
      const name = `jumi-${attribute}` as const
      const keyframes: CssInJs = propertyKeyframes[attribute]
      addKeyframes(api, attribute, keyframes)

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
      const name = `jumi-effect-${attribute as Effect}` as const
      const keyframes: CssInJs = effectKeyframes[attribute as Effect]
      addKeyframes(api, attribute, keyframes)

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

  return create
}

function addKeyframes(api: Api, attribute: string, keyframes: CssInJs) {
  if (properties.has(attribute)) properties.delete(attribute)
  else if (!generated.has(attribute)) {
    generated.add(attribute)

    /**
     * Keyframes definitions for CSS animations.
     *
     * These are placed in the `@base` layer because:
     * - Keyframes are global definitions that can be referenced by any element
     * - They don't create inheritance issues since they're just `@keyframes` rules
     * - They need to be available throughout the entire document
     * - They don't conflict with specificity or pseudo-element inheritance
     */
    api.addBase(keyframes)
  }
}
