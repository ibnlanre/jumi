import type { CSSRuleObject, PluginCreator, ThemeConfig } from 'tailwindcss/types/config'

import type { MatchPropertyKeys } from '@/types'

import { baseVariables } from '@/config/variables'
import { flattenColorPalette } from '@/helpers/flatten-color-palette'
import { mergeTheme } from '@/helpers/merge-theme'
import { animationKeyframes } from '@/keyframes/animation'
import { propertyKeyframes } from '@/keyframes/property'
import { addProperties } from '@/properties/add'
import { matchProperties } from '@/properties/match'

const themeColors: Array<keyof ThemeConfig> = [
  'accentColor',
  'ringColor',
  'borderColor',
  'divideColor',
  'backgroundColor',
  'gradientColorStops',
  'textColor',
  'caretColor',
  'colors',
  'fill',
  'outlineColor',
  'ringOffsetColor',
  'gradientColorStops',
  'placeholderColor',
  'textDecorationColor',
  'stroke',
]

/**
 * Jumi - TailwindCSS Animation Plugin
 *
 * A comprehensive CSS animation library that provides:
 * - Rich timing utilities (duration, delay, easing curves)
 * - Transform animations (translate, rotate, scale) with composability
 * - Effect animations (bounce, fade, slide, zoom)
 * - Property animations (width, height, colors, borders)
 * - Composable animation system with CSS custom properties
 * - Enhanced architecture inspired by TailwindCSS core plugins
 *
 * @param options Configuration options for the plugin
 */
const jumiPlugin: PluginCreator = (api) => {
  const { addBase, addUtilities, addVariant, matchUtilities, theme } = api

  addBase(propertyKeyframes as CSSRuleObject)
  addBase(animationKeyframes as CSSRuleObject)
  addBase(baseVariables)
  addUtilities(addProperties)

  for (const name in matchProperties) {
    const item = matchProperties[name as MatchPropertyKeys]

    if (!item) continue
    const { key, property, values, ...options } = item

    const isColor = key ? themeColors.includes(key) : false
    const resolvedTheme = key ? theme(key) : undefined
    const current = isColor ? flattenColorPalette(theme(key)) : resolvedTheme

    matchUtilities(
      {
        [name]: property,
      },
      {
        values: mergeTheme(current, values),
        ...options,
      },
    )
  }

  addVariant('animate-hover', '&:hover')
  addVariant('group-animate-hover', ':merge(.group):hover &')
}

export default jumiPlugin
