import type { Api } from '@/types'

import { flattenPalette } from '@/helpers/flatten'
import { merge } from '@/helpers/merge'

/** How one of Jumi's theme keys is represented in CSS. */
export type TokenNamespace = {
  /** Names with no token in the namespace, which keep the value they were given. */
  literal?: string[]
  /** The prefix the host exposes the scale under, e.g. `color` for `--color-*`. */
  namespace: string
}

/**
 * Which theme keys resolve to a CSS token, and under which namespace.
 *
 * The policy, and it is measured rather than assumed:
 *
 * > Names do not define compatibility. Value-equivalent shipped tokens do.
 *
 * Every entry was verified against the shipped theme, and `pnpm theme:map` re-measures it: the
 * token exists for the name *and* carries the value the host hands the plugin. A name that merely
 * looks compatible proves nothing — the `--inset-shadow-*` namespace matched three `inset` names
 * and belongs to the inset *shadow* utility.
 *
 * Keys with no entry keep the explicit value. Inventing a namespace for them would create a second
 * theme source inside Jumi, and a token that is missing has to be visibly missing rather than
 * silently served from a stale literal.
 */
export const themeTokens: Record<string, TokenNamespace> = {
  accentColor: { namespace: 'color' },
  backgroundColor: { namespace: 'color' },
  // The scale's own name has no token — there is no bare `--color` — so it keeps the host's
  // `currentColor` instead of an invented `--color-DEFAULT`.
  borderColor: { literal: ['DEFAULT'], namespace: 'color' },
  boxShadowColor: { namespace: 'color' },
  caretColor: { namespace: 'color' },
  colors: { namespace: 'color' },
  letterSpacing: { namespace: 'tracking' },
  outlineColor: { namespace: 'color' },
}

/**
 * Which theme keys resolve through the spacing multiplier: `n` → `n × var(--spacing)`.
 *
 * Measured, not transcribed, and the measurement corrected the written plan in both directions:
 * `outlineOffset` is a px scale — `1: 1px, 2: 2px, 4: 4px, 8: 8px` — and does not belong here,
 * while `lineHeight` and `maxWidth` do, for the numeric names in their scales. `pnpm theme:map`
 * derives this same set from the host's own values and prints any drift between the two.
 */
export const themeSpacing = new Set([
  'flexBasis',
  'gap',
  'height',
  'inset',
  'lineHeight',
  'margin',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'padding',
  'translate',
  'width',
])

/**
 * The representation of a spacing name, or nothing when the name is not one.
 *
 * The **name is the contract**: in Tailwind v4 a numeric spacing name *is* the base multiple —
 * measured, `p-4` compiles to `calc(var(--spacing) * 4)` and `p-1` to `var(--spacing)` — so Jumi
 * can emit that without asking the host for anything.
 *
 * That is not only tidier, it is the fix. With `--spacing` overridden in `@theme`, the host's JS
 * scale is unusable: measured with `--spacing: 0.3rem`, `theme('margin')` returns the *characters
 * of the base string* — `1: '.'`, `2: '3'`, `4: 'e'` — because the scale is derived by indexing the
 * base rather than multiplying it. Anything that trusted those values emitted `margin: 3`. The
 * names that are not multiples (`0`, `px`, `auto`, the fractions) are not spacing arithmetic at
 * all, so they keep what the host supplied.
 */
const spacingRepresentation = (name: string) => {
  if (!/^\d+(?:\.\d+)?$/.test(name)) return null

  const factor = Number(name)

  if (!Number.isFinite(factor) || factor === 0) return null

  return factor === 1 ? 'var(--spacing)' : `calc(var(--spacing) * ${name})`
}

/**
 * Resolve one theme lookup into the values map Jumi hands its matchers.
 *
 * A name takes a representation only when the *host* supplied that exact value. Twenty-odd call
 * sites merge Jumi's own vocabulary into a host scale (`theme('colors', fill)`,
 * `theme('inset', inset)`), and those names have no representation. A name whose value was
 * overridden keeps its literal for the same reason in reverse: pointing it at a token or at
 * `--spacing` would silently serve the host's value instead of the one Jumi was handed.
 */
export function resolveTheme(
  api: Api,
  key: string,
  values?: Record<string, any>,
): Record<string, any> {
  const host = api.theme(key) ?? {}
  const resolved = flattenPalette(merge(host, values))
  const target = themeTokens[key]
  const spacing = themeSpacing.has(key)

  if (!target && !spacing) return resolved

  const hostValues = spacing ? {} : flattenPalette(host)

  return Object.fromEntries(
    Object.entries(resolved).map(([name, value]) => {
      if (spacing) return [name, spacingRepresentation(name) ?? value]

      if (hostValues[name] !== value) return [name, value]

      const token = target && !target.literal?.includes(name)

      return [name, token ? `var(--${target.namespace}-${name})` : value]
    }),
  )
}
