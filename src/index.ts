import { getMatchComponents } from '@/properties/component'
import { getMatchUtilities } from '@/properties/match'
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
const register = [animationRegister]

const jumi = createPlugin((api) => {
  const { matchComponents, matchUtilities, matchVariant } = api

  for (const { generator, name, values } of variants) {
    matchVariant(name, generator, { values })
  }

  const utilities = getMatchUtilities(api)
  for (const name in utilities) {
    const { property, ...options } = utilities[name]
    matchUtilities({ [name]: property }, options)
  }

  const components = getMatchComponents(api)
  for (const name in components) {
    const { property, ...options } = components[name]
    matchComponents({ [name]: property }, options)
  }
})

export default jumi as ReturnType<typeof createPlugin>
