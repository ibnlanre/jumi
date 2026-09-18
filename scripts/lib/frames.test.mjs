import { describe, expect, it } from 'vitest'

import { cssNameOf, functionsOf, gateBArm, nativeSheet } from './frames.mjs'

/**
 * The harness's own guard.
 *
 * This track spent eleven fixture defects finding out that a measurement pointed at the wrong thing reads exactly
 * like a mechanism that does not work. The worst of them was silent: a native reference built with the camelCase
 * JavaScript name (`backdropFilter`) animates nothing in CSS, so the "reference" returned one value at every sample
 * and every arm built on it agreed with itself.
 *
 * These arms pin the builder, not the emission: the CSS name is derived, the sheet's declarations use it, and a
 * name that cannot be spelled in CSS is refused rather than emitted.
 */
describe('the native-reference builder', () => {
  it('spells a DOM property the way CSS does', () => {
    expect(cssNameOf('backdropFilter')).toBe('backdrop-filter')
    expect(cssNameOf('filter')).toBe('filter')
    expect(cssNameOf('mathDepth')).toBe('math-depth')
  })

  it('puts the CSS name in the keyframe and never the JavaScript one', () => {
    const sheet = nativeSheet({
      from: 'blur(0px)',
      id: 'probe',
      property: 'backdropFilter',
      to: 'blur(10px)',
    })

    // The trap itself: `backdropFilter` in a stylesheet is an unknown property, the animation runs and moves
    // nothing, and the arm reports an agreement it did not earn.
    expect(sheet.css).toContain('backdrop-filter: blur(0px)')
    expect(sheet.css).not.toContain('backdropFilter')
    expect(sheet.property).toBe('backdrop-filter')
  })

  it('names the keyframe and the element the same, so the rule can match', () => {
    const sheet = nativeSheet({
      from: 'blur(0px)',
      property: 'filter',
      to: 'blur(10px)',
    })

    expect(sheet.css).toContain(`@keyframes ${sheet.name}`)
    expect(sheet.css).toContain(`#${sheet.name} {`)
  })

  /**
   * The twelfth fixture defect: the reference walked `linear` while the plugin's default is `ease`, so a route that
   * interpolated correctly was reported as `differs` on the shape of its curve. An arm comparing two curves has to
   * be able to say which curve it is judging against — and the default has to stay what the earlier tracks measured,
   * or their results change under them.
   */
  it('carries the timing function it is compared against', () => {
    const sheet = nativeSheet({
      easing: 'ease',
      from: '0% 0%',
      property: 'backgroundPosition',
      to: '40% 0%',
    })

    expect(sheet.css).toContain(
      'animation: native-background-position 1000ms ease both',
    )
    expect(
      nativeSheet({
        from: '0% 0%',
        property: 'backgroundPosition',
        to: '40% 0%',
      }).css,
    ).toContain('1000ms linear both')
  })
})

describe('reading a computed filter list', () => {
  it('keys each function by name with its arguments', () => {
    const read = functionsOf('blur(5px) brightness(1) drop-shadow(4px 4px 8px)')

    expect(read.get('blur')).toBe('5px')
    expect(read.get('brightness')).toBe('1')
    expect(read.get('drop-shadow')).toBe('4px 4px 8px')
  })

  // The shipped composition materialises every resting argument, so string equality between a shipped series and a
  // native one is impossible by construction. This is the comparison that replaces it, and it is the one the
  // question is about: the functions that move, by name.
  it('reads a whole resting list as named functions, not as one string', () => {
    const read = functionsOf(
      'blur(0px) brightness(1) contrast(1) grayscale(0) hue-rotate(0deg)',
    )

    expect([...read.keys()]).toEqual([
      'blur',
      'brightness',
      'contrast',
      'grayscale',
      'hue-rotate',
    ])
  })

  it('answers nothing for a property that computes to none', () => {
    expect([...functionsOf('none')]).toEqual([])
    expect([...functionsOf('')]).toEqual([])
  })
})
