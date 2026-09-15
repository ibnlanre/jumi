#!/usr/bin/env node
/**
 * SPIKE — which grammar can associate a Jumi motion with a view-transition side?
 *
 * The research settled that the finalizer needs three things — an identity, an optional old motion, an
 * optional new motion — and that it must not be a variant. This spike settles how an author writes
 * them, and it is a question about the *host's parser*: whatever the syntax is, Tailwind has to resolve
 * the candidate and hand Jumi's matcher something distinguishable from everything Jumi already accepts.
 *
 * Two constraints shape every family, and both were measured before this file was written.
 *
 * **The modifier slot is already occupied.** Jumi reads `/word` two ways today — `/rotate`, a control
 * addressing a property, and `/[flick]`, a control addressing a labelled slot.
 *
 * **A relationship between two classes cannot be inferred from co-location.** The finalizer sees a flat
 * candidate universe, not elements. So whatever connects a motion to a side has to be inside the
 * candidate that names the side; `view-transition-old/[flick]` alone cannot know *which* `flick`.
 *
 * What that leaves is a reference: `view-transition-old/[<identity>:<label>]`. The measurement that
 * decides whether it works is not whether it parses — it is whether a label resolves to the intended
 * slots after compilation, for shared labels, effects, arbitrary labels, two identities, and a
 * one-sided transition.
 *
 * Each case is one build, and the label table is read out of the emitted stylesheet rather than
 * assumed: a label is recorded as `--jumi-<slot>-label: <label>` on the rule that publishes the slot.
 *
 * Run: node scripts/spike-vt-syntax.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

/**
 * Jumi's plugin as an author's build sees it, plus a recorder and the spiked utilities.
 *
 * The probe utilities are not production code. They exist so the *grammar* can be measured: whether
 * the host resolves the spelling, and what it hands the matcher. `view-transition` emits exactly
 * `view-transition-name` and nothing else — the contract the design settled on.
 */
const wrapperSource = pluginPath => `
import { writeFileSync } from 'node:fs'

import jumi from ${JSON.stringify(pluginPath)}

const calls = []
const target = process.env.JUMI_CALLS

const wrap = (fn, name) => (value, extra = {}) => {
  calls.push({ context: Object.keys(extra), modifier: extra.modifier ?? null, name, value: String(value) })
  return fn(value, extra)
}

const matched = (utilities) => Object.fromEntries(
  Object.entries(utilities).map(([name, fn]) => [name, wrap(fn, name)]),
)

const PROBE = {
  'view-transition': (value, { modifier }) => ({ 'view-transition-name': modifier ?? value }),
  'view-transition-new': (value, { modifier }) => ({ '--spike-vt-new': modifier ? value + '|' + modifier : value }),
  'view-transition-old': (value, { modifier }) => ({ '--spike-vt-old': modifier ? value + '|' + modifier : value }),
}

export default {
  handler(api) {
    jumi.handler({
      ...api,
      matchComponents: (utilities, options) => api.matchComponents(matched(utilities), options),
      matchUtilities: (utilities, options) => api.matchUtilities(matched(utilities), options),
    })

    api.matchUtilities(matched(PROBE), { modifiers: 'any', values: { DEFAULT: 'identity' } })
  },
}

process.on('exit', () => {
  if (target) writeFileSync(target, JSON.stringify(calls))
})
`

/** Compile one build and return the matcher calls plus the emitted CSS. */
const trace = candidates => {
  const dir = mkdtempSync(path.join(here, '.vt-syntax-'))
  const wrapper = path.join(dir, 'wrapper.js')
  const calls = path.join(dir, 'calls.json')

  writeFileSync(wrapper, wrapperSource(path.join(root, 'dist/index.js')))
  writeFileSync(
    path.join(dir, 'fixture.html'),
    candidates.map(candidate => `<div class="${candidate}"></div>`).join('\n'),
  )
  writeFileSync(
    path.join(dir, 'entry.css'),
    '@import "tailwindcss" source(none);\n@source "./fixture.html";\n' +
      `@plugin ${JSON.stringify(wrapper)};\n`,
  )

  try {
    execFileSync(
      'pnpm',
      [
        'exec',
        'tailwindcss',
        '-i',
        path.join(dir, 'entry.css'),
        '-o',
        path.join(dir, 'out.css'),
      ],
      { cwd: root, env: { ...process.env, JUMI_CALLS: calls }, stdio: 'pipe' },
    )

    return {
      calls: JSON.parse(readFileSync(calls, 'utf8')),
      css: readFileSync(path.join(dir, 'out.css'), 'utf8'),
    }
  } finally {
    rmSync(dir, { force: true, recursive: true })
  }
}

/**
 * The label table, read out of the emitted stylesheet.
 *
 * This is the resolution question. A label is recorded as `--jumi-<slot>-label: <label>` on the rule
 * that publishes the slot, so a reference resolves to *every* slot carrying that label — which is what
 * would make a label a motion group rather than an alias, if that is what we want.
 */
const labelTable = css => {
  const table = new Map()

  for (const match of css.matchAll(/--jumi-([\w-]+)-label:\s*([^;]+);/g)) {
    const label = match[2].trim()
    const slots = table.get(label) ?? []

    slots.push(match[1])
    table.set(label, slots)
  }

  return table
}

const PHRASE_A = 'animate-rotate-[0:0deg|20:-8deg|100:-8deg]'
const PHRASE_B = 'animate-rotate-[0:0deg|20:0deg|100:8deg]'

/** Each case is one build: candidates, and the mechanism the reference is meant to reach. */
const CASES = [
  {
    candidates: [
      `${PHRASE_A}/[flick]`,
      'view-transition/hero',
      'view-transition-old/[hero:flick]',
    ],
    expect: 'one label, one slot — the baseline',
    name: 'labelled motion + qualified reference',
  },
  {
    candidates: [
      `${PHRASE_A}/[enter]`,
      'animate-opacity-[0:1|50:0.5|100:1]/[enter]',
      'view-transition/hero',
      'view-transition-new/[hero:enter]',
    ],
    expect: 'a shared label — is a label a motion group or an alias?',
    name: 'shared label across two motions',
  },
  {
    candidates: [
      'animate-fade-in/[enter]',
      'view-transition/hero',
      'view-transition-new/[hero:enter]',
    ],
    expect: "an effect with a label — the proposal's own example",
    name: 'effect labelled',
  },
  {
    candidates: [
      'animate-fade-in',
      'view-transition/hero',
      'view-transition-new/[hero:fade-in]',
    ],
    expect: 'referencing an effect by its own name, with no label at all',
    name: 'effect referenced by name',
  },
  {
    candidates: [
      'animate-rotate-45/[flick]',
      'view-transition/hero',
      'view-transition-old/[hero:flick]',
    ],
    expect: 'a single-value tween with a label',
    name: 'single-value tween labelled',
  },
  {
    candidates: [
      `${PHRASE_A}/[flick]`,
      'view-transition/hero',
      'view-transition-old/hero/[flick]',
    ],
    expect: 'the two-segment modifier spelling',
    name: 'two-segment modifier',
  },
  {
    candidates: [
      `${PHRASE_A}/[flick]`,
      'view-transition/hero',
      'view-transition-old/[flick]',
    ],
    expect: 'no identity — the co-location form the design rule rejects',
    name: 'unqualified reference',
  },
  {
    candidates: [`${PHRASE_A}/[flick]`, 'view-transition/hero'],
    expect: 'only an identity; the sides are left to the browser',
    name: 'one-sided (or no side at all)',
  },
  {
    candidates: [
      `${PHRASE_A}/[flick]`,
      `${PHRASE_B}/[return]`,
      'view-transition/hero',
      'view-transition/card',
      'view-transition-old/[hero:flick]',
      'view-transition-new/[card:return]',
    ],
    expect: 'two identities on one page, each with its own motion',
    name: 'two identities',
  },
  {
    candidates: [
      `${PHRASE_A}/[flick]`,
      `${PHRASE_B}/[return]`,
      'view-transition/[my-card-2]',
      'view-transition-old/[my-card-2:flick]',
      'view-transition-new/[my-card-2:return]',
    ],
    expect: 'an arbitrary identity, hyphenated',
    name: 'arbitrary identity',
  },
]

const results = []

for (const test of CASES) {
  const { calls, css } = trace(test.candidates)
  const table = labelTable(css)

  const reference = value => {
    const cut = String(value).lastIndexOf(':')

    return cut < 0
      ? { identity: null, label: String(value) }
      : {
          identity: String(value).slice(0, cut),
          label: String(value).slice(cut + 1),
        }
  }

  /**
   * The payload arrives in the **modifier**, not the value.
   *
   * Measured, and it is not what the spelling suggests: `view-transition-old/[hero:flick]` splits at
   * the top-level `/`, so the utility is `view-transition-old`, its value is the default, and
   * `[hero:flick]` is the modifier. A side utility therefore has to read its reference from the
   * modifier — and a candidate cannot carry two `/` segments, which is why
   * `view-transition-old/hero/[flick]` is dropped by the host.
   */
  const sides = calls
    .filter(
      call =>
        call.name === 'view-transition-old' ||
        call.name === 'view-transition-new',
    )
    .map(call => {
      const payload = call.modifier ?? call.value
      const { identity, label } = reference(payload)
      const slots = table.get(label) ?? []

      return {
        identity,
        label,
        payload,
        resolved:
          slots.length === 0
            ? 'DOES NOT RESOLVE'
            : slots.length === 1
              ? '1 slot'
              : `${slots.length} slots`,
        side: call.name.replace('view-transition-', ''),
        slots,
      }
    })

  // A candidate the host never handed a matcher was dropped, and nothing tells the author.
  const sideCandidates = test.candidates.filter(c =>
    c.startsWith('view-transition-'),
  )
  const dropped = sideCandidates.filter(
    candidate =>
      !calls.some(call => {
        const payload = call.modifier ?? call.value

        return (
          candidate
            .split('/')
            .slice(1)
            .join('/')
            .replace(/^\[|\]$/g, '') === payload
        )
      }),
  )

  results.push({
    ...test,
    dropped,
    labels: [...table],
    sides,
    ...{
      identityRules: [
        ...new Set(
          [...css.matchAll(/view-transition-name:\s*([^;]+);/g)].map(m =>
            m[1].trim(),
          ),
        ),
      ],
    },
  })
}

console.log('\n── does a side reference resolve to the slots it names?\n')

for (const result of results) {
  console.log(`▌ ${result.name}`)
  console.log(`  ${result.expect}`)
  console.log(
    `  labels recorded : ${
      result.labels.length
        ? result.labels
            .map(
              ([label, slots]) =>
                `${label} → ${slots.length} slot${slots.length === 1 ? '' : 's'} [${slots.join(', ')}]`,
            )
            .join('  |  ')
        : 'NONE'
    }`,
  )
  console.log(`  identity emitted: ${result.identityRules.join(', ') || '—'}`)

  if (!result.sides.length)
    console.log('  ⚠ no side candidate reached a matcher at all')

  for (const side of result.sides) {
    console.log(
      `  ${side.side.padEnd(3)} ${side.payload.padEnd(24)} identity=${(side.identity ?? '—').padEnd(10)}` +
        ` label=${side.label.padEnd(10)} → ${side.resolved}` +
        (side.slots.length ? `  [${side.slots.join(', ')}]` : ''),
    )
  }

  if (result.dropped.length)
    console.log(`  ⚠ dropped by the host: ${result.dropped.join(', ')}`)

  console.log('')
}

/* ------------------------------------------------------------------ one candidate, all three facts */

/**
 * The proposal: a single candidate carrying the side, the identity *and* the motion.
 *
 *   view-transition-old/hero:animate-fade-out
 *
 * Two questions, and they are separable.
 *
 * **Does the host parse it?** The modifier contains a `:`, which is also the variant separator, so the
 * parse could plausibly split in the wrong place — or refuse. That is a measurement, not a preference.
 *
 * **Is the motion findable without a label?** This is the half that matters. Naming the *motion
 * candidate* rather than a label would bypass the label mechanism entirely, and with it the
 * phrase-only limitation pass three found — `animate-fade-out` needs no label to be emitted, it
 * publishes `--jumi-fade-out-animation-name` on its own. If that is reachable, the blocker disappears
 * rather than being worked around.
 */
const motionSlots = css => [
  ...new Set(
    [...css.matchAll(/--jumi-([\w-]+)-animation-name:/g)].map(m => m[1]),
  ),
]

/** The motion a candidate names, as a stem the emitted stylesheet could be searched for. */
const motionOf = candidate => {
  const rest = candidate.split('/').slice(1).join('/')
  const cut = rest.lastIndexOf(':')

  return cut < 0 ? rest : rest.slice(cut + 1)
}

const PROPOSALS = [
  {
    candidates: [
      'view-transition-old/hero:animate-fade-out',
      'view-transition-new/hero:animate-fade-in',
    ],
    expect: 'bare modifier containing `:` — does the host accept it?',
    name: 'unbracketed — refused?',
  },
  {
    candidates: [
      'animate-fade-out',
      'animate-fade-in',
      'view-transition-old/[hero:animate-fade-out]',
      'view-transition-new/[hero:animate-fade-in]',
    ],
    expect:
      'the motion named by the side, with the motion itself written as its own candidate',
    name: 'reference by motion name',
  },
  {
    candidates: ['view-transition-old/[hero:animate-fade-out]'],
    expect:
      'naming a motion that was never written — does a reference create the utility?',
    name: 'reference to a motion that does not exist',
  },
  {
    candidates: [`${PHRASE_A}/[out]`, 'view-transition-old/[hero:out]'],
    expect:
      'a labelled phrase, referenced by label — the model pass three measured',
    name: 'reference by label',
  },
  {
    candidates: [
      `${PHRASE_A}/[out]`,
      'animation-duration-500/[out]',
      'view-transition-old/[hero:out]',
    ],
    expect:
      'a control scoped to the same label — does one vocabulary serve motion and control?',
    name: 'control scoped by the same label',
  },
  {
    candidates: [
      `${PHRASE_A}/[out]`,
      'animation-duration-500/hero:out',
      'view-transition-old/[hero:out]',
    ],
    expect:
      'a control scoped by the side spelling — can the control vocabulary carry a `:`?',
    name: 'control carrying a `:` label',
  },
  {
    candidates: [
      `${PHRASE_A}/[flick]`,
      `${PHRASE_B}/[return]`,
      'view-transition-old/[hero:flick]',
      'view-transition-new/[card:return]',
    ],
    expect: 'two identities, each side naming its own motion',
    name: 'two identities',
  },
  {
    candidates: [`${PHRASE_A}/[flick]`, 'view-transition-old/[hero:flick]'],
    expect: 'one side only — the browser keeps the other cross-fade',
    name: 'one-sided',
  },
]

console.log('\n── a single candidate carrying identity, side and motion\n')

for (const test of PROPOSALS) {
  const { calls, css } = trace(test.candidates)
  const stems = motionSlots(css)
  const table = labelTable(css)

  const sides = calls
    .filter(
      call =>
        call.name === 'view-transition-old' ||
        call.name === 'view-transition-new',
    )
    .map(call => ({
      payload: call.modifier ?? call.value,
      side: call.name.replace('view-transition-', ''),
    }))

  const motions = calls
    .filter(call => !call.name.startsWith('view-transition'))
    .map(call => ({
      modifier: call.modifier,
      name: call.name,
      value: call.value,
    }))

  /**
   * Whether a candidate reached a matcher — by reconstructing it from the call, not by searching the
   * candidate text. The earlier version compared the whole candidate against `name/payload`, which is
   * false for every candidate that is not a side (they have no `/`), so it reported resolved
   * candidates as dropped and would have hidden a real drop behind a broken check.
   */
  const reached = candidate =>
    calls.some(call => {
      if (!candidate.startsWith(call.name)) return false

      const tail = candidate.slice(call.name.length)

      return (
        tail.includes(String(call.value)) ||
        (call.modifier !== null && tail.includes(String(call.modifier)))
      )
    })

  const dropped = test.candidates.filter(candidate => !reached(candidate))

  console.log(`▌ ${test.name}`)
  console.log(`  ${test.expect}`)
  console.log(`  ${test.candidates.join('  ')}`)

  if (!sides.length && !motions.length) {
    console.log(
      '  ⚠ NOTHING reached a matcher — the host dropped every candidate',
    )
  }

  for (const side of sides) {
    const motion = String(side.payload).slice(
      String(side.payload).lastIndexOf(':') + 1,
    )
    const stem = motion.replace(/^animate-/, '')
    // Two namespaces, and a reference can only be judged in the one it names. A motion named by its
    // own utility resolves through the slot stem; a label resolves through `--jumi-<slot>-label`.
    const byStem =
      stems.includes(stem) ||
      stems.some(candidate => candidate.startsWith(stem.replace(/-\[.*$/, '')))
    const byLabel = table.has(motion)

    console.log(
      `  ${side.side.padEnd(3)} payload=${String(side.payload).padEnd(38)}` +
        ` motion=${stem.padEnd(22)} → stem:${byStem ? 'hit ' : 'MISS'}  label:${byLabel ? 'hit ' : 'MISS'}` +
        (byLabel ? ` [${table.get(motion).join(', ')}]` : ''),
    )
  }

  for (const call of motions) {
    console.log(
      `  ctl ${call.name.padEnd(24)} value=${String(call.value).padEnd(10)} modifier=${call.modifier ?? '—'}` +
        `  label=${table.get(call.modifier) ? `recorded as "${call.modifier}"` : 'none'}`,
    )
  }

  console.log(`  slots available: ${stems.join(', ') || '—'}`)
  if (dropped.length)
    console.log(`  ⚠ dropped by the host: ${dropped.join(', ')}`)
  console.log('')
}

/* ------------------------------------------------------------------ the variant model */

/**
 * `view-transition-old/hero:animate-fade-out`, read the way Tailwind's own `group-hover/button:`
 * is read: a **variant parameterised by a modifier**, not a utility parameterised by a modifier.
 *
 * That is a different parse from everything above, and it is why the earlier cases were the wrong
 * experiment. `matchVariant(name, cb)` matches `name-<value>/<modifier>`, so a single registration
 * named `view-transition` splits the spelling into:
 *
 *     view-transition-old/hero:animate-fade-out
 *     └─────┬──────────┘ └──┬─┘ └──────┬───────┘
 *        variant name    value     the utility
 *          + value       (side)   (a real candidate)
 *                    modifier
 *                   (identity)
 *
 * Two consequences worth measuring rather than assuming. The motion after the `:` is an ordinary
 * candidate, so it is *instantiated* — the "a reference does not create the motion" problem
 * disappears. And a control can be scoped the same way, `view-transition-old/hero:animation-duration-500`,
 * which needs no label vocabulary at all.
 *
 * The callback is a **marker**: it records the pair and returns a selector that matches nothing, so
 * the wrapped utility is emitted where the finalizer can collect and delete it rather than where a
 * page would apply it. That is the same staging idea the carrier protocol already uses.
 */
const variantWrapperSource = pluginPath => `
import { writeFileSync } from 'node:fs'

import jumi from ${JSON.stringify(pluginPath)}

const firings = []
const target = process.env.JUMI_CALLS

export default {
  handler(api) {
    jumi.handler(api)

    api.matchVariant('view-transition', (value, { modifier }) => {
      /*
       * The value is validated before anything is recorded, and that is not defensive style.
       * Measured: Tailwind calls this callback once at configuration time with a sentinel value,
       * { value: 'a', modifier: null }, with no view-transition-* candidate in the source at all —
       * and the values option does not filter that call. A marker that recorded unconditionally
       * would put a bogus side=a into every page's metadata.
       */
      const side = value === 'old' || value === 'new' ? value : null

      if (side) firings.push({ identity: modifier ?? null, side })

      return '&:where(.jumi-vt-' + (side ?? 'probe') + '-' + (modifier ?? 'none') + ')'
    }, { values: { new: 'new', old: 'old' } })
  },
}

process.on('exit', () => {
  if (target) writeFileSync(target, JSON.stringify(firings))
})
`

const traceVariant = candidates => {
  const dir = mkdtempSync(path.join(here, '.vt-variant-'))
  const wrapper = path.join(dir, 'wrapper.js')
  const firings = path.join(dir, 'firings.json')

  writeFileSync(wrapper, variantWrapperSource(path.join(root, 'dist/index.js')))
  writeFileSync(
    path.join(dir, 'fixture.html'),
    candidates.map(candidate => `<div class="${candidate}"></div>`).join('\n'),
  )
  writeFileSync(
    path.join(dir, 'entry.css'),
    '@import "tailwindcss" source(none);\n@source "./fixture.html";\n' +
      `@plugin ${JSON.stringify(wrapper)};\n`,
  )

  try {
    execFileSync(
      'pnpm',
      [
        'exec',
        'tailwindcss',
        '-i',
        path.join(dir, 'entry.css'),
        '-o',
        path.join(dir, 'out.css'),
      ],
      {
        cwd: root,
        env: { ...process.env, JUMI_CALLS: firings },
        stdio: 'pipe',
      },
    )

    return {
      css: readFileSync(path.join(dir, 'out.css'), 'utf8'),
      firings: JSON.parse(readFileSync(firings, 'utf8')),
    }
  } finally {
    rmSync(dir, { force: true, recursive: true })
  }
}

const VARIANT_CASES = [
  {
    candidates: [
      'view-transition-old/hero:animate-fade-out',
      'view-transition-new/hero:animate-fade-in',
    ],
    expect: 'both sides in two self-contained candidates',
    name: 'both sides',
  },
  {
    candidates: ['view-transition-old/hero:animation-duration-500'],
    expect:
      'a control scoped to one side — does this need the label vocabulary at all?',
    name: 'control scoped to a side',
  },
  {
    candidates: [
      'view-transition-old/hero:animate-rotate-[0:0deg|20:-8deg|100:-8deg]',
    ],
    expect: 'an arbitrary phrase as the motion',
    name: 'phrase motion',
  },
  {
    candidates: ['view-transition-old/my-card-2:animate-fade-out'],
    expect: 'a hyphenated, arbitrary identity',
    name: 'arbitrary identity',
  },
  {
    candidates: ['hover:view-transition-old/hero:animate-fade-out'],
    expect: 'stacked under a real selector variant',
    name: 'stacked variant',
  },
  {
    candidates: ['motion-safe:view-transition-old/hero:animate-fade-out'],
    expect: 'stacked under the motion preference variant',
    name: 'stacked with motion-safe',
  },
  {
    candidates: ['view-transition-old:animate-fade-out'],
    expect: 'no identity at all — is the modifier optional?',
    name: 'identity omitted',
  },
  {
    candidates: [
      'view-transition-old/hero:animate-fade-out',
      'view-transition-new/hero:animate-fade-in',
    ],
    expect: 'and the same motion on both sides of one identity',
    name: 'one motion, two sides',
  },
]

console.log(
  '\n── the variant model — `view-transition-old/hero:animate-fade-out`\n',
)

for (const test of VARIANT_CASES) {
  const { css, firings } = traceVariant(test.candidates)

  const declarations = [...css.matchAll(/--jumi-([\w-]+):/g)].map(m => m[1])
  const wrapped = [
    ...new Set([...css.matchAll(/\.jumi-vt-([\w-]+)/g)].map(m => m[1])),
  ]
  const slots = motionSlots(css)

  console.log(`▌ ${test.name}`)
  console.log(`  ${test.expect}`)
  console.log(`  ${test.candidates.join('  ')}`)
  console.log(
    `  variant fired  : ${
      firings.length
        ? firings
            .map(f => `side=${f.side} identity=${f.identity ?? '—'}`)
            .join('   ')
        : 'NO — the candidate was not resolved as a variant'
    }`,
  )
  console.log(`  staged selector: ${wrapped.join(', ') || '—'}`)
  console.log(
    `  emitted        : ${declarations.length ? [...new Set(declarations)].slice(0, 8).join(', ') : 'NOTHING'}`,
  )
  console.log(`  slots created  : ${slots.join(', ') || '—'}`)
  console.log('')
}

/* ------------------------------------------------------------------ the marker model, in the emitted CSS */

/**
 * The direction: a marker variant that is **staging-only**, and whose metadata is recovered from the
 * emitted stylesheet rather than recorded from the callback.
 *
 * That second part is the answer to "make the sentinel impossible by construction", and it is not a
 * blacklist. The callback is called once at configuration time with a sentinel and no candidate, so
 * anything it *records* needs a guard. If instead the side and identity are **encoded in the selector**
 * the variant returns, then the metadata can only exist where a real candidate instantiated a rule —
 * a configuration-time probe emits nothing, so there is nothing to read. The finalizer then recovers
 * `side` and `identity` from the staged selectors, which is exactly how the carrier protocol already
 * moves data out of Tailwind and into a post-build pass.
 */
const markerWrapperSource = pluginPath => `
import { writeFileSync } from 'node:fs'

import jumi from ${JSON.stringify(pluginPath)}

const raw = []
const target = process.env.JUMI_CALLS

export default {
  handler(api) {
    jumi.handler(api)

    api.matchVariant('view-transition', (value, { modifier }) => {
      // Still recorded, but only to show what the *callback* sees versus what survives into CSS.
      raw.push({ modifier: modifier ?? null, value })

      if (value !== 'old' && value !== 'new') return '&'

      return '&:where(.jumi-vt-' + value + '-' + (modifier ?? 'default') + ')'
    }, { values: { new: 'new', old: 'old' } })
  },
}

process.on('exit', () => {
  if (target) writeFileSync(target, JSON.stringify(raw))
})
`

/**
 * A build with the marker variant registered, returning the emitted CSS and what the callback saw.
 *
 * The two are reported together on purpose: the callback is where a sentinel arrives, the stylesheet is
 * where metadata that actually exists can be read from, and the gap between them is the guard.
 */
const traceVariantProbe = candidates => {
  const dir = mkdtempSync(path.join(here, '.vt-marker-'))
  const wrapper = path.join(dir, 'wrapper.js')
  const raw = path.join(dir, 'raw.json')

  writeFileSync(wrapper, markerWrapperSource(path.join(root, 'dist/index.js')))
  writeFileSync(
    path.join(dir, 'fixture.html'),
    candidates.map(candidate => `<div class="${candidate}"></div>`).join('\n'),
  )
  writeFileSync(
    path.join(dir, 'entry.css'),
    '@import "tailwindcss" source(none);\n@source "./fixture.html";\n' +
      `@plugin ${JSON.stringify(wrapper)};\n`,
  )

  try {
    execFileSync(
      'pnpm',
      [
        'exec',
        'tailwindcss',
        '-i',
        path.join(dir, 'entry.css'),
        '-o',
        path.join(dir, 'out.css'),
      ],
      { cwd: root, env: { ...process.env, JUMI_CALLS: raw }, stdio: 'pipe' },
    )

    return {
      css: readFileSync(path.join(dir, 'out.css'), 'utf8'),
      raw: JSON.parse(readFileSync(raw, 'utf8')),
    }
  } finally {
    rmSync(dir, { force: true, recursive: true })
  }
}

/**
 * Every rule carrying a staged marker, with the at-rules around it.
 *
 * The at-rule context is the whole question for stacked variants: an environmental wrapper can be
 * carried onto the pseudo tree, a wrapper that depends on the *source element's* state cannot.
 */
const stagedRules = css => {
  const found = []

  postcss.parse(css).walkRules(rule => {
    if (!rule.selector.includes('jumi-vt-')) return

    const atRules = []
    let parent = rule.parent

    while (parent && parent.type !== 'root') {
      atRules.unshift(
        parent.type === 'atrule'
          ? `@${parent.name} ${parent.params}`.trim()
          : parent.type,
      )
      parent = parent.parent
    }

    found.push({
      atRules,
      declarations: (rule.nodes ?? [])
        .filter(n => n.type === 'decl')
        .map(n => `${n.prop}: ${n.value}`),
      selector: rule.selector,
    })
  })

  return found
}

const MARKER_CASES = [
  {
    candidates: ['view-transition-old/hero:animate-fade-out'],
    expect: 'the baseline: one side, one identity, one effect',
    name: 'staging shape',
  },
  {
    candidates: [
      'view-transition-old/hero:animate-fade-out',
      'view-transition-old/hero:animation-duration-300',
    ],
    expect: 'a side-specific control alongside the motion',
    name: 'side-specific control',
  },
  {
    candidates: [
      'view-transition-old/hero:animate-rotate-[0:0deg|20:-8deg|100:-8deg]',
    ],
    expect: 'a phrase',
    name: 'phrase',
  },
  {
    candidates: [
      'view-transition-old/hero:animate-fade-out',
      'view-transition-new/card:animate-fade-in',
    ],
    expect: 'two identities on one page',
    name: 'two identities',
  },
  {
    candidates: ['view-transition-old/hero:animate-fade-out'],
    expect: 'one side only',
    name: 'one-sided',
  },
  {
    candidates: ['motion-safe:view-transition-old/hero:animate-fade-out'],
    expect: 'environmental wrapper — should transfer',
    name: 'stacked: motion-safe',
  },
  {
    candidates: ['sm:view-transition-old/hero:animate-fade-out'],
    expect: 'environmental wrapper — should transfer',
    name: 'stacked: media query',
  },
  {
    candidates: [
      'supports-[display:grid]:view-transition-old/hero:animate-fade-out',
    ],
    expect: 'environmental wrapper — should transfer',
    name: 'stacked: supports',
  },
  {
    candidates: ['hover:view-transition-old/hero:animate-fade-out'],
    expect:
      'source-element state — parses, but what would it mean on the pseudo?',
    name: 'stacked: hover',
  },
  {
    candidates: ['focus:view-transition-old/hero:animate-fade-out'],
    expect: 'source-element state',
    name: 'stacked: focus',
  },
  {
    candidates: ['group-hover:view-transition-old/hero:animate-fade-out'],
    expect: 'state of another element',
    name: 'stacked: group-hover',
  },
  {
    candidates: ['peer-checked:view-transition-new/hero:animate-fade-in'],
    expect: 'state of another element',
    name: 'stacked: peer-checked',
  },
]

console.log('\n── the marker model, read out of the emitted stylesheet\n')

/**
 * The finalizer's reading of a staged rule: the three facts, recovered from the selector alone.
 *
 * `side` and `identity` come out of the marker class. The **source selector** is everything before it,
 * and it is what the finalizer needs in order to emit `view-transition-name: <identity>` back onto the
 * element — so the identity utility is unnecessary, which is the design's claim.
 *
 * **Transferability is decided by the shape, not by a list of variant names.** A variant whose meaning
 * is an environment (`motion-safe:` → `@media`, `sm:` → `@media`, `supports-[…]:` → `@supports`) leaves
 * the remainder as exactly **one class selector, every `:` escaped**. A variant that depends on the
 * source element's *state* (`hover:`, `focus:`, `group-hover:`, `peer-checked:`) adds unescaped
 * compound selector text or a relational `:is(…)`, and that text has no meaning on a pseudo tree that
 * is not a descendant of the element. The test is therefore a property of the emitted selector, which
 * holds for variants that do not exist yet.
 */
const MARKER = /:where\(\.jumi-vt-(old|new)-([\w-]+)\)$/
const SINGLE_CLASS = /^\.(?:\\.|[^:\\])+$/

const recover = css =>
  stagedRules(css).map(rule => {
    const marker = MARKER.exec(rule.selector)
    const source = marker ? rule.selector.slice(0, marker.index) : rule.selector
    const published = rule.declarations
      .map(
        declaration =>
          /^--jumi-([\w-]+)-animation-name$/.exec(
            declaration.split(':')[0],
          )?.[1],
      )
      .filter(Boolean)

    return {
      // The environment the rule sits in, which is what a transferable variant contributes.
      atRules: rule.atRules,
      declarations: rule.declarations.length,
      identity: marker?.[2] ?? null,
      published,
      side: marker?.[1] ?? null,
      source,
      transferable: SINGLE_CLASS.test(source),
    }
  })

const sentinel = (() => {
  const { css, raw } = traceVariantProbe(['animate-fade-in'])
  const staged = stagedRules(css)

  return {
    // What the callback saw, including the configuration-time probe.
    callbackSaw: raw,
    // What a reader of the stylesheet can find. Nothing, if the guard is structural.
    stagedFound: staged.length,
  }
})()

console.log('▌ the sentinel guard')
console.log('  a build with no view-transition candidate at all')
console.log(`  callback saw     : ${JSON.stringify(sentinel.callbackSaw)}`)
console.log(
  `  recoverable from CSS: ${sentinel.stagedFound} staged rules — ${sentinel.stagedFound === 0 ? 'NOTHING TO RECORD' : 'recorded!'}`,
)
console.log('')

for (const test of MARKER_CASES) {
  const { css } = traceVariantProbe(test.candidates)
  const recovered = recover(css)

  console.log(`▌ ${test.name}`)
  console.log(`  ${test.expect}`)
  console.log(`  ${test.candidates.join('  ')}`)

  if (!recovered.length) {
    console.log('  ⚠ nothing staged — the candidate did not resolve')
  }

  for (const rule of recovered) {
    console.log(
      `  side=${String(rule.side).padEnd(4)} identity=${String(rule.identity).padEnd(12)}` +
        ` slot=${(rule.published.join(',') || '—').padEnd(20)} transferable=${rule.transferable ? 'yes' : 'NO'}`,
    )
    console.log(`      source: ${rule.source}`)
    console.log(
      `      env   : ${rule.atRules.join('  ›  ')}  (${rule.declarations} declarations)`,
    )
  }

  console.log('')
}
