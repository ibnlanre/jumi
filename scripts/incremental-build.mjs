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

import { aggregateSlots } from './lib/css.mjs'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const base = 'animate-rotate-[0:0deg,20:-8deg,100:-8deg]'
const cacheTween = 'animate-rotate-[0:30deg,50:-30deg,100:30deg]/[return]'
const orderTween = 'animate-rotate-[0:60deg,70:-60deg,100:60deg]/[bounce]'

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

// The scanner sorts candidates, so every tween precedes `animations`.
const first = build(instance, [base, 'animations'])

// A tween is added and the scan is fresh again: still sorted.
const cache = build(instance, [base, cacheTween, 'animations'])

// A tween is added to a long-lived session: the dev server's candidate Set only
// ever grows, so the new class lands after `animations`.
const order = build(instance, [base, cacheTween, 'animations', orderTween])

/**
 * The aggregate the browser applies, read out of the finalized stylesheet: with the lists flat
 * and completed, it is one declaration per longhand per carrier.
 */
const slots = built => aggregateSlots(built.css)

const keyframes = out => new Set([...out.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]))

/**
 * Every rule in the output, minus the aggregate. Comparing this is the point of the constant
 * carrier: the rules Tailwind caches are identical between builds, and only the data they read
 * changes. Staging is gone by now, so the only declarations removed here are the ones the
 * finalizer wrote — which is exactly the set allowed to differ.
 */
const utilities = (out) => {
  const map = new Map()
  let animations = 0

  for (const m of out.matchAll(/(\.[^{}\s][^{}]*)\{([^{}]*)\}/g)) {
    const body = m[2]
      .replace(/--jumi-aggregate-[\w-]*:\s*[^;]+;/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    const selector = m[1].trim()

    // `.animations` appears twice — base carries the data, utilities consumes it —
    // so the two rules are compared by position rather than by selector.
    map.set(selector === '.animations' ? `.animations#${(animations += 1)}` : selector, body)
  }

  return map
}

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

const before = utilities(first.css)
const after = utilities(order.css)
const changed = [...before].filter(([selector, body]) => after.has(selector) && after.get(selector) !== body)
const missing = [...before.keys()].filter(selector => !after.has(selector))
checks.push({
  detail: `kept ${before.size - changed.length - missing.length}/${before.size}`
    + (changed.length ? `, changed: ${changed.map(([selector]) => selector).join(', ')}` : '')
    + (missing.length ? `, missing: ${missing.join(', ')}` : ''),
  pass: changed.length === 0 && missing.length === 0,
  what: 'every rule but the aggregate is unchanged',
})

// The finalizer's contract, per build. A build where it did not run would ship a staging rule
// that nothing reads, and a carrier whose list was never written would resolve nothing —
// including the carrier Tailwind cached and never revisited, which is why the data has to be
// read out of the stylesheet rather than emitted at the utility.
const finalization = [first, cache, order].map(built => ({
  ...built,
  stray: (built.css.match(/--jumi-carrier-staging/g) ?? []).length,
  writes: (built.css.match(/--jumi-aggregate-[\w-]+:/g) ?? []).length,
}))

checks.push({
  detail: finalization
    .map(built => `${built.carriers} carriers × ${built.writes / built.carriers} declarations`
      + (built.stray ? `, ${built.stray} staging left` : ''))
    .join('; '),
  pass: finalization.every(built => built.stray === 0 && built.carriers > 0 && built.writes === built.carriers * 10),
  what: 'the aggregate reaches every carrier, and no staging survives',
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
