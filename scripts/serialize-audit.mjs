#!/usr/bin/env node
/**
 * Semantic text rewrites over serialized CSS — the census, and its classification.
 *
 * A defect proved Jumi's compiler path can feed the carrier pass CSS in more than one serialization form,
 * and that at least one lookup depended on the exact form. The question this answers is not "is that regex
 * safe" but "how many places assume something about serialized text".
 *
 * It is a **registry, not a linter**. Nothing here can decide whether a `replace` is semantically sound;
 * only a reader can, and having decided, only a registry keeps the decision alive. So the scan finds every
 * candidate, every candidate must be claimed by exactly one entry below, and every entry must claim at
 * least one — a candidate that is missing, or an entry that claims nothing, fails.
 *
 * ## How an entry identifies a line
 *
 * By **`file` + `symbol` + `contains`**, resolved from the source at run time:
 *
 *   { file, symbol: 'namedHoist', contains: 'replaceAll(', class: 'tolerant' }
 *
 * The first version identified lines by *their own text* — a truncated copy of the source — which meant an
 * entry for a regex-heavy line carried that line's escaping. Transcribing it was both painful and
 * dangerous: a miscount between two and four backslashes produced an entry that classified nothing,
 * silently, twice in one session. A descriptor cannot make that mistake, because it never reproduces the
 * source. Ask instead whether the entry would still find its line after someone re-indents or re-wraps it;
 * that is the property this format exists to have, and `--selftest` measures it directly.
 *
 * `contains` is a short fragment — an operation name, a callee, a variable — and must not span a line
 * break, because a fragment that does would be a small copy of the source again. It is omitted only when
 * the symbol holds exactly one candidate, which the run asserts.
 *
 * ## The buckets
 *
 * `structural` — identifiers, property names, arrays. Cannot be reached by a serializer.
 * `tolerant`   — meant to be text, and written for a serializer (`\s+`, trimmed parts).
 * `spacing`    — depends on how something happened to be written. **Asserted to be zero**: this is the
 *                bucket the shipped defect came from, and a new entry here is a decision, not a detail.
 * `inferred`   — recovers structure by reading characters. Sound where escape-aware, and the bucket a
 *                tokenizer would replace; acceptable, but it has to be named.
 *
 *   node scripts/serialize-audit.mjs            verify the registry against the source
 *   node scripts/serialize-audit.mjs --list     print every candidate with its symbol and class
 *
 * Scoped to `src/`, minus tests: the shipped pass, which is what reads sheets a build produced. The studio
 * parses CSS text too, and is deliberately out of scope — noted rather than silently skipped, because "not
 * audited" and "audited and fine" are different claims.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { symbolAt } from './lib/symbols.mjs'

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
 * Whether a line is plausibly about CSS text, rather than arrays, ids or DOM classes.
 *
 * Transparent, and deliberately generous: it decides what gets *claimed* as audited, so a line it misses is
 * a line nobody said was fine. Widening it is the safe direction; narrowing it is how an audit starts lying.
 */
const CSS_TEXT =
  /value|prop|selector|declaration|params|\bcss\b|entry|\btext\b|\brule\b|token|frame|range|slot|staging|var\(|--jumi|\bclass\b|marker|label|\bpart\b|\bkey\b|\bname\b|definition|address/

const carriers = 'src/helpers/carriers/index.ts'
const instance = 'src/helpers/carriers/instance.ts'
const range = 'src/helpers/carriers/animation-range.ts'
const theme = 'src/helpers/create/theme.ts'
const transitions = 'src/helpers/carriers/view-transition.ts'

/** A rewrite whose target is an identifier, a property name or an array — never serialized text. */
const safe = (file, symbol, contains, recovers) => ({
  assumes:
    'nothing about spacing: the target is an identifier, a property name or an array',
  breakable: 'no',
  class: 'structural',
  contains,
  file,
  recovers,
  serialization: 'no',
  structural: 'n/a',
  symbol,
})

/** Text that is meant to be text, and survives a serializer because it was written for one. */
const tolerant = (file, symbol, contains, recovers, assumes) => ({
  assumes,
  breakable: 'no',
  class: 'tolerant',
  contains,
  file,
  recovers,
  serialization: 'no',
  structural: 'n/a',
  symbol,
})

/** Recovers structure by reading characters rather than by matching a pattern. */
const inferred = (file, symbol, contains, recovers, structural) => ({
  assumes:
    'the characters of a selector or a variable name, read one at a time and escape-aware',
  breakable: 'no',
  class: 'inferred',
  contains,
  file,
  recovers,
  serialization: 'no',
  structural,
  symbol,
})

const registry = [
  // ── the phrase grammar: the author's candidate, with its whitespace written out ───────────────
  tolerant(
    'src/core/index.ts',
    'parsePhrase',
    '.test(value))',
    'that a candidate is a timing phrase at all',
    'nothing unstated: `\\s*` is spelled at every join',
  ),
  tolerant(
    'src/core/index.ts',
    'parsePhrase',
    "indexOf(':')",
    'where the offsets end and the value begins',
    'the separator the grammar fixed, not a value',
  ),
  tolerant(
    'src/core/index.ts',
    'parsePhrase',
    "split(',')",
    'the offsets a phrase frame names',
    'commas separate offsets, and each part is trimmed',
  ),
  safe(
    'src/core/index.ts',
    'carriedByShorthand',
    "startsWith('animation-')",
    'which parts the shorthand carries',
  ),
  safe(
    'src/core/index.ts',
    'carriedByShorthand',
    'includes(part)',
    'which parts it cannot carry',
  ),
  safe(
    'src/core/index.ts',
    'addressableName',
    '.test(name)',
    'whether a name can be written into a custom-property segment at all',
  ),
  safe(
    'src/core/index.ts',
    'createJumiModel',
    '.exec(name)',
    'the slot a variable names',
  ),
  safe(
    'src/core/index.ts',
    'createJumiModel',
    'includes(part as never)',
    'whether a part takes the name or the slot key',
  ),
  {
    assumes:
      'that a composition spells a slot as `var(--jumi-<component>` with the delimiter — `,` or `)` — immediately after the name, and that a slot’s own fallback nests at most one level',
    breakable:
      'only against a spelling Jumi does not produce. The text searched is the composition template this file builds in memory a few lines above, not a stylesheet, so no serializer stands between the two; and the lookahead is what stops a longer name that merely starts the same way (`--jumi-matrix` beside `--jumi-matrix-3d`) from being hooked by accident',
    class: 'tolerant',
    // The candidate the scan finds is the operation; the pattern it carries is the next line of the same
    // statement, which is what the lookahead above is describing. Worth knowing when reading the entry:
    // the audit is line-based, so a pattern on a line of its own is not a candidate at all.
    contains: 'value.replaceAll(',
    file: 'src/core/index.ts',
    recovers:
      'which slot a frame reads frame-first, so a phrase addressing one component of a composition moves it',
    serialization:
      'no — the input is Jumi’s own construction. The hazard is the mirror image of the `namedHoist` entries: those search sheet text a minifier had rewritten, this one searches a string built here, and the two must not be filed under one assumption',
    structural:
      'the slots are known when the composition is built, so this could be construction — the substitution could happen as the template is assembled rather than as a search over the assembled string, which is the migration this entry exists to point at',
    symbol: 'createJumiModel',
  },

  // ── a range: selector and value grammar, read from an author's class ─────────────────────────
  inferred(
    range,
    'classToken',
    '.:#[]>+~',
    'where a class token ends, with escapes stepped over rather than through',
    'a tokenizer: the walk stops at the first unescaped character that ends a class',
  ),
  inferred(
    range,
    'segments',
    'startsWith(',
    'a variant boundary, which is an escaped colon',
    'as above — the escape handling is the walk’s',
  ),
  tolerant(
    range,
    'rangeFromSelector',
    'replace(/_/g,',
    'the range an author wrote, from the class Tailwind escaped',
    'Tailwind’s `_`-for-space convention. Not a serializer’s doing — but it is textual, and an escaped `\\_` (a literal underscore) becomes a space. Probed: the value that reaches `rangeAccepted` is then refused, not mis-read (`scripts/spike-underscore.mjs`)',
  ),
  safe(
    range,
    'rangeFromSelector',
    "startsWith('[')",
    'whether an author wrote a bracketed value',
  ),
  safe(range, 'isName', 'RANGE_NAMES', 'whether a token names a range keyword'),
  safe(
    range,
    'isName',
    'LENGTH_PERCENTAGE.test(token)',
    'whether a token is a length or percentage',
  ),
  safe(
    range,
    'rangeAccepted',
    'range.trim().split(',
    'the tokens of an accepted range',
  ),
  safe(
    range,
    'rangeReadings',
    'ACTIVATED_SLOT.test(node.prop)',
    'whether a rule activates a slot',
  ),
  safe(
    range,
    'rangeReadings',
    'activations[0].prop',
    'the base that activation names',
  ),
  inferred(
    range,
    'rangeReadings',
    'classToken(selector).replace(',
    'the author’s own class, for a message',
    'a tokenizer, as above',
  ),

  // ── the link layer: the two swaps, and the two readers they stand on ─────────────────────────
  {
    assumes:
      'the fallback inside the link is spelled `--jumi-animation-name`, and the link itself is whatever `wholeLink` matches — any spacing',
    breakable:
      'no for whitespace or escaping: the definition it embeds is an identifier. A different fallback would miss, which is a refusal to add the link rather than a link that resolves wrong',
    class: 'tolerant',
    contains: 'value.replace(',
    file: carriers,
    recovers:
      'whether this position should read its selection ahead of the definition — the only output a timing phrase has',
    serialization:
      'was **yes**, and this is one of the two lines the audit was opened for: written with `, ` against sheet text, it matched nothing under a minifier and the phrase silently stopped applying',
    structural:
      'the entries are in hand when the value is built, so this could be construction instead of a search over the built string',
    symbol: 'namedHoist',
  },
  {
    assumes: 'the seven part links are spelled by `linkHead` — any spacing',
    breakable: 'no, since the anchor became a pattern',
    class: 'tolerant',
    contains: 'replaceAll(',
    file: carriers,
    recovers: 'the author’s name as the outermost link of each shorthand part',
    serialization:
      'was **yes** — the shipped defect: seven parts kept the slot-keyed address while the name link beside them kept its label',
    structural: 'same as above: the parts are entries here too',
    symbol: 'namedHoist',
  },
  tolerant(
    carriers,
    'referencedSlot',
    '.exec(entry.trim())',
    'the slot a composition entry addresses',
    'matched, not prefixed — `\\s*` inside the parens — after measuring that a prefix test dropped every position',
  ),
  tolerant(
    carriers,
    'linkedSlot',
    '.exec(text)',
    'the instance a staged entry addresses, read from its length prefix',
    'matched, not prefixed, for the same measured reason; the rest of the parse is arithmetic, not a search',
  ),
  safe(
    carriers,
    'namedHoist',
    'ACTIVATED_SLOT.test(candidate.prop)',
    'whether a declaration names a definition',
  ),
  safe(
    carriers,
    'escapePattern',
    '[.*+?^',
    'an escaped literal, for a pattern',
  ),
  safe(
    carriers,
    'activates',
    'pattern.test(declaration.prop)',
    'which rule carried the payload',
  ),
  tolerant(
    carriers,
    'keyframeOffsets',
    "selector.split(',')",
    'the numeric offsets a keyframe selector names',
    'commas separate the list and each part is trimmed — a keyframe offset cannot contain either',
  ),
  safe(
    carriers,
    'addressedInstances',
    'ACTIVATED_SLOT.test(node.prop)',
    'whether a rule activates a slot',
  ),
  safe(
    carriers,
    'addressedInstances',
    'ACTIVATED_SLOT.exec(activation.prop)',
    'the definition base an activation names',
  ),
  safe(
    carriers,
    'addressedInstances',
    'jumi-${address}',
    'whether a definition belongs to an attribute',
  ),
  safe(
    carriers,
    'addressedInstances',
    'LABELLED_SLOT.test(',
    'the name a rule installed',
  ),
  safe(
    carriers,
    'segmentSelections',
    'SEGMENT_RECORD.test(',
    'whether a declaration is a phrase record',
  ),
  tolerant(
    carriers,
    'segmentSelections',
    ".trim().split(' ')",
    'the action and the phrase a segment record carries',
    'the single space it wrote itself as a token separator — which no serializer removes, only tightens toward. Measured: `minified` and `tight-comma` both leave the phrase applying',
  ),
  safe(
    carriers,
    'hoist',
    'ACTIVATED_SLOT.exec(declaration.prop)',
    'the definition a declaration activates',
  ),
  safe(
    carriers,
    'finalize',
    'startsWith(stagingMarker)',
    'which declarations are staging',
  ),
  safe(
    carriers,
    'finalize',
    'SHADOWED_NAME.test(',
    'whether a name shadows a property address',
  ),
  safe(
    carriers,
    'finalize',
    'REFUSED_NAME.test(',
    'whether a name cannot be written',
  ),
  safe(
    carriers,
    'finalize',
    "name.startsWith('--')",
    'whether a payload entry is a custom property',
  ),
  safe(
    carriers,
    'finalize',
    'SHORTHAND.includes(name) ||',
    'whether a payload entry is a shorthand part',
  ),
  safe(
    carriers,
    'finalize',
    'AFTER_SHORTHAND.includes(',
    'whether a payload entry is written after the shorthand',
  ),

  // ── instance keys: emitted text, parsed by length rather than searched ────────────────────────
  tolerant(
    instance,
    'parseInstanceKey',
    "key.indexOf('-')",
    'the length prefix a named instance key carries',
    'a hyphen inside an emitted variable name, where no whitespace can occur',
  ),
  safe(
    instance,
    'instanceKeys',
    'LABELLED_SLOT.exec(',
    'the names a rule installed',
  ),

  // ── the marker readers: one shared assumption, hardened, and reachable by the differential ────
  tolerant(
    transitions,
    'markerPattern',
    ':where',
    'the side, the identity or the refusal a `:where(…)` marker carries',
    'whitespace inside the parens — `\\s*` on both sides of the marker body — and none before the `(`, which is not valid CSS',
  ),
  tolerant(
    transitions,
    'readStaged',
    'markerPattern(',
    'the reason a staged rule was refused, so the message names it',
    'nothing of its own — it applies what `markerPattern` builds',
  ),
  tolerant(
    transitions,
    'readStaged',
    'MARKER.exec(',
    'the side, the identity and the source element of a staged rule',
    'nothing of its own — it applies `MARKER`, which `markerPattern` builds',
  ),
  tolerant(
    transitions,
    'isStagingSelector',
    'STAGING_SHAPE.test(',
    'whether a rule is staging at all, so a marker this pass cannot read still leaves the cascade',
    'nothing of its own — it applies `STAGING_SHAPE`, which `markerPattern` builds',
  ),
  safe(
    transitions,
    'kept',
    'JUMI_OWNED_QUERY.test(',
    'whether a condition is one Jumi owns',
  ),
  safe(
    transitions,
    'viewTransitionProducts',
    'REFUSED_QUERY.test(',
    'whether a condition contradicts Jumi’s policy',
  ),
  safe(
    transitions,
    'viewTransitionProducts',
    "key.indexOf(':')",
    'where a key’s side ends and its identity begins',
  ),
  inferred(
    transitions,
    'authored',
    'replace(/^\\./',
    'the author’s candidate with the leading dot removed',
    'a tokenizer, and the walk that follows it is the same escape-aware shape',
  ),

  // ── author-facing values: Tailwind’s spelling, not a sheet’s ─────────────────────────────────
  tolerant(
    'src/properties/tween.ts',
    'getMatchTween',
    'join(',
    'the arguments of a multi-argument transform function',
    'whitespace separates the arguments — and `\\s+` is what reads it',
  ),
  tolerant(
    theme,
    'representation',
    'numeric.test(name) ?',
    'whether a theme name resolves through a variable',
    'an identifier, tested numerically',
  ),
  safe(
    theme,
    'spacingRepresentation',
    '!numeric.test(name))',
    'whether a spacing name is a literal',
  ),
  safe(
    theme,
    'representation',
    'target.literal?.includes(name)',
    'whether a name is already literal',
  ),
  tolerant(
    'src/helpers/paint/index.ts',
    'toPaintHex',
    '/^color-mix',
    'that a value is a colour mix worth resolving',
    'a prefix the author wrote, in a value the author typed — not sheet text',
  ),
  tolerant(
    'src/helpers/paint/index.ts',
    'resolveColorMix',
    'value.match(',
    'the space, the two colours and their weights',
    '`\\s+` after `in`, and `[^,]*` for the rest — spelled out',
  ),
  tolerant(
    'src/helpers/paint/index.ts',
    'splitColorWeight',
    'matchEnd',
    'a colour and its weight, written weight-last',
    '`\\s*` and `\\s+`, spelled out',
  ),
  tolerant(
    'src/helpers/paint/index.ts',
    'splitColorWeight',
    'matchStart',
    'a colour and its weight, written weight-first',
    'the same, against the other spelling the spec allows',
  ),
  tolerant(
    'src/helpers/register/index.ts',
    'isEntry',
    'tailwindcss',
    'whether an `@plugin` names Tailwind itself',
    'a leading quote and a trailing boundary, both optional',
  ),
  tolerant(
    'src/helpers/register/index.ts',
    'isEntry',
    'params.trim().replace(',
    'the specifier an `@plugin` names',
    'quotes around it, which the pattern makes optional',
  ),
  tolerant(
    'src/helpers/register/index.ts',
    'isEntry',
    'specifier ||',
    'whether the specifier is Jumi',
    'a substring, case-insensitively',
  ),

  // ── module source: presence tests, not shape ─────────────────────────────────────────────────
  tolerant(
    'src/vite.ts',
    'jumiFinalizer',
    "id.includes('.css')",
    'whether a module is a stylesheet',
    'a substring of a module id — presence, not shape',
  ),
  tolerant(
    'src/vite.ts',
    'jumiFinalizer',
    'code.includes(stagingMarker)',
    'whether a stylesheet carries Jumi’s staging',
    'presence of a marker, which no serializer rewrites',
  ),
  tolerant(
    'src/vite.ts',
    'jumiRegister',
    "code.includes('tailwindcss')",
    'whether to process a module at all',
    'presence, as above',
  ),
]

/** Every candidate, with the symbol it sits in. */
const candidates = source => {
  const lines = source.split('\n')
  const found = []

  lines.forEach((line, index) => {
    if (!OPERATIONS.test(line)) return
    if (!CSS_TEXT.test(line)) return

    const offset = lines.slice(0, index).join('\n').length

    found.push({
      file: '',
      line: index + 1,
      symbol: symbolAt(source, offset),
      text: line.trim(),
    })
  })

  return found
}

const files = execFileSync('git', ['ls-files', 'src'], {
  cwd: root,
  encoding: 'utf8',
})
  .split('\n')
  .filter(
    name => name.endsWith('.ts') && !name.endsWith('.test.ts') && name.length,
  )

const sources = new Map(
  files.map(file => [file, readFileSync(path.join(root, file), 'utf8')]),
)

/**
 * Which candidates an entry claims.
 *
 * The whole match is `file` + `symbol` + an optional `contains`. No line numbers, no copied text: the entry
 * says *where the operation lives*, and the source says *what it is*.
 */
const claimsOf = (entry, all) =>
  all.filter(
    candidate =>
      candidate.file === entry.file &&
      candidate.symbol === entry.symbol &&
      (!entry.contains || candidate.text.includes(entry.contains)),
  )

const census = all => {
  const tally = new Map()

  for (const entry of registry) {
    const claims = claimsOf(entry, all).length

    tally.set(entry.class, (tally.get(entry.class) ?? 0) + claims)
  }

  return tally
}

const scan = all => {
  const doubled = []
  const empty = []
  const unclaimed = []

  for (const candidate of all) {
    const matching = registry.filter(
      entry => claimsOf(entry, [candidate]).length === 1,
    )

    if (!matching.length) unclaimed.push(candidate)
    else if (matching.length > 1) doubled.push({ candidate, matching })
  }

  for (const entry of registry)
    if (!claimsOf(entry, all).length) empty.push(entry)

  return { doubled, empty, unclaimed }
}

/** The candidate set, with each file attached. */
const collect = () => {
  const all = []

  for (const [file, source] of sources)
    for (const candidate of candidates(source)) all.push({ ...candidate, file })

  return all
}

const found = collect()
const { doubled, empty, unclaimed } = scan(found)
const tally = census(found)

if (process.argv.includes('--list')) {
  for (const candidate of found) {
    const entry = registry.find(
      entry => claimsOf(entry, [candidate]).length === 1,
    )

    console.log(
      `${candidate.file}:${candidate.line} | ${candidate.symbol} | ${
        entry?.class ?? 'UNCLAIMED'
      } | ${candidate.text.slice(0, 96)}`,
    )
  }

  console.log(`\n${found.length} candidates · ${registry.length} entries`)

  process.exit(0)
}

console.log(
  `Serialized-text rewrites in src/ — ${found.length} candidate${found.length === 1 ? '' : 's'} in ${files.length} files`,
)
console.log(
  `  ${['structural', 'tolerant', 'spacing', 'inferred']
    .map(name => `${name} ${tally.get(name) ?? 0}`)
    .join(' · ')}\n`,
)

for (const candidate of unclaimed)
  console.error(
    `✗ unclaimed: ${candidate.file}:${candidate.line} (${candidate.symbol})\n    ${candidate.text.slice(0, 96)}\n    Classify it in the registry — a rewrite nobody classified is the state this file exists to prevent.`,
  )

for (const { candidate, matching } of doubled)
  console.error(
    `✗ claimed twice: ${candidate.file}:${candidate.line} (${candidate.symbol})\n    ${matching.map(entry => `${entry.symbol} · ${entry.contains ?? '—'}`).join('\n    ')}\n    One operation, one entry: merge them, or narrow the fragments.`,
  )

for (const entry of empty)
  console.error(
    `✗ claims nothing: ${entry.file} · ${entry.symbol}${entry.contains ? ` · ${entry.contains}` : ''}\n    Either the line moved, or it stopped carrying an operation. Re-read it and re-derive the entry.`,
  )

if ((tally.get('spacing') ?? 0) > 0)
  console.error(
    `✗ ${tally.get('spacing')} spacing-sensitive rewrite${tally.get('spacing') === 1 ? '' : 's'}\n    This bucket is the shipped defect. Harden the matcher, or make the dependency a decision here.`,
  )

/**
 * The self-test: the property this registry format exists to have.
 *
 * Reformat every audited file — collapse horizontal whitespace, then re-indent every line — and require the
 * census to be identical. If a descriptor identified its line by copied text, the first perturbation would
 * find it and the second would not; if it identified it by *position*, both would pass and a re-wrap would
 * break it. So: same counts, same classes, and every entry still claiming what it claimed.
 */
const perturbed = [
  ['collapsed whitespace', text => text.replace(/[^\S\n]+/g, ' ')],
  ['re-indented', text => text.replace(/\n/g, '\n      ')],
]

let drift = 0

for (const [name, perturb] of perturbed) {
  const all = []

  for (const [file, source] of sources)
    for (const candidate of candidates(perturb(source)))
      all.push({ ...candidate, file })

  const other = census(all)

  for (const bucket of ['structural', 'tolerant', 'spacing', 'inferred']) {
    const before = tally.get(bucket) ?? 0
    const after = other.get(bucket) ?? 0

    if (before === after) continue

    drift += 1
    console.error(
      `✗ self-test, ${name}: ${bucket} counted ${before} before and ${after} after — an entry is tied to spelling rather than to a symbol`,
    )
  }
}

const hygiene = registry.filter(
  entry => entry.contains?.includes('\n') || entry.contains?.includes('  '),
)

for (const entry of hygiene)
  console.error(
    `✗ fragment spans or pads whitespace: ${entry.file} · ${entry.symbol} · ${entry.contains}\n    Keep it short and single-spaced, or it is a copy of the source again.`,
  )

if (
  unclaimed.length ||
  doubled.length ||
  empty.length ||
  drift ||
  hygiene.length
)
  process.exit(1)

console.log(
  `✓ every rewrite against serialized CSS is registered, classified, and still found after reformatting (self-test: ${perturbed.map(([name]) => name).join(' · ')})`,
)
