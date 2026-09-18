/**
 * The native-reference builder, in one place, with the property name **converted rather than trusted**.
 *
 * It exists because a harness bug produced a void comparison that read like a finding: the reference was written
 * with the camelCase JavaScript name — `backdropFilter` in CSS rather than `backdrop-filter` — so the browser saw
 * an unknown property, the keyframe animated nothing, and "the reference" returned the same value at every sample.
 * Every arm built on it would have agreed with itself.
 *
 * So the conversion is a function, it is tested (`frames.test.mjs`), and it refuses to emit a name that still has
 * an uppercase character in it. A harness that builds references deserves the same guard as the code it measures.
 */
export const DURATION = 1000

/** A DOM property name as CSS spells it: `backdropFilter` → `backdrop-filter`, `filter` → `filter`. */
export const cssNameOf = name => {
  const kebab = String(name).replace(
    /[A-Z]/g,
    letter => `-${letter.toLowerCase()}`,
  )

  if (/[A-Z]/.test(kebab))
    throw new Error(`\`${name}\` still carries an uppercase character in CSS`)

  return kebab
}

/**
 * One native arm: a hand-written keyframe that animates the property between two whole values, on the element the
 * id names. No plugin is involved — this is the browser's own interpolation, which is the reference everything else
 * is a claim about.
 *
 * The timing function is a parameter because assuming `linear` produced a false finding: the plugin's default is
 * `ease`, so a `linear` reference walks a different curve and every correctly interpolating route reads as
 * `differs`. An arm that compares curves has to state which curve it is comparing against.
 */
export const nativeSheet = ({
  classes = [],
  easing = 'linear',
  from,
  id,
  property,
  to,
}) => {
  const name = id ?? `native-${cssNameOf(property)}`
  const property_name = cssNameOf(property)

  return {
    classes,
    css: `@keyframes ${name} { from { ${property_name}: ${from}; } to { ${property_name}: ${to}; } }
#${name} { animation: ${name} ${DURATION}ms ${easing} both; }`,
    name,
    property: property_name,
  }
}

/**
 * The functions in a computed filter list, as `name → arguments`.
 *
 * The shipped composition spells out every filter argument at its resting value, so a shipped series and a native
 * series can never be equal as strings: the comparison has to be per function, which is also the comparison the
 * question is actually about — whether the functions that *move* move the same way, in the same order.
 */
export const functionsOf = value => {
  const out = new Map()
  const text = String(value ?? '')

  if (!text || text === 'none') return out

  for (const match of text.matchAll(/([a-z-]+)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g))
    out.set(match[1], match[2].trim())

  // A no-argument function (`none`-like) would not match the pattern above; recorded so a dropped function is
  // visible as a missing key rather than as an absent parser result.
  for (const bare of text.matchAll(/(?:^|\s)([a-z-]+)(?=\s|$)/g))
    if (!out.has(bare[1])) out.set(bare[1], '')

  return out
}
