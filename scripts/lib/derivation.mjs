import { describe, population } from './observation.mjs'
import { bucketOf, expressions, readCandidates } from './property-model.mjs'

/**
 * Whether a typed representation can be **derived mechanically** for one pair.
 *
 * The question the CTO set: how many of the `no-representation × value` pairs can get their representation
 * from a rule over information the model already carries, rather than from a declaration written family by
 * family? The information is two pieces and both are already in the model — the leaf's **resting value** and
 * the **grammar of the candidate that serves it** (`readCandidates().types`) — and the rule is their
 * agreement. That agreement is not decoration: inferring a syntax from the resting string alone is the mistake
 * D.3 has been built to avoid, so the two are compared and the comparison is an assertion in the test suite.
 *
 * The rule, in full:
 *
 *   length → `<length>` · percentage → `<percentage>` · number → `<number>` · integer → `<integer>`
 *   angle → `<angle>` · color → `<color>`
 *
 * Six of the candidate vocabulary's eight names have an `@property` spelling. `any` and `position` do not —
 * `any` would be `syntax: "*"`, which is permissive and does not interpolate, and `<position>` is not a syntax
 * component at all. A grammar containing either therefore **cannot be written as a syntax as it stands**, and
 * that is a decision about narrowing the motion rather than a derivation, so those pairs are reported as
 * `ambiguous grammar` instead of being given the subset that happens to fit.
 *
 * Nothing here declares a representation or claims a verdict. A derived syntax is a **proposal**: it still has
 * to pass D.3.4's observation protocol — rest, then interpolation, then every relevant context — before it
 * means anything. This pass answers only whether the representation itself can be derived, and where it cannot,
 * which piece is missing.
 */

/** Jumi's value-type vocabulary, as the syntax terms it maps to. */
export const SYNTAX_OF = {
  angle: '<angle>',
  color: '<color>',
  integer: '<integer>',
  length: '<length>',
  number: '<number>',
  percentage: '<percentage>',
}

/** The names with no `@property` spelling, and why each one has none. */
export const UNSPELLABLE = {
  any: 'syntax: "*" is permissive and does not interpolate',
  position: '`<position>` is not a syntax component',
}

/** Units, by the type they make a value. A unit outside this table has no type the vocabulary names. */
const LENGTHS = [
  'px',
  'em',
  'rem',
  'ex',
  'ch',
  'vw',
  'vh',
  'vmin',
  'vmax',
  'cm',
  'mm',
  'in',
  'pt',
  'pc',
]
const ANGLES = ['deg', 'grad', 'rad', 'turn']

/**
 * The shape of a resting value, structurally, with the types it can stand as.
 *
 * `0` is the case that makes the candidate grammar load-bearing rather than the string: it is a `<number>` and
 * a `<length>` at once, and which one it is depends on what the motion accepts. So the shape answers with
 * every reading and the derivation intersects them with the grammar — never the other way round.
 *
 * A shape with no types (an identifier, a function, a composition) is not a failure of this reader: it says the
 * resting value is a **keyword or an expression**, which no value type would hold, and the pair belongs to the
 * observation protocol or to decomposition rather than to a derivation.
 */
export const shapeOf = value => {
  const text = String(value ?? '').trim()

  if (!text) return { reason: 'the entry carries no resting value', types: [] }

  // A bare numeric literal is a `<number>`, an integer literal is also an `<integer>`, and `0` is a `<length>`
  // as well. Reading the string alone would miss all of that — which is why the shape answers with every
  // reading it can support, and the derivation intersects them with the grammar rather than choosing here.
  if (/^[+-]?\d+$/.test(text))
    return {
      text,
      types: /^[+-]?0+$/.test(text)
        ? ['number', 'integer', 'length']
        : ['number', 'integer'],
    }

  if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(text)) return { text, types: ['number'] }

  const dimension = /^[+-]?(\d+\.?\d*|\.\d+)([a-z%]+)$/.exec(text)

  if (dimension) {
    const unit = dimension[2]

    if (unit === '%') return { text, types: ['percentage'] }
    if (LENGTHS.includes(unit)) return { text, types: ['length'] }
    if (ANGLES.includes(unit)) return { text, types: ['angle'] }

    return {
      reason: `no type in the vocabulary holds \`${unit}\``,
      text,
      types: [],
    }
  }

  if (
    /^#[0-9a-f]{3,8}$/i.test(text) ||
    /^(currentcolor|transparent)$/i.test(text) ||
    /^(rgb|rgba|hsl|hsla|oklch|lab|color)\(/i.test(text)
  )
    return { text, types: ['color'] }

  if (/^[a-z][a-z0-9-]*$/i.test(text))
    return { reason: `\`${text}\` is a keyword`, text, types: [] }

  if (/^var\(/.test(text))
    return {
      reason: 'the resting value is itself a composition',
      text,
      types: [],
    }

  if (/^[a-z][a-z0-9-]*\(/i.test(text))
    return { reason: 'the resting value is a function call', text, types: [] }

  return { reason: `unrecognised resting shape \`${text}\``, text, types: [] }
}

/**
 * The derivation for one pair: the candidate's grammar, the resting shape, and the four outcomes.
 *
 * The precedence of the outcomes is deliberate. A resting value that no type can hold stops at
 * `no defensible rule` before the grammar is consulted, because the grammar cannot help it; a grammar naming a
 * type with no spelling stops at `ambiguous grammar`, because writing the subset that fits would be a
 * *narrowing* decision taken silently; and `needs normalization` is reserved for the one case the model
 * demonstrates a mechanism for — a rest that would have to be canonicalised into the grammar, which is what
 * `scaleFactorToNumber` does for scale's percentage spellings.
 */
export const derive = pair => {
  const descriptor = describe(pair)
  const candidate = readCandidates().find(
    one => one.name === descriptor.candidate,
  )
  const types = candidate?.types ?? []
  const shape = shapeOf(expressions().get(pair.component))
  const spellable = types.filter(type => SYNTAX_OF[type])
  const unspellable = types.filter(type => UNSPELLABLE[type])
  const proposed = spellable.filter(type => shape.types.includes(type))

  /**
   * The outcome, in the stated precedence: a resting value no type can hold is decided before the grammar is
   * consulted (the grammar cannot help it); a grammar naming a type with no spelling is ambiguous, because
   * writing the subset that fits would be a *narrowing* decision taken silently; and a union of **two
   * different families** is ambiguous too — the same text means different things in each branch, which the
   * model records for `border-image-outset` (a `<number>` there is a multiple of the border width), so the two
   * spellings are not one grammar. `<length> | <percentage>` is the one union the spec treats as a single
   * grammar, and it is the shape `scale` already carries.
   */
  const sameGrammar =
    proposed.length === 1 ||
    (proposed.length === 2 &&
      proposed.includes('length') &&
      proposed.includes('percentage'))

  const outcome = () => {
    if (!shape.types.length) return 'no defensible rule'
    if (unspellable.length) return 'ambiguous grammar'
    if (!proposed.length) return 'needs normalization'

    return sameGrammar ? 'mechanically derivable' : 'ambiguous grammar'
  }

  return {
    candidate: descriptor.candidate,
    grammar: types,
    outcome: outcome(),
    pair,
    proposal: proposed.map(type => SYNTAX_OF[type]),
    reason:
      shape.reason ??
      (unspellable.length
        ? unspellable
            .map(type => `\`${type}\`: ${UNSPELLABLE[type]}`)
            .join('; ')
        : outcome() === 'ambiguous grammar'
          ? `\`${proposed.join(' | ')}\` are two families: the same text means different things in each branch`
          : null),
    rest: shape.text,
    shape: shape.types,
    unspellable,
  }
}

/** The workstream: every `no-representation × value` pair, derived. */
export const derivations = () => {
  const constituent = population().filter(
    pair => bucketOf(pair.parent, pair.component) !== 'machinery',
  )

  return constituent
    .filter(pair => bucketOf(pair.parent, pair.component) === 'value')
    .map(describe)
    .filter(
      one =>
        one.status !== 'complete' &&
        one.reason !== 'no candidate addresses the pair',
    )
    .map(one => derive({ component: one.component, parent: one.parent }))
}

/** The four outcomes, in the order the ruling named them. */
export const OUTCOMES = [
  'mechanically derivable',
  'ambiguous grammar',
  'needs normalization',
  'no defensible rule',
]
