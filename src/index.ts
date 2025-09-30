import type { Collection, ComponentKey, CssInJs, MatchComponentsPropertyValue } from '@/types'

import { addProperties } from '@/properties/add'
import { component } from '@/properties/component'
import { getMatchProperties } from '@/properties/match'
import { propertyVariables } from '@/variables/property'
import { animationRegister } from '@/variables/register'
import { variants } from '@/variants'

import createPlugin from 'tailwindcss/plugin'

/**
 * CSS `@property` declarations for custom properties.
 *
 * These are placed in the `@base` layer because:
 * - `@property` rules must be defined globally like `@keyframes`
 * - They register CSS custom properties with type information
 * - They need to be available before any CSS that uses the properties
 */
const properties: Array<CssInJs> = [animationRegister]

/**
 * CSS custom properties (variables) that provide default values.
 *
 * These are placed in the @utilities layer because:
 * - When placed in @base, they get inherited by pseudo-elements (:before, :after)
 * - Inherited variables cannot be easily overridden in pseudo-elements
 * - This can lead to unforeseen problems where pseudo-elements inherit unwanted values
 * - @utilities layer provides the right specificity without forced inheritance
 */
const variables: Array<Collection<CssInJs>> = [propertyVariables]

/**
 * Utility classes and animation properties.
 *
 * These are placed in the @utilities layer because:
 * - They are meant to be applied to specific elements as needed
 * - They should have appropriate specificity for overriding defaults
 * - They work alongside the variables to create the complete animation system
 */
const utilities: Array<Collection<CssInJs>> = [addProperties]

const jumi = createPlugin((api) => {
  const { addBase, addUtilities, matchComponents, matchUtilities, matchVariant } = api

  properties.forEach(addBase)
  utilities.concat(variables).forEach(addUtilities)

  for (const variant of variants) {
    matchVariant(variant.name, variant.generator, {
      values: variant.values,
    })
  }

  const matchProperties = getMatchProperties(api)
  for (const name in matchProperties) {
    const { property, ...options } = matchProperties[name]
    matchUtilities({ [name]: property }, options)
  }

  for (const name in component) {
    const { property, ...options } = component[name]
    matchComponents({ [name]: property }, options)
  }
})

export default jumi as ReturnType<typeof createPlugin>
