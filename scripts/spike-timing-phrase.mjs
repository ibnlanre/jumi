#!/usr/bin/env node
/**
 * Segment easing as a **phrase-valued timing control**, probed before anything is built.
 *
 *   animate-rotate-[0:0deg|100:45deg]/test             what the property does at each offset
 *   animation-timing-function-[0:ease-out-back]/test   how the motion leaves particular offsets
 *
 * The motion phrase keeps its strict `offset:value` meaning, and all easing stays under
 * `animation-timing-function-*` — scalar for the whole motion, a phrase for the offsets.
 *
 * What that shape has to pay: a keyframe-local `animation-timing-function` cannot read a `var()`
 * (measured in `spike-segment-easing.mjs`), so a timing phrase is not an ordinary control. It has to
 * **specialize the addressed motion's keyframe definition** and bake a literal into it. This file
 * simulates that specialization by rewriting the compiled CSS with PostCSS — the same AST the finalizer
 * walks — and measures the result in a real browser. No production code is touched.
 *
 * The mechanism under test, stated precisely:
 *
 *   1. the definition an addressed instance already uses is cloned under a name derived from its content
 *      (`hash(definition + segment map)`), with `animation-timing-function: <literal>` added to each
 *      frame the phrase names;
 *   2. the timing candidate's **own rule** writes the specialized definition's name into the activation
 *      variable the composition resolves — so it reaches the elements that wrote the control, and no
 *      others.
 *
 * Point 2 is the whole architectural question. A definition is shared text, so writing the specialization
 * where the *motion* is declared leaks it to every element that animates that motion; writing it where the
 * *control* is declared is what keeps it element-local. Case 3 measures both.
 *
 * Run: `pnpm spike:timing-phrase`. Requires a bundle first, since the plugin under test is `dist/index.js`.
 */
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'

import postcss from 'postcss'

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

const declarationsOf = rule =>
  (rule.nodes ?? []).filter(node => node.type === 'decl')

/** The first rule holding a declaration named `prop`. */
const ruleHolding = (root, prop) => {
  let found = null

  root.walkRules(rule => {
    if (!found && declarationsOf(rule).some(node => node.prop === prop))
      found = rule
  })

  return found
}

/** The rule that declared the named instance: `--jumi-<instance key>-label: <name>`. */
const namedInstance = (root, name) => {
  let found = null

  root.walkRules(rule => {
    const label = declarationsOf(rule).find(
      node => /^--jumi-[\w-]+-label$/.test(node.prop) && node.value === name,
    )

    if (found || !label) return

    const activation = declarationsOf(rule).find(node =>
      /^--jumi-[\w-]+-animation-name$/.test(node.prop),
    )

    found = {
      activation: activation?.prop ?? null,
      definition: activation?.value ?? null,
      label: label.prop,
      rule,
    }
  })

  return found
}

/** The rule that declares a motion of an *attribute* — the structural address's target. */
const structuralInstance = (root, attribute) => {
  let found = null

  root.walkRules(rule => {
    if (found) return

    const activation = declarationsOf(rule).find(node =>
      new RegExp(`^--jumi-${attribute}-[\\w-]+-animation-name$`).test(
        node.prop,
      ),
    )

    if (activation)
      found = {
        activation: activation.prop,
        definition: activation.value,
        rule,
      }
  })

  return found
}

/** The rule that wrote the timing phrase, and the phrase itself. */
const timingPhrase = (root, prop) => {
  const rule = ruleHolding(root, prop)
  const value = rule
    ? declarationsOf(rule).find(node => node.prop === prop)?.value
    : null

  return rule && value ? { phrase: value, rule } : null
}

/** `0:ease-out-back|50:ease-in` → `[[0, 'ease-out-back'], [50, 'ease-in']]`. */
const parseSegments = phrase =>
  phrase
    .trim()
    .split('|')
    .map(frame => {
      const colon = frame.indexOf(':')

      return [frame.slice(0, colon).trim(), frame.slice(colon + 1).trim()]
    })

/** A short content hash, standing in for the model's `shorthash2` in the simulated naming. */
const hash = text => {
  let value = 5381

  for (const character of text)
    value = ((value * 33) ^ character.codePointAt(0)) >>> 0

  return value.toString(36).slice(0, 5).padStart(5, '0')
}

const keyframeOf = (root, name) => {
  let found = null

  root.walkAtRules('keyframes', atRule => {
    if (atRule.params.trim() === name) found = atRule
  })

  return found
}

/**
 * Clone a definition with the segment easings baked in as literals, named by its content.
 *
 * Returns the name and whether a clone was added — identical `(definition, segments)` pairs produce the
 * same name, which is what deduplication means here: a keyframe is shared exactly when the declaration is.
 */
const specialize = (root, definition, segments) => {
  const name = `${definition}-seg-${hash(
    `${definition}|${segments.map(([at, easing]) => `${at}:${easing}`).join('|')}`,
  )}`
  const existing = keyframeOf(root, name)

  if (existing) return { added: false, name }

  const original = keyframeOf(root, definition)

  if (!original) throw new Error(`no keyframes for ${definition}`)

  const clone = original.clone()

  clone.params = name

  for (const frame of clone.nodes ?? []) {
    if (frame.type !== 'rule') continue

    const offset = Number.parseFloat(frame.selector)
    const easing = segments.find(([at]) => Number(at) === offset)?.[1]

    if (!easing || Number.isNaN(offset)) continue

    frame.append({ prop: 'animation-timing-function', value: easing })
  }

  original.parent?.append(clone)

  return { added: true, name }
}

/**
 * Remove a phrase-shaped value from a rule.
 *
 * A phrase is not an `<easing-function>`, so leaving it in a control variable does more than mis-set a
 * property: the chain resolves to an invalid token sequence and the composition's whole `animation`
 * shorthand becomes invalid at computed-value time. Measured — the element reports `animation-name: none`,
 * `animation-duration: 0s` and *zero* animations, so the motion dies rather than misbehaving. A real
 * implementation records the segments somewhere inert instead (the shape `--jumi-<key>-label` already
 * uses), and this is that step.
 */
const dropPhrase = rule => {
  for (const node of declarationsOf(rule)) {
    if (/^(?:0|[\d.]+(?:,[\d.]+)*):/.test(node.value.trim())) node.remove()
  }
}

/** Write a definition name into a rule — the selection half of the mechanism. */
const select = (rule, activation, definition) => {
  dropPhrase(rule)
  rule.append({ prop: activation, value: definition })
}

const render = async (css, elements) => {
  await page.setContent(`<!doctype html>
<html><head><style>${css}</style></head>
<body>${elements
    .map(([id, classes]) => `<div id="${id}" class="${classes}"></div>`)
    .join('\n')}</body></html>`)
}

/** Computed values at chosen times, with every animation paused there. */
const readings = async (id, property, times) =>
  page.evaluate(
    ({ id: selector, property: name, times: at }) => {
      const element = document.querySelector(`#${selector}`)
      const out = {}

      for (const time of at) {
        for (const animation of document.getAnimations()) {
          animation.pause()
          animation.currentTime = time
        }

        out[time] = getComputedStyle(element).getPropertyValue(name).trim()
      }

      out.animations = document.getAnimations().length

      return out
    },
    { id, property, times },
  )

const round = value => {
  const number = Number.parseFloat(value)

  return Number.isFinite(number) ? Math.round(number * 1000) / 1000 : value
}

const show = object =>
  Object.entries(object)
    .map(([time, value]) => `${time}ms → ${round(value)}`)
    .join(', ')

const parse = css => postcss.parse(css)

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * The syntax half, first: is a timing phrase just an ordinary control?
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

const SYNTAX = [
  'animate-opacity-[0:0|100:1]/enter',
  'animate-opacity-[0:0|100:1]/exit',
  'animation-timing-function-[0:step-start]/enter',
  'animation-timing-function-[0:linear]/exit',
  'animation-timing-function-ease-in-out/enter',
]

console.log(
  '══ timing phrase as a segment control — simulated specialization\n',
)
console.log('── the syntax needs nothing new\n')

const syntax = await compile(SYNTAX)
const syntaxRoot = parse(syntax.css)

for (const prop of [
  '--jumi-label-enter-animation-timing-function',
  '--jumi-label-exit-animation-timing-function',
]) {
  console.log(
    `   ${prop}: ${
      declarationsOf(ruleHolding(syntaxRoot, prop) ?? { nodes: [] }).find(
        node => node.prop === prop,
      )?.value ?? '(not emitted)'
    }`,
  )
}

console.log(
  '   — the same matcher as `animation-timing-function-ease-out/enter`: scalar value, or a phrase.',
)

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 1 · Two identical motions, two different segment easings
 *
 * One compilation, so the simulation and the elements always describe the same sheet.
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

const TWO = await compile([
  'animate-opacity-[0:0|100:1]/enter',
  'animate-opacity-[0:0|100:1]/exit',
  'animate-opacity-[0:0|100:1]/plain',
  'animation-timing-function-[0:step-start]/enter',
  'animation-timing-function-[0:linear]/exit',
])
const twoRoot = parse(TWO.css)

const enterRule = namedInstance(twoRoot, 'enter')
const exitRule = namedInstance(twoRoot, 'exit')
const enterPhrase = timingPhrase(
  twoRoot,
  '--jumi-label-enter-animation-timing-function',
)
const exitPhrase = timingPhrase(
  twoRoot,
  '--jumi-label-exit-animation-timing-function',
)

const enterSpecialty = specialize(
  twoRoot,
  enterRule.definition,
  parseSegments(enterPhrase.phrase),
)
const exitSpecialty = specialize(
  twoRoot,
  exitRule.definition,
  parseSegments(exitPhrase.phrase),
)

select(enterPhrase.rule, enterRule.activation, enterSpecialty.name)
select(exitPhrase.rule, exitRule.activation, exitSpecialty.name)

const twoCss = twoRoot.toString()

await render(twoCss, [
  [
    'enter',
    'animate-opacity-[0:0|100:1]/enter animation-timing-function-[0:step-start]/enter animation-duration-1000',
  ],
  [
    'exit',
    'animate-opacity-[0:0|100:1]/exit animation-timing-function-[0:linear]/exit animation-duration-1000',
  ],
  ['plain', 'animate-opacity-[0:0|100:1]/plain animation-duration-1000'],
])

console.log('\n── 1 · identical frames, different segment easings\n')
console.log(
  `   /enter (0:step-start) → ${show(await readings('enter', 'opacity', [250, 750]))}`,
)
console.log(
  `   /exit  (0:linear)     → ${show(await readings('exit', 'opacity', [250, 750]))}`,
)
console.log(
  `   /plain (no phrase)    → ${show(await readings('plain', 'opacity', [250, 750]))}`,
)
console.log(
  `   two definitions: ${enterSpecialty.name} , ${exitSpecialty.name} — ${
    enterSpecialty.name === exitSpecialty.name
      ? 'SAME (wrong)'
      : 'different, so the two instances no longer share one keyframe'
  }`,
)

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 2 · Identical segments — does the definition deduplicate?
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

const sameRoot = parse(
  (
    await compile([
      'animate-opacity-[0:0|100:1]/enter',
      'animate-opacity-[0:0|100:1]/exit',
      'animation-timing-function-[0:step-start]/enter',
      'animation-timing-function-[0:step-start]/exit',
    ])
  ).css,
)
const sameEnter = namedInstance(sameRoot, 'enter')
const sameExit = namedInstance(sameRoot, 'exit')
const sameEnterTiming = timingPhrase(
  sameRoot,
  '--jumi-label-enter-animation-timing-function',
)
const sameExitTiming = timingPhrase(
  sameRoot,
  '--jumi-label-exit-animation-timing-function',
)
const sameA = specialize(
  sameRoot,
  sameEnter.definition,
  parseSegments(sameEnterTiming.phrase),
)
const sameB = specialize(
  sameRoot,
  sameExit.definition,
  parseSegments(sameExitTiming.phrase),
)

select(sameEnterTiming.rule, sameEnter.activation, sameA.name)
select(sameExitTiming.rule, sameExit.activation, sameB.name)

const sameCss = sameRoot.toString()
const sameKeyframes = [...sameCss.matchAll(/@keyframes ([\w-]+)/g)].map(
  match => match[1],
)

await render(sameCss, [
  [
    'enter',
    'animate-opacity-[0:0|100:1]/enter animation-timing-function-[0:step-start]/enter animation-duration-1000',
  ],
  [
    'exit',
    'animate-opacity-[0:0|100:1]/exit animation-timing-function-[0:step-start]/exit animation-duration-1000',
  ],
])

console.log('\n── 2 · identical frames *and* identical segments\n')
console.log(`   /enter → ${sameA.name}`)
console.log(`   /exit  → ${sameB.name}`)
console.log(
  `   same definition: ${sameA.name === sameB.name} — added clones: ${
    Number(sameA.added) + Number(sameB.added)
  }`,
)
console.log(`   keyframes in the sheet: ${sameKeyframes.join(', ')}`)

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 3 · A structural address, and the leak the mechanism must not have
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

const STRUCTURAL = [
  'animate-rotate-[0:0deg|100:90deg]',
  'animation-timing-function-[0:step-start]/rotate',
  'animation-duration-1000',
]

console.log(
  '\n── 3 · structural `/rotate` — where the specialization is written\n',
)

for (const where of ['control', 'motion']) {
  const structuralRoot = parse((await compile(STRUCTURAL)).css)
  const rotate = structuralInstance(structuralRoot, 'rotate')
  const timing = timingPhrase(
    structuralRoot,
    '--jumi-rotate-animation-timing-function',
  )

  if (!rotate || !timing) {
    console.log(
      `   written in the ${where === 'control' ? "control's rule" : "motion's rule"}: no rotate motion or no timing phrase in the sheet`,
    )

    continue
  }

  const clone = specialize(
    structuralRoot,
    rotate.definition,
    parseSegments(timing.phrase),
  )

  const target =
    where === 'control'
      ? timing.rule
      : ruleHolding(structuralRoot, rotate.activation)

  // Either way the phrase itself must never reach the control chain (see `select`). Variant (b) differs
  // only in *where the selection is written*: into the rule that declares the motion, which every element
  // animating it matches.
  if (where === 'motion') dropPhrase(timing.rule)

  select(target, rotate.activation, clone.name)

  await render(structuralRoot.toString(), [
    ['a', 'animate-rotate-[0:0deg|100:90deg] animation-duration-1000'],
    [
      'b',
      'animate-rotate-[0:0deg|100:90deg] animation-timing-function-[0:step-start]/rotate animation-duration-1000',
    ],
  ])

  const withControl = await readings('b', 'rotate', [750])
  const withoutControl = await readings('a', 'rotate', [750])

  console.log(
    `   written in the ${where === 'control' ? "control's rule" : "motion's rule"}:`,
  )
  console.log(`     element with the control    → ${show(withControl)}`)
  console.log(
    `     element without the control → ${show(withoutControl)}${
      round(withoutControl[750]) === 90
        ? '   ← LEAKED: it got a specialization it never asked for'
        : '   (unaffected)'
    }`,
  )
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 4 · The scalar slot easing stays the fallback for unclaimed segments
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

const MIXED = [
  'animate-opacity-[0:0|50:1|100:0]/mixed',
  'animation-timing-function-linear/mixed',
  'animation-timing-function-[0:step-start]/mixed',
  'animation-duration-1000',
]

const mixedRoot = parse((await compile(MIXED)).css)
const mixed = namedInstance(mixedRoot, 'mixed')
const mixedTiming = timingPhrase(
  mixedRoot,
  '--jumi-label-mixed-animation-timing-function',
)
const mixedScalar = declarationsOf(
  ruleHolding(mixedRoot, '--jumi-label-mixed-animation-timing-function') ??
    mixedTiming.rule,
).find(node => node.prop === '--jumi-label-mixed-animation-timing-function')

const mixedClone = specialize(
  mixedRoot,
  mixed.definition,
  parseSegments(mixedTiming.phrase),
)
select(mixedTiming.rule, mixed.activation, mixedClone.name)

await render(mixedRoot.toString(), [['mixed', MIXED.join(' ')]])

console.log('\n── 4 · the scalar control remains the fallback\n')
console.log(
  `   frames 0:0|50:1|100:0, phrase claims 0% only, scalar /mixed is linear`,
)
console.log(
  `   ${show(await readings('mixed', 'opacity', [250, 750]))} — 250ms is the phrase's segment (step-start: the frame's end value, 1), 750ms the scalar's (linear: 0.5)`,
)
console.log(
  `   scalar declaration in that rule: ${mixedScalar?.value ?? '(none)'}`,
)

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 5 · Arbitrary easing functions, through the same grammar
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log('\n── 5 · arbitrary easing functions in the phrase\n')

for (const [name, easing] of [
  ['back', 'cubic-bezier(0.34,1.56,0.64,1)'],
  ['stepped', 'steps(4,end)'],
]) {
  const candidates = [
    `animate-rotate-[0:0deg|100:100deg]/${name}`,
    `animation-timing-function-[0:${easing}]/${name}`,
    'animation-duration-1000',
  ]
  const root5 = parse((await compile(candidates)).css)
  const instance = namedInstance(root5, name)
  const timing = timingPhrase(
    root5,
    `--jumi-label-${name}-animation-timing-function`,
  )

  if (!instance || !timing) {
    console.log(`   /${name}  ${easing} → the candidate did not survive`)

    continue
  }

  const clone = specialize(
    root5,
    instance.definition,
    parseSegments(timing.phrase),
  )

  select(timing.rule, instance.activation, clone.name)

  await render(root5.toString(), [[name, candidates.slice(0, 2).join(' ')]])

  console.log(`   /${name}  emitted phrase: ${timing.phrase}`)
  console.log(
    `           → ${show(await readings(name, 'rotate', [125, 250, 750]))}`,
  )
  console.log(
    `           keyframe holds: ${
      declarationsOf(
        keyframeOf(root5, clone.name)?.nodes?.find(
          node =>
            node.type === 'rule' && Number.parseFloat(node.selector) === 0,
        ) ?? { nodes: [] },
      ).find(node => node.prop === 'animation-timing-function')?.value
        ? 'the literal easing, as required'
        : 'NOTHING — it would be dropped'
    }`,
  )
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 6 · Unaddressed — the dangerous case
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log(
  '\n── 6 · unaddressed — can it be correct without element-local knowledge?\n',
)

const UNADDRESSED = [
  'animate-opacity-[0:0|100:1]/enter',
  'animate-rotate-[0:0deg|100:90deg]/spin',
  'animation-duration-1000',
]

const unaddressedCss = (await compile(UNADDRESSED)).css
const definitions = [
  ...new Set(
    [...unaddressedCss.matchAll(/@keyframes (jumi-[\w-]+)/g)].map(m => m[1]),
  ),
]

// Today: the phrase arrives as a global control value, which is the only thing the pipeline can do
// with it — and no keyframe can read a variable.
const asVariable = postcss.parse(unaddressedCss)

asVariable.append(
  postcss.parse(
    '.animation-timing-function-\\[0\\:step-start\\] { --jumi-animation-timing-function: 0:step-start; }',
  ),
)

await render(asVariable.toString(), [
  [
    'spin',
    'animate-rotate-[0:0deg|100:90deg]/spin animation-timing-function-[0:step-start] animation-duration-1000',
  ],
])

console.log(
  `   today (a global variable) → ${show(await readings('spin', 'rotate', [750]))}`,
)

await render(unaddressedCss, [
  ['spin', 'animate-rotate-[0:0deg|100:90deg]/spin animation-duration-1000'],
])

console.log(
  `   unspecialized baseline    → ${show(await readings('spin', 'rotate', [750]))}`,
)

// The over-approximation: every definition in the sheet is specialized, and the control's own rule
// selects them all. Correct per element, and its cost is the sheet's definition count.
const everyRoot = postcss.parse(unaddressedCss)
const selection = postcss.rule({
  selector: '.animation-timing-function-\\[0\\:step-start\\]',
})

for (const definition of definitions) {
  const clone = specialize(everyRoot, definition, [['0', 'step-start']])
  const activation = [
    ...unaddressedCss.matchAll(
      new RegExp(`(--jumi-[\\w-]+-animation-name):\\s*${definition};`, 'g'),
    ),
  ][0]?.[1]

  if (activation) selection.append({ prop: activation, value: clone.name })
}

everyRoot.append(selection)

const everyCss = everyRoot.toString()

await render(everyCss, [
  [
    'spin',
    'animate-rotate-[0:0deg|100:90deg]/spin animation-timing-function-[0:step-start] animation-duration-1000',
  ],
  ['bare', 'animate-rotate-[0:0deg|100:90deg]/spin animation-duration-1000'],
])

console.log(
  `   over-approximated         → ${show(await readings('spin', 'rotate', [750]))} (with the control)`,
)
console.log(
  `                             → ${show(await readings('bare', 'rotate', [750]))} (without it: unaffected)`,
)
console.log(
  `   cost: ${definitions.length} definitions → ${definitions.length} clones and ${definitions.length} selection declarations in one rule`,
)
console.log(
  `   bytes: ${unaddressedCss.length} → ${everyCss.length} (+${everyCss.length - unaddressedCss.length})`,
)

await browser.close()

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 7 · Cost on a real corpus, addressed against unaddressed
 *
 * The over-approximation above is correct per element and its price is the sheet's definition count, so it
 * has to be measured where that count is real rather than two. Addressed specialization clones exactly the
 * definitions an address names; unaddressed clones every definition in the sheet and writes one selection
 * declaration per definition into the control's own rule — the same shape as the composition's global
 * position list, which is the cost this repository already agreed to pay once and then hoisted.
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log('\n── 7 · cost on a larger sheet\n')

// A sheet with many definitions, which is what the unaddressed cost scales with: effects, single values,
// phrases and named phrases, the four sources of a keyframe.
const LARGE = [
  'animate-fade-in',
  'animate-bounce-in',
  'animate-pulse',
  'animate-shake',
  'animate-float',
  ...[
    'opacity',
    'rotate',
    'scale',
    'translate-x',
    'background-color',
    'border-radius',
    'filter-blur',
    'width',
  ].flatMap(attribute =>
    [50, 100, 200].map(value => `animate-${attribute}-${value}`),
  ),
  ...['opacity', 'rotate', 'scale'].flatMap(attribute => [
    `animate-${attribute}-[0:0|100:1]`,
    `animate-${attribute}-[0:0|50:1|100:0]/half-${attribute}`,
  ]),
  'animation-duration-1000',
]

{
  const compiled = await compile(LARGE)
  const root7 = parse(compiled.css)
  const definitions = []

  root7.walkAtRules('keyframes', atRule => {
    definitions.push(atRule.params.trim())
  })

  const activations = [
    ...compiled.css.matchAll(/(--jumi-[\w-]+-animation-name):\s*([\w-]+);/g),
  ]

  // Unaddressed: the control's rule selects every definition, and every definition is cloned.
  const everyRoot = parse(compiled.css)
  const selection = postcss.rule({
    selector: '.animation-timing-function-\\[0\\:step-start\\]',
  })
  let clones = 0

  for (const definition of definitions) {
    const clone = specialize(everyRoot, definition, [['0', 'step-start']])

    clones += clone.added ? 1 : 0

    const activation = activations.find(
      ([, value]) => value === definition,
    )?.[1]

    if (activation) selection.append({ prop: activation, value: clone.name })
  }

  everyRoot.append(selection)

  // Addressed: one definition, one clone, one declaration.
  const addressedRoot = parse(compiled.css)
  const one = specialize(addressedRoot, definitions[0], [['0', 'step-start']])
  const addressed = postcss.rule({
    selector: '.animation-timing-function-\\[0\\:step-start\\]\\/reveal',
  })

  addressed.append({ prop: activations[0][1], value: one.name })
  addressedRoot.append(addressed)

  console.log(
    `   corpus: ${LARGE.length} candidates, ${definitions.length} definitions`,
  )
  console.log(`   sheet bytes: ${compiled.css.length}`)
  console.log(
    `     addressed (/reveal):  +${addressedRoot.toString().length - compiled.css.length} bytes, ${one.added ? 1 : 0} clone, 1 declaration`,
  )
  console.log(
    `     unaddressed (all):    +${everyRoot.toString().length - compiled.css.length} bytes, ${clones} clones, ${definitions.length} declarations in one rule`,
  )
}
