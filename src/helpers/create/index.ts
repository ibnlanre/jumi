import type { AnimatableStandardPropertyType, Api, Collection, Creator, CssInJs, Register, TailwindTheme } from '@/types'

import { css } from '@/helpers/css'
import { join } from '@/helpers/join'
import { merge } from '@/helpers/merge'
import { shortId } from '@/helpers/short-id'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyKeyframes } from '@/keyframes/property'

import { assemble } from '../assemble'

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

export function getCreator({ addUtilities, theme }: Api): Creator {
  const effects = new Set<string>()
  const properties = new Set<string>()
  const motions = new Set<string>()
  const keyframeNames = new Set<string>()

  const creator = {
    get animations() {
      const properties = creator.properties.reduce((acc, attribute) => {
        acc[`--jumi-${attribute}-animation`] = animationVariables(attribute)
        return merge(acc, assemble(attribute))
      }, {} as CssInJs)

      const effects = creator.effects.reduce((acc, attribute) => {
        acc[`--jumi-${attribute}-effect`] = animationVariables(attribute)
        return merge(acc, assemble(attribute))
      }, {} as CssInJs)

      const animation = [
        ...creator.properties.map(variables('animation')),
        ...creator.effects.map(variables('effect')),
      ].join(', ') || css('var', '--jumi-animation')

      return merge({ animation }, properties, effects, assemble('animation'))
    },

    effect(attribute: string): string {
      const keyframes = effectKeyframes[attribute]
      register(effects, { animationName: `jumi-${attribute}`, attribute, keyframes })
      return `jumi-${attribute}`
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
    get effects() { return Array.from(effects).sort() },

    motion(attribute: string): string {
      motions.add(attribute)
      return attribute
    },

    /**
     * This set tracks transition sub-properties that have been used by
     * transition utilities. Unlike properties/effects, transitions don't
     * need @keyframes — they compose into the CSS `transition` shorthand
     * via custom properties.
     *
     * When a transition sub-property is used for the first time, it is
     * recorded in this set. On subsequent uses, the presence of the
     * sub-property in this set prevents duplicate tracking.
     */
    get motions() { return Array.from(motions).sort() },

    /**
     * This set tracks properties that have already had their keyframes and
     * CSS custom properties (variables) added to the base styles.
     *
     * When a property is used for the first time, its keyframes are added and
     * the property is recorded in this set. On subsequent uses, the presence
     * of the property in this set indicates that its keyframes have already
     * been added, preventing duplicate additions.
     */
    get properties() { return Array.from(properties).sort() },

    property(attribute: AnimatableStandardPropertyType, value: string): string {
      const animationName = join(['jumi', attribute, shortId(value)], '-')
      const keyframes = propertyKeyframes[attribute](animationName)
      register(properties, { animationName, attribute, keyframes })
      return animationName
    },

    theme: (key: TailwindTheme, values?: Collection) => {
      return flattenColorPalette(merge(theme(key), values))
    },

    get transitions() {
      const motions = creator.motions.reduce((acc, attribute) => {
        acc[`--jumi-${attribute}-transition`] = transitionVariables(attribute)
        return acc
      }, {} as CssInJs)

      const transition
        = creator.motions.map(variables('transition')).join(', ')
          || css('var', '--jumi-transition')

      return merge({ transition }, motions, assemble('transition'))
    },
  }

  function animationVariables(attribute: string) {
    return [
      css('var', `--jumi-${attribute}-animation-name`, css('var', '--jumi-animation-name')),
      css('var', `--jumi-${attribute}-animation-duration`, css('var', '--jumi-animation-duration')),
      css('var', `--jumi-${attribute}-animation-timing-function`, css('var', '--jumi-animation-timing-function')),
      css('var', `--jumi-${attribute}-animation-delay`, css('var', '--jumi-animation-delay')),
      css('var', `--jumi-${attribute}-animation-iteration-count`, css('var', '--jumi-animation-iteration-count')),
      css('var', `--jumi-${attribute}-animation-direction`, css('var', '--jumi-animation-direction')),
      css('var', `--jumi-${attribute}-animation-fill-mode`, css('var', '--jumi-animation-fill-mode')),
      css('var', `--jumi-${attribute}-animation-play-state`, css('var', '--jumi-animation-play-state')),
    ].join(' ')
  }

  function transitionVariables(attribute: string): string {
    return join([
      css('var', `--jumi-${attribute}-transition-property`, attribute),
      css('var', `--jumi-${attribute}-transition-duration`, css('var', '--jumi-transition-duration')),
      css('var', `--jumi-${attribute}-transition-timing-function`, css('var', '--jumi-transition-timing-function')),
      css('var', `--jumi-${attribute}-transition-delay`, css('var', '--jumi-transition-delay')),
    ], ' ')
  }

  function variables(type: 'animation' | 'effect' | 'transition') {
    return (attribute: string) => {
      const variable = join(['--jumi', attribute, type], '-')
      return css('var', variable)
    }
  }

  const register: Register = (registry, { animationName, attribute, keyframes }) => {
    registry.add(attribute)
    if (keyframeNames.has(animationName)) return
    keyframeNames.add(animationName)

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

  return creator
}
