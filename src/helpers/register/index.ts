import type { AtRule, Root } from 'postcss'

import postcss from 'postcss'

/**
 * Registering Jumi with Tailwind, so that `@plugin "@ibnlanre/jumi"` stops being something a user
 * writes.
 *
 * Jumi's lifetime inside Tailwind is three steps — registration, generation, finalization — and only
 * the middle one is Tailwind's. Asking the author to write a CSS directive for the first step and a
 * plugin entry for the third is Jumi exporting its own lifecycle. So the integration does the first
 * step too: `jumi()` in a Vite config or a PostCSS config registers Jumi in the stylesheet that is
 * acting as the Tailwind entry, and `@plugin "@ibnlanre/jumi"` keeps working for anyone who
 * prefers it explicit.
 *
 * Two rules keep that from being clever, and both are conservative:
 *
 *   **Only an entry.** The directive is added to a stylesheet that imports Tailwind, because that is
 *   the only place a Tailwind compilation root exists. A component stylesheet, a `@reference` file,
 *   or any other CSS is left byte-identical — this pass has no opinion about files Tailwind is not
 *   the compiler for.
 *
 *   **Only once.** If the file already registers Jumi — the specifier, or anything whose name
 *   mentions Jumi, which is what a by-path registration looks like — nothing is added. Measured:
 *   registering twice is not harmless, it emits every `@keyframes` twice.
 *
 * The pass runs on a generic PostCSS document, like the finalizer, and for the same reason: this is
 * a decision about CSS structure (which at-rules exist, in what order), and CSS is not text.
 */

/** What to register. Override it when the stylesheet registers Jumi by path — a monorepo, or the
 * docs site here, whose CSS names the vendored bundle instead of the package. It has to be the
 * published package name, because Tailwind resolves the directive as a module specifier. */
export const pluginSpecifier = '@ibnlanre/jumi'

export type Registered = {
  /** The stylesheet imports Tailwind, so it is a compilation root and a place to register. */
  entry: boolean
  /** A `@plugin` directive was added. */
  injected: boolean
}

/** A Tailwind entry: `@import "tailwindcss"` (with any of its subpaths), or the v3-era directives. */
const isEntry = (atRule: AtRule) =>
  atRule.name === 'tailwind'
  || (atRule.name === 'import' && /^["']?tailwindcss(\/[\w.-]+)*["']?(\s|$)/.test(atRule.params.trim()))

/** Jumi is registered if the specifier matches, or if a specifier names Jumi at all — which covers
 * `@plugin "@jumi/core"` and `@plugin "../../vendor/jumi.js"` without parsing paths. */
const isJumi = (params: string, specifier: string) => {
  const value = params.trim().replace(/^["']|["']$/g, '')

  return value === specifier || /jumi/i.test(value)
}

/**
 * Ensure Jumi is registered in a stylesheet, in place.
 *
 * Only top-level at-rules are considered: `@import` is only valid there, and a `@plugin` nested in
 * something else is not a registration this pass should be guessing about.
 */
export function register(root: Root, specifier: string = pluginSpecifier): Registered {
  let entry = false
  let registered = false
  let lastImport: AtRule | undefined

  for (const node of root.nodes) {
    if (node.type !== 'atrule') continue

    if (isEntry(node)) {
      entry = true
      lastImport = node
    }

    if (node.name === 'plugin' && isJumi(node.params, specifier)) registered = true
  }

  if (!entry || registered) return { entry, injected: false }

  const directive = postcss.atRule({ name: 'plugin', params: `"${specifier}"` })

  // Directly after the last import, and nothing more clever than that. `@import` is only valid
  // before other statements, and the directive belongs where a human writes it — beside the import
  // it belongs to. The blank line that separated the import from the rules stays where it is, which
  // is why the leading whitespace is set here rather than inherited from whatever follows.
  directive.raws.before = '\n'

  if (lastImport) root.insertAfter(lastImport, directive)
  else root.prepend(directive)

  return { entry, injected: true }
}

/** The string boundary, for a host that has CSS rather than an AST in hand. */
export function registerCss(css: string, specifier: string = pluginSpecifier) {
  const root = postcss.parse(css)

  return { ...register(root, specifier), css: root.toString() }
}
