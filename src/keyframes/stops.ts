import type { AnimatableStandardPropertyType, Collection, CssInJs } from '@/types'

import { css } from '@/helpers/css'

/** Resolves the single shared timeline animation name for a property. */
export function stopsAnimationName(attribute: string): string {
  return `jumi-${attribute}-timeline`
}

/**
 * Derives the shared timeline `@keyframes` for one property from the stops
 * that were actually used. The keyframe is a by-product of usage — never an
 * eagerly authored block — so only the pinned stops are emitted:
 *
 *   @keyframes jumi-<attr>-timeline {
 *     0%   { <attr>: var(--jumi-<attr>-0,   var(--jumi-<attr>)) }
 *     100% { <attr>: var(--jumi-<attr>-100, var(--jumi-<attr>)) }
 *   }
 *
 * Each element that references the same timeline sets its own per-stop
 * variables, so one keyframe serves many elements. An unset stop falls back to
 * the base target var; when no stop is pinned at all, the timeline is simply
 * `to { <attr>: var(--jumi-<attr>) }`.
 */
export function timelineKeyframe(attribute: AnimatableStandardPropertyType, stops: ReadonlySet<string>): Collection<CssInJs> {
  const animationName = stopsAnimationName(attribute)

  const blocks = stops.size
    ? Array.from(stops).reduce((acc, stop) => {
        const variable = `--jumi-${attribute}-${stop}`
        acc[`${stop}%`] = {
          [attribute]: css('var', variable, css('var', `--jumi-${attribute}`)),
        }
        return acc
      }, {} as Record<string, { [key: string]: string }>)
    : { to: { [attribute]: css('var', `--jumi-${attribute}`) } }

  return { [`@keyframes ${animationName}`]: blocks }
}
