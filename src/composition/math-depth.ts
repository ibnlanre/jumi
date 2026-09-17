import { css } from '@/helpers/css'

/**
 * The composition owns the shell; the animation owns the argument.
 *
 * D.3.6 measured what the previous spelling did: the shell was wrapped around the *value* the candidate
 * wrote, so the frames animated `math-depth` itself between `add(0)` and `add(2)`, the property is not
 * registered, and the series was a discrete flip — `0 · 0 · 2 · 2 · 2` over a held wall. With the shell here
 * and the frames animating the registered `<integer>` leaf, the same motion reads `0 · 1 · 1 · 2 · 2`.
 *
 * This is a **static** composition, which is the whole point: a shell is not something an animation can
 * interpolate, and the only independently interpolable subject in `add(n)` is `n`.
 */
export const mathDepth = css('add', 'var(--jumi-math-depth-add)')
