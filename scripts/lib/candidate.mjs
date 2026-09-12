/**
 * Candidate semantics — Jumi's side of the matcher payload.
 *
 * A prototype for Phase 3a, validated differentially against the host (`scripts/candidate-diff.mjs`)
 * rather than against our reading of it. It is deliberately **order-agnostic**: sequencing belongs
 * to whichever source produced the raw candidate — the scanner sorts, `@apply` does not — and
 * precedence concerns must not leak in here.
 *
 * The scope is bounded by Jumi's own vocabulary, not Tailwind's:
 *
 *   root selection         longest registered matcher name that the candidate starts with
 *   named value lookup     `values[remainder]`, which the model already resolved
 *   arbitrary value decode `[23deg]` -> `23deg`, `[calc(1deg_+_2deg)]` -> `calc(1deg + 2deg)`
 *   modifier split         the last `/` outside brackets
 *   negative handling      `calc(<value> * -1)`, composed onto the resolved value
 *   type rejection         `type: 'length'` refuses `abc`, so the host calls nothing
 *
 * Variants are opaque prefixes and are stripped by the caller: measured, they never reach a matcher
 * (see `engineering/research/scanner-inventory.md`). `!` is recorded, not acted on — the corpora do not use it.
 */

/**
 * @typedef {object} JumiCandidate
 * @property {string} root        `animate-rotate`
 * @property {string} value       `45deg`, after the named-value lookup and any negation
 * @property {string | null} modifier
 * @property {boolean} negative
 */

/** An arbitrary value is a Tailwind expression, not just a literal. */
const numeric = /^-?\d+(?:\.\d+)?$/

/**
 * A bare number for a typed utility is derived by the host, and the derivation is per type:
 * `animate-rotate-360` arrives as `360deg`. Measured, and only for the types where it was seen —
 * `animate-width-abc` is rejected, because a bare *word* is not a value at all.
 */
const derive = (value, types) => {
  if (!numeric.test(value)) return null
  if (types.includes('angle')) return `${value}deg`
  if (types.includes('length')) return `calc(var(--spacing) * ${value})`

  return null
}

const declared = type => (Array.isArray(type) ? type : type ? [type] : ['any'])

/**
 * Strip an opaque variant prefix: everything before the last `:` outside brackets.
 *
 * Measured, a variant never reaches a matcher — `hover:animate-scale-110` and
 * `animate-scale-110` produce the same payload — so this is a prefix removal, not variant
 * semantics. Recognising what `hover:` *means*, and where the prefix has to be re-applied, stays
 * in the variant workstream.
 */
const stripPrefix = (raw) => {
  let depth = 0
  let at = -1

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index]

    if (character === '[' || character === '(') depth += 1
    else if (character === ']' || character === ')') depth -= 1
    else if (character === ':' && depth === 0) at = index
  }

  return at === -1 ? raw : raw.slice(at + 1)
}

/**
 * `!` and the variant prefix are the caller's business; the negative sign is semantics, so it is
 * parsed here. The sign is *not* stripped for root selection: `-animate-bottom-4` matches
 * `animate-bottom`.
 */
const split = (raw) => {
  const bare = stripPrefix(raw).replace(/!$/, '')
  const negative = bare.startsWith('-')

  return { candidate: negative ? bare.slice(1) : bare, negative }
}

/** Decode an arbitrary value: strip the brackets and undo Tailwind's `_` for a space. */
const decode = value => value.slice(1, -1).replace(/_/g, ' ')

/** A bracketed modifier is unwrapped the same way a bracketed value is: `/[flick]` -> `flick`. */
const wrapped = modifier => (modifier.startsWith('[') && modifier.endsWith(']')
  ? decode(modifier)
  : modifier)

/** The last `/` that is not inside brackets or parentheses: the modifier separator. */
const splitModifier = (remainder) => {
  let depth = 0

  for (let at = remainder.length - 1; at >= 0; at -= 1) {
    const character = remainder[at]

    if (character === ']' || character === ')') depth += 1
    else if (character === '[' || character === '(') depth -= 1
    else if (character === '/' && depth === 0) {
      return { modifier: remainder.slice(at + 1), value: remainder.slice(0, at) }
    }
  }

  return { modifier: null, value: remainder }
}

/** Root selection: longest registered name first, which is the order the host tries them in. */
const roots = vocabulary => [...vocabulary].sort((a, b) => b.name.length - a.name.length)

/**
 * Parse one candidate into what a matcher receives, or `null` when the host would reject it.
 *
 * The value resolution order is the host's, and it was measured rather than assumed:
 *
 *   named        `values[remainder]` — resolved by the model already, so this is a lookup
 *   arbitrary    accepted for any shape at all. Jumi's tween utilities take *phrases*
 *                (`[0:0deg,20:-8deg,100:-8deg]`), so the host does not type-check them; the model
 *                validates a phrase after the fact, which is 3d's business
 *   bare         a number the declared type can derive from (`360` -> `360deg`)
 *   otherwise    rejected, which is why `animate-width-abc` never reaches a matcher
 */
export const parser = vocabulary => (raw) => {
  const { candidate, negative } = split(raw)
  const found = []

  for (const entry of roots(vocabulary)) {
    let remainder = null

    if (candidate === entry.name) remainder = ''
    else if (candidate.startsWith(`${entry.name}-`)) remainder = candidate.slice(entry.name.length + 1)

    if (remainder === null) continue

    const { modifier, value: written } = splitModifier(remainder)
    const types = declared(entry.type)
    const values = entry.values ?? {}
    const arbitrary = written.startsWith('[') && written.endsWith(']')
    const named = written === '' ? values.DEFAULT : values[written]

    let value = null

    if (named !== undefined) value = named
    else if (arbitrary) value = decode(written)
    else value = derive(written, types)

    if (value === null || value === undefined) continue
    if (negative && !entry.supportsNegativeValues) continue

    found.push({
      modifier: modifier === null ? null : wrapped(modifier),
      negative,
      root: entry.name,
      value: negative ? `calc(${value} * -1)` : value,
    })
  }

  // Longest root wins, which ordering by name length above already arranges.
  return found[0] ?? null
}

/*
 * `modifiers` is deliberately not a gate.
 *
 * The option reads like one — `'any'`, a property map, or the empty object Jumi passes by
 * default — but measured, the host accepts a modifier for all three shapes and hands it straight
 * to the matcher: `animate-rotate-[…]/[flick]` (empty), `transition-duration-600/rotate` (map),
 * `animate-stagger-forward-[120ms]/7` (`'any'`). So it narrows what a *value* can be, and never
 * rejects a candidate on its modifier.
 */
