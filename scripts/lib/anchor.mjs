/**
 * A pure, declining normalizer for `offset-anchor`'s **explicit two-axis** authored forms.
 *
 * The browser work behind this (D.3.7) established the boundary it is written to: the explicit two-axis form,
 * with the other axis stated, computes to a two-axis value and interpolates identically to that value's
 * resolved spelling — on each axis alone and when both move. The short spellings do **not** behave the way
 * position syntax invites you to read them: `top 20px` is rejected outright (`auto`) and `left 10px` computes to
 * `0% 10px`, which is not "edge plus offset on one axis". So this normalizer consumes only the form the browser
 * proved, and returns `null` for everything else rather than assigning semantics CSS does not assign.
 *
 * What it accepts, and nothing else:
 *
 *   20% 80%                              two resolved components
 *   10px 20px
 *   calc(50% + 10px) calc(25% - 4px)
 *   left top                             two edge keywords
 *   center center
 *   left 10px top 20px                   the explicit edge-plus-offset form
 *   left 10% bottom 25%
 *
 * What it declines, with `null`:
 *
 *   top 20px                             a short spelling: rejected by the browser
 *   left 10px                            a short spelling: accepted, but as something else
 *   center 20px                          an arity the browser work did not establish
 *   var(--ax) var(--ay)                  not statically resolvable
 *   start top                            not a logical-position property here
 *
 * The distinction that matters is between **declining** and **guessing**. A form this returns `null` for keeps
 * whatever representation the model already has; nothing is partially typed.
 */

/** A `<length-percentage>` as written: a number with an optional unit, or a percentage. */
const LENGTH = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[a-z%]{1,4})?$/i

/** `calc(…)`, checked for balance rather than by pattern: a `)` inside a nested call is not the end. */
const isCalc = text => {
  if (!/^calc\(/i.test(text) || !text.endsWith(')')) return false

  let depth = 0

  for (const char of text) {
    if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1

      if (depth === 0) return text.endsWith(')') && text.length > 5
    }
  }

  return false
}

/** A component position accepts. */
const isComponent = text => LENGTH.test(text) || isCalc(text)

/**
 * A component split at **top-level** spaces, so `calc(50% + 10px)` stays one token.
 *
 * Splitting on every space was itself a measured defect in this track: it turned `calc(50% + 10px)` into two
 * tokens, and the arms built from it reported a representation failing to carry arithmetic it carries fine.
 */
const components = value => {
  const parts = []
  let depth = 0
  let part = ''

  for (const char of value.trim()) {
    if (char === '(') depth += 1
    else if (char === ')') depth -= 1

    if (/\s/.test(char) && depth === 0) {
      if (part) parts.push(part)

      part = ''

      continue
    }

    part += char
  }

  if (part) parts.push(part)

  return parts
}

const X_KEYWORD = { center: '50%', left: '0%', right: '100%' }
const Y_KEYWORD = { bottom: '100%', center: '50%', top: '0%' }

/** An edge keyword plus an offset, resolved to one component. */
/**
 * One axis of the model's own authoring leaves, as a resolved component — or `null` to decline.
 *
 * This is the layer the candidate projection showed the **public surface** needs, and it is not the same
 * question as `normalizeOffsetAnchor`. The four-value grammar rejects a `center` edge, which is exactly why the
 * model's resting composition computes to `auto` today; but the proposed execution layer never composes
 * keywords at all, so `center` is a fact about the *authoring* layer and it disappears here. That is why the
 * resting state stops being invalid once normalization runs, rather than needing the edges to become
 * directional — a correction to what the projection concluded.
 *
 * An offset of exactly `0` resolves to the edge's own percentage rather than to a `calc()`: both compute to the
 * same value, and the measured arm for `left 0 top 0` reads `0px 0px`, so nothing is being smoothed over.
 * `center` with a **non-zero** offset declines, because that arity is one this track has not established.
 */
export const normalizeAxis = (edge, offset) => {
  const component = String(offset ?? '').trim()

  if (edge === 'center') return component === '0' ? '50%' : null
  if (!isComponent(component)) return null

  if (component === '0')
    return { bottom: '100%', left: '0%', right: '100%', top: '0%' }[edge] ?? null

  if (edge === 'left' || edge === 'top') return component
  if (edge === 'right' || edge === 'bottom')
    return `calc(100% - ${component})`

  return null
}

const fromEdge = (edge, offset) =>
  edge === 'left' || edge === 'top' ? offset : `calc(100% - ${offset})`

/**
 * `offset-anchor`'s authored value as two resolved axis components, or `null` to decline.
 *
 * Declining is the default and the safe answer: a `null` preserves whatever the model already does with the
 * value, and every accepted branch is one the browser work measured.
 */
export const normalizeOffsetAnchor = value => {
  if (typeof value !== 'string') return null

  // A `var()` is not refused as a token to be clever about, it is refused because nothing here can know what it
  // will resolve to — the browser substitutes it at computed-value time and this runs at build time.
  if (/var\(/i.test(value)) return null

  const parts = components(value)

  // Two components: either a resolved pair, or a pair of edge keywords.
  if (parts.length === 2) {
    const [first, second] = parts

    if (isComponent(first) && isComponent(second)) return [first, second]

    if (X_KEYWORD[first] !== undefined && Y_KEYWORD[second] !== undefined)
      return [X_KEYWORD[first], Y_KEYWORD[second]]

    // Everything else is a short spelling or an arity this track did not establish — including
    // `center 20px`, which is declined rather than read as an edge-plus-offset on x.
    return null
  }

  // Four components: the explicit edge-plus-offset form, which is the only place both axes are stated.
  if (parts.length === 4) {
    const [xEdge, xOffset, yEdge, yOffset] = parts

    if (
      (xEdge === 'left' || xEdge === 'right') &&
      (yEdge === 'top' || yEdge === 'bottom') &&
      isComponent(xOffset) &&
      isComponent(yOffset)
    )
      return [fromEdge(xEdge, xOffset), fromEdge(yEdge, yOffset)]

    return null
  }

  return null
}
