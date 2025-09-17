import {
  animationTimelineScroll,
  animationTimelineView,
} from '@/composition/animation-timeline'

export const animationTimeline = {
  auto: 'auto',
  none: 'none',
  scroll: 'scroll(' + animationTimelineScroll + ')',
  view: 'view(' + animationTimelineView + ')',
} as const
