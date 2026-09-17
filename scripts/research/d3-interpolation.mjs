import { chromium } from 'playwright'

import { compiler, finalizeCss, root } from '../lib/compile.mjs'

/**
 * D.3 · the keyword population — syntax justification, then the interpolation differential.
 *
 * `d3-reach.mjs` settled an **eligibility gate**: registering a keyword leaf typed must not change the
 * parent property's computed value at rest. This book starts where that stopped. For the pairs the gate
 * leaves standing, it asks the next two questions, and takes `movable` only when **both** hold:
 *
 *   1 · SYNTAX JUSTIFICATION   what typed representation does the model or the family itself justify?
 *                              A syntax widened to hold the resting keyword is a different proposal from
 *                              one that cannot, and the two get different verdicts.
 *   2 · INTERPOLATION          does the typed leaf driving the parent composition produce the same
 *                              parent property as the parent property animated natively?
 *
 * The second question is the one it is easy to ask wrongly. A typed leaf that interpolates smoothly is
 * **not** the claim — the claim is that it reproduces what the property does, including when the property
 * does *not* interpolate smoothly:
 *
 *   native:   font-weight: normal  ->  bold              (the property's own behaviour, measured)
 *   typed:    the registered leaf drives the same parent composition
 *   sample both, compare the computed PARENT property over time — not the custom property
 *
 * So the outcomes are three, and none of them is "the leaf interpolates":
 *
 *   movable                                  rest preserved, interpolation preserved
 *   registration-safe, interpolation-unsafe  rest preserved, interpolation diverges
 *   unresolved                               no defensible typed syntax mapping yet
 *
 * The set is the **representative** one the CTO asked for rather than all 99 — one shape per reason a
 * keyword can resist typing: an alias with a numeric equivalent (A), a sentinel with none (B), and a
 * keyword that is only part of a multi-part grammar (C). The fourth shape the CTO named, a keyword whose
 * computed value depends on sibling state, is the gate's `border-bottom-width` arm: it cannot be observed
 * at rest at all, which `d3-reach.mjs` records rather than decides.
 *
 * Run: `pnpm bundle && node scripts/research/d3-interpolation.mjs` (exits non-zero on failure).
 */
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${root}/dist/index.js";\n`

const compile = async candidates =>
  finalizeCss((await compiler(ENTRY, root)).build(candidates)).css

const WALL = [0, 500, 1000, 1500, 2000]

/**
 * Every value the sheet gives one declaration, in emission order.
 *
 * There is more than one, and that is the trap: a staging name contains the declaration it stages
 * (`--jumi-staging-animations---jumi-background-position-x: …`), so the *first* textual match is a payload
 * entry and not the composition. Measured — it read `0%` where the composition was expected, which made
 * the typed arm a constant and looked exactly like a real interpolation divergence.
 */
const candidatesOf = (css, declaration) =>
  [...css.matchAll(new RegExp(`--jumi-${declaration}:\\s*([^;]+);`, 'g'))].map(
    match => match[1].trim(),
  )

/**
 * The **composition** for one declaration — the value Jumi emits for it, selected by the slot it reads
 * rather than taken first. Selecting on that slot is what makes the arm test the composition; failing
 * loudly when it is absent is what stops the fixture drifting into a hand-copy of the model.
 */
const fromSheet = (css, declaration, needle) => {
  const found = candidatesOf(css, declaration).find(value =>
    value.includes(needle),
  )

  if (!found)
    throw new Error(
      `the sheet carries no --jumi-${declaration} containing ${needle}`,
    )

  return found
}

/**
 * The **rest** for one declaration: the candidate that is not itself a composition. That is the model's
 * resting value — `normal`, `left`, `0%` — read out of the emission rather than restated here, because it
 * is the thing the arm's registration has to stand in for.
 */
const restOf = (css, declaration) => {
  const found = candidatesOf(css, declaration).find(
    value => !value.includes('var('),
  )

  if (!found)
    throw new Error(
      `the sheet carries no resting value for --jumi-${declaration}`,
    )

  return found
}

/**
 * The **application** for one property: the declaration that hands it to a slot
 * (`font-weight: var(--jumi-font-weight-eBE)`), and that slot's name.
 *
 * This is the wiring the migration replaces, so the fixture must not paraphrase it: the versioned slot is
 * named by the emission, and a stored copy of `--jumi-font-weight-eBE` would keep compiling after the
 * emission had stopped emitting it.
 */
const applicationOf = (css, property) => {
  const found = new RegExp(
    `(?:^|[\\s{;])${property}:\\s*(var\\(--jumi-[A-Za-z0-9-]+\\))`,
    'm',
  ).exec(css)

  if (!found) throw new Error(`the sheet never applies ${property} to a slot`)

  return {
    application: found[1],
    slot: found[1].replace(/^var\(|\)$/g, ''),
  }
}

const browser = await chromium.launch()
const failures = []
const verdicts = []

/**
 * The parent at each instant of the wall: the animation is held and stepped rather than left running, so
 * the series is a property of the value and not of how long the sampler took to ask.
 */
const sampled = (page, style, property, klass = '') =>
  page
    .setContent(`<style>${style}</style><div id="e" class="${klass}">x</div>`)
    .then(() =>
      page.evaluate(
        async ({ at, property }) => {
          const node = document.querySelector('#e')
          const animations = node.getAnimations()

          animations.forEach(animation => animation.pause())

          const values = []

          for (const instant of at) {
            animations.forEach(animation => {
              animation.currentTime = instant
            })

            await new Promise(resolve => requestAnimationFrame(resolve))
            values.push(
              getComputedStyle(node).getPropertyValue(property).trim(),
            )
          }

          return { animations: animations.length, values }
        },
        { at: WALL, property },
      ),
    )

/** The engine's reading of a list of declarations, each on an element of its own. */
const computedOf = (page, property, declarations) =>
  page
    .setContent(
      `<style>${declarations
        .map((declaration, index) => `#q${index} { ${declaration} }`)
        .join('\n')}</style>` +
        declarations.map((_, index) => `<div id="q${index}"></div>`).join(''),
    )
    .then(() =>
      page.evaluate(
        ({ property, count }) =>
          Array.from({ length: count }, (_, index) =>
            getComputedStyle(document.getElementById(`q${index}`))
              .getPropertyValue(property)
              .trim(),
          ),
        { property, count: declarations.length },
      ),
    )

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * A · an alias with an obvious numeric equivalent — `font-weight`, resting at `normal`
 * ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * `normal` is `400` and `bold` is `700`, so the property rests at a *value* and the keyword is only a
 * spelling of it. Both numbers are read from the engine rather than written here, because "the keyword has
 * a numeric equivalent" is a claim about the engine — an arm that states `400` itself is testing its own
 * arithmetic.
 *
 * What the arm asks is the differential question: does the leaf, registered `<number>` and driving the
 * application Jumi emits, produce the same parent property over time as the parent animated **natively**
 * between the same two keywords?
 */
{
  const parent = 'font-weight'
  const far = 'bold'
  const sheet = await compile([`animate-${parent}-${far}`])

  // Off the sheet rather than restated: the property's resting value (`normal`) and the application that
  // hands the property to the slot the emission carries its target in.
  const rest = restOf(sheet, parent)
  const { application, slot } = applicationOf(sheet, parent)

  const page = await browser.newPage()

  // The engine's readings of the two keywords: the arm's only numbers, and the ones the registration has
  // to accept in place of the resting keyword.
  const [restNumeric, farNumeric] = await computedOf(page, parent, [
    `${parent}: ${rest}`,
    `${parent}: ${far}`,
  ])

  const registration = `@property ${slot} {
    syntax: "<number>";
    inherits: false;
    initial-value: ${restNumeric};
  }`

  // Native: the property itself, between its two keywords.
  const native = `
    @keyframes armA { from { ${parent}: ${rest} } to { ${parent}: ${far} } }
    #e { animation: armA 2000ms linear both; }
  `

  // Typed: the leaf registered and interpolated, with the property reading the emitted application.
  const typed = `
    ${registration}
    @keyframes armAT { from { ${slot}: ${restNumeric} } to { ${slot}: ${farNumeric} } }
    #e { ${parent}: ${application}; animation: armAT 2000ms linear both; }
  `

  const nativeReading = await sampled(page, native, parent)
  const typedReading = await sampled(page, typed, parent)

  await page.close()

  const agrees =
    nativeReading.values.join(' | ') === typedReading.values.join(' | ')

  if (!nativeReading.animations || !typedReading.animations)
    failures.push('A: an arm has no animation to step')

  if (!agrees)
    failures.push(
      `A ${parent}: native ${nativeReading.values.join(' | ')} but typed ${typedReading.values.join(' | ')}`,
    )

  verdicts.push(
    `A  ${parent.padEnd(28)} ${agrees ? 'movable' : 'registration-safe, interpolation-unsafe'}\n` +
      `     rest \`${rest}\` = ${restNumeric} · far \`${far}\` = ${farNumeric} (engine's numbers)\n` +
      `     slot \`${slot}\` applied by \`${application}\` · candidates ${candidatesOf(sheet, parent).join(' · ')}\n` +
      `     native ${nativeReading.values.join(' · ')}\n     typed  ${typedReading.values.join(' · ')}`,
  )
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * B · a sentinel whose value depends on the element's other properties — `column-gap`, resting at `normal`
 * ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * `normal` is not a length with another spelling; it is a *context-dependent* value. The gate already
 * refuses it (`0px normal -> 0px`), and this arm records **why**, because the reason is what makes it
 * `unresolved` rather than merely unsafe: no context-free typed rest can stand in for it. Measured as the
 * rendered gap in two containers, since the computed value is `normal` in both.
 */
{
  const page = await browser.newPage()

  await page.setContent(`<style>
    #flex { display: flex; }
    #columns { columns: 2; column-gap: normal; }
    .box { width: 10px; height: 10px; background: red; }
  </style>
  <div id="flex"><div class="box" id="f1"></div><div class="box" id="f2"></div></div>
  <div id="columns"><div class="box" id="c1"></div><div class="box" id="c2"></div></div>`)

  const reading = await page.evaluate(() => {
    const gap = (first, second) => {
      const a = document.getElementById(first).getBoundingClientRect()
      const b = document.getElementById(second).getBoundingClientRect()

      return Math.round((b.left - a.right) * 100) / 100
    }

    return {
      computed: getComputedStyle(document.getElementById('f1')).columnGap,
      columns: gap('c1', 'c2'),
      flex: gap('f1', 'f2'),
    }
  })

  await page.close()

  const contextDependent = reading.flex !== reading.columns

  if (!contextDependent)
    failures.push(
      `B column-gap: \`normal\` rendered the same gap in both contexts (${reading.flex} / ${reading.columns}), so this arm is not exercising anything`,
    )

  verdicts.push(
    `B  column-gap (rests at normal)  unresolved\n` +
      `     computed \`${reading.computed}\` in both, but it RENDERS ${reading.flex}px in flex and ${reading.columns}px in columns — no context-free typed rest can stand in for it`,
  )
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * C · a keyword participating in a multi-part grammar — `background-position-x-edge`, resting at `left`
 * ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * The gate passed this leaf (`0% -> 0%`), and its *shape* is why it is here: `left` is not the property's
 * value, it is the `edge` half of a pair, which the model composes as
 * `var(--jumi-background-position-x-edge) var(--jumi-background-position-x-offset)`.
 *
 * So the differential has to be asked of the composition — and the composition is not a value of the
 * longhand at all. Measured: the leaf interpolates `0% -> 100%` while the parent never leaves its initial
 * value, and the reason is grammar rather than registration. That is `unresolved`, and it is a different
 * finding from `interpolation-unsafe`: nothing here shows a typed leaf interpolating wrongly, it shows
 * that this leaf cannot be exercised on its own.
 */
{
  const parent = 'background-position-x'
  const leaf = `${parent}-edge`
  const far = 'right'
  const sheet = await compile([`animate-${parent}-offset-[0:0|100:0]`])

  const composition = fromSheet(sheet, parent, `var(--jumi-${leaf})`)
  const rest = restOf(sheet, leaf)

  const page = await browser.newPage()

  // Four readings, each on an element of its own: the leaf's keyword and the arm's far keyword as the
  // engine resolves them, and then whether a *pair* is a value of this longhand at all.
  const [leafRest, leafFar, single, pair] = await computedOf(page, parent, [
    `${parent}: ${rest}`,
    `${parent}: ${far}`,
    `${parent}: 100%`,
    `${parent}: 100% 0%`,
  ])

  // Where the pair *does* belong: the shorthand the model composes above this one. Measured so the arm's
  // boundary is a reading rather than an attribution — and it is a different parent, so it is not asked
  // to a verdict here.
  const [shorthand] = await computedOf(page, 'background-position', [
    'background-position: left 0% top 0%',
  ])

  const registration = `@property --jumi-${leaf} {
    syntax: "<length-percentage>";
    inherits: false;
    initial-value: ${leafRest};
  }`

  const typed = `
    ${registration}
    @keyframes armCT { from { --jumi-${leaf}: ${leafRest} } to { --jumi-${leaf}: ${leafFar} } }
    #e {
      --jumi-${parent}-offset: ${leafRest};
      ${parent}: ${composition};
      animation: armCT 2000ms linear both;
    }
  `

  const leafReading = await sampled(page, typed, `--jumi-${leaf}`)
  const parentReading = await sampled(page, typed, parent)

  await page.close()

  const moved = leafReading.values.join(' | ') !== `${leafRest} | ${leafRest}`

  if (!moved)
    failures.push(
      'C: the leaf never interpolated, so the arm proves nothing about the composition',
    )

  verdicts.push(
    `C  ${leaf.padEnd(28)} unresolved\n` +
      `     rest \`${rest}\` = ${leafRest} · far \`${far}\` = ${leafFar} (engine's readings)\n` +
      `     longhand: \`${parent}: 100%\` reads ${single}, but \`100% 0%\` reads ${pair} — the pair is dropped, not honoured\n` +
      `     shorthand: \`background-position: left 0% top 0%\` reads ${shorthand} (its own initial is \`50% 50%\`) — honoured there, and that is a different parent\n` +
      `     leaf   ${leafReading.values.join(' · ')}\n` +
      `     parent ${parentReading.values.join(' · ')}`,
  )
}

await browser.close()

console.log(verdicts.join('\n'))

if (failures.length) {
  console.error(`\n✗ ${failures.length} arm(s) disagree:\n`)
  for (const failure of failures) console.error(`  ${failure}`)
  process.exit(1)
}

console.log(`\n✓ ${verdicts.length} shape(s) recorded, no arm disagrees\n`)
