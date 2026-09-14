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
import {
  identityAccepted,
  viewTransitionInvalidMarker,
  viewTransitionMarker,
} from '@/helpers/carriers/view-transition'
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
      // `syntax: "*"` is not a placeholder for a grammar Jumi has yet to write: it is the
      // permissive syntax that makes the registration *valid* without imposing a typed value
      // grammar on a token like `jumi-rotate-3zWYd`. With no `initial-value` it also leaves the
      // initial value as the guaranteed-invalid value, so a descendant that declares no activation
      // of its own takes the composition's `var()` fallback rather than an ancestor's token. The two
      // declarations are one semantic unit — `inherits: false` cannot be written without a syntax,
      // and `syntax: "*"` alone would still inherit. See the `property` sink in `@/core`.
      property: name => api.addBase({ [`@property ${name}`]: { inherits: 'false', syntax: '"*"' } }),
    },
    theme: (key, values) => resolveTheme(api, key, values),
  })
}

const jumi = createPlugin((api) => {
  const { matchComponents, matchUtilities, matchVariant } = api

  const creator = getCreator(api)

  /**
   * View transitions, registered as a **variant** and not as a utility.
   *
   * Read it the way Tailwind's own `group-hover/button:` is read: a variant parameterised by a
   * modifier, so `view-transition-old/hero:animate-fade-out` is the ordinary `animate-fade-out`
   * wrapped by a variant whose value is the side and whose modifier is the identity. Everything after
   * the `:` therefore stays an ordinary candidate — every existing Jumi motion, control, label,
   * arbitrary value and composition feature works through it unchanged, and none of them needs to
   * learn a second vocabulary. That is the whole reason for the shape.
   *
   * What the callback returns is a **marker**, not an animation: `&:where(.jumi-vt-old-hero)` matches
   * no page, so the motion never reaches the element the author wrote, and the author's own class
   * stays in the selector for the finalizer to recover the other three facts from. The declarations
   * are data until `@/helpers/carriers` replays them onto `::view-transition-old(hero)`, which is the
   * only place they can run.
   *
   * Both refusals return the same never-matching marker rather than `&`, and returning `&` is the
   * mistake worth naming: it would apply the motion to the source element, where it would run as a
   * second animation over the real one — plausible-looking output and a wrong page. Nothing this
   * variant refuses may ever reach an element.
   *
   * The first branch is not about the author. Tailwind invokes this callback once at configuration
   * time with a sentinel value and no candidate, and the `values` option does not filter it, so
   * anything it *records* needs a guard. Refusing by value means the sentinel produces a marker that
   * no candidate instantiates — which is why the finalizer reads the identities out of the
   * stylesheet instead of remembering them here. There is nothing to remember, so there is nothing
   * to forget.
   */
  matchVariant('view-transition', (side, { modifier }) => {
    if (side !== 'old' && side !== 'new') return viewTransitionInvalidMarker('name')
    if (!modifier) return viewTransitionInvalidMarker('missing')
    if (!identityAccepted(modifier)) return viewTransitionInvalidMarker('name')

    return viewTransitionMarker(side, modifier)
  }, { values: { new: 'new', old: 'old' } })

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
