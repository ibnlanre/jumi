import type { CssInJs, MatchPropertyKeys } from '@/types'

import { baseVariables } from '@/config/variables'
import { merge } from '@/helpers/merge'
import { rebase } from '@/helpers/rebase'
import { animationKeyframes } from '@/keyframes/animation'
import { propertyKeyframes } from '@/keyframes/property'
import { addProperties } from '@/properties/add'
import { matchProperties } from '@/properties/match'

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
import createPlugin from 'tailwindcss/plugin'

/**
 * Jumi - TailwindCSS Animation Plugin
 *
 * @param options Configuration options for the plugin
 */
const jumi = createPlugin(({ addBase, addUtilities, addVariant, matchUtilities, theme }) => {
  addBase(rebase<CssInJs>(propertyKeyframes))
  addBase(rebase<CssInJs>(animationKeyframes))
  addBase(baseVariables)

  addVariant('animate-hover', '&:hover')
  addUtilities(addProperties)

  for (const name in matchProperties) {
    const item = matchProperties[name as MatchPropertyKeys]!

    const { key, property, values, ...options } = item

    const resolved = key ? theme(key) : undefined
    const result = flattenColorPalette(merge(resolved, values))

    matchUtilities({ [name]: property }, merge(options, { values: result }))
  }
})

export default jumi as ReturnType<typeof createPlugin>
