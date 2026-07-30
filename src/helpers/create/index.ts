import type { AnimatableStandardPropertyType, Api, Collection, Creator, Register, TailwindTheme } from '@/types'

import { css } from '@/helpers/css'
import { merge } from '@/helpers/merge'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyKeyframes } from '@/keyframes/property'

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

// Theme keys that produce nested palette objects (e.g. { red: { 500: '#f00' } })
// and must be flattened for matchUtilities. Non-color keys (borderRadius, spacing,
// opacity, etc.) are already flat and flattenColorPalette would corrupt them by
// iterating string characters when the compat layer collapses DEFAULT values.
const COLOR_THEME_KEYS = new Set<string>([
  'accentColor',
  'backgroundColor',
  'borderColor',
  'boxShadowColor',
  'caretColor',
  'colors',
  'divideColor',
  'fill',
  'gradientColorStops',
  'outlineColor',
  'placeholderColor',
  'ringColor',
  'ringOffsetColor',
  'stroke',
  'textColor',
  'textDecorationColor',
] satisfies Array<TailwindTheme>)

export function getCreator({ addUtilities, theme }: Api): Creator {
  const effects = new Set<string>()
  const properties = new Set<string>(['animation'])

  const create = {
    effect(attribute: string): string {
      const keyframes = effectKeyframes[attribute]
      register(effects, { attribute, keyframes })
      return variables(attribute)
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

    property(attribute: AnimatableStandardPropertyType): string {
      const keyframes = propertyKeyframes[attribute]
      register(properties, { attribute, keyframes })
      return variables(attribute)
    },

    theme: (key: TailwindTheme, values?: Collection) => {
      const result = theme(key)

      if (COLOR_THEME_KEYS.has(key)) {
        return flattenColorPalette(merge(result, values))
      }

      return merge(result, values)
    },
  }

  const variables = (attribute: string, name = `jumi-${attribute}`) => {
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
