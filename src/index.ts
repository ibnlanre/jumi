import type { MatchPropertyKeys } from '@/types'

import { baseVariables } from '@/config/variables'
import { flattenColorPalette } from '@/helpers/flatten-color-palette'
import { mergeTheme } from '@/helpers/merge-theme'
import { animationKeyframes } from '@/keyframes/animation'
import { propertyKeyframes } from '@/keyframes/property'
import { addProperties } from '@/properties/add'
import { matchProperties } from '@/properties/match'

import createPlugin from 'tailwindcss/plugin'

// Theme colors that support color flattening
const themeColors = [
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
const jumi = createPlugin(({ addBase, addUtilities, addVariant, matchUtilities, theme }) => {
  addBase(propertyKeyframes as any)
  addBase(animationKeyframes as any)
  addBase(baseVariables)
  addUtilities(addProperties)

  for (const name in matchProperties) {
    const item = matchProperties[name as MatchPropertyKeys]

    if (!item) continue
    const { key, property, values, ...options } = item

    const isColor = key ? themeColors.includes(key as string) : false
    const resolvedTheme = key ? theme(key as string) : undefined
    const current = isColor && key ? flattenColorPalette(theme(key as string)) : resolvedTheme

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
})

export default jumi as any
