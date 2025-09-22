import type { AnimationVariables, Collection } from '@/types'

import {
  animationRange,
  animationRangeEnd,
  animationRangeStart,
} from '@/composition/animation-range'
import { animationTimelineInset } from '@/composition/animation-timeline'
import { animationName } from '@/keyframes/property'

export const animationVariables: Collection<AnimationVariables> = {
  '.animate': {
    '--jumi-animation': animationName,
    '--jumi-animation-composition': 'replace',
    '--jumi-animation-delay': '0s',
    '--jumi-animation-direction': 'normal',
    '--jumi-animation-duration': '1s',
    '--jumi-animation-fill-mode': 'forwards',
    '--jumi-animation-iteration-count': '1',
    '--jumi-animation-play-state': 'running',
    '--jumi-animation-range': animationRange,
    '--jumi-animation-range-end': animationRangeEnd,
    '--jumi-animation-range-end-length': '100%',
    '--jumi-animation-range-end-name': 'normal',
    '--jumi-animation-range-start': animationRangeStart,
    '--jumi-animation-range-start-length': '0%',
    '--jumi-animation-range-start-name': 'normal',
    '--jumi-animation-timeline': 'auto',
    '--jumi-animation-timeline-axis': 'block',
    '--jumi-animation-timeline-inset': animationTimelineInset,
    '--jumi-animation-timeline-inset-end': 'auto',
    '--jumi-animation-timeline-inset-start': 'auto',
    '--jumi-animation-timeline-scroller': 'nearest',
    '--jumi-animation-timing-function': 'ease',
  },
}
