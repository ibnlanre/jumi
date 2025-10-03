import type { AnimatableStandardPropertyType, Api, Collection, CssInJs, Effect, Register, TailwindTheme } from '@/types'

import { css } from '@/helpers/css'
import { merge } from '@/helpers/merge'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyKeyframes } from '@/keyframes/property'

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

export function getCreator({ addUtilities, theme }: Api) {
  const create = {
    animation(attribute: AnimatableStandardPropertyType): string {
      const name = `jumi-${attribute}` as const
      const keyframes = propertyKeyframes[attribute]

      register(create.register, { attribute, keyframes })

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
      const keyframes = effectKeyframes[attribute as Effect] as Collection<CssInJs>

      register(create.effects, { attribute, keyframes })

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

    /**
     * This set tracks effects that have already had their keyframes added to
     * the base styles.
     *
     * When an effect is used for the first time, its keyframes are added and
     * the effect is recorded in this set. On subsequent uses, the presence of
     * the effect in this set indicates that its keyframes have already been
     * added, preventing duplicate additions.
     */
    effects: new Set<string>(),

    /**
     * This set tracks properties that have already had their keyframes and
     * CSS custom properties (variables) added to the base styles.
     *
     * When a property is used for the first time, its keyframes are added and
     * the property is recorded in this set. On subsequent uses, the presence
     * of the property in this set indicates that its keyframes have already
     * been added, preventing duplicate additions.
     */
    register: new Set<string>(['effect']),

    theme: (key: TailwindTheme, values?: Collection) => {
      return flattenColorPalette(merge(values, theme(key)))
    },
  }

  const register: Register = (registry, { attribute, keyframes }) => {
    if (registry.has(attribute)) return
    registry.add(attribute)

    /**
     * Utility classes and animation properties.
     *
     * These are placed in the @utilities layer because:
     * - They are meant to be applied to specific elements as needed
     * - They should have appropriate specificity for overriding defaults
     * - They work alongside the variables to create the complete animation system
     */
    addUtilities(keyframes)
  }

  return create
}
