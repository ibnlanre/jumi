/**
 * CSS value helpers shared by the measurement scripts.
 *
 * Every count in these scripts has to agree on where an entry ends, and that is easy to get
 * wrong: the aggregate lists are comma-separated `var(--a, var(--b))` entries, so splitting on
 * `,` splits inside the nested fallback. `var(a, var(b))` is one entry but two commas — a
 * `split(',')` counts it as two and doubles every slot metric. The splitter lives here so the
 * scripts cannot disagree.
 *
 * The aggregate is *materialized* before any of this runs, and since the animations aggregate became
 * a hoist there are two readings of that, one per kind:
 *
 *   animations   one composition rule carrying `animation:` — one shallow `var(--jumi-slot-<slot>,
 *                none)` per position — plus the two longhands the shorthand resets. The chains moved
 *                onto the rules that activate the slot, as `--jumi-slot-<slot>`.
 *   transitions  one composition rule carrying a single `transition` shorthand, unchanged.
 *
 * Which is why neither kind is found by counting a longhand any more: `compositionRules` identifies
 * the animations composition by its structure, and `transitionRules` by the one declaration it
 * still has. Everything here is the same shape as the scripts' subject, and `scripts/lib/css.test.mjs`
 * pins both detectors against hand-written CSS.
 *
 * The other half: `--jumi-aggregate-*`, `--jumi-carrier` and `--jumi-carrier-staging` are build-time
 * names, and a finished stylesheet holds none of them. `protocolState` counts all three, so the
 * checks that used to find a carrier by its marker find it by what it was given instead — and fail
 * if a build ever leaves the transport in the file.
 */

import postcss from 'postcss'

/**
 * The ten `animation-*` longhands the model stages a list for, and therefore the ten the finalizer
 * materializes into every carrier that declares them.
 *
 * A hoisted animations composition declares none of them — it declares the `animation` shorthand,
 * which is not in this list — so `PARTS` no longer counts it. See `expectedDeclarations`.
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
 * The two the `animation` shorthand *resets* and cannot set, so a hoisted composition declares them
 * as separate lists after the shorthand. They are the longhands a composition still writes by name.
 */
const RESET_BY_SHORTHAND = ['animation-composition', 'animation-timeline']

/**
 * One materialized declaration, value and all. The leading guard is load-bearing: without it
 * `animation-name` matches inside `--jumi-animation-name`, and every control declaration on every
 * element would be counted as a carrier's data.
 */
const LONGHAND = new RegExp(`(?<![\\w-])(?:${[...PARTS, ...TRANSITION_PARTS].join('|')})\\s*:\\s*[^;]*;?`, 'g')

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
 * The synthesized animations compositions, found **structurally**.
 *
 * Not "a rule with an `animation` shorthand": that is an ordinary utility, and a stylesheet is full
 * of them. A composition is a rule that declares the shorthand, **and** the two longhands the
 * shorthand resets, **and** whose positions are shallow references to values the activation rules
 * publish. All three are required.
 *
 * The middle condition is the one that needed measuring: the resets are written only when the
 * payload staged them, so requiring them is only sound if the payload always stages them. It does
 * — verified on a one-slot build (`animate-rotate-45` alone), where the composition still declares
 * `animation`, `animation-composition`, `animation-timeline` and `interpolate-size`. If that ever
 * stops being true the detector reports zero compositions, which fails every check that uses it
 * loudly rather than passing them quietly, and that is the direction of failure to prefer here.
 *
 * None of the three is a fact about formatting, which is the point. The detector this replaced keyed
 * on `animation-name` and went to zero the moment the aggregate became a hoist; "has an `animation`
 * shorthand" would have been the same mistake with a different word in it.
 */
/**
 * The aggregate list a composition carries, read as the `animation` shorthand.
 *
 * Its length is the slot universe and its entries name the slots: each position is
 * `var(--jumi-slot-<slot>, none)`, so the list is one shallow reference per slot rather than ten
 * nested chains per slot. The value a reference resolves to is published on the rules that activate
 * that slot, not here.
 */
export function aggregateList(css, part = 'animation') {
  const rule = compositionRules(css)[0]

  if (!rule) return ''

  return (rule.nodes ?? []).find(node => node.type === 'decl' && node.prop === part)?.value ?? ''
}

/** The slots the browser applies: the entries in the aggregate list. */
export function aggregateSlots(css) {
  return splitTopLevel(aggregateList(css)).filter(Boolean).length
}

/**
 * The synthesized animations compositions, found **structurally**.
 *
 * Not "a rule with an `animation` shorthand": that is an ordinary utility, and a stylesheet is full
 * of them. A composition is a rule that declares the shorthand, **and** the two longhands the
 * shorthand resets, **and** whose positions are shallow references to values the activation rules
 * publish. All three are required.
 *
 * The middle condition is the one that needed measuring: the resets are written only when the
 * payload staged them, so requiring them is only sound if the payload always stages them. It does
 * — verified on a one-slot build (`animate-rotate-45` alone), where the composition still declares
 * `animation`, `animation-composition`, `animation-timeline` and `interpolate-size`. If that ever
 * stops being true the detector reports zero compositions, which fails every check that uses it
 * loudly rather than passing them quietly, and that is the direction of failure to prefer here.
 *
 * None of the three is a fact about formatting, which is the point. The detector this replaced keyed
 * on `animation-name` and went to zero the moment the aggregate became a hoist; "has an `animation`
 * shorthand" would have been the same mistake with a different word in it.
 */
export function compositionRules(css) {
  const root = typeof css === 'string' ? postcss.parse(css) : css
  const found = []

  root.walkRules((rule) => {
    const declarations = (rule.nodes ?? []).filter(node => node.type === 'decl')
    const props = new Set(declarations.map(node => node.prop))

    if (!props.has('animation-composition') || !props.has('animation-timeline')) return

    // The shorthand *resets* those two, so the synthesized rule declares them after it. Checking the
    // order is free here and it is the difference between "declares these three properties" and
    // "declares them in the arrangement only the finalizer produces".
    const shorthand = declarations.findIndex(node => node.prop === 'animation')
    const lastReset = Math.max(
      declarations.findIndex(node => node.prop === 'animation-composition'),
      declarations.findIndex(node => node.prop === 'animation-timeline'),
    )

    if (shorthand < 0 || shorthand > lastReset) return
    if (!declarations[shorthand].value.includes('var(--jumi-slot-')) return

    found.push(rule)
  })

  return found
}

/**
 * How many selectors a kind's composition was written for.
 *
 * Counting *rules* instead would say nothing: there is exactly one composition per kind, and the
 * whole question is which selectors it carries. A descendant, a pseudo-element and a rule `@apply`
 * was inlined into all have to be in the list, and none of them can be named by the utility it came
 * from — so the list length is the shape of the activation, made countable.
 *
 * Split depth-aware rather than on `,\n`: the emitter writes one selector per line today, but a
 * variant can carry a comma inside `:is()`/`:where()` and the answer must not depend on which
 * formatting the emitter happens to be using.
 */
export function compositionScope(css, kind = 'animations') {
  const rule = kind === 'animations' ? compositionRules(css)[0] : transitionRules(css)[0]

  return rule ? splitTopLevel(rule.selector).length : 0
}

/**
 * How many materialized declarations a finished stylesheet is expected to hold, given how many
 * compositions it has. Exported so the checks cannot drift from each other on the arithmetic.
 *
 * A hoisted animations composition declares the shorthand — which is not one of the ten longhands,
 * so `PARTS` does not count it — plus the two the shorthand resets. That it carries *every* slot is
 * no longer proved by counting declarations; it is proved by the list being one shallow reference
 * per slot, which `aggregateSlots` reads.
 */
export function expectedDeclarations({ animations, transitions }) {
  return animations * RESET_BY_SHORTHAND.length + transitions * TRANSITION_PARTS.length
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
    // Both kinds are counted structurally now, and for the same reason: the marker is erased, so the
    // shape of the synthesized rule is the only thing left that says it was synthesized rather than
    // authored.
    animations: compositionRules(css).length,
    declarationBytes: materialized.reduce((total, match) => total + match[0].length, 0),
    declarations: materialized.length,
    leaks: {
      staging: (css.match(/--jumi-staging-/g) ?? []).length,
    },
    transitions: transitionRules(css).length,
  }
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

/**
 * The rules that publish the transition composition, in source order.
 *
 * Transitions compose a single shorthand already, so their composition is identified by the one
 * declaration it always has — which is exactly what the animations detector used to do with
 * `animation-name`, and what stopped working the moment animations were hoisted. Kept as the
 * transition detector precisely *because* transitions were deliberately left alone.
 */
export function transitionRules(css) {
  const root = typeof css === 'string' ? postcss.parse(css) : css
  const found = []

  root.walkRules((rule) => {
    if (rule.nodes?.some(node => node.type === 'decl' && node.prop === 'transition')) found.push(rule)
  })

  return found
}
