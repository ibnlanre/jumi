import type { AnimationProperty, CSSFunction, Property } from '@/types'

export function css(fn: 'var', value: `--jumi-${Property}`): string
export function css(fn: 'var', value: `--jumi-animation-${AnimationProperty}`): string
export function css(fn: CSSFunction, value: number | string): string

export function css(fn: CSSFunction, value: number | string) {
  return fn + '(' + value + ')'
}
