import type { CSSRuleObject, PluginCreator } from 'tailwindcss/types/config'

import { animationKeyframes } from './keyframes/animation'
import { propertyKeyframes } from './keyframes/property'
import { baseVariables } from './config/variables'
import { addPropertyUtilities } from './utilities/properties'
import { addTransformUtilities } from './utilities/transforms'

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
const jumiPlugin: PluginCreator = api => {
  const { addBase, addVariant } = api

  addBase(propertyKeyframes as CSSRuleObject)
  addBase(animationKeyframes as CSSRuleObject)
  addBase(baseVariables)

  addTransformUtilities(api)
  addPropertyUtilities(api)

  addVariant('animate-hover', '&:hover')
  addVariant('group-animate-hover', ':merge(.group):hover &')
}

export default jumiPlugin
