import type { GetMatchUtilities, MatchProperty } from '@/types'

import { merge } from '@/helpers/merge'
import { cssEffects } from '@/keyframes/effects'
import { cssProperties } from '@/keyframes/property'
import { animationComposition } from '@/theme/animation-composition'
import { animationDirection } from '@/theme/animation-direction'
import { animationFillMode } from '@/theme/animation-fill-mode'
import { animationIterationCount } from '@/theme/animation-iteration-count'
import { animationPlayState } from '@/theme/animation-play-state'
import { animationRange, animationRangeTimeline } from '@/theme/animation-range'
import { animationTimeline } from '@/theme/animation-timeline'
import { animationTimelineAxis } from '@/theme/animation-timeline-axis'
import { animationTimelineInset } from '@/theme/animation-timeline-inset'
import { animationTimelineScroller } from '@/theme/animation-timeline-scroller'
import { animationTimingFunction } from '@/theme/animation-timing-function'
import { empty } from '@/theme/empty'
import { percentage } from '@/theme/percentage'
import { transitionBehavior } from '@/theme/transition-behavior'

export const getMatchControls: GetMatchUtilities = (creator) => {
  const { scope, stagger, theme, transition } = creator
  const modifiers = merge(cssProperties, cssEffects)

  const matchControls: Partial<MatchProperty> = {
    // Stagger: distributes the stagger input across direct children at
    // `interval` steps — forward (0, 1×, 2×, …) or backward ((count-1)×, …, 1×,
    // 0). Each direction is just an expression over `{ value, length, index }`:
    // `index` is `null` for the count-free adaptive form (dynamic
    // `sibling-index()`/`sibling-count()`, Chrome/Edge/Safari) and a 0-based
    // number for the `:nth-child` Firefox fallback. `stagger` supplies the
    // `--jumi-stagger-animation-delay` variable, the `@supports` layering, and
    // the adaptive-rule preference.
    'animate-stagger-backward': {
      fn: stagger('animation-delay', ({ index, length, value }) =>
        index === null
          ? `calc((sibling-count() - sibling-index()) * ${value})`
          : `calc(${value} * ${length - 1 - index})`,
      ),
      modifiers: 'any',
      values: theme('transitionDelay'),
    },
    'animate-stagger-forward': {
      fn: stagger('animation-delay', ({ index, value }) =>
        index === null
          ? `calc((sibling-index() - 1) * ${value})`
          : `calc(${value} * ${index})`,
      ),
      modifiers: 'any',
      values: theme('transitionDelay'),
    },
    'animation-composition': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-composition': value }
        return { [`--jumi-${modifier}-animation-composition`]: value }
      },
      modifiers,
      values: animationComposition,
    },
    'animation-delay': {
      fn: scope('animation-delay'),
      modifiers,
      values: theme('transitionDelay'),
    },
    'animation-direction': {
      fn: scope('animation-direction'),
      modifiers,
      values: animationDirection,
    },
    'animation-duration': {
      fn: scope('animation-duration'),
      modifiers,
      values: theme('transitionDuration'),
    },
    'animation-fill-mode': {
      fn: scope('animation-fill-mode'),
      modifiers,
      values: animationFillMode,
    },
    'animation-iteration-count': {
      fn: scope('animation-iteration-count'),
      modifiers,
      type: 'number',
      values: animationIterationCount,
    },
    'animation-name': {
      fn: (value) => {
        return ({
          '--jumi-animation-name': value,
        })
      },
      values: empty.none,
    },
    'animation-play-state': {
      fn: scope('animation-play-state'),
      modifiers,
      values: animationPlayState,
    },
    'animation-range': {
      fn: (value) => {
        return ({
          '--jumi-animation-range': value,
        })
      },
      values: animationRange,
    },
    'animation-range-end': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-end': value,
        })
      },
      type: ['length', 'percentage', 'any'],
      values: animationRange,
    },
    'animation-range-end-offset': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-end-offset': value,
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animation-range-end-timeline': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-end-timeline': value,
        })
      },
      values: animationRangeTimeline,
    },
    'animation-range-start': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-start': value,
        })
      },
      type: ['length', 'percentage', 'any'],
      values: animationRange,
    },
    'animation-range-start-offset': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-start-offset': value,
        })
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animation-range-start-timeline': {
      fn: (value) => {
        return ({
          '--jumi-animation-range-start-timeline': value,
        })
      },
      values: animationRangeTimeline,
    },
    'animation-timeline': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-timeline': value }
        return { [`--jumi-${modifier}-animation-timeline`]: value }
      },
      modifiers,
      values: animationTimeline,
    },
    'animation-timeline-axis': {
      fn: (value) => {
        return ({
          '--jumi-animation-timeline-axis': value,
        })
      },
      values: animationTimelineAxis,
    },
    'animation-timeline-inset-end': {
      fn: (value) => {
        return ({
          '--jumi-animation-timeline-inset-end': value,
        })
      },
      type: 'length',
      values: animationTimelineInset,
    },
    'animation-timeline-inset-start': {
      fn: (value) => {
        return ({
          '--jumi-animation-timeline-inset-start': value,
        })
      },
      type: 'length',
      values: animationTimelineInset,
    },
    'animation-timeline-scroller': {
      fn: (value) => {
        return ({
          '--jumi-animation-timeline-scroller': value,
        })
      },
      type: 'length',
      values: animationTimelineScroller,
    },
    'animation-timing-function': {
      fn: scope('animation-timing-function'),
      modifiers,
      values: animationTimingFunction,
    },
    'animations': {
      fn: () => creator.animations,
      values: empty.string,
    },
    'transition-behavior': {
      fn: (value) => {
        return ({
          '--jumi-transition-behavior': value,
        })
      },
      values: transitionBehavior,
    },
    'transition-delay': {
      fn: transition('delay'),
      modifiers: cssProperties,
      values: theme('transitionDelay'),
    },
    'transition-duration': {
      fn: transition('duration'),
      modifiers: cssProperties,
      values: theme('transitionDuration'),
    },
    'transition-property': {
      fn: transition('property'),
      modifiers: cssProperties,
      values: empty.string,
    },
    'transition-timing-function': {
      fn: transition('timing-function'),
      modifiers: cssProperties,
      values: animationTimingFunction,
    },
    'transitions': {
      fn: () => creator.transitions,
      values: empty.string,
    },
  }

  return matchControls
}
