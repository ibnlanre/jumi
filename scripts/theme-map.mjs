#!/usr/bin/env node
/**
 * INVESTIGATION — the theme vocabulary, mapped to CSS tokens.
 *
 * `docs/migration.md` wants theme ownership and theme representation as two
 * separate changes: first prove *which* of the keys Jumi consumes have a CSS
 * token representation, then switch them in reviewed batches. This is the first
 * half, and it measures rather than assumes.
 *
 * For every theme key Jumi asks for, it compares the values the host hands the
 * plugin (`api.theme(key)`) against the tokens the host emits for CSS
 * (`--color-red-500: …` in the default theme layer). A prefix only counts as a
 * mapping when the token exists *and* carries the same value — a namespace that
 * happens to be spelled similarly proves nothing.
 *
 * Verdicts
 *   token    every value has a `--prefix-name` token with an equal value
 *   formula  values are spacing multiples: `calc(var(--spacing) * n)`
 *   partial  some values are Jumi's own additions with no host token
 *   none     no candidate namespace verified
 *
 * Run: node scripts/theme-map.mjs
 */
import { compile } from '@tailwindcss/node'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

/**
 * The vocabulary, read out of the source rather than copied into this file, so
 * it stays honest as the utilities change.
 */
const vocabulary = () => {
  const sources = [
    'src/core/index.ts',
    'src/properties/controls.ts',
    'src/properties/tween.ts',
  ]
  const keys = new Map()

  for (const source of sources) {
    const text = readFileSync(path.join(root, source), 'utf8')

    for (const match of text.matchAll(/theme\('([A-Za-z]+)'/g)) {
      keys.set(match[1], (keys.get(match[1]) ?? 0) + 1)
    }
  }

  return [...keys].sort(([, a], [, b]) => b - a)
}

/** Candidate CSS namespaces per key. Which one holds is decided by measurement. */
const candidates = {
  accentColor: ['color'],
  aspectRatio: ['aspect'],
  backdropBlur: ['blur'],
  backdropBrightness: ['brightness'],
  backdropContrast: ['contrast'],
  backdropGrayscale: ['grayscale'],
  backdropHueRotate: ['hue-rotate'],
  backdropInvert: ['invert'],
  backdropOpacity: ['opacity'],
  backdropSaturate: ['saturate'],
  backdropSepia: ['sepia'],
  backgroundColor: ['color'],
  backgroundImage: ['background-image'],
  backgroundPosition: ['position'],
  backgroundSize: ['size'],
  blur: ['blur'],
  borderColor: ['color'],
  borderRadius: ['radius'],
  borderWidth: ['border-width', 'border'],
  boxShadow: ['shadow'],
  boxShadowColor: ['color'],
  brightness: ['brightness'],
  caretColor: ['color'],
  colors: ['color'],
  contrast: ['contrast'],
  dropShadow: ['drop-shadow'],
  fill: ['color'],
  flex: ['flex'],
  flexBasis: ['flex-basis', 'spacing'],
  flexGrow: ['flex-grow'],
  flexShrink: ['flex-shrink'],
  fontFamily: ['font'],
  fontSize: ['text'],
  fontWeight: ['font-weight'],
  gap: ['spacing'],
  grayscale: ['grayscale'],
  gridAutoColumns: ['grid-auto-columns'],
  gridAutoRows: ['grid-auto-rows'],
  gridColumn: ['grid-column'],
  gridColumnEnd: ['grid-column-end'],
  gridColumnStart: ['grid-column-start'],
  gridRow: ['grid-row'],
  gridRowEnd: ['grid-row-end'],
  gridRowStart: ['grid-row-start'],
  gridTemplateColumns: ['grid-template-columns'],
  gridTemplateRows: ['grid-template-rows'],
  height: ['spacing', 'height'],
  hueRotate: ['hue-rotate'],
  // No `inset` candidate: measured, it matched `--inset-shadow-*` (the inset
  // *shadow* utility's namespace) against three `inset` names, which is a
  // spelling coincidence rather than a mapping.
  inset: ['spacing'],
  invert: ['invert'],
  letterSpacing: ['tracking'],
  lineHeight: ['leading'],
  margin: ['spacing'],
  maxHeight: ['spacing', 'max-height'],
  maxWidth: ['container', 'max-width', 'spacing'],
  minHeight: ['spacing', 'min-height'],
  minWidth: ['container', 'min-width', 'spacing'],
  objectPosition: ['object-position'],
  opacity: ['opacity'],
  order: ['order'],
  outlineColor: ['color'],
  outlineOffset: ['spacing', 'outline-offset'],
  outlineWidth: ['outline-width'],
  padding: ['spacing'],
  rotate: ['rotate'],
  saturate: ['saturate'],
  scale: ['scale'],
  sepia: ['sepia'],
  skew: ['skew'],
  spacing: ['spacing'],
  strokeWidth: ['stroke-width'],
  transformOrigin: ['transform-origin'],
  transitionDelay: ['delay', 'transition-delay'],
  transitionDuration: ['duration', 'transition-duration'],
  translate: ['spacing', 'translate'],
  width: ['spacing', 'width'],
  zIndex: ['z-index', 'z'],
}

/** Ask the host what it hands the plugin for each key. */
const hostValues = async (keys) => {
  // Inside the repo, because the probe's `@import "tailwindcss"` resolves from
  // here — and `@plugin` needs a real path next to it.
  const dir = mkdtempSync(path.join(here, '.theme-map-'))
  const dump = path.join(dir, 'theme.json')

  writeFileSync(path.join(dir, 'probe.js'), [
    'import { writeFileSync } from "node:fs"',
    '',
    'export default {',
    '  handler(api) {',
    `    const keys = ${JSON.stringify(keys)}`,
    '    const dump = {}',
    '    for (const key of keys) {',
    '      try {',
    '        const values = api.theme(key) ?? {}',
    '        dump[key] = Object.fromEntries(',
    '          Object.entries(values).filter(([name]) => name !== "__CSS_VALUES__"),',
    '        )',
    '      }',
    '      catch { dump[key] = null }',
    '    }',
    `    writeFileSync(${JSON.stringify(dump)}, JSON.stringify(dump))`,
    '  },',
    '}',
    '',
  ].join('\n'))

  const css = [
    '@import "tailwindcss" source(none);',
    '@plugin "./probe.js";',
    '',
  ].join('\n')

  const compiler = await compile(css, { base: dir, onDependency() {} })
  compiler.build([])

  const values = JSON.parse(readFileSync(dump, 'utf8'))

  rmSync(dir, { force: true, recursive: true })

  return values
}

/**
 * Every custom property of the default theme.
 *
 * Read from the shipped theme file rather than from a build: Tailwind emits only
 * the theme variables a build actually uses, so compiling with no candidates
 * produces almost none of them. `theme.css` is the full vocabulary.
 */
const hostTokens = () => {
  const css = readFileSync(path.join(root, 'node_modules/tailwindcss/theme.css'), 'utf8')
  const tokens = new Map()

  for (const match of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    tokens.set(match[1], match[2].trim())
  }

  return tokens
}

/** `0.25rem * 4` → `1rem`, so a spacing formula can be checked arithmetically. */const spacingProduct = (name, base) => {
  const factor = Number(name)
  const amount = Number.parseFloat(base)

  if (!Number.isFinite(factor) || !Number.isFinite(amount)) return null
  if (!base.endsWith('rem')) return null

  return `${factor * amount}rem`
}

const keys = vocabulary()
const values = await hostValues(keys.map(([key]) => key))
const tokens = hostTokens()
const spacing = tokens.get('--spacing')

const rows = []

for (const [key, calls] of keys) {
  const entries = Object.entries(values[key] ?? {})
  let best = null

  for (const prefix of candidates[key] ?? []) {
    // A token only counts when it carries the same value: a namespace that is
    // spelled similarly proves nothing (`--inset-shadow-*` is not `inset`).
    const matched = entries
      .filter(([name, value]) => tokens.get(`--${prefix}-${name}`) === value)
      .map(([name]) => name)

    if (matched.length && (!best || matched.length > best.matched.length)) best = { matched, prefix }
  }

  const spaced = spacing
    ? entries.filter(([name, value]) => spacingProduct(name, spacing) === value).map(([name]) => name)
    : []

  const tokenMatched = best?.matched.length ?? 0
  const covered = tokenMatched + spaced.length
  const parts = []

  if (tokenMatched) {
    const sample = best.matched.length < entries.length ? ` (e.g. ${best.matched.slice(0, 3).join(', ')})` : ''
    parts.push(`--${best.prefix}-*${sample}`)
  }
  if (spaced.length) parts.push('calc(var(--spacing) * n)')

  if (covered < entries.length) {
    // Name the exceptions while there are few enough to decide individually.
    const left = entries
      .filter(([name, value]) => value !== tokens.get(`--${best?.prefix}-${name}`)
        && spacingProduct(name, spacing ?? '') !== value)
      .map(([name]) => name)

    parts.push(`literal (${entries.length - covered}${left.length <= 4 ? `: ${left.join(', ')}` : ''})`)
  }

  rows.push({
    calls,
    entries: entries.length,
    key,
    mapping: parts.join(' + ') || '—',
    spaced: spaced.length,
    verdict: entries.length === 0 ? 'empty' : covered === entries.length ? 'all' : covered ? 'partial' : 'none',
  })
}
const width = Math.max(...rows.map(row => row.key.length))
const covered = rows.reduce((total, row) => total + (row.verdict === 'all' ? row.entries : 0), 0)
const literal = rows.reduce((total, row) => total + (row.verdict === 'partial' ? row.entries : 0), 0)

console.log(`${'key'.padEnd(width)}  calls  values  verdict  mapping`)
console.log('─'.repeat(width + 40))

for (const row of rows) {
  console.log(
    `${row.key.padEnd(width)}  ${String(row.calls).padStart(5)}  ${String(row.entries).padStart(6)}  `
    + `${row.verdict.padEnd(7)}  ${row.mapping}`,
  )
}

const tally = rows.reduce((acc, row) => ({ ...acc, [row.verdict]: (acc[row.verdict] ?? 0) + 1 }), {})

console.log(`\n${rows.length} keys: ${Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(', ')}`)
console.log(`values fully mappable: ${covered}, in partially mapped keys: ${literal}`)
console.log(`spacing base: ${spacing}`)

/* ------------------------------------------------------------------------------------
 * The batch list, checked against the measurement
 *
 * The written plan for the spacing batch named `outlineOffset` — whose scale is px — and missed
 * `lineHeight` and `maxWidth`, which carry spacing names. That is the kind of error this report
 * exists to make loud: what Jumi implements and what the host's own values say has to be the same
 * set, and either direction of drift is a decision that was not measured.
 * ---------------------------------------------------------------------------------- */

/** The keys Jumi resolves through the spacing formula, read from the source that declares them. */
const implemented = () => {
  const source = readFileSync(path.join(root, 'src/helpers/create/theme.ts'), 'utf8')
  const block = /themeSpacing = new Set\(\[([\s\S]*?)\]\)/.exec(source)?.[1] ?? ''

  return new Set([...block.matchAll(/'([A-Za-z]+)'/g)].map(match => match[1]))
}

const jumi = implemented()
const host = new Set(rows.filter(row => row.spaced).map(row => row.key))
const missing = [...host].filter(key => !jumi.has(key))
const extra = [...jumi].filter(key => !host.has(key))

console.log(`\nspacing: implemented ${jumi.size}, measured ${host.size}`)
console.log(`  implemented: ${[...jumi].join(', ')}`)

if (missing.length) console.log(`  measured and not implemented: ${missing.join(', ')}`)
if (extra.length) console.log(`  implemented and not measured: ${extra.join(', ')}`)
if (!missing.length && !extra.length) console.log('  no drift')

/* ------------------------------------------------------------------------------------
 * The token claims, checked against emitted CSS
 *
 * A token existing is not the same as a utility *referencing* it, and only the second one is a
 * contract Jumi can borrow. `--shadow-*` exists and is spelled just like `--drop-shadow-*`, but
 * `shadow-sm` inlines its value (`--tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, …)`) while
 * `drop-shadow-sm` references its token — so `boxShadow` is not in the table above and
 * `dropShadow` is. This report re-derives every claim in `themeTokens` from the utilities
 * Tailwind actually emits: for each name, is `var(--namespace-name)` there or not?
 * ---------------------------------------------------------------------------------- */

/** One representative utility per key: a namespace is only real if some utility uses it. */
const utility = {
  accentColor: 'accent',
  backgroundColor: 'bg',
  blur: 'blur',
  borderColor: 'border',
  borderRadius: 'rounded',
  boxShadowColor: 'shadow',
  caretColor: 'caret',
  colors: 'text',
  dropShadow: 'drop-shadow',
  letterSpacing: 'tracking',
  lineHeight: 'leading',
  maxWidth: 'max-w',
  outlineColor: 'outline',
}

/** What the source claims: which key resolves to which namespace, and which names stay literal. */
const claims = () => {
  const source = readFileSync(path.join(root, 'src/helpers/create/theme.ts'), 'utf8')
  const block = /themeTokens[^=]*= \{([\s\S]*?)\n\}/.exec(source)?.[1] ?? ''
  const found = []

  for (const entry of block.matchAll(/^ {2}(\w+): \{(.*)\},$/gm)) {
    const namespace = /namespace: '([^']+)'/.exec(entry[2])?.[1]
    const list = /literal: \[([^\]]*)\]/.exec(entry[2])?.[1]

    if (namespace) {
      found.push({
        key: entry[1],
        literal: list ? [...list.matchAll(/'([^']+)'/g)].map(match => match[1]) : [],
        namespace,
      })
    }
  }

  return found
}

const number = /^\d+(?:\.\d+)?$/
const claimable = (name) => /^[\w-]+$/.test(name)

const announced = claims()
const classes = []

for (const claim of announced) {
  const prefix = utility[claim.key]
  const names = Object.keys(values[claim.key] ?? {}).filter(claimable)

  claim.names = names
  classes.push(...names.map(name => `${prefix}-${name === 'DEFAULT' ? '' : name}`))

  // The bare utility is a separate candidate: `shadow` is `shadow-DEFAULT`, `rounded` is
  // `rounded-DEFAULT`, and neither is `rounded-DEFAULT` as a class name.
  claim.prefix = prefix
}

const scan = mkdtempSync(path.join(here, '.theme-map-'))
const instance = await compile('@import "tailwindcss" source(none);', { base: scan, onDependency() {} })
const emitted = instance.build([...new Set(classes)].filter(Boolean))

rmSync(scan, { recursive: true, force: true })

/** Does the rule for `selector` reference `var(--token)`? */
const declares = (selector, token) => {
  for (const form of [`.${selector} {`, `.${selector}{`]) {
    const at = emitted.indexOf(form)

    if (at !== -1) return emitted.slice(at, emitted.indexOf('}', at)).includes(`var(--${token})`)
  }

  return false
}

console.log(`\ntoken claims: ${announced.length} keys`)

let drift = 0

for (const claim of announced) {
  const predicted = (name) => !claim.literal.includes(name) && !number.test(name)
  const missingTokens = []
  const extraTokens = []
  let tokensHere = 0

  for (const name of claim.names) {
    const selector = `${claim.prefix}-${name === 'DEFAULT' ? '' : name}`.replace(/-$/, '')
    const reference = declares(selector, `${claim.namespace}-${name}`)

    if (reference) tokensHere += 1
    if (predicted(name) && !reference) missingTokens.push(name)
    if (!predicted(name) && reference) extraTokens.push(name)
  }

  drift += missingTokens.length + extraTokens.length

  const notes = []
  if (missingTokens.length) notes.push(`not a token: ${missingTokens.slice(0, 4).join(', ')}`)
  if (extraTokens.length) notes.push(`is a token: ${extraTokens.slice(0, 4).join(', ')}`)

  console.log(
    `  ${claim.key.padEnd(width)} --${claim.namespace}-*: ${tokensHere} of ${claim.names.length}`
    + ` name${claim.names.length === 1 ? '' : 's'}, literal ${claim.literal.length}`
    + (notes.length ? `  ⚠ ${notes.join('; ')}` : ''),
  )
}

console.log(drift ? `\n${drift} claims contradicted by the emitted CSS` : '\nno drift: every claim matches the emitted CSS')
