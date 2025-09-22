import { css } from '@/helpers/css'

export const inlineSize = {
  'anchor-block': css('anchor-size', 'block'),
  'anchor-height': css('anchor-size', 'height'),
  'anchor-inline': css('anchor-size', 'inline'),
  'anchor-self-block': css('anchor-size', 'self-block'),
  'anchor-self-inline': css('anchor-size', 'self-inline'),
  'anchor-width': css('anchor-size', 'width'),
  'auto': 'auto',
  'fit-content': 'fit-content',
  'max-content': 'max-content',
  'min-content': 'min-content',
} as const
