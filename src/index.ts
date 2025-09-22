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

const keyframes: Array<CssInJs> = [effectKeyframes, propertyKeyframes]
const variables: Array<Collection<CssInJs>> = [propertyVariables, animationVariables]
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
