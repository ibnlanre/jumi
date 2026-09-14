import { expect, it } from 'vitest'

import { runViewTransition } from './view-transition'

/**
 * The type contract — and only that. The behaviour is asserted in a browser.
 *
 * `scripts/view-transition-check.mjs` drives the real `document.startViewTransition`, because that is the only
 * thing that answers what the wrapper exists to answer: whether a second call aborts the first, whether an
 * aborted call's callback still runs, and whether a promise handed to the platform wedges the transition
 * forever. A fake stood in for it here first and was wrong about two of those — it produced unhandled
 * rejections of its own, which is what a fake does at the boundary it is guessing at.
 *
 * What is left here is not decoration. TypeScript accepts a `() => Promise<void>` where a `() => void`
 * parameter is expected, so an async update slips through a plain signature and only the runtime refuses it.
 * These cases are enforced by `tsc --noEmit` rather than by the test runner: an unused `@ts-expect-error` is
 * an error, so a signature that stopped rejecting promises fails the gate. Running them is harmless — there is
 * no `document` in this environment, so the wrapper takes its "no platform" path.
 */

it('accepts an update that returns nothing, and one that returns a plain value', () => {
  expect(() => void runViewTransition(() => {})).not.toThrow()
  expect(() => void runViewTransition(() => 1)).not.toThrow()
})

it('rejects an async update, and one that returns a promise', () => {
  // @ts-expect-error an async update is not this API's shape, and the runtime refuses it too
  void runViewTransition(async () => {})

  // @ts-expect-error neither is one that hands back a promise
  void runViewTransition(() => Promise.resolve())
})
