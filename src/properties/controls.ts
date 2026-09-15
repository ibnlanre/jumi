import type { GetMatchUtilities, MatchProperty } from '@/types'

import { cssProperties } from '@/keyframes/property'
import { animationComposition } from '@/theme/animation-composition'
import { animationDirection } from '@/theme/animation-direction'
import { animationFillMode } from '@/theme/animation-fill-mode'
import { animationIterationCount } from '@/theme/animation-iteration-count'
import { animationPlayState } from '@/theme/animation-play-state'
import { animationRange, animationRangeName } from '@/theme/animation-range'
import { animationTimeline } from '@/theme/animation-timeline'
import { animationTimelineAxis } from '@/theme/animation-timeline-axis'
import { animationTimelineInset } from '@/theme/animation-timeline-inset'
import { animationTimelineScroller } from '@/theme/animation-timeline-scroller'
import { animationTimingFunction } from '@/theme/animation-timing-function'
import { empty } from '@/theme/empty'
import { percentage } from '@/theme/percentage'
import { transitionBehavior } from '@/theme/transition-behavior'

export const getMatchControls: GetMatchUtilities = creator => {
  const { scope, stagger, theme, transition } = creator

  // Modifiers cannot be validated against a list: a control addresses a property
  // — `/rotate` — or a labelled slot of one — `/flick`, the word its declaration
  // used in `/[flick]`. Labels are chosen in the markup, so there is nothing to
  // enumerate. A modifier that addresses no slot writes a variable nothing
  // reads.
  const modifiers = 'any'

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
      fn: scope('animation-composition'),
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
      fn: value => {
        return {
          '--jumi-animation-name': value,
        }
      },
      values: empty.none,
    },
    'animation-play-state': {
      fn: scope('animation-play-state'),
      modifiers,
      values: animationPlayState,
    },
    'animation-range': {
      fn: scope('animation-range'),
      modifiers,
      type: ['length', 'percentage', 'any'],
      values: animationRange,
    },
    // A half is written **whole**: `animation-range-start-entry` writes `entry`, which is a complete
    // start value, and `animation-range-start-[entry_25%]` writes a complete one with an offset in
    // it. The offset control below writes the same variable, because a bare offset is also a
    // complete half — there is no grammar to compose, and therefore no absent piece to default.
    //
    // What is deliberately absent from `values` is `normal`: measured, a half of `normal` joined to
    // the other half's offset is not a legal `animation-range`, and the whole declaration is dropped.
    'animation-range-end': {
      fn: value => {
        return {
          '--jumi-animation-range-end': value,
        }
      },
      type: ['length', 'percentage', 'any'],
      values: animationRangeName,
    },
    'animation-range-end-offset': {
      fn: value => {
        return {
          '--jumi-animation-range-end-offset': value,
        }
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animation-range-start': {
      fn: value => {
        return {
          '--jumi-animation-range-start': value,
        }
      },
      type: ['length', 'percentage', 'any'],
      values: animationRangeName,
    },
    'animation-range-start-offset': {
      fn: value => {
        return {
          '--jumi-animation-range-start-offset': value,
        }
      },
      type: ['length', 'percentage'],
      values: percentage,
    },
    'animation-timeline': {
      fn: scope('animation-timeline'),
      modifiers,
      values: animationTimeline,
    },
    'animation-timeline-axis': {
      fn: value => {
        return {
          '--jumi-animation-timeline-axis': value,
        }
      },
      values: animationTimelineAxis,
    },
    'animation-timeline-inset-end': {
      fn: value => {
        return {
          '--jumi-animation-timeline-inset-end': value,
        }
      },
      // A `<length-percentage>`, and the percentage is the common case — "start tracking when the
      // element is 20% into the viewport". `length` alone silently refused every percentage:
      // measured, `animation-timeline-inset-end-[10%]` emitted nothing while `[2rem]` emitted.
      type: ['length', 'percentage'],
      values: animationTimelineInset,
    },
    'animation-timeline-inset-start': {
      fn: value => {
        return {
          '--jumi-animation-timeline-inset-start': value,
        }
      },
      // See the end half: the value is a `<length-percentage>` and percentages were being refused.
      type: ['length', 'percentage'],
      values: animationTimelineInset,
    },
    'animation-timeline-scroller': {
      fn: value => {
        return {
          '--jumi-animation-timeline-scroller': value,
        }
      },
      type: 'length',
      values: animationTimelineScroller,
    },
    'animation-timing-function': {
      fn: scope('animation-timing-function'),
      modifiers,
      values: animationTimingFunction,
    },
    'transition-behavior': {
      fn: value => {
        return {
          '--jumi-transition-behavior': value,
        }
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
  }

  return matchControls
}
