#!/usr/bin/env node
/**
 * What motion primitives are actually missing?
 *
 * No syntax proposals, and no new subsystem unless the platform is holding something Jumi has no way to
 * express. Three readings per candidate, each from the side that can actually answer it:
 *
 *   1. **animatability** — from the browser. A keyframe writes the property from one endpoint to the other
 *      and the animation is seeked to the midpoint: a value that differs from both endpoints interpolated,
 *      a value equal to one of them did not. This is the reading that says whether a property is *motion* at
 *      all, or merely a knob that happens to be animatable-looking.
 *   2. **Jumi motion** — from Jumi's own build, by differential: `animate-<property>-[<value>]` emits a rule
 *      or it emits nothing. The arbitrary form is used deliberately, so the reading is "is this property
 *      registered as a motion" rather than "does the theme happen to have this value".
 *   3. **Jumi control** — read off `src/properties/controls.ts`, which is where a property lives when it
 *      configures a motion rather than being one.
 *
 * Guard: a candidate whose endpoints are not legal CSS reports **unmeasured**, never "not animatable". An
 * invalid fixture and a platform limitation look identical in output, which is the trap this repository has
 * paid for more than once.
 *
 * Run: pnpm spike:motion-inventory
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

/**
 * The platform's motion surface, grouped the way it is organised in CSS. Endpoints are chosen to be legal
 * for each property; the guard below reports any that are not.
 */
const CANDIDATES = [
  // ── transforms and the coordinate space they happen in ──
  { group: 'transform', from: 'none', prop: 'transform', to: 'translateX(50px)' },
  { group: 'transform', from: '0% 0%', prop: 'transform-origin', to: '50% 50%' },
  { group: 'transform', from: 'view-box', prop: 'transform-box', to: 'fill-box' },
  { group: 'transform', from: '0px', prop: 'translate', to: '40px' },
  { group: 'transform', from: '0deg', prop: 'rotate', to: '45deg' },
  { group: 'transform', from: '1', prop: 'scale', to: '1.5' },
  { group: 'transform', from: 'flat', prop: 'transform-style', to: 'preserve-3d' },
  { group: 'transform', from: 'visible', prop: 'backface-visibility', to: 'hidden' },
  // ── motion paths ──
  { group: 'offset', from: 'ray(0deg)', prop: 'offset-path', to: 'ray(90deg)' },
  { group: 'offset', from: '0%', prop: 'offset-distance', to: '80%' },
  { group: 'offset', from: '0deg', prop: 'offset-rotate', to: '90deg' },
  { group: 'offset', from: 'auto', prop: 'offset-anchor', to: '50% 50%' },
  { group: 'offset', from: 'normal', prop: 'offset-position', to: '50% 50%' },
  // ── depth ──
  { group: 'depth', from: '100px', prop: 'perspective', to: '400px' },
  { group: 'depth', from: '0% 0%', prop: 'perspective-origin', to: '50% 50%' },
  // ── animation configuration ──
  { group: 'animation', from: 'replace', prop: 'animation-composition', to: 'add' },
  { group: 'animation', from: 'auto', prop: 'animation-timeline', to: 'scroll()' },
  { group: 'animation', from: 'normal', prop: 'animation-range', to: 'entry 100%' },
  { group: 'animation', from: 'normal', prop: 'animation-range-start', to: 'entry' },
  { group: 'animation', from: 'normal', prop: 'animation-range-end', to: 'exit' },
  { group: 'animation', from: '0s', prop: 'animation-delay', to: '1s' },
  { group: 'animation', from: '1s', prop: 'animation-duration', to: '2s' },
  { group: 'animation', from: 'linear', prop: 'animation-timing-function', to: 'ease-in' },
  { group: 'animation', from: '1', prop: 'animation-iteration-count', to: '3' },
  { group: 'animation', from: 'normal', prop: 'animation-direction', to: 'reverse' },
  { group: 'animation', from: 'none', prop: 'animation-fill-mode', to: 'both' },
  { group: 'animation', from: 'running', prop: 'animation-play-state', to: 'paused' },
  // ── timelines, declared on the scroller rather than on the animated element ──
  { group: 'timeline', from: 'none', prop: 'scroll-timeline-name', to: '--scroller' },
  { group: 'timeline', from: 'block', prop: 'scroll-timeline-axis', to: 'inline' },
  { group: 'timeline', from: 'none', prop: 'scroll-timeline', to: '--scroller block' },
  { group: 'timeline', from: 'none', prop: 'view-timeline-name', to: '--viewer' },
  { group: 'timeline', from: 'block', prop: 'view-timeline-axis', to: 'inline' },
  { group: 'timeline', from: 'auto', prop: 'view-timeline-inset', to: '20%' },
  { group: 'timeline', from: 'none', prop: 'view-timeline', to: '--viewer block' },
  { group: 'timeline', from: 'none', prop: 'timeline-scope', to: '--scroller' },
  // ── transitions ──
  { group: 'transition', from: 'opacity', prop: 'transition-property', to: 'transform' },
  { group: 'transition', from: '100ms', prop: 'transition-duration', to: '500ms' },
  { group: 'transition', from: '0s', prop: 'transition-delay', to: '200ms' },
  { group: 'transition', from: 'linear', prop: 'transition-timing-function', to: 'ease-in' },
  { group: 'transition', from: 'normal', prop: 'transition-behavior', to: 'allow-discrete' },
  // ── view transitions ──
  { group: 'view', from: 'none', prop: 'view-transition-name', to: 'card' },
  { group: 'view', from: 'none', prop: 'view-transition-class', to: 'card' },
  { group: 'view', from: 'normal', prop: 'view-transition-group', to: 'contain' },
  // ── interpolation and the discrete lifecycle ──
  { group: 'lifecycle', from: 'numeric-only', prop: 'interpolate-size', to: 'allow-keywords' },
  { group: 'lifecycle', from: 'block', prop: 'display', to: 'none' },
  { group: 'lifecycle', from: 'visible', prop: 'visibility', to: 'hidden' },
  { group: 'lifecycle', from: 'visible', prop: 'content-visibility', to: 'hidden' },
  { group: 'lifecycle', from: 'auto', prop: 'overlay', to: 'none' },
  // ── adjacent: motion-adjacent, not motion ──
  { group: 'adjacent', from: 'auto', prop: 'scroll-behavior', to: 'smooth' },
  { group: 'adjacent', from: 'none', prop: 'scroll-snap-type', to: 'x mandatory' },
  { group: 'adjacent', from: 'auto', prop: 'will-change', to: 'transform' },
]

/**
 * The page.
 *
 * One element per candidate, so every reading comes from the same fixture and the same seek. Fixture prose
 * lives out here rather than inside the template: a backtick inside a browser fixture ends it, and that
 * mistake has been made ten times in this repository.
 */
const htmlFor = () => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; font: 12px/1.4 system-ui; }
  #board > * { display: block; width: 60px; height: 20px; background: #333; margin: 3px; }
  #board { width: 400px; }
${CANDIDATES.map((item, index) => `  #probe-${index} { ${item.prop}: ${item.from}; animation: move-${index} 1s linear both; }`).join('\n')}
${CANDIDATES.map((item, index) => `  @keyframes move-${index} { from { ${item.prop}: ${item.from} } to { ${item.prop}: ${item.to} } }`).join('\n')}
</style></head>
<body>
<div id="board">
${CANDIDATES.map((item, index) => `  <div id="probe-${index}"></div>`).join('\n')}
</div>
<script>
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  /** Whether the fixture's own endpoints are legal, so a broken fixture cannot read as a platform fact. */
  window.__legal = (probe) => ({
    from: CSS.supports(probe.prop, probe.from),
    to: CSS.supports(probe.prop, probe.to),
  })

  /**
   * Seek the candidate's animation to each fraction and read the computed value. A midpoint value equal to
   * neither endpoint means the property interpolated; equal to one of them means it did not.
   */
  window.__probe = async (probes) => {
    const readings = []

    for (const probe of probes) {
      const node = document.getElementById(probe.id)
      const animations = [...document.getAnimations()].filter(animation => animation.effect?.target === node)

      if (!animations.length) {
        readings.push({ measured: false, note: 'no Animation object' })
        continue
      }

      const values = []

      for (const fraction of [0, 0.5, 1]) {
        for (const animation of animations) {
          animation.pause()
          animation.currentTime = Math.round(fraction * 1000)
        }

        await frame()
        values.push(getComputedStyle(node).getPropertyValue(probe.prop).trim())
      }

      readings.push({ measured: true, values })
    }

    return readings
  }

  window.__ready = true
</script>
</body></html>`

const server = (await import('node:http')).createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  response.end(htmlFor())
}).listen(0)

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(`http://127.0.0.1:${server.address().port}`)
await page.waitForFunction(() => window.__ready === true)

const line = (label, value) => console.log(`  ${label.padEnd(34)} ${value}`)

// ── what Jumi exposes, read from the sources that own each kind ───────────────────────────────────────
const controls = readFileSync(path.join(root, 'src', 'properties', 'controls.ts'), 'utf8')
const controlKeys = new Set(
  [...controls.matchAll(/^\s*'([a-z-]+)':\s*\{/gm)].map(match => match[1]),
)

const entry = `
@import "tailwindcss";
@plugin "${path.join(root, 'dist', 'index.js')}";
`
const { build, compiler, root: project } = await import('./lib/compile.mjs')
const baseline = build(await compiler(entry, project), []).css
const emits = async candidate => (await build(await compiler(entry, project), [candidate])).css

/**
 * The same build with no Jumi at all.
 *
 * Load-bearing: Tailwind ships `will-change-*` and plenty of other property utilities of its own, so a bare
 * `<property>-[…]` candidate that emits says nothing about Jumi until a host-only build is compared.
 */
const hostEntry = '@import "tailwindcss";\n'
const hostBaseline = build(await compiler(hostEntry, project), []).css
const hostEmits = async candidate => (await build(await compiler(hostEntry, project), [candidate])).css

const arbitrary = value => value.replace(/\s+/g, '_')

/**
 * The two files that list *every* animatable property rather than handling one. A mention there means the
 * property is modelled, which is a different fact from being exposed, so they are reported separately
 * instead of being credited as coverage.
 */
const CATALOGUES = ['src/types/index.ts', 'src/variables/property.ts']

/** Every non-test source file that names the property as a string. */
const ownerFiles = (name) => {
  try {
    return execFileSync('grep', ['-rl', `'${name}'`, path.join(root, 'src')], { encoding: 'utf8' })
      .trim().split('\n').filter(Boolean)
      .map(file => path.relative(root, file))
      .filter(file => !file.endsWith('.test.ts'))
  }
  catch {
    return []
  }
}

console.log(`motion inventory · ${CANDIDATES.length} candidates · ${controlKeys.size} controls read from source`)

const legal = await page.evaluate(probes => probes.map(probe => window.__legal(probe)), CANDIDATES)
const readings = await page.evaluate(
  probes => window.__probe(probes),
  CANDIDATES.map((item, index) => ({ id: `probe-${index}`, prop: item.prop })),
)

let group = ''
const gaps = []

for (const [index, item] of CANDIDATES.entries()) {
  if (item.group !== group) {
    group = item.group
    console.log(`\n${group}`)
    console.log('─'.repeat(96))
  }

  const legalEndpoints = legal[index]
  const reading = readings[index]
  const jumiMotion = (await emits(`animate-${item.prop}-[${arbitrary(item.to)}]`)) !== baseline
  const hostMotion = (await hostEmits(`animate-${item.prop}-[${arbitrary(item.to)}]`)) !== hostBaseline
  const hostUtility = (await hostEmits(`${item.prop}-[${arbitrary(item.to)}]`)) !== hostBaseline
  const control = controlKeys.has(item.prop)
  const files = ownerFiles(item.prop)
  const handled = files.find(file => !CATALOGUES.includes(file))
  const modelled = files.some(file => CATALOGUES.includes(file))

  if (!legalEndpoints.from || !legalEndpoints.to) {
    line(`animate-${item.prop}`, `unmeasured — fixture endpoints not legal (${legalEndpoints.from ? '' : 'from '}${legalEndpoints.to ? '' : 'to'})`)
    continue
  }

  const behaviour = !reading.measured
    ? 'no Animation object'
    : reading.values[1] !== reading.values[0] && reading.values[1] !== reading.values[2]
      ? `interpolates (${reading.values.join(' → ')})`
      : `does not interpolate (${reading.values.join(' → ')})`

  const coverage = jumiMotion
    ? 'Jumi: motion'
    : hostMotion ? 'host: animate utility'
      : control ? 'Jumi: control'
        : handled ? `Jumi: ${handled.replace('src/', '').replace('.ts', '')}`
          : hostUtility ? 'host: property utility'
            : modelled ? 'Jumi: modelled only' : '—'

  if (!jumiMotion && !control && !handled) gaps.push({ ...item, coverage })

  line(`animate-${item.prop}`, `${coverage.padEnd(17)} · ${behaviour}`)
}

console.log(`\nnot exposed by a Jumi motion, a control, or a named pass: ${gaps.length}`)
for (const gap of gaps) {
  console.log(`  ${gap.prop.padEnd(24)} ${gap.coverage.padEnd(24)} (${gap.group})`)
}

await browser.close()
server.close()

console.log('')
