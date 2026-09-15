#!/usr/bin/env node
/**
 * Does the Storybook still name only effects that exist?
 *
 * The stories are generated, so this is not here to catch a typo in a demo — it is here because the
 * catalog drifted before, silently, for as long as nobody looked. Of the 265 effect classes the
 * hand-written stories referenced, 187 named effects Jumi has never shipped. Nothing failed: the
 * Storybook is not built by `pnpm check`, and Tailwind ignores a class it cannot resolve, so a demo
 * that animates nothing is indistinguishable from one whose effect is subtle.
 *
 * Three claims, all cheap and all previously false:
 *
 *   the generated catalog matches the registry   — regeneration was forgotten
 *   every reference under `stories/` resolves    — a hand-written story drifted, or will
 *   no duration or delay is fractional           — these read `theme('transitionDuration'/
 *                                                  'transitionDelay')`; `animation-duration-0.3`
 *                                                  compiles to nothing at all
 *
 * Run: pnpm stories:check
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

const failures = []

// The registry, read exactly as `prepare-stories.mjs` reads it, so the two cannot disagree about
// what the source of truth is.
const registry = readFileSync(
  path.join(root, 'src/keyframes/effects.ts'),
  'utf8',
)
const known = new Set(
  [...registry.matchAll(/'@keyframes jumi-([^']+)'/g)].map(match => match[1]),
)

if (!known.size)
  failures.push(
    'src/keyframes/effects.ts: no effects found — the extraction has gone stale',
  )

/* ------------------------------------------------------------------------------------
 * 1. The generated catalog is current
 * ---------------------------------------------------------------------------------- */

const catalogPath = path.join(root, 'stories/animations/effects.generated.ts')
const generated = readFileSync(catalogPath, 'utf8')
// Either quote style, and in either place: the catalog is read as text, and pinning the quotes meant
// the check depended on a serialization detail rather than on the effects it is there to compare.
// Reformatted output silently parsed as zero effects — which reads exactly like a file that is
// missing every effect it should have. The value has to stay quoted, so the interface's own
// `class: string` declaration is not read as an effect.
const declared = new Set(
  [
    ...generated.matchAll(
      /(?<![\w$-])(?:'|")?class(?:'|")?:\s*(?:'|")([^'"]+)(?:'|")/g,
    ),
  ].map(match => match[1]),
)

const ungenerated = [...known].filter(name => !declared.has(name))
const invented = [...declared].filter(name => !known.has(name))

if (ungenerated.length) {
  failures.push(
    `effects.generated.ts is stale: ${ungenerated.length} effect(s) missing` +
      ` — ${ungenerated.slice(0, 8).join(', ')}${ungenerated.length > 8 ? ', …' : ''}`,
  )
}

if (invented.length) {
  failures.push(
    `effects.generated.ts names ${invented.length} effect(s) that do not exist` +
      ` — ${invented.slice(0, 8).join(', ')}${invented.length > 8 ? ', …' : ''}`,
  )
}

/* ------------------------------------------------------------------------------------
 * 2. Every reference under `stories/` resolves
 * ---------------------------------------------------------------------------------- */

const files = []
const walk = target => {
  const absolute = path.join(root, target)

  if (statSync(absolute).isFile()) return [absolute]

  return readdirSync(absolute, { withFileTypes: true }).flatMap(entry => {
    const child = path.join(target, entry.name)

    if (entry.isDirectory())
      return entry.name === 'node_modules' ? [] : walk(child)

    return /\.tsx?$/.test(entry.name) ? [path.join(root, child)] : []
  })
}

const references = []
const unprefixed = []
const fractional = []

for (const file of walk('stories')) {
  const source = readFileSync(file, 'utf8')
  const relative = path.relative(root, file)

  // The prop the shared components render as a class, and the data shape they read. A bare name in
  // `class:` is correct — `AnimationGrid` applies the prefix — but a bare name in `animationClass`
  // is the original bug, so the two are read differently on purpose.
  for (const match of source.matchAll(/animationClass="([^"]+)"/g)) {
    if (!match[1].startsWith('animate-')) {
      unprefixed.push(`${relative}: animationClass="${match[1]}"`)
      continue
    }

    references.push({ file: relative, name: match[1].slice('animate-'.length) })
  }

  for (const match of source.matchAll(/class:\s*'([^']+)'/g))
    references.push({ file: relative, name: match[1] })

  for (const match of source.matchAll(
    /animation-(?:duration|delay)-(\d+\.\d+)/g,
  )) {
    fractional.push(
      `${relative}: animation-${match[0].includes('duration') ? 'duration' : 'delay'}-${match[1]}`,
    )
  }
}

const unresolved = references.filter(({ name }) => !known.has(name))

if (unprefixed.length) {
  failures.push(
    `${unprefixed.length} \`animationClass\` value(s) are missing their \`animate-\` prefix` +
      ` — ${unprefixed.slice(0, 4).join('; ')}`,
  )
}

if (unresolved.length) {
  failures.push(
    `${unresolved.length} story reference(s) name an effect that does not exist` +
      ` — ${[...new Set(unresolved.map(entry => `${entry.name} in ${entry.file}`))].slice(0, 6).join('; ')}`,
  )
}

if (fractional.length) {
  failures.push(
    `${fractional.length} fractional duration/delay token(s): ${fractional.slice(0, 4).join(', ')}` +
      " (the scale is the host's `transitionDuration` / `transitionDelay`, in milliseconds)",
  )
}

/* ------------------------------------------------------------------------------------
 * Report
 * ---------------------------------------------------------------------------------- */

// Each line reports its own outcome. A single failure must not mark the other two as failed — the
// first version did, and it read as though the catalog had drifted when it had not.
const checks = [
  {
    detail: `the catalog matches the registry (${known.size} effects)`,
    pass: !ungenerated.length && !invented.length,
  },
  {
    detail: `every story reference resolves (${references.length} references)`,
    pass: !unprefixed.length && !unresolved.length,
  },
  { detail: 'no fractional duration or delay', pass: !fractional.length },
]

for (const check of checks)
  console.log(`    ${check.pass ? '✓' : '✗'} ${check.detail}`)

if (failures.length) {
  console.error('\n✗ the Storybook does not match the effects Jumi ships:')

  for (const failure of failures) console.error(`  ${failure}`)

  console.error(
    '\n  An unknown `animate-*` class compiles to nothing and animates nothing, without an',
  )
  console.error(
    '  error. Regenerate with `pnpm stories:prepare` if the effects changed.',
  )
  process.exit(1)
}

console.log('\n✓ every effect the Storybook names is one Jumi ships')
