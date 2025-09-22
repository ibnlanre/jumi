import { css } from '@/helpers/css'

export const inset = {
  'anchor-block': css('anchor-size', 'block'),
  'anchor-bottom': css('anchor', 'bottom'),
  'anchor-center': css('anchor', 'center'),
  'anchor-end': css('anchor', 'end'),
  'anchor-height': css('anchor-size', 'height'),
  'anchor-inline': css('anchor-size', 'inline'),
  'anchor-inside': css('anchor', 'inside'),
  'anchor-left': css('anchor', 'left'),
  'anchor-outside': css('anchor', 'outside'),
  'anchor-right': css('anchor', 'right'),
  'anchor-self-block': css('anchor-size', 'self-block'),
  'anchor-self-end': css('anchor', 'self-end'),
  'anchor-self-inline': css('anchor-size', 'self-inline'),
  'anchor-self-start': css('anchor', 'self-start'),
  'anchor-start': css('anchor', 'start'),
  'anchor-top': css('anchor', 'top'),
  'anchor-width': css('anchor-size', 'width'),
} as const
