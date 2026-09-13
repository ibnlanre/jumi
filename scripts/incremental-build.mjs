#!/usr/bin/env node
/**
 * Incremental-build regression harness.
 *
 * Tailwind caches one AST per candidate and calls `build(candidates)` again on every update —
 * which is the Vite dev server's path. So this drives one compiler through three builds and
 * asserts what an editing session depends on:
 *
 *   1. a newly registered tween emits its keyframe            (Step 2's fix)
 *   2. …and registers its names                               (addBase is unconditional)
 *   3. the aggregate slot list grows when a tween is added,
 *      with the new tween in fresh-scan order                 (cache case)
 *   4. …and with the new tween appended after `animations`,
 *      which is what the dev server's candidate set does      (order case)
 *   5. every rule but the aggregate is unchanged              (the carrier is constant)
 *   6. the aggregate reaches the carriers in *every* build,
 *      and no staging survives                               (the finalizer's contract)
 *   7. a motion added after `transitions` compiled still
 *      reaches that carrier                                   (a second carrier, same problem)
 *
 * Assertions 3–6 are the acceptance contract. The carrier utility is a constant consumer —
 * Tailwind caches it and never revisits it — while the list it applies is data that a later
 * publication replaces. The finalizer is what makes that data arrive: it reads the last
 * publication out of the emitted stylesheet and writes it into every marked carrier, so a slot
 * registered after `animations` was compiled still reaches the element. Run with
 * `pnpm incremental:check`.
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { aggregateSlots, PARTS, protocolState, TRANSITION_PARTS } from './lib/css.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const base = 'animate-rotate-[0:0deg,20:-8deg,100:-8deg]'
const cacheTween = 'animate-rotate-[0:30deg,50:-30deg,100:30deg]/[return]'
const orderTween = 'animate-rotate-[0:60deg,70:-60deg,100:60deg]/[bounce]'

// The transitions composition has the same obligation as the animation one — it applies a list that
// depends on which utilities exist — so it is driven through the same three builds and held to the
// same freshness requirement.
const motion = 'transition-property/background-color'
const lateMotion = 'transition-property/scale'

const css = [
  '@import "tailwindcss" source(none);',
  `@plugin "${path.join(root, 'dist/index.js')}";`,
  '',
].join('\n')

console.log('· bundling')
execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

// After bundling: the helper loads the finalizer out of `dist/`.
const { build, compiler } = await import('./lib/compile.mjs')

const instance = await compiler(css, root)

// The scanner sorts candidates, so every tween and every transition utility precedes both
// compositions — which no longer matters for publication, because the composition is built once
// after every activation is known. It still matters here: these builds are what prove that.
const first = build(instance, [base, motion])

// A tween is added and the scan is fresh again: still sorted.
const cache = build(instance, [base, cacheTween, motion])

// A tween and a motion are added to a long-lived session: the dev server's candidate Set only ever
// grows, so both new classes land after everything the first build emitted.
const order = build(instance, [base, cacheTween, motion, orderTween, lateMotion])

/**
 * The aggregate the browser applies, read out of the finalized stylesheet: with the lists flat
 * and completed, it is one declaration per longhand per carrier.
 */
const slots = built => aggregateSlots(built.css)

const keyframes = out => new Set([...out.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]))

/**
 * Every rule in the output, as a selector and a body.
 */
const rules = out => [...out.matchAll(/(\.[^{}\s][^{}]*)\{([^{}]*)\}/g)]
  .map(match => ({ body: match[2].replace(/\s+/g, ' ').trim(), selector: match[1].trim() }))

/** Whether a body declares a property, as a declaration rather than as the tail of a longer name. */
const has = (body, property) => new RegExp(`(?<![\\w-])${property}\\s*:`).test(body)

/** Every declaration name a body holds. */
const names = body => [...body.matchAll(/(?<![-\w])(--[\w-]+|[\w-]+)\s*:/g)].map(match => match[1])

/**
 * What only this pass writes, identified by declaration set rather than by selector.
 *
 * A selector is the wrong key here, and so is "the first rule with X": the composition's selectors
 * are precisely what grows between builds, so a check keyed on them would report the growth it
 * exists to measure. The fingerprints are the whole expected set — every longhand, plus the
 * property the animation composition also declares — which is strong enough that a user's own
 * `animation-name` cannot be mistaken for this rule.
 */
const fingerprint = (body) => {
  if ([...PARTS, 'interpolate-size'].every(property => has(body, property))) return 'animations:composition'
  if (['transition', 'transition-behavior'].every(property => has(body, property))) return 'transitions:composition'

  // The defaults are all custom properties, and which kind they are for is which substrate they
  // carry — the animations one resolves the longhand chains, the transitions one the shorthand.
  if (names(body).every(name => name.startsWith('--jumi-'))) {
    if (has(body, '--jumi-animation-duration')) return 'animations:defaults'
    if (has(body, '--jumi-transition-duration')) return 'transitions:defaults'
  }

  return null
}

/**
 * The output in two layers, because from here on they answer different questions.
 *
 *   owned     what Tailwind's cache produced. Identical between builds, or the cache moved.
 *   derived   what this pass derived. Expected to grow — that is the whole point — so it is
 *             compared for shape: the activator set, the aggregate, and the rule count.
 */
const partition = (out) => {
  const derived = new Map()
  const owned = new Map()

  for (const rule of rules(out)) {
    const job = fingerprint(rule.body)

    if (job) derived.set(job, rule)
    else owned.set(rule.selector, rule.body)
  }

  return { derived, owned }
}

/** The selectors a derived rule was written for, in document order. */
const selectors = rule => (rule ? rule.selector.split(/,\s*\n/) : [])

const checks = []

const fresh = [...keyframes(cache.raw)].filter(name => !keyframes(first.raw).has(name))
checks.push({
  detail: fresh.length ? `+ ${fresh.join(', ')}` : 'no new @keyframes',
  pass: fresh.length > 0,
  what: 'the added tween emits its keyframe',
})

const properties = out => new Set([...out.matchAll(/@property\s+(--jumi-[\w-]+)/g)].map(m => m[1]))
const freshProperties = [...properties(cache.raw)].filter(name => !properties(first.raw).has(name))
checks.push({
  detail: `+ ${freshProperties.length} @property blocks`,
  pass: freshProperties.length > 0,
  what: 'the added tween registers its names',
})

checks.push({
  detail: `slots ${slots(first)} → ${slots(cache)}`,
  pass: slots(cache) === slots(first) + 1,
  what: 'the slot list grows (fresh-scan order)',
})

checks.push({
  detail: `slots ${slots(cache)} → ${slots(order)}`,
  pass: slots(order) === slots(cache) + 1,
  what: 'the slot list grows (candidate set only grows)',
})

const outputs = { cache: partition(cache.css), first: partition(first.css), order: partition(order.css) }

/**
 * The motions the transitions composition applies, read off its `transition` shorthand.
 *
 * The shorthand names a motion as `var(--jumi-<motion>-transition-property, …)`, so the motion is
 * the word between `--jumi-` and `-transition`.
 */
const transitionMotions = (derived) => {
  const rule = derived.get('transitions:composition')
  if (!rule) return []

  const value = (rule.body.match(/(?<![\w-])transition:\s*([^;]+);/) ?? [, ''])[1]

  return [...new Set([...value.matchAll(/--jumi-([\w-]+)-transition/g)].map(match => match[1]))]
}

checks.push({
  detail: `motions ${transitionMotions(outputs.first.derived).join(' + ') || 'none'}`
    + ` → ${transitionMotions(outputs.order.derived).join(' + ') || 'none'}`,
  pass: [motion, lateMotion].every(candidate =>
    transitionMotions(outputs.order.derived).includes(candidate.replace('transition-property/', ''))),
  what: 'a motion added after the first build still reaches the composition',
})

// Tailwind's half: every rule it cached has to be identical, or the cache moved. The derived rules
// are not in this set — they are the ones that are supposed to differ, and comparing them here
// would report the growth this harness exists to measure.
const before = outputs.first.owned
const after = outputs.order.owned
const changed = [...before].filter(([selector, body]) => after.has(selector) && after.get(selector) !== body)
const missing = [...before.keys()].filter(selector => !after.has(selector))

checks.push({
  detail: `kept ${before.size - changed.length - missing.length}/${before.size}`
    + (changed.length ? `, changed: ${changed.map(([selector]) => selector).join(', ')}` : '')
    + (missing.length ? `, missing: ${missing.join(', ')}` : ''),
  pass: changed.length === 0 && missing.length === 0,
  what: 'Tailwind-owned rules are unchanged, so the cache did not move',
})

// Jumi's half, the positive statement of the same thing: the derived rules are exactly the expected
// set — one defaults rule and one composition per active kind — and a change in that number is a
// change to the architecture rather than a change to the page.
const expected = ['animations:composition', 'animations:defaults', 'transitions:composition', 'transitions:defaults']

checks.push({
  detail: Object.entries(outputs).map(([label, { derived }]) =>
    `${label}: ${[...derived.keys()].sort().join(', ') || 'none'}`).join(' | '),
  pass: Object.values(outputs).every(({ derived }) =>
    [...derived.keys()].sort().join(', ') === expected.join(', ')),
  what: 'exactly one defaults rule and one composition per active kind, in every build',
})

// And the growth itself, stated as the two things that are allowed to move: the selectors the
// composition was written for, and the aggregate it holds.
checks.push({
  detail: `activators ${selectors(outputs.first.derived.get('animations:composition')).length}`
    + ` → ${selectors(outputs.order.derived.get('animations:composition')).length}`
    + `, slots ${slots(first)} → ${slots(order)}`,
  pass: selectors(outputs.order.derived.get('animations:composition')).length
    > selectors(outputs.first.derived.get('animations:composition')).length,
  what: 'the composition follows the activating selectors, and they grew',
})

// The finalizer's contract, per build. A build where it did not run would ship the whole transport
// — the payload it reads, still in the file. There is no marker left to look for, so "did every
// kind get its composition?" is answered by counting what was written, which is what
// `protocolState` does, and the zero-occurrence check is what catches a pass that never ran.
const finalization = [first, cache, order].map(built => protocolState(built.css))

checks.push({
  detail: finalization
    .map(state => `${state.animations} + ${state.transitions} compositions, ${state.declarations} declarations`
      + (state.leaks.staging ? `, ${state.leaks.staging} payloads left` : ''))
    .join('; '),
  pass: finalization.every(state => Object.values(state.leaks).every(count => count === 0)
    && state.animations > 0
    && state.declarations === state.animations * PARTS.length + state.transitions * TRANSITION_PARTS.length),
  what: 'each composition holds its own parts, and no build-time name survives',
})

for (const { detail, pass, what } of checks) {
  console.log(`${pass ? '✓' : '✗'} ${what}`)
  console.log(`    ${detail}`)
}

const failed = checks.filter(check => !check.pass).length

if (failed) {
  console.log(`\n✗ ${failed} of ${checks.length} assertions failed`)
  console.log('  a slot registered after `animations` was compiled has to reach the list, and')
  console.log('  the rules Tailwind caches have to stay constant while it does.')
}

process.exit(failed ? 1 : 0)
