import type { Creator } from '@/types'

import { nameable } from '@/core'
import { getMatchControls } from '@/properties/controls'
import { getMatchTween } from '@/properties/tween'

export type ControlEntry = {
  types: string[]
  utility: string
  values: string[]
}
export type PropertyEntry = {
  attribute: string
  group: string
  nameable: boolean
  parts: string[]
  types: string[]
  utility: string
  values: string[]
}
const group = (s: string) => {
  if (/^(offset|motion)/.test(s)) return 'Motion path'
  if (/^(perspective|backface|transform-style)/.test(s))
    return 'Perspective & 3D'
  if (/^(transform|translate|rotate|scale|skew|matrix)/.test(s))
    return 'Transform'
  if (
    /^(fill|stroke|cx$|cy$|r$|rx$|ry$|d$|x$|y$|stop-|flood-|lighting-|paint-|vector)/.test(
      s,
    )
  )
    return 'SVG'
  if (/filter/.test(s)) return 'Filters'
  if (/^(border|outline)/.test(s)) return 'Border & outline'
  if (/color/.test(s)) return 'Color'
  if (/^(font|text|line|letter|word|white-space)/.test(s)) return 'Typography'
  if (/^(visibility|display|content-visibility)/.test(s))
    return 'Visibility & discrete state'
  if (/^(position|inset|top|right|bottom|left|z-index)/.test(s))
    return 'Position'
  if (/^(opacity|background|mask|clip|box-shadow|mix-blend)/.test(s))
    return 'Appearance'
  return 'Layout & size'
}
/** The real registration functions supply the inventory. Only semantic grouping is editor policy. */
export function readCatalog(): {
  controls: ControlEntry[]
  properties: PropertyEntry[]
} {
  let captured: null | { attribute: string; parts: string[] } = null
  const property = (
    attribute: string,
    parts: ([string, unknown] | string)[] = [],
  ) =>
    Object.assign(
      () => {
        captured = {
          attribute,
          parts: parts.map(p => (Array.isArray(p) ? p[0] : p)),
        }
        return {}
      },
      { [nameable]: true },
    )
  const spy = {
    color: property,
    effect: () => '',
    name: () => ({}),
    property,
    scope: () => () => ({}),
    stagger: () => () => ({}),
    theme: (_key: string, values = {}) => values,
    transition: () => () => ({}),
  } as unknown as Creator
  const properties: PropertyEntry[] = []
  for (const [utility, def] of Object.entries(getMatchTween(spy))) {
    if (utility === 'animate') continue
    captured = null
    try {
      def.fn('1', { modifier: null })
    } catch {
      continue
    }
    const meta = captured as null | { attribute: string; parts: string[] }
    if (!meta) continue
    properties.push({
      utility,
      ...meta,
      group: group(utility.slice(8)),
      nameable: nameable in def.fn,
      types: [def.type ?? 'any'].flat(),
      values: Object.keys(def.values ?? {}),
    })
  }
  const controls = Object.entries(getMatchControls(spy)).map(
    ([utility, def]) => ({
      types: [def.type ?? 'any'].flat(),
      utility,
      values: Object.keys(def.values ?? {}),
    }),
  )
  return { controls, properties }
}
