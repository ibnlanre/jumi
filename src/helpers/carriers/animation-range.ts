import type { Rule } from 'postcss'

import { ACTIVATED_SLOT, instanceKeys, ownDeclarations } from './instance'

/**
 * The range **composition** variant, read back out of the emitted stylesheet.
 *
 * `animation-range-entry:animate-fade-in` says *this animation uses the entry range*, where
 * `animation-range-entry` alone says *this element's animations do*. Two intentions, one vocabulary,
 * and the fallback chain is what lets them compose rather than compete:
 *
 *   --jumi-fade-in-animation-range    one slot, set by the variant
 *           ↓
 *   --jumi-animation-range            the element, set by the utility
 *           ↓
 *   the substrate default             `0% 100%`, which is `normal` spelled legally
 *
 * ## Why the callback is identity
 *
 * A Tailwind variant callback is handed only its own value and modifier — never the utility it wraps.
 * It therefore *cannot* know which slot it is qualifying, and "the variant adds the range to the
 * slot" is not implementable as stated. What is: the range is in the class the author typed, which
 * lands in the emitted **selector**, and the slot is in the **activation declaration** the same rule
 * carries. Both are read here, which is why the callback contributes nothing but `&`.
 *
 * `&` rather than a never-matching marker is the load-bearing part. The view-transition variant
 * returns a marker precisely so its motion *never* reaches the source element; a range qualification
 * is the opposite — the element has to animate.
 *
 * ## What is not read from the callback
 *
 * Tailwind invokes a variant callback once at configuration time with a sentinel value and no
 * candidate, and the `values` option does not filter it. Identity has nothing to record and nothing
 * to reject, so there is nothing for the sentinel to corrupt; the judgement lives here, in the pass
 * that can report.
 */

/** The names a variant value may be, and the whole range namespace the platform defines. */
export const RANGE_NAMES = [
  'contain',
  'cover',
  'entry',
  'entry-crossing',
  'exit',
  'exit-crossing',
] as const

/**
 * What an author may write, as a warning quotes it.
 *
 * The grammar is a **promise**, not a parser: it is the set of shapes a range is accepted in, and a
 * value outside it is refused loudly rather than published and left for the browser to drop. That is
 * the difference this pass makes — measured, an unparsable position falls back on its own and says
 * nothing, so without the check a typo is an animation that quietly uses the whole range.
 */
export const RANGE_GRAMMAR = `a range name (${RANGE_NAMES.join(', ')}), a length or percentage, two of either, or a name and offset`

/** One ranged motion, as its own rule states it. */
export type RangeReading = {
  /** How many motions the rule declares — 0 or 2+ is why `slot` above is null. */
  motions: number
  /** The value the author wrote, decoded. */
  range: string
  /** The slot the rule activates, or null when this rule activates none, or cannot be told apart. */
  slot: null | string
  /** The class the author wrote, unescaped, for a message. */
  source: string
}

const RANGED = /^animation-range-(.+)$/
const LENGTH_PERCENTAGE =
  /^(?:[+-]?(?:\d+\.?\d*|\.\d+)(?:%|[a-z]{1,4})?|0|(?:calc|clamp|max|min|var)\(.*\))$/i

/**
 * The class token a selector starts with.
 *
 * A class is one token however many variant segments it holds, so the walk stops at the first
 * *unescaped* character that ends it — a pseudo-class the variant appended (`:hover`), a combinator,
 * an attribute. Escapes are stepped over rather than through, because `\:` is how a variant boundary
 * is written inside the token and is not a boundary of the token.
 */
const classToken = (selector: string) => {
  for (let index = 1; index < selector.length; index += 1) {
    if (selector[index] === '\\') {
      index += 1

      continue
    }

    if ('.:#[]>+~ '.includes(selector[index])) return selector.slice(1, index)
  }

  return selector.slice(1)
}

/**
 * A class token split into its variant segments, unescaped.
 *
 * The range is not necessarily first: `hover:animation-range-entry:animate-fade-in` is an ordinary
 * stack, and a decoder anchored at the start of the class reads nothing off it. Measured — the first
 * version of this reader returned nothing for every stacked spelling, which would have been taken for
 * "stacking breaks the variant" rather than "the reader is too naive".
 */
const segments = (token: string) => {
  const out = []
  let current = ''

  for (let index = 0; index < token.length; index += 1) {
    if (token[index] === '\\') {
      if (token.startsWith('\\:', index)) {
        out.push(current)
        current = ''
        index += 1

        continue
      }

      current += token.slice(index, index + 2)
      index += 1

      continue
    }

    current += token[index]
  }

  out.push(current)

  return out.map(segment => segment.replace(/\\(.)/g, '$1'))
}

/**
 * The range a selector encodes, or null when it encodes none.
 *
 * The distinction that matters is **where** the segment sits, not what it starts with. `animation-range-entry`
 * is a utility — the element's range — and `animation-range-entry:animate-fade-in` is the variant, which
 * is always a *prefix of another candidate*. Reading both as a qualification would have this pass warn
 * about the shipped utilities on every page that uses one, so a segment only counts when something
 * wraps it.
 */
export const rangeFromSelector = (selector: string): null | string => {
  const parts = segments(classToken(selector))
  const innermost = parts
    .map((segment, index) => ({ index, match: RANGED.exec(segment) }))
    .filter(entry => entry.match !== null)
    .at(-1)

  // Nothing wraps the range, so the class is the utility rather than the variant.
  if (!innermost || innermost.index === parts.length - 1) return null

  const value = innermost.match![1].replace(/_/g, ' ')

  return value.startsWith('[') && value.endsWith(']')
    ? value.slice(1, -1)
    : value
}

const isName = (token: string) =>
  (RANGE_NAMES as readonly string[]).includes(token)
const isLength = (token: string) => LENGTH_PERCENTAGE.test(token)

/**
 * Whether a range is one this emission can stand behind.
 *
 * `normal` is accepted **alone** and refused beside anything else, which is measured rather than
 * tidy: `normal 0% 100%` and `0% normal 100%` are not legal values — the keyword swallows the token
 * after it — and the shapes that fail are exactly the ones where it is not alone.
 */
export const rangeAccepted = (range: string) => {
  const tokens = range.trim().split(/\s+/).filter(Boolean)

  if (!tokens.length) return false
  if (tokens.length === 1)
    return isName(tokens[0]) || tokens[0] === 'normal' || isLength(tokens[0])
  if (tokens.some(token => token === 'normal')) return false
  if (tokens.length === 2)
    return (
      (isLength(tokens[0]) && isLength(tokens[1])) ||
      (isName(tokens[0]) && isLength(tokens[1])) ||
      (isName(tokens[0]) && isName(tokens[1]))
    )
  if (tokens.length === 3)
    return isName(tokens[0]) && isLength(tokens[1]) && isName(tokens[2])
  if (tokens.length === 4)
    return (
      isName(tokens[0]) &&
      isLength(tokens[1]) &&
      isName(tokens[2]) &&
      isLength(tokens[3])
    )

  return false
}

/**
 * Every range this rule qualifies, with the slot it qualifies them for.
 *
 * The variant wraps one candidate, so a rule that carries it declares one motion and this is
 * unambiguous. The list is here because rules do get merged by an optimizer, and then the same
 * reading holds two selectors and the slot cannot be told apart — which is reported rather than
 * guessed, since a guess would range the wrong animation and say nothing.
 *
 * A selector that encodes a range the slot cannot be found for still comes back, with `slot: null`,
 * because that is a refusal to report rather than a silence to keep.
 */
export const rangeReadings = (rule: Rule): RangeReading[] => {
  const activations = ownDeclarations(rule).filter(node =>
    ACTIVATED_SLOT.test(node.prop),
  )

  // The **instance** and not the definition, which is the same derivation the hoist uses: a rule that
  // named its motion qualifies that motion, and the name is what tells the two instances of one
  // keyframe apart (`./instance`). Assuming the definition here ranged nothing for a named phrase —
  // measured, the ranged motion fell back to the whole range while its neighbour kept its own.
  const slot =
    activations.length === 1
      ? (instanceKeys(
          rule,
          ACTIVATED_SLOT.exec(activations[0].prop)?.[1] ?? '',
        )[0] ?? null)
      : null
  const readings: RangeReading[] = []

  for (const selector of rule.selectors ?? []) {
    const range = rangeFromSelector(selector)

    if (range === null) continue

    readings.push({
      motions: activations.length,
      range,
      slot,
      source: classToken(selector).replace(/\\(.)/g, '$1'),
    })
  }

  return readings
}
