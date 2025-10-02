import { css } from '@/helpers/css'

export const animationTimeline = {
  auto: 'auto',
  none: 'none',
  scroll: css('var', '--jumi-animation-timeline-scroll'),
  view: css('var', '--jumi-animation-timeline-view'),
} as const
