import { readFileSync } from 'node:fs'

import { compiler, root, snapshot } from '../lib/compile.mjs'

import path from 'node:path'

const read = relative => readFileSync(path.join(root, relative), 'utf8')

const tween = read('src/properties/tween.ts')
const property = read('src/variables/property.ts')

/** The candidates the registration table defines, as the census reads them. */
const candidates = [...tween.matchAll(/^ {4}'([\w-]+)': \{$/gm)].map(
  ([, name]) => name,
)

/** One vocabulary entry, from the block the table gives it. */
const entries = new Map()

for (const [, name, block] of property.matchAll(
  /^ {2}'([\w-]+)': \{([\s\S]*?)^ {2}\},/gm,
)) {
  const declared = /dependencies: \[([\s\S]*?)\]/.exec(block)
  const rest = /value: '([^']*)'/.exec(block)

  entries.set(name, {
    components: declared
      ? [...declared[1].matchAll(/'([\w-]+)'/g)].map(([, one]) => one)
      : [],
    rest: rest ? rest[1] : null,
  })
}

const parents = [...entries].filter(([, entry]) => entry.components.length)

console.log(`candidates (census):          ${candidates.length}`)
console.log(`vocabulary entries:           ${entries.size}`)
console.log(`parents declaring components: ${parents.length}`)

const components = new Set(parents.flatMap(([, entry]) => entry.components))

console.log(`distinct components:          ${components.size}`)

const addressed = new Set(candidates.map(name => name.replace(/^animate-/, '')))
const unaddressed = [...components].filter(one => !addressed.has(one))

console.log(
  `components with no candidate: ${unaddressed.length} -> ${unaddressed.join(', ')}`,
)

const nested = [...components].filter(
  one => (entries.get(one)?.components.length ?? 0) > 0,
)

console.log(
  `components that compose:      ${nested.length} -> ${nested.join(', ')}`,
)

/** The composed value the shipped sheet carries, per attribute. */
const MINIMAL = `@import 'tailwindcss' source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`
const usable = candidates.filter(name => name !== 'animate')
const built = await (
  await compiler(MINIMAL, snapshot)
).build(usable.map(name => `${name}-[0:0|100:1]`))

/** Every `--jumi-<name>: <value>` with balanced parens, read to its own semicolon. */
const declarations = new Map()

for (const [, name] of built.matchAll(/--jumi-([\w-]+):/g)) {
  if (declarations.has(name)) continue

  const start = built.indexOf(`--jumi-${name}:`) + name.length + 8
  let depth = 0
  let end = start

  while (end < built.length) {
    const char = built[end]

    if (char === '(') depth += 1
    else if (char === ')') depth -= 1
    else if (char === ';' && depth === 0) break

    end += 1
  }

  declarations.set(name, built.slice(start, end).replace(/\s+/g, ' ').trim())
}

/** The parenthesis depth a component's slot sits at inside its parent's composed value. */
const depthOf = (expression, leaf) => {
  const at = expression.indexOf(`var(--jumi-${leaf})`)

  if (at < 0) return null

  let depth = 0

  for (const char of expression.slice(0, at)) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1
  }

  return depth
}

const bare = []
const wrapped = []
const absent = []

for (const [parent, entry] of parents) {
  const expression = declarations.get(parent)

  for (const leaf of entry.components) {
    if (!expression) {
      absent.push(`${parent} -> ${leaf} (no parent declaration)`)
      continue
    }

    const depth = depthOf(expression, leaf)

    if (depth === null)
      absent.push(`${parent} -> ${leaf} (slot not in the value)`)
    else if (depth === 0) bare.push(`${parent} -> ${leaf}`)
    else wrapped.push(`${parent} -> ${leaf}`)
  }
}

console.log(`\ncomposed values recovered:    ${declarations.size}`)
console.log(`bare component slots:         ${bare.length}`)
console.log(`function-wrapped slots:       ${wrapped.length}`)
console.log(`unaccounted:                  ${absent.length}`)

const tally = list =>
  Object.entries(
    list.reduce((acc, one) => {
      const parent = one.split(' -> ')[0]
      acc[parent] = (acc[parent] ?? 0) + 1
      return acc
    }, {}),
  ).sort(([a], [b]) => (a < b ? -1 : 1))

console.log('\n--- function-wrapped, by parent ---')
for (const [parent, count] of tally(wrapped))
  console.log(`  ${parent.padEnd(22)} ${count}`)

console.log('\n--- bare, by parent ---')
for (const [parent, count] of tally(bare))
  console.log(`  ${parent.padEnd(22)} ${count}`)

if (absent.length) {
  console.log('\n--- unaccounted ---')
  for (const one of absent.slice(0, 24)) console.log(`  ${one}`)
}

console.log('\n--- sample composed values ---')
for (const name of ['filter', 'transform', 'scale', 'gap', 'box-shadow']) {
  const value = declarations.get(name)
  console.log(`  ${name}: ${value ? value.slice(0, 150) : '(none)'}`)
}
