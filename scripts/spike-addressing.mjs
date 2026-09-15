#!/usr/bin/env node
/**
 * `/name` on a motion, `/name` on a control: slot address, author label, both, or one by precedence?
 *
 * The slash is documented for both readings. `animation-duration-[1s]/scale` addresses the structural
 * `scale` slot; a motion may carry `animate-rotate-45/spin` and be addressed by
 * `animation-duration-800/spin`. Those are different concepts wearing the same syntax, so the cases
 * that matter are a label whose name is another property's slot, and compound slots, where the
 * address is neither class name.
 *
 * This measures the shipped engine rather than inferring from the names. Each case is compiled on its
 * own — one carrier per stylesheet, which is the shape the docs describe — loaded in a real browser,
 * and read back as what the engine actually resolved: the animation-name/duration/delay longhands and
 * every `--jumi-slot-*` / `--jumi-*-label` the element ends up with.
 *
 * One carrier per stylesheet. Several of these cases share a motion class, so a single sheet would let
 * one case's control reach another case's element — the collision case puts an
 * `animation-duration-1000/scale` on the page that the baseline case's scale motion also reads. One
 * sheet per case keeps every measurement attributable to its own classes.
 *
 * (A sheet holding all of them is fine, for the record: 8 slots, no dead carriers. An earlier version
 * of this file reported every carrier resolving `none`, which was this harness assembling the page
 * without the stylesheet it had just built.)
 *
 * Run: `pnpm spike:addressing` — requires a bundle first, since the plugin is loaded from `dist/`.
 */
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'

/** One carrier per case; each `about` says what the case is trying to falsify. */
const CASES = [
  {
    about: 'baseline: an unlabelled motion, addressed by its property',
    classes: ['animate-scale-110', 'animation-duration-[1200ms]/scale'],
    id: 'baseline',
  },
  {
    about: 'an explicit label on a motion, addressed by that label',
    classes: ['animate-rotate-45/spin', 'animation-duration-800/spin'],
    id: 'label',
  },
  {
    about: 'compound slot: neither class name is the address',
    classes: [
      'animate-filter-blur-4',
      'animate-filter-brightness-125',
      'animation-duration-900/filter',
    ],
    id: 'compound',
  },
  {
    about:
      'collision: is /scale the scale slot, or the rotate label named scale?',
    classes: [
      'animate-scale-110',
      'animate-rotate-45/scale',
      'animation-duration-1000/scale',
    ],
    id: 'collision',
  },
  {
    about: 'collision, reversed: the motion itself is labelled /scale',
    classes: ['animate-scale-110/scale', 'animation-duration-1000/scale'],
    id: 'collision-labelled',
  },
  {
    about: 'two controls for one address: last wins, or do both apply?',
    classes: [
      'animate-scale-110',
      'animation-duration-1000/scale',
      'animation-duration-400/scale',
    ],
    id: 'two-controls',
  },
  {
    about: 'compound plus a label that is not a property',
    classes: [
      'animate-filter-blur-4/foo',
      'animate-filter-brightness-125',
      'animation-duration-900/filter',
      'animation-duration-500/foo',
    ],
    id: 'compound-label',
  },
  {
    about: 'identical phrase, one property, two labels: one motion or two?',
    classes: [
      'animate-opacity-[0:0|100:1]/enter',
      'animate-opacity-[0:0|100:1]/exit',
    ],
    id: 'identical',
  },
  {
    about: 'identical phrase, two labels, different timing each',
    classes: [
      'animate-opacity-[0:0|100:1]/enter',
      'animate-opacity-[0:0|100:1]/exit',
      'animation-duration-200/enter',
      'animation-duration-1800/exit',
    ],
    id: 'identical-timing',
  },
  {
    about: 'identical phrase, same name twice: one instance, not two',
    classes: [
      'animate-opacity-[0:0|100:1]/enter',
      'animate-opacity-[0:0|100:1]/enter',
    ],
    id: 'same-name-twice',
  },
  {
    about: 'identical phrase, unnamed and named: a structural instance plus a named one',
    classes: [
      'animate-opacity-[0:0|100:1]',
      'animate-opacity-[0:0|100:1]/enter',
      'animation-duration-1800/enter',
    ],
    id: 'unnamed-plus-named',
  },
  {
    about:
      'a label nothing carries: does the control dangle, or land on the slot?',
    classes: ['animate-rotate-45', 'animation-duration-700/nope'],
    id: 'orphan-label',
  },
  {
    about: 'a slot nothing fills: does the control dangle?',
    classes: ['animate-rotate-45', 'animation-duration-700/scale'],
    id: 'orphan-slot',
  },
]

const browser = await chromium.launch()
const page = await browser.newPage()
const clip = (value, limit = 110) =>
  value.length > limit ? value.slice(0, limit - 1) + '…' : value

for (const test of CASES) {
  const instance = await compiler(
    '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";',
    root,
  )
  const { animations, css } = build(instance, test.classes)

  await page.setContent(`<!doctype html>
<html><head><style>${css}</style></head>
<body><div id="only" class="${test.classes.join(' ')}">x</div></body></html>`)

  const result = await page.evaluate(() => {
    const element = document.querySelector('#only')
    const style = getComputedStyle(element)
    const interesting = {}

    // Chromium enumerates custom properties through the typed OM, which is the only way here: the
    // question is which names exist, and `getPropertyValue` needs a name to ask for.
    for (const [name, value] of element.computedStyleMap()) {
      const text = String(name)

      if (!text.startsWith('--jumi')) continue

      if (/-label$/.test(text) || /--jumi-slot-.*animation-name$/.test(text))
        interesting[text] = String(value)
    }

    return {
      delay: style.animationDelay,
      duration: style.animationDuration,
      interesting,
      name: style.animationName,
    }
  })

  console.log(`\n── ${test.id} — ${test.about}`)
  console.log(`   classes:  ${test.classes.join(' ')}`)
  console.log(`   derived:  ${animations} slot(s)`)
  console.log(`   name:     ${clip(result.name)}`)
  console.log(`   duration: ${result.duration}`)
  console.log(`   delay:    ${result.delay}`)

  for (const [name, value] of Object.entries(result.interesting))
    console.log(`   ${name}: ${clip(value)}`)

  if (!Object.keys(result.interesting).length)
    console.log('   (no label or slot custom property resolved)')
}

await browser.close()
