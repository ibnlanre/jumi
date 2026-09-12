#!/usr/bin/env node
/**
 * DIFFERENTIAL — can Jumi parse a raw candidate into the payload a matcher receives?
 *
 * Phase 3a. The oracle is Tailwind, not our understanding of it: for every Jumi candidate in the
 * real corpora, the host is asked what it would hand a matcher, `parseCandidate` is asked the same
 * question, and the two answers have to be identical — including "nothing at all" for a candidate
 * Tailwind rejects.
 *
 * The vocabulary comes from a real registration: the wrapper records the options Jumi passes to
 * `matchUtilities`/`matchComponents` (name, `values`, `type`, `modifiers`,
 * `supportsNegativeValues`), which is exactly what a parser needs and exactly what the plan
 * assumed would have to exist. Nothing is transcribed from `src/`.
 *
 * Two deliberate limits, both from the inventory:
 *
 * - **Variants are opaque prefixes.** They are stripped before parsing (measured: they never reach
 *   the matcher), and the raw candidate still goes to the host in full so the comparison stays
 *   honest about which shapes were exercised.
 * - **`@apply` keeps authored order.** This measures payloads, not sequences; ordering is the
 *   source's job (see `docs/scanner-inventory.md`).
 *
 * Run: node scripts/candidate-diff.mjs
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { parser } from './lib/candidate.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

/** The corpora whose candidates are compared. Fixtures and the examples build, all real. */
const corpora = [
  'scripts/css-snapshot/fixture.html',
  'scripts/css-snapshot/variant.html',
  'examples/index.html',
]

const stylesheets = ['scripts/css-snapshot/input.css', 'scripts/css-snapshot/variant.css']

/** The wrapper captures the vocabulary Jumi registers, and the payload each candidate produces. */
const wrapperSource = pluginPath => `
import jumi from ${JSON.stringify(pluginPath)}

const state = globalThis.__jumiCandidateDiff ??= { calls: [], vocabulary: [] }

const wrap = (fn, name, options) => (value, extra = {}) => {
  state.calls.push({
    context: Object.keys(extra),
    modifier: extra.modifier ?? null,
    name,
    value: String(value),
  })
  return fn(value, extra)
}

const matched = (utilities, options) => Object.fromEntries(
  Object.entries(utilities).map(([name, fn]) => [name, wrap(fn, name, options)]),
)

export default {
  handler(api) {
    state.vocabulary.length = 0
    jumi.handler({
      ...api,
      matchComponents: (utilities, options) => {
        for (const name of Object.keys(utilities)) state.vocabulary.push({ name, ...options })
        return api.matchComponents(matched(utilities, options), options)
      },
      matchUtilities: (utilities, options) => {
        for (const name of Object.keys(utilities)) state.vocabulary.push({ name, ...options })
        return api.matchUtilities(matched(utilities, options), options)
      },
    })
  },
}
`

/** Every class-like string in a source file: `class="…"` attributes and `@apply …;` parameters. */
const candidatesIn = (file) => {
  const source = readFileSync(path.join(root, file), 'utf8')
  const found = []

  for (const match of source.matchAll(/class="([^"]*)"/g)) found.push(...match[1].split(/\s+/))
  for (const match of source.matchAll(/@apply\s+([^;]+);/g)) found.push(...match[1].split(/\s+/))

  return found.filter(Boolean).sort()
}

const { compile } = await import('tailwindcss')

const tailwind = path.join(root, 'node_modules', 'tailwindcss', 'index.css')
const dir = mkdtempSync(path.join(here, '.candidate-diff-'))
const wrapper = path.join(dir, 'wrapper.js')

writeFileSync(wrapper, wrapperSource(path.join(root, 'dist', 'index.js')))

const options = {
  base: dir,
  loadModule: async (id, from) => {
    const resolved = path.resolve(from, id)
    const loaded = await import(resolved)

    return { base: from, module: loaded.default ?? loaded, path: resolved }
  },
  loadStylesheet: async (id, from) => {
    if (id !== 'tailwindcss') throw new Error(`unexpected stylesheet: ${id}`)

    return { base: path.dirname(tailwind), content: readFileSync(tailwind, 'utf8'), path: tailwind }
  },
  onDependency() {},
}

const css = `@import "tailwindcss" source(none);\n@plugin ${JSON.stringify(wrapper)};\n`

// The vocabulary, from one registration. Reused for every candidate: it is data, not state.
await compile(css, options)

const state = globalThis.__jumiCandidateDiff ??= { calls: [], vocabulary: [] }
const vocabulary = state.vocabulary

/**
 * One build per candidate, so a call is attributable to the candidate that produced it. A shared
 * instance would keep earlier rules and make the log ambiguous.
 */
const payloadFor = async (raw) => {
  state.calls.length = 0

  const instance = await compile(css, options)
  instance.build([raw])

  const [call] = state.calls

  return call ? { modifier: call.modifier, name: call.name, value: call.value } : null
}

console.log('candidate differential — Tailwind payload vs Jumi parser\n')

/** The spike's matrix, because the corpora do not contain a negative, a modifier or a rejection. */
const edges = [
  'animate-rotate-45',
  'animate-rotate-[23deg]',
  'animate-rotate-[calc(1deg_+_2deg)]',
  'animate-rotate-[var(--spin)]',
  '-animate-bottom-4',
  '-animate-bottom-[3px]',
  'transition-duration-600/rotate',
  'animate-width-abc',
  'animate-width-4',
]

const raws = [...new Set([...corpora.flatMap(candidatesIn), ...edges])]
const applied = [...new Set(stylesheets.flatMap(candidatesIn))]

const jumi = parser(vocabulary)
const interesting = raws.filter(raw => raw.includes('animate') || raw === 'animations')

console.log(`vocabulary: ${vocabulary.length} matchers registered by Jumi`)
console.log(`candidates: ${interesting.length} Jumi-relevant, from ${raws.length} in the corpora`
  + ` plus ${edges.length} edge cases`)
console.log(`@apply parameters in the same corpora: ${applied.length}`)

let match = 0
const deltas = []

for (const raw of interesting) {
  const host = await payloadFor(raw)
  const mine = jumi(raw)
  // The observable payload is the triple. Negation is visible *through* the value, so the test
  // still covers it; `negative` is only how the parser arrives at it.
  const shaped = mine && { modifier: mine.modifier, name: mine.root, value: mine.value }

  if (JSON.stringify(host) === JSON.stringify(shaped)) match += 1
  else deltas.push({ host, mine: shaped, raw })
}

// A candidate whose *variant* nobody declares is rejected before any matcher runs — the two in the
// examples are dead markup from the abandoned natural-language variant design. Jumi does not model
// variant *validity* (it strips the prefix, by design), so these are reported separately rather than
// counted as parser failures. Brackets matter: a phrase value contains `:` too.
const prefixed = (raw) => {
  let depth = 0

  for (const character of raw) {
    if (character === '[' || character === '(') depth += 1
    else if (character === ']' || character === ')') depth -= 1
    else if (character === ':' && depth === 0) return true
  }

  return false
}

const unmodelled = deltas.filter(delta => delta.host === null && prefixed(delta.raw))
const real = deltas.filter(delta => !unmodelled.includes(delta))

for (const delta of real) {
  console.log(`\n  ${delta.raw}`)
  console.log(`    tailwind  ${delta.host ? JSON.stringify(delta.host) : '(rejected)'}`)
  console.log(`    jumi      ${delta.mine ? JSON.stringify(delta.mine) : '(rejected)'}`)
}

for (const delta of unmodelled) {
  console.log(`\n  ${delta.raw}  (the host rejects it on a variant nobody declares — examples cleanup)`)
}

console.log(`\n${match}/${interesting.length} payloads identical`
  + `${real.length ? `, ${real.length} real deltas` : ''}`
  + `${unmodelled.length ? `, ${unmodelled.length} undeclared-variant candidates` : ''}`)

rmSync(dir, { force: true, recursive: true })
