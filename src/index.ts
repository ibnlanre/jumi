import { getCreator } from '@/helpers/create'
import { getMatchComponents } from '@/properties/component'
import { getMatchUtilities, keyframe } from '@/properties/match'
import { variants } from '@/variants'

import createPlugin from 'tailwindcss/plugin'

const jumi = createPlugin((api) => {
  const { matchComponents, matchUtilities, matchVariant, on } = api

  for (const { generator, name, values } of variants) {
    matchVariant(name, generator, { values })
  }

  const creator = getCreator(api)

  const utilities = getMatchUtilities(creator)
  for (const name in utilities) {
    const { property, ...options } = utilities[name]
    matchUtilities({ [name]: property }, options)
  }

  const components = getMatchComponents(creator)
  for (const name in components) {
    const { property, ...options } = components[name]
    matchComponents({ [name]: property }, options)
  }

  on('buildComplete', ({ appendDeclaration, ruleMap }) => {
    const rules = ruleMap.get('jumi')
    if (!rules) return

    const properties = creator.properties.map(keyframe('property', 'animation'))
    const effects = creator.effects.map(keyframe('effect', 'animation'))
    const transitions = creator.transitions.map(keyframe('motion', 'transition'))

    const animation = properties.concat(effects).join(', ')
    const transition = transitions.join(', ')

    for (const rule of rules) {
      if (animation) {
        appendDeclaration(rule, {
          important: false,
          kind: 'declaration',
          property: 'animation',
          value: animation,
        })
      }

      if (transition) {
        appendDeclaration(rule, {
          important: false,
          kind: 'declaration',
          property: 'transition',
          value: transition,
        })
      }
    }
  })
})

export default jumi as ReturnType<typeof createPlugin>
