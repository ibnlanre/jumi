import { css } from '@/helpers/css'

export const animationTimelineView = [
  css('var', '--jumi-animation-timeline-axis'),
  css('var', '--jumi-animation-timeline-inset'),
].join(' ')

export const animationTimelineScroll = [
  css('var', '--jumi-animation-timeline-scroller'),
  css('var', '--jumi-animation-timeline-axis'),
].join(' ')

export const animationTimelineInset = [
  css('var', '--jumi-animation-timeline-inset-start'),
  css('var', '--jumi-animation-timeline-inset-end'),
].join(' ')
