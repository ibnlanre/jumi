/**
 * The same-document view-transition lab.
 *
 * `document.startViewTransition()` is here purely as a *platform driver*: it is the only thing that
 * makes a browser build a `::view-transition-*` pseudo tree at all. Nothing in this file is a Jumi
 * concern and none of it is proposed as Jumi behaviour — the harness needs a measurement surface,
 * and this is that surface.
 *
 * Two deliberate choices make the tree measurable instead of a 250 ms blur:
 *
 *   · durations are long (the harness sets them), so the tree stays alive;
 *   · `advance(t)` pauses every pseudo animation and seeks it with `currentTime`, because a
 *     backgrounded page freezes animation ticking and a real-time sampler would then measure
 *     nothing at all.
 *
 * The lab also owns the one piece of genuinely useful logic here: `jumi()`, which pulls the two
 * halves of the emitted composition — the substrate rule and the aggregate longhand rule — out of
 * the linked stylesheet by their *shape*, so a retarget test can replay them under a different
 * selector without hand-transcribing anything.
 */

const stage = document.querySelector('#stage')
const style = document.querySelector('#vt')
const root = document.documentElement

const PSEUDO = '::view-transition'

const READ = [
  'animationName',
  'animationDuration',
  'animationDirection',
  'animationFillMode',
  'animationTimingFunction',
  // The property the UA's `-ua-mix-blend-mode-plus-lighter` animates on old/new. An author
  // animation replaces that UA animation, so this is what says whether the snapshots still
  // composite additively or fall back to `normal` — which is the cross-fade bleed question.
  'mixBlendMode',
  'opacity',
  'transform',
]

/**
 * Split on the commas that separate list items, ignoring the ones inside `var(…, …)` fallbacks. A
 * naive `split(',')` over a *declared* `animation-name` list counts every fallback comma and
 * roughly doubles the answer, which is exactly the kind of off-by-a-factor that makes a
 * measurement unquotable.
 */
const items = value => {
  let depth = 0
  let current = ''
  const out = []

  for (const char of value) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1

    if (char === ',' && depth === 0) {
      out.push(current)
      current = ''

      continue
    }

    current += char
  }

  out.push(current)

  return out.map(part => part.trim())
}

const read = pseudo => {
  const out = { declared: 0, exists: false, pseudo }
  let cs = null

  try {
    cs = getComputedStyle(root, pseudo)
  } catch (error) {
    out.error = String(error)

    return out
  }

  if (!cs) {
    out.error = 'null style declaration'

    return out
  }

  out.declared = cs.length

  if (cs.length === 0) return out

  out.exists = true

  for (const key of READ) out[key] = cs[key]

  out.slot = cs.getPropertyValue('--jumi-fade-in-animation-name').trim()
  out.globalDuration = cs.getPropertyValue('--jumi-animation-duration').trim()

  return out
}

const running = () =>
  document
    .getAnimations()
    .filter(animation =>
      (animation.effect?.pseudoElement ?? '').startsWith(PSEUDO),
    )
    .map(animation => ({
      duration: animation.effect.getTiming?.().duration ?? null,
      frames: animation.effect.getKeyframes?.().length ?? null,
      name: animation.animationName ?? null,
      pseudo: animation.effect.pseudoElement,
    }))

const tile = item => {
  const el = document.createElement('div')

  el.className = `tile${item.cls ? ` ${item.cls}` : ''}`
  el.id = item.id
  el.textContent = item.text ?? item.id

  if (item.name) el.style.viewTransitionName = item.name

  return el
}

const OPS = {
  mount: arg => {
    for (const item of arg) stage.append(tile(item))
  },
  move: () => stage.classList.toggle('moved'),
  none: () => {},
  recolor: () => root.style.setProperty('--tile-bg', '#db2777'),
  remove: arg => document.getElementById(arg)?.remove(),
  shape: () => stage.firstElementChild.classList.toggle('tall'),
  text: () => {
    stage.firstElementChild.replaceChildren('changed')
  },
  unname: arg => {
    const el = document.getElementById(arg)

    if (el) el.style.viewTransitionName = 'none'
  },
}

let current = null

export const api = {
  /**
   * The declarations that activate a slot for `selector`, verbatim.
   *
   * This is the third thing a view-transition retarget needs, and the hoist is why. The composition
   * reads `--jumi-slot-<slot>`, and that publication does not live on the composition — it lives on
   * the rule that declares the slot's activation, which is a utility selector that a pseudo-element
   * never matches. Replaying the substrate and the aggregate alone leaves every position falling back
   * to `none`: the composition applies, and nothing animates.
   *
   * The whole body comes back rather than the activation variable alone, because the publication
   * chain reads the activation and both are written by the same rule.
   */
  activation(selector) {
    const walk = rule => {
      const out = [rule]

      if (rule.cssRules)
        for (const child of rule.cssRules) out.push(...walk(child))

      return out
    }

    for (const sheet of document.styleSheets) {
      let rules = []

      try {
        rules = [...sheet.cssRules].flatMap(walk)
      } catch {
        continue
      }

      const found = rules.find(
        rule =>
          rule.selectorText === selector &&
          [...rule.style].some(name => name.startsWith('--jumi-slot-')),
      )

      if (found) return { declarations: found.style.cssText, selector }
    }

    return { declarations: null, selector }
  },

  /** Pause every pseudo animation and seek it, then measure. Returns how many were driven. */
  advance(t, pseudos = []) {
    const list = document
      .getAnimations()
      .filter(a => (a.effect?.pseudoElement ?? '').startsWith(PSEUDO))

    for (const animation of list) {
      animation.pause()

      try {
        animation.currentTime = t
      } catch {
        /* an animation that cannot seek is reported by the sample it leaves behind */
      }
    }

    return { driven: list.length, ...this.measure(pseudos) }
  },

  finish() {
    current?.skipTransition?.()
    current = null
  },

  /**
   * The two halves of the emitted composition, found by shape rather than by name.
   *
   * A Jumi build emits the substrate — the `--jumi-animation-*` defaults and the slot variables — in
   * one rule, and the aggregate in another. What the aggregate *is* changed when the composition
   * became a hoist: it used to declare the ten `animation-*` longhands, and it now declares the
   * `animation` shorthand, the two longhands the shorthand resets, and one shallow
   * `var(--jumi-slot-<slot>, none)` per position. So the finder is structural — shorthand plus the
   * two resets plus a slot reference — and not "the rule whose `animation-name` mentions Jumi",
   * which silently returned `null` here for a whole pass after the hoist landed.
   */
  jumi() {
    const sheet = [...document.styleSheets].find(s =>
      (s.href ?? '').endsWith('/jumi.css'),
    )

    if (!sheet) return { error: 'jumi.css not found' }

    const walk = rule => {
      const out = [rule]

      if (rule.cssRules)
        for (const child of rule.cssRules) out.push(...walk(child))

      return out
    }

    const flat = [...sheet.cssRules].flatMap(walk)
    const styled = flat.filter(rule => rule.selectorText)
    const value = (rule, property) => rule.style.getPropertyValue(property)

    const substrate = styled.find(
      rule => value(rule, '--jumi-animation-name') === 'none',
    )

    /**
     * Found by declaration text, not by `getPropertyValue('animation')`.
     *
     * An `animation` shorthand whose value contains `var()` cannot be expanded into longhands, and
     * CSSOM then serializes the shorthand as the empty string — so the obvious lookup returns `''`
     * for exactly the rule this is looking for. The text is the only place the shorthand is legible,
     * and the order check (the shorthand, then the two longhands it resets) is what distinguishes the
     * synthesized rule from any utility that happens to declare an animation.
     */
    const aggregate = styled.find(rule => {
      const text = rule.style.cssText
      const shorthand = text.search(/(?<![\w-])animation\s*:/)
      const resets = Math.max(
        text.indexOf('animation-composition'),
        text.indexOf('animation-timeline'),
      )

      return (
        shorthand >= 0 &&
        resets > shorthand &&
        text.includes('var(--jumi-slot-')
      )
    })
    const keyframes = flat
      .filter(rule => rule.type === CSSRule.KEYFRAMES_RULE)
      .map(rule => rule.name)
    const hoisted = styled.filter(rule =>
      [...rule.style].some(name => name.startsWith('--jumi-slot-')),
    )

    return {
      aggregate: aggregate ? aggregate.style.cssText : null,
      hoistedRules: hoisted.length,
      keyframes,
      selectors: {
        aggregate: aggregate ? aggregate.selectorText.slice(0, 96) : null,
        aggregateCount: aggregate
          ? aggregate.selectorText.split(',').length
          : 0,
        substrate: substrate ? substrate.selectorText.slice(0, 96) : null,
        substrateCount: substrate
          ? substrate.selectorText.split(',').length
          : 0,
      },
      substrate: substrate ? substrate.style.cssText : null,
    }
  },

  /** True when the browser built a pseudo-element with this name for the active transition. */
  live(pseudo) {
    return document
      .getAnimations()
      .some(animation => animation.effect?.pseudoElement === pseudo)
  },

  /**
   * Every rule in the document that sets `animation-name` and matches `selector`, in sheet order.
   * This is what distinguishes "the declaration never arrived" from "it arrived and lost": a
   * computed value alone cannot say which of several matching rules won.
   */
  matching(selector) {
    const target = document.querySelector(selector)
    const found = []

    if (!target) return found

    const walk = rule => {
      const animation = rule.style?.getPropertyValue('animation-name')

      if (rule.selectorText && animation) {
        let matches = false

        try {
          matches = target.matches(rule.selectorText)
        } catch {
          /* a selector the parser rejects cannot match */
        }

        if (matches) {
          found.push({
            entries: items(animation).length,
            jumi: [
              ...new Set(
                items(animation).filter(part => part.startsWith('jumi-')),
              ),
            ].slice(0, 4),
            selector:
              rule.selectorText.length > 64
                ? `${rule.selectorText.slice(0, 64)}…`
                : rule.selectorText,
          })
        }
      }

      if (rule.cssRules) for (const child of rule.cssRules) walk(child)
    }

    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) walk(rule)
      } catch {
        /* a cross-origin sheet is not readable, and there are none here */
      }
    }

    return found
  },

  /** Everything the harness wants to know about the tree right now. */
  measure(pseudos = []) {
    return {
      active: root.matches(':active-view-transition'),
      animations: running(),
      pseudos: Object.fromEntries(
        pseudos.map(pseudo => [pseudo, read(pseudo)]),
      ),
      root: {
        duration: getComputedStyle(root)
          .getPropertyValue('--jumi-animation-duration')
          .trim(),
        slot: getComputedStyle(root)
          .getPropertyValue('--jumi-fade-in-animation-name')
          .trim(),
      },
    }
  },

  /** Rebuild the stage. */
  mount(items) {
    stage.replaceChildren(...items.map(tile))
  },

  /** Start a transition, resolve once the pseudo tree exists (or once it is refused). */
  async start(op = 'none', arg = null) {
    current?.skipTransition?.()

    const transition = document.startViewTransition(() =>
      (OPS[op] ?? OPS.none)(arg),
    )

    current = transition

    try {
      await transition.ready

      return { ready: true }
    } catch (error) {
      return {
        error: `${error?.name ?? 'Error'}: ${error?.message ?? error}`,
        ready: false,
      }
    }
  },

  /** Replace the harness's view-transition CSS. */
  style(css) {
    style.textContent = css
  },

  /** Set custom properties on `:root`. `null` removes one. */
  vars(map) {
    for (const [name, value] of Object.entries(map)) {
      if (value === null) root.style.removeProperty(name)
      else root.style.setProperty(name, value)
    }
  },
}

window.__vt = api
window.__vtReady = true
