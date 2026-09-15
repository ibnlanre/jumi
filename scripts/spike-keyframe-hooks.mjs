#!/usr/bin/env node
/**
 * Probe: can the per-frame dependency hooks be removed?
 *
 * A property whose value template names its own components — `--jumi-rotate` is `rotate-x` …
 * `rotate-angle`, `--jumi-margin` is `margin-top` … `margin-left` — reaches `propertyKeyframeValue`
 * with each dependency expanded per frame:
 *
 *   rotate: var(--jumi-rotate-Z2excak-20,
 *             var(--jumi-rotate-x-Z2excak-20, var(--jumi-rotate-x))     ← the hook, and its base
 *             var(--jumi-rotate-y-Z2excak-20, var(--jumi-rotate-y))
 *             …);
 *
 * `scripts/dead-links.mjs` reports the hooks as the only dead class in the canonical sheet: 112 reads,
 * 33 shapes, eight families, and no writer anywhere in the model — the suffix is `<definition-id>-<offset>`
 * for a phrase that writes the *attribute* variable, so a writer would have to be emitted by the very
 * phrase that already wrote the value.
 *
 * This measures the two sheets against each other in Chromium, at five offsets per family across a
 * transform-like, a box-model-like and a shadow/filter-like case. The rewrite touches **only** the hooks:
 * every surrounding fallback is left as it is, which is the shape the removal would take in
 * `propertyKeyframeValue`.
 *
 * Run: `node scripts/spike-keyframe-hooks.mjs`. Requires a bundle, since the sheet under test is the
 * recorded corpus.
 */
import { readFileSync } from 'node:fs'

import { chromium } from 'playwright'

import { deadReads } from './lib/dead-links.mjs'

const sheet = readFileSync('scripts/css-snapshot/snapshot.css', 'utf8')
const fixture = readFileSync('scripts/css-snapshot/fixture.html', 'utf8')
const body = /<body>([\s\S]*)<\/body>/.exec(fixture)[1]

const dead = deadReads(sheet)

/** The name a hook falls back from — its base, with the instance and offset stripped. */
const base = name =>
  name.replace(/^--jumi-/, '--jumi-').replace(/-[A-Za-z0-9]{5,8}(?:-\d+)?$/, '')

const hooks = []
const residual = []

const stripped = dead.reduce((css, entry) => {
  const from = `var(${entry.name}, var(${base(entry.name)}))`
  const count = css.split(from).length - 1

  if (!count) {
    // Not a hook: an *outer* frame variable whose fallback is the composed expression, so there is no
    // `hook → base` pair to remove and nothing here can rewrite it. Recorded rather than skipped —
    // measured, this is `--jumi-outline-<id>-<offset>`, and it means the class is not perfectly uniform.
    residual.push(entry.name)

    return css
  }

  hooks.push(count)

  return css.replaceAll(from, `var(${base(entry.name)})`)
}, sheet)

/**
 * The families, each with the property its element animates and the attribute its animation is named for.
 *
 * One element carries all of them — that is how the canonical fixture is written — so the animation is
 * selected by name rather than by index, and nothing is cancelled: cancelling the shared element's
 * animations after the first family is what made five of these read as "degenerate" the first time this
 * ran, while the product was animating the whole time.
 */
const CASES = [
  ['animate-rotate-[0:0deg|50:90deg]', 'rotate', 'rotate'],
  ['animate-scale-[0:1|50:1.5]', 'scale', 'scale'],
  ['animate-margin-[0:0px|50:8px]', 'margin', 'margin'],
  ['animate-border-radius-[0:0px|50:8px]', 'borderRadius', 'border-radius'],
  ['animate-box-shadow-[0:0px_0px_black|50:0px_0px_8px_black]', 'boxShadow', 'box-shadow'],
  [
    'animate-backdrop-filter-[0:blur(0px)|50:blur(8px)]',
    'backdropFilter',
    'backdrop-filter',
  ],
]

const browser = await chromium.launch()
const page = await browser.newPage()

/**
 * Every family's property as it computes at five offsets, paused and stepped.
 *
 * `currentTime` rather than a wall-clock wait: a live read samples whatever moment the machine happened
 * to reach, so two models compared that way differ by timing rather than by chain. Paused and stepped,
 * both sheets are read at the same offsets — and each family is read from **its own** animation, the one
 * whose name it activates.
 */
const readings = async css => {
  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>${body}</body></html>`,
  )

  return page.evaluate(async cases => {
    const frame = () => new Promise(resolve => requestAnimationFrame(resolve))
    const element = document.querySelector(`[class*="${cases[0][0]}"]`)

    if (!element) return { missing: 'the fixture element' }

    const animations = element.getAnimations()
    const reading = {}

    // Paused first and for good: a running animation advances between the two sheets being sampled, which
    // is the difference this comparison is trying to see past.
    animations.forEach(animation => animation.pause())

    for (const [classes, property, attribute] of cases) {
      const own = animations.filter(animation =>
        (animation.animationName ?? '').startsWith(`jumi-${attribute}`),
      )

      if (!own.length) {
        reading[classes] = { samples: [], verdict: 'no animation' }

        continue
      }

      const duration = own[0].effect?.getTiming?.().duration ?? 0
      const samples = []

      for (const share of [0, 0.25, 0.5, 0.75, 1]) {
        own.forEach(animation => {
          animation.currentTime = duration * share
        })

        await frame()
        samples.push(getComputedStyle(element)[property])
      }

      reading[classes] = {
        duration,
        samples,
        // Non-degeneracy, as an assertion rather than a hope: a family whose five samples are all the same
        // value is not being animated, and comparing it proves nothing in either model.
        verdict:
          !duration || new Set(samples).size < 2
            ? 'degenerate'
            : samples.join(' | '),
      }
    }

    return reading
  }, CASES)
}

console.log('══ can the per-frame dependency hooks go?\n')
console.log(
  `   ${dead.length} dead reads; ${hooks.reduce((total, count) => total + count, 0)} hook fallbacks rewritten as \`var(<dependency>)\`,` +
    ` every surrounding fallback untouched`,
)
console.log(
  residual.length
    ? `   ${residual.length} dead reads are not hooks and were left alone: ${residual.slice(0, 2).join(', ')} — an outer frame variable whose fallback is the composed expression. A second shape inside the class.\n`
    : '   every dead read was a hook\n',
)

const before = await readings(sheet)
const after = await readings(stripped)

let meaningful = 0

for (const [classes, property] of CASES) {
  const one = before[classes]
  const two = after[classes]
  const same = one.samples.join(' | ') === two.samples.join(' | ')
  const animated = one.verdict !== 'degenerate' && one.verdict !== 'no animation'

  if (same && animated) meaningful += 1

  console.log(
    `   ${animated && same ? '✓' : '✗'} ${property.padEnd(16)} ${animated ? one.verdict : `NOT ANIMATED (${one.verdict})`}`,
  )
  if (same && !animated)
    console.log(
      `     equal, but nothing moved — this comparison proves nothing`,
    )
  if (!same) console.log(`     model B          ${two.samples.join(' | ')}`)
}

console.log(
  `\n   ${meaningful === CASES.length ? '✓' : '✗'} ${meaningful}/${CASES.length} families animated and identical at five offsets`,
)
console.log(
  residual.length
    ? `   ✗ ${residual.length} dead reads were not hooks, so the removal is not a single central change`
    : '   ✓ every dead read was a hook, so one central change covers the class',
)

await browser.close()
