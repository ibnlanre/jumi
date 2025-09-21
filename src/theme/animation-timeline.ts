import {
  animationTimelineScroll,
  animationTimelineView,
} from '@/composition/animation-timeline'
import { css } from '@/helpers/css'

export const animationTimeline = {
  auto: 'auto',
  none: 'none',
  scroll: css('scroll', animationTimelineScroll),
  view: css('view', animationTimelineView),
} as const
