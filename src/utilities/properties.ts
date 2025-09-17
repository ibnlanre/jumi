import type { PluginAPI } from 'tailwindcss/types/config'

import type { MatchPropertyKeys } from '@/types'

import { mergeTheme } from '@/helpers/merge-theme'
import { addProperties } from '@/properties/add'
import { matchProperties } from '@/properties/match'

export function addPropertyUtilities({
  addUtilities,
  matchUtilities,
  theme,
}: PluginAPI) {
  addUtilities(addProperties)

  for (const name in matchProperties) {
    const item = matchProperties[name as MatchPropertyKeys]
    const { key, property, values, ...options } = item

    matchUtilities(
      {
        [name]: property,
      },
      {
        values: mergeTheme(theme(key), values),
        ...options,
      },
    )
  }
}
