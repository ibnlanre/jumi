/**
 * The Tailwind adapter.
 *
 * This is the only module that knows the host. It supplies the model with a
 * theme lookup and the two sinks, and it registers Jumi's definitions with
 * Tailwind's plugin API — nothing else. Everything Jumi *means* lives in
 * `@/core`, so the same model can drive another emitter later (a Jumi-owned
 * generator, for instance) without the semantics changing at all.
 *
 * One model per plugin instance, and Tailwind creates the plugin once per
 * compiler, so the model's registries (`values`, `phrases`, `composed`,
 * `effects`, `labels`, `registered`) live exactly as long as that compiler
 * does. `@/core` documents what that implies.
 */
import type { Api, Creator, GetMatchComponents, GetMatchUtilities } from '@/types'

import { createJumiModel } from '@/core'
import { stagingMarker } from '@/helpers/carriers'
import { resolveTheme } from '@/helpers/create/theme'
import { getMatchControls } from '@/properties/controls'
import { getMatchTween } from '@/properties/tween'

import createPlugin from 'tailwindcss/plugin'

/**
 * The model, wired to Tailwind.
 *
 * Note what `theme` means here, because the name is now misleading. It is not "ask Tailwind's JS
 * theme" — it is **resolve a Jumi theme vocabulary entry to the representation Tailwind v4 CSS
 * wants**, which is a token, a spacing formula, or the value as given. The host's API is one input
 * to that decision, not the decision: `@/helpers/create/theme` owns the table and the order, and
 * `pnpm theme:map` re-derives both from the emitted CSS. Every one of the 71 keys Jumi consumes has
 * an explicit strategy, and `literal` is one of them.
 *
 * So the signature is unchanged and the semantics are Jumi's. When the emitter is Jumi's own, this
 * is the function that stops being an adapter and becomes a resolver.
 */
export function getCreator(api: Api): Creator {
  return createJumiModel({
    sink: {
      keyframes: rules => api.addUtilities(rules),
      // Staging, not output. The data cannot be published where it is read: every entry is a
      // `var()` over a slot variable the `animate-*` utilities declare on the element, so the
      // same declaration on `:root` resolves once and every element inherits that literal —
      // measured, and it silently stops the stagger system. So the payload sits here, where
      // nothing consumes it, and `@/helpers/carriers` reads it off the emitted stylesheet and
      // builds the rules a browser actually needs. Its selector therefore does not matter;
      // `:root` is chosen to make that obvious.
      payload: (kind, variables) => api.addBase({
        ':root': Object.fromEntries(Object.entries(variables)
          .map(([name, value]) => [`${stagingMarker}${kind}-${name}`, value])),
      }),
      property: name => api.addBase({ [`@property ${name}`]: { inherits: 'false', syntax: '"*"' } }),
    },
    theme: (key, values) => resolveTheme(api, key, values),
  })
}

const jumi = createPlugin((api) => {
  const { matchComponents, matchUtilities } = api

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
