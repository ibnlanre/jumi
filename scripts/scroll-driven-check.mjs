#!/usr/bin/env node
/**
 * Scroll-driven check — does a retargeted slot actually scrub, in a real browser?
 *
 * The spike (`pnpm spike:scroll-driven`, `engineering/research/scroll-driven.md`) established the
 * platform facts and the emission shape. This is the part that has to keep being true: a scroll
 * timeline is a *control over an existing motion*, and the controls Jumi already had must keep
 * meaning something once the driver stops being time.
 *
 * Five of these assertions exist because the failure they catch is silent, and silence is what makes
 * them worth a gate stage rather than a note:
 *
 *   · **A range must land on the position that asked for it.** `animation-range` is a list per
 *     animation, like `animation-timeline`, so a value written for the `rotate` slot must resolve at
 *     the rotate position and nowhere else.
 *   · **An illegal fallback kills the whole declaration.** Measured: `animation-range: var(--set, normal 0% normal 100%)`
 *     on a two-position list resolves to `normal` — the position that *was* set loses its range too,
 *     because one unparsable substituted value invalidates the declaration at computed-value time.
 *     The substrate therefore declares no default for the two timeline-name halves and the
 *     composition supplies an empty `var()` fallback, which is why this file asserts the default
 *     *and* a live position rather than either one alone.
 *   · **A range must not cost a page that never asked for one.** Every animating element now carries
 *     an `animation-range` declaration. The un-ranged arm below is the regression that catches the
 *     ordinary case breaking while the feature works.
 *   · **The platform does not honour reduced motion here.** Under `reduce` a scroll-driven slot is
 *     still scrubbed; only an author's clamp stops it, and wrapping the *timeline* in `motion-safe:`
 *     changes the driver instead of removing the motion.
 *   · **An axis that cannot scroll fails open.** No animation at all, no warning, base state
 *     painted — the shape a typo takes. *   · **A range must land on the motion that asked for it, and on no other.** The control and the
 *     variant reach the same slot variable by different routes — a declaration the control writes, a
 *     class the variant's reader decodes off the selector — and a publication that ranged the wrong
 *     slot would still scrub, which is why this is measured as motion and not as a declaration. *
 * Run: pnpm scroll-driven:check
 */
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { ensureBundle } from './bundle.mjs'

import path from 'node:path'
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

ensureBundle()

const { build, compiler } = await import('./lib/compile.mjs')
const { splitTopLevel } = await import('./lib/css.mjs')

/** The arms. Each one is a claim about a control, and the classes are the whole of the input. */
const MOTION_KINDS = [
  ['an effect', 'animate-fade-in'],
  ['a single value', 'animate-opacity-50'],
  ['a phrase', 'animate-opacity-[0:0|100:1]'],
  ['a named phrase', 'animate-opacity-[0:0|100:1]/reveal'],
]

const ARMS = [
  // The feature.
  {
    classes:
      'animate-fade-in animate-rotate-45 animation-timeline-scroll animation-range-[25%_75%]/rotate',
    id: 'ranged',
  },
  // The control: same element, same slots, no range at all.
  {
    classes: 'animate-fade-in animate-rotate-45 animation-timeline-scroll',
    id: 'unranged',
  },
  // One slot retargeted, the other left on the document timeline.
  {
    classes:
      'animate-fade-in animate-rotate-45 animation-timeline-scroll/rotate',
    id: 'mixed',
  },
  // Time values on a progress-based timeline: delay is a share of the scroll, not a wait.
  {
    classes: 'animate-fade-in animation-timeline-scroll animation-delay-600',
    id: 'delayed',
  },
  // A range and a delay on one slot: the range places the window, the delay compresses within it.
  {
    classes:
      'animate-fade-in animation-timeline-scroll animation-range-[25%_75%]/fade-in animation-delay-600',
    id: 'delayedRange',
  },
  // A view-driven entrance, for the fallback arm below.
  { classes: 'animate-fade-in animation-timeline-view', id: 'viewDriven' },
  // The view-timeline inset, which is a `<length-percentage>`: a percentage is the common case and
  // was refused silently by a `type: 'length'` on the control.
  {
    classes:
      'animate-fade-in animation-timeline-view animation-timeline-inset-start-[20%] animation-timeline-inset-end-[10%]',
    id: 'inset',
  },
  // A typo'd axis on a page with nothing to scroll horizontally.
  {
    classes:
      'animate-fade-in animation-timeline-scroll animation-timeline-axis-x',
    id: 'axisX',
  },
  // The two reduced-motion spellings: the clamp, and the bare arm the platform leaves alone.
  {
    classes:
      'animate-fade-in animation-timeline-scroll motion-reduce:animation-timeline-none',
    id: 'clamped',
  },
  { classes: 'animate-fade-in animation-timeline-scroll', id: 'bare' },
  // The author's strict path: motion *and* timeline behind one capability query, so a browser that
  // cannot do scroll-driven animation runs nothing at all rather than a time-driven stand-in. The
  // second arm uses a query that cannot match, which is the only way to measure the negative half in
  // a browser that does support timelines — see the note on that assertion.
  {
    classes:
      'supports-[animation-timeline:scroll()]:animate-fade-in supports-[animation-timeline:scroll()]:animation-timeline-scroll',
    id: 'guarded',
  },
  {
    classes:
      'supports-[animation-timeline:definitely-not-a-timeline]:animate-fade-in supports-[animation-timeline:definitely-not-a-timeline]:animation-timeline-scroll',
    id: 'guardedFalse',
  },
  // The range as a composition variant: the same intent as `animation-range-*/slot`, written on the
  // candidate instead. This one is the claim that matters most — one element, two motions, one of them
  // ranged by the variant and one not, so a publication that ranged the wrong slot shows up as a
  // motion in the wrong place rather than as a missing declaration.
  {
    classes:
      'animate-fade-in animate-rotate-45 animation-timeline-scroll animation-range-[25%_75%]:animate-fade-in',
    id: 'variantScoped',
  },
  // Two ranged motions on one element, by name, through a view timeline: the two ranges must not swap.
  {
    classes:
      'animate-fade-in animate-fade-out animation-timeline-view animation-range-entry:animate-fade-in animation-range-exit:animate-fade-out',
    id: 'variantPair',
  },
  // Ordinary Tailwind conditions stacked over a range variant. `motion-safe:` and `sm:` both hold in a
  // `no-preference` context at 1000px wide, so this arm is measured rather than merely compiled.
  {
    classes:
      'animate-fade-in animate-rotate-45 animation-timeline-scroll motion-safe:animation-range-[25%_75%]:animate-fade-in sm:animation-range-[25%_75%]:animate-fade-in hover:animation-range-[25%_75%]:animate-fade-in',
    id: 'variantStacked',
  },
  // A typo in the range: refused loudly, and the motion still runs at the default rather than not at all.
  // The bare spelling of a typo is *not* used here — a value outside the variant's `values` list is never
  // a candidate, so Tailwind drops it before Jumi can see it. The arbitrary spelling is the surface a
  // typo actually reaches, and so is a legal name joined to a malformed offset.
  {
    classes:
      'animate-fade-in animate-rotate-45 animation-timeline-scroll animation-range-[nonsense]:animate-fade-in',
    id: 'variantRefused',
  },
  {
    classes:
      'animate-fade-in animate-rotate-45 animation-timeline-scroll animation-range-[normal_0%]:animate-fade-in',
    id: 'variantLandmine',
  },
  // A range over a candidate that declares no motion: nothing to range, so nothing to write.
  {
    classes: 'animate-fade-in animation-range-entry:animation-delay-[150ms]',
    id: 'variantNoMotion',
  },
  // The utility spelling of a value the variant also accepts, which is the shape that must stay quiet.
  { classes: 'animate-fade-in animation-range-entry', id: 'utilityBare' },
  // **Parity.** The variant qualifies one *slot*, so it publishes under that slot's key — and a
  // phrase's key is `attribute-id`, not the attribute. Measured before these arms existed: a phrase's
  // publication went to `--jumi-opacity-sluPU-animation-range` while its chain read
  // `--jumi-opacity-animation-range`, so the range emitted, validated, and did nothing at all.
  // Effects hid it, because for an effect the key *is* the attribute.
  ...MOTION_KINDS.map(([, motion], at) => ({
    classes: `animate-rotate-45 ${motion} animation-timeline-scroll animation-range-[25%_75%]:${motion}`,
    id: `motionKind${at}`,
  })),
]

const CANDIDATES = [
  ...new Set(ARMS.flatMap(arm => arm.classes.split(/\s+/).filter(Boolean))),
]

const entry = `
@import "tailwindcss";
@plugin "${path.join(root, 'dist', 'index.js')}";
`

const emitted = build(await compiler(entry, root), CANDIDATES)
const failures = []
let asserted = 0

/**
 * What a browser that cannot parse `animation-timeline` holds: the same stylesheet with that
d * declaration removed.
 *
 * That is what "unsupported" means for a CSS property — an unrecognised declaration is dropped and
the rest of the rule stands — so this is a model of the fallback rather than a guess about it. The
 * arm below measures what the reader gets, which is the product question the spike left open: the
 * motion happens, and it happens on **document time**, so a view-driven entrance plays on load
 * instead of tracking entry.
 */
const withoutTimelines = (() => {
  const stripped = postcss.parse(emitted.css)

  stripped.walkDecls('animation-timeline', declaration => declaration.remove())

  return stripped.toString()
})()

const check = (label, condition, detail) => {
  asserted += 1
  if (!condition) failures.push(label)

  console.log(
    `  ${condition ? '✓' : '✗'} ${label}${detail === undefined ? '' : ` — ${detail}`}`,
  )
}

// ── 1 · the emission, read rather than assumed ──────────────────────────────────────────────────
//
// Order inside the rule is not cosmetic. Measured: the `animation` shorthand *resets*
// `animation-timeline` and `animation-range`, so a composition that declared either one before the
// shorthand would have lost it — and it does not reset `animation-composition`, which is why the
// emission is right for a reason that is not the one an older comment gave.
console.log('\n· the composition')

const sheet = postcss.parse(emitted.css)

/** A publication: one slot's own range, as opposed to the element-wide `--jumi-animation-range`. */
const PUBLICATION = /^--jumi-.+-animation-range$/

/** The first rule whose selector list holds `selector` exactly, or null. */
const ruleHolding = selector => {
  let found = null

  sheet.walkRules(rule => {
    if (found === null && (rule.selectors ?? []).includes(selector))
      found = rule
  })

  return found
}

/**
 * The rule that publishes a range for the class a selector stem names.
 *
 * Searched by the *publication* rather than by the selector, and matched by prefix rather than
 * equality, for two measured reasons: an optimizer merges candidates with identical declarations into
 * one rule whose selector list holds several of them — the first match for any selector-based search,
 * and it holds none of the publications — and a condition can append to a class's selector (`:hover`).
 */
const rulePublishing = stem => {
  let found = null

  sheet.walkRules(rule => {
    const holds = (rule.nodes ?? []).some(
      node => node.type === 'decl' && PUBLICATION.test(node.prop),
    )

    if (
      found === null &&
      holds &&
      (rule.selectors ?? []).some(selector => selector.startsWith(stem))
    )
      found = rule
  })

  return found
}

const declarationIn = (rule, prop) =>
  (rule?.nodes ?? []).find(node => node.type === 'decl' && node.prop === prop)
    ?.value

let composition = null

sheet.walkRules(rule => {
  const own = (rule.nodes ?? []).filter(node => node.type === 'decl')

  if (!own.some(node => node.prop === 'animation')) return

  if (!composition || rule.selector.length > composition.selector.length)
    composition = rule
})

const declared = (composition?.nodes ?? [])
  .filter(node => node.type === 'decl')
  .map(node => node.prop)
const shorthandAt = declared.indexOf('animation')

check(
  'animation-range is declared after the shorthand it is reset by',
  shorthandAt !== -1 && declared.indexOf('animation-range') > shorthandAt,
  declared.join(' ').slice(0, 96),
)

const rangeValue =
  (composition?.nodes ?? []).find(node => node.prop === 'animation-range')
    ?.value ?? ''
const rangeEntries = splitTopLevel(rangeValue)
const shorthandValue =
  (composition?.nodes ?? []).find(node => node.prop === 'animation')?.value ??
  ''
const shorthandEntries = splitTopLevel(shorthandValue)

// One entry per animation, and every entry ends at the element's default — through the slot's own
// publications first. The links before the property's control are per-slot addresses that only exist
// when something fills them: a name (`/<name>`) and the range variant's own publication, which is
// keyed by the slot rather than by the attribute so that two slots of one property stay apart. What
// this pins is the *tail*: whatever the links are, the entry is a var chain that falls back to the
// element-wide range and not to a literal, because a literal would freeze the per-element control.
//
// The expected count comes from the shorthand beside it rather than from a constant kept here: an arm
// added to this file changes how many slots an element has, and a hand-kept 2 would then fail for the
// wrong reason — which is what happened the moment the range variant was added.
check(
  "the range list reads one entry per animation, each falling back to the element's own range",
  rangeEntries.length === shorthandEntries.length &&
    rangeEntries.every(entry =>
      /^var\(--jumi-[A-Za-z0-9-]+-animation-range, .*var\(--jumi-animation-range\)\)+$/.test(
        entry.trim(),
      ),
    ),
  `${rangeEntries.length} range entries for ${shorthandEntries.length} animations, first ${rangeEntries[0]?.slice(0, 48)}`,
)

// The two halves of a range that may be *absent*, and the default they resolve to when they are.
const substrate = (() => {
  let found = null

  sheet.walkRules(rule => {
    const props = new Set((rule.nodes ?? []).map(node => node.prop))

    if (props.has('--jumi-animation-range') && !found) found = rule
  })

  return found
})()

const substrateValue = prop =>
  (substrate?.nodes ?? []).find(node => node.prop === prop)?.value

check(
  'each half is one value fed by its offset, so nothing is joined from a name and an offset',
  substrateValue('--jumi-animation-range-start') ===
    'var(--jumi-animation-range-start-offset)' &&
    substrateValue('--jumi-animation-range-start-offset') === '0%' &&
    substrateValue('--jumi-animation-range-end-offset') === '100%',
  `${substrateValue('--jumi-animation-range-start')} = ${substrateValue('--jumi-animation-range-start-offset')}`,
)

check(
  'and the grammar-shaped name half is gone rather than left unused',
  substrateValue('--jumi-animation-range-start-timeline') === undefined &&
    substrateValue('--jumi-animation-range-end-timeline') === undefined,
  'no name-half variables in the substrate',
)

/** A scoped control writes the slot's own variable, which is what the composition's position reads. */
const scoped = (() => {
  const rule = ruleHolding('.animation-range-\\[25\\%_75\\%\\]\\/rotate')

  return (rule?.nodes ?? []).find(node => node.type === 'decl')
})()

check(
  'a range control addresses one slot through the same /<slot> vocabulary the timing controls use',
  scoped?.prop === '--jumi-rotate-animation-range' &&
    scoped?.value === '25% 75%',
  scoped ? `${scoped.prop}: ${scoped.value}` : '(no scoped rule)',
)

// The inset is a `<length-percentage>` and the percentage is the common case. Measured before the
// fix: `animation-timeline-inset-start-[10%]` emitted *nothing* while `[2rem]` emitted — a control
// that refuses a value without saying so, which is the same failure shape as the range default.
check(
  'a percentage view-timeline inset is expressible, not silently refused',
  emitted.css.includes('--jumi-animation-timeline-inset-start: 20%') &&
    emitted.css.includes('--jumi-animation-timeline-inset-end: 10%'),
  'inset-start 20%, inset-end 10% emitted',
)

// ── 1b · the vocabulary, spelling by spelling ──────────────────────────────────────────────────
//
// One candidate per value each scroll control declares, compiled together and checked for the
// declaration it should write. A control that refuses a value emits **nothing and says nothing** —
// which is how `animation-timeline-inset-start-[10%]` behaved while `[2rem]` worked, a percentage
// refusal that no page author would have traced back to a `type:` on a matcher. Compiled as one
// build rather than one per spelling: the question is whether the spelling resolves at all, and a
// shared compiler answers it.
//
// Kept as a list because that is the direction this can fail in: the value sets live in
// `src/theme/*` and nothing exports them, so a sweep has to name what it expects. A spelling that
// stops resolving fails here loudly, which is the useful half — the other half (a value added to a
// theme and never swept) is invisible either way.
const VOCABULARY = [
  ['animation-timeline-auto', '--jumi-animation-timeline: auto'],
  ['animation-timeline-none', '--jumi-animation-timeline: none'],
  [
    'animation-timeline-scroll',
    '--jumi-animation-timeline: var(--jumi-animation-timeline-scroll)',
  ],
  [
    'animation-timeline-view',
    '--jumi-animation-timeline: var(--jumi-animation-timeline-view)',
  ],
  [
    'animation-timeline-scroll/rotate',
    '--jumi-rotate-animation-timeline: var(--jumi-animation-timeline-scroll)',
  ],
  ...['block', 'inline', 'x', 'y'].map(value => [
    `animation-timeline-axis-${value}`,
    `--jumi-animation-timeline-axis: ${value}`,
  ]),
  ...['nearest', 'root', 'self'].map(value => [
    `animation-timeline-scroller-${value}`,
    `--jumi-animation-timeline-scroller: ${value}`,
  ]),
  [
    'animation-timeline-inset-start-auto',
    '--jumi-animation-timeline-inset-start: auto',
  ],
  [
    'animation-timeline-inset-end-auto',
    '--jumi-animation-timeline-inset-end: auto',
  ],
  [
    'animation-timeline-inset-start-[20%]',
    '--jumi-animation-timeline-inset-start: 20%',
  ],
  [
    'animation-timeline-inset-end-[10%]',
    '--jumi-animation-timeline-inset-end: 10%',
  ],
  // The whole-range utility: the bare spelling is the keyword, and the names are the values.
  ['animation-range', '--jumi-animation-range: normal'],
  ...[
    'cover',
    'contain',
    'entry',
    'exit',
    'entry-crossing',
    'exit-crossing',
  ].map(value => [
    `animation-range-${value}`,
    `--jumi-animation-range: ${value}`,
  ]),
  ...[
    'cover',
    'contain',
    'entry',
    'exit',
    'entry-crossing',
    'exit-crossing',
  ].map(value => [
    `animation-range-start-${value}`,
    `--jumi-animation-range-start: ${value}`,
  ]),
  ...[
    'cover',
    'contain',
    'entry',
    'exit',
    'entry-crossing',
    'exit-crossing',
  ].map(value => [
    `animation-range-end-${value}`,
    `--jumi-animation-range-end: ${value}`,
  ]),
  [
    'animation-range-[entry_0%_cover_50%]',
    '--jumi-animation-range: entry 0% cover 50%',
  ],
  [
    'animation-range-start-[entry_0%]',
    '--jumi-animation-range-start: entry 0%',
  ],
  ['animation-range-end-[exit_75%]', '--jumi-animation-range-end: exit 75%'],
  [
    'animation-range-start-offset-25',
    '--jumi-animation-range-start-offset: 25%',
  ],
  ['animation-range-end-offset-75', '--jumi-animation-range-end-offset: 75%'],
]

const vocabulary = build(
  await compiler(entry, root),
  VOCABULARY.map(([candidate]) => candidate),
).css
const refused = VOCABULARY.filter(
  ([, declaration]) => !vocabulary.includes(declaration),
).map(([candidate]) => candidate)

check(
  'every value each scroll control declares resolves to the declaration it should write',
  refused.length === 0,
  refused.length
    ? `refused: ${refused.join(', ')}`
    : `${VOCABULARY.length} spellings emit`,
)

// And the spelling that must stay refused. `normal` is a legal *whole* range and an illegal *half*:
// joined to an offset on one side only it makes the declaration invalid at computed-value time, which
// drops the whole `animation-range` list — a neighbouring position's real range included. Measured,
// and the reason `normal` is not in `animationRangeName`. If it is ever added back, this fails.
const TRAPS = ['animation-range-start-normal', 'animation-range-end-normal']
const traps = build(await compiler(entry, root), TRAPS).css
const offered = ['start', 'end'].filter(half =>
  traps.includes(`--jumi-animation-range-${half}: normal`),
)

check(
  'the keyword is never offered as a half, where it is not a legal value',
  offered.length === 0,
  offered.length
    ? `offered for ${offered.join(' and ')}`
    : 'animation-range-{start,end}-normal emit nothing',
)

// ── 2 · the page ────────────────────────────────────────────────────────────────────────────────
const htmlFor = css => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; font: 12px/1.2 system-ui; }
  #lead { height: 240px; background: #f4f4f4; }
  /* Overlapping, because a differential between two elements at different scroll positions measures
     the positions. Every arm shares this one box. */
  #stage { position: relative; height: 200px; }
  #stage > * { position: absolute; inset: 0; }
  #tail { height: 1800px; }
</style>
<style id="jumi">${css}</style></head>
<body>
<div id="lead">lead</div>
<div id="stage"></div>
<div id="tail">tail</div>
<script>
  for (const arm of ${JSON.stringify(ARMS)}) {
    const node = document.createElement('div')

    node.id = arm.id
    node.className = arm.classes
    document.getElementById('stage').appendChild(node)
  }

  const source = (timeline) => {
    const node = timeline?.source

    if (!node) return null
    if (node === document.documentElement) return 'root'

    return node.id || node.tagName
  }

  window.__read = (id) => {
    const node = document.getElementById(id)

    // A missing arm is reported rather than thrown: an arm that failed to mount is a defect in this
    // file, and "the page threw while reading arm x" is a worse message than the arm's own name.
    if (!node) return { animations: [], missing: true, opacity: null, range: '' }

    const style = getComputedStyle(node)
    const animations = [...document.getAnimations()].filter(animation => animation.effect?.target === node)

    return {
      opacity: Number(style.opacity),
      range: style.getPropertyValue('animation-range').trim(),
      names: style.getPropertyValue('animation-name').trim(),
      timelines: style.getPropertyValue('animation-timeline').trim(),
      animations: animations.map((animation) => {
        const timing = animation.effect.getComputedTiming()
        const duration = timing.duration?.value

        return {
          duration: duration == null ? String(timing.duration) : String(duration),
          name: animation.animationName ?? '?',
          progress: timing.progress,
          timeline: animation.timeline?.constructor?.name ?? null,
          source: source(animation.timeline),
          time: animation.currentTime?.value ?? null,
        }
      }),
    }
  }

  window.__scroll = (fraction) => {
    document.documentElement.scrollTop = Math.round(fraction * (document.documentElement.scrollHeight - innerHeight))

    return document.documentElement.scrollTop
  }

  window.__ready = true
</script>
</body></html>`

const server = createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  response.end(
    request.url === '/without-timelines'
      ? htmlFor(withoutTimelines)
      : htmlFor(emitted.css),
  )
}).listen(0)

const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch()

/** A context per motion preference: the media query is a context setting, not a page one. */
const open = async (reducedMotion, url = '/') => {
  const context = await browser.newContext({
    reducedMotion,
    viewport: { height: 700, width: 1000 },
  })
  const page = await context.newPage()

  await page.goto(origin + url)
  await page.waitForFunction(() => window.__ready === true)

  return page
}

const settle = page =>
  page.evaluate(
    () =>
      new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )

/** Read an arm at a scroll fraction, after the frame that applied it. */
const at = async (page, fraction, id) => {
  await page.evaluate(share => window.__scroll(share), fraction)
  await settle(page)

  return page.evaluate(arm => window.__read(arm), id)
}

/** The progress of the animation whose name starts with `prefix`, at each fraction. */
const series = async (page, id, prefix, fractions) => {
  const out = []

  for (const fraction of fractions) {
    const reading = await at(page, fraction, id)

    out.push(
      reading.animations.find(animation => animation.name.startsWith(prefix))
        ?.progress ?? null,
    )
  }

  return out
}

const round = value => (value == null ? '—' : Math.round(value * 100) / 100)
const show = values => values.map(round).join(' ')

// ── 3 · a range lands on the position that asked for it ─────────────────────────────────────────
const page = await open('no-preference')

console.log('\n· animation-range')

const ranged = await at(page, 0.5, 'ranged')
const rangedList = ranged.range.split(/,(?![^(]*\))/).map(entry => entry.trim())

check(
  'the range resolves at the position named by the modifier, and the other position keeps the default',
  rangedList[0].includes('25%') &&
    rangedList[0].includes('75%') &&
    !rangedList[1].includes('25%'),
  ranged.range,
)

const rangedProgress = await series(
  page,
  'ranged',
  'jumi-rotate-',
  [0.25, 0.5, 0.75],
)
const unrangedProgress = await series(
  page,
  'unranged',
  'jumi-rotate-',
  [0.25, 0.5, 0.75],
)

check(
  'and it moves the motion, not merely the declaration',
  round(rangedProgress[0]) === 0 &&
    Math.abs(rangedProgress[1] - 0.5) < 0.05 &&
    Math.abs(rangedProgress[2] - 1) < 0.05,
  `ranged at ¼ ½ ¾ → ${show(rangedProgress)}`,
)

check(
  'while an un-ranged slot of the same shape still fills the range',
  Math.abs(unrangedProgress[0] - 0.25) < 0.05 &&
    Math.abs(unrangedProgress[1] - 0.5) < 0.05,
  `unranged at ¼ ½ ¾ → ${show(unrangedProgress)}`,
)

// The regression that matters to every page that never asked for a range: the declaration the
// composition now always writes must resolve to the *whole* range, not to a compressed one.
const unrangedFade = await series(
  page,
  'unranged',
  'jumi-fade-',
  [0.25, 0.5, 0.75],
)

check(
  'a slot with no range control resolves to the whole range, which is what every existing page has',
  Math.abs(unrangedFade[0] - 0.25) < 0.05 &&
    Math.abs(unrangedFade[1] - 0.5) < 0.05 &&
    Math.abs(unrangedFade[2] - 0.75) < 0.05,
  `un-ranged fade at ¼ ½ ¾ → ${show(unrangedFade)}`,
)

// ── 3b · the range as a composition variant ─────────────────────────────────────────────────────
//
// `animation-range-entry:animate-fade-in` carries the same two facts as the control and the modifier,
// moved into the candidate: the range is in the class the author typed, the slot is in the activation
// that same rule declares, and the variant callback contributes nothing but the identity selector.
// The judgement therefore lives in one reader, and what a gate can hold is *where its answer lands*.
console.log('\n· the range variant')

// The publication has to sit in the rule the author wrote — the same one that activates the slot. A
// range that reached the element any other way would still resolve, so this is the assertion that
// tells "the variant works" apart from "something else made it look as though it does".
const STACKED = [
  ['a bare spelling', '.animation-range-\\[25\\%_75\\%\\]\\:animate-fade-in'],
  [
    'motion-safe:',
    '.motion-safe\\:animation-range-\\[25\\%_75\\%\\]\\:animate-fade-in',
  ],
  ['sm:', '.sm\\:animation-range-\\[25\\%_75\\%\\]\\:animate-fade-in'],
  ['hover:', '.hover\\:animation-range-\\[25\\%_75\\%\\]\\:animate-fade-in'],
]

for (const [condition, selector] of STACKED) {
  const rule = rulePublishing(selector)

  check(
    `stacked under ${condition}, the range publishes beside the activation it qualifies`,
    declarationIn(rule, '--jumi-fade-in-animation-name') !== undefined &&
      declarationIn(rule, '--jumi-fade-in-animation-range') === '25% 75%',
    rule
      ? `${selector} → ${declarationIn(rule, '--jumi-fade-in-animation-range')}`
      : `no rule publishing for ${selector}`,
  )
}

// The one that would be wrong rather than missing: a range that lands on some *other* motion of the
// same element. A leak like that still animates, so only the pairing can catch it.
const entryRule = rulePublishing('.animation-range-entry\\:animate-fade-in')
const exitRule = rulePublishing('.animation-range-exit\\:animate-fade-out')

check(
  'each named range publishes to the slot its own candidate activates',
  declarationIn(entryRule, '--jumi-fade-in-animation-range') === 'entry' &&
    declarationIn(entryRule, '--jumi-fade-out-animation-range') === undefined &&
    declarationIn(exitRule, '--jumi-fade-out-animation-range') === 'exit' &&
    declarationIn(exitRule, '--jumi-fade-in-animation-range') === undefined,
  `entry → ${declarationIn(entryRule, '--jumi-fade-in-animation-range')}, exit → ${declarationIn(exitRule, '--jumi-fade-out-animation-range')}`,
)

// Refusals. A value outside the grammar is dropped position by position by the engine and says
// nothing, so the warning is the only signal an author gets — and it has to name the class they wrote.
const refusal = emitted.warnings.find(warning =>
  warning.startsWith('animation-range-[nonsense]:animate-fade-in'),
)
const landmine = emitted.warnings.find(warning =>
  warning.startsWith('animation-range-[normal_0%]:animate-fade-in'),
)
const noMotion = emitted.warnings.find(warning =>
  warning.startsWith('animation-range-entry:animation-delay'),
)

check(
  'a range Jumi cannot write is refused loudly, and the message names the class',
  refusal !== undefined && refusal.includes('is not a range Jumi can write'),
  refusal ?? '(no warning)',
)

check(
  'and the keyword joined to an offset — which the engine drops without a word — is refused too',
  landmine !== undefined && landmine.includes('is not a range Jumi can write'),
  landmine ?? '(no warning)',
)

check(
  'a range over a candidate with no motion says so instead of writing a variable nobody reads',
  noMotion !== undefined && noMotion.includes('declares none'),
  noMotion ?? '(no warning)',
)

check(
  'and the utility spelling of the same value is not mistaken for the variant',
  !emitted.warnings.some(warning =>
    warning.startsWith('animation-range-entry: '),
  ),
  emitted.warnings
    .filter(warning => warning.startsWith('animation-range-entry: '))
    .join(' / ') || 'silent',
)

const scopedFade = await series(
  page,
  'variantScoped',
  'jumi-fade-',
  [0.25, 0.5, 0.75],
)
const scopedRotate = await series(
  page,
  'variantScoped',
  'jumi-rotate-',
  [0.25, 0.5, 0.75],
)

check(
  'the variant ranges its own slot, and the slot beside it keeps the whole range',
  round(scopedFade[0]) === 0 &&
    Math.abs(scopedFade[1] - 0.5) < 0.05 &&
    Math.abs(scopedFade[2] - 1) < 0.05 &&
    Math.abs(scopedRotate[0] - 0.25) < 0.05 &&
    Math.abs(scopedRotate[1] - 0.5) < 0.05,
  `ranged fade at ¼ ½ ¾ → ${show(scopedFade)}, bare rotate → ${show(scopedRotate)}`,
)

const stackedFade = await series(
  page,
  'variantStacked',
  'jumi-fade-',
  [0.25, 0.5, 0.75],
)

check(
  'and it survives ordinary Tailwind conditions stacked over it',
  round(stackedFade[0]) === 0 &&
    Math.abs(stackedFade[1] - 0.5) < 0.05 &&
    Math.abs(stackedFade[2] - 1) < 0.05,
  `motion-safe: sm: hover: at ¼ ½ ¾ → ${show(stackedFade)}`,
)

// Parity across motion sources. The public promise is that `animation-range-entry:animate-fade-in` and
// `animation-range-entry:animate-opacity-[0:0|100:1]` are the same kind of composition, so each kind is
// measured the same way as the effect — ranged on the slot it was written on, whole on its neighbour.
// A user can see whether a range took effect; which internal key it published under is not their
// concern, and it was the whole of the bug.
for (const [at, [kind, motion]] of MOTION_KINDS.entries()) {
  const id = `motionKind${at}`
  const ranged = await series(
    page,
    id,
    kind === 'an effect' ? 'jumi-fade-' : 'jumi-opacity-',
    [0.25, 0.5, 0.75],
  )
  const neighbour = await series(page, id, 'jumi-rotate-', [0.25, 0.5, 0.75])

  check(
    `the range reaches ${kind}, and leaves the motion beside it alone`,
    round(ranged[0]) === 0 &&
      Math.abs(ranged[1] - 0.5) < 0.05 &&
      Math.abs(ranged[2] - 1) < 0.05 &&
      Math.abs(neighbour[0] - 0.25) < 0.05 &&
      Math.abs(neighbour[1] - 0.5) < 0.05 &&
      Math.abs(neighbour[2] - 0.75) < 0.05,
    `${motion}: ranged at ¼ ½ ¾ → ${show(ranged)}, neighbour → ${show(neighbour)}`,
  )
}

const pair = await at(page, 0.5, 'variantPair')
const pairPositions = pair.names.split(',').map(name => name.trim())
const pairList = pair.range.split(/,(?![^(]*\))/).map(entry => entry.trim())
const fadeInAt = pairPositions.indexOf('jumi-fade-in')
const fadeOutAt = pairPositions.indexOf('jumi-fade-out')

check(
  'two ranged motions on one element resolve at their own positions, in order',
  pairPositions.length === pairList.length &&
    fadeInAt !== -1 &&
    fadeOutAt !== -1 &&
    pairList[fadeInAt] === 'entry' &&
    pairList[fadeOutAt] === 'exit',
  `${pairPositions.join(' ')} ↔ ${pairList.join(' | ')}`,
)

// The other half of a refusal: the motion is still there, on the default. Dropping the animation
// because its range was a typo would be the worse failure of the two.
const refusedFade = await series(
  page,
  'variantRefused',
  'jumi-fade-',
  [0.25, 0.5, 0.75],
)

check(
  'a refused range leaves the motion running on the whole range',
  Math.abs(refusedFade[0] - 0.25) < 0.05 &&
    Math.abs(refusedFade[1] - 0.5) < 0.05,
  `refused at ¼ ½ ¾ → ${show(refusedFade)}`,
)

// ── 4 · mixed timelines on one element ──────────────────────────────────────────────────────────
console.log('\n· mixed drivers')

const mixed = await at(page, 0.5, 'mixed')
const mixedRotate = mixed.animations.find(animation =>
  animation.name.startsWith('jumi-rotate-'),
)
const mixedFade = mixed.animations.find(animation =>
  animation.name.startsWith('jumi-fade-'),
)

check(
  'one slot follows the scroll and its neighbour keeps the document timeline',
  mixedRotate?.timeline === 'ScrollTimeline' &&
    mixedFade?.timeline === 'DocumentTimeline',
  `${mixedRotate?.name} → ${mixedRotate?.timeline}, ${mixedFade?.name} → ${mixedFade?.timeline}`,
)

check(
  'and the scroll-driven one is driven by the scroller, not by time',
  mixedRotate?.source === 'root',
  `source ${mixedRotate?.source}`,
)

const inset = await at(page, 0.5, 'inset')

check(
  'an inset view timeline still drives the motion it was given',
  inset.animations[0]?.timeline === 'ViewTimeline' &&
    round(inset.animations[0]?.progress) === 1,
  `${inset.animations[0]?.timeline ?? 'none'} at ${round(inset.animations[0]?.progress)}`,
)

// ── 5 · time values on a progress timeline ──────────────────────────────────────────────────────
console.log('\n· time controls, reinterpreted')

const delayed = await at(page, 0.5, 'delayed')
const delayedFade = delayed.animations[0]

// Measured rule: 100% of the scroll is the animation's own effect end, so a delay of 600ms against
// a 1s duration resolves the duration to 1000/1600 = 62.5% of the range and compresses the motion.
check(
  'a delay is a share of the scroll, not a wait: the resolved duration shrinks with it',
  delayedFade?.duration === '62.5',
  `resolved duration ${delayedFade?.duration}%`,
)

const delayedProgress = await series(page, 'delayed', 'jumi-fade-', [0.25, 0.5])

check(
  'and the progress it produces is the compressed one, not the scroll fraction',
  delayedProgress[0] == null && Math.abs(delayedProgress[1] - 0.2) < 0.05,
  `at ¼ ½ → ${show(delayedProgress)}`,
)

// A range and a delay on the same slot. The range places the window and the delay takes its share
// *within* it, so the compression is the same one the un-ranged arm showed — the two controls
// compose rather than one winning.
const delayedRange = await series(
  page,
  'delayedRange',
  'jumi-fade-',
  [0.25, 0.5, 0.75],
)

check(
  'a delay and a range compose: the window is the range and the delay is a share of the window',
  Math.abs(delayedRange[0]) < 0.05 &&
    Math.abs(delayedRange[1] - 0.2) < 0.05 &&
    Math.abs(delayedRange[2] - 1) < 0.05,
  `at ¼ ½ ¾ → ${show(delayedRange)}`,
)

// ── 6 · an axis that cannot scroll fails open ───────────────────────────────────────────────────
console.log('\n· fails open')

const axisAtStart = await at(page, 0, 'axisX')
const axisAtEnd = await at(page, 1, 'axisX')

check(
  'scroll(x) on a page with no horizontal overflow moves nothing, and says nothing',
  axisAtStart.animations.every(animation => animation.progress == null) &&
    axisAtEnd.animations.every(animation => animation.progress == null) &&
    axisAtStart.opacity === axisAtEnd.opacity,
  `${axisAtStart.animations.length} animation(s), progress ${axisAtStart.animations[0]?.progress ?? 'null'} at both ends, opacity ${axisAtStart.opacity} → ${axisAtEnd.opacity}`,
)

// ── 7 · reduced motion is the author's to clamp ─────────────────────────────────────────────────
console.log('\n· reduced motion')

const quiet = await open('reduce')
const quietBare = await series(quiet, 'bare', 'jumi-fade-', [0, 1])
const quietClamped = await at(quiet, 0.5, 'clamped')

check(
  'the platform does not clamp: a bare scroll-driven slot is still scrubbed under reduce',
  quietBare[0] === 0 && round(quietBare[1]) === 1,
  `0 → 1 → ${show(quietBare)}`,
)

check(
  "an author's clamp does: motion-reduce: removes the timeline entirely",
  quietClamped.animations[0]?.timeline == null,
  `timeline ${quietClamped.animations[0]?.timeline ?? 'none'}`,
)

// ── 8 · the same arms where motion is welcome ───────────────────────────────────────────────────
const loud = await open('no-preference')
const loudClamped = await at(loud, 0.5, 'clamped')

check(
  'and the clamp says nothing outside the query it was written for',
  loudClamped.animations[0]?.timeline === 'ScrollTimeline',
  `timeline ${loudClamped.animations[0]?.timeline}`,
)

// ── 9 · the fallback, measured rather than assumed ──────────────────────────────────────────────
//
// The spike claimed an unsupported browser degrades "for free". Mechanically it does; the reader's
// experience is the question. Both pages below are left alone — nothing is scrolled — so the only
// thing that can move a motion is time.
console.log('\n· the fallback (nothing is scrolled)')

const readTwice = async (target, id) => {
  const first = await at(target, 0, id)

  await target.waitForTimeout(700)

  const second = await at(target, 0, id)

  return [first, second]
}

const modern = await open('no-preference')
const [modernFirst, modernSecond] = await readTwice(modern, 'viewDriven')

check(
  'where the timeline is understood, standing still leaves the motion where it was',
  modernFirst.animations[0]?.timeline === 'ViewTimeline' &&
    modernFirst.animations[0]?.progress ===
      modernSecond.animations[0]?.progress,
  `ViewTimeline, progress ${round(modernFirst.animations[0]?.progress)} held for 700ms`,
)

const legacy = await open('no-preference', '/without-timelines')
const [legacyFirst, legacySecond] = await readTwice(legacy, 'viewDriven')

check(
  'where the declaration is dropped, the same motion runs on document time — the accepted fallback',
  legacyFirst.animations[0]?.timeline === 'DocumentTimeline' &&
    (legacySecond.animations[0]?.progress ?? 0) >
      (legacyFirst.animations[0]?.progress ?? 0),
  `DocumentTimeline, progress ${round(legacyFirst.animations[0]?.progress)} → ${round(legacySecond.animations[0]?.progress)} while still`,
)

// ── 10 · the author's strict path ───────────────────────────────────────────────────────────────
//
// "Scroll-driven or nothing" is expressible without new syntax: put the motion and the timeline
// behind one capability query. Only the *matching* half is measurable here (this Chromium supports
// timelines, and the model page above still does — removing a declaration does not make `@supports`
// false), so the negative half is measured with a query that cannot match. That a real unsupported
// browser takes the same branch follows from the query, and is deliberately **not** claimed as
// measured.
console.log('\n· the strict path, authored')

const guarded = await at(page, 0.5, 'guarded')

check(
  'a capability query around the motion and its timeline gives a scroll-driven animation where it matches',
  guarded.animations[0]?.timeline === 'ScrollTimeline' &&
    guarded.animations[0]?.source === 'root',
  `${guarded.animations[0]?.timeline ?? 'none'} ← ${guarded.animations[0]?.source ?? 'nothing'}`,
)

const guardedFalse = await at(page, 0.5, 'guardedFalse')

check(
  'and nothing at all where it does not, which is the strict degradation',
  guardedFalse.animations.length === 0 && guardedFalse.opacity === 1,
  `${guardedFalse.animations.length} animation(s), opacity ${guardedFalse.opacity}`,
)

await browser.close()
server.close()

// The count is the checks that actually ran, not a constant kept beside them: a hand-kept total had
// already drifted from the number of assertions in this file, which is the failure mode
// `scripts/check.mjs` exists to prevent.
console.log(
  `\n  ${asserted - failures.length}/${asserted} scroll-driven behaviours hold`,
)
console.log(
  `  emission: ${emitted.css.length} bytes, ${CANDIDATES.length} candidates`,
)

if (failures.length) {
  console.error('\n✗ scroll-driven support does not behave in a browser:')

  for (const failure of failures) console.error(`  ${failure}`)

  process.exit(1)
}

console.log(
  '\n✓ a range lands where it was addressed, a neighbour keeps its driver, and nothing fails silently that should not',
)
