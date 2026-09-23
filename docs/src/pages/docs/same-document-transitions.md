---
layout: ../../layouts/Docs.astro
title: Same-document transitions.
description: One wrapper around your state change, and the browser does the rest.
---

## The half CSS cannot do

[View transitions](/docs/view-transitions/) are CSS until the moment the thing that moves is your own
application state. A navigation is the browser's business (`@view-transition { navigation: auto }` and the
two documents are captured for you), but swapping a card, opening a panel, or reordering a list happens
_inside_ one document, and the browser cannot see it happen. It needs a before and an after, which means
someone has to say when the change is.

Create a transition controller and run the state change through it:

```ts
import { createViewTransition } from '@ibnlanre/jumi/view-transition'

const transition = createViewTransition()

transition.run(() => {
  setActive('bravo')
})
```

The callback is where your change goes, so the browser captures the before and the after around it. The
classes from [View transitions](/docs/view-transitions/) style what happens next. Nothing else is required:
no framework, no state library, and no runtime in the root package: `@ibnlanre/jumi` stays CSS and
build-time, and only the page that changes state imports this subpath.

## The callback must finish synchronously

**Do not `await` inside it, do not return a Promise, and do not wait for a frame.** This is not a style
preference. A promise handed to the browser is a _pending_ callback, and `await requestAnimationFrame()`
inside one wedges the transition permanently: no capture, no animation, no error, and the change never lands.
The callback is called once, and it has to be finished when it returns. If your change depends on something
asynchronous, do that first and then transition the result:

```ts
const next = await load()

transition.run(() => {
  setActive(next)
})
```

## Two calls, and which one wins

Calling it twice while a transition is running is the case worth knowing about, and the default (`auto`)
decides by _when_ the second call arrives. Which is the one thing an accidental duplicate cannot hide:

- **the same task.** A second call from the same event, or one that event deferred with a promise, is the
  same interaction twice: your update runs immediately, and no second transition starts. Nothing is dropped,
  and the transition the reader is already watching is not cut short. (Whether that update shows up inside
  the running transition's snapshots depends on when they were taken: the point is that you do not have to
  think about it.)
- **a later task.** A second click, a keypress, a timer: a new intention, so it supersedes. The move the
  reader just asked for happens now, and the transition in flight is replaced by it.

So a duplicate handler is harmless and a rapid second gesture is answered, without either case becoming your
problem. Override it only when you know something the timing does not:

```ts
// a poll or a resize writing on a schedule: never a second transition per write
const backgroundUpdates = createViewTransition({ concurrency: 'coalesce' })
backgroundUpdates.run(update)

// override a controller's policy for this call
transition.run(update, { concurrency: 'supersede' })
```

## The result, if you want it

The call resolves to an outcome instead of rejecting whenever the transition could not run. Most callers fire
it and ignore the result; branch on it when the difference matters, such as reporting why nothing animated,
the outcome is a discriminated union, so `reason` exists only on the branch where nothing ran:

```ts
const result = await transition.run(() => {
  setOpen(true)
})

if (result.transitioned) {
  console.log('the change animated')
} else {
  // narrowed: `reason` exists here, and nowhere else
  console.log(result.reason)
}
```

| `result`                                         | meaning                                                  |
| ------------------------------------------------ | -------------------------------------------------------- |
| `{ transitioned: true }`                         | the transition ran, with your change inside its boundary |
| `{ transitioned: false, reason: 'in-flight' }`   | a duplicate call in the same interaction                 |
| `{ transitioned: false, reason: 'aborted' }`     | replaced or skipped before it animated                   |
| `{ transitioned: false, reason: 'hidden' }`      | the document is in a background tab                      |
| `{ transitioned: false, reason: 'unsupported' }` | this browser has no view transitions                     |

Your update runs exactly once per call in every one of those cases. An outcome describes the animation, never
whether your change happened, while update errors and asynchronous callbacks reject rather than becoming platform outcomes.

## Reusable operations

Use `transition.run(update, options)` for a one-off change. For reusable operations, the controller
holds shared concurrency policy and each wrapped operation owns its lifecycle:

```ts
import { createViewTransition } from '@ibnlanre/jumi/view-transition'

const transition = createViewTransition({ concurrency: 'auto' })
const open = transition.wrap(updateOpen, {
  onTransitionStart() {
    console.log('open transition started')
  },
  onTransitionEnd() {
    console.log('open transition stopped')
  },
  onDecline(reason) {
    console.log('updated without animation', reason)
  },
  onError(error) {
    console.error(error)
  },
})

await open(true)
```

`wrap()` preserves the update's argument types and call receiver, but intentionally replaces its original
return value with `Promise<ViewTransitionOutcome>`. Functional updater arguments are forwarded unchanged.
The controller exposes `run` for one-offs and `wrap` for reusable operations. Lifecycle hooks belong to
the wrapped operation, not the controller.

| Hook                  | Meaning                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `onTransitionStart()` | The visual transition materialized (`ready` resolved).                                                                                 |
| `onTransitionEnd()`   | A started transition ceased being active, including being superseded or skipped. This does not promise it reached its visual endpoint. |
| `onDecline(reason)`   | The mutation happened, but no visual transition materialized.                                                                          |
| `onError(error)`      | The invocation rejected. The hook observes the error; its returned promise still rejects.                                              |

Wrapping establishes **operation attribution**, not invocation attribution. `open(true)` and `open(false)`
can overlap and invoke the same hooks. Jumi tracks their transitions independently internally; each call's
returned promise is its own outcome channel. A hook alone cannot identify which overlapping call fired.
A controller is a configured interface, **not an independent transition domain**. All controllers in the
same module instance coordinate the document’s active transition. Separate controllers can carry different
policies, but their transitions still compete. The policy of the incoming call determines how it proceeds.

Update errors reject, including on unsupported, hidden and coalesced paths. With `onError`, Jumi attaches
an observer to that rejection; awaiting the returned promise still throws. A hook's own exception is
reported to the global error handler and does not change the invocation's outcome.

## Framework updates must commit the DOM

A synchronous JavaScript setter does not necessarily commit the DOM synchronously. The wrapped update
must finish its DOM changes inside the browser's update callback. Jumi cannot infer or flush a framework's
rendering schedule.

For React, make the commit boundary explicit:

```ts
import { flushSync } from 'react-dom'
import type { SetStateAction } from 'react'
import { createViewTransition } from '@ibnlanre/jumi/view-transition'

const transition = createViewTransition()
const open = transition.wrap((next: SetStateAction<boolean>) => {
  flushSync(() => setOpen(next))
})

await open(true)
await open(previous => !previous)
```

Use this from an event handler where flushing is supported. `wrap(setOpen)` alone does not guarantee the
new DOM is captured. React's [flushSync documentation](https://react.dev/reference/react-dom/flushSync)
explains the constraints and performance tradeoffs. Other frameworks need their equivalent synchronous
commit boundary. Async navigation functions are not automatically valid updates: finish asynchronous work
first, then wrap the synchronous DOM mutation.

Both APIs reject Promise-returning updates at the TypeScript boundary and at runtime. Neither introduces
an asynchronous update mode.

## See it together

[The layout projection demo ↗](/demo/view-transitions/) is the whole story on one page: candidates styling
the old and new snapshots, a real layout shift, a second click arriving mid-transition, and a switch to the
browser's own behaviour to compare.
