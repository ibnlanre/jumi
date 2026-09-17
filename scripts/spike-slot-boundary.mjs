#!/usr/bin/env node
import { build, compiler, root } from './lib/compile.mjs'

import cssEscape from 'css.escape'
/**
 * Probe: what makes a readable slot key **exact** rather than merely unlikely to collide?
 *
 * `--jumi-slot-<name>-<id>-<attribute>` is readable, and the assertion in `src/core/slot-key.test.ts`
 * disproved the property it was adopted for: an id is hyphen-free but not fixed-length (`shorthash2('50')`
 * is `rI`), so a name whose tail *is* another instance's id still absorbs its key. That is a deterministic
 * string-grammar collision where the shape it replaced had only a probabilistic hash one — the same defect,
 * worse to debug.
 *
 * The lesson is that no permutation of three `-`-separated pieces fixes it:
 *
 *     unbounded hyphenated name  ·  hyphenated attribute  ·  variable-length id
 *
 * Any ordering of those, joined only by `-`, makes the parse boundary a function of the *contents*, so some
 * pair of contents can move the boundary. This probe tests representations where the boundary is a fact
 * about the *shape* instead:
 *
 *   shipped      --jumi-slot-flick-Z2excak-rotate        contents decide the split
 *   delimited    --jumi-slot-5-flick-Z2excak-rotate      the `5` says where the name ends
 *   code-points  --jumi-slot-5-flick-Z2excak-rotate      …counting code points instead of UTF-16 units
 *   raw-length   --jumi-slot-5-flick-Z2excak-rotate      …counting the raw name, not the emitted one
 *   doubled      --jumi-slot-flick--Z2excak--rotate      a delimiter names may not contain
 *
 * The acceptance criterion is strict: **zero collisions by construction**, which the enumeration in §2 cannot
 * establish on its own. So §1 tests the property that does imply it — that `decode` is a left inverse of
 * `encode` — over the corpus, and §2 is corroboration.
 *
 * No production code is touched. `scripts/spike-slot-key.mjs` asked whether the key could spell the name;
 * this one asks what the spelling has to be exact.
 *
 * Run: `node scripts/spike-slot-boundary.mjs`.
 */
import fs from 'node:fs'
import path from 'node:path'

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * The corpus: the real attribute vocabulary, and names that attack the boundary
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The attributes, read out of the vocabulary rather than listed here.
 *
 * A hand-kept list is how a collision test gets a false negative: the shapes that collide are exactly the
 * ones nobody remembered to add. The effects file is read the same way, because an effect's key is its own
 * name — no id, no name position — so it can only collide with a named instance if a named key happens to be
 * a bare effect name, which the key's shape rules out on its own.
 */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8')

const VOCABULARY = [
  ...new Set([
    ...[
      ...read('src/keyframes/effects.ts').matchAll(/^ {2}'([\w-]+)': \{$/gm),
    ].map(match => match[1]),
    ...[
      ...read('src/variables/property.ts').matchAll(
        /variable: '--jumi-([\w-]+)'/g,
      ),
    ].map(match => match[1]),
  ]),
]

/** The attribute pair the whole problem is about: one attribute's name is a suffix of another's. */
const OVERLAPS = VOCABULARY.flatMap(attribute =>
  VOCABULARY.filter(
    suffix => attribute !== suffix && attribute.endsWith(`-${suffix}`),
  ).map(suffix => [attribute, suffix]),
)

/** Names that attack a boundary, plus names that attack the *encoding* of one. */
const ADVERSARIAL = [
  'a',
  'flick',
  'loop',
  'reveal',
  'foo-bar-baz',
  // Ends where another attribute begins — the shipped shape's collision, with no crafted hash.
  'foo-accent',
  'foo-background',
  'foo-stroke',
  // Reads like a part suffix. `behaviour-check.mjs` arm `n` is this name.
  'flick-animation-duration',
  // Reads like the length prefix a delimited shape uses.
  '5-flick',
  '12-foo',
  // Non-ASCII: what "length" means.
  'café',
  '日本語',
  '👍emoji',
  'e\u0301acute',
  // Characters a custom property cannot carry unescaped, so the emitted text is not the name.
  'foo.bar',
  'foo:bar',
  'foo)bar',
  'foo,bar',
  '2fast',
  '-leading',
  // A name that would eat a double delimiter.
  'foo--bar',
]

/**
 * Names: the adversarial set, plus the `foo-` spellings the vocabulary's own overlaps make possible.
 *
 * The attributes are exhaustive and the names are adversarial rather than exhaustive, which is the right way
 * round for this question: §1 proves a property of the *shape* (a round trip), so it needs the shapes that
 * move a boundary, not every string. The overlap spellings are capped because the vocabulary has 300+
 * overlapping pairs and the cap is what keeps the enumeration in memory.
 */
const MAX_OVERLAP_NAMES = 60

const NAMES = [
  ...new Set([
    ...ADVERSARIAL,
    ...OVERLAPS.slice(0, MAX_OVERLAP_NAMES / 2).flatMap(
      ([attribute, suffix]) => [
        `foo-${attribute}`,
        `foo-${attribute.slice(0, -(suffix.length + 1))}`,
      ],
    ),
    ...VOCABULARY.slice(0, MAX_OVERLAP_NAMES / 2),
  ]),
]

/** `addressableName` refuses whitespace and control characters, so only those names are reachable. */
const addressable = name =>
  name.length > 0 && !/[\s\u0000-\u001f\u007f]/.test(name)

const LEGAL = NAMES.filter(addressable)

/** Ids as `shorthash2` returns them — base62, two to seven characters — plus the crafted one §2 turns on. */
const IDS = ['k1aaa', 'Z2excak', 'rI', 'd15', 'rotate']

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * What a name occupies in the emitted variable
 *
 * `cssEscape` has a rule for the first character of the string it is given that never applies here: a Jumi
 * variable is `--jumi-slot-<key>`, so the name is never at position 0, and `\35 `-style escapes for a leading
 * digit — or for a `-` that would otherwise read as a negative number — cannot occur. Prefixing a character
 * and slicing it back off models exactly the rule that does apply, and §3 checks it against a real compile
 * rather than trusting it.
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

const emitted = name => cssEscape(`x${name}`).slice(1)

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * The shapes, each with the reader it would need
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The readable-but-undelimited shape — what was in the tree when this probe ran. It is here to be decoded, and
 * the point is that no reader exists: the same string is the image of two different triples.
 */
const shipped = {
  about: 'name, id, attribute — what shipped before the ruling, not exact',
  encode: (attribute, id, name) => `${name}-${id}-${attribute}`,
}

/** A length prefix in a chosen unit, then the name, the id and the attribute. */
const delimited = (
  unit = {
    size: text => text.length,
    take: (text, count) => text.slice(0, count),
  },
) => ({
  about:
    'length prefix, name, id, attribute — the prefix is the parse boundary',
  decode: key => {
    const cut = key.indexOf('-')

    if (cut < 1) return null

    const count = Number(key.slice(0, cut))

    if (!Number.isSafeInteger(count) || count < 1) return null

    const rest = key.slice(cut + 1)
    const name = unit.take(rest, count)
    const tail = rest.slice(name.length)

    if (!tail.startsWith('-')) return null

    const body = tail.slice(1)
    const end = body.indexOf('-')

    if (end < 1) return null

    return { attribute: body.slice(end + 1), id: body.slice(0, end), name }
  },
  encode: (attribute, id, name) => {
    const text = emitted(name)

    return `${unit.size(text)}-${text}-${id}-${attribute}`
  },
})

const lengthUnits = delimited()
const codePoints = delimited({
  size: text => [...text].length,
  take: (text, count) => [...text].slice(0, count).join(''),
})

/** The same shape counting the name *before* escaping, which §3 shows is not the text that ships. */
const rawLength = {
  about:
    'length prefix counting the raw name — broken where escaping changes the text',
  decode: lengthUnits.decode,
  encode: (attribute, id, name) =>
    `${name.length}-${emitted(name)}-${id}-${attribute}`,
}

/** A delimiter a name may not contain. */
const doubled = {
  about: 'double delimiter — exact only if a name cannot contain `--`',
  decode: key => {
    const [name, id, ...rest] = key.split('--')

    return rest.length === 1 && name && id
      ? { attribute: rest[0], id, name }
      : null
  },
  encode: (attribute, id, name) => `${emitted(name)}--${id}--${attribute}`,
}

const SHAPES = { codePoints, doubled, lengthUnits, rawLength, shipped }

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 1 · The strict criterion
 *
 * Zero collisions *by construction* is a claim about the encoding, and the test for it is that the reader is
 * a left inverse of the writer. The enumeration below is still finite — but it fails for a *reason* (a name
 * that moves the boundary) rather than for a pair found by luck, which is the difference the CTO asked for.
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log('══ what makes a readable slot key exact?\n')
console.log(
  `   vocabulary: ${VOCABULARY.length} attributes, ${OVERLAPS.length} overlapping pairs`,
)
console.log(
  `   names: ${LEGAL.length} (adversarial + overlap spellings), ids: ${IDS.length}\n`,
)

console.log(
  '── 1 · the strict criterion: is `decode` a left inverse of `encode`?\n',
)

for (const [label, shape] of Object.entries(SHAPES)) {
  if (!shape.decode) {
    console.log(`   ${label.padEnd(12)} ✗   ${shape.about}`)
    continue
  }

  let checked = 0
  let failed = 0
  const shown = []

  for (const attribute of VOCABULARY)
    for (const id of IDS)
      for (const name of LEGAL) {
        checked += 1

        const key = shape.encode(attribute, id, name)
        const back = shape.decode(key)

        // The reader recovers the name **as the variable spells it**, not as the author wrote it: a name
        // holding a character CSS escapes occupies more characters than it has, and the length counts the
        // text that ships. Unescaping is a further step nothing in Jumi needs — every reader of a key works
        // on the emitted text, which is why the two sides agree without either of them unescaping.
        if (
          !back ||
          back.attribute !== attribute ||
          back.id !== id ||
          back.name !== emitted(name)
        ) {
          failed += 1
          if (shown.length < 2)
            shown.push(`${JSON.stringify(name)} on ${attribute} → ${key}`)
        }
      }

  console.log(
    `   ${label.padEnd(12)} ${(failed ? '✗' : '✓').padEnd(4)}${shape.about}`,
  )
  console.log(
    `   ${''.padEnd(12)} ${''.padEnd(4)}${checked - failed} of ${checked} triples round-trip${
      failed ? `, ${failed} do not` : ''
    }`,
  )
  for (const line of shown) console.log(`   ${''.padEnd(16)}${line}`)
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 2 · Corroboration: enumerate, and see which shape two triples actually collide in
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log('\n── 2 · collisions found by enumeration, over the same corpus\n')

for (const [label, shape] of Object.entries(SHAPES)) {
  const claimed = new Map()
  const found = []

  for (const attribute of VOCABULARY)
    for (const id of IDS)
      for (const name of LEGAL) {
        const key = shape.encode(attribute, id, name)
        const triple = `${attribute} / ${id} / ${name}`
        const owner = claimed.get(key)

        if (owner === undefined) claimed.set(key, triple)
        else if (owner !== triple && found.length < 2)
          found.push(
            `${key}\n   ${''.padEnd(16)}${owner}\n   ${''.padEnd(16)}${triple}`,
          )
      }

  console.log(
    `   ${label.padEnd(12)} ${found.length ? `${found.length}+ collisions` : 'none'}`,
  )

  for (const line of found) console.log(`   ${''.padEnd(16)}${line}`)
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 3 · What "length" has to count, checked against a real compile
 *
 * Three questions, all measured: is the emitted text the name, do UTF-16 units and code points disagree, and
 * what does a delimiter a name may not contain cost the author? Only the first is a correctness question for
 * a length prefix — the second is a choice, as long as the writer and the reader make the same one.
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log('\n── 3 · the encoding details\n')

const differing = LEGAL.filter(name => emitted(name) !== name)
const astral = LEGAL.filter(name => name.length !== [...name].length)
const dashed = LEGAL.filter(name => name.includes('--'))

console.log(
  `   names whose emitted text differs from the name: ${differing.length} of ${LEGAL.length}`,
)
for (const name of differing.slice(0, 4))
  console.log(
    `      ${JSON.stringify(name)} → ${JSON.stringify(emitted(name))}   ${name.length} → ${emitted(name).length} chars`,
  )

console.log(
  `   names where UTF-16 units and code points disagree: ${astral.length}`,
)
for (const name of astral.slice(0, 3))
  console.log(
    `      ${JSON.stringify(name)}   ${name.length} units, ${[...name].length} points`,
  )

console.log(
  `   names a double delimiter would refuse: ${dashed.length} of ${LEGAL.length}` +
    (dashed.length
      ? ` — ${dashed.map(name => JSON.stringify(name)).join(', ')}`
      : ''),
)

// What the model actually writes, for a name that escapes and one that does not.
const SHEET = ['animate-scale-110/[foo.bar]', 'animate-scale-110/plain']

try {
  const built = await build(
    await compiler(
      `@import "tailwindcss"; @plugin "${path.join(root, 'dist', 'index.js')}";`,
      root,
    ),
    SHEET,
  )
  const slot = built.css.match(/--jumi-slot-[\w\\.-]*/g) ?? []

  console.log('\n   what a real compile emits, beside what this probe assumed:')
  for (const variable of [...new Set(slot)].slice(0, 4))
    console.log(`      ${variable}`)
  for (const name of ['foo.bar', 'plain'])
    console.log(
      `      /${name.padEnd(8)} the name occupies ${emitted(name).length} characters in it: ${JSON.stringify(emitted(name))}`,
    )
} catch (error) {
  console.log(`\n   a real compile could not be read here: ${error.message}`)
}

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 4 · The part suffix, which is what makes the variable and not just the key
 *
 * A slot variable is `--jumi-slot-<key>-<part>`. A reader is either handed the part or it strips a part from
 * the end — and stripping is decidable exactly when no two `attribute-part` strings are equal, which is a fact
 * about the vocabulary and the part list rather than about any name. That is what this section measures.
 *
 * The question is **historical** for the finalizer: the reader that had to be handed the part was
 * `linkedSlot(entry, part)`, removed 2026-09-17 when instance identity moved onto the payload. It was handed
 * the part because a guessed suffix had read `flick` out of a name of `flick-animation-duration` and published
 * the hoist under a key that nothing fills. The measurement stands as the record of why reading a part out of a
 * variable at all is the trap.
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log(
  '\n── 4 · stripping the part, for a reader that is not handed one\n',
)

const PARTS = [
  'animation-composition',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-range',
  'animation-timeline',
  'animation-timing-function',
]

const splits = new Map()
const ambiguous = []

for (const attribute of VOCABULARY)
  for (const part of PARTS) {
    const text = `${attribute}-${part}`
    const owner = `${attribute} + ${part}`

    if (splits.has(text) && splits.get(text) !== owner)
      ambiguous.push(`${text}: ${splits.get(text)} or ${owner}`)
    else splits.set(text, owner)
  }

console.log(
  `   ${VOCABULARY.length} attributes × ${PARTS.length} parts: ${ambiguous.length} ambiguous suffixes`,
)
for (const line of ambiguous.slice(0, 3)) console.log(`      ${line}`)

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 5 · Cost, on the corpus that is already frozen
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log('\n── 5 · byte cost against the shape in the tree\n')

const snapshot = fs.readFileSync(
  path.join(root, 'scripts/css-snapshot/snapshot.css'),
  'utf8',
)

let total = 0

for (const match of snapshot.matchAll(/--jumi-([\w-]+)-label: ([\w-]+);/g)) {
  const [, key, name] = match
  const tail = key.slice(name.length + 1)
  const cut = tail.indexOf('-')
  const id = tail.slice(0, cut)
  const attribute = tail.slice(cut + 1)
  const occurrences = snapshot.split(`--jumi-slot-${key}`).length - 1
  const before = shipped.encode(attribute, id, name).length
  const after = lengthUnits.encode(attribute, id, name).length
  const delta = (after - before) * occurrences

  total += delta
  console.log(
    `   /${name.padEnd(8)} ${String(occurrences).padStart(2)} occurrences   ${before} → ${after} chars   ${delta >= 0 ? '+' : ''}${delta} bytes`,
  )
}

console.log(`   canonical corpus total: ${total >= 0 ? '+' : ''}${total} bytes`)

const LONG = 'a-really-quite-long-instance-name-for-one-motion'
const longBefore = shipped.encode('rotate', 'Z2excak', LONG).length
const longAfter = lengthUnits.encode('rotate', 'Z2excak', LONG).length

console.log(
  `   long name (${LONG.length} chars): ${longBefore} → ${longAfter} chars   ${longAfter - longBefore >= 0 ? '+' : ''}${longAfter - longBefore} per occurrence`,
)

/* ────────────────────────────────────────────────────────────────────────────────────────────────────
 * 6 · What a person reads
 * ────────────────────────────────────────────────────────────────────────────────────────────────── */

console.log('\n── 6 · the same instance, in each shape\n')

for (const name of ['flick', 'flick-animation-duration', '日本語']) {
  console.log(`   named /${name}`)

  for (const [label, shape] of Object.entries(SHAPES))
    console.log(
      `      ${label.padEnd(12)} --jumi-slot-${shape.encode('rotate', 'Z2excak', name)}`,
    )
}

console.log(
  "\n   the prefix is the only part that is not the author's own text: two characters for a name of nine or\n" +
    '   fewer, three under a hundred, and nothing at all for an unnamed slot, which keeps `attribute-id`.\n',
)
