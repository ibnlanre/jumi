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
 * Five scales are partial: some names are token-backed, some are spacing arithmetic, and the rest
 * keep what the host gave. They are resolved per name, so a scale can be all three at once —
 * `leading-6` is `calc(var(--spacing) * 6)`, `leading-tight` is `var(--leading-tight)`, and
 * `leading-none` is `1`.
 *
 * `boxShadow` is deliberately absent, and it is why this table is measured rather than inferred:
 * `--shadow-*` exists and looks exactly like `--drop-shadow-*`, but `shadow-sm` inlines its value
 * (`--tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, …)`) while `drop-shadow-sm` references its
 * token (`--tw-drop-shadow: drop-shadow(var(--drop-shadow-sm))`). Similarly named scales do not
 * behave similarly.
 *
 * Keys with no entry keep the explicit value. Inventing a namespace for them would create a second
 * theme source inside Jumi, and a token that is missing has to be visibly missing rather than
 * silently served from a stale literal.
 */
export const themeTokens: Record<string, TokenNamespace> = {
  accentColor: { namespace: 'color' },
  // Measured with the rest of the filter scales and not with `blur`: they are separate keys with
  // separate utilities (`backdrop-blur-*` beside `blur-*`), and only the measurement says they
  // borrow the same `--blur-*` tokens.
  backdropBlur: { literal: ['DEFAULT', 'none'], namespace: 'blur' },
  backgroundColor: { namespace: 'color' },
  blur: { literal: ['DEFAULT', 'none'], namespace: 'blur' },
  // The scale's own name has no token — there is no bare `--color` — so it keeps the host's
  // `currentColor` instead of an invented `--color-DEFAULT`.
  borderColor: { literal: ['DEFAULT'], namespace: 'color' },
  borderRadius: { literal: ['DEFAULT', 'full', 'none'], namespace: 'radius' },
  boxShadowColor: { namespace: 'color' },
  caretColor: { namespace: 'color' },
  colors: { namespace: 'color' },
  dropShadow: { literal: ['DEFAULT', 'none'], namespace: 'drop-shadow' },
  letterSpacing: { namespace: 'tracking' },
  lineHeight: { literal: ['none'], namespace: 'leading' },
  maxWidth: { literal: ['fit', 'full', 'max', 'min', 'none', 'prose', 'px'], namespace: 'container' },
  outlineColor: { namespace: 'color' },
}

/**
 * Which theme keys resolve through the spacing multiplier: `n` → `n × var(--spacing)`.
 *
 * Measured, not transcribed, and the measurement corrected the written plan in both directions:
 * `outlineOffset` is a px scale — `1: 1px, 2: 2px, 4: 4px, 8: 8px` — and does not belong here,
 * while `lineHeight` and `maxWidth` do, for the numeric names in their scales. `pnpm theme:map`
 * derives this same set from the host's own values and prints any drift between the two.
 *
 * Membership is per name, not per key: `lineHeight` and `maxWidth` are in here *and* in
 * `themeTokens`, because their non-numeric names are token-backed. `leading-6` is spacing
 * arithmetic and `leading-tight` is a token, out of the same scale.
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

/** A name that is nothing but a number. */
const numeric = /^\d+(?:\.\d+)?$/

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
  if (!numeric.test(name)) return null

  const factor = Number(name)

  if (!Number.isFinite(factor) || factor === 0) return null

  return factor === 1 ? 'var(--spacing)' : `calc(var(--spacing) * ${name})`
}

/**
 * What one name of a scale resolves to: spacing arithmetic, a token, or the value it was given.
 *
 * The order matters. Spacing comes first because the name is the contract for those; a token
 * reference comes only for a name the host itself supplied, because a name Jumi merged into the
 * scale has no representation; and the literals are everything left over.
 *
 * A bare number is never a token reference. Only part of what the host hands over for these keys is
 * a scale: when one carries a `DEFAULT`, the compatibility layer collapses it to a string and
 * spreads the characters, so `theme('radius')` offers `0: '0'`, `1: '.'`, `2: '2'` … Measured,
 * those entries are not names anyone can ask for — `rounded-1` emits nothing — and the real names
 * (`sm`, `2xl`, `3xs`) are never bare numbers.
 */
const representation = (
  name: string,
  value: string,
  supplied: boolean,
  target?: TokenNamespace,
  spacing = false,
) => {
  if (spacing) {
    const formula = spacingRepresentation(name)

    if (formula) return formula
  }

  if (!supplied || !target || target.literal?.includes(name)) return value

  return numeric.test(name) ? value : `var(--${target.namespace}-${name})`
}

/**
 * Resolve one theme lookup into the values map Jumi hands its matchers.
 *
 * A name takes a *token* representation only when the *host* supplied that exact value. Twenty-odd
 * call sites merge Jumi's own vocabulary into a host scale (`theme('colors', fill)`,
 * `theme('inset', inset)`), and those names have no representation. A name whose value was
 * overridden keeps its literal for the same reason in reverse: pointing it at a token would
 * silently serve the host's value instead of the one Jumi was handed. Spacing arithmetic is the
 * exception, because there the name is the contract and the value is beside the point.
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

  const hostValues = flattenPalette(host)

  return Object.fromEntries(
    Object.entries(resolved).map(([name, value]) => [
      name,
      representation(name, value, hostValues[name] === value, target, spacing),
    ]),
  )
}
