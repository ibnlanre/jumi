import type { AnimationProperty, CSSFunction, Property } from '@/types'

type AnimationVariables = `--jumi-animation-${AnimationProperty}`
type PropertyVariables = `--jumi-${Property}`
type Variables = AnimationVariables | PropertyVariables

export function css(fn: 'var', value: Variables): string
export function css(fn: CSSFunction, value: number | string): string

export function css(fn: CSSFunction, value: number | string) {
  return fn + '(' + value + ')'
}
