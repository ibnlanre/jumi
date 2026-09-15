/**
 * The writer/read invariant, as a library — every custom property Jumi emits a read for must have
 * something that writes it, or be a level that is documented as latent.
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

  const target = node => {
    for (let parent = node.parent; parent; parent = parent.parent)
      if (parent.type === 'atrule' && /keyframes$/i.test(parent.name))
        return true

    return false
  }

  document.walkDecls(node => {
    if (node.prop.startsWith('--')) written.add(node.prop)

    if (target(node))
      for (const [, name] of node.value.matchAll(/var\((--jumi-[^,)\s]+)/g))
        inKeyframes.add(name)

    for (const [, name] of node.value.matchAll(/var\((--jumi-[^,)\s]+)/g))
      reads.set(name, (reads.get(name) ?? 0) + 1)
  })

  document.walkAtRules('property', atRule =>
    registered.add(atRule.params.trim()),
  )

  return { document, inKeyframes, reads, registered, written }
}

/** The class a name belongs to, or `DEAD` when nothing in the model can write it. */
export const classify = (name, { registered, written }) => {
  if (written.has(name)) return 'written'
  if (registered.has(name)) return 'registered'

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
  const { inKeyframes, reads, registered, written } = collect(css)
  const dead = []

  for (const [name, count] of reads) {
    if (classify(name, { registered, written }) !== 'DEAD') continue

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
