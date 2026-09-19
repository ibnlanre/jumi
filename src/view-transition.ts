export type ViewTransitionConcurrency = 'auto' | 'coalesce' | 'supersede'

/** Shared policy for every invocation of this controller's wrapped operations. */
export type ViewTransitionControllerOptions = ViewTransitionOptions

/**
 * The lifecycle, which is total per run and exclusive in its shapes: a run that materialises reports start and
 * then end; one that is declined reports decline and never starts; one that rejects reports error.
 *
 * A hook is told *which operation* it is observing by being that operation's hook rather than by an
 * identifier: ownership is what `wrap(update, hooks)` buys. Overlapping calls of one wrapped operation stay
 * distinct internally without the distinction being handed out, so these hooks cannot identify which overlapping invocation fired. Each returned promise
 * remains the individual caller’s outcome channel.
 */
export type ViewTransitionHooks = {
  onDecline?: (reason: ViewTransitionReason) => void
  onError?: (error: unknown) => void
  onTransitionEnd?: () => void
  onTransitionStart?: () => void
}

export type ViewTransitionOptions = {
  /**
   * What to do when a transition is already running, which is a question about *who* is calling.
   *
   * `auto` — the default — tells an echo from a new intent by when the call arrives, because that is the one
   * signal a caller cannot fake by accident: a second call in the same task (its microtasks included) cannot
   * be a second human gesture, while a call from a later task can be. An echo is coalesced and a gesture
   * supersedes, which is what makes `transition.run(change)` the right call for both — see the marker's
   * own note for the measurements behind that.
   *
   * `coalesce` applies the update exactly once and starts no second transition, whatever the timing. The
   * careful choice, and the right one for a caller writing on a schedule rather than on a gesture — a poll, a
   * resize, an animation frame — where a second transition per write is noise.
   *
   * `supersede` always starts a transition, aborting the one in flight. Starting one is the operation with a
   * hazard: the platform aborts the first, the aborted call's callback still runs, and the survivor can end
   * up animating a boundary it did not fill in. Safe once the first transition has materialised (measured),
   * which is why `auto` is willing to do it for a real gesture and not for an echo.
   */
  concurrency?: ViewTransitionConcurrency
}

export type ViewTransitionOutcome =
  | {
      reason: ViewTransitionReason
      transitioned: false
    }
  | { transitioned: true }

/**
 * Jumi's view transition orchestration: the smallest thing that removes the platform's lifecycle footguns
 * without owning the caller's state.
 *
 *   import { createViewTransition } from '@ibnlanre/jumi/view-transition'
 *
 *   const transition = createViewTransition()
 *   await transition.run(() => {
 *     active = next
 *     apply()
 *   })
 *
 * The browser's contract is unavoidable — capture old, run the application's mutation, capture new — and no
 * class can say what state to change. What is avoidable is knowing six things about that contract:
 *
 *   the callback is deferred      a guard keyed on the value the callback sets does not catch a second call
 *                                 in the same task (measured: the callback runs 52ms after the call on a cold
 *                                 document, 16ms warm)
 *   a second call aborts the first  and the aborted call's callback *still runs*, so the surviving transition
 *                                 can animate a boundary it did not fill in — which works only while the
 *                                 browser happens to order those two things that way
 *   the boundary can be empty  the layout changes and nothing animates, and `finished` resolves either way.
 *                                 Only `ready` separates "this materialised" from "this was cut short", so an
 *                                 outcome has to read both and cannot be derived from `finished` alone
 *   a hidden document skips it    `ready` rejects, `finished` resolves, the update runs
 *   the update's error is published three times  on `ready`, on `updateCallbackDone` and on `finished`, so a
 *                                 wrapper that consumes two of them still leaks an unhandled rejection
 *   the pseudo tree takes the hit  while a transition runs a click's target becomes `<html>`, so anything
 *                                 resolving clicks during one has to notice that itself
 *
 * None of that is discoverable from `document.startViewTransition`'s shape, and all six were hit building one
 * demo. See `engineering/research/vt-orchestration.md`.
 *
 * **The update must complete synchronously**, and that is enforced rather than documented. An update that
 * returns a promise is handed to the platform as a pending callback, and `await requestAnimationFrame()`
 * inside it deadlocks the transition permanently — measured: no `ready`, no `finished`, and the mutation never
 * happens, because the transition waits for the promise and the promise waits for a rendering update the
 * transition is holding. So a returned thenable is never handed over: it throws, which abandons the transition
 * at once and comes back to the caller as its own error rather than as an outcome, because an async callback
 * passed to a synchronous API is a mistake and not a platform situation.
 */
/** Why a transition did not run. A reason is an occasion, never a mistake — mistakes reject. */
export type ViewTransitionReason =
  'aborted' | 'hidden' | 'in-flight' | 'unsupported'

/** A promise-returning update is not this API's shape, and saying so in the type is half of enforcing it. */
type Synchronous<T> = T extends PromiseLike<unknown> ? never : T

class AsyncUpdateError extends TypeError {
  constructor() {
    super(
      'View transition update requires a synchronous update: do not await, schedule a frame, or return a' +
        ' promise from the update callback. A promise is handed to the browser as a pending callback, and' +
        ' awaiting a rendering frame inside it deadlocks the transition permanently.',
    )
    this.name = 'AsyncUpdateError'
  }
}

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  (typeof value === 'object' || typeof value === 'function') &&
  value !== null &&
  typeof (value as PromiseLike<unknown>).then === 'function'

/** The transition in flight for this document, which is what makes concurrency the library's business. */
let current: null | ViewTransition = null

/**
 * Whether a call has already been made in the task now running — "task" meaning this one *and its microtasks*,
 * because those are still one interaction.
 *
 * `pnpm spike:vt-concurrency` measures three markers against seven dispatch shapes, and it settles two things.
 * Clearing in a microtask is wrong: a call deferred by `queueMicrotask` then reads as a new interaction, and a
 * promise-deferred echo is still an echo. Clearing in a later *task* gets that right, and `setTimeout(…, 0)`
 * scores identically on all seven shapes — but a timer is a duration and this is a boundary, so the clear is a
 * `MessageChannel` post, which is a task and nothing else.
 *
 * What no marker can do is beat a caller's own macrotask queued *before* the call: that write reads as the same
 * interaction and is coalesced. The failure direction is the safe one — the update still runs, nothing is
 * aborted, and only the animation is missed.
 *
 * A second click is a later task and supersedes, which is the point of the default. The clear is armed lazily,
 * on the path that may actually start a transition, so importing this module in an environment with no
 * document cannot leave a message port holding a process open.
 */
let calledThisInteraction = false
let interactionEnded = true
let interactionEnd: MessageChannel | null = null

const endInteraction = () => {
  interactionEnded = true
  calledThisInteraction = false
}

/** Read the marker, then arm one clear for the interaction now running — one at a time, so a later call cannot
 * be cut short by a clear that was queued before it. */
const repeatsCurrentInteraction = () => {
  const repeats = calledThisInteraction

  calledThisInteraction = true

  if (interactionEnded) {
    interactionEnded = false

    if (typeof MessageChannel === 'function') {
      interactionEnd ??= new MessageChannel()
      interactionEnd.port1.onmessage = endInteraction
      interactionEnd.port2.postMessage(0)
    } else setTimeout(endInteraction, 0)
  }

  return repeats
}

/**
 * The engine: one implementation, two faces. A controller’s `run` and `wrap` methods differ only in who
 * receives the lifecycle, and neither may grow its own copy of the platform's rules.
 *
 * Jumi invokes the update **exactly once per call**, and the update must complete synchronously. "Exactly
 * once" is a promise about the invocation and not about the lifetime of anything the update starts.
 */
const engine = async (
  /** The mutation, already guarded by the public face that accepted it. It must return nothing, or
   * something that is not a promise — checked here for the callers types cannot reach. */
  update: () => unknown,
  options: undefined | ViewTransitionOptions,
  hooks: ViewTransitionHooks,
): Promise<ViewTransitionOutcome> => {
  const mutate = () => {
    const result = update()
    if (isThenable(result)) {
      // Observe an invalid callback's promise without letting it hold a browser snapshot open.
      void Promise.resolve(result).catch(() => {})
      throw new AsyncUpdateError()
    }
  }

  if (
    typeof document === 'undefined' ||
    typeof document.startViewTransition !== 'function'
  ) {
    mutate()

    return declined(hooks, 'unsupported')
  }

  // A hidden document skips the transition outright and rejects `ready`. Deciding here reports that as an
  // outcome instead of leaving a rejection nobody is watching.
  if (document.visibilityState === 'hidden') {
    mutate()

    return declined(hooks, 'hidden')
  }

  // Read and arm in one move, and only on this path: the marker decides nothing unless a transition is in
  // flight, and a call that returns `unsupported` or `hidden` neither starts one nor can be in the way of one.
  const repeats = repeatsCurrentInteraction()
  const concurrency = options?.concurrency ?? 'auto'

  if (
    current &&
    (concurrency === 'coalesce' || (concurrency === 'auto' && repeats))
  ) {
    mutate()

    return declined(hooks, 'in-flight')
  }

  const transition = document.startViewTransition(mutate)

  current = transition

  // `ready` rejects on every abort as well as when the document is hidden, and `finished` resolves either way
  // — measured: a superseded transition settles `finished` normally while nothing animated. So readiness is
  // the signal that the transition materialised, and it is recorded rather than swallowed.
  const readiness = transition.ready.then(
    () => {
      // The first moment anything is visually transitioning — the pseudo tree exists. This, not the call, is
      // what `onTransitionStart` names: a call may still be declined after it, and a declined run never starts.
      report(hooks.onTransitionStart)

      return true
    },
    () => false,
  )

  // The platform publishes the update's own error on three promises, and any one of them left unobserved is
  // an unhandled rejection in the host's console. The caller gets that error once, through the returned
  // promise, so the platform's copies are consumed here.
  void transition.updateCallbackDone.catch(() => {})

  return transition.finished
    .then(
      async () => {
        if (await readiness) {
          // `finished` settling is not completion: a superseded transition settles it normally while nothing
          // animated. So this closes the interval start opened — a started transition ceasing to be active —
          // and never claims the animation reached its visual end.
          report(hooks.onTransitionEnd)

          return { transitioned: true as const }
        }

        return declined(hooks, 'aborted')
      },
      (error: unknown) => {
        // Platform skips resolve finished; a rejected finished carries the update failure.
        throw error
      },
    )
    .finally(() => {
      if (current === transition) current = null
    })
}

/** Report a decline, and answer with the outcome that describes it. */
const declined = (
  hooks: ViewTransitionHooks,
  reason: ViewTransitionReason,
): Promise<ViewTransitionOutcome> => {
  report(hooks.onDecline, reason)

  return Promise.resolve({ reason, transitioned: false })
}

/**
 * Call a hook without letting it become part of the transaction.
 *
 * A hook is instrumentation — telemetry, a dataset flag, a log — so its own failure must not rewrite what
 * happened to the run it was watching. A throw goes to the global error handler, where a development
 * environment will see it, and the run keeps the outcome it earned.
 */
const report = <Args extends unknown[]>(
  hook: ((...args: Args) => void) | undefined,
  ...args: Args
) => {
  if (!hook) return

  try {
    hook(...args)
  } catch (error) {
    if (typeof reportError === 'function') reportError(error)
    else console.error(error)
  }
}

/**
 * Configure a shared policy interface, not an independent transition domain. All controllers in this
 * module instance coordinate the document's active transition. `run` executes a one-off update; `wrap`
 * attaches lifecycle observation to a reusable operation.
 *
 *   const transition = createViewTransition({ concurrency: 'auto' })
 *   const open = transition.wrap(updateOpen, {
 *     onTransitionStart() {},
 *     onTransitionEnd() {},
 *     onDecline(reason) {},
 *     onError(error) {},
 *   })
 *   await open(true)
 *
 * Arguments and the call receiver are forwarded. The original return value is replaced by an outcome
 * promise. Each invocation has its own browser transition and promise, even when wrappers are shared.
 * Updates must commit DOM changes synchronously; framework setters may require an explicit flush.
 * Hooks observe the operation, not a publicly identified invocation. A started transition ending does not
 * promise it reached its visual endpoint. An error hook observes rejection without changing the result.
 */
export const createViewTransition = (
  options: ViewTransitionControllerOptions = {},
) => ({
  /** Run a one-off synchronous DOM update, optionally overriding this controller's policy. */
  run<Result>(
    update: () => Result & Synchronous<Result>,
    overrides?: ViewTransitionOptions,
  ): Promise<ViewTransitionOutcome> {
    return engine(
      update,
      { concurrency: overrides?.concurrency ?? options.concurrency ?? 'auto' },
      {},
    )
  },

  wrap<Args extends unknown[], Result, Receiver>(
    update: (this: Receiver, ...args: Args) => Result & Synchronous<Result>,
    hooks: ViewTransitionHooks = {},
  ): (this: Receiver, ...args: Args) => Promise<ViewTransitionOutcome> {
    return function (this: Receiver, ...args: Args) {
      const running = engine(() => update.apply(this, args), options, hooks)
      // Attach observation to the original promise. It still rejects for callers who await it.
      if (hooks.onError)
        void running.catch(error => report(hooks.onError, error))
      return running
    }
  },
})
