/**
 * CSS value helpers shared by the measurement scripts.
 *
 * Every count in these scripts has to agree on where an entry ends, and that is easy to get
 * wrong: the aggregate lists are comma-separated `var(--a, var(--b))` entries, so splitting on
 * `,` splits inside the nested fallback. `var(a, var(b))` is one entry but two commas — a
 * `split(',')` counts it as two and doubles every slot metric. The splitter lives here so the
 * scripts cannot disagree.
 *
 * The aggregate is flat, and it is *materialized* before any of this runs: `finalize` writes the
 * ten lists into every carrier's own `animation-*` longhands, so a stylesheet has one copy per
 * carrier and they all hold the same thing. Reading one is reading a single declaration — which
 * is the point of shipping it that way, and the reason there is no chain to walk any more.
 *
 * The other half of that: `--jumi-aggregate-*`, `--jumi-carrier` and `--jumi-carrier-staging` are
 * build-time names, and a finished stylesheet holds none of them. `protocolState` counts all
 * three, so the checks that used to find a carrier by its marker find it by what it was given
 * instead — and fail if a build ever leaves the transport in the file.
 */

/**
 * The ten `animation-*` longhands the model stages a list for, and therefore the ten the finalizer
 * materializes into every carrier that declares them.
 */
export const PARTS = [
  'animation-composition',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-timeline',
  'animation-timing-function',
]

/**
 * The other carrier's part. `transitions` composes one shorthand rather than a list per longhand,
 * so it declares exactly one part — and that part is also what identifies the carrier, the way
 * `animation-name` identifies `animations`.
 */
export const TRANSITION_PARTS = ['transition']

/**
 * One materialized declaration, value and all. The leading guard is load-bearing: without it
 * `animation-name` matches inside `--jumi-animation-name`, and every control declaration on every
 * element would be counted as a carrier's data.
 */
const LONGHAND = new RegExp(`(?<![\\w-])(?:${[...PARTS, ...TRANSITION_PARTS].join('|')})\\s*:\\s*[^;]*;?`, 'g')

/**
 * A carrier's identifying declaration: the one property each kind always has exactly one of.
 *
 * The marker is erased, so this is what a carrier is counted by instead. The guard matters for the
 * same reason as above — `--jumi-transition` and `transition-behavior` both start with the word.
 */
const ANIMATION_CARRIER = /(?<![\w-])animation-name\s*:/g
const TRANSITION_CARRIER = /(?<![\w-])transition\s*:/g

/**
 * A stylesheet with every at-rule prelude removed, so what remains can be counted as
 * declarations.
 *
 * A prelude is not a declaration, and Tailwind emits one that names an `animation-*` longhand: the
 * stagger utilities are wrapped in `@supports (animation-delay: calc(sibling-index() * 1ms))` and
 * its negation. Counting the raw text reads that feature query as a carrier's data — it first
 * reported 22 declarations for 2 carriers, and the two extras were the query and its negation.
 *
 * `[^{;]*` is what keeps the strip to preludes: a statement at-rule (`@layer a, b;`) has no `{`
 * before its `;`, so it is not a prelude and is not touched.
 */
const declarationsOnly = css => css.replace(/@[a-z-]+[^{;]*\{/gi, '{')

/**
 * The aggregate list for one longhand, read from any carrier.
 *
 * The data is written into the longhand a browser applies, so the declaration to read is
 * `animation-name` and not `--jumi-aggregate-animation-name`: that namespace is build-time only
 * and no longer reaches output. Every carrier holds the same lists, so the last declaration in the
 * file is the one a browser resolving the last carrier would apply; which copy is read makes no
 * difference.
 */
export function aggregateList(css, part = 'animation-name') {
  return lastDeclaration(css, part)
}

/** The slots the browser applies: the entries in the aggregate name list. */
export function aggregateSlots(css) {
  return splitTopLevel(aggregateList(css)).length
}

/**
 * How many materialized declarations a finished stylesheet is expected to hold, given how many
 * carriers it has. Exported so four checks cannot drift from each other on the arithmetic.
 */
export function expectedDeclarations({ animations, transitions }) {
  return animations * PARTS.length + transitions * TRANSITION_PARTS.length
}

/**
 * What a finished stylesheet says about the protocol.
 *
 * `leaks` is the invariant — three build-time names, all expected at zero, none of them a property
 * a browser applies, and counted over the whole file because that is where they must not appear.
 * `animations` and `transitions` count each carrier by the declaration it alone has, because the
 * marker is erased; `declarations` and `declarationBytes` are every part materialized and how much
 * of the file they are. Together they still say "each carrier got the whole list for the parts it
 * declares, and nothing else" — so a part written into the wrong carrier shows up as a count that
 * does not fit.
 */
export function protocolState(css) {
  const bodies = declarationsOnly(css)
  const materialized = [...bodies.matchAll(LONGHAND)]

  return {
    animations: (bodies.match(ANIMATION_CARRIER) ?? []).length,
    declarationBytes: materialized.reduce((total, match) => total + match[0].length, 0),
    declarations: materialized.length,
    leaks: {
      aggregate: (css.match(/--jumi-aggregate-/g) ?? []).length,
      carrier: (css.match(/--jumi-carrier(?!-)/g) ?? []).length,
      staging: (css.match(/--jumi-carrier-staging/g) ?? []).length,
    },
    transitions: (bodies.match(TRANSITION_CARRIER) ?? []).length,
  }
}

/**
 * The last value of a declaration in the file.
 *
 * The property name is matched whole. Anchoring only at the colon would make `animation-name`
 * match inside `--jumi-animation-name`, which is a different property that happens to end with
 * the same word — and every element declares that one.
 *
 * The aggregate is written into every carrier and a later declaration of the same property
 * wins in the cascade, so the last one is the one a browser applies to the last carrier.
 */
export function lastDeclaration(css, property) {
  const matches = [...css.matchAll(new RegExp(`(?<![\\w-])${property}\\s*:\\s*([^;]+);`, 'g'))]

  return matches.at(-1)?.[1].trim() ?? ''
}

/** Split a CSS value on its top-level commas, ignoring nested `()`, `[]` and strings. */
export function splitTopLevel(value) {
  const parts = []
  let current = ''
  let depth = 0
  let quote = ''

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]

    if (quote) {
      if (char === '\\') {
        current += char + (value[i + 1] ?? '')
        i += 1
      }
      else {
        if (char === quote) quote = ''
        current += char
      }
      continue
    }

    if (char === '"' || char === '\'') {
      quote = char
      current += char
      continue
    }

    if (char === '(' || char === '[') depth += 1
    else if (char === ')' || char === ']') depth -= 1
    else if (char === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }

    current += char
  }

  parts.push(current)

  return parts.map(part => part.trim()).filter(Boolean)
}
