import { describe, expect, test } from 'vitest'

import { derivations, shapeOf } from './derivation.mjs'
import {
  framesOf,
  pinningOf,
  planFor,
  plans,
  PROBES,
  verdictOf,
  VERDICTS,
} from './validation.mjs'

const derivable = derivations().filter(
  one => one.outcome === 'mechanically derivable',
)

describe('the probe', () => {
  test('every probe is a value its own syntax admits, by the shape reader', () => {
    for (const [syntax, probes] of Object.entries(PROBES)) {
      const type = {
        '<angle>': 'angle',
        '<color>': 'color',
        '<integer>': 'integer',
        '<length>': 'length',
        '<number>': 'number',
        '<percentage>': 'percentage',
      }[syntax]

      for (const probe of probes) {
        const shape = shapeOf(probe)

        expect(
          shape.types,
          `${syntax} probe \`${probe}\` reads as ${JSON.stringify(shape.types)}`,
        ).toContain(type)
      }
    }
  })

  test('a probe carries no whitespace, because it also names a class', () => {
    // The probe ends up in a class attribute as well as in a selector: `rgba(0, 0, 255, 0.5)` splits into four
    // class names and the element matches nothing, which is a silent arm rather than a failing one.
    for (const probes of Object.values(PROBES))
      for (const probe of probes) expect(probe).toBe(probe.trim())
  })

  test('a probe is never the resting value of the pair it tests', () => {
    // `0`, `transparent` and `currentColor` are three of the population's rests; an arm whose motion is
    // rest-to-rest measures the absence of a fixture, not the representation.
    for (const derivation of derivable)
      for (const probe of PROBES[derivation.proposal[0]])
        expect(String(derivation.rest)).not.toBe(probe)
  })
})

describe('the plan', () => {
  test('every pair with a representation in play plans, and every plan is spelled for its representation', () => {
    // The population is the derivation workstream *plus* the pairs promoted out of it, so the assertion is about
    // the shape of every plan rather than about how many pairs the workstream happens to hold today: a
    // promotion must not require editing this test, only the evidence it is checked against.
    const planned = plans()

    expect(planned.length).toBeGreaterThan(0)
    expect(planned.some(one => one.status === 'planned')).toBe(true)

    for (const plan of planned) {
      if (plan.status !== 'planned') continue

      /**
       * Two spellings, and the plan says which one proved it.
       *
       * A `phrase` plan carries the model's own resting value as its first stop, so the arm exercises the
       * composed representation stop by stop. A `value` plan is a **shell-shaped** constituent: the frames
       * cannot carry the leaf's value at all, and only the one-value spelling reaches the typed
       * representation — which is what makes `spelling` part of the record rather than something a later
       * reader has to infer from the class name.
       */
      expect(['phrase', 'value']).toContain(plan.spelling)
      expect(plan.klass).toBe(
        plan.spelling === 'value'
          ? `${plan.candidate}-[${plan.probe}]`
          : `${plan.candidate}-[0:${plan.rest}|100:${plan.probe}]`,
      )
      expect(plan.syntax in PROBES).toBe(true)
    }
  })

  test('a pair is refused with a reason rather than dropped', () => {
    // A pair whose outcome is not a derivation, planned anyway: the refusal has to name the outcome, because
    // "unresolved" without a reason is how a population quietly shrinks.
    const ambiguous = derivations().find(
      one => one.outcome === 'ambiguous grammar',
    )
    const refused = planFor(ambiguous)

    expect(refused.status).toBe('unresolved')
    expect(refused.reason).toContain('ambiguous grammar')
    expect(refused.pair).toContain('/')
  })

  test('the reason is the model’s, not a restatement', () => {
    const plansOfEverything = derivations().map(one => planFor(one))

    for (const refused of plansOfEverything.filter(
      one => one.status === 'unresolved',
    ))
      expect(refused.reason.length).toBeGreaterThan(10)
  })
})

describe('the pinned slot', () => {
  test('a part candidate pins the component, a whole candidate pins its versioned slot', () => {
    expect(
      pinningOf({
        application: 'var(--jumi-rotate-x) var(--jumi-rotate-y)',
        component: 'rotate-x',
        slot: '--jumi-rotate-x',
      }),
    ).toBe('--jumi-rotate-x')

    expect(
      pinningOf({
        application: 'var(--jumi-background-color-Zkj828)',
        component: 'background-color',
        slot: '--jumi-background-color-Zkj828',
      }),
    ).toBe('--jumi-background-color-Zkj828')
  })

  test('an application that never reads the component is refused, not guessed', () => {
    expect(
      pinningOf({
        application: 'var(--jumi-margin)',
        component: 'rotate-x',
        slot: '--jumi-margin',
      }),
    ).toBe(null)
  })
})

describe('the frames', () => {
  const css = `
    --jumi-rotate-x: 0;
    --jumi-rotate-x-sluPV-0: 0;
    --jumi-rotate-x-sluPV-100: 2;
    --jumi-background-color-Zkj828-100: #ff0000;
    --jumi-background-color-Zkj828-0: transparent;
  `

  test('both spellings of a frame name are read, by stop', () => {
    expect(framesOf(css, 'rotate-x').far.value).toBe('2')
    expect(framesOf(css, 'rotate-x').first.value).toBe('0')
    expect(framesOf(css, 'background-color').far.value).toBe('#ff0000')
  })

  test('a sheet with one frame is refused rather than compared with itself', () => {
    expect(() => framesOf('--jumi-rotate-x-a-0: 0;', 'rotate-x')).toThrow(
      /one frame/,
    )
  })
})

describe('the verdict', () => {
  const rests = { preserved: true, registered: '0px', without: '0px' }
  const agree = { agrees: true, native: ['a'], typed: ['a'] }
  const seen = {
    applied: '0px',
    bare: 'auto',
    canary: { exercised: true },
    property: 'gap',
    rest: rests,
    series: agree,
  }

  test('a blind fixture is not a verdict about the representation', () => {
    const verdict = verdictOf({
      ...seen,
      canary: { exercised: false },
    })

    expect(verdict.verdict).toBe('fixture-unobservable')
    expect(verdict.cause).toBe('constituent invisible')
  })

  test('the two refusals are told apart from invisibility by measurement', () => {
    const unknown = verdictOf({
      ...seen,
      applied: '',
      bare: '',
      canary: { exercised: false },
    })
    const neverComputed = verdictOf({
      ...seen,
      applied: 'auto',
      bare: 'auto',
      canary: { exercised: false },
    })

    expect(unknown.verdict).toBe('fixture-unobservable')
    expect(unknown.cause).toBe('no computed form')
    // An application that computes to what a bare element reads was never a property fact: the emission does not
    // produce a valid value for the pair, and the ruling moved that finding into the reshape track — the leaves
    // decompose a grammar along boundaries the browser does not recognise.
    expect(neverComputed.verdict).toBe('reshape-required')
    expect(neverComputed.cause).toBe('the emission produces no valid value')
  })

  test('an expression unit is reshape, not unsafe interpolation, and it wins over the differential', () => {
    // The ruling: we did not prove the typed representation interpolates incorrectly — we proved the
    // representation was aimed at the wrong unit. So it is neither `interpolation-unsafe` nor a
    // divergence, even when the series also differ.
    const verdict = verdictOf({
      ...seen,
      series: {
        agrees: false,
        native: ['0', '1', '1', '2', '2'],
        nativeEndpoints: ['0', '2'],
        nativeFlat: false,
        typed: ['0', '0', '0', '0', '0'],
      },
      unit: {
        expression: true,
        frames: ['add(0)', 'add(2)'],
        syntax: '<integer>',
      },
    })

    expect(verdict.verdict).toBe('reshape-required')
    expect(verdict.cause).toBe('the interpolation unit is an expression')
    expect(verdict.reason).toContain('add(2)')
  })

  test('a rest that does not survive the syntax is still registration-unsafe, unit or not', () => {
    expect(
      verdictOf({
        ...seen,
        rest: { preserved: false, registered: '0px', without: 'medium' },
        unit: { expression: true, frames: ['a', 'b'], syntax: '<length>' },
      }).verdict,
    ).toBe('registration-unsafe')
  })

  test('a missing native baseline is not a divergence', () => {
    const flat = verdictOf({
      ...seen,
      series: {
        agrees: false,
        native: ['0deg'],
        nativeEndpoints: ['0deg', '0.894427 0 0.447214 0deg'],
        nativeFlat: true,
        typed: ['0deg', '1 0 1 0deg'],
      },
    })
    const diverges = verdictOf({
      ...seen,
      series: {
        agrees: false,
        native: ['0', '1'],
        nativeEndpoints: ['0', '2'],
        nativeFlat: false,
        typed: ['0', '0'],
      },
    })

    expect(flat.verdict).toBe('unresolved')
    expect(flat.cause).toBe('no native baseline')
    expect(diverges.verdict).toBe('interpolation-unsafe')
  })

  test('the rest gates interpolation, and the two unsafe classes stay apart', () => {
    expect(
      verdictOf({
        ...seen,
        rest: { preserved: false, registered: '0px', without: 'medium' },
      }).verdict,
    ).toBe('registration-unsafe')

    expect(
      verdictOf({
        ...seen,
        series: { agrees: false, native: ['a'], typed: ['b'] },
      }).verdict,
    ).toBe('interpolation-unsafe')
  })
  test('movable needs the canary, the rest and the series', () => {
    const verdict = verdictOf(seen)

    expect(verdict.verdict).toBe('movable')
    expect(verdict.reason).toBe(null)
    expect(verdict.cause).toBe(null)
  })

  test('every verdict the assembler can return is in the vocabulary', () => {
    for (const verdict of [
      verdictOf({ ...seen, canary: { exercised: false } }),
      verdictOf({
        ...seen,
        applied: '',
        bare: '',
        canary: { exercised: false },
      }),
      verdictOf({
        ...seen,
        applied: 'auto',
        bare: 'auto',
        canary: { exercised: false },
      }),
      verdictOf({
        ...seen,
        rest: { preserved: false, registered: 'a', without: 'b' },
      }),
      verdictOf({
        ...seen,
        series: { agrees: false, native: ['a'], typed: ['b'] },
      }),
      verdictOf({
        ...seen,
        series: {
          agrees: false,
          native: ['a'],
          nativeEndpoints: ['a', 'b'],
          nativeFlat: true,
          typed: ['b'],
        },
      }),
      verdictOf({
        ...seen,
        unit: { expression: true, frames: ['a', 'b'], syntax: '<integer>' },
      }),
      verdictOf(seen),
    ])
      expect(VERDICTS).toContain(verdict.verdict)
  })
})
