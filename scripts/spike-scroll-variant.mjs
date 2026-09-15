#!/usr/bin/env node
/**
 * Composition-variant spike — can `animation-range-entry:animate-fade-in` exist?
 *
 * The CTO's question, in five parts. A range variant must:
 *
 *   1. instantiate the wrapped motion normally,
 *   2. identify the slot that motion created,
 *   3. add `animation-range: <value>` to **that same slot**,
 *   4. leave the source selector semantically intact,
 *   5. work the same for an effect, a single value, and an arbitrary phrase.
 *
 * The reading being tested is that the variant does not need to *know* the wrapped candidate at all.
 * Tailwind hands a variant only its own value and modifier — never the utility it wraps — so the two
 * facts the emission needs (the slot, and the range) come from different places:
 *
 *   the range   the class the author typed, which is in the emitted selector
 *   the slot    the activation declaration in the same rule, which is how the hoist already finds
 *               every slot in the stylesheet
 *
 * If that holds, the variant's own contribution is the identity selector `&`: the wrapped utility is
 * emitted where a page applies it (so the motion runs), and the finalizer reads both facts off the
 * rule. That is this spike's whole hypothesis, and the marker is deliberately *not* the
 * never-matching staging selector the view-transition variant uses — a motion that never reaches the
 * element is not a composition.
 *
 * The finalizer step is *prototyped here*, not added to `src`: a pass over the emitted CSS that
 * decodes the range from the selector, reads the slot from the activation, and publishes
 * `--jumi-<slot>-animation-range` on the same rule. Then the real finalizer runs, and a browser is
 * asked whether the two animations on one element ended up with two different ranges.
 *
 * Run: `pnpm spike:scroll-variant`
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

console.log('· bundling')
execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const { finalizeCss } = await import(path.join(root, 'dist', 'index.js'))

/** The ranges a variant may name, and the values they map to. */
const RANGES = {
  'contain': 'contain',
  'cover': 'cover',
  'entry': 'entry',
  'entry-crossing': 'entry-crossing',
  'exit': 'exit',
  'exit-crossing': 'exit-crossing',
}

/**
 * The throwaway variant, wrapped around Jumi's own plugin so the emission under test is a real one.
 *
 * Measured trap, inherited from the view-transition spike: Tailwind calls a variant callback once at
 * configuration time with a sentinel value (`{ value: 'a', modifier: null }`) whether or not a
 * candidate uses it. The callback therefore validates before it does anything, and the sentinel gets
 * a selector that matches nothing rather than a range nobody asked for.
 */
const scratch = mkdtempSync(
  path.join(root, 'scripts', '.spike-scroll-variant-'),
)
const variantPlugin = path.join(scratch, 'variant.mjs')

writeFileSync(
  variantPlugin,
  `
import jumi from ${JSON.stringify(path.join(root, 'dist', 'index.js'))}

export default {
  handler(api) {
    jumi.handler(api)

    api.matchVariant('animation-range', () => {
      // Nothing to decide here, and that is the finding: the range is in the class the author typed,
      // which lands in the emitted selector escaped. Validating it *here* would be validating in the
      // one place that cannot report — a variant callback has no warning channel — so the callback
      // is a pure identity and the judgement belongs to the pass that reads the selector.
      //
      // It also sidesteps the sentinel: Tailwind calls this once at configuration time with a value
      // of 'a' and no candidate at all, and identity has nothing to record.
      return '&'
    }, { values: ${JSON.stringify(RANGES)} })
  },
}
`,
)

const entry = `
@import "tailwindcss";
@plugin "${path.join(root, 'dist', 'index.js')}";
@plugin "${variantPlugin}";
`

const CANDIDATES = [
  // One element, two motions, two ranges.
  'animate-fade-in',
  'animate-fade-out',
  'animation-range-entry:animate-fade-in',
  'animation-range-exit:animate-fade-out',
  // The arbitrary value, and the arbitrary *utility inside* it.
  'animation-range-[entry_20%_cover_50%]:animate-fade-in',
  'animation-range-entry:animate-opacity-[0:0|100:1]',
  // The modifier form, which is `/` doing its own job (identity), not a range value.
  'animation-range-entry:animate-opacity-[0:0|100:1]/[reveal]',
  // A value that is not a range at all, beside a real one on the same element: the pass has to be
  // able to refuse it, because an invalid substituted value drops the whole declaration.
  'animation-range-nonsense:animate-fade-out',
  // Stacked with ordinary conditions. The range publication and the activation live in the same
  // source rule here, so a selector-state condition should stay meaningful — the opposite of the
  // view-transition case, where the emission has to be replayed onto a pseudo tree.
  'motion-safe:animation-range-entry:animate-fade-in',
  'sm:animation-range-entry:animate-fade-in',
  'hover:animation-range-entry:animate-fade-in',
  'motion-safe:supports-[animation-timeline:scroll()]:animation-range-entry:animate-fade-in',
  // Controls and timelines still travel through the variant unchanged.
  'animation-range-entry:animate-rotate-45',
  'animation-timeline-view',
]

const compiler = (await import('./lib/compile.mjs')).compiler
const instance = await compiler(entry, root)
const emitted = instance.build(CANDIDATES)

console.log(
  `\n${'─'.repeat(72)}\n1 · what a build emits for the variant\n${'─'.repeat(72)}`,
)

const sheet = postcss.parse(emitted)
const variantRules = []

sheet.walkRules(rule => {
  if (!rule.selector.includes('animation-range-')) return

  variantRules.push(rule)
})

for (const rule of variantRules) {
  const declarations = (rule.nodes ?? []).filter(node => node.type === 'decl')
  const activation = declarations.find(node =>
    /^--jumi-.+-animation-name$/.test(node.prop),
  )

  console.log(`\n  ${rule.selector}`)
  for (const declaration of declarations)
    console.log(`    ${declaration.prop}: ${declaration.value}`)
  console.log(
    `  → activation: ${activation ? `${activation.prop} (slot ${/^--jumi-(.+)-animation-name$/.exec(activation.prop)[1]})` : '(none)'}`,
  )
}

// ── 2 · the decode the finalizer would have to do ───────────────────────────────────────────────
/**
 * The class an author typed is in the selector, escaped. Everything the emission needs from the
 * variant is in it, and nothing else is: the wrapped utility after the colon is the host's business.
 *
 * The guard the view-transition pass learned to insist on applies here too — this must test the
 * *shape* (a ranged prefix ending at an unescaped colon) rather than a prefix, because the only
 * class that can be trusted is the one in the selector being read.
 */
const ENCODED = /^animation-range-(.+)$/

/**
 * The class token a selector starts with, and the variant segments inside it.
 *
 * A variant stack puts the range anywhere in the name — `.hover\:animation-range-entry\:animate-fade-in:hover`
 * has it second, and an anchored match finds nothing. Measured: the first version of this decode
 * returned *undecoded* for every stacked spelling, which would have been read as "stacking breaks the
 * variant" rather than "the reader is too naive".
 *
 * Segments are split on the escaped colon, which is how a variant boundary is written; everything
 * inside `[...]` is part of its own segment and its colons are escaped with it.
 */
const classToken = selector => {
  for (let index = 1; index < selector.length; index += 1) {
    if (selector[index] === '\\') {
      index += 1

      continue
    }

    if ('.:#[]>+~ '.includes(selector[index])) return selector.slice(1, index)
  }

  return selector.slice(1)
}

const segments = token => {
  const out = []
  let current = ''

  for (let index = 0; index < token.length; index += 1) {
    if (token[index] === '\\') {
      if (token.startsWith('\\:', index)) {
        out.push(current)
        current = ''
        index += 1

        continue
      }

      current += token.slice(index, index + 2)
      index += 1

      continue
    }

    current += token[index]
  }

  out.push(current)

  return out.map(segment => segment.replace(/\\(.)/g, '$1'))
}

/**
 * The value an author typed, recovered from the class in the selector.
 *
 * Escapes come off, `_` is the space an arbitrary value cannot contain, and an arbitrary value's
 * brackets are the syntax rather than part of it.
 */
const decode = selector => {
  const found = segments(classToken(selector))
    .map(segment => ENCODED.exec(segment))
    .find(match => match !== null)

  if (!found) return null

  const value = found[1].replace(/_/g, ' ')

  return value.startsWith('[') && value.endsWith(']')
    ? value.slice(1, -1)
    : value
}

console.log(
  `\n${'─'.repeat(72)}\n2 · the two facts, read off the rule\n${'─'.repeat(72)}`,
)

const decoded = variantRules.map(rule => {
  const declarations = (rule.nodes ?? []).filter(node => node.type === 'decl')
  const activation = declarations.find(node =>
    /^--jumi-.+-animation-name$/.test(node.prop),
  )
  const slot = activation
    ? /^--jumi-(.+)-animation-name$/.exec(activation.prop)[1]
    : null

  return { range: decode(rule.selector), selector: rule.selector, slot }
})

for (const row of decoded) {
  console.log(
    `  ${String(row.range ?? '(undecoded)').padEnd(24)} slot ${row.slot ?? '(none)'}   ${row.selector.slice(0, 64)}`,
  )
}

// ── 3 · the publication, prototyped here rather than added to src ───────────────────────────────
/**
 * One declaration per ranged slot, written onto the rule that already carries the motion — so the
 * element resolves it, and the composition's position for that slot reads it. This is the same
 * publication the hoist performs for `--jumi-slot-<slot>`, one property over.
 */
const publishRanges = css => {
  const tree = postcss.parse(css)
  const published = []

  tree.walkRules(rule => {
    for (const selector of rule.selectors) {
      const range = decode(selector)

      if (!range) continue

      const declarations = (rule.nodes ?? []).filter(
        node => node.type === 'decl',
      )
      const activation = declarations.find(node =>
        /^--jumi-.+-animation-name$/.test(node.prop),
      )

      // No activation means the rule carries no motion, so there is no slot to place.
      if (!activation) continue

      const slot = /^--jumi-(.+)-animation-name$/.exec(activation.prop)[1]
      const prop = `--jumi-${slot}-animation-range`

      rule.append(postcss.decl({ prop, value: range }))
      published.push({ prop, range, selector, slot })
    }
  })

  return { css: tree.toString(), published }
}

const { css: published, published: publications } = publishRanges(emitted)
const finalized = finalizeCss(published)

console.log(`\n${'─'.repeat(72)}\n3 · the publication\n${'─'.repeat(72)}`)

for (const row of publications) console.log(`  ${row.prop}: ${row.range}`)

// The composition reads the per-slot variable, so the publication has to survive finalization and
// show up in the list position for that slot — not merely in the author's rule.
const composition = postcss.parse(finalized.css)
let list = null

composition.walkRules(rule => {
  const own = (rule.nodes ?? []).filter(node => node.type === 'decl')

  if (
    own.some(node => node.prop === 'animation-range') &&
    own.some(node => node.prop === 'animation')
  )
    list = own.find(node => node.prop === 'animation-range')
})

console.log(`\n  the composition's range list:\n    ${list?.value ?? '(none)'}`)
console.log(
  `\n  per-slot publications surviving finalization: ${(finalized.css.match(/--jumi-(fade-in|fade-out|reveal|opacity)-animation-range/g) ?? []).join(' ')}`,
)

// ── 4 · does it actually place two motions differently? ─────────────────────────────────────────
const page = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; }
  #lead { height: 240px; }
  /* One box each: the two slots share the element's geometry, so a progress difference between them
     is the range and not the position. */
  #stage { position: relative; height: 200px; }
  #stage > * { position: absolute; inset: 0; }
  #tail { height: 1800px; }
</style>
<style id="jumi">${finalized.css}</style></head>
<body>
<div id="lead">lead</div>
<div id="stage">
  <div id="ranged" class="animate-fade-in animate-fade-out animation-timeline-view animation-range-entry:animate-fade-in animation-range-exit:animate-fade-out"></div>
  <div id="control" class="animate-fade-in animate-fade-out animation-timeline-view"></div>
  <div id="arbitrary" class="animate-fade-in animation-timeline-view animation-range-[entry_20%_cover_50%]:animate-fade-in"></div>
  <div id="poisoned" class="animate-fade-in animate-fade-out animation-timeline-view animation-range-entry:animate-fade-in animation-range-nonsense:animate-fade-out"></div>
</div>
<div id="tail">tail</div>
<script>
  window.__read = (id) => {
    const node = document.getElementById(id)

    if (!node) return { missing: true }

    const style = getComputedStyle(node)
    const animations = [...document.getAnimations()].filter(animation => animation.effect?.target === node)

    return {
      fadeInRange: style.getPropertyValue('--jumi-fade-in-animation-range').trim(),
      fadeOutRange: style.getPropertyValue('--jumi-fade-out-animation-range').trim(),
      list: style.getPropertyValue('animation-range').trim(),
      revealRange: style.getPropertyValue('--jumi-reveal-animation-range').trim(),
      running: animations.map(animation => ({
        name: animation.animationName,
        progress: animation.effect.getComputedTiming().progress,
        timeline: animation.timeline?.constructor?.name ?? null,
      })),
    }
  }

  window.__scroll = (share) => {
    document.documentElement.scrollTop = Math.round(share * (document.documentElement.scrollHeight - innerHeight))
  }

  window.__ready = true
</script>
</body></html>`

const server = createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  response.end(page)
}).listen(0)

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { height: 700, width: 1000 },
})
const tab = await context.newPage()

await tab.goto(`http://127.0.0.1:${server.address().port}`)
await tab.waitForFunction(() => window.__ready === true)

const at = async share => {
  await tab.evaluate(value => window.__scroll(value), share)
  await tab.evaluate(
    () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )

  return tab.evaluate(() => ({
    arbitrary: window.__read('arbitrary'),
    control: window.__read('control'),
    poisoned: window.__read('poisoned'),
    ranged: window.__read('ranged'),
  }))
}

const round = value => (value == null ? '—' : Math.round(value * 100) / 100)

console.log(`\n${'─'.repeat(72)}\n4 · measured in a browser\n${'─'.repeat(72)}`)

const readings = []

for (const share of [0, 0.25, 0.5, 0.75, 1]) readings.push(await at(share))

for (const [index, share] of [0, 0.25, 0.5, 0.75, 1].entries()) {
  const reading = readings[index]
  const names = reading.ranged.running.map(
    animation => `${animation.name}=${round(animation.progress)}`,
  )

  console.log(
    `  at ${String(share).padEnd(5)} ranged: ${names.join(' ').padEnd(46)} control: ${reading.control.running.map(animation => `${animation.name}=${round(animation.progress)}`).join(' ')}`,
  )
}

console.log(
  `\n  published ranges — ranged: ${readings[2].ranged.fadeInRange || '(none)'} / ${readings[2].ranged.fadeOutRange || '(none)'}`,
)
console.log(
  `  published ranges — arbitrary: ${readings[2].arbitrary.fadeInRange || '(none)'}`,
)
console.log(`  computed animation-range — ranged: ${readings[2].ranged.list}`)
console.log(`  computed animation-range — control: ${readings[2].control.list}`)
console.log(
  `  computed animation-range — poisoned (entry beside nonsense): ${readings[2].poisoned.list}`,
)
console.log(
  `  poisoned, per slot: fade-in ${readings[2].poisoned.fadeInRange || '(none)'} · fade-out ${readings[2].poisoned.fadeOutRange || '(none)'}`,
)

await browser.close()
server.close()
