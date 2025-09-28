import type { CSSFunction, CSSValue } from '@/types'

export function css<const Fn extends CSSFunction>(fn: Fn): `${Fn}()`
export function css<const Fn extends CSSFunction, const Value extends string>(fn: Fn, value: Value): `${Fn}(${Value})`
export function css<const Fn extends CSSFunction, const Value extends string, const Fallback extends string>(fn: Fn, value: Value, fallback: Fallback): `${Fn}(${Value}, ${Fallback})`

export function css<
  const Fn extends CSSFunction,
  const Value extends string,
  const Fallback extends string,
>(fn: Fn, value?: Value, fallback?: Fallback) {
  if (fallback) return `${fn}(${value}, ${fallback})` as const
  if (value) return `${fn}(${value})` as const
  return `${fn}()` as const
}
