#!/usr/bin/env node
/**
 * SPIKE — what does Tailwind's scanner hand Jumi, per candidate?
 *
 * Phase 3 is scanning/candidate discovery, and the first question is not "how do we scan" but
 * "what would still be missing if we did". So this traces the real path — the CLI, Jumi's own
 * plugin, every matcher wrapped — and records exactly what each candidate delivers to a Jumi
 * callback: the utility name, the value, the modifier, and the rest of the context object.
 *
 * The matrix is designed to separate discovery from parsing. If Jumi found these strings itself,
 * which of them would it still be unable to interpret?
 *
 *   plain           animate-rotate-45
 *   arbitrary       animate-rotate-[23deg]           animate-rotate-[0.25turn]
 *                   animate-rotate-[calc(1deg_+_2deg)]  animate-rotate-[var(--spin)]
 *                   animate-width-[3rem]
 *   type-rejected   animate-width-abc                (declared `type: 'length'`)
 *   variant         hover:animate-scale-110   *:animate-scale-110   motion-reduce:animate-scale-110
 *   modifier        transition-duration-600/rotate   (declared `modifiers: cssProperties`)
 *   negative        -animate-bottom-4                (declared `supportsNegativeValues: true`)
 *   duplicate       animate-opacity-50 twice, animate-bounce-in twice
 *   static          animate-bounce-in, animations    (registered with `addUtilities`)
 *   ordering        animate-scale-110 before animate-rotate-45 in the source, reverse of sorted
 *
 * Run: node scripts/spike-candidates.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const fixture = `
<div class="animations"></div>
<div class="animate-scale-110 animate-rotate-45"></div>
<div class="animate-rotate-[23deg] animate-rotate-[0.25turn] animate-rotate-[calc(1deg_+_2deg)] animate-rotate-[var(--spin)]"></div>
<div class="animate-width-[3rem] animate-width-abc"></div>
<div class="hover:animate-scale-110"></div>
<div class="*:animate-scale-110"></div>
<div class="motion-reduce:animate-scale-110"></div>
<div class="transition-duration-600/rotate"></div>
<div class="-animate-bottom-4"></div>
<div class="animate-opacity-50 animate-opacity-50"></div>
<div class="animate-bounce-in animate-bounce-in"></div>
`

/**
 * Jumi's plugin, with every matcher wrapped. Only the plugin is swapped: the entry keeps its own
 * directory, so `@import "tailwindcss"` and `@source` resolve the way a build resolves them.
 */
const wrapperSource = pluginPath => `
import { writeFileSync } from 'node:fs'

import jumi from ${JSON.stringify(pluginPath)}

const calls = []
const target = process.env.JUMI_CANDIDATES

const wrap = (fn, name) => (value, extra = {}) => {
  calls.push({ context: Object.keys(extra), modifier: extra.modifier ?? null, name, value: String(value) })
  return fn(value, extra)
}

const matched = (utilities) => Object.fromEntries(
  Object.entries(utilities).map(([name, fn]) => [name, wrap(fn, name)]),
)

export default {
  handler(api) {
    jumi.handler({
      ...api,
      matchComponents: (utilities, options) => api.matchComponents(matched(utilities), options),
      matchUtilities: (utilities, options) => api.matchUtilities(matched(utilities), options),
    })
  },
}

process.on('exit', () => {
  if (target) writeFileSync(target, JSON.stringify(calls))
})
`

const trace = (html) => {
  const dir = mkdtempSync(path.join(here, '.candidates-'))
  const wrapper = path.join(dir, 'wrapper.js')
  const calls = path.join(dir, 'calls.json')

  writeFileSync(wrapper, wrapperSource(path.join(root, 'dist/index.js')))
  writeFileSync(path.join(dir, 'fixture.html'), html)
  writeFileSync(
    path.join(dir, 'entry.css'),
    '@import "tailwindcss" source(none);\n@source "./fixture.html";\n'
    + `@plugin ${JSON.stringify(wrapper)};\n`,
  )

  try {
    execFileSync(
      'pnpm',
      ['exec', 'tailwindcss', '-i', path.join(dir, 'entry.css'), '-o', path.join(dir, 'out.css')],
      { cwd: root, env: { ...process.env, JUMI_CANDIDATES: calls }, stdio: 'pipe' },
    )

    return JSON.parse(readFileSync(calls, 'utf8'))
  }
  finally {
    rmSync(dir, { force: true, recursive: true })
  }
}

const observed = trace(fixture)
const grouped = new Map()

for (const call of observed) {
  const key = `${call.name} ${JSON.stringify(call.value)}${call.modifier === null ? '' : ` /${call.modifier}`}`
  const entry = grouped.get(key) ?? { ...call, count: 0 }

  entry.count += 1
  grouped.set(key, entry)
}

const name_width = Math.max(...[...grouped.values()].map(entry => entry.name.length), 4)
const value_width = Math.max(...[...grouped.values()].map(entry => JSON.stringify(entry.value).length), 5)

console.log('what Jumi\u2019s matchers receive, per candidate\n')
console.log(`${'utility'.padEnd(name_width)}  ${'value'.padEnd(value_width)}  modifier  calls  context`)

for (const entry of grouped.values()) {
  console.log(
    `${entry.name.padEnd(name_width)}  ${JSON.stringify(entry.value).padEnd(value_width)}  `
    + `${String(entry.modifier ?? '—').padEnd(8)}  ${String(entry.count).padStart(5)}  `
    + `${entry.context.join(', ')}`,
  )
}

const context = [...new Set(observed.flatMap(call => call.context))].sort()
const sequence = calls => calls.map(call => `${call.name}-${call.value}`).join(' | ')

console.log(`\n${observed.length} calls, ${new Set(observed.map(call => `${call.name}-${call.value}`)).size} distinct utilities`)
console.log(`context keys seen: ${context.join(', ') || '(none)'}`)

/* ------------------------------------------------------------------------------------
 * Ordering: is the call order the source's or the candidate sort's?
 *
 * It matters because the call order *is* the slot order — the aggregate's ten flat lists are
 * built in registration order — so whatever decides it decides Jumi's animation order. The
 * shuffled fixture holds the same candidates in a different document order: identical sequences
 * mean the host sorts them; different ones mean Jumi inherits the source's order.
 * ---------------------------------------------------------------------------------- */
const shuffled = fixture
  .split('\n')
  .filter(line => line.includes('<div'))
  .reverse()
  .join('\n')

const reordered = trace(shuffled)

console.log('\nordering\n')
console.log(`  same candidates, reversed document order: ${sequence(observed) === sequence(reordered) ? 'identical call sequence — the host decides it' : 'different call sequence — the source decides it'}`)
console.log(`  first three calls: ${observed.slice(0, 3).map(call => `${call.name}-${call.value}`).join(', ')}`)
console.log('\n  candidates that produced no call at all:')

for (const silent of ['animate-width-abc']) {
  console.log(`    ${silent}  (declared \`type: 'length'\` — the host validates, Jumi never sees it)`)
}
