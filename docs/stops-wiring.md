/**
 * The one missing piece: make `animate-<attr>` honor `/at-<stop>`.
 *
 * Infrastructure already in place:
 *   - `atStops` theme      = { 'at-0%': '0', 'at-100%': '100' }
 *   - `modifiers: atStops` on every `animate-<attr>` utility
 *   - `stopsKeyframe()`    -> shared `jumi-<attr>-timeline` keyframe reading
 *                             var(--jumi-<attr>-0) and var(--jumi-<attr>-100)
 *   - `creator.property(attr)` registers that keyframe, returns its name
 *   - `stopVariable(attr, stop)` -> `--jumi-<attr>-<stop>`
 *
 * What's missing: the property fns don't consume `modifier`. So
 * `animate-width-16/at-0%` currently writes `--jumi-width: 16` (base var) and
 * never touches `--jumi-width-0`.
 *
 * --- WHAT TO ADD IN src/properties/match.ts -------------------------------
 *
 * 1) Import (near the other keyframes imports):
 *
 *    import { stopVariable } from '@/keyframes/stops'
 *
 * 2) Extend the type import to include Creator + AnimatableStandardPropertyType:
 *
 *    import type {
 *      AnimatableStandardPropertyType,
 *      Collection,
 *      Creator,
 *      GetMatchUtilities,
 *      MatchProperty,
 *      MatchUtilitiesPropertyValue,
 *    } from '@/types'
 *
 * 3) Right before `return matchProperties` in getMatchUtilities, wrap every
 *    property fn (skip non-property / effect utilities):
 *
 *    // Learn `/at-<stop>`: write the value to the per-stop variable so the
 *    // shared timeline keyframe interpolates the pinned stops.
 *    for (const name of Object.keys(matchProperties)) {
 *      if (!isProperty(name)) continue
 *      const { fn, ...options } = matchProperties[name]
 *      matchProperties[name] = { ...options, fn: withStops(fn, name, creator) }
 *    }
 *
 *    return matchProperties
 *
 * 4) Helpers (module scope, after getMatchUtilities):
 *
 *    function isProperty(name: string): name is `animate-${AnimatableStandardPropertyType}` {
 *      return name.startsWith('animate-') && name.slice('animate-'.length) in cssProperties
 *    }
 *
 *    function withStops(
 *      fn: MatchUtilitiesPropertyValue['fn'],
 *      name: `animate-${AnimatableStandardPropertyType}`,
 *      creator: Creator,
 *    ): MatchUtilitiesPropertyValue['fn'] {
 *      const attribute = name.slice('animate-'.length)
 *      return (value, extra) => {
 *        const stop = extra.modifier ? atStops[extra.modifier] : undefined
 *        if (stop !== undefined) {
 *          return {
 *            [`--jumi-${attribute}-animation-name`]: creator.property(attribute),
 *            [stopVariable(attribute, stop)]: value,
 *          }
 *        }
 *        return fn(value, extra)
 *      }
 *    }
 *
 * ---------------------------------------------------------------------------
 * Behaviour after this:
 *   animate-width-16/at-0% animate-width-32/at-100%
 *     ->  --jumi-width-0: 16 ; --jumi-width-100: 32
 *     ->  width tween 16 -> 32 -> 16
 *
 * A bare `animate-width-32` (no `/at-*`) keeps the old behaviour and writes
 * the base `--jumi-width: 32`.
 */
