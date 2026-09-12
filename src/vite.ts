import type { PluginOptions } from '@tailwindcss/vite'
import type { Plugin } from 'vite'

import { finalizeCss, stagingMarker } from './helpers/carriers'
import { pluginSpecifier, registerCss } from './helpers/register'

import tailwindcss from '@tailwindcss/vite'

/**
 * Jumi's Vite integration: one entry, and it owns Jumi's whole lifecycle inside the build.
 *
 *   // vite.config.ts
 *   import jumi from 'jumi/vite'
 *   export default defineConfig({ plugins: [jumi()] })
 *
 *   // style.css, unchanged
 *   @import "tailwindcss";
 *
 * Three phases, in this order, and only the middle one is Tailwind's:
 *
 *   register      `@plugin "jumi"` is added to the Tailwind entry stylesheet if it is not there
 *   generate      Tailwind compiles what the project wrote
 *   finalize      the aggregate is completed into every carrier, and the staging removed
 *
 * The registration phase is why a project no longer writes a CSS directive at all, and it is also
 * the reason this is one entry rather than two: `jumi()` *replaces* `@tailwindcss/vite`, so nothing
 * has an ordering to get right.
 *
 * **Jumi must converge back toward one integration step.** That is the product constraint behind
 * this file. See the roadmap in `docs/migration.md`: what is left is the CSS directive's twin in the
 * other direction — no Tailwind JS plugin to compose at all.
 *
 * `jumiFinalizer` and `jumiRegister` are exported for a project that wants the phases explicit.
 * They work, `vite:check` exercises both ways, and they are not what the docs tell anyone to write.
 */
export default function jumi(options?: { plugin?: string, tailwind?: PluginOptions }): Plugin[] {
  return [
    jumiRegister(options?.plugin),
    ...tailwindcss(options?.tailwind),
    jumiFinalizer(),
  ]
}

/**
 * The finalizer alone, for projects that keep Tailwind's plugin entry and add Jumi after it.
 *
 * No `enforce`, and that is a measurement rather than a preference. Tailwind's three Vite plugins
 * all declare `enforce: 'pre'` (`@tailwindcss/vite:scan`, `:generate:serve`, `:generate:build`), so
 * a normal transform runs after generation by construction. What it must *not* be is `post`:
 * measured on Vite 7 with Tailwind 4.3.3, a `post` transform is handed the JS wrapper in dev
 * (`import { updateStyle as __vite__updateStyle, … }`) and an empty string in build, because Vite's
 * own CSS→JS/bundle step has already run. Normal is the one position where dev and build both still
 * have the generated stylesheet in hand, which is the only thing this pass can work on.
 *
 * Only a stylesheet that actually stages data is touched, so the cost of having this installed is
 * one marker search per CSS module.
 */
export function jumiFinalizer(): Plugin {
  return {
    name: 'jumi',

    transform(code, id) {
      if (!id.includes('.css') || !code.includes(stagingMarker)) return null

      const { css, staging } = finalizeCss(code)

      // Finalized already, or nothing to do: returning the same string would only make Vite
      // invalidate and re-serialize a module that did not change.
      if (!staging && css === code) return null

      return { code: css, map: null }
    },
  }
}

/**
 * Register Jumi in the Tailwind entry stylesheet, before Tailwind reads it.
 *
 * `enforce: 'pre'` and first in the array, because both of those matter: Tailwind's own plugins are
 * `pre`, and Vite orders the `pre` group by array position. Anything later — a normal transform, or
 * a `post` one — runs after generation, where the directive would arrive too late to register
 * anything.
 */
export function jumiRegister(specifier: string = pluginSpecifier): Plugin {
  return {
    enforce: 'pre',
    name: 'jumi:register',

    transform(code, id) {
      // Cheap check first: a stylesheet that never mentions Tailwind is not a compilation root, and
      // most of a project's CSS is component styles that are not.
      if (!id.includes('.css') || !code.includes('tailwindcss')) return null

      const { css, injected } = registerCss(code, specifier)

      return injected ? { code: css, map: null } : null
    },
  }
}
