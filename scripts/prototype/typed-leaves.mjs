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

/** Every frame value an instance published, by offset, or null when it published none. */
const framesOf = (root, slot, id) => {
  const out = new Map()

  if (!id) return null

  root.walkDecls(decl => {
    const match = decl.prop.match(new RegExp(`^--jumi-${slot}-${id}-(\\d+)$`))

    if (match) out.set(Number(match[1]), decl.value.trim())
  })

  return out.size ? out : null
}

/** The `fn(arg)` a model value declares: `css('blur', '0')` → `{ argument: '0', fn: 'blur' }`. */
const callOf = value => {
  const match = String(value).match(/^css\('([^']+)',\s*'([^']*)'\)$/)

  return match ? { argument: match[2], fn: match[1] } : null
}

/**
 * The `fn(arg)` a **written value** is, or null. Null is the answer for everything that is not one call
 * inside one pair of parentheses — a quoted string, a list, a `url("…")` with a comma in it — and null is
 * what keeps those on the native path rather than being reshaped into something they are not.
 */
const writtenCall = value => {
  const match = String(value)
    .trim()
    .match(/^([\w-]+)\(([^]*)\)$/)

  return match ? { argument: match[2].trim(), fn: match[1] } : null
}

/** The Tailwind value-types a leaf's candidates declare, which is the grammar the census maps. */
const grammarOf = leaf =>
  [
    ...new Set(
      [...leaf.writers, ...leaf.wholes].flatMap(writer => writer.types),
    ),
  ]
    .filter(type => type !== 'any')
    .sort()
    .join(',')

/** The leaves a composition names, read off the composition's own operands. */
const composedLeaves = (root, attribute) => {
  let value = null

  root.walkDecls(decl => {
    if (value === null && decl.prop === `--jumi-${attribute}`)
      value = decl.value
  })

  return value ? splitSpaces(value).map(leafOf).filter(Boolean) : []
}

/**
 * The leaves of a composition that can hold an **argument**: `fn` → the leaf that would hold it.
 *
 * A leaf is excluded when its value is not a single call, when its grammar is a `url` — a url slot holds
 * a whole function, `opacity(1)` at rest and `url(…)` when written, so pinning it to one would lose the
 * other — and when the census mapped no syntax for its grammar, which is the same refusal the census
 * makes rather than a guess.
 */
const callShapedOf = (root, bySlot, attribute) => {
  const map = new Map()

  for (const slot of composedLeaves(root, attribute)) {
    const leaf = bySlot.get(slot)
    const call = leaf ? callOf(leaf.value) : null

    if (!call || grammarOf(leaf) === 'url') continue
    if (!SYNTAX_OF_TYPE[grammarOf(leaf)]) continue

    map.set(call.fn, { argument: call.argument, fn: call.fn, slot })
  }

  return map
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

  // A sheet whose every instance is behind a condition — `/hover`, `/focus` — has no unconditional
  // carrier, so there is nothing to re-key. That is a decline, not a failure: the sheet ships as the
  // shipping finalizer wrote it, and the caller is told why.
  if (!composition)
    return {
      css,
      report: {
        argument: [],
        constituent: [],
        native: [{ reason: 'no unconditional composition rule in the sheet' }],
        order: [],
        registered: [],
        whole: [],
      },
    }

  const shorthand = (composition.nodes ?? []).find(
    decl => decl.type === 'decl' && decl.prop === 'animation',
  )
  const slots = [
    ...shorthand.value.matchAll(/--jumi-slot-([\w-]+?)(?:,|\))/g),
  ].map(match => match[1])

  /* ── Which candidate each slot came from ────────────────────────────────── */

  /**
   * The **canonical** name a slot belongs to — `filter-Z2nKX36` rather than the slot key.
   *
   * A slot key carries the variant path, so `animate-filter-blur-…` with a `scroll` variant keys as
   * `6-scroll-Z2nKX36-filter`, and slicing the attribute off that yields an empty id and a keyframes
   * lookup that misses. The slot variable's own value is the canonical reference —
   * `--jumi-slot-6-scroll-Z2nKX36-filter: var(--jumi-filter-Z2nKX36-animation-name, …)` — so it is
   * read from there instead of from the key. Without this the reshape silently did nothing for every
   * variant-carrying instance while still paying for the registrations.
   */
  const canonicalOf = key => {
    let value = null

    root.walkDecls(decl => {
      if (value === null && decl.prop === `--jumi-slot-${key}`)
        value = decl.value
    })

    return value?.match(/var\(--jumi-([\w-]+?)-animation-/)?.[1] ?? key
  }

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
    // the attribute alone. The id is whatever the canonical name carries past the attribute.
    const canonical = canonicalOf(key)
    const id = canonical.startsWith(`${attribute}-`)
      ? canonical.slice(attribute.length + 1)
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

      /**
       * A property whose composition is one **function per leaf** cannot be distributed by list
       * position the way `scale` can: its leaves hold calls and its value names functions, so every
       * function the value writes has to map to a leaf the reshape owns. A value naming anything else
       * keeps the property — which is the ruling's "a whole value that cannot be decomposed stays
       * native", and it is where an arbitrary or quoted filter value lands.
       *
       * `none` is the filter identity, and the spec replaces it with the identity function list when
       * interpolating, so a frame writing it is already expressed in the amounts (every unnamed leaf
       * takes its identity). It therefore passes the gate, and it is the one non-call that does. A
       * motion in which *no* frame names a real function is a no-op and stays native rather than
       * registering a composition's worth of amounts to say nothing.
       */
      const functions = callShapedOf(root, bySlot, attribute)

      if (functions.size) {
        let named = 0

        for (const frame of atRule.nodes ?? []) {
          const offset = Number(String(frame.selector).replace('%', ''))
          const literal =
            literalOf(root, `--jumi-${attribute}-${id}-${offset}`) ?? ''

          for (const written of splitSpaces(literal)) {
            const call = writtenCall(written)

            if (call && functions.has(call.fn)) {
              named += 1
              continue
            }

            if (written === 'none') continue

            return {
              attribute,
              category: 'native',
              id,
              key,
              name,
              reason: `\`${written}\` is not a function the reshape owns`,
            }
          }
        }

        if (!named)
          return {
            attribute,
            category: 'native',
            id,
            key,
            name,
            reason: 'no frame names a function the reshape owns',
          }

        return {
          attribute,
          byFunction: true,
          category: 'whole',
          id,
          key,
          leaves: composedLeaves(root, attribute),
          name,
        }
      }

      return { attribute, category: 'whole', id, key, leaves: owned, name }
    }

    const part = candidate.parts[0]
    const leaf = bySlot.get(part)
    const call = leaf ? callOf(leaf.value) : null

    if (leaf && call) {
      // A `url` slot holds a **whole function** — `opacity(1)` at rest, `url(…)` when written — so
      // pinning it to one function would lose the other. That is the census's own rule for refusing
      // these two, and it is what keeps `url()` on the native path here.
      if (grammarOf(leaf) === 'url')
        return {
          attribute,
          category: 'native',
          id,
          key,
          name,
          part,
          reason: 'a slot that holds a whole function, not an argument',
        }

      const frames = framesOf(root, part, id)
      const lifted = frames ? [...frames.values()].map(writtenCall) : [call]

      if (lifted.some(one => !one))
        return {
          attribute,
          category: 'native',
          id,
          key,
          name,
          part,
          reason:
            'a frame is not a single call, so there is no argument to lift',
        }

      const syntax = SYNTAX_OF_TYPE[grammarOf(leaf)]

      if (!syntax)
        return {
          attribute,
          category: 'native',
          id,
          key,
          name,
          part,
          reason: `the argument's grammar is ${grammarOf(leaf) || 'unmapped'}`,
        }

      return {
        amount: `--jumi-${part}-amount`,
        attribute,
        category: 'argument',
        fn: call.fn,
        frames,
        id,
        identity: call.argument,
        key,
        leaf: part,
        name,
        syntax,
      }
    }

    return { attribute, category: 'constituent', id, key, name, part }
  }

  const classified = slots.map(key => classify(key))

  /**
   * The reshape is applied to a whole attribute, so it is only safe when **every** instance of that
   * attribute can be carried by the reshaped composition. A native instance writes the property
   * itself, as one self-contained expression built from the attribute's old operand list, and
   * whichever animation lands last in the aggregate list wins the property outright. So a native
   * instance contends with a reshaped one rather than composing with it: measured on
   * `animate-filter-url` + `animate-filter-blur`, the reshape swapped which one won and the url
   * motion — which the reshape cannot carry, its slot holds a whole `url()` function — went silent.
   *
   * The resolution is therefore that a native instance **blocks** the reshape for its attribute. The
   * attribute falls back whole, which is today's behaviour and therefore not a regression, and the
   * reshape only claims attributes it can carry entirely.
   */
  const contended = new Set(
    classified
      .filter(one => one.category === 'native')
      .map(one => one.attribute),
  )

  for (const one of classified) {
    if (one.category !== 'argument' && !one.byFunction) continue
    if (!contended.has(one.attribute)) continue

    one.category = 'native'
    one.byFunction = false
    one.reason = `\`${one.name}\` shares \`${one.attribute}\` with a motion the reshape cannot carry`
  }

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

  /**
   * The reshape, and the reason it is applied to a whole attribute rather than to the instance that
   * needs it: the composition is one expression, so a partly-reshaped `filter` could not decompose a
   * whole filter motion at all — some of its operands would be arguments and some whole functions.
   *
   * So the rule is: **when any instance of a property animates an argument, or a whole motion over
   * that property decomposes by function, every call-shaped leaf that property composes becomes
   * `fn(var(--jumi-<leaf>-amount))`.** Uniform, and the same rule that keeps a `url` slot out — it
   * holds a whole function, so there is no single `fn` to pin.
   */
  const reshaped = new Map()

  for (const one of classified) {
    if (one.category !== 'argument' && !one.byFunction) continue
    if (reshaped.has(one.attribute)) continue

    const map = new Map()

    for (const info of callShapedOf(root, bySlot, one.attribute).values())
      map.set(info.slot, {
        argument: info.argument,
        fn: info.fn,
        syntax: SYNTAX_OF_TYPE[grammarOf(bySlot.get(info.slot))],
      })

    reshaped.set(one.attribute, map)
  }

  for (const [attribute, map] of reshaped) {
    let declaration = null

    root.walkDecls(decl => {
      if (declaration === null && decl.prop === `--jumi-${attribute}`)
        declaration = decl
    })

    if (!declaration) continue

    for (const [slot, one] of map)
      declaration.value = declaration.value.replace(
        `var(--jumi-${slot})`,
        `${one.fn}(var(--jumi-${slot}-amount))`,
      )
  }

  const registrations = []
  const wanted = new Map()

  for (const slot of animated) {
    const leaf = bySlot.get(slot)

    if (!leaf) continue

    const syntax = SYNTAX_OF_TYPE[grammarOf(leaf)]
    const identity = String(leaf.value).replace(/^'|'$/g, '')

    if (!syntax) continue

    /**
     * A leaf that holds a **whole function** is never a typed component.
     *
     * `--jumi-filter-blur` is `blur(0px)` — the composition's operand, not an interpolable unit — so
     * its grammar is the grammar of the *argument* inside the call, and registering the leaf as that
     * grammar would both mistype it and publish the model's own source as an `initial-value`
     * (`css('blur', '0')`, which is not a CSS value at all). After the reshape the composition reads
     * `blur(var(--jumi-filter-blur-amount))` and this leaf is unreferenced, so there is nothing to
     * register; on the native path it stays an ordinary custom property holding a function, which is
     * what it is today. Only the `-amount` sibling is typed.
     */
    if (callOf(leaf.value)) continue

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

  for (const map of reshaped.values())
    for (const [slot, one] of map)
      wanted.set(`${slot}-amount`, {
        identity: one.argument,
        name: `--jumi-${slot}-amount`,
        slot: `${slot}-amount`,
        syntax: one.syntax,
      })

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
    if (one.category === 'native') continue

    const atRule = keyframesOf(one.attribute, one.id)

    if (!atRule) continue

    /**
     * An **argument** instance writes one amount per frame and nothing else, because the composition
     * owns the function — `blur(var(--jumi-filter-blur-amount))` — so the frame has no property
     * declaration left to make. The argument is lifted from the call the build published for that frame:
     * `blur(0px)` becomes `0px`.
     */
    if (one.category === 'argument') {
      for (const frame of atRule.nodes ?? []) {
        const offset = Number(String(frame.selector).replace('%', ''))
        const literal = literalOf(
          root,
          `--jumi-${one.leaf}-${one.id}-${offset}`,
        )
        const call = literal ? writtenCall(literal) : null

        if (!call) continue

        frame.removeAll()
        frame.append(postcss.decl({ prop: one.amount, value: call.argument }))
      }

      continue
    }

    for (const frame of atRule.nodes ?? []) {
      const offset = Number(String(frame.selector).replace('%', ''))
      const decl = (frame.nodes ?? []).find(
        node => node.type === 'decl' && node.prop === one.attribute,
      )

      if (!decl) continue

      /**
       * A whole motion over a reshaped property is distributed by **function**, not by position: every
       * amount is written, the ones the value does not name taking their identity, so the whole motion
       * fully determines the property. A constituent later in the list then wins the amount it owns —
       * which is what the ordering key is for.
       */
      if (one.byFunction) {
        const map = [...reshaped.get(one.attribute)]
        const byFn = new Map(map.map(([slot, info]) => [info.fn, slot]))
        const literal =
          literalOf(root, `--jumi-${one.attribute}-${one.id}-${offset}`) ?? ''
        const written = new Map(
          map.map(([slot, info]) => [slot, info.argument]),
        )

        for (const text of splitSpaces(literal)) {
          const call = writtenCall(text)

          if (call) written.set(byFn.get(call.fn), call.argument)
        }

        decl.remove()

        for (const [slot, value] of written)
          frame.append(postcss.decl({ prop: `--jumi-${slot}-amount`, value }))

        continue
      }

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
    if (one.category === 'native') continue

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
   *
   * It is applied **per attribute**, and only to attributes the reshape actually carries. An attribute
   * whose every instance fell back to native is left exactly in compile order, because the reshape has
   * no opinion about it and reordering it would change which motion wins a property — measured on
   * `animate-filter-url` + `animate-filter-blur`, where a name tiebreak alone handed the slot from the
   * blur motion to the url one. Ordering is a claim about ownership, so it is only made where something
   * is owned. Order between different attributes does not matter: two attributes never contest the same
   * slot.
   */
  const ownedAttributes = new Set(
    classified
      .filter(one => one.category !== 'native')
      .map(one => one.attribute),
  )
  const scoped = classified
    .map((one, at) => at)
    .filter(at => ownedAttributes.has(classified[at].attribute))
  const moving = scoped
    .map(at => ({
      at,
      group: classified[at].category === 'whole' ? 0 : 1,
      name: classified[at].name ?? '',
    }))
    .sort(
      (a, b) =>
        a.group - b.group || a.name.localeCompare(b.name) || a.at - b.at,
    )

  const order = classified.map((one, at) => at)

  for (const [index, at] of scoped.entries()) order[at] = moving[index].at

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
