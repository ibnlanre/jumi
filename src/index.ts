import { getCreator } from '@/helpers/create'
import { merge } from '@/helpers/merge'
import { getMatchComponents } from '@/properties/component'
import { getMatchControls } from '@/properties/controls'
import { getMatchTailwindUtilities } from '@/properties/tailwind'
import { getMatchTween } from '@/properties/tween'
import { atStops } from '@/theme/at-stops'
import { variants } from '@/variants'

import createPlugin from 'tailwindcss/plugin'

const jumi = createPlugin((api) => {
  const { matchComponents, matchUtilities, matchVariant } = api

  for (const { generator, name, values } of variants) {
    matchVariant(name, generator, { values })
  }

  const creator = getCreator(api)

  const registerTween = (utilities: ReturnType<typeof getMatchTween>) => {
    for (const name in utilities) {
      const { fn, modifiers = {}, ...options } = utilities[name]
      matchUtilities({ [name]: fn }, { ...options, modifiers: merge(atStops, modifiers) })
    }
  }

  const registerControls = (utilities: ReturnType<typeof getMatchControls>) => {
    for (const name in utilities) {
      const { fn, ...options } = utilities[name]
      matchUtilities({ [name]: fn }, options)
    }
  }

  registerTween(getMatchTween(creator))
  registerControls(getMatchControls(creator))
  registerControls(getMatchTailwindUtilities(creator))

  const components = getMatchComponents(creator)
  for (const name in components) {
    const { fn, ...options } = components[name]
    matchComponents({ [name]: fn }, options)
  }
})

export default jumi as ReturnType<typeof createPlugin>
