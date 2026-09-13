#!/usr/bin/env node
/**
 * Legacy carrier guard — no class asks for the carrier any more.
 *
 * `animations` and `transitions` used to be opt-in classes. They are gone: an element animates
 * because it carries a motion utility, and the composition is inferred from that. The removal is
 * what makes this check necessary rather than tidy, because a stale class does not *fail* — it is
 * inert. A page with `class="animations animate-rotate-45"` still animates, from the second class,
 * so nothing looks wrong and the dead one survives review. The examples page carried 55 of them.
 *
 * So the guard reads the surfaces a person copies from — examples, docs, and the harness fixtures —
 * and fails on any class-like use of either word. Redundant markup becomes a gate failure instead
 * of a thing to notice.
 *
 * **Class-like, not the word.** Both names are ordinary English and one of them is an ordinary CSS
 * concept, so a search for the text finds prose: "Sequential animations with automatic delay",
 * "hover transitions red", `@media (prefers-reduced-motion)`. The check reads class attributes and
 * class lists and tokenizes them the way a browser would, so a variant (`before:animations`,
 * `*:animations`) is caught and a sentence is not.
 *
 * Run: pnpm legacy:check
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')

/** The names an opt-in carrier used to have. */
const LEGACY = new Set(['animations', 'transitions'])

/**
 * Where a person copies from. Not `src/` — that is the implementation of the inference now, and it
 * says "animations" all over the place for good reasons; the guard is about markup and prose.
 */
const SURFACES = [
  'examples',
  'docs/src',
  'README.md',
  'scripts/css-snapshot',
  'scripts/tmp-postcss',
  'scripts/tmp-vite',
  'scripts/behaviour-check.mjs',
  'scripts/vite-check.mjs',
  'scripts/postcss-check.mjs',
  'scripts/incremental-build.mjs',
]

const TEXT = new Set(['.astro', '.css', '.html', '.js', '.md', '.mjs', '.ts'])

/** Every file under a surface, or the file itself. */
const walk = (target) => {
  const absolute = path.join(root, target)

  let stats
  try {
    stats = statSync(absolute)
  }
  catch {
    return []
  }

  if (stats.isFile()) return [absolute]

  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(target, entry.name)

    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(child)

    return TEXT.has(path.extname(entry.name)) ? [path.join(root, child)] : []
  })
}

/**
 * The class-bearing text in a file: an attribute, or an Astro `class:list` array.
 *
 * Deliberately not the whole file. Tokenizing the whole file would flag the prose, and the prose is
 * where the words belong.
 */
const classText = source => [
  ...source.matchAll(/class(?:Name)?\s*=\s*"[^"]*"/g),
  ...source.matchAll(/class(?:Name)?:list\s*=\s*\{[^}]*\}/g),
].map(match => match[0])

/**
 * The class names in a fragment, with a variant prefix stripped.
 *
 * `before:animations` is the same mistake as `animations` — the variant moved onto the carrier
 * instead of onto the motion — so the token is read from the last colon onwards.
 */
const tokens = fragment => fragment
  .replace(/class(?:Name)?(?::list)?\s*=\s*["{]/, '')
  .split(/[^:\w-]+/)
  .map(token => token.slice(token.lastIndexOf(':') + 1))
  .filter(Boolean)

const hits = []

for (const file of SURFACES.flatMap(walk)) {
  const source = readFileSync(file, 'utf8')

  for (const fragment of classText(source)) {
    for (const token of tokens(fragment)) {
      if (LEGACY.has(token)) hits.push({ file: path.relative(root, file), token })
    }
  }
}

const byFile = new Map()

for (const hit of hits) byFile.set(hit.file, [...(byFile.get(hit.file) ?? []), hit.token])

if (hits.length) {
  console.log('✗ a carrier class survives — it is inert, so nothing else will say so\n')

  for (const [file, names] of byFile) {
    console.log(`  ${file}  (${names.length})`)
    console.log(`    ${[...new Set(names)].join(', ')}`)
  }

  console.log('\n  Delete the token. A motion utility already activates the slot it names, and a')
  console.log('  variant belongs on that utility (`before:animate-*`), not on a carrier.')
  process.exit(1)
}

console.log(`✓ no carrier class in ${SURFACES.length} shipped surfaces`)
