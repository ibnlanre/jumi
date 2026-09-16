#!/usr/bin/env node
import { readFileSync } from 'node:fs'

/**
 * Audit: does every custom property Jumi has **emitted a read for** have something that writes it —
 * and does every frame-scoped value a phrase **wrote** get read back?
 *
 * This is the general form of the assertion that was written for `separateParts` chains, applied to the
 * whole stylesheet rather than to one family of links. A chain that reads a variable no rule declares
 * resolves through a fallback and says nothing — so the class is invisible to every live check, and it
 * has now appeared three times: the un-prefixed instance links, the per-instance slot fills, and the
 * per-frame dependency hooks.
 *
 * The second question is the **converse**, and it is here because the first one was not enough. A check
 * for reads without writers is satisfied by deleting reads — which is exactly what `bb39449` did to the
 * per-frame component lookups, turning `animate-scale-x-[0:1|100:0]` into a motion whose every frame
 * resolved to the same components while this audit, the differential and 17 gate stages stayed green.
 * Both directions are stated in `./lib/dead-links.mjs`; this script reports them and `--strict` fails
 * on either.
 *
 * Run: `node scripts/dead-links.mjs [stylesheet]`, or `--strict` to exit non-zero on any dead read or
 * any unconsumed frame write — which is what a gate should do once the enumerated shapes are removed.
 */
import {
  classify,
  collect,
  deadReads,
  unconsumedWrites,
} from './lib/dead-links.mjs'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const file =
  args.find(argument => !argument.startsWith('--')) ??
  'scripts/css-snapshot/snapshot.css'

const css = readFileSync(file, 'utf8')
const { hooked, reads, registered, written } = collect(css)
const dead = deadReads(css)
const unconsumed = unconsumedWrites(css)

const share = entries => entries.reduce((total, { count }) => total + count, 0)

const classified = [...reads].map(([name, count]) => [
  name,
  count,
  classify(name, { hooked, registered, written }),
])
const levels = prefix =>
  classified.filter(([, , verdict]) => verdict.startsWith(prefix))

console.log(`\n${file}`)
console.log(
  `  ${reads.size} distinct reads, ${share([...reads].map(([name, count]) => ({ count, name })))} occurrences`,
)
console.log(
  `  ${levels('optional').length} optional levels (${share(levels('optional').map(([, count]) => ({ count })))} reads) — declared here, written by a named class`,
)
// Named apart from `optional` because the reason differs. An optional level is written by a class that
// would have to be present to matter; a conditional one is a per-frame component lookup whose writer is
// a *constituent* phrase, and its whole purpose is to fall through when no such phrase is on the page.
console.log(
  `  ${levels('conditional').length} conditional levels (${share(levels('conditional').map(([, count]) => ({ count })))} reads) — per-frame component lookups, satisfied only by a phrase addressing that component over the same frames`,
)

if (!dead.length) console.log('  no dead reads')
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
}

// The converse, printed after the forward direction so a failure reads in the order the invariant is
// stated: a read with no writer *class* is one bug, a writer with no consumer is the other.
if (!unconsumed.length)
  console.log(
    '  no unconsumed frame writes: every frame-scoped value is read back\n',
  )
else {
  console.log(
    `  ${unconsumed.length} frame-scoped writes nothing reads:\n    UNCONSUMED`,
  )

  for (const shape of [...new Set(unconsumed.map(entry => entry.shape))])
    console.log(
      `        --jumi-${shape}  ${unconsumed.filter(entry => entry.shape === shape).length}`,
    )

  console.log(
    '      A phrase wrote a frame value and no keyframe reads it, so the motion computes but never moves.\n',
  )
}

if (strict && (dead.length || unconsumed.length)) process.exit(1)
