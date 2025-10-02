import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const animationTimelineViewValues = join([
  css('var', '--jumi-animation-timeline-axis'),
  css('var', '--jumi-animation-timeline-inset'),
])

export const animationTimelineView = css('view', animationTimelineViewValues)

export const animationTimelineScrollValues = join([
  css('var', '--jumi-animation-timeline-scroller'),
  css('var', '--jumi-animation-timeline-axis'),
])

export const animationTimelineScroll = css('scroll', animationTimelineScrollValues)

export const animationTimelineInset = join([
  css('var', '--jumi-animation-timeline-inset-start'),
  css('var', '--jumi-animation-timeline-inset-end'),
])
