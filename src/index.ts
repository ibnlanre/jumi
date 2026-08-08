import type { GetMatchComponents, GetMatchUtilities } from './types'

import { getCreator } from '@/helpers/create'
import { getMatchControls } from '@/properties/controls'
import { getMatchTween } from '@/properties/tween'
import { variants } from '@/variants'

import createPlugin from 'tailwindcss/plugin'

const jumi = createPlugin((api) => {
  const { matchComponents, matchUtilities, matchVariant } = api

  for (const { generator, name, values } of variants) {
    matchVariant(name, generator, { values })
  }

  const creator = getCreator(api)

  const registerComponents = (utilities: ReturnType<GetMatchComponents>) => {
    for (const name in utilities) {
      const { fn, ...options } = utilities[name]
      const { modifiers = {}, supportsNegativeValues = false, type = 'any', values } = options
      matchComponents({ [name]: fn }, { modifiers, supportsNegativeValues, type, values })
    }
  }
  registerComponents(getMatchTween(creator))

  const registerUtilities = (utilities: ReturnType<GetMatchUtilities>) => {
    for (const name in utilities) {
      const { fn, ...options } = utilities[name]
      const { modifiers = {}, supportsNegativeValues = false, type = 'any', values } = options
      matchUtilities({ [name]: fn }, { modifiers, supportsNegativeValues, type, values })
    }
  }
  registerUtilities(getMatchControls(creator))
})

export default jumi as ReturnType<typeof createPlugin>
