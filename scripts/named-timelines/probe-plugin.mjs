import plugin from 'tailwindcss/plugin'

/**
 * A synthetic host probe. Imports nothing from Jumi, on purpose: the question is what **Tailwind** hands a
 * plugin's matcher, and a probe that went through Jumi's own registration would answer a different one.
 *
 * Every matcher writes the value it received into a custom property, so the harness can read both what the
 * callback was called with and whether the declaration survived validation.
 */
export const seen = []

const record = (kind, value, extra) => {
  seen.push({
    kind,
    modifier: extra?.modifier ?? null,
    value: typeof value === 'string' ? value : String(value),
  })
}

export default plugin(({ matchUtilities }) => {
  // `type: 'any'` — no grammar imposed, so whatever arrives is what the shorthand produced.
  matchUtilities(
    {
      probe: (value, extra) => {
        record('any', value, extra)
        return { '--probe-any': value }
      },
    },
    { values: {} },
  )

  // A typed matcher, because Jumi's matchers declare types and the phrase work already measured that
  // Tailwind validates an arbitrary value against the declared type *before* the callback runs.
  matchUtilities(
    {
      probelen: (value, extra) => {
        record('length', value, extra)
        return { '--probe-length': value }
      },
    },
    { type: ['length'], values: {} },
  )
})
