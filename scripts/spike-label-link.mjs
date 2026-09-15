#!/usr/bin/env node
/**
 * Probe: can the per-instance **link** go away?
 *
 * Today a named instance owns a hoist, ten fills and ten registrations:
 *
 *   .animate-fade-in\/reveal {
 *     --jumi-fade-in-animation-name: jumi-fade-in;
 *     --jumi-fade-in-label: reveal;                              ← which motion this is
 *     --jumi-slot-fade-in: … var(--jumi-slot-fade-in-animation-duration, …) …;
 *     --jumi-slot-fade-in-animation-duration: var(--jumi-label-reveal-animation-duration);   ×10
 *   }
 *
 * Note the slot key is **definition-only** — `--jumi-slot-fade-in` — so the fills are the only place the
 * author's word is bound to a part. The proposal is to bind it in the hoist instead and delete the fills:
 *
 *   --jumi-slot-fade-in: … var(--jumi-label-reveal-animation-duration, …) …;
 *
 * The risk being measured is the one that produced the fills: the word reaching the composition's chains. That
 * was nondeterministic *before* motion-instance identity existed, because one position per property had to
 * carry one word for the whole stylesheet — hence the both-orders run below.
 *
 * The simulation rewrites the compiled CSS with PostCSS (the same AST the finalizer walks) and measures both
 * models in a real browser. No production code is touched.
 *
 * Run: `pnpm spike:label-link`. Requires a bundle first, since the plugin under test is `dist/index.js`.
 */
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'

import postcss from 'postcss'

/** The naming arms from `behaviour:check`, so the readings are comparable with the shipped assertions. */
const ARMS = [
  [
    'a',
    'animate-fade-in/reveal animation-duration-300/reveal animation-duration-900/loop',
  ],
  ['b', 'animate-fade-in/loop animation-duration-700/loop'],
  [
    'c',
    'animate-fade-in/reveal animate-scale-110/loop animation-duration-900/loop',
  ],
  [
    'd',
    'animate-fade-in animation-duration-900/loop animation-duration-500/elsewhere',
  ],
  [
    'e',
    'animate-opacity-[0:0|100:1]/enter animate-rotate-[0:0deg|100:90deg]/enter animation-duration-500/enter animate-scale-[0:1|100:2]',
  ],
  [
    'f',
    'animate-rotate-45/scale animate-scale-110 animation-duration-1000/scale animation-duration-400/rotate',
  ],
]

const CANDIDATES = [
  ...new Set(
    ARMS.flatMap(([, classes]) => classes.split(/\s+/).filter(Boolean)),
  ),
]

const ENTRY = '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";'

const declarationsOf = rule =>
  (rule.nodes ?? []).filter(node => node.type === 'decl')

/**
 * Model B, simulated: the hoist reads the label variables, and the middle layer is removed.
 *
 * Read off the emitted CSS rather than assumed:
 *
 *   .animate-fade-in\/reveal {
 *     --jumi-fade-in-animation-name: jumi-fade-in;
 *     --jumi-fade-in-label: reveal;                                          ← the word, on this rule only
 *     --jumi-slot-fade-in: var(--jumi-fade-in-animation-name, …) var(--jumi-slot-fade-in-animation-duration, …) …;
 *     --jumi-slot-fade-in-animation-duration: var(--jumi-label-reveal-animation-duration);   ×10 fills
 *   }
 *
 * The slot key is definition-only (`--jumi-slot-fade-in`), so removing the fills means the hoist has to name
 * its own instance directly — `var(--jumi-label-reveal-animation-duration, …)`.
 *
 * The rewrite is **rule-scoped on purpose**. A textual one pass per instance would double-apply: two instances
 * of one definition share the slot key, so a global rewrite of `--jumi-slot-fade-in-<part>` mangles the second
 * rule with the first rule's word. Real emission is per-rule too (each activation rule declares its own hoist),
 * so the scoped rewrite is the faithful model, not a convenience.
 */
const withoutLink = css => {
  const document = postcss.parse(css)
  const links = []
  const registrations = []
  const slots = new Map()

  document.walkRules(rule => {
    const own = declarationsOf(rule)
    const label = own.find(node => /^--jumi-[\w-]+-label$/.test(node.prop))
    const activation = own.find(node =>
      /^--jumi-[\w-]+-animation-name$/.test(node.prop),
    )

    if (!label || !activation) return

    const name = label.value.trim()
    const definition = label.prop.slice('--jumi-'.length, -'-label'.length)
    const hoist = `--jumi-slot-${definition}`

    slots.set(definition, [...(slots.get(definition) ?? []), { name, rule }])

    // The fills, and the parts they were binding — the word is the one on this rule.
    for (const node of [...own]) {
      if (!node.prop.startsWith(`${hoist}-`)) continue

      const part = node.prop.slice(hoist.length + 1)

      links.push({ bytes: node.toString().length + 2, prop: node.prop })
      node.remove()

      const carrier = own.find(other => other.prop === hoist)

      if (carrier)
        carrier.value = carrier.value.replaceAll(
          `${hoist}-${part}`,
          `--jumi-label-${name}-${part}`,
        )
    }
  })

  // The parts the shorthand does not carry — `animation-range`, `-timeline`, `-composition` — are read by
  // their own composition rules, which are emitted per candidate and so name their instance in the selector.
  document.walkRules(rule => {
    for (const [definition, instances] of slots) {
      const word = rule.selector.match(/\/([\w-]+)$/)?.[1]
      const named = instances.some(({ name }) => name === word)

      if (!named) continue

      for (const node of declarationsOf(rule))
        if (node.value.includes(`--jumi-slot-${definition}-`))
          node.value = node.value.replaceAll(
            `--jumi-slot-${definition}-`,
            `--jumi-label-${word}-`,
          )
    }
  })

  for (const prop of new Set(links.map(({ prop }) => prop)))
    document.walkAtRules('property', atRule => {
      if (atRule.params.trim() !== prop) return

      registrations.push({
        bytes: atRule.toString().length + 1,
        prop: atRule.params.trim(),
      })
      atRule.remove()
    })

  return { css: document.toString(), links, registrations }
}

const browser = await chromium.launch()
const page = await browser.newPage()

const built = build(await compiler(ENTRY, root), CANDIDATES)
const proposed = withoutLink(built.css)

/**
 * Every live animation per arm, as `name@duration`, in position order.
 *
 * Position order rather than a map keyed by name: two positions may resolve the same keyframe, and a map
 * would silently keep only the last of them — which is how a duplicate position once read as a pass.
 */
const readings = async css => {
  await page.setContent(`<!doctype html>
<html><head><style>${css}</style></head>
<body>${ARMS.map(([id, classes]) => `<div id="arm-${id}" class="${classes}"></div>`).join('\n')}</body></html>`)

  return page.evaluate(
    ids =>
      Object.fromEntries(
        ids.map(id => {
          const style = getComputedStyle(document.getElementById(`arm-${id}`))
          const names = style.animationName
            .split(',')
            .map(value => value.trim())
          const durations = style.animationDuration
            .split(',')
            .map(value => value.trim())

          return [
            id,
            names.map((name, at) => `${name}@${durations[at] ?? '?'}`),
          ]
        }),
      ),
    ARMS.map(([id]) => id),
  )
}

console.log('══ can the per-instance link go away?\n')

const forward = {
  A: await readings(built.css),
  B: await readings(proposed.css),
}
const reversed = build(await compiler(ENTRY, root), [...CANDIDATES].reverse())
const backwards = {
  A: await readings(reversed.css),
  B: await readings(withoutLink(reversed.css).css),
}

const live = list => list.filter(entry => !entry.startsWith('none@'))
const show = list => live(list).join(', ') || '(nothing live)'

/**
 * The live animations, in position order, as a string.
 *
 * Position order, not a sorted bag: the historical failure held the same *set* of animations and only
 * swapped their order — `0.9s, 1s` in one candidate order, `1s, 0.9s` in the other — and with
 * `animation-fill-mode: forwards` the last one writes the property. A bag would call that identical.
 */
const order = list => JSON.stringify(live(list))

/** Whether the same animations run, and whether they sit in the same positions. */
const same = (one, two) => ({
  bag:
    JSON.stringify([...live(one)].sort()) ===
    JSON.stringify([...live(two)].sort()),
  order: order(one) === order(two),
  positions: JSON.stringify(one) === JSON.stringify(two),
})

console.log('── readings, per arm (model A today / model B without the link)\n')
for (const [id] of ARMS) {
  const here = same(forward.A[id], forward.B[id])
  const verdict = here.order
    ? here.positions
      ? 'identical'
      : 'same animations, unset positions moved'
    : here.bag
      ? 'DIFFERENT ORDER'
      : 'DIFFERENT ANIMATIONS'

  console.log(`   ${id}  ${verdict}`)
  console.log(`      A (today):    ${show(forward.A[id])}`)
  if (!here.order) console.log(`      B (no link):  ${show(forward.B[id])}`)
}

console.log('\n── the failure mode the middle layer was introduced for\n')

// Removed-vs-today first, because that is the question; order-sensitivity second, because a change there is
// only a regression if today's model does not already have it.
for (const [phase, [today, without]] of [
  ['as written', [forward.A, forward.B]],
  ['reversed', [backwards.A, backwards.B]],
]) {
  const differs = ARMS.filter(
    ([id]) => order(today[id]) !== order(without[id]),
  ).map(([id]) => id)

  console.log(
    `   removing the link, candidate order ${phase}: ${
      differs.length
        ? `reading changes on ${differs.join(', ')}`
        : 'no arm changes'
    }`,
  )
}

for (const model of ['A', 'B']) {
  const drift = ARMS.filter(
    ([id]) => order(forward[model][id]) !== order(backwards[model][id]),
  ).map(([id]) => id)

  console.log(
    `   reversing the order, model ${model}: ${
      drift.length ? `reading changes on ${drift.join(', ')}` : 'no arm changes'
    }`,
  )
}

console.log('\n── cost\n')

const references = css => {
  let total = 0

  postcss.parse(css).walkDecls(node => {
    total += node.value.split('--jumi-label-').length - 1
  })

  return total
}

const deleted = [...proposed.links, ...proposed.registrations].reduce(
  (total, { bytes }) => total + bytes,
  0,
)

console.log(
  `   the link layer is ${proposed.links.length} declarations in ${
    new Set(
      proposed.links.map(
        ({ prop }) =>
          prop.match(/^(--jumi-slot-[\w-]+?)-(?:animation|view|scroll)-/)?.[1],
      ),
    ).size
  } slots, plus ${proposed.registrations.length} registrations`,
)
console.log(
  `   removing it measures ${deleted} bytes of the emitted stylesheet`,
)

for (const [label, css] of [
  ['A (today)', built.css],
  ['B (no link)', proposed.css],
]) {
  console.log(
    `   ${label.padEnd(12)} ${String(css.length).padStart(7)} bytes   ` +
      `${String(new Set([...css.matchAll(/@property (--jumi-slot-[\w-]+)/g)].map(m => m[1])).size).padStart(3)} slot registrations   ` +
      `${String(references(css)).padStart(3)} label references`,
  )
}

await browser.close()

// Show the work: the first rewritten hoist should name its own instance, with no fill left to do it.
let shown = false

postcss.parse(proposed.css).walkRules(rule => {
  if (shown) return

  const own = declarationsOf(rule)
  const hoist = own.find(node => /^--jumi-slot-[\w-]+$/.test(node.prop))

  if (!hoist || !own.some(node => /^--jumi-[\w-]+-label$/.test(node.prop)))
    return

  const reads = [...hoist.value.matchAll(/--jumi-label-[\w-]+/g)].map(
    match => match[0],
  )

  console.log(`\n── shape\n\n   ${rule.selector}\n      ${hoist.prop} reads:`)
  for (const read of reads) console.log(`         ${read}`)

  shown = true
})
