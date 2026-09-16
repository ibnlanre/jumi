import {
  readCandidates,
  readLeaves,
  readPropertyEntries,
} from './../lib/property-model.mjs'

/**
 * Prototype — the typed-leaf path, as a second finalizer over Jumi's own output.
 *
 * Held to one rule: *prove that typed leaves can carry Jumi's existing motion semantics without creating
 * a second-class path.* So this is not a hand-assembled sheet. It takes the sheet the shipping finalizer
 * produces — every activation chain, every variant, every named motion already correct — and rewrites
 * only what the pivot changes:
 *
 *   1. **registration** — each animated leaf's `@property`, from `syntax: "*"` to a typed syntax and an
 *      identity, taken from the census rather than invented here
 *   2. **keyframes** — from composing the real property per frame to writing the leaf per frame
 *   3. **the static read** — the composed property, which the keyframes no longer supply
 *   4. **the aggregate order** — by a semantic key instead of Tailwind's publication order
 *
 * The keyframe rewrite needs no new parsing, because the composed value is **already** one operand per
 * leaf: a frame reads `var(--jumi-scale-x-<id>-<offset>, var(--jumi-scale-x))`, and that operand names
 * both the frame key and the leaf. So a constituent re-emits its own operand verbatim — preserving the
 * frame-first-then-element-level precedence rather than re-deriving it — and a whole motion distributes
 * its own frame literal across the operands the composition names.
 *
 * Everything else is untouched on purpose, and that is what makes the measurement mean something: named
 * motions, independent durations and delays, segment easing, ranges, timelines and reduced motion all
 * travel through the `--jumi-<attribute>-animation-*` chains. If they still work it is because the
 * prototype did not break them, not because it reimplemented them.
 *
 * Four categories, and the refused one is reported rather than guessed at:
 *
 *   constituent   the candidate names a part                     → write that part's leaf
 *   whole         the candidate names the attribute, the property decomposes, and every frame value is a
 *                 literal that normalises                        → write every leaf
 *   native        anything else — `transform` above all          → leave the property-level keyframe
 *   argument      the part's value is a `css('f', …)` call, so the composition must be **reshaped** for
 *                 the function to read an argument. Not built in this increment, and every instance is
 *                 listed in the report rather than silently mistyped
 */
import postcss from 'postcss'

/** The syntax the census derived per declared grammar. From the census record, never invented here. */
const SYNTAX_OF_TYPE = {
  'angle': '<angle>',
  'color': '<color>',
  'image': '<image>',
  'image,url': '<image>',
  'integer': '<integer>',
  'length': '<length>',
  'length,line-width': '<length>',
  'length,percentage': '<length-percentage>',
  'line-width': '<length>',
  'number': '<number>',
  'number,percentage': '<number> | <percentage>',
  'ratio': '<number>',
  'url': '<url>',
}

const GRAPH = new Map(readPropertyEntries().map(one => [one.slot, one]))

/** Split a value on top-level commas, so a `calc()` argument stays one part. */
const splitCommas = value => {
  const parts = []
  let depth = 0
  let quote = null
  let current = ''

  for (const char of value) {
    if (quote) {
      if (char === quote) quote = null
    } else if (char === '"' || char === "'") quote = char
    else if (char === '(' || char === '[') depth += 1
    else if (char === ')' || char === ']') depth -= 1
    else if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''

      continue
    }

    current += char
  }

  if (current.trim()) parts.push(current.trim())

  return parts
}

/** Split a value on top-level whitespace, which is how a composed property reads. */
const splitSpaces = value => {
  const parts = []
  let depth = 0
  let quote = null
  let current = ''

  for (const char of value) {
    if (quote) {
      if (char === quote) quote = null
    } else if (char === '"' || char === "'") quote = char
    else if (char === '(' || char === '[') depth += 1
    else if (char === ')' || char === ']') depth -= 1
    else if (depth === 0 && /\s/.test(char)) {
      if (current) parts.push(current)
      current = ''

      continue
    }

    current += char
  }

  if (current) parts.push(current)

  return parts
}

/**
 * The leaf an operand reads. A composed operand is
 * `var(--jumi-scale-x-<id>-<offset>, var(--jumi-scale-x))`, so the leaf is the element-level read — the
 * one part of it that carries no hash.
 */
const leafOf = operand => operand.match(/var\(--jumi-([\w-]+)\)/)?.[1] ?? null

/** The literal a custom property is declared with, or null when it is an expression. */
const literalOf = (root, name) => {
  let found = null

  root.walkDecls(decl => {
    if (found === null && decl.prop === name && !decl.value.includes('var('))
      found = decl.value.trim()
  })

  return found
}

/** Every leaf under a slot, descending the graph: a part of a part is still a slot to write. */
const leavesUnder = slot => {
  const entry = GRAPH.get(slot)

  if (!entry) return []
  if (!entry.composite) return [slot]

  return entry.deps.flatMap(dep => leavesUnder(dep))
}

/** The candidate an activation rule belongs to: its selector is the class, and classes are candidates. */
const classOf = selector =>
  selector
    .split(',')
    .map(one => one.trim().replace(/\\(.)/g, '$1'))
    .map(one => one.match(/^\.(animate-[^\s.:[]*?)(?:-\[|$)/)?.[1] ?? null)
    .filter(Boolean)

/**
 * How a short whole value fills its leaves, which is **grammar, not padding**, and the one piece of
 * property-specific knowledge this transform needs.
 *
 * `scale: 2` means `2 2 2` — a single component applies to every axis — so a one-component value
 * repeats. `translate: 100px` means `translate(100px, 0)`, so the missing component is the *identity*
 * rather than a repeat, and a generic rule would be wrong for it. Measured: padding `scale: 2` with the
 * identity reads `5 1` where the decomposition should read `5 2 2`, which is why this is a table and
 * not a heuristic.
 *
 * Only the properties the prototype composes are listed, and an attribute that is not is refused rather
 * than padded on a guess.
 */
const REPEATS = new Set(['scale'])

export const typedLeaves = (css, options = {}) => {
  const root = postcss.parse(css)
  const { leaves } = readLeaves()
  const bySlot = new Map(leaves.map(leaf => [leaf.slot, leaf]))
  const candidates = new Map(readCandidates().map(one => [one.name, one]))

  const report = {
    argument: [],
    constituent: [],
    native: [],
    order: [],
    registered: [],
    whole: [],
  }

  /* ── The composition rule, and the slot order it carries ─────────────────── */

  // Walked rather than read off the root: the composition is written into whichever `@layer` the
  // utilities landed in, and the layer is the emitter's business, not this transform's.
  let composition = null

  root.walkRules(rule => {
    if (composition) return
    if (
      (rule.nodes ?? []).some(
        decl => decl.type === 'decl' && decl.value.includes('var(--jumi-slot-'),
      )
    )
      composition = rule
  })

  if (!composition) throw new Error('no composition rule in the sheet')

  const shorthand = (composition.nodes ?? []).find(
    decl => decl.type === 'decl' && decl.prop === 'animation',
  )
  const slots = [
    ...shorthand.value.matchAll(/--jumi-slot-([\w-]+?)(?:,|\))/g),
  ].map(match => match[1])

  /* ── Which candidate each slot came from ────────────────────────────────── */

  const activationOf = key => {
    let found = null

    root.walkRules(rule => {
      if (found) return
      if (
        (rule.nodes ?? []).some(
          decl => decl.type === 'decl' && decl.prop === `--jumi-slot-${key}`,
        )
      )
        found = rule
    })

    return found
  }

  const keyframesOf = (attribute, id) =>
    root.nodes.find(
      node =>
        node.type === 'atrule' &&
        node.name === 'keyframes' &&
        node.params === `jumi-${attribute}${id ? `-${id}` : ''}`,
    )

  const classify = key => {
    const name = classOf(activationOf(key)?.selector ?? '')[0] ?? null
    const candidate = name ? candidates.get(name) : null

    if (!candidate?.attribute)
      return {
        category: 'native',
        key,
        name,
        reason: 'no candidate in the activation selector',
      }

    const attribute = candidate.attribute
    // A phrase and a single-value instance publish `--jumi-<attribute>-<id>-…`; a shared tween publishes
    // the attribute alone. The id is whatever the key carries past the attribute.
    const id = key.startsWith(`${attribute}-`)
      ? key.slice(attribute.length + 1)
      : ''

    if (candidate.parts.length === 0) {
      const owned = leavesUnder(attribute)

      if (!owned.length)
        return {
          attribute,
          category: 'native',
          id,
          key,
          name,
          reason: 'the property has no parts',
        }

      const atRule = keyframesOf(attribute, id)

      if (!atRule)
        return {
          attribute,
          category: 'native',
          id,
          key,
          name,
          reason: 'no keyframes to rewrite',
        }

      for (const frame of atRule.nodes ?? []) {
        const offset = Number(String(frame.selector).replace('%', ''))
        const literal = literalOf(root, `--jumi-${attribute}-${id}-${offset}`)

        if (literal === null)
          return {
            attribute,
            category: 'native',
            id,
            key,
            name,
            reason: `frame ${offset}% is not a literal, so it cannot be decomposed`,
          }
      }

      return { attribute, category: 'whole', id, key, leaves: owned, name }
    }

    const part = candidate.parts[0]
    const leaf = bySlot.get(part)

    if (leaf && String(leaf.value).startsWith('css('))
      return {
        attribute,
        category: 'argument',
        id,
        key,
        name,
        part,
        reason: `the slot holds a call: ${leaf.value}`,
      }

    return { attribute, category: 'constituent', id, key, name, part }
  }

  const classified = slots.map(key => classify(key))

  for (const one of classified) {
    const entry = {
      key: one.key,
      name: one.name,
      part: one.part,
      reason: one.reason,
    }

    if (one.category === 'argument') report.argument.push(entry)
    else if (one.category === 'native') report.native.push(entry)
    else if (one.category === 'whole') report.whole.push(entry)
    else report.constituent.push(entry)
  }

  /* ── 1. Register the leaves ─────────────────────────────────────────────── */

  const animated = new Set()

  for (const one of classified) {
    if (one.category === 'constituent') animated.add(one.part)
    if (one.category === 'whole')
      for (const leaf of one.leaves) animated.add(leaf)
  }

  const registrations = []
  const wanted = new Map()

  for (const slot of animated) {
    const leaf = bySlot.get(slot)

    if (!leaf) continue

    const grammar = [
      ...new Set(
        [...leaf.writers, ...leaf.wholes].flatMap(writer => writer.types),
      ),
    ]
      .filter(type => type !== 'any')
      .sort()
      .join(',')
    const syntax = SYNTAX_OF_TYPE[grammar]
    const identity = String(leaf.value).replace(/^'|'$/g, '')

    if (!syntax) continue

    // The census's keyword-union rung: when the model's own identity is a keyword the bare component
    // refuses, and the union is the spelling that registers. Measured, not assumed.
    const union = /^[a-zA-Z][\w-]*$/.test(identity) && !syntax.includes('|')

    wanted.set(slot, {
      identity,
      name: `--jumi-${slot}`,
      slot,
      syntax: union ? `${syntax} | ${identity}` : syntax,
    })
  }

  /**
   * A leaf is **not** registered today. Only the per-instance activation names and the slot keys are,
   * because a leaf has never needed a computed value — every read of one falls back through a chain.
   * The pivot is what makes a leaf need a value, so these registrations are added rather than replaced,
   * and that is a real byte cost rather than a rewrite of existing ones.
   */
  root.walkAtRules('property', atRule => {
    if (wanted.has(atRule.params.trim().replace('--jumi-', ''))) atRule.remove()
  })

  for (const one of wanted.values()) {
    root.append(
      postcss.atRule({
        name: 'property',
        nodes: [
          postcss.decl({ prop: 'syntax', value: `"${one.syntax}"` }),
          postcss.decl({ prop: 'inherits', value: 'false' }),
          postcss.decl({ prop: 'initial-value', value: one.identity }),
        ],
        params: one.name,
      }),
    )

    registrations.push(one)
  }

  report.registered.push(...registrations)

  /* ── 2. Rewrite the keyframes so they write leaves ──────────────────────── */

  for (const one of classified) {
    if (one.category === 'native' || one.category === 'argument') continue

    const atRule = keyframesOf(one.attribute, one.id)

    if (!atRule) continue

    for (const frame of atRule.nodes ?? []) {
      const decl = (frame.nodes ?? []).find(
        node => node.type === 'decl' && node.prop === one.attribute,
      )

      if (!decl) continue

      /**
       * Two shapes, and they are told apart by how many operands the value has at the top level:
       *
       *   whole        scale: var(--jumi-scale-<id>-<offset>, var(…x…) var(…y…) var(…z…))
       *                one outer `var()` whose **fallback** is the composed value, so the leaf order
       *                lives in the fallback.
       *   constituent  scale: var(…scale-x…) var(…scale-y…) var(…scale-z…)
       *                one read per leaf, the part first, and the leaves are already at the top level.
       *
       * Unwrapping unconditionally is what made the constituent case read the first `var(`'s own
       * argument list — `var(--jumi-scale-x)) var(--jumi-scale-y-1vrwYE-0,` — so the unwrap is gated on
       * the value being a single operand.
       */
      const top = splitSpaces(decl.value)
      const operands =
        top.length === 1 && top[0].startsWith('var(')
          ? splitSpaces(
              top[0].match(/^var\(--jumi-[\w-]+,\s*([^]*)\)$/)?.[1] ?? top[0],
            )
          : top

      if (one.category === 'constituent') {
        const operand = operands.find(value => leafOf(value) === one.part)

        if (!operand) continue

        decl.prop = `--jumi-${one.part}`
        decl.value = operand

        continue
      }

      // A whole motion distributes its own frame literal across the leaves the composition names, in the
      // composition's order. A short value fills its leaves by the property's grammar — repeating for
      // `scale`, and the identity otherwise — which is the whole reason this needs a table.
      const offset = Number(String(frame.selector).replace('%', ''))
      const literal =
        literalOf(root, `--jumi-${one.attribute}-${one.id}-${offset}`) ?? ''
      const written = splitSpaces(literal)
      const named = operands
        .map(leafOf)
        .filter(
          slot => slot && slot !== one.attribute && slot !== 'perspective-3d',
        )
      const values =
        REPEATS.has(one.attribute) && written.length === 1 && named.length > 1
          ? named.map(() => written[0])
          : written

      decl.remove()

      for (const [index, slot] of named.entries()) {
        if (!one.leaves.includes(slot)) continue

        const identity = String(bySlot.get(slot)?.value ?? '').replace(
          /^'|'$/g,
          '',
        )

        frame.append(
          postcss.decl({
            prop: `--jumi-${slot}`,
            value: values[index] ?? identity,
          }),
        )
      }
    }
  }

  /* ── 3. The static read the keyframes no longer supply ──────────────────── */

  const composed = new Set()

  for (const one of classified) {
    if (one.category === 'native' || one.category === 'argument') continue

    const already = (composition.nodes ?? []).some(
      decl => decl.type === 'decl' && decl.prop === one.attribute,
    )

    if (!already) composed.add(one.attribute)
  }

  for (const attribute of composed)
    composition.append(
      postcss.decl({ prop: attribute, value: `var(--jumi-${attribute})` }),
    )

  /* ── 4. The semantic ordering key ───────────────────────────────────────── */

  /**
   * What the ruling asked for: **a whole motion before a constituent**, so the constituent sits later in
   * the list and wins the slots it owns. The tiebreak is the candidate name — the class an author wrote —
   * which is stable and, unlike Tailwind's publication order, is not something no one can see.
   */
  const order = classified
    .map((one, at) => ({
      at,
      group: one.category === 'constituent' ? 1 : 0,
      name: one.name ?? '',
    }))
    .sort(
      (a, b) =>
        a.group - b.group || a.name.localeCompare(b.name) || a.at - b.at,
    )
    .map(entry => entry.at)

  report.order = order.map(at => ({
    category: classified[at].category,
    name: classified[at].name,
  }))

  if (!options.preserveOrder) {
    for (const decl of composition.nodes ?? []) {
      if (decl.type !== 'decl' || !decl.value.includes('--jumi-slot-')) continue

      const parts = splitCommas(decl.value)

      if (parts.length <= 1) continue

      decl.value = order
        .map(at => parts[at])
        .filter(Boolean)
        .join(', ')
    }
  }

  return { css: root.toString(), report }
}
