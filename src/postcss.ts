import type { PluginOptions } from '@tailwindcss/postcss'
import type { Plugin, Processor } from 'postcss'

import { finalize } from './helpers/carriers'
import { pluginSpecifier, register } from './helpers/register'

import tailwindcss from '@tailwindcss/postcss'
import postcss from 'postcss'

/**
 * Jumi's PostCSS integration: one entry, and it owns Jumi's whole lifecycle inside the build.
 *
 *   // postcss.config.js
 *   export default { plugins: { '@ibnlanre/jumi/postcss': {} } }
 *
 *   // style.css, unchanged
 *   @import "tailwindcss";
 *
 * Same three phases as `@ibnlanre/jumi/vite`. The phase that needs care here is registration: Tailwind reads
 * `@plugin` during its own `Once`, so the directive has to be added *before* that — which is why the
 * registration plugin runs in `Once` and leads the list, while the finalizer runs in `OnceExit`,
 * after every plugin's `Once` whatever the order the config lists. Measured, both orderings work;
 * nothing about this file asks the author to know how PostCSS sequences its plugins.
 *
 * The list is returned as a `Processor` because that is how PostCSS expresses "a plugin that is
 * several plugins" — the type-safe equivalent of the `{ postcssPlugin, plugins }` container the
 * Tailwind plugin itself returns.
 */
export default function jumi(options?: { plugin?: string, tailwind?: PluginOptions }): Processor {
  return postcss([
    jumiRegister(options?.plugin),
    tailwindcss(options?.tailwind),
    jumiFinalizer(),
  ])
}

/**
 * The finalizer alone, for a config that keeps `@tailwindcss/postcss` and adds Jumi after it.
 *
 * `OnceExit` rather than `Once` is the whole robustness of this plugin: the finalizer has to run
 * after Tailwind has emitted, and `OnceExit` runs after every plugin's `Once` regardless of where
 * this one sits in the list. With `Once` it would silently finalize an empty document when listed
 * before Tailwind — the same class of failure as a Vite `post` transform, and just as quiet.
 *
 * It does not register Jumi: by the time this runs, Tailwind has already read the directives, so a
 * config using this one still names `@plugin "@ibnlanre/jumi"` itself.
 */
export function jumiFinalizer(): Plugin {
  return {
    OnceExit(root) {
      finalize(root)
    },

    postcssPlugin: 'jumi',
  }
}

/**
 * Register Jumi in the Tailwind entry stylesheet, before Tailwind reads it.
 *
 * `Once`, not `OnceExit`: registration is the one phase that cannot be last.
 */
export function jumiRegister(specifier: string = pluginSpecifier): Plugin {
  return {
    Once(root) {
      register(root, specifier)
    },

    postcssPlugin: 'jumi:register',
  }
}
