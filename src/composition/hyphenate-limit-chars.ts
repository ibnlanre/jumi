import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const hyphenateLimitChars = join([
  css('var', '--jumi-hyphenate-limit-minimum-word-length'),
  css('var', '--jumi-hyphenate-limit-minimum-characters-before'),
  css('var', '--jumi-hyphenate-limit-minimum-characters-after'),
], ' ')
