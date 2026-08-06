import { getCreator } from '@/helpers/create'
import { getMatchComponents } from '@/properties/component'
import { getMatchUtilities } from '@/properties/match'
import { variants } from '@/variants'

import createPlugin from 'tailwindcss/plugin'

const jumi = createPlugin((api) => {
  const { matchComponents, matchUtilities, matchVariant } = api

  for (const { generator, name, values } of variants) {
    matchVariant(name, generator, { values })
  }

  const creator = getCreator(api)

  const utilities = getMatchUtilities(creator)
  for (const name in utilities) {
    const { fn, ...options } = utilities[name]
    matchUtilities({ [name]: fn }, options)
  }

  const components = getMatchComponents(creator)
  for (const name in components) {
    const { fn, ...options } = components[name]
    matchComponents({ [name]: fn }, options)
  }
})

export default jumi as ReturnType<typeof createPlugin>
