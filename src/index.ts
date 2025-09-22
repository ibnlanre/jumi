import type { CssInJs, MatchPropertyKeys } from '@/types'

import { html } from '@/config/html'
import { animationVariables, keyframeVariables, propertyVariables } from '@/config/variables'
import { merge } from '@/helpers/merge'
import { effectKeyframes } from '@/keyframes/effects'
import { propertyKeyframes } from '@/keyframes/property'
import { addProperties } from '@/properties/add'
import { matchProperties } from '@/properties/match'

import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
import createPlugin from 'tailwindcss/plugin'

export interface MatchVariant {
  generator: (value: string) => string
  name: string
  values: Record<string, string>
}

const variants: MatchVariant[] = [
  {
    generator: value => `& ${value}`,
    name: 'if-child-is',
    values: html,
  },
  {
    generator: value => `& > ${value}`,
    name: 'if-direct-child-is',
    values: html,
  },
  {
    generator: value => `& + ${value}`,
    name: 'if-next-sibling-is',
    values: html,
  },
  {
    generator: value => `& ~ ${value}`,
    name: 'if-sibling-is',
    values: html,
  },
]

const keyframes: CssInJs[] = [effectKeyframes, propertyKeyframes]
const variables: CssInJs[] = [animationVariables, keyframeVariables, propertyVariables]

/**
 * Jumi - TailwindCSS Animation Plugin
 *
 * @param options Configuration options for the plugin
 */
const jumi = createPlugin(({ addBase, addUtilities, matchUtilities, matchVariant, theme }) => {
  keyframes.forEach(addBase)
  variables.forEach(addBase)

  variants.forEach((variant) => {
    matchVariant(variant.name, variant.generator, {
      values: variant.values,
    })
  })

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
