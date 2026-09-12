#!/usr/bin/env node
/**
 * SPIKE — does a late, post-variant mutation of the carrier solve carrier locality?
 *
 * The source says a variant re-parents the utility *body* (`variants.ts:359`), so anything
 * declared in the body travels to `:is(.animations > *)` and `.animations::before` with it
 * — while `addBase` writes a literal selector and cannot follow. The fork exposes the seam
 * that would let us write into the body late: `buildComplete` carries
 * `ruleMap: Map<utilityName, Array<{ node, set(css) }>>`, one entry per variant form, with
 * the node already transformed.
 *
 * This measures both arms against the same fixture, so it answers two questions at once:
 *
 *   can the seam fix every carrier context?      → arm B
 *   can the stock API express them at all?       → arm A
 *
 * Both arms use the same carrier body and the same aggregate; they differ only in *where*
 * the data is published. A context counts as working only if a browser resolves it.
 *
 * This is a design experiment, not a production path: it loads the compiler from
 * `tailwindcss-core` by path and is deliberately not wired into Jumi.
 *
 * Run: node scripts/spike-carrier-seam.mjs      (JUMI_FORK overrides the checkout)
 */
import { existsSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'

const fork = process.env.JUMI_FORK ?? path.join(homedir(), 'Desktop/workspace/tailwindcss-core')
const entry = path.join(fork, 'packages/tailwindcss/dist/lib.mjs')
const pluginEntry = path.join(fork, 'packages/tailwindcss/dist/plugin.mjs')

if (!existsSync(entry) || !existsSync(pluginEntry)) {
  console.error(`✗ no fork build at ${entry}\n  set JUMI_FORK, or build tailwindcss-core.`)
  process.exit(1)
}

const { compile } = await import(entry)
const { default: plugin } = await import(pluginEntry)

const here = path.dirname(fileURLToPath(import.meta.url))

/* ------------------------------------------------------------------------------------
 * A miniature of the carrier: the same shape as Jumi's, minus the model.
 * ---------------------------------------------------------------------------------- */

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

/** The shared defaults the entries fall back to — what `assemble` gives Jumi. */
const DEFAULTS = {
  'animation-composition': 'replace',
  'animation-delay': '0s',
  'animation-direction': 'normal',
  'animation-duration': '0s',
  'animation-fill-mode': 'none',
  'animation-iteration-count': '1',
  'animation-name': 'none',
  'animation-play-state': 'running',
  'animation-timeline': 'auto',
  'animation-timing-function': 'ease',
}

/**
 * Two slots, so the aggregate is a list rather than a value. The callback in
 * `matchUtilities` receives the *value*, so that — not the key — is what names the
 * element-local variable. Getting this wrong makes every entry fall back to the shared
 * default and reads as "the seam does not work" while the seam is fine.
 */
const SLOTS = { 45: '45deg', 90: '90deg' }
const SLOT_VALUES = Object.values(SLOTS)

/**
 * The carrier body: constant, which is what makes it safe to register as a utility at all.
 * It reads the aggregate and declares none of it.
 */
const carrierBody = {
  ...Object.fromEntries(PARTS.map(part => [`--jumi-${part}`, DEFAULTS[part]])),
  ...Object.fromEntries(PARTS.map(part => [part, `var(--jumi-aggregate-${part}, var(--jumi-${part}))`])),
}

/** The slot utilities: one element-local variable per slot, exactly as `animate-*` does. */
const slotUtilities = (api) => {
  api.matchUtilities({
    'animate-rotate': value => ({
      [`--jumi-rotate-${value}-animation-name`]: `jumi-rotate-${value}`,
      [`--jumi-rotate-${value}`]: value,
    }),
  }, { values: SLOTS })
}

/**
 * The aggregate — the one thing that moves between the arms. Entries reference the slot
 * variables the utilities declare *on the element*, which is what makes placement matter.
 */
const aggregate = Object.fromEntries(PARTS.map(part => [
  `--jumi-aggregate-${part}`,
  SLOT_VALUES.map(value => `var(--jumi-rotate-${value}-${part}, var(--jumi-${part}))`).join(', '),
]))

/**
 * Arm A — what stock Tailwind gives us, and what the bridge does today: an at-rule pass with
 * no candidate and no variants, written to a literal selector.
 */
const withAddBase = plugin((api) => {
  api.addUtilities({ '.animations': carrierBody })
  slotUtilities(api)
  api.addBase({ '.animations': aggregate })
})

/**
 * Arm B — the fork's seam: write the same data into every compiled carrier rule, which is
 * where the variant transformation has already put the body.
 */
const seam = { carriers: 0, writes: 0 }

const withHook = plugin((api) => {
  api.addUtilities({ '.animations': carrierBody })
  slotUtilities(api)

  api.on('buildComplete', ({ ruleMap }) => {
    const carriers = ruleMap.get('animations') ?? []

    seam.carriers = Math.max(seam.carriers, carriers.length)
    seam.writes += carriers.length

    for (const compiled of carriers) compiled.set(aggregate)
  })
})

/* ------------------------------------------------------------------------------------
 * Compile both arms
 * ---------------------------------------------------------------------------------- */

const CSS = `
@tailwind utilities;
@plugin "scratch";

.applied-motion {
  @apply animations animate-rotate-45;
}
`

const CANDIDATES = [
  'animations',
  'animate-rotate-45',
  'animate-rotate-90',
  '*:animations',
  'before:animations',
  'before:animate-rotate-45',
]

const build = async (scratch) => {
  const compiled = await compile(CSS, {
    base: here,
    loadModule: async (id, base) => ({ base, module: scratch, path: id }),
  })

  return compiled.build(CANDIDATES)
}

console.log('· compiling both arms with the fork compiler')

const arms = [
  { css: await build(withAddBase), label: 'addBase (stock API)' },
  { css: await build(withHook), label: 'buildComplete (fork hook)' },
]

if (process.env.JUMI_DUMP) {
  writeFileSync('/tmp/seam-a.css', arms[0].css)
  writeFileSync('/tmp/seam-b.css', arms[1].css)
  console.log(`· dumped /tmp/seam-a.css and /tmp/seam-b.css (seam saw ${seam.carriers} carriers)`)
}

/* ------------------------------------------------------------------------------------
 * A browser decides
 * ---------------------------------------------------------------------------------- */

const contexts = [
  { key: 'direct', selector: '#direct', utility: 'animate-rotate-45' },
  { key: 'descendant', selector: '#descendant > i', utility: 'animate-rotate-45' },
  { key: 'pseudo', pseudo: '::before', selector: '#pseudo', utility: 'before:animate-rotate-45' },
  { key: 'applied', selector: '#applied', utility: 'animate-rotate-45' },
]

const body = `
    <div id="direct" class="animations animate-rotate-45"></div>
    <div id="descendant" class="*:animations"><i class="animate-rotate-45"></i></div>
    <div id="pseudo" class="before:animations before:content-[''] before:animate-rotate-45"></div>
    <div id="applied" class="applied-motion"></div>
`

const browser = await chromium.launch()
const results = []

for (const arm of arms) {
  const page = await browser.newPage()

  await page.setContent(`<!doctype html><html><head><style>${arm.css}</style></head><body>${body}</body></html>`)

  const measured = {}

  for (const context of contexts) {
    measured[context.key] = await page.evaluate(
      ({ pseudo, selector }) => {
        const element = document.querySelector(selector)

        return element ? getComputedStyle(element, pseudo).animationName : null
      },
      { pseudo: context.pseudo ?? null, selector: context.selector },
    )
  }

  results.push({ ...arm, measured })

  await page.close()
}

await browser.close()

/* ------------------------------------------------------------------------------------
 * Report
 * ---------------------------------------------------------------------------------- */

const EXPECTED = 'jumi-rotate-45deg'

const works = name => name !== null && name.includes(EXPECTED)

console.log(`\n  a browser resolving each carrier context (looking for ${EXPECTED})\n`)
console.log(`    ${'context'.padEnd(30)}${arms.map(arm => arm.label.padStart(28)).join('')}`)

for (const context of contexts) {
  const cells = results.map((arm) => {
    const name = arm.measured[context.key]
    const resolving = name === null ? '(absent)' : name.split(',').map(part => part.trim()).filter(part => part !== 'none')

    return `${works(name) ? '✓' : '✗'} ${(resolving.join(' + ') || 'none').slice(0, 24)}`.padStart(28)
  })

  console.log(`    ${context.key.padEnd(30)}${cells.join('')}`)
}

/**
 * Whether the aggregate is *declared* in any rule with that selector. Two details matter:
 * the trailing colon, because every carrier rule mentions `var(--jumi-aggregate-…)` in its
 * consumer body; and `matchAll`, because `addBase` writes its own `.animations` rule in a
 * different layer from the utility, so the first match is not the data.
 */
const published = (css, selector) => {
  const rules = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'g')

  return [...css.matchAll(rules)].some(match => /--jumi-aggregate-animation-name\s*:/.test(match[1]))
}

console.log('\n  where the aggregate was published\n')

for (const arm of results) {
  const sites = [
    ['.animations', published(arm.css, '.animations')],
    [':is(.\\*\\:animations > *)', published(arm.css, ':is(.\\*\\:animations > *)')],
    ['.before\\:animations::before', published(arm.css, '.before\\:animations::before')],
  ]

  console.log(`    ${arm.label}`)

  for (const [selector, present] of sites) {
    console.log(`      ${present ? '✓' : '✗'} ${selector}`)
  }
}

const [stock, hook] = results

const required = ['descendant', 'direct', 'pseudo']
const stockWorks = required.filter(key => works(stock.measured[key])).length
const hookWorks = required.filter(key => works(hook.measured[key])).length

console.log(`\n  required contexts correct:  addBase ${stockWorks}/3   buildComplete ${hookWorks}/3`)

if (hookWorks === 3 && stockWorks < 3) {
  console.log('\n✓ the seam fixes every carrier context, and the stock API cannot express them')
  console.log('  → the correct extension point is a post-compilation mutation of already-variant-transformed utility rules')
}
else if (hookWorks === 3 && stockWorks === 3) {
  console.log('\n· both arms work — this fixture does not discriminate, so it proves nothing')
  process.exit(1)
}
else {
  console.log('\n✗ the seam does not fix the contexts either — the locality loss is deeper than publication')
  process.exit(1)
}
