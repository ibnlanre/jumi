#!/usr/bin/env node
import { fileURLToPath } from 'node:url'

import path from 'node:path'
/**
 * What a build actually writes for a scroll-driven candidate — printed, not described.
 *
 * The spike has to retarget *an emitted Jumi animation*, so the first thing it needs is the
 * emission itself. This prints the composition rule (the shorthand plus the two longhands the
 * shorthand resets), the substrate, and every rule that names a timeline, so the probe can be
 * written against the shape that exists rather than a paraphrase of it.
 *
 * Run: `node scripts/spike-scroll-driven/dump.mjs` (bundles first: `lib/compile.mjs` loads `dist/`)
 */
import postcss from 'postcss'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..', '..')

const { build, compiler } = await import(
  path.join(root, 'scripts', 'lib', 'compile.mjs')
)

const CANDIDATES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      'animate-fade-in',
      'animate-rotate-45',
      'animation-timeline-scroll',
      'animation-timeline-view',
    ]

const entry = `
@import "tailwindcss";
@plugin "${path.join(root, 'dist', 'index.js')}";
`

const instance = await compiler(entry, root)
const css = build(instance, CANDIDATES).css

const sheet = postcss.parse(css)

const INTERESTING = [
  'animation',
  'animation-timeline',
  'animation-range',
  'animation-range-start',
  'animation-range-end',
  'animation-composition',
  'interpolate-size',
  'scroll-timeline',
  'scroll-timeline-name',
  'scroll-timeline-axis',
  'view-timeline',
  'view-timeline-name',
  'view-timeline-axis',
  'view-timeline-inset',
]

console.log(`candidates: ${CANDIDATES.join(' ')}\n`)

sheet.walkRules(rule => {
  const own = (rule.nodes ?? []).filter(node => node.type === 'decl')

  if (
    !own.some(
      node => INTERESTING.includes(node.prop) || node.prop.startsWith('--jumi'),
    )
  )
    return

  const parent =
    rule.parent?.type === 'atrule'
      ? `  (in @${rule.parent.name} ${rule.parent.params})`
      : ''

  console.log(`${rule.selector}${parent} {`)
  for (const decl of own) console.log(`  ${decl.prop}: ${decl.value};`)
  console.log('}\n')
})

console.log(
  `keyframes: ${sheet.nodes
    .filter(node => node.type === 'atrule' && node.name === 'keyframes')
    .map(node => node.params)
    .join(' ')}`,
)
console.log(`\n--- raw bytes: ${css.length}`)
