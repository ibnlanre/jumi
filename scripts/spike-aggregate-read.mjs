#!/usr/bin/env node
/**
 * SPIKE — when is the aggregate first read, and what reads it?
 *
 * Publication costs O(1) per registration *after* the first read of `.animations`,
 * so the whole quadratic cost is decided by one question: does that read happen
 * before or after the model reaches its final ordered state? The docs effects page
 * published **once for 228 slots**, so the favourable timing is reachable — this
 * traces what produces it rather than guessing.
 *
 * The host path is the real one: the Tailwind CLI, with its own scanner, so the
 * candidate order is the order production sees. Only the plugin is swapped for a
 * wrapped copy of Jumi's — every utility callback is logged as it runs (name, value,
 * modifier), and every `addBase` carrying the aggregate is logged as a publication.
 * The callback in scope when a publication happens *is* the candidate that triggered
 * the read: `animations` returns the utility, and evaluating it is what publishes.
 *
 * Result (2026-09-11), and it answers the question the workstream turned on:
 *
 *   entry                  registrations  publications  slots at first read
 *   canonical fixture                 57            33       0 of 57
 *   carrier variant                   24            19       0 of 24
 *   examples                         139            65       2 of 139
 *   docs effects catalogue           231             1     228 of 231
 *
 * The cost is one publication per registration *after* the read, so what matters is
 * the read position. Three separate things move it earlier, each isolated here:
 *
 * 1. **`@apply` of the carrier.** It is compiled while the CSS is parsed, before any
 *    scanned candidate, which is the largest effect measured: removing the one
 *    `@apply animations` rule from the canonical corpus took registrations-after-read
 *    from **56 to 11** and publications from **32 to 7**.
 * 2. **A prefixed carrier.** `*:animations` sorts before `animate-…` (`*` < `a`), so
 *    the read happens on the first candidate — the variant corpus reads at 0 slots.
 * 3. **Variant-prefixed utilities.** Anything sorting after `animations` that
 *    registers a slot republishes. A pair of corpora differing only by two variant
 *    classes: `registrations after read: 0` → `2`.
 *
 * The effects catalogue has none of the three: 228 plain `animate-*` classes, no
 * variants, no `@apply`, and a carrier that sorts last (`animate-…` < `animations`).
 * That is why it publishes once — a byproduct of the corpus, not of anything Jumi
 * controls.
 *
 * Consequence: publish-once is **not** reachable by ordering. `hover:animate-*`,
 * `motion-safe:animations` and `@apply animaions`-style composition are ordinary
 * usage, and each one forces republication under the current representation. The
 * representation is what has to change.
 *
 * Run: node scripts/spike-aggregate-read.mjs [entry.css]
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const entries = process.argv[2]
  ? [process.argv[2]]
  : [
      'scripts/css-snapshot/input.css',
      'scripts/css-snapshot/variant.css',
      'examples/input.css',
      'docs/src/styles/catalog.css',
    ]

/** Jumi's own plugin, with a timeline attached and a file to write it to. */
const wrapperSource = pluginPath => `
import { writeFileSync } from 'node:fs'

import jumi from ${JSON.stringify(pluginPath)}

const timeline = []
const target = process.env.JUMI_TIMELINE
let current = null

const log = (event) => timeline.push({ ...(current && { candidate: current }), event })

const wrap = (fn, name) => (value, extra = {}) => {
  const previous = current
  current = { modifier: extra?.modifier ?? null, name, value: String(value) }
  log('call')
  try {
    return fn(value, extra)
  }
  finally {
    current = previous
  }
}

const matched = (utilities) => Object.fromEntries(
  Object.entries(utilities).map(([name, fn]) => [name, wrap(fn, name)]),
)

export default {
  handler(api) {
    const wrapped = {
      ...api,
      addBase: (payload) => {
        if (':root' in payload) log('publication')
        return api.addBase(payload)
      },
      addUtilities: (rules) => {
        if (Object.keys(rules).some(key => key.startsWith('@keyframes'))) log('keyframes')
        return api.addUtilities(rules)
      },
      matchComponents: (utilities, options) => api.matchComponents(matched(utilities), options),
      matchUtilities: (utilities, options) => api.matchUtilities(matched(utilities), options),
    }

    jumi.handler(wrapped)
  },
}

process.on('exit', () => {
  if (target) writeFileSync(target, JSON.stringify(timeline))
})
`

/** Trace one entry and return its timeline. */
const trace = (entry) => {
  const dir = mkdtempSync(path.join(here, '.aggregate-read-'))
  const wrapper = path.join(dir, 'wrapper.js')
  const timeline = path.join(dir, 'timeline.json')

  writeFileSync(wrapper, wrapperSource(path.join(root, 'dist/index.js')))

  // The entry keeps its own directory, so its `@source` and `@import` paths still
  // resolve; only the plugin is swapped for the wrapped one.
  const entryPath = path.join(root, entry)
  const temporary = path.join(path.dirname(entryPath), '.aggregate-read.css')

  writeFileSync(
    temporary,
    readFileSync(entryPath, 'utf8').replace(/@plugin\s+["'][^"']+["'];/, `@plugin ${JSON.stringify(wrapper)};`),
  )

  try {
    execFileSync('pnpm', ['exec', 'tailwindcss', '-i', temporary, '-o', path.join(dir, 'out.css')], {
      cwd: root,
      env: { ...process.env, JUMI_TIMELINE: timeline },
      stdio: 'pipe',
    })

    return JSON.parse(readFileSync(timeline, 'utf8'))
  }
  finally {
    rmSync(temporary, { force: true })
    rmSync(dir, { force: true, recursive: true })
  }
}

console.log('entry                              registrations  publications  slots at first read')

const traces = new Map()

for (const entry of entries) {
  const timeline = trace(entry)
  const first = timeline.findIndex(event => event.event === 'publication')
  const before = first === -1 ? [] : timeline.slice(0, first)
  const registrations = timeline.filter(event => event.event === 'call').length
  const publicationCount = timeline.filter(event => event.event === 'publication').length
  const slots = before.filter(event => event.event === 'keyframes').length

  traces.set(entry, { first, timeline })

  console.log(
    `${entry.padEnd(34)} ${String(registrations).padStart(13)}  ${String(publicationCount).padStart(12)}  `
    + `${String(slots).padStart(6)} of ${registrations}`,
  )
}

const [only] = entries
const detail = traces.get(only)

if (entries.length === 1 && detail) {
  const trigger = detail.timeline[detail.first]?.candidate
  const from = Math.max(0, detail.first - 4)
  const context = detail.timeline.slice(from, detail.first + 2)

  console.log(`\n${only}`)
  console.log(`first read triggered by: ${trigger ? `${trigger.name} — ${JSON.stringify(trigger.value)}${trigger.modifier ? ` (modifier ${trigger.modifier})` : ''}` : '(never)'}`)
  console.log('\nsequence around the read:')

  for (const [index, event] of context.entries()) {
    const at = from + index
    const what = event.candidate ? `${event.candidate.name} ${JSON.stringify(event.candidate.value)}` : ''

    console.log(`  ${at === detail.first ? '→' : ' '} ${String(at).padStart(4)} ${event.event.padEnd(10)} ${what}`)
  }

  const after = detail.timeline.slice(detail.first + 1)

  console.log(`\nregistrations after the read: ${after.filter(event => event.event === 'call').length}`)
  console.log(`publications after the read:  ${after.filter(event => event.event === 'publication').length}`)
}
