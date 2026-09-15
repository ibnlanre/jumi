#!/usr/bin/env node
import { build, compiler, root } from './lib/compile.mjs'

/**
 * Probe: can the slot key spell the instance instead of hashing it?
 *
 * The key is what identifies an instance everywhere in the emitted stylesheet:
 *
 *   --jumi-slot-<key>                 the hoist the composition resolves
 *   --jumi-slot-<key>-<part>          what a name reaches, and what segment easing selects through
 *
 * The key was `<attribute>-<id>-<hash(name)>`, and the hash was doing two jobs at once: it shortened the
 * key, and it made the tail **hyphen-free**, which is what stops `<key>` and `<key>-<part>` from colliding. A
 * naive readable version — swapping the hash for the word — loses the second job outright:
 *
 *   name `flick`                   → --jumi-slot-rotate-Z2excak-flick
 *                                    its duration part → --jumi-slot-rotate-Z2excak-flick-animation-duration
 *   name `flick-animation-duration` → --jumi-slot-rotate-Z2excak-flick-animation-duration
 *
 * Same variable, two meanings. So this probe tests the shape the CTO proposed — the name **first**, so the
 * part suffix is never adjacent to a name — and asks the one question that decides it: does the name/bare-key
 * boundary hold for every legal name and the real attribute vocabulary?
 *
 * It answered, in §1: the proposed order does not hold — 50 collisions, both halves of each one real
 * attributes — while putting the id between the name and the attribute holds for every name. That is what
 * ships: `--jumi-slot-<name>-<id>-<attribute>`. §1 is kept as the record of why, and the answer's permanent
 * form is `src/core/slot-key.test.ts` — the file to read before changing the key.
 *
 * One limit it found later, in that test rather than here: an id is hyphen-free but **not fixed-length**
 * (`shorthash2('50')` is `rI`), so a name crafted to end in another instance's id still absorbs. This probe's
 * ids are `k1aaa`/`k2bbb`, which is why it reports none — the crafted case needs ids from the model.
 *
 * No production code is touched: this is arithmetic over real emitted CSS plus a search.
 *
 * Run: `node scripts/spike-slot-key.mjs`.
 */
import fs from 'node:fs'
import path from 'node:path'
import postcss from 'postcss'
import shorthash2 from 'shorthash2'

/** The parts a slot key derives a variable for, as the model spells them. */
const PARTS = [
  'animation-composition',
  'animation-name',
  'animation-range',
  'animation-timeline',
]

/** A real sheet, so the vocabulary and the occurrence counts are facts rather than guesses. */
const FIXTURE = [
  'animate-fade-in/reveal',
  'animate-fade-in/loop',
  'animate-rotate-[0:0deg|100:90deg]/first',
  'animate-rotate-[0:0deg|100:90deg]/second',
  'animate-opacity-[0:1|50:0.5|100:1]/enter',
  'animate-scale-110/hovered',
  'animate-background-color-red-500/highlight',
  'animate-border-radius-sm/soft',
  'animate-rotate-45',
  'animate-scale-110',
  'animation-duration-300/reveal',
  'animation-timing-function-[0:step-start]/first',
]

const compiled = await build(
  await compiler(
    '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";',
    root,
  ),
  FIXTURE,
)

/**
 * The attributes Jumi animates that this sheet happens to use, plus the rest of the vocabulary that matters
 * for an absorption attack — a name ending in one attribute's word, against another attribute.
 */
const VOCABULARY = [
  ...new Set([
    'accent-color',
    'background-color',
    'border-color',
    'box-shadow',
    'caret-color',
    'color',
    'fill',
    'opacity',
    'outline-color',
    'rotate',
    'scale',
    'stroke',
    ...[...compiled.css.matchAll(/--jumi-([a-z-]+)-animation-name:/g)].map(
      match => match[1],
    ),
  ]),
].sort()

/**
 * The absorption attack: a name that ends where another attribute begins.
 *
 * `foo-background` on a `color` motion and `foo` on a `background-color` motion both read
 * `foo-background-color`, so if the definition follows the attribute the two keys are one key. Every split
 * of every attribute that leaves a vocabulary word behind is generated, because that is the shape a boundary
 * assumption gets exposed by — and a corpus of plain names finds none of them.
 */
const ABSORPTION = VOCABULARY.flatMap(attribute =>
  VOCABULARY.flatMap(suffix =>
    attribute.endsWith(`-${suffix}`)
      ? [`foo-${attribute.slice(0, -(suffix.length + 1))}`]
      : [],
  ),
)

/** The names a delimiter assumption gets exposed by, including every absorption attempt. */
const NAMES = [
  'flick',
  'flick-animation-duration',
  'animation-duration',
  'rotate',
  'foo',
  'foo-bar-baz',
  'a',
  'reveal',
  'loop',
  'a-very-long-instance-name-for-a-motion',
  ...VOCABULARY.map(attribute => `foo-${attribute}`),
  ...ABSORPTION,
]

/** Long-name stress, at a length an author might actually reach. */
const LONG = 'a-really-quite-long-instance-name-for-one-motion'

const keys = {
  /** The vocabulary this replaced: the name entered hashed, so the tail was hyphen-free. */
  hashed: (attribute, id, name) => `${attribute}-${id}-${shorthash2(name)}`,
  /** The CTO's first proposal, rejected: name first, then the attribute, then the id. */
  nameFirst: (attribute, id, name) => `${name}-${attribute}-${id}`,
  /** What ships: the same order with the hyphen-free id as the boundary between name and attribute. */
  nameIdAttribute: (attribute, id, name) => `${name}-${id}-${attribute}`,
}

/**
 * Every variable a key derives, and who claimed it.
 *
 * A collision is two different `(attribute, id, name)` tuples deriving the same variable — which is exactly
 * what two instances sharing one hoist would mean.
 */
const collisions = shape => {
  const claimed = new Map()
  const found = []

  for (const attribute of VOCABULARY)
    for (const id of ['k1aaa', 'k2bbb'])
      for (const name of NAMES)
        for (const suffix of ['', ...PARTS.map(part => `-${part}`)]) {
          const variable = `--jumi-slot-${shape(attribute, id, name)}${suffix}`
          const source = `${attribute} / ${id} / ${name} /${suffix || ' (bare)'}`
          const already = claimed.get(variable)

          if (already && already !== source)
            found.push({ source, variable, versus: already })

          claimed.set(variable, source)
        }

  return found
}

console.log('══ can the slot key spell the instance?\n')
console.log(
  `   vocabulary: ${VOCABULARY.length} attributes, names: ${NAMES.length}`,
)

console.log('\n── 1 · namespace collision safety\n')

for (const [label, shape] of Object.entries(keys)) {
  const found = collisions(shape)

  console.log(
    `   ${label.padEnd(16)} ${found.length ? `${found.length} collisions` : 'no collisions'}`,
  )

  for (const { source, variable, versus } of found.slice(0, 3))
    console.log(`      ${variable}\n        ${source}\n        ${versus}`)
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 2 · Byte cost, from the recorded corpus rather than from an estimate
 *
 * The key appears many times per instance — the hoist, the registrations, the selection — so the cost of a
 * longer key is its length delta times its occurrence count. Named instances are found the way the model
 * names them: a label declaration whose value is the author's word.
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log('\n── 2 · byte cost on the recorded corpus\n')

const SNAPSHOT = 'scripts/css-snapshot/snapshot.css'
const snapshot = fs.readFileSync(path.join(root, SNAPSHOT), 'utf8')
const named = []

postcss.parse(snapshot).walkRules(rule => {
  const declarations = (rule.nodes ?? []).filter(node => node.type === 'decl')
  const label = declarations.find(node =>
    /^--jumi-[\w-]+-label$/.test(node.prop),
  )

  if (!label) return

  named.push({
    key: label.prop.slice('--jumi-'.length, -'-label'.length),
    name: label.value,
  })
})

const measured = []
let corpus = 0

for (const { key, name } of named) {
  const occurrences = snapshot.split(`--jumi-slot-${key}`).length - 1
  // The key is `<name>-<id>-<attribute>`, and the id is hyphen-free, so the id is the segment after the
  // name and the attribute is the rest of it.
  const tail = key.slice(name.length + 1)
  const id = tail.slice(0, tail.indexOf('-'))
  const attribute = tail.slice(id.length + 1)
  const before = keys.hashed(attribute, id, name)
  const shipped = keys.nameIdAttribute(attribute, id, name)
  const delta = (before.length - shipped.length) * occurrences

  // Positive is a saving: the readable key is shorter than the hash it replaced whenever the name is.
  corpus += delta
  measured.push({ before, delta, name, occurrences, shipped })
}

for (const { before, delta, name, occurrences, shipped } of measured)
  console.log(
    `   /${name.padEnd(12)} ${occurrences} occurrences   ${before.length} → ${shipped.length} chars   ${delta >= 0 ? '+' : ''}${delta} bytes saved`,
  )

console.log(
  `   canonical corpus total: ${corpus >= 0 ? '+' : ''}${corpus} bytes saved`,
)

// Long-name stress: one instance, at a length an author might reach, on the same sheet.
const LONG_SHEET = [
  `animate-rotate-[0:0deg|100:90deg]/[${LONG}]`,
  `animation-duration-300/[${LONG}]`,
]
const longCompiled = await build(
  await compiler(
    '@import "tailwindcss"; @plugin "' + root + '/dist/index.js";',
    root,
  ),
  LONG_SHEET,
)
const longId = shorthash2('0:0deg|100:90deg')
const longKey = `${LONG}-${longId}-rotate`
const longBefore = keys.hashed('rotate', longId, LONG)
const longOccurrences =
  longCompiled.css.split(`--jumi-slot-${longKey}`).length - 1
const longDelta = longKey.length - longBefore.length

console.log(
  `   long name (${LONG.length} chars): ${longOccurrences} occurrences   ${longBefore.length} → ${longKey.length} chars   ${longDelta >= 0 ? '+' : ''}${longDelta} bytes per occurrence (× ${longOccurrences} sites)`,
)

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 3 · Snapshot topology
 *
 * A rename must not change *what* exists, only what it is called: same registrations, same chains, same
 * count of slot variables.
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log('\n── 3 · what a rename would touch\n')

const registrations = [...snapshot.matchAll(/@property --jumi-slot-/g)].length
const slotVariables = new Set(
  [...snapshot.matchAll(/--jumi-slot-[\w-]+/g)].map(match => match[0]),
)

console.log(`   named instances in the corpus: ${named.length}`)
console.log(`   @property --jumi-slot-… rules: ${registrations}`)
console.log(`   distinct --jumi-slot-… names: ${slotVariables.size}`)
console.log(
  '   — a rename changes names, never counts: the same registration is emitted for the same instance, and no\n     chain gains or loses a link.',
)

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 4 · Behaviour: what actually reads the key
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log('\n── 4 · behaviour\n')

const harnesses = [
  'scripts/behaviour-check.mjs',
  'scripts/scroll-driven-check.mjs',
  'scripts/view-transition-check.mjs',
  'scripts/studio-check.mjs',
]

for (const harness of harnesses) {
  const source = fs.readFileSync(path.join(root, harness), 'utf8')
  const reads = source.match(/--jumi-slot-/g)?.length ?? 0

  console.log(
    `   ${harness.padEnd(38)} ${reads ? `reads --jumi-slot- (${reads}×)` : 'never mentions a slot key'}`,
  )
}

console.log(
  '   — the browser gates assert animations, computed values and easings, so a key is internal vocabulary:\n     renaming it should move no reading, which is what re-running them verifies.',
)
