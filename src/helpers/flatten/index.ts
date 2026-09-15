/**
 * Flatten a theme values map into `{ key: value }` pairs a Tailwind matcher can
 * use as its candidate vocabulary.
 *
 * Jumi owns this instead of importing Tailwind's own helper, which lives behind
 * `tailwindcss/lib/util/…` — a private path, not a public entry point.
 *
 * Measured against the installed Tailwind (v4.3.3): `api.theme(key)` already
 * returns a flat map, and every map Jumi merges into it (`src/theme/*`) is flat
 * too, so for today's inputs this is a `merge` plus two compatibility rules.
 * They are kept because the *shape* is Tailwind's convention, not because the
 * current corpus exercises them — see the tests.
 *
 * One behaviour of the host helper is deliberately not replicated: it re-applies
 * the raw value at any key whose `__CSS_VALUES__` flag lacks bit 4 ("resolved"),
 * which is how `@theme inline` / `@theme reference` declare themselves. Measured
 * 288/288 colour keys carry the bit for the default `@theme` form, so the branch
 * is inert for every input Jumi can currently produce — and for the nested cases
 * where it would fire, the host helper replaces a flattened scalar with a subtree.
 * Owning the theme contract for real (`engineering/roadmap/migration.md`) is where that decision
 * belongs.
 */
export function flattenPalette(
  values: Record<string, any> | undefined,
): Record<string, any> {
  const flattened: Record<string, any> = {}

  for (const [key, value] of Object.entries(values ?? {})) {
    // Tailwind's metadata about how each value is declared. It describes the map
    // rather than being an entry in it, so it never becomes a candidate.
    if (key === '__CSS_VALUES__') continue

    if (typeof value === 'object' && value !== null) {
      // A palette nest: `{ blue: { 500: '#00f' } }` is one candidate per leaf,
      // spelled `blue-500`.
      for (const [nested, leaf] of Object.entries(flattenPalette(value))) {
        // `DEFAULT` is the name of the scale itself: `blue` is `blue-DEFAULT`.
        flattened[`${key}${nested === 'DEFAULT' ? '' : `-${nested}`}`] = leaf
      }
    } else {
      flattened[key] = value
    }
  }

  return flattened
}
