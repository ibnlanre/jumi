/**
 * The three evidence sources, named, so a book stops choosing between them ad hoc.
 *
 * ```text
 * structural research   the model's resolved expression graph   `modelExpressions()` / `modelLeaves()`
 * emission research     the compiled sheet                      whatever the compiler returns
 * browser behaviour     the computed style                      read from the page
 * ```
 *
 * They are not interchangeable, and defect fourteen came from mixing the first two: a book asked the *compiled sheet*
 * what a composition is made of, and with `source(none)` the sheet carries only the slots the used class needs — the
 * axis compositions were absent, the walk found no leaves, the keyframes came out empty, and three arms reported
 * agreement with nothing. A structure question goes to the model; a question about what shipped goes to the sheet;
 * a question about what the browser does goes to the browser.
 */
import { expressions } from './property-model.mjs'

/** The model's resolved expression per slot — the structural source, resolved the way the plugin evaluates it. */
export const modelExpressions = () => expressions()

/**
 * The leaves beneath a slot, walked transitively through the model's own expressions.
 *
 * Each leaf carries its **rest** and the **path** it was reached by, because an arm needs both: the rest to build a
 * motion that starts where the model starts, and the path to say which level of the decomposition it is animating.
 */
export const modelLeaves = (attribute, seen = new Set()) => {
  const table = modelExpressions()
  const out = []

  const walk = (name, path) => {
    if (seen.has(name)) return
    seen.add(name)

    const value = String(table.get(name) ?? '')

    if (!value) return

    const refs = [...value.matchAll(/--jumi-([\w-]+)/g)].map(match => match[1])

    if (!refs.length) {
      out.push({ name, path, rest: value.trim() })

      return
    }

    for (const ref of refs) walk(ref, [...path, ref])
  }

  walk(attribute, [attribute])

  return out
}

/**
 * The three liveness assertions an arm has to pass **before** its equality result means anything.
 *
 * Each is a statement about a different source, which is why they are separate: the route compiling is the emission,
 * the leaf being written is the emission, and the observable moving under a perturbed endpoint is the browser. An arm
 * that skips any of them can report agreement with a subject that was never there.
 */
export const liveness = ({ compiled, moved, wrote }) => [
  { check: 'the route compiled', ok: compiled },
  { check: 'the typed leaf was written', ok: wrote },
  { check: 'the observable moved under a perturbed endpoint', ok: moved },
]

/** Whether every liveness check passed, and the ones that did not. */
export const earned = checks => {
  const failed = checks.filter(one => !one.ok)

  return { failed: failed.map(one => one.check), ok: failed.length === 0 }
}

/** Resolve a slot's expression with a value substituted for each leaf beneath it — the structural way to author. */
export const resolveWith = (attribute, values) => {
  const table = modelExpressions()

  const build = (name, depth = 0) => {
    if (depth > 6) return ''

    const value = String(table.get(name) ?? values.get(name) ?? '')

    if (values.has(name)) return values.get(name)

    return value.replace(/var\(--jumi-([\w-]+)\)/g, (_, ref) =>
      build(ref, depth + 1),
    )
  }

  return build(attribute)
}

/**
 * The composition with every **intermediate** slot resolved and every **leaf** left as a read.
 *
 * This is the shape a prototype needs, and the difference from `resolveWith` is the whole point: resolving through a
 * leaf *removes the read*, so the property stops depending on the slot the animation writes and the motion measures
 * as a constant. `background-position` composes its axis slots, each axis composes an edge beside an offset, and only
 * the axis level is substituted here — the offsets stay read, which is what lets a motion moving them reach the
 * property.
 */
export const resolveToLeaves = attribute => {
  const table = modelExpressions()
  const isLeaf = name => !String(table.get(name) ?? '').includes('var(--jumi-')

  const build = (name, depth = 0) => {
    if (depth > 6) return ''

    const value = String(table.get(name) ?? '')

    if (isLeaf(name)) return value

    return value.replace(/var\(--jumi-([\w-]+)\)/g, (match, ref) =>
      isLeaf(ref) ? match : build(ref, depth + 1),
    )
  }

  return build(attribute)
}
