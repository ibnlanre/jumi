#!/usr/bin/env node
/**
 * INVESTIGATION — the theme vocabulary, mapped to CSS tokens.
 *
 * `engineering/roadmap/migration.md` wants theme ownership and theme representation as two
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
const hostValues = async keys => {
  // Inside the repo, because the probe's `@import "tailwindcss"` resolves from
  // here — and `@plugin` needs a real path next to it.
  const dir = mkdtempSync(path.join(here, '.theme-map-'))
  const dump = path.join(dir, 'theme.json')

  writeFileSync(
    path.join(dir, 'probe.js'),
    [
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
    ].join('\n'),
  )

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
  const css = readFileSync(
    path.join(root, 'node_modules/tailwindcss/theme.css'),
    'utf8',
  )
  const tokens = new Map()

  for (const match of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    tokens.set(match[1], match[2].trim())
  }

  return tokens
}

/** `0.25rem * 4` → `1rem`, so a spacing formula can be checked arithmetically. */ const spacingProduct =
  (name, base) => {
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

    if (matched.length && (!best || matched.length > best.matched.length))
      best = { matched, prefix }
  }

  const spaced = spacing
    ? entries
        .filter(([name, value]) => spacingProduct(name, spacing) === value)
        .map(([name]) => name)
    : []

  const tokenMatched = best?.matched.length ?? 0
  const covered = tokenMatched + spaced.length
  const parts = []

  if (tokenMatched) {
    const sample =
      best.matched.length < entries.length
        ? ` (e.g. ${best.matched.slice(0, 3).join(', ')})`
        : ''
    parts.push(`--${best.prefix}-*${sample}`)
  }
  if (spaced.length) parts.push('calc(var(--spacing) * n)')

  if (covered < entries.length) {
    // Name the exceptions while there are few enough to decide individually.
    const left = entries
      .filter(
        ([name, value]) =>
          value !== tokens.get(`--${best?.prefix}-${name}`) &&
          spacingProduct(name, spacing ?? '') !== value,
      )
      .map(([name]) => name)

    parts.push(
      `literal (${entries.length - covered}${left.length <= 4 ? `: ${left.join(', ')}` : ''})`,
    )
  }

  rows.push({
    calls,
    entries: entries.length,
    key,
    mapping: parts.join(' + ') || '—',
    // Kept so the classification below can tell "no namespace resembles these values" from
    // "the namespace exists but no emitted utility references it".
    prefix: best?.prefix ?? null,
    spaced: spaced.length,
    verdict:
      entries.length === 0
        ? 'empty'
        : covered === entries.length
          ? 'all'
          : covered
            ? 'partial'
            : 'none',
  })
}
const width = Math.max(...rows.map(row => row.key.length))
const covered = rows.reduce(
  (total, row) => total + (row.verdict === 'all' ? row.entries : 0),
  0,
)
const literal = rows.reduce(
  (total, row) => total + (row.verdict === 'partial' ? row.entries : 0),
  0,
)

console.log(`${'key'.padEnd(width)}  calls  values  verdict  mapping`)
console.log('─'.repeat(width + 40))

for (const row of rows) {
  console.log(
    `${row.key.padEnd(width)}  ${String(row.calls).padStart(5)}  ${String(row.entries).padStart(6)}  ` +
      `${row.verdict.padEnd(7)}  ${row.mapping}`,
  )
}

const tally = rows.reduce(
  (acc, row) => ({ ...acc, [row.verdict]: (acc[row.verdict] ?? 0) + 1 }),
  {},
)

console.log(
  `\n${rows.length} keys: ${Object.entries(tally)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ')}`,
)
console.log(
  `values fully mappable: ${covered}, in partially mapped keys: ${literal}`,
)
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
  const source = readFileSync(
    path.join(root, 'src/helpers/create/theme.ts'),
    'utf8',
  )
  const block =
    /themeSpacing = new Set\(\[([\s\S]*?)\]\)/.exec(source)?.[1] ?? ''

  return new Set([...block.matchAll(/'([A-Za-z]+)'/g)].map(match => match[1]))
}

const jumi = implemented()
const host = new Set(rows.filter(row => row.spaced).map(row => row.key))
const missing = [...host].filter(key => !jumi.has(key))
const extra = [...jumi].filter(key => !host.has(key))

console.log(`\nspacing: implemented ${jumi.size}, measured ${host.size}`)
console.log(`  implemented: ${[...jumi].join(', ')}`)

if (missing.length)
  console.log(`  measured and not implemented: ${missing.join(', ')}`)
if (extra.length)
  console.log(`  implemented and not measured: ${extra.join(', ')}`)
if (!missing.length && !extra.length) console.log('  no drift')

/* ------------------------------------------------------------------------------------
 * The classification: what every key Jumi consumes resolves to, and why
 *
 * Phase 2 is complete when every key has an explicit representation strategy — **not** when every
 * value has become a CSS variable. A literal is a valid final representation when that is what the
 * host emits, so this report has to be able to say *why* a key stays literal, and the reason has to
 * come from the emitted CSS rather than from the theme file or from a name that looks right.
 *
 * That is the whole point of the second stage. `--shadow-*` exists, `shadow-sm` exists, the values
 * correspond — and `shadow-sm` still inlines its value while `drop-shadow-sm` references
 * `var(--drop-shadow-sm)`. A namespace existing is not a contract; a utility referencing it is.
 *
 * Two things are reported, and both have to be empty:
 *
 *   drift        the strategy Jumi declares and the emitted CSS disagree
 *   unmeasured   a key has a candidate namespace, and no utility could be found to check it
 * ---------------------------------------------------------------------------------- */

/** Tailwind's utility name per key, where it is not the property name. Everything else is kebab. */
const utility = {
  accentColor: 'accent',
  aspectRatio: 'aspect',
  backdropBlur: 'backdrop-blur',
  backgroundColor: 'bg',
  blur: 'blur',
  borderColor: 'border',
  borderRadius: 'rounded',
  boxShadow: 'shadow',
  boxShadowColor: 'shadow',
  caretColor: 'caret',
  colors: 'text',
  dropShadow: 'drop-shadow',
  fontFamily: 'font',
  fontSize: 'text',
  gridAutoColumns: 'auto-cols',
  gridAutoRows: 'auto-rows',
  gridColumn: 'col',
  gridColumnEnd: 'col-end',
  gridColumnStart: 'col-start',
  gridRow: 'row',
  gridRowEnd: 'row-end',
  gridRowStart: 'row-start',
  gridTemplateColumns: 'grid-cols',
  gridTemplateRows: 'grid-rows',
  letterSpacing: 'tracking',
  lineHeight: 'leading',
  maxWidth: 'max-w',
  outlineColor: 'outline',
  transformOrigin: 'origin',
  transitionDelay: 'delay',
  transitionDuration: 'duration',
}

/** What the source claims: which key resolves to which namespace, and which names stay literal. */
const claims = () => {
  const source = readFileSync(
    path.join(root, 'src/helpers/create/theme.ts'),
    'utf8',
  )
  const block = /themeTokens[^=]*= \{([\s\S]*?)\n\}/.exec(source)?.[1] ?? ''
  const found = []

  // An entry is read from its key to the next key, rather than off one line. The formatter is free to
  // break `maxWidth` across three lines when its literal list outgrows the print width, and a
  // line-anchored entry regex loses the key on the day that happens — silently, because a key that was
  // never derived is a key this report simply has no claim to compare against.
  const starts = [...block.matchAll(/^ {2}(\w+): \{/gm)]

  for (const [index, entry] of starts.entries()) {
    const end = starts[index + 1]?.index ?? block.length
    // Prose between two entries must not read as the entry above it: a comment that says
    // `namespace:` is a sentence, not a declaration.
    const body = block
      .slice(entry.index + entry[0].length, end)
      .replace(/^\s*\/\/.*$/gm, '')
    const namespace = /namespace: '([^']+)'/.exec(body)?.[1]
    const list = /literal: \[([^\]]*)\]/.exec(body)?.[1]

    if (namespace) {
      found.push({
        key: entry[1],
        literal: list
          ? [...list.matchAll(/'([^']+)'/g)].map(match => match[1])
          : [],
        namespace,
      })
    }
  }

  return found
}

const claimable = name => /^[\w-]+$/.test(name)
const number = /^\d+(?:\.\d+)?$/
const kebab = key => key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

const announced = new Map(claims().map(claim => [claim.key, claim]))

/** Every key worth measuring: what Jumi claims, plus what the weak pass found resembling a scale. */
const suspects = keys
  .map(([key]) => ({
    key,
    namespace:
      announced.get(key)?.namespace ??
      rows.find(row => row.key === key)?.prefix ??
      null,
    prefix: utility[key] ?? kebab(key),
  }))
  .filter(suspect => suspect.namespace)

for (const suspect of suspects) {
  suspect.names = Object.keys(values[suspect.key] ?? {}).filter(claimable)
  suspect.selector = name =>
    `${suspect.prefix}-${name === 'DEFAULT' ? '' : name}`.replace(/-$/, '')
}

const scan = mkdtempSync(path.join(here, '.theme-map-'))
const instance = await compile('@import "tailwindcss" source(none);', {
  base: scan,
  onDependency() {},
})
const emitted = instance.build(
  [
    ...new Set(
      suspects.flatMap(suspect => suspect.names.map(suspect.selector)),
    ),
  ].filter(Boolean),
)

rmSync(scan, { force: true, recursive: true })

/** The rule body for `selector`, or nothing when the utility was not emitted at all. */
const rule = selector => {
  for (const form of [`.${selector} {`, `.${selector}{`]) {
    const at = emitted.indexOf(form)

    if (at !== -1) return emitted.slice(at, emitted.indexOf('}', at))
  }

  return null
}

for (const suspect of suspects) {
  const bodies = suspect.names.map(name => rule(suspect.selector(name)))

  suspect.tokens = suspect.names.filter((name, index) =>
    bodies[index]?.includes(`var(--${suspect.namespace}-${name})`),
  )
  // A wrong utility name would measure zero and look exactly like a literal, so a key nobody
  // emitted a rule for is reported as unmeasured rather than as intentionally literal.
  suspect.reachable = bodies.some(body => body !== null)
}

/**
 * The strategy Jumi declares, read from `src/helpers/create/theme.ts`: a namespace, the spacing
 * formula, both, or neither. Neither is a strategy too — it is the decision to keep the host's own
 * output, which is what the report then has to justify.
 */
const strategy = key => {
  const claim = announced.get(key)
  const spaced = jumi.has(key)

  if (claim) return claim.literal.length || spaced ? 'mixed' : 'token'

  return spaced ? 'formula' : 'literal'
}

const measured = suspect => {
  if (!suspect) return '—'
  if (!suspect.reachable) return 'unmeasured'
  if (!suspect.tokens.length) return 'none'

  return suspect.tokens.length === suspect.names.length ? 'all' : 'partial'
}

/**
 * The strategy and the measurement have to agree, which is the whole check: a key that stays
 * literal needs the emitted CSS to inline it, and a key that claims a namespace needs the emitted
 * CSS to reference at least one name of it.
 */
const agrees = (declared, found) => {
  if (found === 'unmeasured') return false
  if (found === '—') return declared === 'formula' || declared === 'literal'
  if (declared === 'literal') return found === 'none'
  if (declared === 'token') return found === 'all'

  return found !== 'none'
}

/**
 * A literal list is a claim about individual names, so it is checked name by name — a list that
 * names the wrong exception still has the right length, and that is how `DEFAULT` would get lost.
 * A bare number counts as a literal without being listed: it is never a namespace name.
 */
const contradictions = suspect => {
  const claim = announced.get(suspect.key)

  if (!claim || !suspect.reachable) return []

  const found = []

  for (const name of suspect.names) {
    const referenced = suspect.tokens.includes(name)
    const literal = claim.literal.includes(name) || number.test(name)

    if (referenced && literal) found.push(`${name}: listed literal, referenced`)
    if (!referenced && !literal) found.push(`${name}: not listed, inlined`)
  }

  return found
}

const namespace_width = Math.max(
  9,
  ...suspects.map(suspect => suspect.namespace.length + 4),
)

console.log('\nclassification: what every key Jumi consumes resolves to\n')
console.log(
  `${'key'.padEnd(width)}  strategy  measured   ${'namespace'.padEnd(namespace_width)}  token names`,
)

let drifted = 0
let unmeasured = 0

for (const [key] of keys) {
  const suspect = suspects.find(candidate => candidate.key === key)
  const declared = strategy(key)
  const found = measured(suspect)
  const notes = suspect ? contradictions(suspect) : []
  const ok = agrees(declared, found) && !notes.length

  if (!ok) drifted += 1
  if (found === 'unmeasured') unmeasured += 1

  console.log(
    `${key.padEnd(width)}  ${declared.padEnd(8)}  ${(ok ? found : `${found} ⚠`).padEnd(10)}  ` +
      `${(suspect ? `--${suspect.namespace}-*` : '—').padEnd(namespace_width)}  ` +
      `${suspect ? `${suspect.tokens.length}/${suspect.names.length}` : '—'}`,
  )

  for (const note of notes.slice(0, 3))
    console.log(`${''.padEnd(width + 13)}⚠ ${note}`)
}

/** Why a key stays literal, which is the only part of the strategy that needs a reason. */
const reason = suspect => {
  if (!suspect) return 'no candidate namespace resembles these values'
  if (!suspect.reachable)
    return `unmeasured: no \`${suspect.prefix}-*\` utility to check`
  if (!suspect.tokens.length)
    return `--${suspect.namespace}-* exists, but the emitted utility inlines it`

  return 'partly token-backed'
}

console.log('\nliteral by decision, with the reason:\n')

for (const [key] of keys) {
  if (strategy(key) !== 'literal') continue

  console.log(
    `  ${key.padEnd(width)}  ${reason(suspects.find(candidate => candidate.key === key))}`,
  )
}

const counts = {}
for (const [key] of keys)
  counts[strategy(key)] = (counts[strategy(key)] ?? 0) + 1

console.log(
  `\n${keys.length} keys classified: ${Object.entries(counts)
    .map(([name, count]) => `${count} ${name}`)
    .join(', ')}`,
)
console.log(
  `${drifted ? `${drifted} strategies contradicted by the emitted CSS` : 'no drift: every strategy matches the emitted CSS'}`,
)
console.log(
  `${unmeasured ? `${unmeasured} keys could not be measured` : 'no unmeasured namespace candidates'}`,
)

// `pnpm check` runs this, so a strategy and the emitted CSS disagreeing is a failure and not a
// report: the classification is only worth keeping if something stops it from drifting.
if (drifted || unmeasured) process.exitCode = 1
