import { css } from '@/helpers/css'

export const padding = [
  css('var', '--jumi-padding-top'),
  css('var', '--jumi-padding-right'),
  css('var', '--jumi-padding-bottom'),
  css('var', '--jumi-padding-left'),
].join(' ')

export const paddingBlock = [
  css('var', '--jumi-padding-block-start'),
  css('var', '--jumi-padding-block-end'),
].join(' ')

export const paddingInline = [
  css('var', '--jumi-padding-inline-start'),
  css('var', '--jumi-padding-inline-end'),
].join(' ')
