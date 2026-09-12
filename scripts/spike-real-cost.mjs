#!/usr/bin/env node
/**
 * SPIKE — HISTORICAL. This measures the linked aggregate, which was rejected.
 *
 * It reads the emitted `--jumi-link*` chain out of a real build, so it cannot run against the
 * shipped representation — the lists are flat now, and there are no links to find. It is kept
 * because it is the artifact that produced the number the rejection rests on (1.82× at
 * `K = 8`), and because it is the only place that measured the *real* emission's chain rather
 * than a synthetic one. See `docs/aggregate-representation.md`.
 *
 * SPIKE — style cost of the representation that actually ships.
 *
 * The K curve (`spike-style-cost.mjs`) measured a synthetic chain: links packed to
 * exactly `K` entries, depth `ceil(slots / K)`. The implementation does not pack
 * that tightly — links hold the runs the model's own history produced, which for a
 * real corpus settles nearer `slots / 3` links than `slots / 8`. Depth is what the
 * runtime decision was made on, so the approval measurement has to run against the
 * real emission, not the proxy.
 *
 * So both arms here come from one **real compile** of a real fixture, through the
 * local plugin, by the real Tailwind CLI:
 *
 *   linked-real          the emitted chain, untouched
 *   carrier-flat-current the same entries as ten flat lists — the representation
 *                        before the chain — built by resolving the chain and
 *                        re-declaring it flat. Same utilities, same entries, same
 *                        selectors; only the representation differs.
 *
 * Cases, as the gate specifies: 200 carriers × 60 slots, 200 carriers × 228 slots,
 * 200 descendants × 228 slots. `forced-one` (a single carrier invalidated) is the
 * number that decides, because it is the design's own mutation model.
 *
 * Every arm is verified functional before its numbers are read: an arm that
 * resolves nothing is reported as **invalid**, not as fast.
 *
 * Run: node scripts/spike-real-cost.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { chromium } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const dir = path.join(here, 'tmp-real')

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

/* ------------------------------------------------------------------------------------
 * A fixture with `slots` distinct slots, written the way a page writes them.
 * ---------------------------------------------------------------------------------- */

/**
 * Four attributes that each take a slot per value. `translate-x`, `blur` and the
 * rest of the transform/filter parts compose into one shared slot per attribute, so
 * using them would silently shrink every case — `prepare` asserts the emitted slot
 * count against the request rather than trusting the fixture.
 */
const RECIPES = [
  n => `animate-rotate-[${n}deg]`,
  n => `animate-scale-[1.${String(n).padStart(3, '0')}]`,
  n => `animate-opacity-[${n}e-3]`,
  n => `animate-background-color-[#${(0x100000 + n * 7919).toString(16).padStart(6, '0')}]`,
]

const utilities = slots => Array.from({ length: slots }, (_, index) => RECIPES[index % RECIPES.length](Math.floor(index / RECIPES.length) + 1))

const fixture = (slots, shape) => {
  const classes = utilities(slots).join(' ')

  if (shape === 'descendants') {
    // `*:animations` publishes the data on the children — the elements that
    // actually carry the slots — which is the only placement that resolves there.
    return `<div class="animations"><i class="*:animations ${classes}"></i></div>`
  }

  return `<div class="animations ${classes}"></div>`
}

/** Compile a fixture through the real plugin and return the emitted CSS. */
const compile = (slots, shape) => {
  const name = `${shape}-${slots}`

  writeFileSync(path.join(dir, `${name}.html`), fixture(slots, shape))
  writeFileSync(
    path.join(dir, `${name}.css`),
    `@import "tailwindcss" source(none);\n@source "./${name}.html";\n@plugin "../../dist/index.js";\n`,
  )

  execFileSync(
    'pnpm',
    ['exec', 'tailwindcss', '-i', path.join(dir, `${name}.css`), '-o', path.join(dir, `${name}.out.css`)],
    { cwd: root, stdio: 'pipe' },
  )

  return readFileSync(path.join(dir, `${name}.out.css`), 'utf8')
}

/* ------------------------------------------------------------------------------------
 * Reading the emission
 * ---------------------------------------------------------------------------------- */

const lastDeclaration = (css, property) => {
  const matches = [...css.matchAll(new RegExp(`${property}\\s*:\\s*([^;]+);`, 'g'))]

  return matches.at(-1)?.[1].trim() ?? ''
}

const splitTopLevel = (value) => {
  const parts = []
  let current = ''
  let depth = 0

  for (const char of value) {
    if (char === '(' || char === '[') depth += 1
    else if (char === ')' || char === ']') depth -= 1

    if (char === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }

    current += char
  }

  parts.push(current)

  return parts.map(part => part.trim()).filter(Boolean)
}

/** The chain, expanded into the flat list a browser would resolve. */
const resolveChain = (css, part = 'animation-name') => {
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

/** The entries a link carries, without the reference to its predecessor. */
const linkEntries = (css, id) => {
  const declaration = lastDeclaration(css, `--jumi-link${id}-animation-name`)
  const payload = declaration.replace(/^var\(--jumi-link[\w-]+\), /, '')

  return splitTopLevel(payload).length
}

/**
 * The slot utilities the fixture emitted, so the bench page can carry them. Tailwind
 * escapes arbitrary values in selectors (`animate-rotate-[45deg]` is written
 * `.animate-rotate-\[45deg\]`), and the page needs the *unescaped* class name or
 * nothing matches and both arms resolve nothing.
 */
const slotClasses = (css) => {
  const classes = new Set()

  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}?/g)) {
    const declarations = [...m[2].matchAll(/(--jumi-[\w-]+-animation-name)\s*:/g)].map(match => match[1])

    if (!declarations.some(name => !name.startsWith('--jumi-link') && name !== '--jumi-aggregate-animation-name')) continue

    for (const selector of m[1].split(',')) {
      const trimmed = selector.trim()

      if (trimmed.startsWith('.')) classes.add(trimmed.slice(1).replaceAll('\\', ''))
    }
  }

  return [...classes]
}

/** The selector the emitted data is published under. */
const dataSelector = (css) => {
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*--jumi-aggregate-[\w-]+:\s)/g)) return m[1].trim()

  return '.animations'
}

/** The structural shape of the chain, so fragmentation stays visible. */
const structure = (css) => {
  const publications = [...css.matchAll(/([^{}]+)\{([^{}]*--jumi-(?:link\d+-|aggregate-)[^{}]*)\}/g)]
    .map(match => match[2])
    .map((body) => {
      const links = [...new Set([...body.matchAll(/--jumi-link(\d+)-/g)].map(match => match[1]))]

      return {
        links: links.length,
        sizes: links
          .map(id => linkEntries(body, id))
          .filter(Boolean),
      }
    })
    .filter(publication => publication.links > 0)

  const live = new Set([...css.matchAll(/--jumi-link(\d+)-animation-name\s*:/g)].map(match => match[1]))
  const sizes = [...live].map(id => linkEntries(css, id))
  const touched = publications.map(publication => publication.links)
  const slots = splitTopLevel(resolveChain(css)).length

  return {
    averageEntriesPerLink: sizes.length ? +(slots / sizes.length).toFixed(2) : 0,
    links: sizes.length,
    maxDepth: sizes.length,
    maxEntriesPerLink: sizes.length ? Math.max(...sizes) : 0,
    maxLinksTouched: touched.length ? Math.max(...touched) : 0,
    pointerWrites: (css.match(/--jumi-aggregate-animation-name:\s/g) ?? []).length,
    publishEvents: publications.length,
    slots,
  }
}

/**
 * The flat arm: the same utilities and the same entries, declared the way the
 * representation before the chain declared them. The chain's own declarations are
 * removed so only the representation differs between the arms.
 */
const flatten = (css) => {
  const selector = dataSelector(css)
  const stripped = css.replace(/(--jumi-(?:link\d+|aggregate)-[\w-]+)\s*:\s*[^;]+;/g, '')
  const data = PARTS.map(part => `--jumi-aggregate-${part}: ${resolveChain(css, part)};`).join(' ')

  return `${stripped}\n${selector} { ${data} }`
}

/* ------------------------------------------------------------------------------------
 * The benchmark
 * ---------------------------------------------------------------------------------- */

const CASES = [
  { carriers: 200, label: '200 carriers · 60 slots', shape: 'direct', slots: 60 },
  { carriers: 200, label: '200 carriers · 228 slots', shape: 'direct', slots: 228 },
  { carriers: 200, label: '200 descendants · 228 slots', shape: 'descendants', slots: 228 },
]

mkdirSync(dir, { recursive: true })

/**
 * A variant-style change on a carrier only invalidates anything if the class it
 * toggles declares something, so both arms carry the same rule. Without it the
 * `forced` phases measure an invalidation that never happens and every arm looks
 * instant — which is how a broken harness reads as a fast one.
 */
const INVERSION = '\n.on { --jumi-animation-duration: 2s; }\n'

const prepared = []

for (const testCase of CASES) {
  const linked = compile(testCase.slots, testCase.shape)
  const slots = splitTopLevel(resolveChain(linked)).length

  if (slots !== testCase.slots) {
    console.error(`✗ ${testCase.label}: the fixture emitted ${slots} slots, asked for ${testCase.slots}`)
    process.exit(1)
  }

  prepared.push({
    ...testCase,
    classes: slotClasses(linked),
    flat: flatten(linked) + INVERSION,
    linked: linked + INVERSION,
    slots,
    structure: structure(linked),
  })

  if (process.env.JUMI_DEBUG) {
    const last = prepared[prepared.length - 1]

    console.log(`[debug] ${testCase.label}: classes=${last.classes.length} selector=${JSON.stringify(dataSelector(linked))}`)
  }
}

const script = `
const CASE_DATA = ${JSON.stringify(prepared.map(({ carriers, classes, flat, label, linked, shape, slots }) => ({ carriers, classes, flat, label, linked, shape, slots })))}

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

const time = (work) => {
  const start = performance.now()
  work()
  void document.body.offsetHeight
  return performance.now() - start
}

const dom = (carriers, classes, shape) => {
  const host = document.getElementById('host')
  const list = classes.join(' ')

  if (shape === 'descendants') {
    // The variant compiles to \`:is(.\\*\\:animations > *)\` — the class check is part
    // of the selector, so the children have to carry the literal class or nothing
    // matches and the arm measures a page with no aggregate at all.
    host.innerHTML = \`<div class="animations">\${Array.from({ length: carriers }, () => \`<i class="*:animations \${list}"></i>\`).join('')}</div>\`
    return [...document.querySelectorAll('.animations > *')]
  }

  host.innerHTML = Array.from({ length: carriers }, () => \`<div class="animations \${list}"></div>\`).join('')
  return [...document.querySelectorAll('.animations')]
}

const cell = (testCase, variant, repeats) => {
  const { carriers, classes, shape } = testCase
  const host = document.getElementById('host')
  const text = testCase[variant]
  const initial = []
  const single = []
  const forced = []
  let resolved = 0

  for (let run = 0; run < repeats; run += 1) {
    host.innerHTML = ''
    document.querySelectorAll('style.bench').forEach(style => style.remove())

    const style = document.createElement('style')
    style.className = 'bench'
    style.textContent = text
    document.head.append(style)

    const elements = dom(carriers, classes, shape)
    resolved = getComputedStyle(elements[elements.length - 1]).animationName.split(',').filter(name => name.trim() !== 'none').length

    initial.push(time(() => {
      for (const element of elements) getComputedStyle(element).animationName
    }))

    single.push(time(() => {
      const element = elements[elements.length - 1]
      element.classList.toggle('on')
      getComputedStyle(element).animationName
    }))

    forced.push(time(() => {
      for (const element of elements) element.classList.toggle('on')
      for (const element of elements) getComputedStyle(element).animationName
    }))
  }

  host.innerHTML = ''
  document.querySelectorAll('style.bench').forEach(style => style.remove())

  return { forced: median(forced), initial: median(initial), resolved, single: median(single) }
}

window.runBenchmark = (repeats = 5) => JSON.stringify({
  results: CASE_DATA.flatMap(testCase => ['linked', 'flat'].map(variant => ({
    label: testCase.label,
    slots: testCase.slots,
    variant,
    ...cell(testCase, variant, repeats),
  }))),
  ua: navigator.userAgent.match(/(Chrome\\/[\\d.]+)/)?.[1] ?? navigator.userAgent.slice(0, 40),
})
`

const page = path.join(dir, 'bench.html')

writeFileSync(
  page,
  `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>real representation cost</title></head>
  <body>
    <div id="host"></div>
    <script>${script}</script>
  </body>
</html>
`,
)

const browser = await chromium.launch()
const viewport = await browser.newPage()

await viewport.goto(`file://${page}`)

const report = JSON.parse(await viewport.evaluate(() => window.runBenchmark(5)))

await browser.close()

/* ------------------------------------------------------------------------------------
 * Report
 * ---------------------------------------------------------------------------------- */

const at = (label, variant) => report.results.find(row => row.label === label && row.variant === variant)

console.log(`\n${report.ua} · median of 5 · ${CASES.length} cases, real emission\n`)
console.log(`  structure of the emitted chain\n`)
console.log(`    ${'case'.padEnd(30)}${'slots'.padStart(6)}${'links'.padStart(7)}${'depth'.padStart(7)}${'avg/link'.padStart(10)}${'max/link'.padStart(10)}${'publishes'.padStart(11)}${'ptrWrites'.padStart(11)}${'linksTouched'.padStart(14)}`)

for (const testCase of prepared) {
  const s = testCase.structure

  console.log(
    `    ${testCase.label.padEnd(30)}${String(s.slots).padStart(6)}${String(s.links).padStart(7)}${String(s.maxDepth).padStart(7)}`
    + `${String(s.averageEntriesPerLink).padStart(10)}${String(s.maxEntriesPerLink).padStart(10)}`
    + `${String(s.publishEvents).padStart(11)}${String(s.pointerWrites).padStart(11)}${String(s.maxLinksTouched).padStart(14)}`,
  )
}

console.log(`\n  runtime, ms: initial / forced-all / forced-one\n`)
console.log(`    ${'case'.padEnd(30)}${'carrier-flat-current'.padStart(22)}${'linked-real'.padStart(26)}${'forced-one'.padStart(12)}`)

let worst = 0
const unmeasurable = []

for (const testCase of CASES) {
  const flat = at(testCase.label, 'flat')
  const linked = at(testCase.label, 'linked')

  // An arm that resolves nothing is not a fast arm. That happens for the
  // descendant shape for a reason that has nothing to do with the chain: the
  // adapter publishes the data on `.animations`, so a `*:animations` carrier
  // leaves the aggregate on the parent and the children that hold the slots
  // resolve nothing, in either representation. Reported, not scored.
  if (flat.resolved !== testCase.slots || linked.resolved !== testCase.slots) {
    unmeasurable.push(`${testCase.label}: flat ${flat.resolved}, linked ${linked.resolved}, expected ${testCase.slots}`)
    console.log(`    ${testCase.label.padEnd(30)}${'NOT MEASURABLE — resolves nothing in either arm'.padStart(46)}`)
    continue
  }

  const ratio = linked.single / flat.single

  worst = Math.max(worst, ratio)

  console.log(
    `    ${testCase.label.padEnd(30)}`
    + `${`${flat.initial.toFixed(1)} / ${flat.forced.toFixed(1)} / ${flat.single.toFixed(2)}`.padStart(22)}`
    + `${`${linked.initial.toFixed(1)} / ${linked.forced.toFixed(1)} / ${linked.single.toFixed(2)}`.padStart(26)}`
    + `${`${ratio.toFixed(2)}×`.padStart(12)}`,
  )
}

const sizes = prepared.map(testCase => ({
  flat: gzipSync(testCase.flat).length,
  label: testCase.label,
  linked: gzipSync(testCase.linked).length,
  rawFlat: testCase.flat.length,
  rawLinked: testCase.linked.length,
}))

console.log(`\n  emission size\n`)
console.log(`    ${'case'.padEnd(30)}${'flat raw'.padStart(12)}${'linked raw'.padStart(13)}${'flat gzip'.padStart(12)}${'linked gzip'.padStart(13)}`)

for (const size of sizes) {
  console.log(
    `    ${size.label.padEnd(30)}${`${(size.rawFlat / 1024).toFixed(1)} KB`.padStart(12)}`
    + `${`${(size.rawLinked / 1024).toFixed(1)} KB`.padStart(13)}`
    + `${`${(size.flat / 1024).toFixed(1)} KB`.padStart(12)}${`${(size.linked / 1024).toFixed(1)} KB`.padStart(13)}`,
  )
}

console.log(`\n  target: forced-one ≤1.5× carrier-flat-current, with margin\n`)
console.log(`    worst forced-one ratio: ${worst.toFixed(2)}×  ${worst <= 1.5 ? 'PASS' : 'FAIL'}`)

if (unmeasurable.length) {
  console.error(`\n✗ ${unmeasurable.length} case(s) not measurable — an arm resolved nothing:`)

  for (const line of unmeasurable) console.error(`  ${line}`)

  console.error('\n  The descendant shape fails in *both* representations, so it is not a chain')
  console.error('  result: the adapter publishes the data on `.animations`, and a `*:animations`')
  console.error('  carrier needs it on the children that hold the slots. Pre-existing, separate.')
}

if (worst > 1.5 || unmeasurable.length) {
  process.exit(1)
}

console.log('\n✓ every measurable arm resolved one name per slot, and forced-one is within budget')

rmSync(dir, { force: true, recursive: true })
