import { varReferences } from './var-references.mjs'

/**
 * The writer/read invariant, as a library — in **both** directions.
 *
 * The first direction is the one this file was written for: every custom property Jumi emits a read
 * for must have something that can write it, or be a level that is documented as latent. Stated as a
 * rule rather than a list, that is
 *
 *   read exists → some writer **class** must be able to satisfy it
 *
 * and a *class* is the point: the writer does not have to be in this stylesheet, it has to be
 * expressible in the language. A per-frame component lookup `var(--jumi-scale-x-<id>-0,
 * var(--jumi-scale-x))` is answered by `animate-scale-x-[0:1|100:0]` — a candidate that may simply be
 * absent from the page being compiled, which is why those reads are classified `conditional` rather
 * than dead.
 *
 * The second direction is the converse, and it was missing: for frame-scoped values it is not enough
 * that a read could be satisfied — a writer must be **consumed**:
 *
 *   authorable constituent writes a frame value → its owning composed keyframe must read it
 *
 * That is the half `bb39449` removed. It kept the first direction (no read without a writer) and
 * dropped the second, so `animate-scale-x-[0:1|100:0]` went on emitting `--jumi-scale-x-<id>-0` while
 * the composed `scale` keyframe stopped reading it — every frame resolved to the same components, and
 * both this audit and the differential stayed green, because deleting a read can only ever *satisfy* a
 * no-dead-reads check. `unconsumedWrites` below is the assertion that closes it.
 *
 * Splitting this out of the CLI is not tidiness. The differential that decides whether a dead class can
 * be removed has to identify **exactly** the same reads the audit reports, and a second copy of the
 * classification is how the two come to disagree — the failure mode this whole pass has been unpicking.
 *
 * A read is classified, in order:
 *
 *   written     something declares it (`--x: …`), so the read is answered in this stylesheet
 *   registered  an `@property` names it. Registration is not a value, but it is *intent* — the model
 *               declares the shape it is prepared to fill, and the labels in particular are registered
 *               long before any control names a motion
 *   optional    a level that is documented as absent until written, each entry naming the code that
 *               writes it
 *   conditional a per-frame component lookup, whose writer class is a constituent phrase over the same
 *               frames — named, and possibly absent from this stylesheet
 *   DEAD        none of the above: a name nothing in the model can produce
 */
import postcss from 'postcss'

/** The levels that exist only when written, each with the code that writes it. */
export const OPTIONAL = [
  [
    /^--jumi-[\w-]+-animation-(?:composition|range|timeline|delay|direction|duration|fill-mode|iteration-count|play-state|timing-function)$/,
    '`scope(...)` in `src/properties/controls.ts` — a control that named no motion',
  ],
  [
    /^--jumi-[\w-]+-animation-range$/,
    '`rangeReadings` in `src/helpers/carriers/index.ts` — the range variant, per instance key',
  ],
  [
    /^--jumi-slot-[\w-]+-animation-(?:composition|range|timeline)$/,
    'the fill in `hoist` — for slots whose key cannot spell its name (effects, composed tweens)',
  ],
  [
    /^--jumi-[\w-]+-transition-(?:property|duration|timing-function|delay|behavior)$/,
    'a transition control scoped to one property (`transition-duration-500/background-color`)',
  ],
  [
    /^--jumi-stagger-animation-(?:delay|duration|timing-function)$/,
    'the stagger rule in `src/variants/` — written by the `animate-stagger-*` utility',
  ],
]

/**
 * A read is classified from `var()` references found **structurally**, by `varReferences` — not by a
 * pattern over the value. The distinction is the whole of this file's history:
 *
 * Two shapes must be told apart by the base of the *inner* read: a **component hook**
 * (`var(--jumi-scale-x-<id>-0, var(--jumi-scale-x))`, whose base is a component, and whose writer class
 * is a constituent phrase that may simply be absent from this stylesheet) and an **outer read**
 * (`var(--jumi-outline-<id>-0, var(--jumi-outline))`, whose base is the keyframe's own property, and which
 * the phrase that owns the keyframe must have written).
 *
 * A pattern expressing that had to describe the text of a nested expression, and was wrong twice: it
 * could not see a fallback that was not a single `var()` (so correct CSS read as dead), and widening it
 * swallowed the `var(` of a hook nested inside an outer read's fallback (so 20 more correct reads read as
 * dead). Reading the value instead makes the shape of a fallback — a variable, a function call, a whole
 * chain — irrelevant to the question.
 */

/** A frame key: `<property>-<id>-<offset>`, as a phrase writes it and a keyframe reads it. */
const FRAME_KEY = /^--jumi-[\w-]+-[A-Za-z0-9]{5,8}-\d+$/

/** The names this audit is about. Every other `var()` in the sheet is somebody else's. */
const OWNED = '--jumi-'

/** The name a frame key is scoped to — `<base>` in `<base>-<id>-<offset>`. */
const frameBase = name => name.replace(/-[A-Za-z0-9]{5,8}-\d+$/, '')

/** A keyframe's own attribute, from the name it was emitted under. */
const ownerAttribute = name =>
  name.replace(/^jumi-/, '').replace(/-[A-Za-z0-9]{5,8}$/, '')

/**
 * Read a stylesheet and answer with everything the invariant needs.
 *
 * `keyframes` is tracked separately because it is what tells one class of dead read from another when a
 * gate fails at some future date: a dead name read *inside* `@keyframes` is a per-frame hook, and one
 * read anywhere else is something nobody has seen before and should be looked at directly.
 */
export const collect = css => {
  const document = postcss.parse(css)
  const written = new Set()
  const registered = new Set()
  const reads = new Map()
  const inKeyframes = new Set()
  // Frame-scoped component lookups: reads whose fallback is a *different* name from the keyframe that
  // reads them, i.e. `var(--jumi-scale-x-<id>-0, var(--jumi-scale-x))` inside `jumi-scale-<id>`. The
  // writer is a phrase addressing `scale-x`, which this stylesheet may not contain.
  const hooked = new Set()
  // Frame keys a phrase wrote, outside any keyframe: what the converse invariant holds a keyframe to.
  const frameWrites = new Set()

  const keyframeOf = node => {
    for (let parent = node.parent; parent; parent = parent.parent)
      if (parent.type === 'atrule' && /keyframes$/i.test(parent.name))
        return parent.params.trim()

    return null
  }

  document.walkDecls(node => {
    if (node.prop.startsWith('--')) written.add(node.prop)

    const owner = keyframeOf(node)
    const attribute = owner ? ownerAttribute(owner) : null

    // Written by a phrase's own rule, which is outside any keyframe: the composed keyframe is what has
    // to read it back. A frame key declared *inside* a keyframe is a different mechanism (a per-frame
    // writer) and is not part of this invariant.
    if (!owner && FRAME_KEY.test(node.prop)) frameWrites.add(node.prop)

    // Read once, structurally, and both answers taken from the one reading.
    const references = varReferences(node.value).filter(reference =>
      reference.name.startsWith(OWNED),
    )

    for (const { name } of references) {
      reads.set(name, (reads.get(name) ?? 0) + 1)
      if (owner) inKeyframes.add(name)
    }

    if (!owner) return

    // A frame-first read is a **hook** when the key it reads is scoped to a property other than the one the
    // keyframe animates — `var(--jumi-skew-x-<id>-0, …)` inside `jumi-transform-<id>` names a component,
    // whose writer class may simply be absent from this stylesheet. The read whose base *is* the keyframe's
    // own attribute is the outer read, which the phrase that owns the keyframe wrote.
    //
    // The **fallback is deliberately not part of the test**, and that is the whole of this rule. It used to
    // be: the pattern required the fallback to name the same variable the key read. An expanded
    // intermediate's fallback is its own template — `var(--jumi-skew-<id>-0, skew(var(--jumi-skew-x-…)))` —
    // so every hook of that shape read as dead the moment the shape was emitted, which is how the corpus
    // caught it. What a read falls back *to* is a different question from what the read is.
    for (const { name } of references)
      if (FRAME_KEY.test(name) && frameBase(name) !== `--jumi-${attribute}`)
        hooked.add(name)
  })

  document.walkAtRules('property', atRule =>
    registered.add(atRule.params.trim()),
  )

  return {
    document,
    frameWrites,
    hooked,
    inKeyframes,
    reads,
    registered,
    written,
  }
}

/** The class a name belongs to, or `DEAD` when nothing in the model can write it. */
export const classify = (name, { hooked, registered, written }) => {
  if (written.has(name)) return 'written'
  if (registered.has(name)) return 'registered'

  if (hooked.has(name))
    return `conditional (a phrase addressing ${frameBase(name)} over the same frames)`

  for (const [pattern, writer] of OPTIONAL)
    if (pattern.test(name)) return `optional (${writer})`

  return 'DEAD'
}

/**
 * The dead reads, normalised to the shape a refactor acts on rather than the name it happens to have.
 *
 * Only the **trailing** instance/offset pair is normalised: a hash is 5–8 characters of `[A-Za-z0-9]`
 * and an offset is digits, so the pattern is anchored at the end. Matching hash-shaped segments anywhere
 * ate `angle` out of `rotate-angle-<id>-0` — it is five letters, exactly the width of a hash — and split
 * one family across two reported shapes.
 */
export const deadReads = css => {
  const { hooked, inKeyframes, reads, registered, written } = collect(css)
  const dead = []

  for (const [name, count] of reads) {
    if (classify(name, { hooked, registered, written }) !== 'DEAD') continue

    dead.push({
      count,
      keyframes: inKeyframes.has(name),
      name,
      shape: name
        .replace(/^--jumi-/, '')
        .replace(/-[A-Za-z0-9]{5,8}(?:-\d+)?$/, '-<id>'),
    })
  }

  return dead.sort((one, two) => one.name.localeCompare(two.name))
}

/**
 * The converse: frame keys a phrase wrote that no keyframe reads.
 *
 * The shape of the defect `bb39449` introduced, expressed as an assertion rather than as a story about
 * one property. A phrase that addresses a component writes `<base>-<id>-<offset>`; the composed
 * keyframe that owns `<id>` is the only place the value can be consumed, so a key nothing reads is a
 * motion that computes but never moves — exactly the symptom, on any family.
 *
 * Reported as a *class of name* rather than a count, for the same reason the dead reads are: a gate
 * failure has to say which family lost its consumer.
 */
export const unconsumedWrites = css => {
  const { frameWrites, inKeyframes } = collect(css)
  const unconsumed = []

  for (const name of frameWrites) {
    if (inKeyframes.has(name)) continue

    unconsumed.push({
      name,
      shape: name
        .replace(/^--jumi-/, '')
        .replace(/-[A-Za-z0-9]{5,8}(?:-\d+)?$/, '-<id>'),
    })
  }

  return unconsumed.sort((one, two) => one.name.localeCompare(two.name))
}
