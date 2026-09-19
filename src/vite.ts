import { finalizeCss, stagingMarker } from './helpers/carriers'
import { pluginSpecifier, registerCss } from './helpers/register'

import tailwindcss from '@tailwindcss/vite'

/**
 * The two types this file needs from packages that are ES modules — and they have to say so.
 *
 * `dist/vite.d.cts` is a CommonJS declaration, because it sits behind the `require` condition, and both
 * `@tailwindcss/vite` and `vite` are ES modules: the first publishes no `require` condition at all and the
 * second is `"type": "module"`. TypeScript refuses a type import of an ES module from a CommonJS module
 * unless it is told which condition to resolve — `TS1542`, "must have a 'resolution-mode' attribute" — and
 * with the attribute it accepts it: the reference is erased, so the `require`-side runtime never changes.
 *
 * Without this the published `vite.d.cts` reported two `TS1479`s under `moduleResolution: node16` and a
 * consumer's first compile in a CommonJS project failed on declarations they never touched.
 */
type Plugin = import('vite', {
  with: { 'resolution-mode': 'import' },
}).Plugin
type PluginOptions = import('@tailwindcss/vite', {
  with: { 'resolution-mode': 'import' },
}).PluginOptions

/**
 * Jumi's Vite integration: one entry, and it owns Jumi's whole lifecycle inside the build.
 *
 *   // vite.config.ts
 *   import jumi from '@ibnlanre/jumi/vite'
 *   export default defineConfig({ plugins: [jumi()] })
 *
 *   // style.css, unchanged
 *   @import "tailwindcss";
 *
 * Three phases, in this order, and only the middle one is Tailwind's:
 *
 *   register      `@plugin "@ibnlanre/jumi"` is added to the Tailwind entry stylesheet if it is not there
 *   generate      Tailwind compiles what the project wrote
 *   finalize      the aggregate is completed into every carrier, and the staging removed
 *
 * The registration phase is why a project no longer writes a CSS directive at all, and it is also
 * the reason this is one entry rather than two: `jumi()` *replaces* `@tailwindcss/vite`, so nothing
 * has an ordering to get right.
 *
 * **Jumi must converge back toward one integration step.** That is the product constraint behind
 * this file. See the roadmap in `engineering/roadmap/migration.md`: what is left is the CSS directive's twin in the
 * other direction — no Tailwind JS plugin to compose at all.
 *
 * `jumiFinalizer` is exported for a project that wants the phases explicit. It works,
 * `vite:check` exercises both ways, and it is not what the docs tell anyone to write. Registration
 * is not exported: `jumi()` is the only thing that should be adding the directive, and the
 * hand-written equivalent is `@plugin "@ibnlanre/jumi"` in the stylesheet.
 */
export default function jumi(options?: {
  plugin?: string
  tailwind?: PluginOptions
}): Plugin[] {
  /**
   * The factory, read from whichever place the build put it.
   *
   * This line is a CommonJS interop repair, and it is the smallest boundary for one: the defect was
   * here, in the call, not in the declarations. esbuild's `__toESM` wrap leaves `.default` pointing at
   * the **module namespace** in the CommonJS output, so spreading its result iterates a plain object and
   * throws — `require('@ibnlanre/jumi/vite')()` was a TypeError while the module itself loaded cleanly,
   * which is why the consumer stage's execution claim held and the package was still unusable from
   * CommonJS. The ES module build hands the factory over directly, where `.default` is undefined and
   * the right-hand side is what the call always used. `scripts/consumer-check.mjs` now constructs this
   * entry from both module systems rather than only loading it.
   */
  const factory =
    (tailwindcss as { default?: typeof tailwindcss }).default ?? tailwindcss

  return [
    jumiRegister(options?.plugin),
    ...factory(options?.tailwind),
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
      // Two conditions for one reason, and the second is insurance rather than a case that occurs.
      // Measured: a view-transition candidate always stages a carrier payload too, because the utility
      // it wraps registers a slot. So `stagingMarker` alone would not skip a view transition *today* —
      // but a guard that only looks for the payload marker would skip one silently if that ever stopped
      // being true, and the failure would be a feature that works everywhere except a build.
      if (!id.includes('.css')) return null
      if (!code.includes(stagingMarker) && !code.includes('jumi-vt-'))
        return null

      const { css, staging, warnings } = finalizeCss(code)

      // A refused candidate is otherwise indistinguishable from one that worked, because the page
      // renders either way. Vite's own channel, so it reaches whoever is running the build.
      for (const warning of warnings) this.warn(warning)

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
function jumiRegister(specifier: string = pluginSpecifier): Plugin {
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
