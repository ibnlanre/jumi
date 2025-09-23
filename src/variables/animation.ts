import type { AnimationVariables, Collection } from '@/types'

import {
  animationRange,
  animationRangeEnd,
  animationRangeStart,
} from '@/composition/animation-range'
import { animationTimelineInset } from '@/composition/animation-timeline'

export const animationVariables: Collection<AnimationVariables> = {
  '.animate': {
    '--jumi-animation-composition': 'replace',
    '--jumi-animation-delay': '0s',
    '--jumi-animation-direction': 'normal',
    '--jumi-animation-duration': '1s',
    '--jumi-animation-fill-mode': 'forwards',
    '--jumi-animation-iteration-count': '1',
    '--jumi-animation-play-state': 'running',
    '--jumi-animation-range': animationRange,
    '--jumi-animation-range-end': animationRangeEnd,
    '--jumi-animation-range-end-offset': '100%',
    '--jumi-animation-range-end-timeline': 'normal',
    '--jumi-animation-range-start': animationRangeStart,
    '--jumi-animation-range-start-offset': '0%',
    '--jumi-animation-range-start-timeline': 'normal',
    '--jumi-animation-timeline': 'auto',
    '--jumi-animation-timeline-axis': 'block',
    '--jumi-animation-timeline-inset': animationTimelineInset,
    '--jumi-animation-timeline-inset-end': 'auto',
    '--jumi-animation-timeline-inset-start': 'auto',
    '--jumi-animation-timeline-scroller': 'nearest',
    '--jumi-animation-timing-function': 'ease',
  },
}
