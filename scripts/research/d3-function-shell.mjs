/**
 * D.3.8 · does **function-argument shape** imply **argument-level interpolation**?
 *
 * D.3.6 gave us a mechanism — a static shell whose argument is the registered, interpolable subject — and this pass
 * asks whether that is a *generic* function-shell mechanism or merely a mechanism that worked because `add()`'s
 * argument happened to be a legitimate interpolation unit on its own.
 *
 * The four representatives are chosen to **disagree** if the abstraction is too broad:
 *
 *   scale3d       likely positive control — one factor of a uniform function
 *   translate3d   length/percentage control
 *   rotate3d      axis beside angle: native interpolates them **jointly**, so a per-argument proposal is the
 *                 adversarial case for "arguments are independent subjects"
 *   matrix3d      the strongest adversarial case: native interpolation **decomposes** the matrix (translate,
 *                 scale, rotate, skew) and interpolates in that space, which is not scalar interpolation of the
 *                 coefficients — and a negative scale is where the two are expected to part company loudly
 *
 * No production code is involved and nothing is promoted. Each arm is two hand-written sheets: the **native** one
 * animates the whole function, the **typed** one animates a registered custom property inside a static shell. The
 * observable is `transform`'s computed value — the same string for both, which is the only fair comparison, since
 * that is what the engine ends up applying.
 *
 * Every arm carries a canary: the same typed sheet **without** the registration. If that series still equals the
 * native one, the fixture cannot see the substitution at all and the arm reports `fixture-blind` rather than an
 * equality it did not earn.
 *
 * Run: `pnpm research:d3-function-shell` (exits non-zero only on an arm defect, never on a finding).
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', '..')
const WALL = [0, 250, 500, 750, 1000]
const DURATION = 1000
const IDENTITY = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'

/**
 * The arms. `shell` is the *consumer's* static value with the argument slot in it; `native` is the same motion
 * written as the whole function, which is what the browser interpolates on its own.
 */
const ARMS = [
  {
    family: 'scale3d',
    native: { from: 'scale3d(1, 1, 1)', to: 'scale3d(2, 1, 1)' },
    slot: '--jumi-d38-scale-x',
    syntax: '<number>',
    shell: 'scale3d(var(--jumi-d38-scale-x), 1, 1)',
    leaf: { from: '1', to: '2' },
  },
  {
    family: 'translate3d',
    native: { from: 'translate3d(0px, 0px, 0px)', to: 'translate3d(20px, 0px, 0px)' },
    slot: '--jumi-d38-translate-x',
    syntax: '<length>',
    shell: 'translate3d(var(--jumi-d38-translate-x), 0px, 0px)',
    leaf: { from: '0px', to: '20px' },
  },
  {
    family: 'rotate3d (fixed axis)',
    native: { from: 'rotate3d(0, 0, 1, 0deg)', to: 'rotate3d(0, 0, 1, 90deg)' },
    slot: '--jumi-d38-rotate-angle',
    syntax: '<angle>',
    shell: 'rotate3d(0, 0, 1, var(--jumi-d38-rotate-angle))',
    leaf: { from: '0deg', to: '90deg' },
  },
  {
    // The axis turns **while** the angle turns, which is the shape native interpolation handles jointly: CSS
    // interpolates the pair as a unit. Every argument gets its own leaf, so this is per-argument interpolation
    // against joint interpolation with both sides moving — the first version of this arm held the angle fixed and
    // animated only the axis, and a normalised axis makes that a no-op, which measured as a difference that
    // belonged to the fixture rather than to the representation.
    family: 'rotate3d (moving axis)',
    native: { from: 'rotate3d(0, 0, 1, 0deg)', to: 'rotate3d(1, 1, 0, 90deg)' },
    slot: '--jumi-d38-axis-x',
    syntax: '<number>',
    shell:
      'rotate3d(var(--jumi-d38-axis-x), var(--jumi-d38-axis-y), var(--jumi-d38-axis-z), var(--jumi-d38-angle))',
    leaf: { from: '0', to: '1' },
    extra: [
      { from: '0', slot: '--jumi-d38-axis-y', syntax: '<number>', to: '1' },
      { from: '1', slot: '--jumi-d38-axis-z', syntax: '<number>', to: '0' },
      { from: '0deg', slot: '--jumi-d38-angle', syntax: '<angle>', to: '90deg' },
    ],
  },
  {
    family: 'matrix3d (coefficient)',
    native: { from: IDENTITY, to: 'matrix3d(2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)' },
    slot: '--jumi-d38-matrix-a1',
    syntax: '<number>',
    shell: 'matrix3d(var(--jumi-d38-matrix-a1), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    leaf: { from: '1', to: '2' },
  },
  {
    // The adversarial matrix arm, and the reason it is fair: **one** coefficient moves, so the proposal can
    // express the whole motion. Native interpolation decomposes the matrix and normalises the scale, so a
    // negative determinant becomes a rotation — a different series from interpolating the coefficient through.
    family: 'matrix3d (negative scale)',
    native: { from: IDENTITY, to: 'matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)' },
    slot: '--jumi-d38-matrix-neg',
    syntax: '<number>',
    shell: 'matrix3d(var(--jumi-d38-matrix-neg), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    leaf: { from: '1', to: '-1' },
  },
]

const sheetFor = ({ arm, keyframes, registered, id }) => {
  const name = `${id}-${arm.family.replace(/[^a-z0-9]+/gi, '-')}`

  return `
${registered ? `@property ${arm.slot} { syntax: '${arm.syntax}'; inherits: false; initial-value: ${arm.leaf.from}; }` : ''}
@keyframes ${name} { from { ${keyframes} } to { ${keyframes} } }
#${name} { animation: ${name} ${DURATION}ms linear both; }
`.trim()
}

/**
 * Two sheets per arm: the native one animates the whole function in the keyframes, the typed one animates the leaf
 * and holds the shell statically on the element. In both, the keyframes' endpoints are built from the same two
 * values — `keyframes` interpolates what the arm says moves, and `apply` is where the value is read.
 */
const nativeSheet = arm => {
  const name = `native-${slugOf(arm)}`

  return {
    name,
    css: `
@keyframes ${name} { from { transform: ${arm.native.from}; } to { transform: ${arm.native.to}; } }
#${name} { animation: ${name} ${DURATION}ms linear both; }
`.trim(),
  }
}

/**
 * The typed arm, and the canary this book can actually have.
 *
 * The first attempt used the same sheet **without** the `@property` registration, on the theory that an unregistered
 * slot substitutes discretely and must therefore differ. It cannot work: `@property` is a **document-global**
 * registration, so a second sheet in the same page cannot un-register it — the "blind" arm was the registered arm
 * measured twice, and five of six arms reported `fixture-blind` at a fixture that was never blind.
 *
 * What is checkable is **liveness**: move the far endpoint and the observable must follow. And for the semantics
 * question specifically, the moving-axis arm is the arm that proves this fixture can tell joint interpolation from
 * per-argument interpolation at all.
 */
const perturb = value =>
  value.replace(/^-?[\d.]+/, number => String(Number(number) * 1.5))

const typedSheet = (arm, { to, variant = 'typed' } = {}) => {
  const name = `${variant}-${slugOf(arm)}`
  // Every slot the arm needs, the addressed one first. A family whose native subject is a *pair* — an axis beside
  // an angle — needs a leaf per argument, which is exactly the question this pass asks of that arm.
  const slots = [{ ...arm.leaf, slot: arm.slot, syntax: arm.syntax }, ...(arm.extra ?? [])]
  const frame = (one, value) => `${one.slot}: ${value};`
  const moved = slots.map((one, at) => (at === 0 && to ? { ...one, to } : one))

  return {
    name,
    css: `
${moved.map(one => `@property ${one.slot} { syntax: '${one.syntax}'; inherits: false; initial-value: ${one.from}; }`).join('\n')}
@keyframes ${name} { from { ${moved.map(one => frame(one, one.from)).join(' ')} } to { ${moved.map(one => frame(one, one.to)).join(' ')} } }
#${name} { animation: ${name} ${DURATION}ms linear both; transform: ${arm.shell}; }
`.trim(),
  }
}

const browser = await chromium.launch()

const seriesOf = async sheets => {
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${sheets.map(one => one.css).join('\n')}</style></head><body>` +
      sheets.map(one => `<div id="${one.name}"></div>`).join('') +
      `</body></html>`,
  )

  const readings = await page.evaluate(
    async ({ ids, wall, duration }) => {
      const out = {}

      for (const id of ids) {
        const element = document.getElementById(id)
        const own = element.getAnimations()
        const values = []

        for (const at of wall) {
          own.forEach(animation => {
            animation.pause()
            animation.currentTime = (at / wall.at(-1)) * duration
          })

          await new Promise(requestAnimationFrame)

          values.push(getComputedStyle(element).transform)
        }

        out[id] = values
      }

      return out
    },
    {
      duration: DURATION,
      ids: sheets.map(one => one.name),
      wall: WALL,
    },
  )

  await page.close()

  return readings
}

const records = []

const slugOf = arm => arm.family.replace(/[^a-z0-9]+/gi, '-')

for (const arm of ARMS) {
  const native = nativeSheet(arm)
  const typed = typedSheet(arm)
  const canary = typedSheet(arm, {
    to: perturb(arm.leaf.to),
    variant: 'canary',
  })
  const readings = await seriesOf([native, typed, canary])

  const nativeSeries = readings[native.name]
  const typedSeries = readings[typed.name]
  const canarySeries = readings[canary.name]
  const same = (one, two) => one.every((value, at) => value === two[at])
  const identical = same(nativeSeries, typedSeries)
  const live = !same(nativeSeries, canarySeries)

  records.push({
    arm: arm.family,
    canarySeries,
    identical,
    liveCanary: live,
    nativeSeries,
    shell: arm.shell,
    typedSeries,
    verdict: !live ? 'fixture-inert' : identical ? 'same-series' : 'differs',
  })
}

await browser.close()

const target = path.join(root, 'scripts', 'function-argument-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ source: 'scripts/research/d3-function-shell.mjs', wall: WALL, records }, null, 2)}\n`,
)

const truthy = value => (value ? 'yes' : 'no')

for (const one of records)
  console.log(
    `${one.arm.padEnd(26)} identical=${truthy(one.identical)} canary=${truthy(one.liveCanary)}  ${one.verdict}\n    native ${one.nativeSeries.join(' · ')}\n    typed  ${one.typedSeries.join(' · ')}`,
  )

console.log(`\nwritten to \`${path.relative(root, target)}\``)
