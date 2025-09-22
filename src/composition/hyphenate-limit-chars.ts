import { css } from '@/helpers/css'

export const hyphenateLimitChars = [
  css('var', '--jumi-hyphenate-limit-minimum-word-length'),
  css('var', '--jumi-hyphenate-limit-minimum-characters-before'),
  css('var', '--jumi-hyphenate-limit-minimum-characters-after'),
].join(' ')
