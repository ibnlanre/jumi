#!/usr/bin/env node
/**
 * Model-wide typing census — which of the leaves can hold a typed registration, and which cannot.
 *
 * The variable-architecture pivot needs one fact per animatable slot: a CSS Properties & Values API
 * `syntax` and an identity `initial-value`. The spike proved those two are **semantic model data**, not
 * implementation detail — a registered slot interpolates and an unregistered one steps, and a
 * registered slot always has a computed value so its `var()` fallback is unreachable.
 *
 * The trap this census exists to avoid is in the CTO's own words: going from "canonical-body
 * overengineering" to "typed-property overgeneralization". 214 leaves look scalar-shaped, and
 * scalar-shaped is not the same as safely typable. The model says so itself, in one line:
 *
 *   'width': { value: 'auto', … }                    the entry's identity is a keyword
 *   'animate-width': { type: ['length', 'percentage', 'any'], … }   its candidate is lengths
 *
 * Registering `--jumi-width` as `<length-percentage>` cannot carry the identity the element already
 * has, and registering it with `initial-value: 0px` would silently change what an element with no
 * width utility means. So the census asks, per leaf, a question with a mechanical answer:
 *
 *   does the default the model already declares **fit** the syntax the candidate's declared types
 *   imply?
 *
 * and answers it in the browser rather than by inspection, because `CSS.registerProperty` rejects an
 * `initial-value` outside its syntax and that is the same question. **The identity is never
 * substituted** — a census that swapped `auto` for `0px` to make a registration succeed would be
 * reporting its own invention as the model's.
 *
 * When the bare component refuses the identity, one more rung is tried, because the Properties &
 * Values API supports unions and the reason a keyword-bearing property looks untypable may only be
 * that nobody wrote the union down: `<length-percentage> | auto`. §D measures the rung rather than
 * trusting it, because a union that registers and then *steps* between its own components is not a
 * fix.
 *
 * Run: node scripts/spike-property-typing.mjs
 */
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { readLeaves, readPropertyEntries } from './lib/property-model.mjs'

import fs from 'node:fs'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const header = title => console.log(`\n${'─'.repeat(96)}\n${title}\n`)

const { leaves } = readLeaves()

/* ────────────────────────────────────────────────────────────────────────────
 * §A The model, classified by what it says about itself.
 * ──────────────────────────────────────────────────────────────────────────── */

/** A string literal in the model is the identity; everything else keeps its source text. */
const unquote = value =>
  /^'[^']*'$/.test(value)
    ? value.slice(1, -1)
    : /^"[^"]*"$/.test(value)
      ? value.slice(1, -1)
      : null

/**
 * The shape of an entry's value, which is the question "can a scalar registration hold this at all":
 *
 *   literal     `'1'`, `'0deg'`, `'auto'`   — a scalar, whatever the scalar means
 *   function    `css('blur', '0')`          — a *call*, so the slot holds an expression and the
 *                                             interpolable thing is its argument
 *   expression  `join([…])` under a name    — a composition the graph does not declare: it has no
 *                                             `dependencies`, so it is a leaf only by the graph's
 *                                             reckoning, and there is nothing in it to interpolate
 */
const shapeOf = value => {
  if (value === null) return 'missing'
  if (/^css\(/.test(value)) return 'function'
  if (unquote(value) !== null) return 'literal'

  return 'expression'
}

/** The function name and argument text of a `css('f', 'arg')` value. */
const callOf = value => {
  const match = value.match(/^css\(\s*'([^']+)'\s*,\s*'([^']*)'\s*\)$/)

  return match ? { arg: match[2], fn: match[1] } : null
}

/**
 * The Tailwind value-type vocabulary a candidate declares, mapped to a Properties & Values syntax
 * component. `any` is dropped from the key and kept as a flag: it says arbitrary spellings are
 * accepted, which for a typed slot means the *grammar* is what matters and the spelling is not —
 * `animate-width-[calc(100%-2rem)]` is still a `<length-percentage>`.
 *
 * The mapping is deliberately partial. A union that is not in this table is not typed by guessing; it
 * falls out of the census as a leaf the census will not propose for, which is a finding rather than a
 * gap to paper over. `number,percentage` maps to a union of components rather than to the single
 * component the Values spec names for it, because §C measured that Chromium rejects `<number-percentage>`
 * as a syntax — the spec's own component list is not all implemented, and the census would rather write
 * the thing that works than the thing that reads better.
 */
const SYNTAX_OF_TYPE = {
  'angle': '<angle>',
  'color': '<color>',
  'image': '<image>',
  'image,url': '<image>',
  'integer': '<integer>',
  'length': '<length>',
  'length,line-width': '<length>',
  'length,percentage': '<length-percentage>',
  'line-width': '<length>',
  'number': '<number>',
  'number,percentage': '<number> | <percentage>',
  // An aspect-ratio atom is a number (`16` of `16/9`), so the grammar is a component with a keyword
  // identity rather than a grammar the census cannot read.
  'ratio': '<number>',
  'url': '<url>',
}

/**
 * A leaf's declared grammar: the union of what its **constituent** writers accept, minus the openness
 * flag. Only part-writers count, because a whole-attribute candidate is not making a claim about the
 * slot's grammar — it is animating the property, and the property's own grammar is the browser's
 * business.
 */
const grammarOf = leaf => {
  const types = [
    ...new Set(
      [...leaf.writers, ...leaf.wholes].flatMap(writer => writer.types),
    ),
  ].sort()

  return {
    key: types.filter(type => type !== 'any').join(','),
    open: types.includes('any'),
  }
}

const census = leaves.map(leaf => ({
  ...leaf,
  call: leaf.value === null ? null : callOf(leaf.value),
  default: leaf.value === null ? null : (unquote(leaf.value) ?? leaf.value),
  grammar: grammarOf(leaf),
  shape: shapeOf(leaf.value),
}))

/**
 * A leaf a candidate can address, by the rule the build itself uses: a candidate's surfaces are its
 * parts, or its attribute when it declares none (`src/core/surfaces.ts`). So a slot is animated if some
 * candidate names it as a part **or** names it as its own property.
 *
 * The two are kept apart because they are different motions, and the split is worth reporting even
 * though neither is disqualifying: a part-writer is a *constituent* of a composed value, while a
 * whole-writer animates the property that **is** the slot. Both have a frame key naming one slot, and
 * both are typed the same way.
 */
const animated = census.filter(
  leaf => leaf.writers.length || leaf.wholes.length,
)
const asPart = animated.filter(leaf => leaf.writers.length)
const asAttribute = animated.filter(
  leaf => !leaf.writers.length && leaf.wholes.length,
)
const silent = census.filter(
  leaf => !leaf.writers.length && !leaf.wholes.length,
)

/** The composites that name a leaf, which is what makes it *routing* rather than dead weight. */
const namedBy = new Map()

for (const entry of readPropertyEntries().filter(one => one.composite)) {
  for (const dep of entry.deps) {
    namedBy.set(dep, [...(namedBy.get(dep) ?? []), entry.slot])
  }
}

header('§A  the model, by what it says about itself')

console.log(`  entries in the graph                       624`)
console.log(
  `  composites                                  ${624 - census.length}`,
)
console.log(`  leaves                                     ${census.length}`)
console.log(`    · a candidate can address it              ${animated.length}`)
console.log(`        · named as a part of a composed value ${asPart.length}`)
console.log(
  `        · named as its own attribute          ${asAttribute.length}`,
)
console.log(`    · no candidate addresses it               ${silent.length}`)

console.log(`\n  the leaves a candidate can address, by value shape:`)

for (const shape of ['literal', 'function', 'expression']) {
  const of = animated.filter(leaf => leaf.shape === shape)
  const shown = of
    .slice(0, 5)
    .map(leaf => leaf.slot)
    .join(' ')

  console.log(
    `    · ${shape.padEnd(11)} ${String(of.length).padStart(3)}  ${shown}${of.length > 5 ? ' …' : ''}`,
  )
}

console.log(`\n  by the grammar their candidates declare:`)

const grammars = new Map()

for (const leaf of animated) {
  const key = `${leaf.grammar.key}|${leaf.grammar.open ? 'open' : 'closed'}`

  grammars.set(key, [...(grammars.get(key) ?? []), leaf])
}

for (const [key, of] of [...grammars].sort(
  (a, b) => b[1].length - a[1].length,
)) {
  const [types, open] = key.split('|')
  const shown = of
    .slice(0, 6)
    .map(leaf => leaf.slot)
    .join(' ')

  console.log(
    `    ${String(of.length).padStart(3)}  ${(types || '— only `any` —').padEnd(30)} ${
      open === 'open' ? 'open  ' : '      '
    } ${(SYNTAX_OF_TYPE[types] ?? '').padEnd(20)} ${shown}${of.length > 6 ? ' …' : ''}`,
  )
}

// The fourth bucket: a leaf no candidate addresses is not a slot to type, it is structure — the
// routing the compositions read on their way down. The distinction that matters is whether a
// composition names it at all, because a leaf nothing names and nothing writes is an entry the model
// carries for no reason anyone can see from here.
header('§A2  the leaves no candidate addresses')

const routing = silent.filter(leaf => (namedBy.get(leaf.slot) ?? []).length)
const unread = silent.filter(leaf => !(namedBy.get(leaf.slot) ?? []).length)

console.log(`  named by a composition, so: routing        ${routing.length}`)
console.log(`  named by nothing at all                    ${unread.length}`)
console.log(`\n  by value shape:`)

for (const shape of ['literal', 'function', 'expression']) {
  const of = silent.filter(leaf => leaf.shape === shape)

  console.log(`    · ${shape.padEnd(11)} ${String(of.length).padStart(3)}`)
}

console.log(
  `\n  the ${unread.length} that no composition names and no candidate writes, in full:`,
)
console.log(`  ${unread.map(leaf => leaf.slot).join('\n  ')}`)

/* ────────────────────────────────────────────────────────────────────────────
 * §B The registration each leaf would get, and what it would be made of.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * What a leaf would register as.
 *
 * `slot`     — the leaf's own variable becomes the interpolable unit, and the identity is the model's
 *              own default.
 * `argument` — the leaf's value is a *call*, so no scalar can hold it. The interpolable unit is the
 *              argument and the function stays in the static composition, so
 *              `filter: blur(var(--jumi-filter-blur-amount))`. The identity is the argument the model
 *              already rests at, which turns `blur(0)` into amount `0` — the same value, written once.
 */
const propose = leaf => {
  const syntax = SYNTAX_OF_TYPE[leaf.grammar.key]

  // No mapping is two different findings, and separating them matters. A leaf whose candidates declare
  // `any` and nothing else is a **keyword-valued** property: there is no interpolation unit in it, and
  // none to lose. A leaf whose candidates declare several components is a different thing —
  // `transform-origin-x` rests at `50%` and accepts `center` — and typing it would mean *removing*
  // values the model takes today, because the keyword set it would have to include is recorded nowhere
  // in the model. The census will not invent it.
  if (!syntax)
    return {
      leaf,
      mechanism: null,
      reason: leaf.grammar.key
        ? 'a grammar wider than one component, and the keyword set is recorded nowhere'
        : 'keyword-valued: no interpolation unit',
    }

  if (leaf.shape === 'expression')
    return {
      leaf,
      mechanism: null,
      reason: 'a composition the graph does not declare',
    }

  if (leaf.shape === 'function') {
    if (!leaf.call)
      return { leaf, mechanism: null, reason: 'a call this census cannot read' }

    // A slot whose candidates write a **function** holds the whole call, not an argument: `filter-url`
    // rests at `opacity(1)` and a phrase writes `url(…)` into the same slot, so there is no fixed
    // function for the composition to keep and no argument to animate. Its grammar is `url`, and that
    // is the tell — the value grammars (length, number, angle) are arguments, a `url` is a call.
    if (leaf.grammar.key === 'url')
      return {
        leaf,
        mechanism: null,
        reason: 'a slot that holds a whole function, not an argument',
      }

    return {
      argument: leaf.call.arg,
      fn: leaf.call.fn,
      leaf,
      mechanism: 'argument',
      reason: `the argument of ${leaf.call.fn}()`,
      syntax,
    }
  }

  return {
    leaf,
    mechanism: 'slot',
    reason: 'the grammar the candidates declare',
    syntax,
  }
}

const proposals = animated.map(propose)
const judged = proposals.filter(proposal => proposal.mechanism)
const byMechanism = {
  argument: proposals.filter(proposal => proposal.mechanism === 'argument'),
  slot: proposals.filter(proposal => proposal.mechanism === 'slot'),
}

header('§B  what each animated leaf would register as')

console.log(
  `  the leaf's own slot                        ${byMechanism.slot.length}`,
)
console.log(
  `  the argument of it, the function reshaped  ${byMechanism.argument.length}`,
)
console.log(
  `  the census will not propose for            ${proposals.length - judged.length}`,
)

console.log(`\n  the function-shaped leaves, which no scalar slot can hold:`)

for (const proposal of byMechanism.argument) {
  console.log(
    `    ${proposal.leaf.slot.padEnd(30)} ${proposal.leaf.value.padEnd(26)} → argument ${proposal.argument.padEnd(6)} as ${proposal.syntax}`,
  )
}

console.log(`\n  the leaves the census will not propose for, with the reason:`)

const reasons = new Map()

for (const proposal of proposals.filter(one => !one.mechanism)) {
  reasons.set(proposal.reason, [
    ...(reasons.get(proposal.reason) ?? []),
    proposal.leaf,
  ])
}

for (const [reason, of] of [...reasons].sort(
  (a, b) => b[1].length - a[1].length,
)) {
  console.log(`    ${String(of.length).padStart(3)}  ${reason}`)

  if (of.length <= 12)
    console.log(`         ${of.map(leaf => leaf.slot).join(' ')}`)
}

// The largest of those reasons is a whole category of the model, not a gap: a leaf whose candidates
// declare `any` and nothing else is a property whose values are **keywords**, so it has no single
// interpolation unit to type and no interpolation to lose. Printed in full because the size is the
// finding.
const enumerations = proposals.filter(proposal =>
  proposal.reason.startsWith('keyword-valued'),
)

console.log(
  `\n  the ${enumerations.length} keyword-valued leaves, in full — no single interpolation unit:`,
)

const byAttribute = new Map()

for (const proposal of enumerations) {
  const attribute = proposal.leaf.writers[0]?.attribute ?? '—'

  byAttribute.set(attribute, [
    ...(byAttribute.get(attribute) ?? []),
    proposal.leaf,
  ])
}

console.log(
  `  ${[...byAttribute]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([attribute, of]) => of.map(leaf => leaf.slot).join(' '))
    .join('\n  ')}`,
)

/* ────────────────────────────────────────────────────────────────────────────
 * §C Registration, asked of the browser. This is the question the census
 *    cannot answer by reading: `initial-value` outside its syntax is an error,
 *    and "does the union register" has no other oracle.
 * ──────────────────────────────────────────────────────────────────────────── */

/** A plain keyword is the one thing a union rung can be spelled from; `0`, `calc(…)`, `'a b'` are not. */
const isKeyword = value =>
  typeof value === 'string' && /^[a-zA-Z][\w-]*$/.test(value)

const browser = await chromium.launch()
const page = await browser.newPage()

const registered = await page.evaluate(
  ({ judged }) =>
    judged.map((proposal, index) => {
      const initial =
        proposal.mechanism === 'argument'
          ? proposal.argument
          : proposal.leaf.default
      const attempt = syntax => {
        const name = `--probe-${index}-${Math.random().toString(36).slice(2, 8)}`

        try {
          CSS.registerProperty({
            inherits: false,
            initialValue: initial,
            name,
            syntax,
          })

          return { name, ok: true }
        } catch (error) {
          return { error: error.message, ok: false }
        }
      }

      return {
        bare: attempt(proposal.syntax),
        initial,
        // A union rung can only be spelled from a bare component: `<number> | <percentage> | 1` is not
        // a syntax, so a proposal that is already a union is judged only as written.
        union:
          /^[a-zA-Z][\w-]*$/.test(initial ?? '') &&
          !proposal.syntax.includes('|')
            ? attempt(`${proposal.syntax} | ${initial}`)
            : null,
      }
    }),
  { judged },
)

const verdicts = judged.map((proposal, index) => ({
  ...proposal,
  ...registered[index],
}))
const bareOk = verdicts.filter(verdict => verdict.bare.ok)
const tested = verdicts.filter(verdict => verdict.union)

console.log(
  `\n${'─'.repeat(96)}\n§C  the identity the model already declares, asked of the browser\n`,
)
console.log(
  `  proposed                                      ${verdicts.length}`,
)
console.log(`  registered as proposed                        ${bareOk.length}`)
console.log(`  refused the identity, so a union was tried    ${tested.length}`)
console.log(
  `    · and the union registered                  ${tested.filter(v => v.union.ok).length}`,
)
console.log(
  `    · and the union was refused too             ${tested.filter(v => !v.union.ok).length}`,
)

console.log(
  `\n  refused — the leaf's own identity is the value being registered:`,
)

for (const verdict of verdicts.filter(verdict => !verdict.bare.ok)) {
  const union = verdict.union
    ? verdict.union.ok
      ? `+ ${verdict.syntax} | ${verdict.initial}  registers`
      : `· ${verdict.syntax} | ${verdict.initial}  refused: ${verdict.union.error}`
    : isKeyword(verdict.initial)
      ? '· no union rung'
      : '· no union rung: the identity is not a bare keyword'

  console.log(
    `    ${verdict.leaf.slot.padEnd(30)} ${String(verdict.initial).padEnd(12)} as ${verdict.syntax.padEnd(18)} ✗ ${verdict.bare.error}\n        ${union}`,
  )
}

/* ────────────────────────────────────────────────────────────────────────────
 * §D Does the rung that registered actually interpolate? A union that steps
 *    between its own components is a registration, not a fix.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Sampled deterministically: every probe is `paused` with `animation-fill-mode: both` and read at an
 * exact time by setting a negative `animation-delay`, so the number is a sample and not wherever the
 * sampler happened to arrive.
 */
/**
 * Each probe is one `@property`, one animation of it, and the real property that reads it — because
 * "the slot interpolated" is only half the question, and the half that matters is whether the property
 * the browser computes from it moved smoothly too.
 *
 * `identity` is what the at-rule declares and the animation starts from when the two differ, so a
 * probe can separate the two things a union might do: interpolate between two spellings of the **same**
 * component (what a union registration is for), and step between a component and a keyword (what it
 * does instead, and what it is correct for it to do).
 */
const PROBES = [
  {
    consumer: 'flex-grow',
    identity: '1',
    label: 'slot <number>, identity 1',
    syntax: '<number>',
    to: '3',
  },
  {
    consumer: 'rotate',
    identity: '0deg',
    label: 'slot <angle>, identity 0deg',
    syntax: '<angle>',
    to: '90deg',
  },
  {
    consumer: 'width',
    identity: '0px',
    label: 'slot <length-percentage>, identity 0px',
    syntax: '<length-percentage>',
    to: '100px',
  },
  {
    consumer: 'z-index',
    identity: '0',
    label: 'slot <integer>, identity 0',
    syntax: '<integer>',
    to: '4',
  },
  {
    consumer: 'color',
    identity: 'red',
    label: 'slot <color>, identity red',
    syntax: '<color>',
    to: 'blue',
  },
  {
    consumer: 'flex-grow',
    identity: '0',
    label: '§C raised: <number-percentage> is not a syntax',
    syntax: '<number-percentage>',
    to: '2',
  },
  {
    consumer: 'opacity',
    from: '1',
    identity: '1',
    label: '· so, <number> | <percentage> — 1 → 0, same component',
    syntax: '<number> | <percentage>',
    to: '0',
  },
  {
    consumer: 'width',
    from: '0px',
    identity: 'auto',
    label: 'union <length-percentage> | auto — 0px → 100px, same component',
    syntax: '<length-percentage> | auto',
    to: '100px',
  },
  {
    consumer: 'width',
    from: '0px',
    identity: 'auto',
    label:
      'union <length-percentage> | auto — 0px → auto, component to keyword',
    syntax: '<length-percentage> | auto',
    to: 'auto',
  },
  {
    consumer: 'width',
    from: '0px',
    identity: 'medium',
    label:
      'union <length> | thin | medium | thick — 0px → 20px, same component',
    syntax: '<length> | thin | medium | thick',
    to: '20px',
  },
  {
    consumer: 'filter',
    identity: '0px',
    label: 'reshape filter: blur(var()), argument <length>',
    reshape: 'blur',
    syntax: '<length>',
    to: '8px',
  },
  {
    consumer: 'filter',
    from: '1',
    identity: '1',
    label: 'reshape filter: grayscale(var()), argument <number> | <percentage>',
    reshape: 'grayscale',
    syntax: '<number> | <percentage>',
    to: '0',
  },
]

const sheet = PROBES.map((probe, index) => {
  const declaration = probe.reshape
    ? `filter: ${probe.reshape}(var(--d${index}))`
    : `${probe.consumer}: var(--d${index})`

  return `@property --d${index} { syntax: "${probe.syntax}"; inherits: false; initial-value: ${probe.identity}; }
.p${index} { --d${index}: ${probe.identity}; ${declaration}; animation: k${index} 1s linear both paused; }
@keyframes k${index} { from { --d${index}: ${probe.from ?? probe.identity}; } to { --d${index}: ${probe.to}; } }`
}).join('\n')

const stage = await browser.newPage()
await stage.setContent(`<style>${sheet}</style>`)

const sampled = await stage.evaluate(
  ({ consumers, count }) => {
    const out = []

    for (let index = 0; index < count; index += 1) {
      const node = document.createElement('div')
      node.className = `p${index}`
      document.body.append(node)

      const read = at => {
        node.style.animationDelay = `${at}ms`
        const style = getComputedStyle(node)

        return {
          at,
          consumer: style.getPropertyValue(consumers[index]).trim(),
          slot: style.getPropertyValue(`--d${index}`).trim(),
        }
      }

      out.push({ at0: read(0), at500: read(-500), at1000: read(-1000) })
    }

    return out
  },
  { consumers: PROBES.map(probe => probe.consumer), count: PROBES.length },
)

await browser.close()

/**
 * Interpolation is judged on the **consumer**, not the slot: a slot whose computed value sits at an
 * endpoint at 50% has stepped, and a slot whose consumer did not move has changed nothing even if the
 * slot itself interpolated. The slot is reported beside it because the two can disagree in a way that
 * matters — a function-shaped slot interpolates its argument while the consumer stays put.
 */
const readOut = ({ at0, at500, at1000 }) => {
  const consumer = value => value.consumer || '(empty)'

  return {
    consumer: consumer(at500),
    ends: `${consumer(at0)} → ${consumer(at1000)}`,
    halfway:
      consumer(at500) !== consumer(at0) && consumer(at500) !== consumer(at1000),
  }
}

console.log(
  `\n${'─'.repeat(96)}\n§D  does the rung interpolate, or does it step\n`,
)
console.log(
  `  probe                                                         consumer 0% → 100%                              at 50%`,
)

for (const [index, probe] of PROBES.entries()) {
  const result = readOut(sampled[index])

  console.log(`  ${probe.label.padEnd(60)} ${result.ends}`)
  console.log(
    `    ${' '.repeat(58)} ${result.consumer.padEnd(28)} ${result.halfway ? 'interpolates' : 'STEPS'}`,
  )
}

/* ────────────────────────────────────────────────────────────────────────────
 * §E The corpus, not the model. A leaf that *can* be typed is not the same as
 *    one that is being animated, and the migration's size is decided by the
 *    second question.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * The slots the frozen sheet writes per-frame. A frame key is `--jumi-<slot>-<hash>-<offset>`: the
 * offset is the phrase's own frame index and the hash is the same one the animation name carries, so
 * the mixed-case hash is what separates a frame key from the sheet's many other names
 * (`--jumi-<attr>-animation-timing-function`, `--jumi-animation-range-start`, …).
 */
const snapshot = fs.readFileSync(
  path.join(root, 'scripts/css-snapshot/snapshot.css'),
  'utf8',
)
const animatedSlots = [
  ...new Set(
    [
      ...snapshot.matchAll(
        /--jumi-([\w-]+?)-([A-Za-z0-9]{5,8})-(\d+)(?![\w-])/g,
      ),
    ]
      // The hash always carries a capital; nothing else in the sheet's names does at that position.
      .filter(match => /[A-Z]/.test(match[2]))
      .map(match => match[1]),
  ),
].sort()

const classification = new Map()

for (const [reason, of] of reasons) {
  for (const leaf of of) classification.set(leaf.slot, reason)
}

for (const proposal of judged) {
  classification.set(
    proposal.leaf.slot,
    proposal.mechanism === 'argument'
      ? `reshape the function — ${proposal.syntax}`
      : `type the slot — ${proposal.syntax}`,
  )
}

console.log(
  `\n${'─'.repeat(96)}\n§E  the slots the frozen corpus animates, against the census\n`,
)

console.log(
  `  slots the sheet writes a frame key for     ${animatedSlots.length}\n`,
)

for (const slot of animatedSlots) {
  console.log(
    `    ${slot.padEnd(34)} ${classification.get(slot) ?? '— not a leaf the graph knows'}`,
  )
}
