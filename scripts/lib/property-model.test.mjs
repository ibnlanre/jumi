import { describe, expect, it } from 'vitest'

import { readCandidates, readPropertyEntries } from './property-model.mjs'

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
