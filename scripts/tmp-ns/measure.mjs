// Batch 3 measurement: which names in the six partial namespaces are token-backed?
// Rule 2: measured against actual emitted v4 CSS, not guessed from similarly named scales.
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { compiler, build } from '../lib/compile.mjs'

const KEYS = {
  borderRadius: { namespace: 'radius', utility: 'rounded' },
  blur: { namespace: 'blur', utility: 'blur' },
  boxShadow: { namespace: 'shadow', utility: 'shadow' },
  dropShadow: { namespace: 'drop-shadow', utility: 'drop-shadow' },
  lineHeight: { namespace: 'leading', utility: 'leading' },
  maxWidth: { namespace: 'container', utility: 'max-w' },
}

const here = path.dirname(new URL(import.meta.url).pathname)
const dir = path.join(here, '.measure')
mkdirSync(dir, { recursive: true })

const tokenNames = (namespace) => {
  const css = readFileSync('node_modules/tailwindcss/theme.css', 'utf8')
  const found = new Set()
  for (const match of css.matchAll(new RegExp(`--${namespace}-([a-z0-9-]+)\\s*:`, 'g'))) {
    found.add(match[1])
  }
  return found
}

const lengthLike = (value) => /^-?[\d.]+(rem|px|em|ch|%|vw|vh)$/.test(String(value).trim())

// 1. Ask the host what it hands the plugin.
const dumpFile = path.join(dir, 'scales.json')
writeFileSync(
  path.join(dir, 'probe.js'),
  `import { writeFileSync } from "node:fs"\nexport default { handler(api) { const dump = {}; for (const key of ${JSON.stringify(
    Object.keys(KEYS),
  )}) { const values = api.theme(key) ?? {}; dump[key] = Object.fromEntries(Object.entries(values).filter(([name]) => name !== "__CSS_VALUES__")) } writeFileSync(${JSON.stringify(
    dumpFile,
  )}, JSON.stringify(dump)) } }\n`,
)
const dumper = await compiler('@import "tailwindcss" source(none);\n@plugin "./probe.js";\n', dir)
dumper.build([])
const scales = JSON.parse(readFileSync(dumpFile, 'utf8'))

// 2. Classify the names the host offers.
const candidates = {}
for (const [key, { utility }] of Object.entries(KEYS)) {
  candidates[key] = Object.entries(scales[key]).map(([name, value]) => ({
    name,
    value,
    numeric: /^\d+$/.test(name),
    junk: /^\d+$/.test(name) && !lengthLike(value),
    bare: name === 'DEFAULT',
    selector: name === 'DEFAULT' ? utility : `${utility}-${name}`,
  }))
}

// 3. Emit every candidate utility in one build and read what each rule declares.
const all = Object.values(candidates).flatMap((entries) => entries.map((entry) => entry.selector))
const fixture = await compiler('@import "tailwindcss" source(none);\n', dir)
const { raw: css } = build(fixture, all)

const ruleFor = (selector) => {
  let at = css.indexOf(`.${selector} {`)
  if (at === -1) at = css.indexOf(`.${selector}{`)
  if (at === -1) return ''
  return css.slice(at, css.indexOf('}', at) + 1).replace(/\s+/g, ' ')
}

let problems = 0
const summary = {}
for (const [key, { namespace, utility }] of Object.entries(KEYS)) {
  const tokens = tokenNames(namespace)
  const table = { token: [], literal: [], junk: 0, mismatch: [] }
  const counts = { token: 0, literal: 0, junk: 0 }
  for (const entry of candidates[key]) {
    const rule = ruleFor(entry.selector)
    const references = rule.includes(`var(--${namespace}-${entry.name})`)
    const inContract = tokens.has(entry.name)
    if (inContract !== references && !entry.junk) table.mismatch.push(`${entry.name}: contract=${inContract} emitted=${references}`)
    if (references) { counts.token += 1; table.token.push(`${entry.name}=${entry.value}`) }
    else if (entry.junk) { counts.junk += 1 }
    else { counts.literal += 1; table.literal.push(`${entry.name}=${String(entry.value).slice(0, 24)}`) }
    if (entry.junk) problems += 1
    if (table.mismatch.length) problems += 1
  }
  summary[key] = { namespace, counts, ...table }
}

rmSync(dir, { recursive: true, force: true })
console.log(JSON.stringify(summary, null, 2))
console.log(`problems: ${problems}`)
