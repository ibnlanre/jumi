/**
 * The property model and the candidate table, read structurally.
 *
 * Both files are the model: `src/variables/property.ts` is the graph (which variable each entry owns,
 * what it composes, and the value an element carries when nothing animates it), and
 * `src/properties/tween.ts` is the candidate table (which entry a class addresses, which of its parts,
 * and which value types that class accepts). Anything that wants to reason about the model — a census,
 * a prototype — needs these two joins and should not re-derive them by regex.
 *
 * `scripts/spike-variable-animation.mjs` carries an earlier copy of the leaf reader. It is frozen with
 * its measurements and is deliberately not refactored onto this one: the numbers in
 * `engineering/research/variable-animation.md` are a record, and a record that moves is not one.
 *
 * Structural means the scanner tracks what it is inside of — quotes, parens, brackets — rather than
 * describing the shape of what it is looking for. A `value:` that spans lines, a `css('blur', '0')`
 * whose second argument contains a comma, a `dependencies: [...]` list written one name per line: all
 * of them are read the same way, because the reader balances rather than matches.
 */
import { fileURLToPath } from 'node:url'

import fs from 'node:fs'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
export const root = path.join(here, '..', '..')

/**
 * The extent of one value expression, starting at `at` (which must point at the first character after
 * the `:`), ending at the first top-level `,` or newline. Depth is counted, so a nested call keeps its
 * own commas and a multi-line expression keeps its newlines.
 */
const readExpression = (text, at) => {
  let depth = 0
  let quote = null
  let out = ''

  for (let i = at; i < text.length; i += 1) {
    const char = text[i]

    if (quote) {
      if (char === '\\') {
        out += char + (text[i + 1] ?? '')
        i += 1
        continue
      }

      if (char === quote) quote = null
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '(' || char === '[' || char === '{') {
      depth += 1
    } else if (char === ')' || char === ']' || char === '}') {
      if (depth === 0) break

      depth -= 1
    } else if (depth === 0 && (char === ',' || char === '\n')) {
      break
    }

    out += char
  }

  return out.trim()
}

/**
 * The contents of the group whose opening bracket is at `at` — `(` or `[`, found by balancing rather
 * than by matching, and returning up to the matching closer.
 *
 * This function exists because its absence was a **bug that produced plausible numbers**: reading
 * `fn: property(…)` with a greedy `\(.*\)` captures to the last `)` in the entry's body, which is
 * inside `values: theme(…)` a line or two below. The captured text then contains the `type:` list, so
 * part extraction reported `animate-background-position` as a writer of the leaf `position` — a
 * candidate credited with addressing a slot it never mentions, in a census whose whole output is which
 * candidates address which slots.
 *
 * Both bracket kinds share one depth counter, because they nest through each other here —
 * `property('filter', [['filter-blur', value => css('blur', value)]])` has parens inside brackets
 * inside parens — and strings are stepped over, so a quote containing a bracket cannot unbalance it.
 */
const readCall = (text, at) => {
  let depth = 0
  let quote = null

  for (let i = at; i < text.length; i += 1) {
    const char = text[i]

    if (quote) {
      if (char === '\\') i += 1
      else if (char === quote) quote = null

      continue
    }

    if (char === '"' || char === "'") quote = char
    else if (char === '(' || char === '[') depth += 1
    else if (char === ')' || char === ']') {
      depth -= 1

      if (depth === 0) return text.slice(at + 1, i)
    }
  }

  return null
}

/**
 * The parts a `property(attribute, parts)` call addresses, read element by element.
 *
 * Two shapes have to be kept apart, and both were bugs before this function existed:
 *
 * - **No comma means no parts.** `property('scale')` addresses the attribute itself. Slicing from an
 *   `indexOf(',')` of `-1` yields the whole call, so the attribute was read back as its own part.
 * - **A part may carry a wrapper function.** `property('filter', [['filter-blur', value => css('blur',
 *   value)]])` addresses the slot `filter-blur`; a scan for quoted names also finds `'blur'` inside the
 *   wrapper and reports a part that is not in the graph. So the list is split at its top level and each
 *   element contributes only its **first** string.
 */
const readParts = text => {
  const open = text.indexOf('[')

  if (open === -1) return []

  const inner = readCall(text, open)

  if (inner === null) return []

  const elements = []
  let depth = 0
  let quote = null
  let element = ''

  for (const char of `${inner},`) {
    if (quote) {
      element += char
      if (char === quote) quote = null

      continue
    }

    if (char === '"' || char === "'") quote = char
    else if (char === '[' || char === '(') depth += 1
    else if (char === ']' || char === ')') depth -= 1
    else if (char === ',' && depth === 0) {
      elements.push(element)
      element = ''

      continue
    }

    element += char
  }

  return elements
    .map(one => one.match(/['"]([\w-]+)['"]/)?.[1])
    .filter(name => name !== undefined)
}

/**
 * The entries of `block`, at `indent` spaces. Each entry is `'name': { … }` at that indent, and its
 * body ends at the next line that closes it back to the same indent — which is why the reader walks
 * braces rather than assuming a body's length.
 */
const readEntries = (text, indent) => {
  const entries = []
  const open = new RegExp(`^ {${indent}}'([\\w-]+)': \\{$`, 'gm')
  const starts = [...text.matchAll(open)]

  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index]
    const end = starts[index + 1]?.index ?? text.length
    const body = text.slice(start.index + start[0].length, end)

    entries.push({ body, name: start[1] })
  }

  return entries
}

/** The `--jumi-*` variable an entry owns, and whether the entry composes parts. */
export const readPropertyEntries = () => {
  const text = fs.readFileSync(
    path.join(root, 'src/variables/property.ts'),
    'utf8',
  )
  // The graph literal starts after its own declaration; the entries are the two-space-indented keys.
  const graph = text.slice(text.indexOf('export const propertyVariables'))

  return readEntries(graph, 2).map(entry => {
    const variable = entry.body.match(/variable: '(--jumi-[\w-]+)'/)
    const at = entry.body.search(/\bvalue:/)

    return {
      composite: /\bdependencies:/.test(entry.body),
      deps: [
        ...(
          entry.body.match(/dependencies: \[([^\]]*)\]/s)?.[1] ?? ''
        ).matchAll(/'([\w-]+)'/g),
      ].map(match => match[1]),
      name: variable?.[1],
      // The entry's *key* — a leaf is a key with no dependencies. The variable is always
      // `--jumi-<key>`, so the key is the slot's public name.
      slot: entry.name,
      value:
        at === -1 ? null : readExpression(entry.body, at + 'value:'.length),
      variable: variable?.[1],
    }
  })
}

/**
 * The candidate table: `'animate-x': { fn: property('attr'[, parts]), type: [...] }`.
 *
 * `parts` is read as written and kept in its written shape, because the shape is the fact: a bare
 * string names a part, and an array names a CSS function Jumi injects around the value
 * (`property('transform', [['skew', args('skew')]])`). What the census needs from it is only which
 * slots the candidate can write.
 */
/**
 * One candidate entry, read structurally from its own source.
 *
 * Pure, and exported for that reason: the walk it performs splits on parentheses and quotes, so the text it
 * is handed **is** structure to it. A comment carrying a stray `(` unbalanced the walk and one carrying an
 * apostrophe opened a string that never closed, and either made the whole entry unreadable — measured twice
 * during D.3.6, and both times the symptom was a pair with no candidate, no route and no derivation, pointing
 * nowhere near a comment. Removing comments here, before the walk, is what makes that impossible rather than
 * unlikely; doing it around the walk was the bespoke workaround this replaces.
 *
 * The entry's name and file are the caller's business, because they are where the text came from rather than
 * what it says.
 */
export const readCandidate = body => {
  const text = stripComments(body)
  const at = text.search(/\bfn: (?:property|color|token)\(/)

  if (at === -1) return { attribute: null, parts: [], types: [] }

  // Balanced, not matched: see `readCall` and `readParts`. The greedy form credited candidates with parts
  // that appear in their own `type:` list or inside a wrapper function.
  const call = readCall(text, text.indexOf('(', at)) ?? ''
  const attribute = call.match(/^\s*'([\w-]+)'/)?.[1] ?? null
  // `token('display', 'prepend')` consumes a modifier into the value and calls `property(display)`, so it
  // addresses the attribute and never a part — its second argument is an order, not a list.
  const token = /\bfn: token\(/.test(text)
  const comma = call.indexOf(',')
  const rest = comma === -1 || token ? '' : call.slice(comma + 1)
  const typesAt = text.search(/\btypes?:/)

  return {
    attribute,
    parts: readParts(rest),
    // `type: 'length'` and `type: ['length', 'any']` are one list; the expression reader keeps a multi-line
    // list together and a quoted default whole.
    types:
      typesAt === -1
        ? []
        : [
            ...readExpression(
              text,
              typesAt + text.slice(typesAt).indexOf(':') + 1,
            ).matchAll(/'([\w-]+)'/g),
          ].map(match => match[1]),
  }
}

export const readCandidates = () => {
  const files = ['src/properties/tween.ts', 'src/properties/controls.ts']
  const candidates = []

  for (const file of files) {
    /**
     * Comments are removed **before** the structural walk rather than worked around inside it.
     *
     * `readCall` and `readParts` split on parentheses and quotes, so text a comment carries is structure to
     * them: a stray `(` unbalanced the walk and an apostrophe opened a string that never closed, and in both
     * cases the entry became unreadable — measured twice, and both times the symptom was `no candidate
     * addresses the pair`, pointing nowhere near a comment. `readCompositions` has read its modules this way
     * all along; this reader now does too, so there is one preprocessing rule rather than a bespoke workaround
     * per reader.
     */
    const text = stripComments(
      fs.readFileSync(path.join(root, file), 'utf8'),
    )

    /**
     * Three candidate shapes address a property, and reading only the first was a **second** gap in
     * this reader's own history — it reported every census figure with six `color(…)` part-writers
     * missing, which understated the constituent count:
     *
     *   property('scale', ['scale-x'])   the ordinary shape
     *   color('outline', ['outline-color'])   identical arguments; `color` only adds paint handling
     *   token('display', 'prepend')      calls `property(display)`; the second argument is an order,
     *                                    not a parts list, so it addresses the attribute alone
     */
    for (const entry of readEntries(text, 4))
      candidates.push({
        ...readCandidate(entry.body),
        file,
        name: entry.name,
      })
  }

  return candidates
}

/** One top-level split on commas: quotes are stepped over, and brackets keep their own commas. */
const splitTop = text => {
  const parts = []
  let depth = 0
  let quote = null
  let part = ''

  for (const char of `${text},`) {
    if (quote) {
      part += char
      if (char === quote) quote = null

      continue
    }

    if (char === '"' || char === "'") quote = char
    else if (char === '(' || char === '[') depth += 1
    else if (char === ')' || char === ']') depth -= 1
    else if (char === ',' && depth === 0) {
      parts.push(part)
      part = ''

      continue
    }

    part += char
  }

  return parts
}

/**
 * The module text with its comments removed, strings stepped over.
 *
 * Comments are not decoration to a reader that splits expressions: a `// …` line inside a `join([…])` list
 * became a list element, and the failure surfaced as an unknown shape rather than as a mis-read — which is
 * the right direction, and still work the reader should not have to do twice. A `//` inside a string stays,
 * because a url is spelled that way.
 */
const stripComments = text => {
  let out = ''
  let quote = null

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (quote) {
      out += char
      if (char === '\\') {
        out += text[i + 1] ?? ''
        i += 1
      } else if (char === quote) quote = null

      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      out += char

      continue
    }

    if (char === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i += 1

      out += '\n'

      continue
    }

    if (char === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2)
      i = close === -1 ? text.length : close + 1

      continue
    }

    out += char
  }

  return out
}

/** A quoted string's contents, or `null` where the text is not one. */
const unquote = text => {
  const quote = text[0]

  return (quote === "'" || quote === '"') && text.endsWith(quote)
    ? text.slice(1, -1)
    : null
}

/** The argument text of `name(…)`, or `null` where the text does not open with that call. */
const callOf = (text, name) =>
  text.startsWith(`${name}(`) ? readCall(text, name.length) : null

/**
 * How one declaration becomes the expression it names.
 *
 * A resolver is bound to the **locals of one module**, because local intermediates are named for their module
 * and two modules may use the same name for different values (`gridTemplateRows`). The same resolver serves a
 * call written directly in `property.ts` (`value: css('blur', '0')`) with no locals at all — one grammar,
 * two places it appears.
 */
const resolverFor = (locals, label) => {
  const resolve = (source, seen = new Set()) => {
    const text = source.trim()
    const literal = unquote(text)

    if (literal !== null) return literal

    const css = callOf(text, 'css')

    if (css !== null) {
      const [fn, ...rest] = splitTop(css).map(one => one.trim())
      const name = unquote(fn ?? '')

      if (name === null)
        throw new Error(
          `\`css(...)\` with a computed function name in ${label}: \`${text}\``,
        )

      const args = rest
        .filter(one => one.trim().length)
        .map(one => resolve(one, seen))

      return args.length ? `${name}(${args.join(', ')})` : `${name}()`
    }

    const join = callOf(text, 'join')

    if (join !== null) {
      const [list, separator] = splitTop(join).map(one => one.trim())

      if (!list?.startsWith('['))
        throw new Error(`\`join(...)\` without a list in ${label}: \`${text}\``)

      // `join`'s default separator is a **space** (`src/helpers/join/index.ts`), and modules rely on it:
      // `animationTimelineScroll` calls `join([…])` with no second argument. Defaulting to the empty string
      // instead produced `scroll(var(…axis)var(…scroller))` — a fallback that reads almost right, and the
      // reason the equivalence test compares every entry against the evaluated model rather than a few.
      return splitTop(list.slice(1, -1))
        .filter(one => one.trim().length)
        .map(one => resolve(one, seen))
        .join(separator === undefined ? ' ' : (unquote(separator) ?? ' '))
    }

    if (/^[A-Za-z_$][\w$]*$/.test(text)) {
      if (seen.has(text))
        throw new Error(`composition \`${text}\` refers to itself`)

      const body = locals.get(text)

      if (body === undefined)
        throw new Error(
          `\`${text}\` is neither a literal nor declared in ${label}`,
        )

      return resolve(body, new Set([text, ...seen]))
    }

    throw new Error(`unknown composition shape in ${label}: \`${text}\``)
  }

  return resolve
}

/**
 * The composition modules, resolved to the expressions they build.
 *
 * `property.ts` names its compositions by identifier (`value: backgroundPosition`) and the modules build them
 * from two structured helpers: `css('fn'[, value[, fallback]])` and `join([…], 'separator')`. A Node reader
 * cannot evaluate TypeScript, so this reads the *structure* — which is what lets a source reader see the same
 * shape the plugin does, including the nesting the census's bucket test turns on:
 * `--jumi-animation-timeline-axis` sits inside `scroll(…)`, so its pair is a reshape and not machinery.
 *
 * Reading structure rather than serialized output is the rule the carriers, the staging variables and the
 * emitted applications all turned out to need. An unknown shape **throws** instead of returning something
 * plausible, because a resolver that guesses produces a population that looks right.
 *
 * Definitions are kept **per module**, because local intermediates are named for their module and two modules
 * may use the same name for different values (`gridTemplateRows` is a local in two of them). Only the exports
 * are flattened, which is the set `property.ts` can name — and an exported name that appears twice is a
 * defect rather than a coin toss.
 */
export const readCompositions = () => {
  const directory = path.join(root, 'src', 'composition')
  const modules = []
  const resolved = new Map()

  for (const file of fs.readdirSync(directory).sort()) {
    if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue

    const parts = stripComments(
      fs.readFileSync(path.join(directory, file), 'utf8'),
    ).split(/^(export )?const ([A-Za-z_$][\w$]*) =/m)

    const locals = new Map()
    const exported = new Set()

    for (let index = 1; index < parts.length; index += 3) {
      const name = parts[index + 1]
      const body = parts[index + 2] ?? ''

      locals.set(name, body.trim())
      if (parts[index]) exported.add(name)
    }

    modules.push({ exported, file, locals })
  }

  for (const module of modules) {
    const declare = resolverFor(module.locals, module.file)

    for (const name of module.exported) {
      if (resolved.has(name))
        throw new Error(`composition \`${name}\` is exported twice`)

      resolved.set(name, declare(module.locals.get(name)))
    }
  }

  return resolved
}

/**
 * Every entry's value, **resolved**: a literal where it is one, and the expression it names where it is a
 * composition.
 *
 * `readPropertyEntries().value` is the source text, which for a helper-composed entry is the identifier
 * (`animationTimelineScroll`). Anything asking a question about the *expression* — how deep a slot sits, what
 * a composition reads — needs this instead, or it silently sees a different model from the one the plugin
 * evaluates.
 */
export const readExpressions = () => {
  const compositions = readCompositions()
  const expressions = new Map()

  // `property.ts` writes two shapes: the name of a composition module's export, and a call of its own
  // (`value: css('blur', '0')`). Both are the same grammar, so both go through the same resolver — the second
  // with no locals, because a value written there cannot name a module local.
  const declare = resolverFor(new Map(), 'src/variables/property.ts')

  for (const entry of readPropertyEntries())
    expressions.set(
      entry.slot,
      entry.value === null
        ? null
        : (compositions.get(entry.value) ?? declare(entry.value)),
    )

  return expressions
}

/**
 * The entries of `block` whose keys are written bare (`scale: {`) rather than quoted.
 *
 * Kept apart from `readEntries` rather than folded into it: the quoted form is a fact about the tables this
 * module already reads, and a reader that accepted either would start matching `fn: { … }`-shaped lines in
 * files that never meant to contribute entries.
 */
const readBareEntries = (text, indent) => {
  const entries = []
  // Quoted **or** unquoted, and the alternation is not defensive: prettier's `quoteProps: consistent` quotes
  // every key in an object once a single key needs quoting, so `scale` is written `'scale'` the moment a family
  // like `background-position` joins it. A reader that only accepted the bare form silently returned zero leaves
  // when D.3.5's batch landed — the map was fine and the reader could no longer see it.
  const open = new RegExp(`^ {${indent}}(?:'([\\w-]+)'|([\\w-]+)): \\{$`, 'gm')
  const starts = [...text.matchAll(open)]

  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index]
    const end = starts[index + 1]?.index ?? text.length

    entries.push({
      body: text.slice(start.index + start[0].length, end),
      name: start[1] ?? start[2],
    })
  }

  return entries
}

/**
 * The **declared** typed leaves: the representations the model itself justifies, with the syntax to register
 * and the value to rest at.
 *
 * This is the metadata D.3.5's coverage question is about. It is neither a proposal nor a measurement — it is
 * a registration the plugin actually emits — so a pair whose component is absent here has no
 * model-justified representation, and a book that measured one anyway was proposing, not reading.
 */
export const readTypedLeaves = () => {
  const text = fs.readFileSync(
    path.join(root, 'src/variables/typed-leaves.ts'),
    'utf8',
  )
  const start = text.indexOf('export const typedLeaves')
  const body = text.slice(start, text.indexOf('\nexport const', start))
  const leaves = new Map()

  for (const family of readBareEntries(body, 2))
    for (const leaf of readEntries(family.body, 4))
      leaves.set(leaf.name, {
        family: family.name,
        initialValue: leaf.body.match(/initialValue: '([^']+)'/)?.[1] ?? null,
        syntax: leaf.body.match(/syntax: '([^']+)'/)?.[1] ?? null,
      })

  return leaves
}

/** Every leaf — an entry no other entry composes — joined to the candidates that can address it. */ export const readLeaves =
  () => {
    const entries = readPropertyEntries()
    const candidates = readCandidates()

    /**
     * Which candidates address a slot, split by **how** they address it, because the two are not the
     * same motion and the difference is the whole distinction the pivot turns on.
     *
     * A candidate with parts writes those parts' own frame keys: it is a *constituent* of the composed
     * property, and its slot is the interpolable unit. A candidate with no parts writes the
     * **attribute's** key: for `property('scale')` that is the composition, for `property('outline-style')`
     * it is the leaf itself, and in both cases the motion is whole-property and the browser's own
     * interpolation is the abstraction. `src/core/surfaces.ts` records the same fact for the build
     * (`parts.length ? parts : [attribute]`); this is that rule applied to the census's question.
     */
    const parts = new Map()
    const wholes = new Map()

    for (const candidate of candidates) {
      if (!candidate.attribute) continue

      const target = candidate.parts.length ? parts : wholes
      const surfaces = candidate.parts.length
        ? candidate.parts
        : [candidate.attribute]

      for (const surface of surfaces) {
        const known = target.get(surface) ?? []

        known.push(candidate)
        target.set(surface, known)
      }
    }

    return {
      entries,
      leaves: entries
        .filter(entry => !entry.composite)
        .map(entry => ({
          ...entry,
          composite: false,
          // …and the ones that animate the slot as the attribute itself, which is a whole motion.
          wholes: wholes.get(entry.slot) ?? [],
          // The candidates that animate this slot as a **part** of a composed property.
          writers: parts.get(entry.slot) ?? [],
        })),
      partsOf: parts,
      wholesOf: wholes,
    }
  }

/**
 * The census's bucket for one pair — **one definition**, so the census and the coverage reader cannot drift
 * into two populations.
 *
 * The divergence this replaces was not cosmetic: `reach.test.ts` evaluated the model and saw
 * `scroll(var(--jumi-animation-timeline-axis) var(…))`, while a source reader saw the identifier
 * `animationTimelineScroll`, so the depth test could not fire and nine pairs that are reshapes were counted
 * as machinery — 324 − 30 = 294 "reach" against the census's 324 − 21 = 303. Two readers observing different
 * representations of one model, each self-consistent.
 *
 * `readExpressions()` is what makes them the same representation: the resolved expression, not the source
 * identifier. The order of the tests is the census's and is load-bearing — the reshape tests run **before**
 * the machinery test, which is why a `*-timeline` part nested in `scroll(…)` is a reshape.
 */
export const FUNCTION = /^[a-z][a-z0-9-]*\(/
export const MACHINERY = /^(animation|transition|scroll-timeline|view-timeline)/
const COLOUR =
  /^(transparent|currentcolor|black|white|red|blue|green|grey|gray)$/i

/** The parenthesis depth a component's slot sits at inside a composed value. */
export const depthOf = (expression, component) => {
  const at = String(expression).indexOf(`var(--jumi-${component})`)

  if (at < 0) return null

  let depth = 0

  for (const char of String(expression).slice(0, at)) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1
  }

  return depth
}

let resolved = null

/** The resolved expressions, read once: every caller wants the same map and the files do not change. */
export const expressions = () => {
  resolved ??= readExpressions()

  return resolved
}

export const bucketOf = (parent, component) => {
  const resting = String(expressions().get(component) ?? '')

  if (FUNCTION.test(resting)) return 'reshape'
  if (resting.includes('var(--jumi-')) return 'reshape'

  const depth = depthOf(expressions().get(parent) ?? '', component)

  if (depth !== null && depth > 0) return 'reshape'

  if (MACHINERY.test(parent)) return 'machinery'

  if (/^[a-z]+$/.test(resting) && !COLOUR.test(resting)) return 'keyword'

  return 'value'
}
