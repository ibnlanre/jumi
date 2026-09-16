#!/usr/bin/env node
/**
 * Semantic text rewrites over serialized CSS — the census, and its classification.
 *
 * A defect proved that Jumi's compiler path can feed the carrier pass CSS in more than one
 * serialization form, and that at least one lookup depended on the exact form. The question this file
 * answers is not "is that regex safe" but "how many places assume something about serialized text".
 *
 * It is a **registry, not a linter**. Nothing here can decide whether a `replace` is semantically
 * sound; only a reader can, and having decided, only a registry can keep the decision alive. So the
 * scan finds every candidate, every candidate must appear below with a classification and answers, and
 * a candidate that is missing — or an entry whose line has moved or changed — fails the check. That is
 * what stops the audit from being a thing that happened once.
 *
 * Scoped to `src/`, minus tests: the shipped pass, which is what reads sheets a build produced. The
 * studio parses CSS text too, and is deliberately out of scope here — noted rather than silently
 * skipped, because "not audited" and "audited and fine" are different claims.
 *
 *   node scripts/serialize-audit.mjs            verify the registry against the source
 *   node scripts/serialize-audit.mjs --list     print every candidate, for building the registry
 *
 * The five questions are the ones the classification has to answer to be worth anything:
 *
 *   recovers       what semantic fact is this code trying to recover?
 *   assumes        what textual assumption does it rely on?
 *   serialization  does minified vs formatted CSS change the result?
 *   breakable      can nested var(), escaping, or whitespace variation break it?
 *   structural     is there already a structural representation available instead?
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import path from 'node:path'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The operations that can encode an assumption about text.
 *
 * `slice`, `padEnd` and their neighbours are not here: they are arithmetic on a string somebody else
 * already decided the shape of, so they are witnesses rather than suspects — a `slice` after a `match`
 * inherits that `match`'s assumption, and the `match` is what gets audited.
 */
const OPERATIONS =
  /\.(?:replace|replaceAll|split|match|matchAll|includes|startsWith|endsWith|indexOf|lastIndexOf|test|exec)\(|new RegExp\(/

/**
 * Whether a line is plausibly about CSS text, rather than about arrays, ids or DOM classes.
 *
 * Transparent, and deliberately generous: it decides what gets *claimed* as audited, so a line it
 * misses is a line nobody said was fine. Widening it is the safe direction; narrowing it is how an
 * audit starts lying.
 */
const CSS_TEXT =
  /value|prop|selector|declaration|params|\bcss\b|entry|\btext\b|\brule\b|token|frame|range|slot|staging|var\(|--jumi|\bclass\b|marker|label|\bpart\b|\bkey\b|\bname\b|definition|address/

/** A hit's stable name: the file, and enough of the line to notice it changing. */
const anchor = line => line.replace(/\s+/g, ' ').trim().slice(0, 74)

/**
 * The classification, and the answers.
 *
 * Buckets: `structural` · `tolerant` · `spacing` · `inferred`
 *
 * `structural` and `tolerant` are sound and their answers are the same every time, which is why they
 * are built by a helper rather than retyped: the class *is* the answer.
 *
 * `spacing` depends on how something happened to be written. It is the bucket the shipped defect came
 * from, and the only one where the questions have to be answered one line at a time.
 *
 * `inferred` recovers structure by reading characters rather than by matching a pattern. Sound where it
 * is escape-aware — and every one of these is — but it is a design question rather than a bug: this is
 * the bucket a tokenizer would replace, if this side of the build ever had one.
 *
 * The distinction that decides most of these: **author text or sheet text**. A value an author typed is
 * in a shape Tailwind wrote; a value read back off the sheet may have been through an optimizer, and
 * that is the text this audit exists for.
 */

/** A rewrite whose target is an identifier, a property name or an array — never serialized text. */
const safe = (file, anchor, recovers) => ({
  anchor,
  assumes:
    'nothing about spacing: the target is an identifier, a property name or an array',
  breakable: 'no',
  class: 'structural',
  file,
  recovers,
  serialization: 'no',
  structural: 'n/a',
})

/** Text that is meant to be text, and survives a serializer because it was written for one. */
const tolerant = (file, anchor, recovers, assumes) => ({
  anchor,
  assumes,
  breakable: 'no',
  class: 'tolerant',
  file,
  recovers,
  serialization: 'no',
  structural: 'n/a',
})

/** Recovers structure by reading characters. Same five answers for all of them. */
const inferred = (file, anchor, recovers, structural) => ({
  anchor,
  assumes:
    'the characters of a selector or a variable name, read one at a time and escape-aware',
  breakable: 'no',
  class: 'inferred',
  file,
  recovers,
  serialization: 'no',
  structural,
})

const carriers = 'src/helpers/carriers/index.ts'
const transitions = 'src/helpers/carriers/view-transition.ts'

const registry = [
  safe(
    'src/core/index.ts',
    "part.startsWith('animation-') &&",
    'which parts the shorthand carries',
  ),
  safe(
    'src/core/index.ts',
    '!(separateParts as readonly string[]).includes(part)',
    'which parts it cannot carry',
  ),
  safe(
    'src/core/index.ts',
    'name.length > 0 && !/[\\s\\u0000-\\u001F\\u007F]/.test(name)',
    'whether a name can be written into a custom-property segment at all',
  ),
  safe(
    'src/core/index.ts',
    'name && separateParts.includes(part as never) ? name : null',
    'whether a part takes the name or the slot key',
  ),
  // ── the link layer: the two swaps, and the two readers they stand on ──────────────────────────
  {
    anchor: '? value.replace(',
    assumes:
      'the fallback inside the link is spelled `--jumi-animation-name`, and the link itself is whatever `wholeLink` matches — any spacing',
    breakable:
      'no for whitespace or escaping: the definition it embeds is an identifier. A different fallback would miss, which is a refusal to add the link rather than a link that resolves wrong',
    class: 'tolerant',
    file: carriers,
    recovers:
      'whether this position should read its selection ahead of the definition — the only output a timing phrase has',
    serialization:
      'was **yes**, and this is one of the two lines the audit was opened for: written with `, ` against sheet text, it matched nothing under a minifier and the phrase silently stopped applying',
    structural:
      'the entries are in hand when the value is built, so this could be construction instead of a search over the built string',
  },
  {
    anchor: 'text.replaceAll(',
    assumes: 'the seven part links are spelled by `linkHead` — any spacing',
    breakable: 'no, since the anchor became a pattern',
    class: 'tolerant',
    file: carriers,
    recovers: 'the author’s name as the outermost link of each shorthand part',
    serialization:
      'was **yes** — the shipped defect: seven parts kept the slot-keyed address while the name link beside them kept its label',
    structural: 'same as above: the parts are entries here too',
  },
  tolerant(
    carriers,
    'const match = /^var\\(\\s*--jumi-(.+?)-animation-name\\b/.exec(entry.trim())',
    'the slot a composition entry addresses',
    'matched, not prefixed — `\\s*` inside the parens — after measuring that a prefix test dropped every position',
  ),
  tolerant(
    carriers,
    'const opened = /^var\\(\\s*--jumi-slot-/.exec(text)',
    'the instance a staged entry addresses, read from its length prefix',
    'matched, not prefixed, for the same measured reason; the rest of the parse is arithmetic, not a search',
  ),
  // ── the one textual read that is sound because it wrote its own separator ─────────────────────
  tolerant(
    carriers,
    "const [address, ...rest] = declaration.value.trim().split(' ')",
    'the action and the phrase a segment record carries',
    'the single space it wrote itself as a token separator — which no serializer removes, only tightens toward. Measured: `minified` and `tight-comma` both leave the phrase applying',
  ),
  // ── a record’s offsets: a selector, so whitespace is decorative between the commas ────────────
  tolerant(
    carriers,
    "const offsets = selector.split(',').map(part => {",
    'the numeric offsets a keyframe selector names',
    'commas separate the list and each part is trimmed — a keyframe offset cannot contain either',
  ),
  // ── the marker readers — hardened, and reachable by the differential ────────────────────────────────────────
  tolerant(
    transitions,
    'new RegExp(`:where',
    'the side, the identity or the refusal a `:where(…)` marker carries',
    'whitespace inside the parens — `\\s*` on both sides of the marker body — and none before the `(`, which is not valid CSS',
  ),
  // The two pattern definitions that stood here are gone as entries, and not as an omission: their code is
  // `markerPattern`'s body now, which carries no operation a line-based scan can see.

  {
    anchor: 'const refused = markerPattern(',
    assumes:
      'the refused-marker pattern, which anchors on `:where(` the same way',
    breakable: 'no: measured green under every serializer',
    class: 'tolerant',
    file: transitions,
    recovers: 'the reason a staged rule was refused, so the message names it',
    serialization: 'no for every serializer measured here',
    structural: 'same as above',
  },
  {
    anchor: 'const marker = MARKER.exec(selector)',
    assumes:
      'nothing of its own — it applies `MARKER`, and inherits that answer',
    breakable: 'no — it applies `MARKER`, which `markerPattern` builds',
    class: 'tolerant',
    file: transitions,
    recovers: 'the same three facts, at the call site',
    serialization: 'no for every serializer measured here',
    structural: 'same as above',
  },
  {
    anchor: 'STAGING_SHAPE.test(selector)',
    assumes: 'nothing of its own — it applies `STAGING_SHAPE`',
    breakable: 'no — it applies `STAGING_SHAPE`, which `markerPattern` builds',
    class: 'tolerant',
    file: transitions,
    recovers: 'whether a rule is staging, at the call site',
    serialization: 'no for every serializer measured here',
    structural: 'same as above',
  },
  // ── inferred: character walks over selectors, all escape-aware ────────────────────────────────
  inferred(
    'src/helpers/carriers/animation-range.ts',
    "if ('.:#[]>+~ '.includes(selector[index])) return selector.slice(1, index)",
    'where a class token ends, with escapes stepped over rather than through',
    'a tokenizer: the walk stops at the first unescaped character that ends a class',
  ),
  inferred(
    'src/helpers/carriers/animation-range.ts',
    "if (token.startsWith('\\\\:', index)) {",
    'a variant boundary, which is an escaped colon',
    'as above — the escape handling is the walk’s',
  ),
  inferred(
    'src/helpers/carriers/animation-range.ts',
    "source: classToken(selector).replace(/\\\\(.)/g, '$1'),",
    'the author’s own class, for a message',
    'a tokenizer, as above',
  ),
  inferred(
    transitions,
    "const body = selector.replace(/^\\./, '')",
    'the author’s candidate with the leading dot removed',
    'a tokenizer, and the walk that follows it is the same escape-aware shape',
  ),
  // ── a convention read textually, and the one place it can be wrong ────────────────────────────
  tolerant(
    'src/helpers/carriers/animation-range.ts',
    "const value = innermost.match![1].replace(/_/g, ' ')",
    'the range an author wrote, from the class Tailwind escaped',
    'Tailwind’s `_`-for-space convention. Not a serializer’s doing — but it is textual, and an escaped `\\\\_` (a literal underscore) becomes a space',
  ),
  // ── the phrase grammar: the author’s candidate, with its whitespace written out ───────────────
  tolerant(
    'src/core/index.ts',
    'if (!/^\\s*\\d+(?:\\.\\d+)?(?:\\s*,\\s*\\d+(?:\\.\\d+)?)*\\s*:/.test(value)) return',
    'that a candidate is a timing phrase at all',
    'nothing unstated: `\\s*` is spelled at every join',
  ),
  tolerant(
    'src/core/index.ts',
    "const colon = frame.indexOf(':')",
    'where the offsets end and the value begins',
    'the separator the grammar fixed, not a value',
  ),
  tolerant(
    'src/core/index.ts',
    "for (const part of frame.slice(0, colon).split(',')) {",
    'the offsets a phrase frame names',
    'commas separate offsets, and each part is trimmed',
  ),
  // ── author-facing values: Tailwind’s spelling, not a sheet’s ─────────────────────────────────
  tolerant(
    'src/properties/tween.ts',
    "css(name, value.split(/\\s+/).join(', '))",
    'the arguments of a multi-argument transform function',
    'whitespace separates the arguments — and `\\s+` is what reads it',
  ),
  tolerant(
    'src/helpers/create/theme.ts',
    'return numeric.test(name) ? value : `var(--${target.namespace}-${name})`',
    'whether a theme name resolves through a variable',
    'an identifier, tested numerically',
  ),
  tolerant(
    'src/helpers/paint/index.ts',
    'if (/^color-mix\\(/i.test(value)) {',
    'that a value is a colour mix worth resolving',
    'a prefix the author wrote, in a value the author typed — not sheet text',
  ),
  tolerant(
    'src/helpers/paint/index.ts',
    'const match = value.match(',
    'the space, the two colours and their weights',
    '`\\s+` after `in`, and `[^,]*` for the rest — spelled out',
  ),
  tolerant(
    'src/helpers/paint/index.ts',
    'const matchEnd = part.match(/^(.*?)\\s+(\\d+(?:\\.\\d+)?)%$/)',
    'a colour and its weight, written weight-last',
    '`\\s*` and `\\s+`, spelled out',
  ),
  tolerant(
    'src/helpers/paint/index.ts',
    'const matchStart = part.match(/^(\\d+(?:\\.\\d+)?)%\\s+(.*)$/)',
    'a colour and its weight, written weight-first',
    'the same, against the other spelling the spec allows',
  ),
  tolerant(
    'src/helpers/register/index.ts',
    '/^["\']?tailwindcss(\\/[\\w.-]+)*["\']?(\\s|$)/.test(atRule.params.trim())',
    'whether an `@plugin` names Tailwind itself',
    'a leading quote and a trailing boundary, both optional',
  ),
  tolerant(
    'src/helpers/register/index.ts',
    "const value = params.trim().replace(/^[\"']|[\"']$/g, '')",
    'the specifier an `@plugin` names',
    'quotes around it, which the pattern makes optional',
  ),
  tolerant(
    'src/helpers/register/index.ts',
    'return value === specifier || /jumi/i.test(value)',
    'whether the specifier is Jumi',
    'a substring, case-insensitively',
  ),
  tolerant(
    'src/vite.ts',
    "if (!id.includes('.css')) return null",
    'whether a module is a stylesheet',
    'a substring of a module id — presence, not shape',
  ),
  tolerant(
    'src/vite.ts',
    "if (!code.includes(stagingMarker) && !code.includes('jumi-vt-'))",
    'whether a stylesheet carries Jumi’s staging',
    'presence of a marker, which no serializer rewrites',
  ),
  tolerant(
    'src/vite.ts',
    "if (!id.includes('.css') || !code.includes('tailwindcss')) return null",
    'whether to process a module at all',
    'presence, as above',
  ),
  tolerant(
    'src/helpers/carriers/instance.ts',
    "const cut = key.indexOf('-')",
    'the length prefix a named instance key carries',
    'a hyphen inside an emitted variable name, where no whitespace can occur',
  ),
  // ── identifiers, property names and arrays: the safe majority ────────────────────────────────
  safe(
    carriers,
    "text.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')",
    'an escaped literal, for a pattern',
  ),
  safe(
    carriers,
    'ACTIVATED_SLOT.test(candidate.prop),',
    'whether a declaration names a definition',
  ),
  safe(
    carriers,
    'ownDeclarations(rule).some(declaration => pattern.test(declaration.prop))',
    'which rule carried the payload',
  ),
  safe(
    carriers,
    'const activation = own.find(node => ACTIVATED_SLOT.test(node.prop))',
    'the activation a rule declares',
  ),
  safe(
    carriers,
    'const base = ACTIVATED_SLOT.exec(activation.prop)?.[1]',
    'the definition base an activation names',
  ),
  safe(
    carriers,
    'definition.startsWith(`jumi-${address}-`)',
    'whether a definition belongs to an attribute',
  ),
  safe(
    carriers,
    'const named = own.find(node => LABELLED_SLOT.test(node.prop))?.value',
    'the name a rule installed',
  ),
  safe(
    carriers,
    'if (!SEGMENT_RECORD.test(declaration.prop)) continue',
    'whether a declaration is a phrase record',
  ),
  safe(
    carriers,
    'const match = ACTIVATED_SLOT.exec(declaration.prop)',
    'the definition a declaration activates',
  ),
  safe(
    carriers,
    'declaration.prop.startsWith(stagingMarker),',
    'which declarations are staging',
  ),
  safe(
    carriers,
    'if (SHADOWED_NAME.test(declaration.prop)) {',
    'whether a name shadows a property address',
  ),
  safe(
    carriers,
    'if (!REFUSED_NAME.test(declaration.prop)) continue',
    'whether a name cannot be written',
  ),
  safe(
    carriers,
    "if (name.startsWith('--')) {",
    'whether a payload entry is a custom property',
  ),
  safe(carriers, "name.startsWith('--') ||", 'as above, in the second pass'),
  safe(
    carriers,
    'SHORTHAND.includes(name) ||',
    'whether a payload entry is a shorthand part',
  ),
  safe(
    carriers,
    'AFTER_SHORTHAND.includes(name)',
    'whether a payload entry is written after the shorthand',
  ),
  safe(
    'src/helpers/carriers/animation-range.ts',
    'ACTIVATED_SLOT.test(node.prop),',
    'whether a rule activates a slot',
  ),
  safe(
    'src/helpers/carriers/animation-range.ts',
    "ACTIVATED_SLOT.exec(activations[0].prop)?.[1] ?? '',",
    'the base that activation names',
  ),
  safe(
    'src/helpers/carriers/animation-range.ts',
    "return value.startsWith('[') && value.endsWith(']')",
    'whether an author wrote a bracketed value',
  ),
  safe(
    'src/helpers/carriers/animation-range.ts',
    '(RANGE_NAMES as readonly string[]).includes(token)',
    'whether a token names a range keyword',
  ),
  safe(
    'src/helpers/carriers/animation-range.ts',
    'const isLength = (token: string) => LENGTH_PERCENTAGE.test(token)',
    'whether a token is a length or percentage',
  ),
  safe(
    'src/helpers/carriers/animation-range.ts',
    'const tokens = range.trim().split(/\\s+/).filter(Boolean)',
    'the tokens of an accepted range',
  ),
  safe(
    transitions,
    'conditions.filter(condition => !JUMI_OWNED_QUERY.test(condition.params))',
    'whether a condition is one Jumi owns',
  ),
  safe(
    transitions,
    'REFUSED_QUERY.test(condition.params),',
    'whether a condition contradicts Jumi’s policy',
  ),
  safe(
    transitions,
    "const separator = key.indexOf(':')",
    'where a key’s side ends and its identity begins',
  ),
  safe(
    'src/core/index.ts',
    'const slot = /^--jumi-(.+)-animation-name$/.exec(name)?.[1]',
    'the slot a variable names',
  ),
  safe(
    'src/helpers/carriers/instance.ts',
    '.map(candidate => LABELLED_SLOT.exec(candidate.prop)?.[1])',
    'the names a rule installed',
  ),
  safe(
    'src/helpers/create/theme.ts',
    'if (!numeric.test(name)) return null',
    'whether a theme name is a literal',
  ),
  safe(
    'src/helpers/create/theme.ts',
    'if (!supplied || !target || target.literal?.includes(name)) return value',
    'whether a name is already literal',
  ),
]

const files = execFileSync('git', ['ls-files', 'src'], {
  cwd: root,
  encoding: 'utf8',
})
  .split('\n')
  .filter(
    name => name.endsWith('.ts') && !name.endsWith('.test.ts') && name.length,
  )

const candidates = []

for (const file of files) {
  const source = readFileSync(path.join(root, file), 'utf8').split('\n')

  source.forEach((line, index) => {
    if (!OPERATIONS.test(line)) return
    if (!CSS_TEXT.test(line)) return

    candidates.push({ anchor: anchor(line), file, line: index + 1 })
  })
}

/**
 * Anchors are compared with their backslashes removed, and by prefix.
 *
 * Both, and both were learned by trying the strict version first. An anchor is a **documented** line, so a
 * registry that has to reproduce that line's escaping exactly is a copy of the thing it audits — four
 * entries here were copies with the copy's mistakes in them. And an anchor is truncated at 74 characters,
 * so an entry for a long line would have to reproduce the truncation too. Flattened and prefixed, an entry
 * still notices what matters: if the line changes, the prefix stops matching.
 */
const loose = text => text.replace(/\\/g, '')

const classify = candidate =>
  registry.find(
    entry =>
      entry.file === candidate.file &&
      loose(candidate.anchor).startsWith(loose(entry.anchor)),
  )

const known = new Map(
  registry.map(entry => [`${entry.file}\u0000${entry.anchor}`, entry]),
)
const seen = new Set()
const unregistered = []
const stale = []
const counts = new Map()

for (const candidate of candidates) {
  const entry = classify(candidate)
  const key = entry
    ? `${entry.file}\u0000${entry.anchor}`
    : `${candidate.file}\u0000${candidate.anchor}`

  seen.add(key)

  if (!entry) {
    unregistered.push(candidate)

    continue
  }

  counts.set(entry.class, (counts.get(entry.class) ?? 0) + 1)
}

for (const [key, entry] of known) if (!seen.has(key)) stale.push(entry)

if (process.argv.includes('--list')) {
  for (const candidate of candidates)
    console.log(
      `${candidate.file}:${candidate.line}\n    ${candidate.anchor}\n    ${
        known.get(`${candidate.file}\u0000${candidate.anchor}`)?.class ??
        'UNREGISTERED'
      }`,
    )

  console.log(
    `\n${candidates.length} candidate${candidates.length === 1 ? '' : 's'} in ${files.length} files · ${known.size} registered`,
  )

  process.exit(0)
}

console.log(
  `Serialized-text rewrites in src/ — ${candidates.length} candidate${candidates.length === 1 ? '' : 's'} in ${files.length} files`,
)
console.log(
  `  ${['structural', 'tolerant', 'spacing', 'inferred']
    .map(name => `${name} ${counts.get(name) ?? 0}`)
    .join(' · ')}\n`,
)

for (const candidate of unregistered)
  console.error(
    `✗ unregistered: ${candidate.file}:${candidate.line}\n    ${candidate.anchor}\n    Classify it in the registry — a rewrite nobody classified is the state this file exists to prevent.`,
  )

for (const entry of stale)
  console.log(
    `· entry without a line: ${entry.file} — ${entry.anchor.slice(0, 56)}\n    Either the line was rewritten, or it stopped being a candidate at all — a pattern moving into a\n    shared helper does that. Re-read it: an entry that matches nothing documents nothing.`,
  )

if (unregistered.length) process.exit(1)

console.log(
  '✓ every rewrite against serialized CSS is registered and classified',
)
