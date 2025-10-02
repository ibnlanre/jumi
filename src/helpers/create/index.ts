import type { AnimatableStandardPropertyType, Api, Collection, CssInJs, Effect, Register, TailwindTheme } from '@/types'

import { animate } from '@/helpers/animate'
import { assemble } from '@/helpers/assemble'
import { css } from '@/helpers/css'
import { merge } from '@/helpers/merge'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyKeyframes, propertyNames } from '@/keyframes/property'

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

export function getCreator({ addBase, addUtilities, theme }: Api) {
  /**
   * Upon loading the plugin, TailwindCSS processes all utilities and variants.
   * However, keyframes should only be added once to avoid duplication.
   *
   * This set tracks all properties that are valid for animation. The trick
   * is to remove properties from this set as they are used. If a property is
   * still in the set when requested, it means it hasn't been used yet and its
   * keyframes can be added. If it's not in the set, it means the keyframes
   * have already been added and should not be added again.
   *
   * This ensures that each property's keyframes are only added once,
   * preventing duplication and potential conflicts in the generated CSS.
   */
  const properties = new Set<string>(propertyNames)

  const create = {
    animation(attribute: AnimatableStandardPropertyType): string {
      const name = `jumi-${attribute}` as const
      const variables = animate(assemble(attribute))
      const keyframes = propertyKeyframes[attribute] as Collection<CssInJs>

      if (properties.has(attribute)) properties.delete(attribute)
      else register(attribute, { keyframes, variables })

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

      register(attribute, { keyframes })

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
     * This set tracks properties that have already had their keyframes and
     * CSS custom properties (variables) added to the base styles.
     *
     * When a property is used for the first time, its keyframes are added and
     * the property is recorded in this set. On subsequent uses, the presence
     * of the property in this set indicates that its keyframes have already
     * been added, preventing duplicate additions.
     */
    registry: new Set<string>(['effect']),

    theme: (key: TailwindTheme, values?: Collection) => {
      return flattenColorPalette(merge(values, theme(key)))
    },
  }

  /**
   * CSS custom properties (variables) and keyframes that provide default values and animations.
   *
   * These are merged together and placed in the @base layer because:
   * - Variables provide default values for the animation properties
   * - Keyframes define the animation sequences
   * - Both are needed together for the animation system to work
   * - @base layer provides global availability without inheritance issues
   */
  const register: Register = (attribute: string, { keyframes, variables }) => {
    if (create.registry.has(attribute)) return
    create.registry.add(attribute)

    if (variables) addBase(variables)
    addUtilities(keyframes)
  }

  return create
}
