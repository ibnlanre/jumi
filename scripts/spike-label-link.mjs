#!/usr/bin/env node
/**
 * Probe: can the per-instance **link** go away?
 *
 * Today a named instance owns a hoist, ten fills and ten registrations:
 *
 *   .animate-fade-in\/reveal {
 *     --jumi-fade-in-animation-name: jumi-fade-in;
 *     --jumi-fade-in-label: reveal;                              ← which motion this is
 *     --jumi-slot-fade-in: … var(--jumi-slot-fade-in-animation-duration, …) …;
 *     --jumi-slot-fade-in-animation-duration: var(--jumi-label-reveal-animation-duration);   ×10
 *   }
 *
 * Note the slot key is **definition-only** — `--jumi-slot-fade-in` — so the fills are the only place the
 * author's word is bound to a part. The proposal is to bind it in the hoist instead and delete the fills:
 *
 *   --jumi-slot-fade-in: … var(--jumi-label-reveal-animation-duration, …) …;
 *
 * The risk being measured is the one that produced the fills: the word reaching the composition's chains. That
 * was nondeterministic *before* motion-instance identity existed, because one position per property had to
 * carry one word for the whole stylesheet — hence the both-orders run below.
 *
 * The simulation rewrites the compiled CSS with PostCSS (the same AST the finalizer walks) and measures both
 * models in a real browser. No production code is touched.
 *
 * Run: `pnpm spike:label-link`. Requires a bundle first, since the plugin under test is `dist/index.js`.
 */
import { chromium } from 'playwright'

import { build, compiler, root } from './lib/compile.mjs'

import postcss from 'postcss'

/** The naming arms from `behaviour:check`, so the readings are comparable with the shipped assertions. */
const ARMS = [
  [
    'a',
    'animate-fade-in/reveal animation-duration-300/reveal animation-duration-900/loop',
  ],
  ['b', 'animate-fade-in/loop animation-duration-700/loop'],
  [
    'c',
    'animate-fade-in/reveal animate-scale-110/loop animation-duration-900/loop',
  ],
  [
    'd',
    'animate-fade-in animation-duration-900/loop animation-duration-500/elsewhere',
  ],
  [
    'e',
    'animate-opacity-[0:0|100:1]/enter animate-rotate-[0:0deg|100:90deg]/enter animation-duration-500/enter animate-scale-[0:1|100:2]',
  ],
  [
    'f',
    'animate-rotate-45/scale animate-scale-110 animation-duration-1000/scale animation-duration-400/rotate',
  ],
]

const CANDIDATES = [
  ...new Set(
    ARMS.flatMap(([, classes]) => classes.split(/\s+/).filter(Boolean)),
  ),
]

const ENTRY = '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";'

const declarationsOf = rule =>
  (rule.nodes ?? []).filter(node => node.type === 'decl')

/**
 * Model B, simulated: the hoist reads the label variables, and the middle layer is removed.
 *
 * Read off the emitted CSS rather than assumed:
 *
 *   .animate-fade-in\/reveal {
 *     --jumi-fade-in-animation-name: jumi-fade-in;
 *     --jumi-fade-in-label: reveal;                                          ← the word, on this rule only
 *     --jumi-slot-fade-in: var(--jumi-fade-in-animation-name, …) var(--jumi-slot-fade-in-animation-duration, …) …;
 *     --jumi-slot-fade-in-animation-duration: var(--jumi-label-reveal-animation-duration);   ×10 fills
 *   }
 *
 * The slot key is definition-only (`--jumi-slot-fade-in`), so removing the fills means the hoist has to name
 * its own instance directly — `var(--jumi-label-reveal-animation-duration, …)`.
 *
 * The rewrite is **rule-scoped on purpose**. A textual one pass per instance would double-apply: two instances
 * of one definition share the slot key, so a global rewrite of `--jumi-slot-fade-in-<part>` mangles the second
 * rule with the first rule's word. Real emission is per-rule too (each activation rule declares its own hoist),
 * so the scoped rewrite is the faithful model, not a convenience.
 */
const withoutLink = css => {
  const document = postcss.parse(css)
  const links = []
  const registrations = []
  const slots = new Map()

  document.walkRules(rule => {
    const own = declarationsOf(rule)
    const label = own.find(node => /^--jumi-[\w-]+-label$/.test(node.prop))
    const activation = own.find(node =>
      /^--jumi-[\w-]+-animation-name$/.test(node.prop),
    )

    if (!label || !activation) return

    const name = label.value.trim()
    const definition = label.prop.slice('--jumi-'.length, -'-label'.length)
    const hoist = `--jumi-slot-${definition}`

    slots.set(definition, [...(slots.get(definition) ?? []), { name, rule }])

    // The fills, and the parts they were binding — the word is the one on this rule.
    for (const node of [...own]) {
      if (!node.prop.startsWith(`${hoist}-`)) continue

      const part = node.prop.slice(hoist.length + 1)

      links.push({ bytes: node.toString().length + 2, prop: node.prop })
      node.remove()

      const carrier = own.find(other => other.prop === hoist)

      if (carrier)
        carrier.value = carrier.value.replaceAll(
          `${hoist}-${part}`,
          `--jumi-label-${name}-${part}`,
        )
    }
  })

  // The parts the shorthand does not carry — `animation-range`, `-timeline`, `-composition` — are read by
  // their own composition rules, which are emitted per candidate and so name their instance in the selector.
  document.walkRules(rule => {
    for (const [definition, instances] of slots) {
      const word = rule.selector.match(/\/([\w-]+)$/)?.[1]
      const named = instances.some(({ name }) => name === word)

      if (!named) continue

      for (const node of declarationsOf(rule))
        if (node.value.includes(`--jumi-slot-${definition}-`))
          node.value = node.value.replaceAll(
            `--jumi-slot-${definition}-`,
            `--jumi-label-${word}-`,
          )
    }
  })

  for (const prop of new Set(links.map(({ prop }) => prop)))
    document.walkAtRules('property', atRule => {
      if (atRule.params.trim() !== prop) return

      registrations.push({
        bytes: atRule.toString().length + 1,
        prop: atRule.params.trim(),
      })
      atRule.remove()
    })

  return { css: document.toString(), links, registrations }
}

const browser = await chromium.launch()
const page = await browser.newPage()

const built = build(await compiler(ENTRY, root), CANDIDATES)
const proposed = withoutLink(built.css)

/**
 * Every live animation per arm, as `name@duration`, in position order.
 *
 * Position order rather than a map keyed by name: two positions may resolve the same keyframe, and a map
 * would silently keep only the last of them — which is how a duplicate position once read as a pass.
 */
const readings = async css => {
  await page.setContent(`<!doctype html>
<html><head><style>${css}</style></head>
<body>${ARMS.map(([id, classes]) => `<div id="arm-${id}" class="${classes}"></div>`).join('\n')}</body></html>`)

  return page.evaluate(
    ids =>
      Object.fromEntries(
        ids.map(id => {
          const style = getComputedStyle(document.getElementById(`arm-${id}`))
          const names = style.animationName
            .split(',')
            .map(value => value.trim())
          const durations = style.animationDuration
            .split(',')
            .map(value => value.trim())

          return [
            id,
            names.map((name, at) => `${name}@${durations[at] ?? '?'}`),
          ]
        }),
      ),
    ARMS.map(([id]) => id),
  )
}

console.log('══ can the per-instance link go away?\n')

const forward = {
  A: await readings(built.css),
  B: await readings(proposed.css),
}
const reversed = build(await compiler(ENTRY, root), [...CANDIDATES].reverse())
const backwards = {
  A: await readings(reversed.css),
  B: await readings(withoutLink(reversed.css).css),
}

const live = list => list.filter(entry => !entry.startsWith('none@'))
const show = list => live(list).join(', ') || '(nothing live)'

/**
 * The live animations, in position order, as a string.
 *
 * Position order, not a sorted bag: the historical failure held the same *set* of animations and only
 * swapped their order — `0.9s, 1s` in one candidate order, `1s, 0.9s` in the other — and with
 * `animation-fill-mode: forwards` the last one writes the property. A bag would call that identical.
 */
const order = list => JSON.stringify(live(list))

/** Whether the same animations run, and whether they sit in the same positions. */
const same = (one, two) => ({
  bag:
    JSON.stringify([...live(one)].sort()) ===
    JSON.stringify([...live(two)].sort()),
  order: order(one) === order(two),
  positions: JSON.stringify(one) === JSON.stringify(two),
})

console.log('── readings, per arm (model A today / model B without the link)\n')
for (const [id] of ARMS) {
  const here = same(forward.A[id], forward.B[id])
  const verdict = here.order
    ? here.positions
      ? 'identical'
      : 'same animations, unset positions moved'
    : here.bag
      ? 'DIFFERENT ORDER'
      : 'DIFFERENT ANIMATIONS'

  console.log(`   ${id}  ${verdict}`)
  console.log(`      A (today):    ${show(forward.A[id])}`)
  if (!here.order) console.log(`      B (no link):  ${show(forward.B[id])}`)
}

console.log('\n── the failure mode the middle layer was introduced for\n')

// Removed-vs-today first, because that is the question; order-sensitivity second, because a change there is
// only a regression if today's model does not already have it.
for (const [phase, [today, without]] of [
  ['as written', [forward.A, forward.B]],
  ['reversed', [backwards.A, backwards.B]],
]) {
  const differs = ARMS.filter(
    ([id]) => order(today[id]) !== order(without[id]),
  ).map(([id]) => id)

  console.log(
    `   removing the link, candidate order ${phase}: ${
      differs.length
        ? `reading changes on ${differs.join(', ')}`
        : 'no arm changes'
    }`,
  )
}

for (const model of ['A', 'B']) {
  const drift = ARMS.filter(
    ([id]) => order(forward[model][id]) !== order(backwards[model][id]),
  ).map(([id]) => id)

  console.log(
    `   reversing the order, model ${model}: ${
      drift.length ? `reading changes on ${drift.join(', ')}` : 'no arm changes'
    }`,
  )
}

console.log('\n── cost\n')

const references = css => {
  let total = 0

  postcss.parse(css).walkDecls(node => {
    total += node.value.split('--jumi-label-').length - 1
  })

  return total
}

const deleted = [...proposed.links, ...proposed.registrations].reduce(
  (total, { bytes }) => total + bytes,
  0,
)

console.log(
  `   the link layer is ${proposed.links.length} declarations in ${
    new Set(
      proposed.links.map(
        ({ prop }) =>
          prop.match(/^(--jumi-slot-[\w-]+?)-(?:animation|view|scroll)-/)?.[1],
      ),
    ).size
  } slots, plus ${proposed.registrations.length} registrations`,
)
console.log(
  `   removing it measures ${deleted} bytes of the emitted stylesheet`,
)

for (const [label, css] of [
  ['A (today)', built.css],
  ['B (no link)', proposed.css],
]) {
  console.log(
    `   ${label.padEnd(12)} ${String(css.length).padStart(7)} bytes   ` +
      `${String(new Set([...css.matchAll(/@property (--jumi-slot-[\w-]+)/g)].map(m => m[1])).size).padStart(3)} slot registrations   ` +
      `${String(references(css)).padStart(3)} label references`,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// §2  the three separate parts
//
// `animation-composition`, `animation-range` and `animation-timeline` have no shorthand section, so the
// composition declares them itself. It is one rule for every activating selector, which is why it cannot
// name a motion — and why a name reaches it through three fills on the rule that wrote the name:
//
//   .animate-rotate-45\/alpha {
//     --jumi-<key>-label: alpha;                            ← the name, as written
//     --jumi-slot-<key>-animation-composition: var(--jumi-label-alpha-animation-composition);
//     --jumi-slot-<key>-animation-range:       var(--jumi-label-alpha-animation-range);
//     --jumi-slot-<key>-animation-timeline:    var(--jumi-label-alpha-animation-timeline);
//   }
//
// The composition then reads `var(--jumi-slot-<key>-animation-<part>, … --jumi-<attribute>-… )`.
//
// §1 removed the link for the parts the shorthand carries, by inlining the label into the hoist. This
// section asks the same question for the three it does not carry: does the composition change if the
// fills go and the chain names the label directly?
//
// Three models, never two — a deletion on its own is not a proposal, it is a control:
//
//   A  shipped:  fills present, composition reads the slot
//   B  inlined:  fills absent, composition reads `var(--jumi-label-<name>-<part>`, fallback intact
//   C  deleted:  fills absent, composition untouched — the negative control. If C also reads the same,
//                the fills were never load-bearing and this section measures nothing.
//
// `--jumi-label-*` is registered `inherits: false` by `nameSlot`, which is what keeps B element-local:
// the composition is shared, but a descendant that did not write the name has no value for the label and
// falls through the chain. That is the arm that can tell the two apart.

const SEPARATE = [
  'animation-composition',
  'animation-range',
  'animation-timeline',
]

/**
 * The arms for this section, and the four cases the model has to survive.
 *
 * `p` and `q` are two names over one definition — the case a chain that named a motion globally once lost
 * order-dependently. `r` is a bare sibling on the same property with no control at all. `t` names itself
 * after a structural address of a *different* property (`/scale` on a rotate motion): the model refuses to
 * write a label for it, so there is nothing for the inline model to reference and it must not misroute.
 */
const PART_ARMS = [
  [
    'p',
    'animate-rotate-45/alpha animation-composition-add/alpha animation-range-[25%_75%]/alpha animation-timeline-scroll/alpha',
  ],
  [
    'q',
    'animate-rotate-45/beta animation-composition-add/beta animation-range-[10%_90%]/beta animation-timeline-scroll/beta',
  ],
  ['r', 'animate-rotate-45'],
  ['t', 'animate-rotate-45/scale animation-composition-add/scale'],
]

/** The descendant of `p`: same definition and the same property, but it never wrote a name. */
const PART_DESCENDANT = ['desc', 'animate-rotate-45']

const PART_MARKUP = `
<div data-arm="p" class="${PART_ARMS[0][1]}">
  <div data-arm="desc" class="${PART_DESCENDANT[1]}"></div>
</div>
${PART_ARMS.slice(1)
  .map(([id, classes]) => `<div data-arm="${id}" class="${classes}"></div>`)
  .join('\n')}`

const PART_CANDIDATES = [
  ...new Set([
    ...CANDIDATES,
    ...PART_ARMS.flatMap(([, classes]) => classes.split(' ')),
    ...PART_DESCENDANT[1].split(' '),
  ]),
]

/**
 * Model B and model C.
 *
 * The name for a slot is read from `--jumi-<key>-label` — the declaration the naming rule already emits —
 * rather than from the arm, because the point is to reproduce what the model *would* write, not what this
 * script believes the arm means. A key with no label is left alone: that is the refused/shadowed case,
 * and inventing a reference for it would hide the very thing the case is there to show.
 */
const withoutPartsLink = (css, { inline = true, register = true } = {}) => {
  const document = postcss.parse(css)
  const labels = new Map()
  const fills = []
  const inlined = []
  const orphaned = []

  document.walkDecls(node => {
    const labelled = /^--jumi-(.+)-label$/.exec(node.prop)

    if (labelled) labels.set(labelled[1], node.value)
  })

  document.walkDecls(node => {
    const fill = new RegExp(`^--jumi-slot-(.+)-(${SEPARATE.join('|')})$`).exec(
      node.prop,
    )

    if (!fill) return

    fills.push({ prop: node.prop, bytes: node.toString().length + 1 })
    node.remove()
  })

  if (inline)
    document.walkDecls(node => {
      for (const part of SEPARATE)
        for (const [key, name] of labels) {
          const from = `var(--jumi-slot-${key}-${part}`

          if (!node.value.includes(from)) continue

          node.value = node.value.replaceAll(
            from,
            `var(--jumi-label-${name}-${part}`,
          )
          inlined.push(`${name}→${part}`)
        }
    })

  const registrations = []

  // Kept for the negative control: deleting a fill and deleting the registration that gives its variable
  // `inherits: false` are two different changes, and a control that makes both at once cannot say which
  // one the reading moved under.
  if (register)
    for (const prop of new Set(fills.map(({ prop }) => prop)))
      document.walkAtRules('property', atRule => {
        if (atRule.params.trim() !== prop) return

        registrations.push({ prop, bytes: atRule.toString().length + 1 })
        atRule.remove()
      })

  // A read left pointing at a fill that no longer exists. The motion would still run — every chain ends
  // in a fallback — so this cannot be caught by a live reading, only by looking at what was emitted.
  if (inline)
    postcss.parse(document.toString()).walkDecls(node => {
      for (const part of SEPARATE)
        for (const [, match] of node.value.matchAll(
          new RegExp(`var\\(--jumi-slot-(.+?)-${part}`, 'g'),
        ))
          orphaned.push(`${match}-${part}`)
    })

  // Links that name an *instance* but that nothing declares — the honest count of "a chain points at a
  // variable that is not there". Two kinds of link are excluded on purpose, because both are optional by
  // design: the fallback levels (`--jumi-rotate-animation-range`, the attribute scope, emitted only when a
  // control without a name writes it, and the `--jumi-animation-<part>` substrate), and the label
  // (`--jumi-label-<name>-animation-<part>`, written only by the control that named it, so a chain naming
  // a motion no control addressed is correct rather than broken). What is left is a link shaped like an
  // instance key that no rule ever writes — pure weight, and invisible to every live reading.
  const declared = new Set()
  const dangling = []
  const parsed = postcss.parse(document.toString())

  parsed.walkDecls(node => {
    if (node.prop.startsWith('--jumi-')) declared.add(node.prop)
  })

  parsed.walkDecls(node => {
    for (const part of SEPARATE)
      for (const [, link] of node.value.matchAll(
        new RegExp(`var\\((--jumi-(?!label-)(?:[\\w-]+?-){2,}${part})\\b`, 'g'),
      ))
        if (!declared.has(link)) dangling.push(link)
  })

  return {
    css: document.toString(),
    dangling: [...new Set(dangling)],
    // The text of those reads, not the variables they name: an undeclared link costs what it takes to
    // write it, plus whatever the browser spends resolving a `var()` that can only ever be empty.
    danglingBytes: dangling.reduce(
      (total, link) => total + link.length + 'var(, )'.length,
      0,
    ),
    fills,
    inlined,
    orphaned,
    registrations,
  }
}

const partPage = await browser.newPage()

/**
 * The three parts as the element's own animations resolve them.
 *
 * Position-matched like §1, and for the same reason: every element carries a position for every slot in the
 * stylesheet, and the one this element activated is the one whose name starts with its property.
 */
const partReadings = async css => {
  await partPage.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>${PART_MARKUP}</body></html>`,
  )

  return partPage.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('[data-arm]')].map(element => {
        const style = getComputedStyle(element)
        const names = style.animationName.split(',').map(value => value.trim())
        const at = names.findIndex(name => name.startsWith('jumi-rotate-'))
        const pick = value => value.split(',')[at]?.trim() ?? 'absent'

        return [
          element.dataset.arm,
          {
            activated: at < 0 ? 'none' : names[at],
            composition: pick(style.animationComposition),
            range: pick(style.animationRange),
            timeline: pick(style.animationTimeline),
          },
        ]
      }),
    ),
  )
}

const partsForward = build(await compiler(ENTRY, root), PART_CANDIDATES)
const partsReversed = build(
  await compiler(ENTRY, root),
  [...PART_CANDIDATES].reverse(),
)

const models = {
  A: partsForward.css,
  B: withoutPartsLink(partsForward.css).css,
  C: withoutPartsLink(partsForward.css, { inline: false, register: false }).css,
}

const parts = {}
const partsBackwards = {}

for (const [model, css] of Object.entries(models))
  parts[model] = await partReadings(css)

for (const model of ['A', 'B', 'C'])
  partsBackwards[model] = await partReadings(
    model === 'A'
      ? partsReversed.css
      : withoutPartsLink(partsReversed.css, {
          inline: model === 'B',
          register: model === 'B',
        }).css,
  )

const stripped = withoutPartsLink(partsForward.css)

const identical = (one, two) => JSON.stringify(one) === JSON.stringify(two)

const describe = reading =>
  `${reading.composition} / ${reading.range} / ${reading.timeline}`

const PART_IDS = [...PART_ARMS.map(([id]) => id), PART_DESCENDANT[0]]

console.log('\n══ §2  the three separate parts\n')

console.log('── readings, per element (composition / range / timeline)\n')
for (const id of PART_IDS) {
  const today = parts.A[id]
  const inlined = parts.B[id]
  const removed = parts.C[id]
  const verdict = identical(inlined, today) ? 'B identical' : 'B DIFFERS'

  console.log(
    `   ${id.padEnd(5)} ${today.activated.padEnd(24)} ${describe(today)}`,
  )
  console.log(
    `         ${' '.repeat(24)} ${describe(inlined).padEnd(30)} ${verdict}` +
      (identical(removed, today)
        ? '   (C also identical — nothing load-bearing)'
        : `   (C differs: ${describe(removed)})`),
  )
}

console.log('\n── the four cases\n')

const rangeOf = id => parts.A[id].range

const cases = [
  [
    'two names over one definition',
    rangeOf('p') !== rangeOf('q') &&
      rangeOf('p').includes('25%') &&
      rangeOf('q').includes('10%'),
    `alpha ${rangeOf('p')}, beta ${rangeOf('q')}`,
  ],
  [
    'and both survive inlining',
    identical(parts.A.p, parts.B.p) && identical(parts.A.q, parts.B.q),
    `${describe(parts.B.p)} | ${describe(parts.B.q)}`,
  ],
  [
    'a refused/shadowed name writes no label',
    !stripped.inlined.some(entry => entry.startsWith('scale→')) &&
      parts.A.t.composition === 'replace',
    `${stripped.inlined.length} references inlined, for ${[
      ...new Set(stripped.inlined.map(entry => entry.split('→')[0])),
    ].join(
      ', ',
    )}; /scale left at ${parts.A.t.composition} → ${parts.B.t.composition}`,
  ],
  [
    'a descendant that wrote no name is untouched',
    parts.A.desc.composition === 'replace' &&
      identical(parts.A.desc, parts.A.r) &&
      identical(parts.A.desc, parts.B.desc),
    `${describe(parts.B.desc)} — same as the bare sibling, and unchanged by inlining`,
  ],
  [
    'and so is a bare sibling',
    parts.A.r.composition === 'replace' && identical(parts.A.r, parts.B.r),
    describe(parts.B.r),
  ],
  [
    'a later slot cannot move an earlier reading',
    identical(parts.A.p, partsBackwards.A.p),
    `reversed order: ${describe(partsBackwards.A.p)}`,
  ],
  [
    'and neither model drifts with candidate order',
    PART_IDS.every(
      id =>
        identical(parts.A[id], partsBackwards.A[id]) &&
        identical(parts.B[id], partsBackwards.B[id]),
    ),
    PART_IDS.filter(id => !identical(parts.B[id], partsBackwards.B[id])).join(
      ', ',
    ) || 'no element changes',
  ],
  [
    'no chain is left pointing at a deleted fill',
    stripped.orphaned.length === 0,
    `${stripped.orphaned.length} orphaned slot reads; ` +
      `${stripped.dangling.length} undeclared links, ${stripped.danglingBytes} bytes — ` +
      `in model A as well: ${stripped.dangling.join(', ') || 'none'}`,
  ],
]

for (const [name, held, detail] of cases)
  console.log(`   ${held ? '✓' : '✗'} ${name.padEnd(46)} ${detail}`)

console.log(
  '\n── re-emission: a slot that appears after a pass has published\n',
)

// The address link is only added to a slot's chain when the slot is named, and the model republishes when
// that set grows. Both models have to be insensitive to *when* a later motion joins the build.
const lateCompiler = await compiler(ENTRY, root)
const EARLY_CANDIDATES = [
  ...PART_CANDIDATES,
  ...PART_ARMS.map(([, classes]) => classes),
  PART_DESCENDANT[1],
]
const early = build(lateCompiler, EARLY_CANDIDATES)
const late = build(lateCompiler, [
  ...EARLY_CANDIDATES,
  'animate-scale-110/extra',
  'animate-scale-110/extra animation-composition-add/extra',
])

const earlyParts = {
  A: await partReadings(early.css),
  B: await partReadings(withoutPartsLink(early.css).css),
}
const lateParts = {
  A: await partReadings(late.css),
  B: await partReadings(withoutPartsLink(late.css).css),
}

console.log(
  `   a second motion joined the build: ${early.css.length} → ${late.css.length} bytes`,
)
console.log(
  `   ${identical(earlyParts.A.p, lateParts.A.p) ? '✓' : '✗'} the earlier element reads the same        A ${lateParts.A.p.activated} · ${describe(lateParts.A.p)}`,
)
console.log(
  `   ${identical(earlyParts.B.p, lateParts.B.p) ? '✓' : '✗'} and the same under the inline model B  ${lateParts.B.p.activated} · ${describe(lateParts.B.p)}`,
)

console.log('\n── cost of the three fills\n')

const bytesOf = entries =>
  entries.reduce((total, entry) => total + entry.bytes, 0)

console.log(
  `   ${stripped.fills.length} fills over ${new Set(stripped.fills.map(({ prop }) => prop.replace(/-animation-.*$/, ''))).size} slots` +
    ` — ${bytesOf(stripped.fills)} bytes; ${stripped.registrations.length} slot registrations — ${bytesOf(stripped.registrations)} bytes`,
)
console.log(
  `   the inline model spends, instead, ${stripped.inlined.length} label references rewritten inside the composition — no declaration added`,
)
console.log(
  `   negative control (C) on the same element: ${describe(parts.C.p)} vs shipped ${describe(parts.A.p)}`,
)

await partPage.close()

await browser.close()

// Show the work: the first rewritten hoist should name its own instance, with no fill left to do it.
let shown = false

postcss.parse(proposed.css).walkRules(rule => {
  if (shown) return

  const own = declarationsOf(rule)
  const hoist = own.find(node => /^--jumi-slot-[\w-]+$/.test(node.prop))

  if (!hoist || !own.some(node => /^--jumi-[\w-]+-label$/.test(node.prop)))
    return

  const reads = [...hoist.value.matchAll(/--jumi-label-[\w-]+/g)].map(
    match => match[0],
  )

  console.log(`\n── shape\n\n   ${rule.selector}\n      ${hoist.prop} reads:`)
  for (const read of reads) console.log(`         ${read}`)

  shown = true
})
