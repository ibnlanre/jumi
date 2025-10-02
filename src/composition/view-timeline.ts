import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const viewTimeline = join([
  css('var', '--jumi-view-timeline-name'),
  css('var', '--jumi-view-timeline-inset'),
  css('var', '--jumi-view-timeline-axis'),
], ' ')
