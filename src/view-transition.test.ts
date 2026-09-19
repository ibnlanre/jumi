import { expect, it } from 'vitest'

import { createViewTransition } from './view-transition'

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
  expect(() => void createViewTransition().run(() => {})).not.toThrow()
  expect(() => void createViewTransition().run(() => 1)).not.toThrow()
})

it('rejects an async update, and one that returns a promise', async () => {
  // @ts-expect-error an async update is not this API's shape, and the runtime refuses it too
  await expect(createViewTransition().run(async () => {})).rejects.toThrow(
    'synchronous',
  )

  await expect(
    // @ts-expect-error neither is one that hands back a promise
    createViewTransition().run(() => Promise.resolve()),
  ).rejects.toThrow('synchronous')
})

it('declines once, with the reason, when there is no platform to transition with', async () => {
  // The lifecycle is total: this environment has no `document`, so a run can only be declined — and a
  // declined run must not report a start, because nothing materialised.
  const declines: string[] = []
  const starts: number[] = []
  const operation = createViewTransition().wrap(() => {}, {
    onDecline: reason => declines.push(reason),
    onTransitionStart: () => starts.push(1),
  })

  const outcome = await operation()

  expect(outcome).toEqual({ reason: 'unsupported', transitioned: false })
  expect(declines).toEqual(['unsupported'])
  expect(starts).toEqual([])
})

it('wraps a function: arguments forwarded, outcome returned, lifecycle owned', async () => {
  // Each operation owns its lifecycle, without controller-wide observers or a registry.
  const seen: unknown[][] = []
  const order: string[] = []
  const transition = createViewTransition()
  const setOpen = transition.wrap(
    (value: ((open: boolean) => boolean) | boolean) => {
      seen.push([value])
    },
    { onDecline: () => order.push('operation') },
  )

  const first = await setOpen(true)
  const second = await setOpen(open => !open)

  expect(seen).toEqual([[true], [expect.any(Function)]])
  expect(first).toEqual({ reason: 'unsupported', transitioned: false })
  expect(second).toEqual({ reason: 'unsupported', transitioned: false })
  expect(order).toEqual(['operation', 'operation'])
})

it('keeps a throwing hook out of the transaction', async () => {
  // A hook is instrumentation, so its own failure must not rewrite what happened to the run it was
  // watching. The throw goes to the global error handler, and the outcome is the one the run earned.
  const reported: unknown[] = []
  const original = globalThis.reportError

  globalThis.reportError = (error: unknown) => {
    reported.push(error)
  }

  try {
    const mistake = new Error('the observer tripped')
    const operation = createViewTransition().wrap(() => {}, {
      onDecline: () => {
        throw mistake
      },
    })

    const outcome = await operation()

    expect(outcome).toEqual({ reason: 'unsupported', transitioned: false })
    expect(reported).toEqual([mistake])
  } finally {
    globalThis.reportError = original
  }
})

it('rejects async wrappers at the type boundary', () => {
  const controller = createViewTransition()
  // @ts-expect-error wrapped updates must be synchronous
  controller.wrap(async (value: boolean) => value)
  // @ts-expect-error promise-returning updates are also rejected
  controller.wrap((value: string) => Promise.resolve(value))
  // @ts-expect-error lifecycle belongs to wrap, not the controller
  createViewTransition({ onTransitionStart() {} })
  const open = controller.wrap(
    (value: boolean, label?: string) => label ?? value,
  )
})

it('observes update failures once and preserves the rejected outcome', async () => {
  const error = new Error('update failed')
  const seen: unknown[] = []
  const operation = createViewTransition().wrap(
    () => {
      throw error
    },
    {
      onDecline: () => seen.push('declined'),
      onError: value => seen.push(value),
    },
  )
  await expect(operation()).rejects.toBe(error)
  expect(seen).toEqual([error])
})

it('forwards receivers and arguments but replaces the return value', async () => {
  const owner = {
    update: createViewTransition().wrap(function (
      this: { value: number },
      value: number,
    ) {
      this.value = value
      return 42
    }),
    value: 0,
  }
  await expect(owner.update(7)).resolves.toEqual({
    reason: 'unsupported',
    transitioned: false,
  })
  expect(owner.value).toBe(7)
})
