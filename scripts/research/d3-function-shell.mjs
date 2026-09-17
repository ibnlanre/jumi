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
const IDENTITY2 = 'matrix(1, 0, 0, 1, 0, 0)'

/**
 * The arms. `shell` is the *consumer's* static value with the argument slot in it; `native` is the same motion
 * written as the whole function, which is what the browser interpolates on its own.
 */
const ARMS = [
  {
    family: 'scale3d',
    leaf: { from: '1', to: '2' },
    native: { from: 'scale3d(1, 1, 1)', to: 'scale3d(2, 1, 1)' },
    shell: 'scale3d(var(--jumi-d38-scale-x), 1, 1)',
    slot: '--jumi-d38-scale-x',
    syntax: '<number>',
  },
  {
    family: 'translate3d',
    leaf: { from: '0px', to: '20px' },
    native: {
      from: 'translate3d(0px, 0px, 0px)',
      to: 'translate3d(20px, 0px, 0px)',
    },
    shell: 'translate3d(var(--jumi-d38-translate-x), 0px, 0px)',
    slot: '--jumi-d38-translate-x',
    syntax: '<length>',
  },
  {
    family: 'rotate3d (fixed axis)',
    leaf: { from: '0deg', to: '90deg' },
    native: { from: 'rotate3d(0, 0, 1, 0deg)', to: 'rotate3d(0, 0, 1, 90deg)' },
    shell: 'rotate3d(0, 0, 1, var(--jumi-d38-rotate-angle))',
    slot: '--jumi-d38-rotate-angle',
    syntax: '<angle>',
  },
  {
    extra: [
      { from: '0', slot: '--jumi-d38-axis-y', syntax: '<number>', to: '1' },
      { from: '1', slot: '--jumi-d38-axis-z', syntax: '<number>', to: '0' },
      {
        from: '0deg',
        slot: '--jumi-d38-angle',
        syntax: '<angle>',
        to: '90deg',
      },
    ],
    // The axis turns **while** the angle turns, which is the shape native interpolation handles jointly: CSS
    // interpolates the pair as a unit. Every argument gets its own leaf, so this is per-argument interpolation
    // against joint interpolation with both sides moving — the first version of this arm held the angle fixed and
    // animated only the axis, and a normalised axis makes that a no-op, which measured as a difference that
    // belonged to the fixture rather than to the representation.
    family: 'rotate3d (moving axis)',
    kind: 'simultaneous',
    leaf: { from: '0', to: '1' },
    native: { from: 'rotate3d(0, 0, 1, 0deg)', to: 'rotate3d(1, 1, 0, 90deg)' },
    shell:
      'rotate3d(var(--jumi-d38-axis-x), var(--jumi-d38-axis-y), var(--jumi-d38-axis-z), var(--jumi-d38-angle))',
    slot: '--jumi-d38-axis-x',
    syntax: '<number>',
  },
  {
    family: 'matrix3d (coefficient)',
    leaf: { from: '1', to: '2' },
    native: {
      from: IDENTITY,
      to: 'matrix3d(2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    shell:
      'matrix3d(var(--jumi-d38-matrix-a1), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    slot: '--jumi-d38-matrix-a1',
    syntax: '<number>',
  },
  {
    // The adversarial matrix arm, and the reason it is fair: **one** coefficient moves, so the proposal can
    // express the whole motion. Native interpolation decomposes the matrix and normalises the scale, so a
    // negative determinant becomes a rotation — a different series from interpolating the coefficient through.
    family: 'matrix3d (negative scale)',
    leaf: { from: '1', to: '-1' },
    native: {
      from: IDENTITY,
      to: 'matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    shell:
      'matrix3d(var(--jumi-d38-matrix-neg), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    slot: '--jumi-d38-matrix-neg',
    syntax: '<number>',
  },

  /**
   * **Simultaneous movement** — the compositional question, which is the one production has to answer.
   *
   * One argument reproducing native says the argument is an interpolation unit. It does **not** say two migrated
   * arguments compose, and Jumi cannot find out later: every route compiles on its own, so a family cannot decide
   * at runtime *"another constituent is on this element, use native instead"* — that is the element-context problem
   * this track already refused. So a family enters the generic typed constituent path only if its arguments stay
   * equivalent when they move together.
   *
   * `rotate3d (moving axis)` above is the known control. The matrix arms are here because one coefficient matching
   * is not enough to call sixteen coefficients independent: the shear pair and, especially, the rotation-like pair
   * are credible attempts to falsify separability, since a rotation is expressible in coefficients and native
   * interpolation will keep the basis a unit vector where linear coefficients collapse it to zero at the midpoint.
   */
  {
    extra: [
      { from: '1', slot: '--jumi-d38-s2-scale-y', syntax: '<number>', to: '3' },
    ],
    family: 'scale3d (x + y)',
    kind: 'simultaneous',
    leaf: { from: '1', to: '2' },
    native: { from: 'scale3d(1, 1, 1)', to: 'scale3d(2, 3, 1)' },
    shell: 'scale3d(var(--jumi-d38-s2-scale-x), var(--jumi-d38-s2-scale-y), 1)',
    slot: '--jumi-d38-s2-scale-x',
    syntax: '<number>',
  },
  {
    extra: [
      {
        from: '0px',
        slot: '--jumi-d38-s2-translate-y',
        syntax: '<length>',
        to: '40px',
      },
    ],
    family: 'translate3d (x + y)',
    kind: 'simultaneous',
    leaf: { from: '0px', to: '20px' },
    native: {
      from: 'translate3d(0px, 0px, 0px)',
      to: 'translate3d(20px, 40px, 0px)',
    },
    shell:
      'translate3d(var(--jumi-d38-s2-translate-x), var(--jumi-d38-s2-translate-y), 0px)',
    slot: '--jumi-d38-s2-translate-x',
    syntax: '<length>',
  },
  {
    extra: [
      { from: '0', slot: '--jumi-d38-s2-m12', syntax: '<number>', to: '0.5' },
    ],
    family: 'matrix3d (scale + shear)',
    kind: 'simultaneous',
    leaf: { from: '1', to: '2' },
    native: {
      from: IDENTITY,
      to: 'matrix3d(2, 0.5, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    shell:
      'matrix3d(var(--jumi-d38-s2-m11), var(--jumi-d38-s2-m12), 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    slot: '--jumi-d38-s2-m11',
    syntax: '<number>',
  },
  {
    extra: [
      { from: '0', slot: '--jumi-d38-s2-r12', syntax: '<number>', to: '1' },
      { from: '0', slot: '--jumi-d38-s2-r21', syntax: '<number>', to: '-1' },
      { from: '1', slot: '--jumi-d38-s2-r22', syntax: '<number>', to: '0' },
    ],
    family: 'matrix3d (rotation-like)',
    kind: 'simultaneous',
    leaf: { from: '1', to: '0' },
    native: {
      from: IDENTITY,
      to: 'matrix3d(0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    },
    shell:
      'matrix3d(var(--jumi-d38-s2-r11), var(--jumi-d38-s2-r12), 0, 0, var(--jumi-d38-s2-r21), var(--jumi-d38-s2-r22), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    slot: '--jumi-d38-s2-r11',
    syntax: '<number>',
  },
]

const sheetFor = ({ arm, id, keyframes, registered }) => {
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
    css: `
@keyframes ${name} { from { transform: ${arm.native.from}; } to { transform: ${arm.native.to}; } }
#${name} { animation: ${name} ${DURATION}ms linear both; }
`.trim(),
    name,
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
  const slots = [
    { ...arm.leaf, slot: arm.slot, syntax: arm.syntax },
    ...(arm.extra ?? []),
  ]
  const frame = (one, value) => `${one.slot}: ${value};`
  const moved = slots.map((one, at) => (at === 0 && to ? { ...one, to } : one))

  return {
    css: `
${moved.map(one => `@property ${one.slot} { syntax: '${one.syntax}'; inherits: false; initial-value: ${one.from}; }`).join('\n')}
@keyframes ${name} { from { ${moved.map(one => frame(one, one.from)).join(' ')} } to { ${moved.map(one => frame(one, one.to)).join(' ')} } }
#${name} { animation: ${name} ${DURATION}ms linear both; transform: ${arm.shell}; }
`.trim(),
    name,
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
    async ({ duration, ids, wall }) => {
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

/**
 * The second batch: the three-way arms, and `matrix` measured on its own.
 *
 * Kept as its own array rather than woven into the first, so the readings the first batch produced stay exactly
 * where they were while these are added — the comparison is against the same wall and the same sheet builders.
 */
const EXTRA_ARMS = [
  {
    // **All three** components, because the criterion is family-level separability: the strongest realistic
    // combination has to survive, not merely `x + y`.
    family: 'scale3d (x + y + z)',
    kind: 'simultaneous',
    native: { from: 'scale3d(1, 1, 1)', to: 'scale3d(2, 3, 0.5)' },
    slot: '--jumi-d38-s3-scale-x',
    syntax: '<number>',
    shell:
      'scale3d(var(--jumi-d38-s3-scale-x), var(--jumi-d38-s3-scale-y), var(--jumi-d38-s3-scale-z))',
    leaf: { from: '1', to: '2' },
    extra: [
      { from: '1', slot: '--jumi-d38-s3-scale-y', syntax: '<number>', to: '3' },
      { from: '1', slot: '--jumi-d38-s3-scale-z', syntax: '<number>', to: '0.5' },
    ],
  },
  {
    // The richest grammar the candidates carry — `<length>` and `<percentage>` side by side — because a difference
    // that only appears when two units are interpolated together is the kind this pass exists to find.
    family: 'translate3d (x + y + z, mixed)',
    kind: 'simultaneous',
    native: {
      from: 'translate3d(0%, 0px, 0px)',
      to: 'translate3d(50%, 40px, 20px)',
    },
    slot: '--jumi-d38-s3-translate-x',
    syntax: '<length-percentage>',
    shell:
      'translate3d(var(--jumi-d38-s3-translate-x), var(--jumi-d38-s3-translate-y), var(--jumi-d38-s3-translate-z))',
    leaf: { from: '0%', to: '50%' },
    extra: [
      {
        from: '0px',
        slot: '--jumi-d38-s3-translate-y',
        syntax: '<length>',
        to: '40px',
      },
      {
        from: '0px',
        slot: '--jumi-d38-s3-translate-z',
        syntax: '<length>',
        to: '20px',
      },
    ],
  },
  {
    // `matrix` is measured **independently**: `matrix3d` being falsified is a reason to distrust it, not evidence
    // about the 2-D function, which has its own decomposition. Three arms — the control and both adversarial shapes.
    family: 'matrix (coefficient)',
    native: { from: IDENTITY2, to: 'matrix(2, 0, 0, 1, 0, 0)' },
    slot: '--jumi-d38-m2-a',
    syntax: '<number>',
    shell: 'matrix(var(--jumi-d38-m2-a), 0, 0, 1, 0, 0)',
    leaf: { from: '1', to: '2' },
  },
  {
    family: 'matrix (scale + shear)',
    kind: 'simultaneous',
    native: { from: IDENTITY2, to: 'matrix(2, 0.5, 0, 1, 0, 0)' },
    slot: '--jumi-d38-m2-sa',
    syntax: '<number>',
    shell: 'matrix(var(--jumi-d38-m2-sa), var(--jumi-d38-m2-sb), 0, 1, 0, 0)',
    leaf: { from: '1', to: '2' },
    extra: [
      { from: '0', slot: '--jumi-d38-m2-sb', syntax: '<number>', to: '0.5' },
    ],
  },
  {
    family: 'matrix (rotation-like)',
    kind: 'simultaneous',
    native: { from: IDENTITY2, to: 'matrix(0, 1, -1, 0, 0, 0)' },
    slot: '--jumi-d38-m2-r1',
    syntax: '<number>',
    shell:
      'matrix(var(--jumi-d38-m2-r1), var(--jumi-d38-m2-r2), var(--jumi-d38-m2-r3), var(--jumi-d38-m2-r4), 0, 0)',
    leaf: { from: '1', to: '0' },
    extra: [
      { from: '0', slot: '--jumi-d38-m2-r2', syntax: '<number>', to: '1' },
      { from: '0', slot: '--jumi-d38-m2-r3', syntax: '<number>', to: '-1' },
      { from: '1', slot: '--jumi-d38-m2-r4', syntax: '<number>', to: '0' },
    ],
  },
]

const records = []

const slugOf = arm => arm.family.replace(/[^a-z0-9]+/gi, '-')

for (const arm of [...ARMS, ...EXTRA_ARMS]) {
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
    kind: arm.kind ?? 'single',
    liveCanary: live,
    nativeSeries,
    shell: arm.shell,
    typedSeries,
    verdict: !live ? 'fixture-inert' : identical ? 'same-series' : 'differs',
  })
}

await browser.close()

const families = [...new Set(records.map(one => one.arm.split(' ')[0]))].map(
  family => {
    const own = records.filter(one => one.arm.split(' ')[0] === family)

    /**
     * The class production reads, and it is deliberately the **whole family**: every arm, single and simultaneous,
     * must reproduce native for the family to be eligible. `separable` is not a compliment for one route; it is a
     * claim about the function's arguments when they move together, which is the only claim that survives the fact
     * that a route compiles without knowing what else is on the element.
     */
    return {
      arms: own.length,
      class: own.every(one => one.verdict === 'same-series')
        ? 'separable'
        : 'coupled',
      family,
    }
  },
)

const target = path.join(root, 'scripts', 'function-argument-series.json')

fs.writeFileSync(
  target,
  `${JSON.stringify({ families, source: 'scripts/research/d3-function-shell.mjs', wall: WALL, records }, null, 2)}\n`,
)

const truthy = value => (value ? 'yes' : 'no')

for (const one of records)
  console.log(
    `${one.kind.padEnd(12)} ${one.arm.padEnd(30)} identical=${truthy(one.identical)} canary=${truthy(one.liveCanary)}  ${one.verdict}`,
  )

console.log('')

for (const one of families)
  console.log(
    `${one.family.padEnd(14)} ${one.class.padEnd(10)} ${one.arms} arm(s)`,
  )

console.log(`\nwritten to \`${path.relative(root, target)}\``)
