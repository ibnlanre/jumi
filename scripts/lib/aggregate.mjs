import { PARTS, splitTopLevel } from './css.mjs'

/**
 * The aggregate, and the representations these spikes compare.
 *
 * Shared for the same reason `lib/css.mjs` is shared: two scripts that build the same representation
 * by hand will eventually disagree, and the disagreement will read as a measurement. `spike-cdp-cost`
 * prices the representation through the DevTools protocol; `spike-recalc` prices it through the
 * renderer. They must be pricing the same thing.
 *
 * Nothing here is production code. The hoisted shape is a *transformation of a real emission* — it
 * is derived from what a build actually wrote, not invented — so that what gets measured is the
 * representation and not a paraphrase of it.
 */
import postcss from 'postcss'

export const parse = css => postcss.parse(css)

export const isAggregate = decl =>
  PARTS.includes(decl.prop) && decl.value.includes('--jumi-')

/**
 * The composition rule: the one carrying the aggregate. Found by shape, because the transport is
 * erased at build time and there is no marker left to look for. Where several qualify the widest
 * selector list wins — that is the rule DevTools has to render.
 *
 * Parsing rather than pattern-matching, for the reason `finalize` was moved onto an AST in the first
 * place: `[^{}]*` is only true of the constructs that happen to be in the corpus.
 */
export const compositionOf = sheet => {
  let best = null

  sheet.walkRules(rule => {
    if (!rule.nodes?.some(node => node.type === 'decl' && isAggregate(node)))
      return

    if (!best || rule.selector.length > best.selector.length) best = rule
  })

  return best
}

export const entriesOf = (rule, prop) => {
  const decl = rule.nodes.find(
    node => node.type === 'decl' && node.prop === prop,
  )

  return decl ? splitTopLevel(decl.value) : []
}

/**
 * Cut every rule carrying the giant activating-utility list down to one selector. That list is
 * emitted on more than one rule — the substrate and the aggregate — and collapsing only one
 * understates it.
 */
export const collapseGiant = sheet => {
  const giant = compositionOf(sheet).selector

  sheet.walkRules(rule => {
    if (rule.selector === giant) rule.selector = '#target'
  })

  return sheet
}

/**
 * The `animation` shorthand's eight components. `animation-composition` and `animation-timeline` are
 * deliberately absent: the shorthand *resets* both to their initial values and cannot set them, so a
 * representation built on it has to re-declare them after it.
 */
export const SHORTHAND = [
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'animation-play-state',
]

/**
 * The value each longhand takes when a position is inactive.
 *
 * This is not a detail. `var(--unset-slot, none)` is fine for `animation-name`, where `none` is a
 * keyword, and fatal for `animation-duration`, where it is not: the substitution makes the value
 * invalid at computed-value time and the *entire declaration* is dropped, so every position loses
 * its duration — including the live one. Measured on the first run of the longhand shape, whose
 * fallback was `none` for all ten.
 */
export const FALLBACK = {
  'animation-composition': 'replace',
  'animation-delay': '0s',
  'animation-direction': 'normal',
  'animation-duration': '0s',
  'animation-fill-mode': 'none',
  'animation-iteration-count': '1',
  'animation-name': 'none',
  'animation-play-state': 'running',
  'animation-timeline': 'auto',
  'animation-timing-function': 'linear',
}

/**
 * The hoisted shape.
 *
 * The move is the same in both modes: the per-position chains stop living on the aggregate and move
 * onto the activator that owns the slot, so the aggregate carries a *shallow* reference per position
 * instead of ten nested ones. An element activating three slots declares three chains; the other 227
 * references resolve to a literal.
 *
 *   shorthand  one `animation` list of N shallow refs, plus the two longhands the shorthand cannot
 *              carry — the shape under consideration
 *   longhand   ten lists of N shallow refs — no shorthand parsing in the path, and measurably worse
 *
 * Returns the transformed stylesheet. It deliberately returns no markup: the element classes belong
 * to whichever page is being built, and a representation that carried them would tie the
 * measurement to one harness's fixture.
 */
export const shallowOf = (css, mode = 'shorthand') => {
  const sheet = parse(css)
  const composition = compositionOf(sheet)
  const lists = Object.fromEntries(
    PARTS.map(part => [part, entriesOf(composition, part)]),
  )
  const n = lists['animation-name'].length
  const shorthand = mode === 'shorthand'

  const slots = lists['animation-name'].map(entry => {
    const match = /var\((--jumi-(.+?)-animation-name)/.exec(entry)

    return match ? match[1] : null
  })

  // The rule that activates a slot is the rule declaring its activation variable.
  const owners = new Map()

  sheet.walkRules(rule => {
    for (const node of rule.nodes ?? []) {
      if (
        node.type === 'decl' &&
        slots.includes(node.prop) &&
        !owners.has(node.prop)
      )
        owners.set(node.prop, rule)
    }
  })

  for (let position = 0; position < n; position++) {
    const owner = owners.get(slots[position])

    if (!owner) continue

    if (shorthand) {
      owner.append({
        prop: `--jumi-slot-${position}`,
        value: SHORTHAND.map(part => lists[part][position]).join(' '),
      })

      continue
    }

    for (const part of PARTS)
      owner.append({
        prop: `--jumi-slot-${part}-${position}`,
        value: lists[part][position],
      })
  }

  composition.walkDecls(decl => {
    if (PARTS.includes(decl.prop)) decl.remove()
  })

  if (shorthand) {
    composition.append({
      prop: 'animation',
      value: Array.from(
        { length: n },
        (_, p) => `var(--jumi-slot-${p}, none)`,
      ).join(', '),
    })
    composition.append({
      prop: 'animation-composition',
      value: lists['animation-composition'].join(', '),
    })
    composition.append({
      prop: 'animation-timeline',
      value: lists['animation-timeline'].join(', '),
    })
  } else {
    for (const part of PARTS) {
      composition.append({
        prop: part,
        value: Array.from(
          { length: n },
          (_, p) => `var(--jumi-slot-${part}-${p}, ${FALLBACK[part]})`,
        ).join(', '),
      })
    }
  }

  return sheet.toString()
}
