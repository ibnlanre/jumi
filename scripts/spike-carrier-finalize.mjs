#!/usr/bin/env node
/**
 * SPIKE — HISTORICAL. Promoted into the product.
 *
 * The `finalize` below is the shape that now ships: `src/helpers/carriers/index.ts`, exported
 * from the package, driven by `scripts/lib/compile.mjs`. `pnpm behaviour:check` performs the
 * same four contexts (direct, descendant, pseudo-element, `@apply`) on the shipped artifact as
 * a *required* check, three builds deep, so this script's result is now a gate rather than an
 * experiment. Kept for the record: it is where the marker-plus-finalizer design was first
 * proven, on stock Tailwind, against emitted CSS.
 *
 * SPIKE — can Jumi own carrier finalization, on stock Tailwind, against emitted CSS?
 *
 * The seam experiment proved *where* the aggregate has to go: into the carrier utility body
 * after variants have transformed it. It proved it by patching the compiler, which would make
 * Jumi depend on a fork. This asks the smaller question:
 *
 *   can Jumi find those same rules in the CSS Tailwind emitted and inject the aggregate
 *   there — with a marker doing the identifying, so Jumi needs to know nothing about
 *   Tailwind's selectors, variants or AST?
 *
 * It runs on **stock Tailwind**, through the ordinary public entry point, with the real Jumi
 * plugin. Four beats:
 *
 *   1. the carrier body declares a marker (`--jumi-carrier`), which variants carry with it
 *   2. Jumi publishes its aggregate as it does today, as a staging rule
 *   3. the finalizer resolves that aggregate, injects it into every marked rule, and removes
 *      the staging — proving the finalizer is *sufficient*, not additive
 *   4. a browser decides, and it is asked again after each of three incremental builds
 *
 * Rules are only ever identified by Jumi's own marker, so `*:animations`,
 * `before:animations`, compound variants, and whatever Tailwind invents next all work the
 * same way: Tailwind owns transformation, Jumi owns the data.
 *
 * Run: node scripts/spike-carrier-finalize.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { compile } from 'tailwindcss'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const dir = path.join(here, 'tmp-finalize')

console.log('· bundling the plugin')
execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

/* ------------------------------------------------------------------------------------
 * A fixture with the four carrier contexts, including the one Jumi refuses.
 * ---------------------------------------------------------------------------------- */

const CONTEXTS = `
    <div id="direct" class="animations animate-rotate-45"></div>
    <div id="descendant" class="*:animations"><i class="animate-rotate-45"></i></div>
    <div id="pseudo" class="before:animations before:content-[''] before:animate-rotate-45"></div>
    <div id="applied" class="applied-motion"></div>
    <div id="grown" class="animations animate-shake"></div>
    <div id="motion" class="animations motion-safe:animate-fade-in"></div>
`

const FIXTURE = `<!doctype html>
<html>
  <body>
${CONTEXTS}
  </body>
</html>
`

const INPUT = `@import "tailwindcss" source(none);

@source "./fixture.html";
@plugin "../../dist/index.js";

/* The context Jumi refuses: @apply copies the carrier body while the CSS is parsed, and the
   data it needs did not exist yet. The finalizer runs after the build, so the question is
   whether that copy is a rule it can find — and it is. */
.applied-motion {
  @apply animations animate-rotate-45;
}
`

mkdirSync(dir, { recursive: true })
writeFileSync(path.join(dir, 'fixture.html'), FIXTURE)
writeFileSync(path.join(dir, 'input.css'), INPUT)

/* ------------------------------------------------------------------------------------
 * Reading and writing CSS at the leaf-rule level.
 *
 * `@layer` and `@supports` wrappers contain braces, so `[^{}]*` only ever matches leaf
 * rules — exactly the set a finalizer may touch, and it never needs to know where they are.
 * ---------------------------------------------------------------------------------- */

const RULE = /([^{}]+)\{([^{}]*)\}/g

const lastDeclaration = (css, property) => {
  const matches = [...css.matchAll(new RegExp(`${property}\\s*:\\s*([^;]+);`, 'g'))]

  return matches.at(-1)?.[1].trim() ?? ''
}

const PARTS = [
  'animation-name',
  'animation-duration',
  'animation-delay',
  'animation-composition',
  'animation-direction',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-play-state',
  'animation-timeline',
  'animation-timing-function',
]

/** The aggregate as published, expanded — the representation is not the finalizer's business. */
const resolveChain = (css, part) => {
  const pointer = lastDeclaration(css, `--jumi-aggregate-${part}`)
  const head = /^var\((--jumi-link[\w-]+)\)$/.exec(pointer)?.[1]

  if (head === undefined) return pointer

  const pieces = []
  let link = head

  while (link !== undefined) {
    const declaration = lastDeclaration(css, link)

    if (!declaration) break

    const previous = /^var\((--jumi-link[\w-]+)\), /.exec(declaration)

    pieces.unshift(previous ? declaration.slice(previous[0].length) : declaration)
    link = previous?.[1]
  }

  return pieces.join(', ')
}

/**
 * The finalizer. Its entire vocabulary is:
 *
 *   a carrier is a rule declaring `--jumi-carrier`
 *   staging is a rule that declares aggregate data and is not a carrier
 */
const finalize = (css) => {
  const declarations = PARTS
    .map(part => `--jumi-aggregate-${part}: ${resolveChain(css, part)};`)
    .join('')

  const stats = { carriers: 0, slots: 0, staging: 0 }

  const finalized = css.replace(RULE, (match, selector, body) => {
    const isCarrier = /--jumi-carrier\s*:/.test(body)

    if (isCarrier) {
      stats.carriers += 1
      if (stats.carriers === 1) stats.slots = resolveChain(css, 'animation-name').split(',').length

      return `${selector}{${body}${declarations}}`
    }

    if (/--jumi-(aggregate|link)-[\w-]+\s*:/.test(body)) {
      stats.staging += 1

      return ''
    }

    return match
  })

  return { ...stats, css: finalized }
}

/* ------------------------------------------------------------------------------------
 * Three incremental builds against the real plugin, on stock Tailwind
 * ---------------------------------------------------------------------------------- */

const candidates = [...new Set([...CONTEXTS.matchAll(/class="([^"]+)"/g)].flatMap(match => match[1].split(/\s+/)))]

/**
 * Stock Tailwind's own entry point, at the same boundary `@tailwindcss/vite` and
 * `@tailwindcss/postcss` sit on: a stylesheet resolver for the `tailwindcss` import and a
 * module loader for `@plugin`. Nothing here is a fork, a patch, or a private API.
 */
const stylesheet = path.join(root, 'node_modules/tailwindcss/index.css')

const compiler = await compile(readFileSync(path.join(dir, 'input.css'), 'utf8'), {
  base: dir,
  loadModule: async (id, base) => {
    const resolved = path.resolve(base, id)
    const loaded = await import(resolved)

    // tsup's CJS output puts the plugin object (`{ handler, config }`) on `default`.
    return { base, module: loaded.default ?? loaded, path: resolved }
  },
  loadStylesheet: async (id, base) => {
    if (id !== 'tailwindcss') throw new Error(`unexpected stylesheet: ${id}`)

    return { base: path.dirname(stylesheet), content: readFileSync(stylesheet, 'utf8'), path: stylesheet }
  },
  onDependency() {},
})

const builds = [
  { extra: [], label: 'build 1 · the contexts' },
  { extra: ['animate-shake'], label: 'build 2 · + a slot' },
  { extra: ['animate-shake', 'motion-safe:animate-fade-in'], label: 'build 3 · + a variant slot' },
]

const steps = builds.map((step) => {
  const raw = compiler.build([...candidates, ...step.extra])

  return { ...step, raw, ...finalize(raw) }
})

/* ------------------------------------------------------------------------------------
 * A browser decides
 * ---------------------------------------------------------------------------------- */

const CHECKS = [
  { key: 'direct', selector: '#direct' },
  { key: 'descendant', selector: '#descendant > i' },
  { key: 'pseudo', pseudo: '::before', selector: '#pseudo' },
  { key: 'applied', selector: '#applied' },
  { from: 2, key: 'grown (build 2 slot)', selector: '#grown' },
  { from: 3, key: 'motion (build 3 slot)', selector: '#motion' },
]

const browser = await chromium.launch()
const rows = []

for (const step of steps) {
  const page = await browser.newPage()

  await page.setContent(`<!doctype html><html><head><style>${step.css}</style></head><body>${CONTEXTS}</body></html>`)

  const measured = {}

  for (const check of CHECKS) {
    measured[`${check.key}`] = await page.evaluate(
      ({ pseudo, selector }) => {
        const element = document.querySelector(selector)

        // A missing element is a fixture mistake, not a resolution result — say so rather
        // than scoring it as "resolved nothing".
        return element ? getComputedStyle(element, pseudo).animationName : '(absent)'
      },
      { pseudo: check.pseudo ?? null, selector: check.selector },
    )
  }

  rows.push({ ...step, measured })

  await page.close()
}

await browser.close()

/* ------------------------------------------------------------------------------------
 * Report
 * ---------------------------------------------------------------------------------- */

const resolving = name => name.split(',').map(part => part.trim()).filter(part => part !== 'none')

const number = steps.length

console.log(`\n  Jumi carrier finalizer · stock Tailwind · three builds\n`)
console.log(`    ${'build'.padEnd(30)}${'slots'.padStart(7)}${'carriers'.padStart(10)}${'staging'.padStart(9)}${'css'.padStart(9)}`)

for (const row of rows) {
  console.log(
    `    ${row.label.padEnd(30)}${String(row.slots).padStart(7)}${String(row.carriers).padStart(10)}`
    + `${String(row.staging).padStart(9)}${String(row.css.length).padStart(9)}`,
  )
}

const failures = []

for (const [index, row] of rows.entries()) {
  console.log(`\n  ${row.label}\n`)

  for (const check of CHECKS) {
    if (check.from !== undefined && index + 1 < check.from) continue

    const names = resolving(row.measured[check.key])
    const met = names.length > 0

    console.log(`    ${met ? '✓' : '✗'} ${check.key.padEnd(24)}${names.join(' + ') || 'none'}`)

    // `@apply` is measured and reported, but not required: whether it should work is a
    // decision, not a mechanism question, and the docs pin it as unsupported today.
    if (!met && check.key !== 'applied') failures.push(`${row.label}: ${check.key} resolved nothing`)
  }
}

const last = rows.at(-1)
const contexts = CHECKS.filter(check => check.from === undefined)
const green = contexts.filter(check => resolving(last.measured[check.key]).length).length

console.log(`\n  carrier contexts in the final build: ${green}/${contexts.length}`)
console.log(`  staging rules removed: ${rows[0].staging} (build 1) → ${last.staging} (last)`)

if (failures.length) {
  console.error('\n✗ the finalizer does not hold:')

  for (const failure of failures) console.error(`  ${failure}`)

  process.exit(1)
}

console.log(`\n✓ every required carrier context resolves on stock Tailwind, across ${number} builds`)
