import { describe, expect, it } from 'vitest'

import { finalize, finalizeCss, stagingMarker } from '@/helpers/carriers'

import postcss from 'postcss'

/**
 * The finalizer *is* the feature now, so it is tested against the constructs rather than the happy
 * path: nested at-rules, nested rules, comments, strings, `var()` fallbacks, and the exact
 * whitespace of a stylesheet it must not disturb.
 *
 * Two properties carry more weight than the rest. The synthesized rules are the only place the
 * composition exists, so which selectors they land on is the whole contract. And the payload is
 * addressed by name, so the locator has to tell an activation from a control that declares a
 * different property — a `--jumi-` prefix is not enough, and neither is a suffix pattern that
 * matches the stagger slot.
 */

/**
 * A payload rule. Every declaration is staged under its kind, because that is where the kind lives:
 * a name cannot collide with a different name when a host coalesces payload rules, and a property
 * value can — which is how the animations composition was once handed the transition's data.
 */
const payload = (kind: string, declarations: string, selector = ':root') => {
  const staged = declarations
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const at = part.indexOf(':')

      return `${stagingMarker}${kind}-${part.slice(0, at).trim()}: ${part.slice(at + 1).trim()};`
    })
    .join(' ')

  return `${selector} { ${staged} }`
}

/** An activation: the generated name variable a slot is declared by, on the rule declaring it. */
const activation = (
  selector: string,
  name = 'rotate-3zWYd',
  attribute = 'rotate',
) =>
  `${selector} { --jumi-${name}-animation-name: jumi-${name}; --jumi-${attribute}-${name}: 45deg; }`

/** A motion's transition chain, as the `transition-*` utilities declare it. */
const motionActivation = (selector: string, motion = 'rotate') =>
  `${selector} { --jumi-${motion}-transition-property: ${motion}; --jumi-${motion}-transition-duration: 500ms; }`

const ANIMATIONS = payload(
  'animations',
  [
    'animation-name: var(--jumi-rotate-3zWYd-animation-name, var(--jumi-animation-name));',
    'interpolate-size: var(--jumi-interpolate-size);',
    '--jumi-animation-duration: 1s;',
  ].join(' '),
)

const TRANSITIONS = payload(
  'transitions',
  [
    'transition: var(--jumi-rotate-transition-property) 500ms;',
    '--jumi-transition-duration: 0s;',
  ].join(' '),
)

/** The selectors a stylesheet's utilities layer holds, in source order. */
const layerRules = (css: string) => {
  const found: string[] = []

  postcss.parse(css).walkAtRules('layer', layer => {
    if (!layer.params.includes('utilities') || !layer.nodes) return
    found.push(
      ...layer.nodes.map(node =>
        node.type === 'rule' ? node.selector : `@${node.type}`,
      ),
    )
  })

  return found
}

describe('the finalizer', () => {
  it('synthesizes the composition on the selectors that activate it', () => {
    const css = [ANIMATIONS, activation('.animate-rotate-45')].join('\n')

    const { animations, css: out, staging } = finalizeCss(css)

    expect({ animations, staging }).toEqual({ animations: 1, staging: 1 })

    // The activator carries the slot's hoisted value and the composition carries one shallow
    // reference to it. That split is the whole change: ten lists of every slot became one list of
    // shallow references, and the ten chains moved onto the rule that activates the slot.
    expect(out).toContain(
      '--jumi-slot-rotate-3zWYd: var(--jumi-rotate-3zWYd-animation-name, var(--jumi-animation-name)) 0s linear 0s 1 normal none running;',
    )
    expect(out).toContain('animation: var(--jumi-slot-rotate-3zWYd, none);')

    // A payload declaration that is not a slot reference is still written verbatim: `interpolate-size`
    // is a real property and rides the same channel.
    expect(out).toContain('interpolate-size: var(--jumi-interpolate-size);')

    // And none of the transport survives it.
    expect(out).not.toContain(stagingMarker)
  })

  it('separates the element-local defaults from the composition', () => {
    const { css: out } = finalizeCss(
      [ANIMATIONS, activation('.animate-rotate-45')].join('\n'),
    )

    // The same selectors twice: the defaults are the substrate the element resolves through and the
    // composition is what the browser applies. Two rules, because they have opposite cascade
    // responsibilities — one exists to be overridden, the other to win.
    expect(out).toContain('--jumi-animation-duration: 1s;')
    expect(out).toContain('animation: var(--jumi-slot-rotate-3zWYd, none);')

    // And not `:where()`, which is how this started. A pseudo-element cannot appear inside it, and
    // `before:` / `after:` are ordinary Jumi usage: the rule was dropped as invalid, the substrate
    // never arrived, and the composition's `var()` fallback then made the whole declaration invalid
    // at computed-value time on that pseudo-element. Measured — the composition computed to `none`.
    expect(out).not.toContain(':where(')
  })

  it('writes a name into the hoist, and fills the three parts the shorthand cannot carry', () => {
    // An effect, because its slot key is the definition's own word — the shape where two names share one
    // slot and the composition therefore cannot tell them apart on its own.
    const named = payload(
      'animations',
      [
        'animation-name: var(--jumi-fade-in-animation-name, var(--jumi-animation-name));',
        'animation-duration: var(--jumi-slot-fade-in-animation-duration, var(--jumi-fade-in-animation-duration, var(--jumi-animation-duration)));',
        'animation-composition: var(--jumi-slot-fade-in-animation-composition, var(--jumi-fade-in-animation-composition, var(--jumi-animation-composition)));',
      ].join(' '),
    )

    const { css: out } = finalizeCss(
      [
        named,
        '.animate-fade-in\\/reveal { --jumi-fade-in-animation-name: jumi-fade-in; --jumi-fade-in-label: reveal; }',
      ].join('\n'),
    )

    // The parts the shorthand carries travel **inside the hoist's value**, where the rule that named the
    // motion can name it: the control's variable is the value's first link, and no slot-keyed variable
    // stands between them. That is the link layer the hoist used to be filled through.
    expect(out).toContain(
      '--jumi-slot-fade-in: var(--jumi-fade-in-animation-name, var(--jumi-animation-name))',
    )
    expect(out).toContain(
      'var(--jumi-label-reveal-animation-duration, var(--jumi-fade-in-animation-duration, var(--jumi-animation-duration)))',
    )

    // The chain behind the name is untouched, so an unset label still falls through to the definition
    // and then to the shared default — the property the whole arrangement depends on.
    expect(out).toContain(
      'var(--jumi-fade-in-animation-duration, var(--jumi-animation-duration))',
    )

    // None of the seven is assigned on the rule any more, which is what removes the layer.
    for (const part of [
      'animation-delay',
      'animation-direction',
      'animation-duration',
      'animation-fill-mode',
      'animation-iteration-count',
      'animation-play-state',
      'animation-timing-function',
    ])
      expect(out).not.toContain(`--jumi-slot-fade-in-${part}:`)

    // The three the shorthand cannot carry are filled here, and for this shape they have to be. An effect
    // keys its slot by the definition, because every name of that effect shares one slot — so the chain
    // cannot read a label: the composition is one rule for every activating selector, and a name written
    // there would be whichever name was recorded last. That is the nondeterminism the fills were built
    // for. Measured after removing them unconditionally: a named effect's three parts read
    // `--jumi-slot-fade-in-animation-composition` with nothing writing it — the control was ignored —
    // while a named *value*, whose key spells its name, read the label and needed nothing here.
    for (const part of [
      'animation-composition',
      'animation-range',
      'animation-timeline',
    ])
      expect(out).toContain(
        `--jumi-slot-fade-in-${part}: var(--jumi-label-reveal-${part});`,
      )
  })

  it('leaves a motion nothing named reading its own slot', () => {
    const named = payload(
      'animations',
      'animation-name: var(--jumi-fade-in-animation-name, var(--jumi-animation-name)); animation-duration: var(--jumi-slot-fade-in-animation-duration, var(--jumi-fade-in-animation-duration, var(--jumi-animation-duration)));',
    )

    const { css: out } = finalizeCss(
      [
        named,
        '.animate-fade-in { --jumi-fade-in-animation-name: jumi-fade-in; }',
      ].join('\n'),
    )

    // No label on the rule means no name to write: the value keeps the slot's own link, which nothing
    // declares, so it resolves through the fallbacks exactly as it did before the layer was removed.
    expect(out).toContain(
      '--jumi-slot-fade-in: var(--jumi-fade-in-animation-name, var(--jumi-animation-name)) var(--jumi-slot-fade-in-animation-duration, var(--jumi-fade-in-animation-duration, var(--jumi-animation-duration)))',
    )
    expect(out).not.toContain('--jumi-label-')
  })

  it('groups every activating selector once, in document order', () => {
    const css = [
      ANIMATIONS,
      activation('.animate-rotate-45', 'rotate-3zWYd'),
      activation('.animate-scale-110', 'scale-d38', 'scale'),
      // The same selector twice, which a variant and a duplicate utility both produce. A selector
      // list repeats what it is given, so this has to collapse.
      activation('.animate-scale-110', 'scale-d38', 'scale'),
    ].join('\n')

    const { animations, css: out } = finalizeCss(css)

    expect(animations).toBe(2)
    expect(out).toContain('.animate-rotate-45,\n.animate-scale-110 {')
    // Document order, not sorted order: the page's order is the only order that is a fact.
    expect(out).not.toContain('.animate-scale-110,\n.animate-rotate-45')
  })

  it('opens the layer with the defaults and closes it with the composition', () => {
    const css = [
      '@layer utilities {',
      activation('.animate-rotate-45'),
      '.animation-duration-500 { --jumi-animation-duration: 500ms; }',
      '}',
      ANIMATIONS,
      '@layer base { .registered { color: red; } }',
    ].join('\n')

    const { css: out } = finalizeCss(css)

    // Within the layer, in order: the defaults, then everything Tailwind emitted — an activation and
    // a control — then the composition. That is the invariant, and it is constructed here rather
    // than inherited from whichever order Tailwind happened to choose.
    //
    // Order is what settles precedence now that `:where()` is gone: a control is an ordinary utility
    // in this layer, so a default placed ahead of every utility declaration loses to it, and the
    // composition — which exists to win — keeps the selectors' own specificity and sits last. Both
    // stay inside `@layer utilities`, where a utility draws its cascade strength: `base` would lose
    // to `components`, which the placement differential measured.
    expect(out.indexOf('--jumi-animation-duration: 1s')).toBeLessThan(
      out.indexOf('--jumi-animation-duration: 500ms'),
    )
    expect(out.indexOf('--jumi-animation-duration: 500ms')).toBeLessThan(
      out.indexOf('animation: var(--jumi-slot-'),
    )

    // And the defaults really are the first thing the layer holds, not merely earlier than the one
    // control this fixture happens to include.
    expect(layerRules(out)[0]).toBe('.animate-rotate-45')
    expect(out.slice(out.indexOf('@layer utilities'))).toMatch(
      /^@layer utilities \{\n\.animate-rotate-45 \{ --jumi-animation-duration/,
    )
  })

  it('leaves a stylesheet that staged nothing exactly as it found it', () => {
    const css =
      '/* keep me */\n.animate-rotate-45 { --jumi-rotate-a-animation-name: jumi-rotate-a; }'

    expect(finalizeCss(css)).toEqual({
      animations: 0,
      css,
      staging: 0,
      transitions: 0,
      viewTransitions: 0,
      warnings: [],
    })
  })

  it('invents nothing from a payload that nothing activates', () => {
    const { animations, css: out, staging } = finalizeCss(ANIMATIONS)

    // The payload is consumed either way — it is transport, and transport is never output. What is
    // not invented is a composition, because there is no selector to write one on.
    expect({ animations, out, staging }).toEqual({
      animations: 0,
      out: '',
      staging: 1,
    })
  })

  it('keeps the two kinds apart, and writes each from its own payload', () => {
    const css = [
      ANIMATIONS,
      TRANSITIONS,
      activation('.animate-rotate-45'),
      motionActivation('.transition-duration-500\\/rotate'),
    ].join('\n')

    const { animations, css: out, transitions } = finalizeCss(css)

    expect({ animations, transitions }).toEqual({
      animations: 1,
      transitions: 1,
    })
    expect(out).toContain(
      'transition: var(--jumi-rotate-transition-property) 500ms;',
    )

    // Each kind's defaults carry that kind's selectors: the transition substrate is not written
    // onto the animation selectors, or the other way round.
    expect(out).toContain(
      '.animate-rotate-45 { --jumi-animation-duration: 1s; }',
    )
    expect(out).toContain(
      '.transition-duration-500\\/rotate { --jumi-transition-duration: 0s; }',
    )
  })

  it('does not read a control as an activation', () => {
    // A control writes a different property. `--jumi-rotate-animation-duration` is not the name a
    // slot is declared by, and `--jumi-transition-duration` names no motion at all — so neither is
    // an element that animates, and neither earns a composition.
    const css = [
      ANIMATIONS,
      TRANSITIONS,
      '.animation-duration-500 { --jumi-rotate-animation-duration: 500ms; }',
      '.transition-duration-500 { --jumi-transition-duration: 500ms; }',
    ].join('\n')

    const { animations, css: out, transitions } = finalizeCss(css)

    expect({ animations, transitions }).toEqual({
      animations: 0,
      transitions: 0,
    })
    // The controls are output and stay exactly as they were; only the transport is consumed.
    expect(out).toContain(
      '.animation-duration-500 { --jumi-rotate-animation-duration: 500ms; }',
    )
    expect(out).toContain(
      '.transition-duration-500 { --jumi-transition-duration: 500ms; }',
    )
    expect(out).not.toContain(stagingMarker)
  })

  it('does not read the stagger slot as a transition', () => {
    // `--jumi-stagger-animation-delay` is set on the children of a stagger utility, and it ends in
    // `-delay` the way a transition control does. Requiring `-transition-` is what keeps a stagger
    // from being answered with a `transition` list it never asked for.
    const css = [
      TRANSITIONS,
      '.animate-stagger-forward-120\\/7 > * { --jumi-stagger-animation-delay: calc((sibling-index() - 1) * 120ms); }',
    ].join('\n')

    expect(finalizeCss(css).transitions).toBe(0)
  })

  it('does not mistake a comment or a string for the protocol', () => {
    const css = [
      `/* ${stagingMarker}animations-animation-name: x; */`,
      `.quoted { content: "${stagingMarker}animations-animation-name"; }`,
      activation('.animate-rotate-45'),
    ].join('\n')

    // Neither is a declaration, so there is no payload to read — and a string that names the marker
    // must not become one. Nothing is synthesized, because nothing was published.
    expect(finalizeCss(css)).toEqual({
      animations: 0,
      css,
      staging: 0,
      transitions: 0,
      viewTransitions: 0,
      warnings: [],
    })
  })

  it('keeps a value that only looks like it ends early', () => {
    // Written out rather than through `payload()`, because the value is the fixture: a declaration
    // whose text a naive split would end early.
    const css = [
      `:root { ${stagingMarker}animations-animation-name: var(--a, "x;y"), var(--b, "}" ); }`,
      activation('.animate-rotate-45'),
    ].join('\n')

    // Neither entry references a slot, so both are written into the `animation` list verbatim rather
    // than hoisted — and the point of the fixture is that a value only *looks* like it ends early.
    const out = finalizeCss(css).css

    expect(out).toContain('var(--a, "x;y")')
    expect(out).toContain('var(--b, "}" )')
  })

  it('takes the last publication, the way a later declaration would win', () => {
    const css = [
      payload('animations', 'animation-name: var(--first);'),
      payload('animations', 'animation-name: var(--second);'),
      activation('.animate-rotate-45'),
    ].join('\n')

    const { css: out, staging } = finalizeCss(css)

    expect(staging).toBe(2)
    expect(out).toContain(
      'animation: var(--second) 0s linear 0s 1 normal none running;',
    )
    expect(out).not.toContain('var(--first)')
  })

  it('is idempotent, byte for byte', () => {
    const once = finalizeCss(
      [ANIMATIONS, activation('.animate-rotate-45')].join('\n'),
    )
    const twice = finalizeCss(once.css)

    // The first pass removed every payload rule, so the second finds nothing to read and nothing to
    // add. Collecting facts before mutating the AST is what makes this hold.
    expect(twice).toEqual({
      animations: 0,
      css: once.css,
      staging: 0,
      transitions: 0,
      viewTransitions: 0,
      warnings: [],
    })
  })

  it('prefers an aggregate handed to it over the one in the stylesheet', () => {
    const css = [ANIMATIONS, activation('.animate-rotate-45')].join('\n')

    const { css: out } = finalizeCss(css, { 'animation-name': 'var(--fresh)' })

    expect(out).toContain(
      'animation: var(--fresh) 0s linear 0s 1 normal none running;',
    )
    expect(out).not.toContain('var(--jumi-animation-name)')
    expect(out).not.toContain(stagingMarker)
  })

  it('walks an AST in place, so a host that owns one needs no parse', () => {
    const root = postcss.parse(
      [ANIMATIONS, activation('.animate-rotate-45')].join('\n'),
    )

    const { animations, staging } = finalize(root)

    expect({ animations, staging }).toEqual({ animations: 1, staging: 1 })
    expect(root.toString()).toContain(
      'animation: var(--jumi-slot-rotate-3zWYd, none);',
    )
    expect(root.toString()).not.toContain(stagingMarker)
  })

  it('leaves no build-time name in the stylesheet it returns', () => {
    const lists = [
      'animation-composition: var(--jumi-animation-composition);',
      'animation-delay: var(--jumi-animation-delay);',
      'animation-name: var(--jumi-animation-name);',
      'animation-timeline: var(--jumi-animation-timeline);',
    ].join(' ')

    const { css: out } = finalizeCss(
      [payload('animations', lists), activation('.animate-rotate-45')].join(
        '\n',
      ),
    )

    // The invariant. Everything the staging namespace spells is build-time only, and a browser
    // should never be handed any of it.
    expect(out).not.toContain(stagingMarker)

    // `--jumi-animation-name` is the *substrate* name and not a slot's, so it is not a reference the
    // hoist can follow. It is written into the shorthand verbatim, and the two longhands the
    // shorthand resets are declared after it.
    expect(out).toContain(
      'animation: var(--jumi-animation-name) 0s linear var(--jumi-animation-delay) 1 normal none running;',
    )
    expect(out).toContain('animation-timeline: var(--jumi-animation-timeline);')
  })
})
