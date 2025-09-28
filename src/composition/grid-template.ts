import { css } from '@/helpers/css'

const gridTemplateLayout = [
  css('var', '--jumi-grid-template-rows'),
  css('var', '--jumi-grid-template-columns'),
].join(' / ')

export const gridTemplate = [
  css('var', '--jumi-grid-template-areas'),
  gridTemplateLayout,
].join(' ')
