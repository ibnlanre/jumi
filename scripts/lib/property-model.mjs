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
export const readCandidates = () => {
  const files = ['src/properties/tween.ts', 'src/properties/controls.ts']
  const candidates = []

  for (const file of files) {
    const text = fs.readFileSync(path.join(root, file), 'utf8')

    for (const entry of readEntries(text, 4)) {
      const at = entry.body.search(/\bfn: property\(/)

      if (at === -1) {
        candidates.push({
          attribute: null,
          file,
          name: entry.name,
          parts: [],
          types: [],
        })
        continue
      }

      // Balanced, not matched: see `readCall` and `readParts`. The greedy form credited candidates with
      // parts that appear in their own `type:` list or inside a wrapper function.
      const call = readCall(entry.body, entry.body.indexOf('(', at)) ?? ''
      const attribute = call.match(/^\s*'([\w-]+)'/)?.[1] ?? null
      const comma = call.indexOf(',')
      const rest = comma === -1 ? '' : call.slice(comma + 1)
      const typesAt = entry.body.search(/\btypes?:/)

      candidates.push({
        attribute,
        file,
        name: entry.name,
        parts: readParts(rest),
        // `type: 'length'` and `type: ['length', 'any']` are one list; the expression reader keeps a
        // multi-line list together and a quoted default whole.
        types:
          typesAt === -1
            ? []
            : [
                ...readExpression(
                  entry.body,
                  typesAt + entry.body.slice(typesAt).indexOf(':') + 1,
                ).matchAll(/'([\w-]+)'/g),
              ].map(match => match[1]),
      })
    }
  }

  return candidates
}

/** Every leaf — an entry no other entry composes — joined to the candidates that can address it. */
export const readLeaves = () => {
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
