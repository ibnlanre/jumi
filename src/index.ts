import type { Collection, CssInJs, MatchPropertyKeys } from '@/types'

import { merge } from '@/helpers/merge'
import { effectKeyframes } from '@/keyframes/effects'
import { animationKeyframes, propertyKeyframes } from '@/keyframes/property'
import { addProperties } from '@/properties/add'
import { matchProperties } from '@/properties/match'
import { animationVariables } from '@/variables/animation'
import { propertyVariables } from '@/variables/property'
import { variants } from '@/variants'

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
import createPlugin from 'tailwindcss/plugin'

/**
 * Keyframes definitions for CSS animations.
 *
 * These are placed in the @base layer because:
 * - Keyframes are global definitions that can be referenced by any element
 * - They don't create inheritance issues since they're just @keyframes rules
 * - They need to be available throughout the entire document
 * - They don't conflict with specificity or pseudo-element inheritance
 */
const keyframes: Array<CssInJs> = [effectKeyframes, propertyKeyframes]

/**
 * CSS custom properties (variables) that provide default values.
 *
 * These are placed in the @utilities layer because:
 * - When placed in @base, they get inherited by pseudo-elements (:before, :after)
 * - Inherited variables cannot be easily overridden in pseudo-elements
 * - This can lead to unforeseen problems where pseudo-elements inherit unwanted values
 * - @utilities layer provides the right specificity without forced inheritance
 */
const variables: Array<Collection<CssInJs>> = [propertyVariables, animationVariables]

/**
 * Utility classes and animation properties.
 *
 * These are placed in the @utilities layer because:
 * - They are meant to be applied to specific elements as needed
 * - They should have appropriate specificity for overriding defaults
 * - They work alongside the variables to create the complete animation system
 */
const utilities: Array<Collection<CssInJs>> = [animationKeyframes, addProperties]

const jumi = createPlugin(({ addBase, addUtilities, matchUtilities, matchVariant, theme }) => {
  variables.concat(utilities).forEach(addUtilities)
  keyframes.forEach(addBase)

  variants.forEach((variant) => {
    matchVariant(variant.name, variant.generator, {
      values: variant.values,
    })
  })

  for (const name in matchProperties) {
    const item = matchProperties[name as MatchPropertyKeys]!

    const { key, property, values, ...options } = item

    const resolved = key ? theme(key) : undefined
    const result = flattenColorPalette(merge(resolved, values))

    matchUtilities({ [name]: property }, merge(options, { values: result }))
  }
})

export default jumi as ReturnType<typeof createPlugin>
