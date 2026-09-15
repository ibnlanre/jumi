#!/usr/bin/env node
/**
 * The motion-instance model, as **shipped** — what a label can address, and why a compound cannot be
 * split into independently timed members.
 *
 * Two findings, both decided, both measured in a real browser:
 *
 *   1. A control's modifier used to be read twice — as a property scope and as a label — so one class
 *      configured two motions and an author's own control for one of them lost. `structuralAddress`
 *      in `@/core` now sends a token that is a property to the property, and a token that is a name to
 *      the label namespace (`--jumi-label-<name>-<part>`), which no property can occupy.
 *   4. A compound CSS value is one CSS value: `animation-composition: replace` discards one of two
 *      animations of one property, so splitting a compound into independently timed members would make
 *      a label change rendering. The compound stays atomic, and a label on one member names the whole
 *      motion — which is what this file measures rather than assumes.
 *
 * Run: `pnpm spike:instances`. Requires a bundle first, since the plugin under test is `dist/index.js`.
 */
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'

const browser = await chromium.launch()
const page = await browser.newPage()

const compile = async classes =>
  build(
    await compiler(
      '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";',
      root,
    ),
    classes,
  )

/** Resolve one element and report what the browser assigned, per position. */
const resolved = async (css, classes) => {
  await page.setContent(`<!doctype html>
<html><head><style>${css}</style></head>
<body><div id="only" class="${classes.join(' ')}">x</div></body></html>`)

  return page.evaluate(() => {
    const style = getComputedStyle(document.querySelector('#only'))

    return { duration: style.animationDuration, name: style.animationName }
  })
}

/* ────────────────────────────────────────────────────────────────────────────
 * Finding 1 — a token that is a property is the property's
 *
 * The corpus adds `animation-duration-400/rotate` so the two readings are distinguishable: if `/scale`
 * also reached the rotate motion labelled `scale`, the author's own `/rotate` control would lose.
 * ────────────────────────────────────────────────────────────────────────── */

const COLLISION = [
  'animate-scale-110',
  'animate-rotate-45/scale',
  'animation-duration-1000/scale',
  'animation-duration-400/rotate',
]

const collision = await compile(COLLISION)
const collisionResult = await resolved(collision.css, COLLISION)

console.log('══ finding 1 — animate-scale-110 + animate-rotate-45/scale')
console.log(
  '   controls: animation-duration-1000/scale, animation-duration-400/rotate\n',
)
console.log(`   name:     ${collisionResult.name}`)
console.log(
  `   duration: ${collisionResult.duration}   ← 1s for scale, 0.4s for the named rotate`,
)
console.log(`   bytes:    ${collision.css.length}`)
console.log(
  `   label reached: ${
    /--jumi-slot-rotate-[\w-]+-animation-duration/.test(collision.css)
      ? 'linked (wrong: two readers)'
      : "no link — /scale stays the scale property's"
  }`,
)
console.log('\n   and the name is reported rather than dropped silently:')
for (const warning of collision.warnings) console.log(`     ${warning}`)

/* ────────────────────────────────────────────────────────────────────────────
 * Finding 4 — a compound is one CSS value, and the browser says so
 *
 * The question behind it is a plain CSS question — can two animations of one `filter` coexist? — so it
 * is asked of plain CSS with no Jumi involved, for `filter` and for `transform`. Sampled at 50% of a
 * one-second animation whose two halves move different components.
 * ────────────────────────────────────────────────────────────────────────── */

const twoAnimations = (property, first, second, composition) => `<!doctype html>
<html><head><style>
@keyframes a { from { ${property}: ${first[0]} } to { ${property}: ${first[1]} } }
@keyframes b { from { ${property}: ${second[0]} } to { ${property}: ${second[1]} } }
#only {
  animation-name: a, b;
  animation-duration: 1s;
  animation-fill-mode: both;
  animation-composition: ${composition};
  animation-play-state: paused;
  animation-delay: 0s;
}
</style></head><body><div id="only">x</div></body></html>`

const sampleAt = async (html, property, time) => {
  await page.setContent(html)

  return page.evaluate(
    ({ property: name, time: t }) => {
      for (const animation of document.getAnimations()) {
        animation.pause()
        animation.currentTime = t
      }

      return getComputedStyle(document.querySelector('#only')).getPropertyValue(
        name,
      )
    },
    { property, time },
  )
}

console.log(
  '\n══ finding 4 — two animations of one compound property (plain CSS)\n',
)

for (const [property, first, second] of [
  [
    'filter',
    ['blur(4px)', 'blur(10px)'],
    ['brightness(100%)', 'brightness(200%)'],
  ],
  ['transform', ['scale(1)', 'scale(2)'], ['rotate(0deg)', 'rotate(45deg)']],
]) {
  for (const composition of ['replace', 'add']) {
    const html = twoAnimations(property, first, second, composition)
    const mid = await sampleAt(html, property, 500)

    console.log(`   ${property}, composition: ${composition} → at 50%: ${mid}`)
  }
}

console.log(
  '\n   So under the default, one contribution is *gone* — the compound cannot be split into two\n' +
    "   animations without changing what renders. `add` is the author's opt-in, not Jumi's to assume.",
)

/* ────────────────────────────────────────────────────────────────────────────
 * Finding 4, as authored: a label on a member names the whole compound
 *
 * The member is spelled `animate-filter-blur-[4px]` rather than `-blur-4`: the matcher is
 * `type: 'length'` against the blur theme, so a bare `4` is not a candidate and Tailwind drops it
 * silently. The first version of this probe used the bare spelling and measured a class that never
 * existed — which read as "a label on a member is discarded" when the truth was that the member was
 * never emitted at all.
 * ────────────────────────────────────────────────────────────────────────── */

const COMPOUND = [
  'animate-filter-blur-[4px]/foo',
  'animate-filter-brightness-125',
  'animation-duration-900/filter',
  'animation-duration-500/foo',
]

const compound = await compile(COMPOUND)
const compoundResult = await resolved(compound.css, COMPOUND)

console.log('\n   as authored:\n')
console.log(
  `     selectors: ${[...compound.css.matchAll(/\.animate-[^\s{},]*/g)]
    .map(match => match[0])
    .filter((value, index, all) => all.indexOf(value) === index)
    .join(', ')}`,
)
console.log(
  `     name:      ${compoundResult.name}   ← one motion, both members`,
)
console.log(
  `     duration:  ${compoundResult.duration}   ← /foo names that one motion`,
)
console.log(
  `     the control /foo wrote: ${
    /--jumi-label-foo-animation-duration: [^;]+/.exec(compound.css)?.[0] ??
    '(nothing)'
  }`,
)
console.log(
  `     the link the label installs: ${
    /--jumi-slot-filter-animation-duration: [^;]+/.exec(compound.css)?.[0] ??
    '(nothing)'
  }`,
)

await browser.close()
