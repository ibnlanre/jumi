import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const scrollTimeline = join([
  css('var', '--jumi-scroll-timeline-name'),
  css('var', '--jumi-scroll-timeline-axis'),
], ' ')
