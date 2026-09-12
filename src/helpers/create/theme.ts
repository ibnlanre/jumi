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
 * Every entry was verified against the shipped theme, and `pnpm theme:map`
 * re-measures it: the token exists for the name *and* carries the value the host
 * hands the plugin. A name that merely looks compatible proves nothing — the
 * `--inset-shadow-*` namespace matched three `inset` names and belongs to the inset
 * *shadow* utility.
 *
 * Keys with no entry keep the explicit value. Inventing a namespace for them would
 * create a second theme source inside Jumi, and a token that is missing has to be
 * visibly missing rather than silently served from a stale literal.
 *
 * Batch 1 — the colour family, plus `letterSpacing`. Next is the spacing formula
 * (`calc(var(--spacing) * n)`), which is a different kind of representation.
 */
export const themeTokens: Record<string, TokenNamespace> = {
  accentColor: { namespace: 'color' },
  backgroundColor: { namespace: 'color' },
  // The scale's own name has no token — there is no bare `--color` — so it keeps
  // the host's `currentColor` instead of an invented `--color-DEFAULT`.
  borderColor: { literal: ['DEFAULT'], namespace: 'color' },
  boxShadowColor: { namespace: 'color' },
  caretColor: { namespace: 'color' },
  colors: { namespace: 'color' },
  letterSpacing: { namespace: 'tracking' },
  outlineColor: { namespace: 'color' },
}

/**
 * Resolve one theme lookup into the values map Jumi hands its matchers.
 *
 * A name becomes a token reference only when the *host* supplied that exact value.
 * Twenty-odd call sites merge Jumi's own vocabulary into a host scale
 * (`theme('colors', fill)`, `theme('inset', inset)`), and those names have no
 * token. A name whose value was overridden keeps its literal for the same reason in
 * reverse: pointing it at the token would silently serve the host's value instead
 * of the one Jumi was handed.
 */
export function resolveTheme(
  api: Api,
  key: string,
  values?: Record<string, any>,
): Record<string, any> {
  const host = api.theme(key) ?? {}
  const hostValues = flattenPalette(host)
  const resolved = flattenPalette(merge(host, values))
  const target = themeTokens[key]

  if (!target) return resolved

  return Object.fromEntries(
    Object.entries(resolved).map(([name, value]) => {
      const token = hostValues[name] === value && !target.literal?.includes(name)

      return [name, token ? `var(--${target.namespace}-${name})` : value]
    }),
  )
}
