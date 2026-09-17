/**
 * What must be observed to prove that a `(parent, component)` pair can move onto typed execution.
 *
 * The census unit is the pair — a component can be a bare part of one attribute and an argument of another
 * — and the interpolation differential showed that the pair does **not** name the surface that has to be
 * read. `background-position-x-edge` composes into a *pair*, its own longhand drops that pair, and
 * `background-position` honours it. So the relation the evidence has to carry is not
 *
 *   (parent, component) → observation surface
 *
 * but
 *
 *   (parent, component) → consumer surface → observation method → semantic context(s)
 *
 * Three of those four are the model's to answer and one is ours:
 *
 *   consumer    **model-backed, twice**: the candidate table names the surface a class addresses
 *               (`animate-background-position-x-offset` addresses `background-position` with part
 *               `background-position-x-offset`; `animate-column-gap` addresses `gap` with part
 *               `column-gap`), and the composition graph explains why that surface is the right one —
 *               it is an ancestor of the part's parent, reached by walking `dependencies`, which is the
 *               same relation the census counted its 324 pairs from. The emission is the third reading and
 *               the book checks it: the candidate's `attribute` is the property the emitted keyframe hands
 *               the composition to. Nothing here guesses a CSS property name, and nothing here infers a
 *               surface from the pair's *name*: `column-gap`'s consumer really is `gap`.
 *   method      **declared per class**: `computed`, `used-gap`, `border-box`. The model knows what
 *               composes what, not how a value becomes observable, and a browser is the only thing that
 *               knows the difference between a computed string and a used value.
 *   context     **declared per class**: a claim about the semantics we intend to preserve. `normal` means
 *               `0` in flex and grid and `1em` in multi-column, so one fixture cannot establish a
 *               used-value class — a context where the claim is *false* has to be in the set.
 *
 * The declaration is the input and the browser is the judge: a descriptor whose method cannot see the
 * constituent at all is a broken fixture, not a finding about the property (`fixture-unobservable`, which
 * is why that verdict names the fixture rather than the semantics).
 */
import {
  readCandidates,
  readPropertyEntries,
  readTypedExecutions,
  readTypedLeaves,
} from './property-model.mjs'
import { varReferences } from './var-references.mjs'

const ENTRIES = readPropertyEntries()
const CANDIDATES = readCandidates()
const TYPED = readTypedLeaves()

/**
 * Every composition chain above one slot: the entries that declare this slot in their `dependencies`,
 * then the same question about each of those, upward until nothing composes the result.
 *
 * Read from `dependencies` rather than from the composition modules on purpose. The compositions are
 * identifiers (`value: backgroundPosition`) resolved in `src/composition/*.ts`, but `dependencies` is
 * already the edge the census counted its pairs from, so walking it keeps the descriptor's graph and the
 * census's graph the same object instead of two readers of one fact.
 */
export const chainsOf = (slot, seen = new Set()) => {
  const parents = ENTRIES.filter(
    entry => !seen.has(entry.slot) && entry.deps.includes(slot),
  )

  if (!parents.length) return [[]]

  return parents.flatMap(entry =>
    chainsOf(entry.slot, new Set([entry.slot, ...seen])).map(rest => [
      entry.slot,
      ...rest,
    ]),
  )
}

/**
 * The descriptor for one pair.
 *
 * `consumer` is the **candidate's** attribute — the model's own answer to "which property does this motion
 * hand a value to" — and the composition graph is then used as a check rather than as the source: the
 * consumer has to be reachable from the component through composition (the component itself, its parent,
 * or an ancestor of its parent). A component whose candidate addresses a surface the graph cannot reach
 * means one of the two has moved, and the descriptor fails loudly instead of measuring something adjacent.
 */
export const descriptorOf = ({ candidate, component, contexts, method }) => {
  const entry = CANDIDATES.find(one => one.name === candidate)

  if (!entry || !entry.attribute)
    throw new Error(`no candidate named \`${candidate}\` addresses a property`)

  const chains = chainsOf(component)
  // A leaf no composition reads is its own parent in the pair sense, which is how the gate's own arms
  // named `border-bottom-width`: the census's parent relation is "composes", and a whole candidate is
  // observed on the property it addresses.
  const parent = chains.find(names => names.length)?.[0] ?? component
  const chain = [
    component,
    ...(chains.find(names => names[0] === parent) ?? []),
  ]
  const addressable = new Set([component, ...chain])

  if (!addressable.has(entry.attribute))
    throw new Error(
      `\`${candidate}\` addresses \`${entry.attribute}\`, which is not reachable from \`${component}\` through composition (${chain.join(' -> ')})`,
    )

  return {
    candidate,
    chain,
    component,
    consumer: entry.attribute,
    contexts,
    method,
    parent,
    parts: entry.parts,
  }
}

/**
 * The census population: every `(parent, component)` pair the graph composes.
 *
 * Derived rather than restated, so it is the same relation the census counted and the same one the
 * descriptor walks upward. A leaf no composite reads has no pair — which is why `font-weight`, measured as
 * its own parent in the observation book, is not a member of this population.
 */
export const population = () => {
  const pairs = []

  for (const parent of ENTRIES)
    for (const component of parent.deps)
      pairs.push({ component, parent: parent.slot })

  return pairs
}

/**
 * The **authoring** half of the population: components a family exposes to authors, whether or not its
 * composition still names them.
 */
export const authoringPopulation = () => {
  const pairs = []

  for (const [attribute, surface] of readTypedExecutions())
    for (const component of surface.authoring)
      pairs.push({ component, parent: attribute })

  return pairs
}

/** The names of the leaves that exist only to be **executed**, and so cannot be entered through. */
export const executionLeaves = () =>
  new Set([...TYPED].filter(([, one]) => one.execution).map(([name]) => name))

/**
 * The census population as a **function of its three inputs** rather than as a computation over the model.
 *
 * Pure on purpose. The rule is the thing worth stating, and a rule that can only be exercised by changing the
 * model underneath it is a rule nothing tests — which is how a distinction this load-bearing stayed invisible
 * until an emission needed it.
 */
export const censusOf = ({
  authoring = [],
  composition = [],
  execution = [],
} = {}) => {
  const hidden = new Set(execution)
  const seen = new Set()
  const pairs = []

  for (const pair of [...composition, ...authoring]) {
    const key = `${pair.parent}/${pair.component}`

    if (seen.has(key) || hidden.has(pair.component)) continue

    seen.add(key)
    pairs.push(pair)
  }

  return pairs
}

/**
 * The **census population**: every pair the model exposes to an author, which is the composition graph plus the
 * declared authoring surfaces, minus the leaves that exist only to be executed.
 *
 * Neither half of that is tidying, and the two are the same missing distinction seen from opposite sides. An
 * execution leaf is reached by the composition and by nothing else — no candidate addresses it — so counting it
 * says an author can address something they cannot see. Leaving the authoring components out because the graph
 * stopped reading them says the opposite: that a reshape removed them from the surface. `dependencies` answers
 * what the property is made of and cannot answer either question, which is why the unit of measurement is
 * stated once here rather than recomputed per consumer.
 */
export const censusPopulation = () =>
  censusOf({
    authoring: authoringPopulation(),
    composition: population(),
    execution: executionLeaves(),
  })

/**
 * The candidates that address a pair, nearest surface first.
 *
 * Scoped by the **pair's own** chain, not by the component alone, because a component can be composed by
 * two parents and a candidate serves one of them: `scale-x` is composed by `scale` *and* by `scale-3d`, and
 * `animate-scale-x` addresses `scale` — so it serves `(scale, scale-x)` and not `(scale-3d, scale-x)`, whose
 * chain runs to `transform`. Selecting by component alone made the second pair look like a broken descriptor
 * instead of an unserved one, which is a different finding and a different piece of work.
 *
 * A whole candidate (`parts` empty) addresses the property itself, so it serves the component under any
 * composition that reads it.
 */
export const servingCandidates = ({ component, parent }) => {
  const chain = [
    component,
    ...(chainsOf(component).find(names => names[0] === parent) ?? []),
  ]

  return CANDIDATES.filter(
    candidate =>
      candidate.attribute &&
      chain.includes(candidate.attribute) &&
      (candidate.parts.includes(component) ||
        (!candidate.parts.length && candidate.attribute === component)),
  )
}

/** The chain of one pair: the component, then the compositions above it **through its own parent**. */
export const chainOf = ({ component, parent }) => [
  component,
  ...(chainsOf(component).find(names => names[0] === parent) ?? []),
]

/**
 * One pair's descriptor as far as the **model** can carry it, with the reason it stops when it cannot.
 *
 * No browser and no compile: coverage is a statement about what the model contains, and asking the engine
 * would answer a different question. *Where* a pair stops is the finding — no candidate addressing this
 * pair, or no representation the model declares for its component — and the two point at different work.
 */
export const describe = pair => {
  const chain = chainOf(pair)
  const candidates = servingCandidates(pair)

  if (!candidates.length)
    return {
      ...pair,
      chain,
      reason: 'no candidate addresses the pair',
      status: 'unresolved-descriptor',
    }

  const [candidate, ...others] = candidates
  const representation = TYPED.get(pair.component) ?? null

  return {
    ...pair,
    // The nearest surface is the one the motion is authored against; the rest are recorded rather than
    // dropped, because a pair served at two levels is a fact the classification pass has to know.
    alternatives: others.map(one => one.name),
    candidate: candidate.name,
    chain,
    consumer: candidate.attribute,
    reason: representation
      ? null
      : 'the model declares no representation for the component',
    representation,
    status: representation ? 'complete' : 'unresolved-descriptor',
  }
}

/** The descriptor, as the report prints it: candidate, pair, graph, consumer surface, method, contexts. */
export const print = descriptor =>
  `${descriptor.candidate}\n` +
  `     pair \`(${descriptor.parent}, ${descriptor.component})\`${descriptor.parts.length ? ` as a part of it` : ` whole`}\n` +
  `     graph ${descriptor.chain.join(' -> ')}  ·  consumer \`${descriptor.consumer}\`  ·  method \`${descriptor.method}\`\n` +
  `     contexts ${descriptor.contexts.map(name => `\`${name}\``).join(' + ')}`

/**
 * Mount one fixture: a stylesheet, and one element carrying the candidate class with `count` children.
 *
 * The element is `#e` rather than the candidate's own class so an override can win on specificity without
 * escaping a Tailwind name, and the children are plain divs the geometry method can measure between.
 */
export const mount = (page, { children = 0, klass = '', style }) =>
  page.setContent(
    `<style>${style}</style>` +
      `<div id="e" class="${klass}">` +
      Array.from(
        { length: children },
        (_, index) => `<div class="box" id="b${index}"></div>`,
      ).join('') +
      '</div>',
  )

/**
 * One observable, at each instant of the wall.
 *
 * The animations are **held and stepped**: a series read off a running animation is a property of how long
 * the sampler took to ask, and the wall is what makes two arms comparable. `method` is the descriptor's,
 * and this switch is the harness's half of that declaration — the observable itself, not a way to guess it.
 */
export const observe = (page, { at, klass = '', method, property, style }) =>
  mount(page, { children: method === 'used-gap' ? 2 : 0, klass, style }).then(
    () =>
      page.evaluate(
        async ({ at, method, property }) => {
          const node = document.querySelector('#e')
          const animations = node.getAnimations({ subtree: true })

          animations.forEach(animation => animation.pause())

          const round = value => Math.round(value * 100) / 100

          const read = () => {
            if (method === 'computed')
              return getComputedStyle(node).getPropertyValue(property).trim()

            if (method === 'used-gap') {
              const [first, second] = node.children
              const one = first.getBoundingClientRect()
              const two = second.getBoundingClientRect()

              return `${round(two.left - one.right)}px`
            }

            if (method === 'border-box') {
              const box = node.getBoundingClientRect()
              const style = getComputedStyle(node)

              return (
                `${round(box.height)}px tall, ` +
                `computed \`${style.getPropertyValue(property).trim()}\``
              )
            }

            throw new Error(`no observable named \`${method}\``)
          }

          const values = []

          for (const instant of at) {
            animations.forEach(animation => {
              animation.currentTime = instant
            })

            await new Promise(resolve => requestAnimationFrame(resolve))
            values.push(read())
          }

          return { animations: animations.length, settled: read(), values }
        },
        { at, method, property },
      ),
  )

/** The engine's reading of a list of declarations, each on an element of its own. */
export const computedOf = (page, property, declarations) =>
  page
    .setContent(
      `<style>${declarations
        .map((declaration, index) => `#q${index} { ${declaration} }`)
        .join('\n')}</style>` +
        declarations.map((_, index) => `<div id="q${index}"></div>`).join(''),
    )
    .then(() =>
      page.evaluate(
        ({ count, property }) =>
          Array.from({ length: count }, (_, index) =>
            getComputedStyle(document.getElementById(`q${index}`))
              .getPropertyValue(property)
              .trim(),
          ),
        { count: declarations.length, property },
      ),
    )

/*
 * Reading the emission.
 *
 * The interpolation book carries its own copy of these readers, with its own measured history: a
 * first-match extractor read a *staging* name (`--jumi-staging-animations---jumi-background-position-x`
 * contains the declaration it stages), which turned a fixture into a constant and looked exactly like a
 * real divergence. That book is a landed record, so its copy is left where it is; this one is the lifted
 * reader, and both carry the same discipline: select the candidate you mean, and throw when it is absent.
 *
 * A versioned slot name has mixed case (`--jumi-font-weight-eBE`), which is why the character classes here
 * are `[A-Za-z0-9-]` rather than `[a-z0-9-]`.
 */

/** Every value the sheet gives one declaration, in emission order. */
export const candidatesOf = (css, declaration) =>
  [...css.matchAll(new RegExp(`--jumi-${declaration}:\\s*([^;]+);`, 'g'))].map(
    match => match[1].trim(),
  )

/** The **composition** for one declaration: the candidate that reads the slot under test. */
export const fromSheet = (css, declaration, needle) => {
  const found = candidatesOf(css, declaration).find(value =>
    value.includes(needle),
  )

  if (!found)
    throw new Error(
      `the sheet carries no --jumi-${declaration} containing ${needle}`,
    )

  return found
}

/** The **rest** for one declaration: the candidate that is not itself a composition. */
export const restOf = (css, declaration) => {
  const found = candidatesOf(css, declaration).find(
    value => !value.includes('var('),
  )

  if (!found)
    throw new Error(
      `the sheet carries no resting value for --jumi-${declaration}`,
    )

  return found
}

/** One balanced `var(…)` expression, from its `var` keyword to its matching close paren. */
const slice = (value, at) => {
  let depth = 0

  for (let i = at; i < value.length; i += 1) {
    if (value[i] === '(') depth += 1
    else if (value[i] === ')') {
      depth -= 1
      if (!depth) return value.slice(at, i + 1)
    }
  }

  return null
}

/**
 * A declaration's value with every frame reference resolved to the **live slot beneath it**.
 *
 * `border-bottom-width: var(--jumi-border-bottom-width-sluPW-0, var(--jumi-border-bottom-width))` is the
 * shape a whole-value candidate writes: the frame first, the live slot as its fallback. With the animation
 * off — which is how a *rest* is observed — the element resolves the fallback, so a fixture that applies the
 * frame is measuring frame zero and calling it the rest. Reading the fallback is what makes the two cases
 * one reader: where there is no fallback the reference *is* the live slot (`font-weight: var(…-eBE)`).
 *
 * The distinction `varReferences` draws between a direct fallback and a fallback that merely contains a
 * reference is what this keeps intact: `var(--a, var(--b))` resolves to `--b`, while `var(--a, red)`
 * resolves to `--a` and stays as written.
 */
export const liveOf = value => {
  const references = varReferences(value)

  if (!references.length) return null

  let out = ''
  let cursor = 0
  const consumed = new Set()

  for (const reference of references) {
    if (consumed.has(reference.offset)) continue

    const close = slice(value, reference.offset)

    if (!close) continue

    const end = reference.offset + close.length
    const inner = references.find(one => one.offset === reference.fallbackStart)

    out += value.slice(cursor, reference.offset)

    if (inner) {
      // A frame wrapper: the frame name is dropped and its fallback takes its place. The recursion is handed
      // the fallback's **own** balanced expression rather than the slice up to the wrapper's close paren —
      // the wrapper's `)` belongs to the wrapper, and carrying it over emitted `var(--jumi-live))`, which is
      // an unclosed pair of parens in a declaration and reads exactly like a property that never resolves.
      consumed.add(inner.offset)
      out += liveOf(slice(value, inner.offset)) ?? ''
    } else {
      out += close
    }

    cursor = end
  }

  return (out + value.slice(cursor)).replace(/\s+/g, ' ').trim()
}

/**
 * The **application**: the declaration that hands one property to a live slot, in full.
 *
 * This is the surface the emission chose, which is the descriptor's consumer confirmed by the artifact
 * rather than by the graph or the candidate table: three readings of one fact.
 */
export const applicationOf = (css, property) => {
  // Every declaration of the property, then the one that hands it to a slot. Selecting by shape rather than
  // taking the first is not defensive: the sheet carries Tailwind's own `font-weight: bolder` before Jumi's
  // `font-weight: var(--jumi-font-weight-eBE)`, and a reader that took `matches[0]` would report that the
  // emission never applies the property.
  const application = [
    ...css.matchAll(new RegExp(`(?:^|[\\s{;])${property}:\\s*([^;]+);`, 'gm')),
  ]
    .map(match => liveOf(match[1].trim()))
    .find(value => value && varReferences(value).length)

  if (!application)
    throw new Error(`the sheet applies ${property}, but not to a slot`)

  return { application, slot: varReferences(application)[0].name }
}

/**
 * The value a candidate's **first frame** gives one slot (`--jumi-column-gap-ZPEK33-0: 0`).
 *
 * That is the value the emission already animates the leaf to, so a typed registration's `initial-value`
 * has to agree with it — otherwise the arm is testing a representation the model does not use, which is a
 * different experiment from the one it claims to run.
 */
export const frameOf = (css, slot, stop = '0') => {
  const found = new RegExp(
    `--jumi-${slot}-[A-Za-z0-9]+-${stop}:\\s*([^;]+);`,
  ).exec(css)

  if (!found)
    throw new Error(`the sheet carries no \`${stop}\` frame for --jumi-${slot}`)

  return found[1].trim()
}
