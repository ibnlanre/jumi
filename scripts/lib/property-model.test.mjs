import { describe, expect, it } from 'vitest'

// Relative and explicit: the `@/` alias is a tsconfig path, and this reader is a plain Node module.
import { propertyVariables } from '../../src/variables/property.ts'
import {
  bucketOf,
  readCandidate,
  readCandidates,
  readExpressions,
  readPropertyEntries,
} from './property-model.mjs'

/**
 * The bug these pin, because it produced plausible numbers rather than an error.
 *
 * Reading `fn: property(…)` with `fn: property\((.*)\)` and a greedy `.*` captures to the **last** `)`
 * in the entry's body — which is inside `values: theme(…)`, one or two lines below. The captured text
 * then contains the entry's own `type:` list, so part extraction credited
 * `animate-background-position` with writing the leaf `position`: a candidate that never mentions it.
 * The census built on that join reported 236 addressable leaves where the truth is 291, and 123
 * proposals where the truth is 172.
 *
 * Every assertion here is a property of the real model, not of a fixture, because the reader's whole
 * job is to answer questions about the real model.
 */
describe('readCandidates', () => {
  const candidates = readCandidates()
  const named = name => candidates.find(candidate => candidate.name === name)

  it('reads a candidate that addresses one part, and only that part', () => {
    const candidate = named('animate-scale-x')

    expect(candidate.attribute).toBe('scale')
    expect(candidate.parts).toEqual(['scale-x'])
  })

  it('does not confuse the declared types with the parts addressed', () => {
    // The exact confusion: `position` is a *declared type* of this candidate and is not a part it
    // writes — in fact it addresses no part at all. A reader that cannot separate the two invents a
    // writer for the leaf `position`, which is a leaf the graph really has.
    const candidate = named('animate-background-position')

    expect(candidate.types).toContain('position')
    expect(candidate.parts).toEqual([])
  })

  it('reads a part that is a CSS function Jumi injects', () => {
    // `property('transform', [['skew', args('skew')]])` — the part is the function's name, and the
    // nested array must not be read as two parts.
    const candidate = named('animate-skew')

    expect(candidate.attribute).toBe('transform')
    expect(candidate.parts).toEqual(['skew'])
  })

  it('reads a whole-attribute candidate as addressing nothing', () => {
    // A candidate with no parts writes the attribute's own frame key, which is a fact about the
    // attribute and not about a leaf. Reporting a part here would invent a slot — and the shape that
    // used to produce it is the one with **no comma at all**, where slicing from `indexOf(',')` of -1
    // returns the whole call and the attribute is read back as its own part.
    expect(named('animate-scale').attribute).toBe('scale')
    expect(named('animate-scale').parts).toEqual([])
    expect(named('animate-background-position').parts).toEqual([])
  })

  it('leaves a candidate whose fn is not property() with no attribute', () => {
    // Effects and the token helpers are candidates with no property to read; they must not silently
    // acquire one from a `property(...)` call elsewhere in their body.
    expect(
      candidates.filter(candidate => candidate.attribute === null).length,
    ).toBeGreaterThan(0)
  })

  it('reads every part as a slot the graph knows', () => {
    // The join is only meaningful if its right-hand side is the graph's own vocabulary.
    const slots = new Set(readPropertyEntries().map(entry => entry.slot))
    const unknown = [
      ...new Set(
        candidates
          .flatMap(candidate => candidate.parts)
          .filter(part => !slots.has(part)),
      ),
    ]

    expect(unknown).toEqual([])
  })

  it('reads a color() candidate, which addresses a property exactly as property() does', () => {
    // The second gap in this reader's history: reading only `property(` left all eighteen `color(…)`
    // candidates unattributed, and six of them address a **part** of a composition. Every census figure
    // had been reported with those six missing, which understated the constituent count.
    const outline = named('animate-outline-color')

    expect(outline.attribute).toBe('outline')
    expect(outline.parts).toEqual(['outline-color'])
    expect(outline.types).toEqual(['color'])
  })

  it('reads a color() candidate with no parts as addressing its own attribute', () => {
    // `color('column-rule-color')` — the leaf the identity swap is about, and a reader that cannot see
    // it cannot see the defect either.
    const colour = named('animate-column-rule-color')

    expect(colour.attribute).toBe('column-rule-color')
    expect(colour.parts).toEqual([])
  })

  it('reads a token() candidate as addressing its attribute, never a part', () => {
    // `token('display', 'prepend')` consumes a modifier into the value and calls `property(display)`.
    // Its second argument is an order, not a parts list, so reading it as one would invent a part.
    const display = named('animate-display')

    expect(display.attribute).toBe('display')
    expect(display.parts).toEqual([])
  })

  it('reads the display family of token() candidates as one attribute', () => {
    const family = candidates.filter(
      candidate => candidate.attribute === 'display',
    )

    expect(family.map(candidate => candidate.name).sort()).toEqual([
      'animate-display',
      'animate-display-inside',
      'animate-display-outside',
    ])
  })
})

/**
 * The invariant that catches a transposed identity, and the reason it is worth having.
 *
 * `column-rule-width` and `column-rule-color` each held the other's default. Nothing noticed for as long
 * as nothing read either slot on its own: the `column-rule` composition is order-insensitive
 * (`<'width'> || <'style'> || <'color'>`), so the two keywords landed in the right slots anyway, and the
 * canonical corpus never registers that composition at all. It surfaced only when the typing census read
 * the identity of every leaf and tried to register `--jumi-column-rule-width` as a `<length>`.
 *
 * A test asserting the two literals would pin the fix without describing it. These assert the *shape* of
 * the mistake instead — a width is not a colour and a colour is not a width — which is the check that was
 * done by eye and the only reason the swap was ever found.
 */
describe('the candidate walk', () => {
  /**
   * What a comment can carry into an entry, and which of it is **demonstrated** to matter.
   *
   * The walk splits on parentheses and quotes, so a comment is structure to it. Bypassing the strip is how
   * these are checked, and it separates them: the unbalanced parenthesis makes the whole entry unreadable —
   * `attribute: null`, the fingerprint D.3.6 spent two increments chasing — while the apostrophe does not,
   * because a part's first quoted string is still found. So the first is an arm for a measured failure and the
   * second is a guard for a shape that has to stay inert.
   *
   * An earlier entry in the log claimed both were measured failures. That was an inference, and the bypass
   * disproves it; the correction is appended there rather than edited in.
   */
  it('reads a part written below a comment carrying an unbalanced parenthesis', () => {
    const entry = `
      fn: property('math-depth', [
        // the shell, spelled add(var(--jumi-math-depth-add)), and a bare add( of its own
        ['math-depth-add', value => value],
      ]),`

    expect(readCandidate(entry)).toEqual({
      attribute: 'math-depth',
      parts: ['math-depth-add'],
      types: [],
    })
  })

  it('reads a part written below a comment carrying an apostrophe', () => {
    const entry = `
      fn: property('scale', [
        // the entry's own parts, in the author's order
        ['scale-x', value => value],
      ]),`

    expect(readCandidate(entry)).toEqual({
      attribute: 'scale',
      parts: ['scale-x'],
      types: [],
    })
  })

  it('still reads the shapes the walk was written for', () => {
    // A whole candidate addresses the attribute and declares no part of its own.
    expect(
      readCandidate(`
      fn: property('scale'),
      type: 'number',`),
    ).toEqual({
      attribute: 'scale',
      parts: [],
      types: ['number'],
    })

    // `token(…)`'s second argument is an order rather than a parts list, so it addresses the attribute alone.
    expect(
      readCandidate(`
      fn: token('display', 'prepend'),`),
    ).toEqual({
      attribute: 'display',
      parts: [],
      types: [],
    })

    // An entry that addresses no property at all is not an error; it is a candidate with nothing to write.
    expect(
      readCandidate(`
      values: empty.number,`),
    ).toEqual({
      attribute: null,
      parts: [],
      types: [],
    })
  })
})

describe('the identities in the model', () => {
  const entries = readPropertyEntries()
  const identityOf = slot => {
    const value = entries.find(entry => entry.slot === slot)?.value

    return value === undefined ? null : value.replace(/^'|'$/g, '')
  }
  const family = suffix =>
    entries.map(entry => entry.slot).filter(slot => slot.endsWith(suffix))

  const COLOURS = new Set([
    'black',
    'currentColor',
    'red',
    'transparent',
    'white',
  ])
  const LINE_WIDTHS = new Set(['medium', 'thick', 'thin'])

  it('never rests a *-width leaf at a colour', () => {
    const wrong = family('-width').filter(slot => COLOURS.has(identityOf(slot)))

    expect(wrong).toEqual([])
  })

  it('never rests a *-color leaf at a line width', () => {
    const wrong = family('-color').filter(slot =>
      LINE_WIDTHS.has(identityOf(slot)),
    )

    expect(wrong).toEqual([])
  })

  it('reads the two column-rule identities as their own properties rest at them', () => {
    expect(identityOf('column-rule-width')).toBe('medium')
    expect(identityOf('column-rule-color')).toBe('currentColor')
  })
})

describe('readPropertyEntries', () => {
  const entries = readPropertyEntries()

  it('reads the variable an entry owns, and the value it rests at', () => {
    const scaleX = entries.find(entry => entry.slot === 'scale-x')

    expect(scaleX.variable).toBe('--jumi-scale-x')
    expect(scaleX.value).toBe("'1'")
    expect(scaleX.composite).toBe(false)
  })

  it('reads a composite as its dependency list, not as a value', () => {
    const scale = entries.find(entry => entry.slot === 'scale')

    expect(scale.composite).toBe(true)
    expect(scale.deps).toEqual(['scale-x', 'scale-y', 'scale-z'])
  })

  it('keeps a multi-line dependency list together', () => {
    // `backdrop-filter` names eleven slots one per line; a reader that stopped at the first newline
    // would report one.
    const backdrop = entries.find(entry => entry.slot === 'backdrop-filter')

    expect(backdrop.deps.length).toBe(11)
    expect(backdrop.deps).toContain('backdrop-filter-url')
  })

  it('reads a value that is a call with its own commas', () => {
    const blur = entries.find(entry => entry.slot === 'filter-blur')

    expect(blur.value).toBe("css('blur', '0')")
  })
})

/**
 * The reader and the model have to be the same model.
 *
 * `readPropertyEntries().value` is the *source* text, so an entry whose composition comes from a module reads
 * as the identifier that names it (`animationTimelineScroll`) rather than as the expression the plugin
 * evaluates. Two readers disagreed exactly there, and neither was wrong about its own representation: the
 * census saw `scroll(var(--jumi-animation-timeline-axis) var(…))` and a source reader saw an identifier, so a
 * depth test could not fire and nine reshapes were counted as machinery — `324 - 30 = 294` "reach" against the
 * census's `324 - 21 = 303`. The comparison below is what makes that unrepresentable: **every entry's resolved
 * expression equals the value the plugin evaluates**, entry for entry.
 */
describe('readExpressions', () => {
  it('resolves every entry to the value the plugin evaluates', () => {
    const expressions = readExpressions()
    const evaluated = Object.entries(propertyVariables)

    const differences = evaluated
      .map(([slot, entry]) => [
        slot,
        String(entry.value),
        expressions.get(slot),
      ])
      .filter(([, value, read]) => value !== read)

    expect(evaluated).toHaveLength(626)
    expect(differences).toEqual([])
  })

  it('resolves a composition rather than returning its name', () => {
    // The shape of the defect, at one entry: a nested composition reads as an expression with the slot inside
    // a function call, which is what makes the census's depth test meaningful.
    expect(readExpressions().get('animation-timeline-scroll')).toBe(
      'scroll(var(--jumi-animation-timeline-axis) var(--jumi-animation-timeline-scroller))',
    )
    expect(bucketOf('animation-timeline-view', 'animation-timeline-axis')).toBe(
      'reshape',
    )
  })
})
