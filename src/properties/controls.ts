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
  const { effect, motion, theme } = creator
  const modifiers = merge(cssProperties, cssEffects)

  const matchControls: Partial<MatchProperty> = {
    'animate': {
      fn: (value) => {
        return ({
          [`--jumi-${value}-animation-name`]: effect(value),
        })
      },
      values: cssEffects,
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
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-delay': value }
        return { [`--jumi-${modifier}-animation-delay`]: value }
      },
      modifiers,
      values: theme('transitionDelay'),
    },
    'animation-direction': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-direction': value }
        return { [`--jumi-${modifier}-animation-direction`]: value }
      },
      modifiers,
      values: animationDirection,
    },
    'animation-duration': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-duration': value }
        return { [`--jumi-${modifier}-animation-duration`]: value }
      },
      modifiers,
      values: theme('transitionDuration'),
    },
    'animation-fill-mode': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-fill-mode': value }
        return { [`--jumi-${modifier}-animation-fill-mode`]: value }
      },
      modifiers,
      values: animationFillMode,
    },
    'animation-iteration-count': {
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-iteration-count': value }
        return { [`--jumi-${modifier}-animation-iteration-count`]: value }
      },
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
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-play-state': value }
        return { [`--jumi-${modifier}-animation-play-state`]: value }
      },
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
      fn: (value, { modifier }) => {
        if (!modifier) return { '--jumi-animation-timing-function': value }
        return { [`--jumi-${modifier}-animation-timing-function`]: value }
      },
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
      fn: (value, { modifier }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-delay': value }) }
        return { [`--jumi-${modifier}-transition-delay`]: value }
      },
      modifiers: cssProperties,
      values: theme('transitionDelay'),
    },
    'transition-duration': {
      fn: (value, { modifier }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-duration': value }) }
        return { [`--jumi-${modifier}-transition-duration`]: value }
      },
      modifiers: cssProperties,
      values: theme('transitionDuration'),
    },
    'transition-property': {
      fn: (value, { modifier }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-property': value }) }
        return { [`--jumi-${modifier}-transition-property`]: motion(modifier) }
      },
      modifiers: cssProperties,
      values: empty.string,
    },
    'transition-timing-function': {
      fn: (value, { modifier }) => {
        if (!modifier) return { ...(value && { '--jumi-transition-timing-function': value }) }
        return { [`--jumi-${modifier}-transition-timing-function`]: value }
      },
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
