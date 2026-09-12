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
import { variants } from '@/variants'

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
      // Staging, not output. The aggregate cannot be published at a literal selector: its
      // entries reference the slot variables the `animate-*` utilities declare on the
      // element, so it only resolves where the carrier ended up — and Tailwind decides that,
      // by re-parenting the carrier body for a variant or copying it for `@apply`. Neither
      // `.animations` nor `:root` reaches those places; both were measured.
      //
      // So the carrier marks itself (see `animationUtility`) and this rule carries the data
      // to `@/helpers/carriers`, which injects it into every marked rule in the emitted
      // stylesheet and removes this one. Nothing in a browser ever reads it, which is why its
      // selector does not matter — `:root` is chosen to make that obvious.
      aggregate: variables => api.addBase({ ':root': { [stagingMarker]: '1', ...variables } }),
      keyframes: rules => api.addUtilities(rules),
      property: name => api.addBase({ [`@property ${name}`]: { inherits: 'false', syntax: '"*"' } }),
    },
    theme: (key, values) => resolveTheme(api, key, values),
  })
}

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
