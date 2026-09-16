import { describe, expect, it } from 'vitest'

import { surfacesOf } from './surfaces'

describe('surfacesOf', () => {
  it('reads the parts a candidate declares', () => {
    expect(surfacesOf('transform', ['skew-x', 'skew-y'])).toEqual([
      'skew-x',
      'skew-y',
    ])
  })

  it('reads the property out of a part that carries its own transform', () => {
    expect(
      surfacesOf('filter', [['filter-blur', value => `blur(${value})`]]),
    ).toEqual(['filter-blur'])
  })

  it('records the attribute itself when the candidate declares no parts', () => {
    // `animate-scale` is declared `property('scale')`. A phrase on it writes
    // `--jumi-scale-<id>-<offset>` — the attribute's own frame key, which is what a frame's outer read
    // asks for — so the attribute is a writer surface for itself. Without this, a shared keyframe body has
    // no way to know whether an outer read has any writer, and which body a shared id gets starts
    // depending on which candidate was compiled first.
    expect(surfacesOf('scale')).toEqual(['scale'])
    expect(surfacesOf('rotate')).toEqual(['rotate'])
    expect(surfacesOf('outline')).toEqual(['outline'])
  })

  it('is a pure function of the attribute and the parts', () => {
    // The property that makes a shared definition honest: two candidates that share an id must not be able
    // to produce different answers, so nothing here may depend on which candidate is running, on the order
    // candidates were declared in, or on what has been matched so far.
    const once = surfacesOf('transform', ['skew-x'])
    const twice = surfacesOf('transform', ['skew-x'])

    expect(once).toEqual(twice)
    expect(once).not.toBe(twice)

    // And it answers per attribute: a part is a surface of the attribute that declares it, not of a
    // property of the same name.
    expect(surfacesOf('filter', ['filter-blur'])).toEqual(['filter-blur'])
    expect(surfacesOf('backdrop-filter', ['backdrop-filter-blur'])).toEqual([
      'backdrop-filter-blur',
    ])
  })

  it('does not treat an empty-string part as no parts', () => {
    // The distinction is `parts.length`, not truthiness of a part: a candidate declaring one part answers
    // with that part whatever it is, and only a candidate declaring none answers with the attribute.
    expect(surfacesOf('scale', ['scale-x'])).toEqual(['scale-x'])
    expect(surfacesOf('scale', [])).toEqual(['scale'])
  })
})
