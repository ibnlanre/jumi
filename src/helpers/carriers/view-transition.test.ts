import { describe, expect, it } from 'vitest'

import { finalizeCss } from '@/helpers/carriers'
import {
  identityAccepted,
  viewTransitionInvalidMarker,
  viewTransitionMarker,
  viewTransitionProducts,
  viewTransitionStaging,
} from '@/helpers/carriers/view-transition'

import postcss from 'postcss'

/**
 * The view-transition pass, tested on the two decisions that are not mechanical.
 *
 * Both are decisions the emitted CSS cannot be asked about on its own. A rule that parses says the
 * identity was interpolated; it does not say whether the value was a name the platform would honour,
 * and `none` parses in both positions and builds no group at all — measured. And a rule that carries a
 * motion says a group exists; it does not say whether the *control* it came from should have been able
 * to create one. So the units here are the validator and the classifier, and the browser-level
 * consequences are pinned in `scripts/view-transition-check.mjs`.
 */

/** A staged rule, in the shape the adapter emits: the author's class plus the marker. */
const staged = (
  candidate: string,
  side: string,
  identity: string,
  declarations: string,
) => {
  const name = candidate.replace(/[:/]/g, m => `\\${m}`)

  return `.${name}:where(.jumi-vt-${side}-${identity}) { ${declarations} }`
}

/**
 * Read rules out of a small stylesheet and stage them the way the finalizer does.
 *
 * Through `viewTransitionStaging` rather than by hand, because the conditions have to be read while the
 * rule is still attached — a detached rule has no ancestors, and that is not a hypothetical: it is the
 * bug a first version of this had.
 */
const stagingOf = (css: string) => {
  const found: postcss.Rule[] = []

  postcss.parse(css).walkRules(rule => {
    found.push(rule)
  })

  // `flatMap`, because one rule can carry several staged selectors — which is what a CSS optimizer
  // produces, and what the docs build hands the pass.
  return found.flatMap(viewTransitionStaging)
}

const products = (css: string) =>
  viewTransitionProducts(stagingOf(css), isMotion)

const MOTION = '--jumi-fade-out-animation-name: jumi-fade-out'
const CONTROL = '--jumi-animation-duration: 300ms'

/** The classifier the finalizer passes in: a staged rule is motion-bearing if it activates a slot. */
const isMotion = (rule: postcss.Rule) =>
  (rule.nodes ?? []).some(
    node =>
      node.type === 'decl' && /^--jumi-.+-animation-name$/.test(node.prop),
  )

/**
 * The measured grammar (P21), written as the table it was measured from.
 *
 * The three columns of that measurement disagree, and these cases are the disagreements rather than the
 * obvious ones: `none` is accepted by the platform in both positions and builds nothing, `auto` is
 * accepted as a pseudo argument and is not a name, and the CSS-wide keywords are the reverse.
 */
describe('the accepted identity grammar', () => {
  it.each(['hero', 'my-card-2', '--foo', 'HERO', '_x', '-x', 'a1'])(
    'accepts `%s`, which the browser also accepts as both a name and a pseudo argument',
    identity => {
      expect(identityAccepted(identity)).toBe(true)
    },
  )

  it.each([
    'none',
    'auto',
    'initial',
    'inherit',
    'unset',
    'revert',
    'revert-layer',
    'NONE',
  ])(
    'rejects the reserved value `%s`, which parses and then builds no group',
    identity => {
      expect(identityAccepted(identity)).toBe(false)
    },
  )

  it.each(['1hero', 'hero)', 'hero{', 'a b', '', '-', '--'])(
    'rejects the malformed identifier `%s`, which would break the selector by concatenation',
    identity => {
      expect(identityAccepted(identity)).toBe(false)
    },
  )
})

/**
 * Participation and motion are separate products, and the separation is Jumi's oldest invariant: a
 * control configures motion, it never creates it. A duration utility that put a `view-transition-name`
 * on an element would make that element enter a transition nothing asked for.
 */
describe('a control alone does not create a product', () => {
  it('emits nothing for a control with no motion beside it', () => {
    const found = products(
      staged(
        'view-transition-old/hero:animation-duration-300',
        'old',
        'hero',
        CONTROL,
      ),
    )

    expect(found.units).toHaveLength(0)
    expect(found.identities).toHaveLength(0)
    // Silent on purpose: a control with no motion is inert exactly as `animation-duration-500` is, and
    // writing one before writing both is ordinary.
    expect(found.warnings).toHaveLength(0)
  })

  it('contributes the control to a group a motion established', () => {
    const found = products(
      [
        staged(
          'view-transition-old/hero:animate-fade-out',
          'old',
          'hero',
          MOTION,
        ),
        staged(
          'view-transition-old/hero:animation-duration-300',
          'old',
          'hero',
          CONTROL,
        ),
      ].join('\n'),
    )

    expect(found.units).toHaveLength(1)
    expect(found.units[0].declarations.map(entry => entry.prop)).toEqual([
      '--jumi-fade-out-animation-name',
      '--jumi-animation-duration',
    ])
  })

  it('keeps the two sides apart', () => {
    const found = products(
      [
        staged(
          'view-transition-old/hero:animate-fade-out',
          'old',
          'hero',
          MOTION,
        ),
        staged(
          'view-transition-new/hero:animation-duration-300',
          'new',
          'hero',
          CONTROL,
        ),
      ].join('\n'),
    )

    expect(found.units.map(entry => entry.side)).toEqual(['old'])
  })
})

/**
 * A transferable wrapper is carried, and a wrapper that depends on the source element's own state is
 * not — decided by the shape of the emitted selector, so it holds for variants that do not exist yet.
 */
describe('which wrappers survive onto the pseudo tree', () => {
  const cases = [
    {
      candidate: 'view-transition-old/hero:animate-fade-out',
      name: 'no wrapper',
    },
    { candidate: 'sm:view-transition-old/hero:animate-fade-out', name: 'sm' },
    {
      candidate:
        'supports-[display:grid]:view-transition-old/hero:animate-fade-out',
      name: 'supports',
    },
  ]

  it.each(cases)('transfers $name', ({ candidate }) => {
    const source = staged(candidate, 'old', 'hero', MOTION)
    const found = products(source)

    expect(found.warnings).toHaveLength(0)
    expect(found.identities).toHaveLength(1)
  })

  it.each([
    'hover:view-transition-old/hero:animate-fade-out',
    'focus:view-transition-old/hero:animate-fade-out',
  ])("refuses `%s`, whose meaning is the source element's state", candidate => {
    // Written out rather than through `staged()`, because the position of the state is the fixture. A
    // state variant wraps the marker rather than being wrapped by it — the emitted selector is
    // `.hover\:…:hover:where(.jumi-vt-old-hero)`, with the state before the marker — and that trailing
    // compound selector is exactly what has no counterpart on a pseudo tree that is not a descendant
    // of the element.
    const state = candidate.slice(0, candidate.indexOf(':'))
    const name = candidate.replace(/[:/]/g, m => `\\${m}`)
    const found = products(
      `.${name}:${state}:where(.jumi-vt-old-hero) { ${MOTION} }`,
    )

    expect(found.units).toHaveLength(0)
    expect(found.warnings).toHaveLength(1)
  })

  it('refuses a relational wrapper, which refers to another element', () => {
    // `group-hover:` compiles to an `:is(:where(.group):hover *)`, so the selector is no longer one
    // class. The test is the shape rather than the variant name, which is what makes it hold for a
    // variant Tailwind adds later.
    const found = products(
      '.group-hover\\:view-transition-old\\/hero\\:animate-fade-out:is(:where(.group):hover *)' +
        `:where(.jumi-vt-old-hero) { ${MOTION} }`,
    )

    expect(found.units).toHaveLength(0)
    expect(found.warnings).toHaveLength(1)
  })
})

/**
 * The two media queries Jumi has an opinion about.
 *
 * `motion-safe:` is kept on the motion and dropped from the identity, and that is the whole reason the
 * two products exist separately: an identity under `no-preference` does not quiet the animation, it
 * deletes the participation (measured, P22). `motion-reduce:` is refused rather than translated,
 * because Jumi has already decided its own motion does not run under reduced motion.
 */
describe('the reduced-motion queries', () => {
  const wrapped = (query: string, inner: string) =>
    `@media ${query} { ${inner} }`

  it('drops `no-preference` from the identity and keeps it on the motion', () => {
    const source = wrapped(
      '(prefers-reduced-motion: no-preference)',
      staged(
        'motion-safe:view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      ),
    )
    const found = products(source)

    expect(found.identities[0].conditions).toEqual([])
    expect(found.units).toHaveLength(1)
    expect(found.warnings).toHaveLength(0)
  })

  it("keeps an author's own condition on both", () => {
    const source = wrapped(
      '(width >= 40rem)',
      staged(
        'sm:view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      ),
    )
    const found = products(source)

    expect(found.identities[0].conditions).toEqual([
      { name: 'media', params: '(width >= 40rem)' },
    ])
    expect(found.units).toHaveLength(1)
    // "On both" is the load-bearing half, and it is the half that is easy to get wrong: the identity
    // carries the wrapper through the selector, and the *motion* has to carry it too or the unit is
    // emitted unconditionally while its name is not.
    expect(found.units[0].conditions).toEqual([
      { name: 'media', params: '(width >= 40rem)' },
    ])
  })

  it('gives a mixed pair the conditions each side asked for', () => {
    const source = [
      wrapped(
        '(width >= 40rem)',
        staged(
          'sm:view-transition-old/hero:animate-fade-out',
          'old',
          'hero',
          MOTION,
        ),
      ),
      staged(
        'view-transition-new/hero:animate-fade-in',
        'new',
        'hero',
        '--jumi-fade-in-animation-name: jumi-fade-in',
      ),
    ].join('\n')
    const found = products(source)

    // Two units for the same identity, one per side, and only the old one is conditional — so below the
    // breakpoint the old side is the browser's and the new side is still Jumi's. Grouping the pair into
    // one unconditional product is the mistake this shape exists to prevent.
    expect(
      found.units.map(unit => [unit.side, unit.conditions.length]),
    ).toEqual([
      ['old', 1],
      ['new', 0],
    ])
    expect(
      found.identities.map(entry => [entry.identity, entry.conditions.length]),
    ).toEqual([
      ['hero', 1],
      ['hero', 0],
    ])
  })

  it("does not let a control's own condition take a side from the browser", () => {
    const source = [
      wrapped(
        '(width >= 40rem)',
        staged(
          'sm:view-transition-old/hero:animation-duration-300',
          'old',
          'hero',
          CONTROL,
        ),
      ),
      staged(
        'view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      ),
    ].join('\n')
    const found = products(source)

    // Two units, and only the one carrying the motion owns the side. The control's declaration still
    // reaches the pseudo tree — under its own condition — but it cannot make the browser give the side
    // up on its own.
    expect(found.units.map(unit => unit.motion)).toEqual([false, true])
  })

  it("refuses `motion-reduce`, which contradicts Jumi's own policy", () => {
    const source = wrapped(
      '(prefers-reduced-motion: reduce)',
      staged(
        'motion-reduce:view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      ),
    )
    const found = products(source)

    expect(found.identities).toHaveLength(0)
    expect(found.units).toHaveLength(0)
    expect(found.warnings[0]).toContain('never runs there')
  })

  /**
   * The two identity refusals, which need different sentences.
   *
   * `view-transition-old:animate-fade-out` is missing a name; `view-transition-old/none:animate-fade-out`
   * has one the browser will not accept. A single marker could only report them together, and telling an
   * author that "the name after the `/` is invalid" about a class with no `/` in it is worse than saying
   * nothing.
   */
  it.each([
    [
      'missing',
      'names no transition',
      'view-transition-old\\:animate-fade-out',
    ],
    [
      'name',
      'not one the browser accepts',
      'view-transition-old\\/none\\:animate-fade-out',
    ],
  ])(
    'refuses a %s identity, in its own words',
    (reason, expected, selector) => {
      const marker = viewTransitionInvalidMarker(reason as 'missing' | 'name')
      const found = products(
        `${marker.replace('&', `.${selector}`)} { ${MOTION} }`,
      )

      expect(found.warnings).toHaveLength(1)
      expect(found.warnings[0]).toContain(expected)
    },
  )
})

/** The end-to-end shape, through the pass that ships rather than the products alone. */
describe('the emitted stylesheet', () => {
  const css = [
    '.animate-fade-out { --jumi-fade-out-animation-name: jumi-fade-out; }',
    staged('view-transition-old/hero:animate-fade-out', 'old', 'hero', MOTION),
    staged(
      'view-transition-old/inert:animation-duration-300',
      'old',
      'inert',
      CONTROL,
    ),
  ].join('\n')

  const { css: out, viewTransitions } = finalizeCss(css)

  it('removes the staging', () => {
    expect(out).not.toContain('jumi-vt-')
  })

  it('names the element whose candidate carried a motion', () => {
    expect(out).toContain('view-transition-name: hero')
    expect(out).not.toContain('view-transition-name: inert')
  })

  it('writes the motion onto the pseudo tree, guarded and reduced-motion-safe', () => {
    expect(out).toContain('@supports selector(::view-transition-old(hero))')
    expect(out).toContain('@media (prefers-reduced-motion: no-preference)')
    expect(out).toContain('::view-transition-old(hero)')
    expect(out).toContain('mix-blend-mode: plus-lighter')
  })

  it("never touches the group, which is the browser's own travel", () => {
    expect(out).not.toContain('::view-transition-group(')
  })

  it('reports what it wrote, and reports no refusal for a control that is merely inert', () => {
    expect(viewTransitions).toBeGreaterThan(0)
    expect(finalizeCss(out).viewTransitions).toBe(0)
    expect(finalizeCss(out).css).toBe(out)
  })

  it('leaves a stylesheet with no view-transition candidate untouched', () => {
    const plain =
      '.animate-fade-out { --jumi-fade-out-animation-name: jumi-fade-out; }'
    const result = finalizeCss(plain)

    expect(result.css).toBe(plain)
    expect(result.viewTransitions).toBe(0)
    expect(result.warnings).toEqual([])
  })

  it('produces the marker the parser reads back', () => {
    expect(viewTransitionMarker('old', 'my-card-2')).toBe(
      '&:where(.jumi-vt-old-my-card-2)',
    )
  })

  it('round-trips every accepted identity through the marker and back', () => {
    // The adapter builds the marker and this pass parses it, so the two spellings of one convention
    // have to agree — and they are in different files' worth of code apart. A property rather than a
    // case, because the failure it guards is a silent divergence between build and parse.
    for (const identity of [
      'hero',
      'my-card-2',
      '--foo',
      'HERO',
      '_x',
      '-x',
      'a1',
    ]) {
      for (const side of ['old', 'new'] as const) {
        const selector = viewTransitionMarker(side, identity).replace(
          '&',
          '.candidate',
        )

        expect(identityAccepted(identity)).toBe(true)

        const found = products(`${selector} { ${MOTION} }`)

        expect(found.identities).toEqual([
          { conditions: [], identity, source: '.candidate' },
        ])
        expect(found.warnings).toEqual([])
      }
    }
  })

  it("does not mistake an author's own class for staging", () => {
    // The one way this pass could delete something that is not its own. `isViewTransitionRule` decides
    // what leaves the document, and the marker's own documentation names `.jumi-vt-old-hero` — so a
    // prefix test would remove an author's rule that happens to use it.
    const css = [
      '.jumi-vt-old-hero { color: red; }',
      '.jumi-vt-helper { --x: 1; }',
      // ...but a marker this pass cannot read is still its own, and has to be collected so it can be
      // reported instead of left behind as a rule that matches nothing.
      `.mangled:where(.jumi-vt-edited) { ${MOTION} }`,
    ].join('\n')

    const { css: out, warnings } = finalizeCss(css)

    expect(out).toContain('.jumi-vt-old-hero { color: red; }')
    expect(out).toContain('.jumi-vt-helper { --x: 1; }')
    expect(out).not.toContain('jumi-vt-edited')
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('could not read')
  })

  it('emits the same bytes for the same document, in document order', () => {
    // Document order decides the selector lists, and that is deliberate: a build's document order comes
    // from Tailwind's candidate sort, so the same candidates always arrive the same way, and sorting
    // here would instead order selectors by name — which is not a fact about the page. The carrier pass
    // made the same choice for the same reason. What must not happen is *instability*: two passes over
    // one stylesheet, or a fresh build against an incremental one, have to agree byte for byte.
    const css = [
      '.animate-fade-out { a: b; }',
      staged(
        'view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      ),
      staged(
        'view-transition-new/card:animate-fade-in',
        'new',
        'card',
        '--jumi-fade-in-animation-name: jumi-fade-in',
      ),
    ].join('\n')

    const first = finalizeCss(css).css

    expect(finalizeCss(css).css).toBe(first)
    expect(finalizeCss(first).css).toBe(first)
    // And in the order the document declared them, not alphabetically.
    expect(first.indexOf('view-transition-name: hero')).toBeLessThan(
      first.indexOf('view-transition-name: card'),
    )
  })
})

/**
 * The invariants, written down as the law they now are.
 *
 * Each one is a decision that a plausible future change could quietly reverse, and each is named after
 * the rule rather than after the mechanism, so a failure reads as "the invariant broke" rather than as
 * "an assertion about a string". The two that carry the most weight — a control cannot create
 * participation, and `motion-safe:` never suppresses participation — are falsified end to end in
 * `scripts/view-transition-check.mjs`, where reversing them breaks a real page.
 */
describe('the design invariants', () => {
  it('a VT control never establishes participation', () => {
    const found = products(
      staged(
        'view-transition-old/hero:animation-duration-300',
        'old',
        'hero',
        CONTROL,
      ),
    )

    expect(found.identities).toHaveLength(0)
    expect(found.units).toHaveLength(0)
  })

  it('a motion-bearing candidate establishes its own identity', () => {
    const found = products(
      staged(
        'view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      ),
    )

    expect(found.identities.map(entry => entry.identity)).toEqual(['hero'])
    expect(found.identities.map(entry => entry.source)).toEqual([
      '.view-transition-old\\/hero\\:animate-fade-out',
    ])
  })

  it('multiple candidates for one identity contribute independently, with no winner chosen', () => {
    const found = products(
      [
        `@media (width >= 40rem) { ${staged(
          'sm:view-transition-old/card:animate-fade-out',
          'old',
          'card',
          MOTION,
        )} }`,
        staged(
          'view-transition-new/card:animate-fade-in',
          'new',
          'card',
          '--jumi-fade-in-animation-name: jumi-fade-in',
        ),
      ].join('\n'),
    )

    expect(found.identities).toHaveLength(2)
    expect(found.identities.map(entry => entry.conditions.length)).toEqual([
      1, 0,
    ])
  })

  it('an absent side stays entirely browser-owned', () => {
    const { css } = finalizeCss(
      staged(
        'view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      ),
    )

    expect(css).toContain('::view-transition-old(hero)')
    // Not merely unanimated: not mentioned at all. A side listed anywhere in the emitted block has had
    // its `animation` replaced, and the browser's cross-fade is gone with it.
    expect(css).not.toContain('::view-transition-new(hero)')
  })

  it('motion-safe suppresses Jumi motion and never transition identity', () => {
    const source = `@media (prefers-reduced-motion: no-preference) { ${staged(
      'motion-safe:view-transition-old/hero:animate-fade-out',
      'old',
      'hero',
      MOTION,
    )} }`
    const { css } = finalizeCss(source)

    expect(css).toContain('view-transition-name: hero')
    // The identity rule outside every condition, and the motion inside Jumi's own.
    expect(
      css.match(/@media \(prefers-reduced-motion: no-preference\)/g)?.length,
    ).toBeGreaterThan(0)
    expect(css.indexOf('view-transition-name: hero')).toBeLessThan(
      css.indexOf('@supports selector('),
    )
  })

  it('motion-reduce is invalid for Jumi VT motion', () => {
    const { css, warnings } = finalizeCss(
      `@media (prefers-reduced-motion: reduce) { ${staged(
        'motion-reduce:view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      )} }`,
    )

    expect(css).not.toContain('view-transition-name')
    expect(warnings).toHaveLength(1)
  })

  it('Jumi never emits onto the group pseudo', () => {
    const { css } = finalizeCss(
      staged(
        'view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      ),
    )

    expect(css).not.toContain('::view-transition-group(')
  })

  it("Jumi restores `plus-lighter` whenever it replaces a side's UA animation", () => {
    const { css } = finalizeCss(
      staged(
        'view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      ),
    )

    expect(css).toContain('mix-blend-mode: plus-lighter')
  })

  it('prunes an at-rule it emptied, but never a layer', () => {
    const { css } = finalizeCss(
      `@layer utilities { @media (width >= 40rem) { ${staged(
        'sm:view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      )} } }`,
    )

    expect(css).toContain('@layer utilities')
    expect(css).not.toMatch(/@media \(width >= 40rem\)\s*\{\s*\}/)
  })
  it('leaves a later candidate to win by order rather than deduplicating it away', () => {
    // Two controls under conditions that agree on nothing, on one side. Both are emitted, so the cascade
    // decides exactly as it would on the element — which is the whole reason the declarations are
    // concatenated in document order instead of being reconciled here.
    const { css } = finalizeCss(
      [
        staged(
          'view-transition-old/hero:animate-fade-out',
          'old',
          'hero',
          MOTION,
        ),
        staged(
          'view-transition-old/hero:animation-duration-300',
          'old',
          'hero',
          CONTROL,
        ),
        `@media (width >= 40rem) { ${staged(
          'sm:view-transition-old/hero:animation-duration-500',
          'old',
          'hero',
          '--jumi-animation-duration: 500ms',
        )} }`,
      ].join('\n'),
    )

    expect(css).toContain('--jumi-animation-duration: 300ms')
    expect(css).toContain('--jumi-animation-duration: 500ms')
  })

  it('does not mutate the staging it was handed', () => {
    // The pass reads conditions off live rules and then takes those rules out of the document. It must
    // not also rewrite what it read: a second emission from the same staging has to produce the same
    // stylesheet, which is the property the incremental arms rest on.
    const staging = stagingOf(
      `@media (width >= 40rem) { ${staged(
        'sm:view-transition-old/hero:animate-fade-out',
        'old',
        'hero',
        MOTION,
      )} }`,
    )

    const firstProducts = viewTransitionProducts(staging, isMotion)
    const secondProducts = viewTransitionProducts(staging, isMotion)

    expect(secondProducts.identities).toEqual(firstProducts.identities)
    expect(secondProducts.units).toEqual(firstProducts.units)
    expect(firstProducts.units[0].conditions).toEqual([
      { name: 'media', params: '(width >= 40rem)' },
    ])
  })

  /**
   * A staged rule whose selector is a **list**, which is what a bundler hands this pass.
   *
   * This is the one bug in the emitter that no harness here could see, and it is worth stating as a
   * regression because of how it failed: a CSS optimizer merges rules that declare the same thing, so a
   * page with several cards arrives as *one* rule carrying every card's staged selector. The reader
   * assumed one selector per rule, took the whole list for a single candidate, found it was not one
   * class, and refused every card in the page — politely, one warning each, which is why it read like an
   * authoring mistake rather than a bug.
   *
   * Measured in the docs build, where six cards became one rule. The CLI never merges, which is the
   * whole reason the existing arms passed while the feature did nothing in the browser.
   */
  it('reads a rule whose selector is a list, and takes all of it out', () => {
    const ids = ['alpha', 'bravo', 'charlie']
    const list = ids
      .map(
        id =>
          `.view-transition-old\\/${id}\\:animate-fade-out:where(.jumi-vt-old-${id})`,
      )
      .join(',\n')
    const css = [
      '.animate-fade-out { --jumi-fade-out-animation-name: jumi-fade-out; }',
      `${list} { ${MOTION} }`,
    ].join('\n')

    const found = products(css)

    expect(found.warnings).toEqual([])
    expect(found.identities.map(entry => entry.identity)).toEqual(ids)
    expect(found.units.map(unit => unit.identity)).toEqual(ids)

    const { css: out } = finalizeCss(css)

    expect(out).not.toContain('jumi-vt-')
    expect(out.match(/view-transition-name/g)).toHaveLength(ids.length)

    // Every card keeps its own side rule, so one merged input rule becomes three independent products
    // rather than one. Asserted per identity rather than by counting: the owning rule lists all three
    // together and the `@supports` guard names one of them, so the total says less than the presence of
    // each one does.
    for (const id of ids) expect(out).toContain(`::view-transition-old(${id})`)
  })

  it('leaves a rule that only partly belongs to it alone', () => {
    // The variant produces all-staging rules, so this is the safe side of a case that should not arise
    // rather than a case being handled: whatever else shares the rule is not this pass's to delete.
    const css = [
      '.animate-fade-out { --jumi-fade-out-animation-name: jumi-fade-out; }',
      `.mine { color: red; }`,
      `.view-transition-old\\/alpha\\:animate-fade-out:where(.jumi-vt-old-alpha), .mine { ${MOTION} }`,
    ].join('\n')

    const { css: out } = finalizeCss(css)

    expect(out).not.toContain('jumi-vt-')
    expect(out).toContain('.mine')
  })
})
