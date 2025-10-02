import { css } from '@/helpers/css'
import { join } from '@/helpers/join'

export const columnRule = join([
  css('var', '--jumi-column-rule-width'),
  css('var', '--jumi-column-rule-style'),
  css('var', '--jumi-column-rule-color'),
], ' ')
