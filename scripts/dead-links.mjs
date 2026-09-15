#!/usr/bin/env node
/**
 * Audit: does every custom property Jumi has **emitted a read for** have something that writes it?
 *
 * This is the general form of the assertion that was written for `separateParts` chains, applied to the
 * whole stylesheet rather than to one family of links. A chain that reads a variable no rule declares
 * resolves through a fallback and says nothing — so the class is invisible to every live check, and it
 * has now appeared three times: the un-prefixed instance links, the per-instance slot fills, and the
 * per-frame dependency hooks.
 *
 * A read is classified, in order:
 *
 *   written     something declares it (`--x: …`), so the read is answered in this stylesheet
 *   registered  an `@property` names it. Registration is not a value, but it is *intent* — the model
 *               declares the shape it is prepared to fill, and the labels in particular are registered
 *               long before any control names a motion
 *   optional    a level that is **documented as absent until written**, listed below with its writer
 *   DEAD        none of the above: a name nothing in the model can produce
 *
 * `optional` is the honest half of the CTO's phrasing — "a known writer class or an explicitly
 * documented terminal fallback". Each entry names the code that writes it, so drift is visible: if a
 * writer disappears, the level it justified has to argue for itself again.
 *
 * Run: `node scripts/dead-links.mjs [stylesheet]`, or `--strict` to exit non-zero on any dead read —
 * which is what a gate should do once the enumerated shapes are removed.
 */
import { readFileSync } from 'node:fs'

import { classify, collect, deadReads } from './lib/dead-links.mjs'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const file =
  args.find(argument => !argument.startsWith('--')) ??
  'scripts/css-snapshot/snapshot.css'

const css = readFileSync(file, 'utf8')
const { reads, registered, written } = collect(css)
const dead = deadReads(css)

const share = entries => entries.reduce((total, { count }) => total + count, 0)

const optional = [...reads].filter(([name]) =>
  classify(name, { registered, written }).startsWith('optional'),
)

console.log(`\n${file}`)
console.log(
  `  ${reads.size} distinct reads, ${share([...reads].map(([name, count]) => ({ count, name })))} occurrences`,
)
console.log(
  `  ${optional.length} optional levels (${share(optional.map(([name, count]) => ({ count })))} reads) — declared here, written by a named class`,
)

if (!dead.length) console.log('  no dead reads\n')
else {
  // Grouped by **class** before shape, because a gate failure six months from now has to say which kind of
  // link appeared rather than print a hundred variable names. A dead read inside `@keyframes` is a per-frame
  // hook; one anywhere else is a shape nobody has seen, and it is reported apart from these so it cannot be
  // read as more of the same.
  const classes = [
    ['keyframe dependency hooks', dead.filter(entry => entry.keyframes)],
    [
      'outside keyframes — a new class, read it directly',
      dead.filter(entry => !entry.keyframes),
    ],
  ]

  console.log(
    `  ${dead.length} DEAD reads (${share(dead)} occurrences):\n    DEAD`,
  )

  for (const [label, entries] of classes) {
    if (!entries.length) continue

    console.log(`      ${label}  ${share(entries)}`)

    for (const shape of [...new Set(entries.map(entry => entry.shape))])
      console.log(
        `        --jumi-${shape}  ${share(entries.filter(entry => entry.shape === shape))}`,
      )
  }

  console.log()
}

if (strict && dead.length) process.exit(1)
