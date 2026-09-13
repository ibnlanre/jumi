#!/usr/bin/env node
/**
 * CDP style-cost spike — what does the aggregate cost the *tooling*, not the renderer?
 *
 * The page renders 228 effects happily; opening Inspector on one of them is a different workload.
 * DevTools does not ask "does this element animate" — it asks the renderer for the matched rules,
 * the computed styles, and the matched keyframes, then serialises all of it across the protocol and
 * builds a DOM out of it in the frontend process.
 *
 * The prior investigation (`engineering/architecture/aggregate-representation.md`) measured the
 * *renderer's* cost and concluded the dominant expense is the number of aggregate positions an
 * animating element resolves. That verdict says nothing about this one, and this spike measures it
 * the same way: by asking the protocol, not by watching the Inspector.
 *
 * For each slot count it builds the real emission with `compiler()` + `build()`, then measures
 * `CSS.getMatchedStylesForNode` and `CSS.getComputedStyleForNode` on one animated element, and
 * splits the matched response into its parts — selector text, declaration bodies, custom-property
 * declarations, keyframes — so that "what is big" and "what is slow" can be attributed separately.
 *
 * Variants isolate one part at a time:
 *
 *   jumi                the real emission
 *   inert               a plain element on the same page — no matching rule, no animation
 *   no-declarations     the composition rule's longhands deleted, its selector list kept
 *   small-selectors     the composition rule's selector list cut to one, its longhands kept
 *   native              the same shape written literally: N rules, no custom properties
 *
 * Run: pnpm spike:cdp-cost
 *
 * RESULT — see `engineering/research/style-cost.md`. Measured, Chromium 153.0.8010.12, 2026-09-13.
 */
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { collapseGiant, shallowOf } from './lib/aggregate.mjs'
import { PARTS, splitTopLevel } from './lib/css.mjs'

import path from 'node:path'
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const args = process.argv.slice(2).filter(argument => !argument.startsWith('--'))
const serveArg = process.argv.slice(2).find(argument => argument === '--serve' || argument.startsWith('--serve='))
const serve = Boolean(serveArg)
const serveVariant = serveArg?.includes('=') ? serveArg.split('=')[1] : 'jumi'
const portArg = process.argv.slice(2).find(argument => argument.startsWith('--port='))
const servePort = portArg ? Number(portArg.split('=')[1]) : 8788
const SLOTS = args[0] ? args[0].split(',').map(Number) : [10, 25, 50, 100, 150, 228]
const RUNS = 15

const TARGET_CLASSES = ['animate-rotate-45', 'animate-scale-110', 'animate-opacity-50']

console.log('· bundling')
execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

// After bundling: the helper loads the finalizer out of `dist/`.
const { build, compiler } = await import('./lib/compile.mjs')

/** N distinct slots, cheaply: each arbitrary rotate value is its own slot. */
const candidates = (n, extra = []) => [
  ...TARGET_CLASSES,
  ...extra,
  'animation-duration-500',
  ...Array.from({ length: n }, (_, i) => `animate-rotate-[${i + 1}deg]`),
]

const entry = (candidate, base) => `@plugin "${path.join(base, 'dist/index.js')}";`

const compile = async (n, extra = []) => {
  const css = ['@import "tailwindcss" source(none);', `@plugin "${path.join(root, 'dist', 'index.js')}";`, ''].join('\n')
  const instance = await compiler(css, root)

  // `build()` returns the finalized result, not a string: `.css` is the finished stylesheet.
  return build(instance, candidates(n, extra)).css
}

/* ------------------------------------------------------------------ CSS surgery */

const isAggregate = decl => PARTS.includes(decl.prop) && decl.value.includes('--jumi-')

const parse = css => postcss.parse(css)

/**
 * The composition rule: the one carrying the aggregate. Found by shape, because the transport is
 * erased at build time and there is no marker left to look for. Where several qualify the widest
 * selector list wins — that is the rule DevTools has to render, and the one being measured.
 *
 * Parsing rather than pattern-matching, for the reason `finalize` was moved onto an AST in the
 * first place: `[^{}]*` is only true of the constructs that happen to be in the corpus.
 */
const compositionOf = (sheet) => {
  let best = null

  sheet.walkRules((rule) => {
    if (!rule.nodes?.some(node => node.type === 'decl' && isAggregate(node))) return

    if (!best || rule.selector.length > best.selector.length) best = rule
  })

  return best
}

const entriesOf = (rule, prop) => {
  const decl = rule.nodes.find(node => node.type === 'decl' && node.prop === prop)

  return decl ? splitTopLevel(decl.value) : []
}

/* ------------------------------------------------------------------ variants */

/**
 * The hoisted shape lives in `lib/aggregate.mjs`, not here.
 *
 * The same representation is priced twice — once through the protocol by this spike, once through
 * the renderer by `spike-recalc` — and two hand-built copies of it would eventually disagree, which
 * would read as a measurement rather than as a mistake. The lib returns the stylesheet; the element
 * classes stay here, because a representation that carried them would tie the number to one
 * harness's fixture.
 */
const hoisted = mode => css => ({ classes: TARGET_CLASSES, css: shallowOf(css, mode) })

/**
 * Rewrite the giant list as a single complex selector.
 *
 * `:where(.a, .b, …)` and `:is(.a, .b, …)` each count as **one** selector in
 * `CSSRule.selectorList.selectors`, so the per-selector `range` and `specificity` — which are what
 * make the metadata 9× the selector text — collapse to a single entry, while the matching set is
 * unchanged. This is what a shippable selector reduction has to look like.
 */
const wrapGiant = (sheet, fn) => {
  const giant = compositionOf(sheet).selector

  sheet.walkRules((rule) => {
    if (rule.selector === giant) rule.selector = `:${fn}(${giant})`
  })

  return sheet
}

const VARIANTS = {
  'is-selectors': css => ({ classes: TARGET_CLASSES, css: wrapGiant(parse(css), 'is').toString() }),

  /** The real emission. */
  'jumi': css => ({ classes: TARGET_CLASSES, css }),

  /**
   * The same work written literally: N rules each carrying one animation, and the target carrying
   * three. No custom properties anywhere, so there is nothing to chain and nothing to enumerate.
   * The real stylesheet is appended afterwards so the page carries the same weight — the target
   * simply cannot match it, because it carries no classes.
   */
  'native': (css) => {
    const n = entriesOf(compositionOf(parse(css)), 'animation-name').length

    const rule = i => `.nat-${i} { animation: nat-${i} 1s linear 0s 1 normal forwards running; }`
    const frames = i => `@keyframes nat-${i} { from { opacity: 0 } to { opacity: 1 } }`

    return {
      classes: [],
      css: [
        '#target { animation: nat-a 1s linear 0s 1 normal forwards running, nat-b 2s ease 0s infinite alternate both paused, nat-c 500ms ease-in 0s 1 normal none running; }',
        Array.from({ length: n }, (_, i) => rule(i + 1)).join('\n'),
        Array.from({ length: n }, (_, i) => frames(i + 1)).join('\n'),
        '@keyframes nat-a { from { opacity: 0 } to { opacity: 1 } }',
        '@keyframes nat-b { from { transform: scale(1) } to { transform: scale(2) } }',
        '@keyframes nat-c { from { background: red } to { background: blue } }',
        css,
      ].join('\n'),
    }
  },

  /**
   * The composition rule's longhands deleted, everything else identical. Isolates the *declaration
   * payload* — the selector list DevTools still has to render is untouched.
   */
  'no-declarations': (css) => {
    const sheet = parse(css)

    compositionOf(sheet).walkDecls((decl) => {
      if (PARTS.includes(decl.prop)) decl.remove()
    })

    return { classes: TARGET_CLASSES, css: sheet.toString() }
  },

  'shallow+is-selectors': css => ({
    classes: TARGET_CLASSES,
    css: wrapGiant(parse(shallowOf(css, 'shorthand')), 'is').toString(),
  }),

  /**
   * Both levers at once. The selector share was measured against a 705 KB declaration payload; once
   * the hoist takes that to 182 KB the selector metadata is a much larger fraction of what is left,
   * so the two are priced together rather than added.
   */
  'shallow+small-selectors': css => ({
    classes: TARGET_CLASSES,
    css: collapseGiant(parse(shallowOf(css, 'shorthand'))).toString(),
  }),

  /** Hoisted, carried by the ten longhands — no shorthand parsing in the path. */
  'shallow-longhand': hoisted('longhand'),

  /** Hoisted, carried by the `animation` shorthand. */
  'shallow-shorthand': hoisted('shorthand'),

  /**
   * The same *number* of selectors, spelled short.
   *
   * `:is()` keeps all 231 selectors and bought 12% against the hoist alone; the `#target` bound has
   * one selector and bought 93%. Those two differ in **two** ways — how many selectors the list holds,
   * and how much text they occupy (13 KB of escaped utility names against 7 characters) — so neither
   * answers what a shippable reduction has to change.
   *
   * This variant changes only the text. The list still holds one selector per slot, it is still a
   * class list rather than an id, and the matching set is preserved by giving the target three of the
   * new addresses. If the stall tracks the selector *count*, this changes nothing; if it tracks the
   * *text*, this alone should recover most of the bound.
   */
  'short-addresses': (css) => {
    const sheet = parse(css)
    const giant = compositionOf(sheet).selector
    const addresses = Array.from({ length: giant.split(',').length }, (_, i) => `.j${i}`).join(', ')

    sheet.walkRules((rule) => {
      if (rule.selector === giant) rule.selector = addresses
    })

    return { classes: [...TARGET_CLASSES, 'j0', 'j1', 'j2'], css: sheet.toString() }
  },

  /**
   * Every rule carrying the giant selector list, cut to one selector. Isolates the *selector text*,
   * which at 228 slots is one list of every activating utility in the stylesheet — emitted on more
   * than one rule. Collapsing only the composition rule understates it, because the substrate rule
   * lists the same utilities and its selector metadata stays in the response.
   */
  'small-selectors': css => ({ classes: TARGET_CLASSES, css: collapseGiant(parse(css)).toString() }),

  /**
   * The two realizable selector reductions.
   *
   * `small-selectors` above is a **bound, not a design**: it rewrites the list to `#target`, which is
   * how much the selector metadata could ever cost and is not something Jumi could ship. These keep
   * the matching set identical and change only how the list is written.
   *
   * They are not interchangeable, and neither is free. The current list applies *each selector's own*
   * specificity; `:where()` matches with zero specificity and `:is()` with the highest among its
   * arguments. Both are therefore cascade-relevant, and the parity check is what decides whether
   * either is usable rather than merely smaller.
   */
  'where-selectors': css => ({ classes: TARGET_CLASSES, css: wrapGiant(parse(css), 'where').toString() }),
}

/* ------------------------------------------------------------------ serving */

const pages = classes => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>cdp cost</title><link rel="stylesheet" href="/sheet.css"></head>
<body>
  <div id="target" class="${classes.join(' ')}"></div>
  <div id="plain"></div>
</body>
</html>`

let current = { css: '', html: pages(TARGET_CLASSES) }

/**
 * The page a human inspects, which is deliberately not the page the sweep measures.
 *
 * A real effects catalogue is 228 animating elements, not one, and the freeze was reported on the
 * catalogue — so the served page carries the whole slot set plus the measurement's own target. The
 * extra elements cannot change what `#target` matches, but keeping them out of the sweep's page
 * means every recorded number stays attributable to the page it was measured on.
 */
const inspection = (classes, slots) => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>inspection</title><link rel="stylesheet" href="/sheet.css"></head>
<body>
${Array.from({ length: slots }, (_, i) => `  <div class="animate-rotate-[${i + 1}deg]"></div>`).join('\n')}
  <div id="target" class="${classes.join(' ')}"></div>
  <div id="plain"></div>
</body>
</html>`

const server = createServer((request, response) => {
  if (request.url === '/' || request.url === '/sheet.css') {
    const html = request.url === '/'

    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': html ? 'text/html' : 'text/css',
    }).end(html ? current.html : current.css)

    return
  }

  response.writeHead(404).end('no fixture')
})

await new Promise(resolve => server.listen(serve ? servePort : 0, '127.0.0.1', resolve))

const base = `http://127.0.0.1:${server.address().port}`

/**
 * Park the emission on a fixed port so the one claim this harness cannot make can be checked by
 * hand.
 *
 * Everything here measures the *protocol*: bytes and round-trip latency. Whether Inspector visibly
 * stalls is a property of the DevTools frontend process, which nothing in this repository can
 * observe. `--serve` exists so that the human-visible half is one command and a page rather than a
 * paragraph of instructions.
 */
if (serve) {
  const slots = args[0] ? Number(args[0]) : 228
  const css = await compile(slots)
  const variant = (VARIANTS[serveVariant] ?? VARIANTS.jumi)(css)

  current = { css: variant.css, html: inspection(variant.classes, slots) }

  console.log(`\nserving [${serveVariant}] — ${slots} slots, ${Buffer.byteLength(variant.css)} bytes of CSS`)
  console.log(`   page   ${base}/`)
  console.log(`   sheet  ${base}/sheet.css`)
  console.log('Select #target in the Elements panel and watch what Inspector does.')
  console.log('Ctrl-C to stop.\n')

  await new Promise(() => {})
}

/* ------------------------------------------------------------------ measuring */

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { height: 600, width: 900 } })
const page = await context.newPage()
const session = await context.newCDPSession(page)

await session.send('DOM.enable')
await session.send('CSS.enable')
await session.send('Page.enable')

const timed = async (nodeId, method) => {
  const first = await session.send(method, { nodeId })
  const bytes = Buffer.byteLength(JSON.stringify(first))
  const samples = []

  for (let i = 0; i < RUNS; i++) {
    const start = performance.now()

    await session.send(method, { nodeId })
    samples.push(performance.now() - start)
  }

  samples.sort((a, b) => a - b)

  return { bytes, median: samples[Math.floor(samples.length / 2)], result: first }
}

/**
 * Split the matched-styles response into what actually has to cross the protocol.
 *
 * `declarationBytes` is the *text* a human would read, and it is nowhere near the whole payload:
 * every property also carries a `parsedValue`, the protocol's own tree for that value, and ten
 * nested `var()` lists are ten deep trees. `parsedValueBytes` measures that, and the gap between the
 * two is the difference between "what the rule says" and "what the protocol sends".
 */
const decompose = (result) => {
  const out = {
    cssTextBytes: 0,
    customBytes: 0,
    declarationBytes: 0,
    declarations: 0,
    entryBytes: 0,
    inheritedBytes: 0,
    keyframeBytes: 0,
    keyframes: 0,
    parsedValueBytes: 0,
    propertyOverheadBytes: 0,
    pseudoBytes: 0,
    ruleBytes: 0,
    rules: 0,
    selectorBytes: 0,
    selectorListBytes: 0,
    styleBytes: 0,
  }

  for (const entry of result.matchedCSSRules ?? []) {
    out.rules += 1
    out.selectorBytes += (entry.rule?.selectorList?.text ?? '').length
    out.ruleBytes += Buffer.byteLength(JSON.stringify(entry.rule))
    out.entryBytes = (out.entryBytes ?? 0) + Buffer.byteLength(JSON.stringify(entry))
    out.styleBytes = (out.styleBytes ?? 0) + Buffer.byteLength(JSON.stringify(entry.rule?.style ?? {}))
    out.cssTextBytes = (out.cssTextBytes ?? 0) + (entry.rule?.style?.cssText?.length ?? 0)
    out.selectorListBytes = (out.selectorListBytes ?? 0) + Buffer.byteLength(JSON.stringify(entry.rule?.selectorList ?? {}))

    for (const property of entry.rule?.style?.cssProperties ?? []) {
      const size = property.name.length + (property.value ?? '').length

      out.declarations += 1
      out.declarationBytes += size

      // `text` duplicates name + value, and `range` is four numbers per property. Both are paid for
      // on the wire for every one of the ten lists.
      out.propertyOverheadBytes = (out.propertyOverheadBytes ?? 0) + Buffer.byteLength(JSON.stringify(property)) - size

      if (property.name.startsWith('--')) out.customBytes += size
      if (property.parsedValue) out.parsedValueBytes += Buffer.byteLength(JSON.stringify(property.parsedValue))
    }
  }

  for (const keyframe of result.cssKeyframesRules ?? []) {
    out.keyframes += 1
    out.keyframeBytes += Buffer.byteLength(JSON.stringify(keyframe))
  }

  for (const entry of result.inherited ?? []) out.inheritedBytes += Buffer.byteLength(JSON.stringify(entry))
  for (const entry of result.pseudoElements ?? []) out.pseudoBytes += Buffer.byteLength(JSON.stringify(entry))

  return out
}

/** Bytes per top-level field of the response, so that nothing is left over as "the rest". */
const fieldsOf = result => Object.fromEntries(
  Object.entries(result).map(([key, value]) => [key, Buffer.byteLength(JSON.stringify(value))]),
)

const computedAnimation = (result) => {
  const values = Object.fromEntries(result.computedStyle.map(property => [property.name, property.value]))
  const lengths = {}

  for (const part of PARTS) {
    if (values[part] !== undefined) lengths[part] = values[part].length
  }

  return { animationLengths: lengths, bytes: Buffer.byteLength(JSON.stringify(result)), properties: result.computedStyle.length }
}

const measure = async (selector) => {
  const { root: document } = await session.send('DOM.getDocument', { depth: 0 })
  const { nodeId } = await session.send('DOM.querySelector', { nodeId: document.nodeId, selector })

  // Warm-up: the first call in a fresh renderer pays for style recalculation, which is a different
  // cost from serialising the answer.
  await session.send('CSS.getMatchedStylesForNode', { nodeId })
  await session.send('CSS.getComputedStyleForNode', { nodeId })

  const matched = await timed(nodeId, 'CSS.getMatchedStylesForNode')
  const computed = await timed(nodeId, 'CSS.getComputedStyleForNode')

  return { computed, matched }
}

const report = []

for (const slots of SLOTS) {
  const css = await compile(slots)
  const rule = compositionOf(parse(css))
  const entries = entriesOf(rule, 'animation-name')

  if (entries.length < slots) throw new Error(`aggregate has ${entries.length} entries for ${slots} requested slots`)

  console.log(`\n══ ${slots} requested — aggregate carries ${entries.length} entries across `
    + `${rule.selector.split(',').length} selectors, ${rule.toString().length} rule bytes`)

  for (const [name, transform] of Object.entries(VARIANTS)) {
    const variant = transform(css)

    current = { css: variant.css, html: pages(variant.classes) }

    await page.goto(`${base}/`)

    const target = await measure('#target')
    const inert = await measure('#plain')
    const computed = computedAnimation(target.computed.result)

    // A representation that shrinks the payload but stops animating is not a representation, and
    // one that animates *differently* is worse. Read the resolved values off the element and keep
    // the positions that are actually live, so two representations can be compared slot for slot.
    const behaviour = await page.evaluate(() => {
      const element = document.querySelector('#target')
      const style = getComputedStyle(element)
      const list = property => style[property].split(',').map(part => part.trim())
      const names = list('animationName')
      const durations = list('animationDuration')
      const timing = list('animationTimingFunction')
      const fills = list('animationFillMode')
      const live = names.map((name, i) => ({ duration: durations[i], fill: fills[i], i, name, timing: timing[i] }))

      return {
        // The known divergence between the two representations, measured rather than inherited: in
        // `jumi` every position reads the shared attribute-scoped control, so an inactive position
        // still carries the global duration; hoisted, an inactive position falls back to a literal
        // and reads the property's initial value instead. Distinct value count exposes it without
        // needing a control on the page.
        durationDistinct: [...new Set(durations)],
        entries: names.length,
        live: live.filter(entry => entry.name !== 'none'),
        running: element.getAnimations().length,
      }
    })

    const row = {
      computedBytes: computed.bytes,
      computedMs: Math.round(target.computed.median * 10) / 10,
      computedProperties: computed.properties,
      entries: entries.length,
      inertComputedBytes: computedAnimation(inert.computed.result).bytes,
      inertComputedMs: Math.round(inert.computed.median * 10) / 10,
      inertMatchedBytes: inert.matched.bytes,
      inertMatchedMs: Math.round(inert.matched.median * 10) / 10,
      matchedBytes: target.matched.bytes,
      matchedMs: Math.round(target.matched.median * 10) / 10,
      selectors: rule.selector.split(',').length,
      slots,
      variant: name,
      ...decompose(target.matched.result),
      animationLengths: computed.animationLengths,
      behaviour,
      fields: fieldsOf(target.matched.result),
    }

    report.push(row)

    console.log(`   ${name.padEnd(17)} matched ${String(row.matchedBytes).padStart(9)} B ${String(row.matchedMs).padStart(7)} ms`
      + `   computed ${String(row.computedBytes).padStart(7)} B ${String(row.computedMs).padStart(6)} ms`
      + `   [sel ${row.selectorBytes} text ${row.declarationBytes} parsed ${row.parsedValueBytes}]`
      + `   live ${row.behaviour.live.length}/${row.behaviour.entries} running ${row.behaviour.running}`)
  }

  const last = report[report.length - 1]

  console.log(`   ${'inert'.padEnd(16)} matched ${String(last.inertMatchedBytes).padStart(9)} B `
    + `${String(last.inertMatchedMs).padStart(7)} ms   computed ${String(last.inertComputedBytes).padStart(7)} B `
    + `${String(last.inertComputedMs).padStart(6)} ms`)
}

/* ------------------------------------------------------------------ active-slot parity */

/**
 * The one semantic unknown the earlier investigation left open.
 *
 * A *label-scoped* control writes `--jumi-<label>-<part>` — the same shape a hoisted per-slot chain
 * has to coexist with — and the earlier fixture activated a slot whose control never reached it, so
 * it settled nothing in either direction. This fixture makes the control reach the slot on purpose,
 * asserts that it did (so a fixture that stops reaching it fails rather than passing quietly), and
 * then diffs **all ten longhands** on every live position rather than the four the sweep checks.
 */
const LABEL_CLASSES = [
  'animate-rotate-[0:0deg|20:-8deg|100:-8deg]/[flick]',
  'animation-duration-500/[flick]',
  'animation-timing-function-linear/[flick]',
  'animate-scale-110',
  'animation-delay-150/scale',
]

const readLive = () => page.evaluate(({ parts }) => {
  const style = getComputedStyle(document.querySelector('#target'))
  const list = property => style.getPropertyValue(property).split(',').map(part => part.trim())
  const lists = Object.fromEntries(parts.map(part => [part, list(part)]))

  return lists['animation-name']
    .map((name, i) => ({ name, values: Object.fromEntries(parts.map(part => [part, lists[part][i] ?? null])) }))
    .filter(entry => entry.name !== 'none')
}, { parts: PARTS })

const paritySlots = 25
const parityCss = await compile(paritySlots, LABEL_CLASSES)
const parity = {}

for (const name of ['jumi', 'shallow-shorthand']) {
  const variant = VARIANTS[name](parityCss)

  current = { css: variant.css, html: pages(LABEL_CLASSES) }

  await page.goto(`${base}/`)

  parity[name] = await readLive()
}

console.log(`\n── active-slot parity — label-scoped control, ${paritySlots} slots`)
console.log(`   live positions: jumi ${parity.jumi.length}, shallow-shorthand ${parity['shallow-shorthand'].length}`)

// Before blaming the representation, check that the fixture compiled at all: a control that never
// emitted a variable would make the parity check pass for the wrong reason.
const labelVars = [...new Set(parityCss.match(/--jumi-flick-[a-z-]+/g) ?? [])]
// Slot hashes are mixed case, so a `[a-z0-9]+` character class silently finds nothing and would read
// as "the label marker is missing" — the opposite of the truth.
const markers = [...new Set(parityCss.match(/--jumi-[A-Za-z0-9-]+-label/g) ?? [])]

console.log(`   --jumi-flick-* variables emitted: ${labelVars.length ? labelVars.join(', ') : 'NONE'}`)
console.log(`   slot label markers emitted: ${markers.length ? markers.join(', ') : 'NONE'}`)

const toSeconds = value => (String(value).endsWith('ms') ? Number.parseFloat(value) / 1000 : Number.parseFloat(value))

// `500ms` is serialised by `getComputedStyle` as `0.5s`, so comparing against the authored text
// reports "the control never reached the slot" when it did. Normalise before asserting.
const controlled = parity.jumi.find(entry => toSeconds(entry.values['animation-duration'] ?? '0s') === 0.5)

// If the control variable is set on the element and the position still does not read it, the fault
// is in the chain rather than the fixture — and those are very different findings.
const flick = await page.evaluate(() => {
  const element = document.querySelector('#target')
  const style = getComputedStyle(element)
  const read = name => style.getPropertyValue(name).trim() || null

  return {
    classes: element.className.split(' ').length,
    control: read('--jumi-flick-animation-duration'),
    global: read('--jumi-animation-duration'),
    label: read('--jumi-rotate-Z2excak-label'),
    slotName: read('--jumi-rotate-Z2excak-animation-name'),
  }
})

console.log(`   on the element: control=${flick.control} label=${flick.label} slot=${flick.slotName} global=${flick.global}`)

// The position is what matters, not the variable name: the duration chain for a labelled slot is
// label → attribute → global, so it need not mention the slot hash at all. Read the entry at the
// *same index* as the activation, which is the only place the two lists can be compared.
const composed = compositionOf(parse(parityCss))
const nameEntries = entriesOf(composed, 'animation-name')
const slotIndex = nameEntries.findIndex(entry => entry.includes('Z2excak'))

console.log(`   slot at index ${slotIndex}:`)
console.log(`      name     ${nameEntries[slotIndex] ?? '—'}`)

for (const part of ['animation-duration', 'animation-timing-function', 'animation-fill-mode']) {
  console.log(`      ${part.slice(10).padEnd(8)} ${entriesOf(composed, part)[slotIndex] ?? '—'}`)
}

console.log(`   label-scoped control reached its slot: ${controlled ? `yes — ${controlled.name}` : 'NO — the fixture proves nothing'}`)
console.log(`   ten longhands at that position:`)

for (const part of PARTS) {
  const mine = controlled?.values[part]
  const theirs = parity['shallow-shorthand'].find(entry => entry.name === controlled?.name)?.values[part]

  console.log(`      ${part.padEnd(28)} ${String(mine ?? '—').padEnd(28)} ${mine === theirs ? 'identical' : `DIFFERS → ${theirs}`}`)
}

console.log(`   every live position, all ten longhands:`)

for (const entry of parity.jumi) {
  const other = parity['shallow-shorthand'].find(candidate => candidate.name === entry.name)
  const differing = other ? PARTS.filter(part => entry.values[part] !== other.values[part]) : ['position absent']

  console.log(`      ${entry.name.padEnd(28)} ${differing.length === 0 ? 'identical' : `DIFFERS: ${differing.join(', ')}`}`)
}

await browser.close()
server.close()

/* ------------------------------------------------------------------ summary */

console.log(`\n${'─'.repeat(96)}`)

const names = Object.keys(VARIANTS)

const table = (title, pick) => {
  console.log(`\n${title}`)
  console.log(`${'slots'.padStart(6)} | ${names.map(name => name.padStart(15)).join(' | ')}`)

  for (const slots of SLOTS) {
    const cells = names.map((name) => {
      const row = report.find(entry => entry.slots === slots && entry.variant === name)

      return String(pick(row)).padStart(15)
    })

    console.log(`${String(slots).padStart(6)} | ${cells.join(' | ')}`)
  }
}

table('matched-styles response, bytes', row => row.matchedBytes)
table('matched-styles response, ms (median of 15)', row => row.matchedMs)
table('computed-style response, bytes', row => row.computedBytes)
table('computed-style response, ms (median of 15)', row => row.computedMs)
table('matched: declaration TEXT bytes', row => row.declarationBytes)
table('matched: parsedValue TREE bytes', row => row.parsedValueBytes)
table('matched: selector text bytes', row => row.selectorBytes)
table('matched: keyframes bytes', row => row.keyframeBytes)
table('computed animation-name length, chars', row => row.animationLengths['animation-name'] ?? 0)
table('matched: cssProperties returned', row => row.declarations)
table('computed: properties returned', row => row.computedProperties)
table('resolved positions on #target, live/total', row => `${row.behaviour.live.length}/${row.behaviour.entries}`)
table('running animations on #target', row => row.behaviour.running)

console.log(`\nparity of live positions against jumi, at ${SLOTS[SLOTS.length - 1]} slots`)
const reference = report.find(entry => entry.slots === SLOTS[SLOTS.length - 1] && entry.variant === 'jumi').behaviour.live

for (const name of names) {
  const row = report.find(entry => entry.slots === SLOTS[SLOTS.length - 1] && entry.variant === name)
  const same = JSON.stringify(row.behaviour.live) === JSON.stringify(reference)

  console.log(`   ${name.padEnd(17)} ${same ? 'identical to jumi' : 'DIFFERS'}`
    + `${same ? '' : ` — ${JSON.stringify(row.behaviour.live)}`}`)
  console.log(`   ${''.padEnd(17)} durations across all positions: ${JSON.stringify(row.behaviour.durationDistinct)}`)
}

console.log(`\nresponse fields at ${SLOTS[SLOTS.length - 1]} slots`)
for (const name of names) {
  const row = report.find(entry => entry.slots === SLOTS[SLOTS.length - 1] && entry.variant === name)

  console.log(`   ${name.padEnd(17)} ${JSON.stringify(row.fields)}`)
}

console.log(`\nwhere matchedCSSRules goes, at ${SLOTS[SLOTS.length - 1]} slots (bytes)`)
console.log(`${'variant'.padEnd(17)} ${'total'.padStart(9)} ${'rule.style'.padStart(11)} ${'cssText'.padStart(9)} ${'declText'.padStart(9)} ${'propOverhead'.padStart(13)} ${'selectorList'.padStart(13)} ${'selText'.padStart(8)}`)

for (const name of names) {
  const row = report.find(entry => entry.slots === SLOTS[SLOTS.length - 1] && entry.variant === name)

  console.log(`${name.padEnd(17)} ${String(row.matchedBytes).padStart(9)} ${String(row.styleBytes).padStart(11)} `
    + `${String(row.cssTextBytes).padStart(9)} ${String(row.declarationBytes).padStart(9)} ${String(row.propertyOverheadBytes).padStart(13)} `
    + `${String(row.selectorListBytes).padStart(13)} ${String(row.selectorBytes).padStart(8)}`)
}
