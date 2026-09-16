#!/usr/bin/env node
/**
 * Check: does any corpus spell a class that no element carries?
 *
 * `@source` makes a file *content*, and Tailwind reads content as **text** — comments included — then
 * extracts every candidate-shaped token it can find. So a class written in prose becomes a real utility:
 *
 *   <!-- `animate-skew-x-[…]` is here for the route one level deeper. -->
 *
 * emitted `.animate-skew-x-\[…\] { --jumi-skew-x: … }` into the canonical snapshot. One phantom candidate
 * in the corpus the writer/read invariant runs on, in a file whose whole purpose is to be a *measured*
 * one — and the value it wrote was an ellipsis.
 *
 * The mistake is easy to make twice: it was made again in the sentence that removed it, by quoting the
 * token. Hence a check rather than a note. A token present in a comment and in no `class` attribute is
 * either a placeholder that has to go or a class an element has to carry.
 *
 *   node scripts/phantom-candidates.mjs           verify
 *
 * The scan is intentionally generous in what it calls a *token* and strict in what it calls a *phantom*:
 * only tokens that no `class` attribute contains are reported, so naming a real class in prose — the
 * convention everywhere else in these fixtures — stays allowed.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

/** The content files the snapshot corpora scan, from the `@source` directives beside them. */
const SOURCES = [
  'scripts/css-snapshot/fixture.html',
  'scripts/css-snapshot/variant.html',
]

/** A candidate-shaped token: a utility stem, with a bracket group if one follows. */
const TOKEN = /animate-[a-z][\w-]*(?:\[[^\]]*\])?/g

/** The tokens a document writes in prose. */
const written = source => {
  const found = new Set()

  for (const [, comment] of source.matchAll(/<!--([\s\S]*?)-->/g))
    for (const [token] of comment.matchAll(TOKEN)) found.add(token)

  return found
}

/** The token lists of the elements a document carries. */
const carried = source =>
  [...source.matchAll(/class="([^"]*)"/g)].map(([, body]) => body)

/** The tokens `source` writes in prose and no element in it carries. */
const phantoms = source => {
  const values = carried(source)

  return [...written(source)].filter(
    token => !values.some(value => value.includes(token)),
  )
}

/**
 * The self-test, for the reason every harness here has one: a check that cannot fail is worse than none.
 *
 * Two cases, and the second is the interesting one — a token an element carries is legitimate prose, so
 * naming a real class in a comment has to stay allowed. The first is the defect: a bracket group holding
 * an ellipsis, in a comment and nowhere else. (The ellipsis is spelled `\u2026` so that this file, which is
 * not itself scanned as content, does not read as a corpus of one.)
 */
const SELF_TEST = [
  [
    'a token in prose that no element carries is found',
    '<div class="animate-fade-in"></div>\n<!-- `animate-skew-x-[\u2026]` is the route one level deeper. -->',
    ['animate-skew-x-[\u2026]'],
  ],
  [
    'a token that an element does carry is not',
    '<div class="animate-fade-in"></div>\n<!-- `animate-fade-in` is the motion under test. -->',
    [],
  ],
]

const undetected = SELF_TEST.filter(
  ([, source, expected]) =>
    JSON.stringify(phantoms(source)) !== JSON.stringify(expected),
)

if (undetected.length) {
  console.error('\n✗ the phantom detector does not detect:\n')

  for (const [claim] of undetected) console.error(`  ${claim}`)

  console.error(
    '\n  Re-read it before trusting a pass: this check passing is only meaningful if it can fail,\n' +
      '  and a corpus read as utility text is how a snapshot starts measuring prose.\n',
  )
  process.exit(1)
}

const phantomsFound = []

const source = file => readFileSync(path.join(root, file), 'utf8')

for (const file of SOURCES)
  for (const token of phantoms(source(file)))
    phantomsFound.push({ file, token })

console.log('\n· the corpus is what it says it is\n')

for (const file of SOURCES) {
  const own = phantomsFound.filter(one => one.file === file)

  console.log(
    `  ${own.length ? '✗' : '✓'} ${file.padEnd(34)} ${
      own.length
        ? `${own.length} token(s) written but carried by no element`
        : 'every token in prose is a class an element has'
    }`,
  )
}

console.log()

if (phantomsFound.length) {
  console.error('✗ a phantom candidate — prose the compiler read as a utility:\n')

  for (const { file, token } of phantomsFound)
    console.error(`  ${file}\n    ${token}`)

  console.error(
    '\n  Tailwind scans content as text, comments included. Write a part name, or name a class an\n' +
      '  element actually carries — and do not quote the offending token in the sentence that\n' +
      '  explains it, which is how this happened twice.\n',
  )
  process.exit(1)
}

console.log('✓ no phantom candidates\n')
