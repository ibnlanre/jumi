import type { AnimationProperty, CSSFunction, Property } from '@/types'

type AnimationVariables = `--jumi-animation-${AnimationProperty}`
type PropertyVariables = `--jumi-${Property}`
type Variables = AnimationVariables | PropertyVariables | (string & {})

export function css(fn: 'var', value: Variables, fallback?: string): string
export function css(fn: CSSFunction, value: number | string): string

export function css(fn: CSSFunction, value: number | string, fallback?: string): string {
  if (fallback) return `${fn}(${value}, ${fallback})`
  return `${fn}(${value})`
}
