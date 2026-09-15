---
layout: ../../layouts/Docs.astro
title: Same-document transitions.
description: One wrapper around your state change, and the browser does the rest.
---

## The half CSS cannot do

[View transitions](/docs/view-transitions/) are CSS until the moment the thing that moves is your own
application state. A navigation is the browser's business — `@view-transition { navigation: auto }` and the
two documents are captured for you — but swapping a card, opening a panel, or reordering a list happens
_inside_ one document, and the browser cannot see it happen. It needs a before and an after, which means
someone has to say when the change is.

That is the whole job of `runViewTransition`:

```ts
import { runViewTransition } from '@ibnlanre/jumi/view-transition'

runViewTransition(() => {
  setActive('bravo')
})
```

The callback is where your change goes, so the browser captures the before and the after around it. The
classes from [View transitions](/docs/view-transitions/) style what happens next. Nothing else is required:
no framework, no state library, and no runtime in the root package — `@ibnlanre/jumi` stays CSS and
build-time, and only the page that changes state imports this subpath.

## The callback must finish synchronously

**Do not `await` inside it, do not return a Promise, and do not wait for a frame.** This is not a style
preference. A promise handed to the browser is a _pending_ callback, and `await requestAnimationFrame()`
inside one wedges the transition permanently: no capture, no animation, no error, and the change never lands.
The callback is called once, and it has to be finished when it returns. If your change depends on something
asynchronous, do that first and then transition the result:

```ts
const next = await load()

runViewTransition(() => {
  setActive(next)
})
```

## Two calls, and which one wins

Calling it twice while a transition is running is the case worth knowing about, and the default — `auto` —
decides by _when_ the second call arrives. Which is the one thing an accidental duplicate cannot hide:

- **the same task.** A second call from the same event, or one that event deferred with a promise, is the
  same interaction twice: your update runs immediately, and no second transition starts. Nothing is dropped,
  and the transition the reader is already watching is not cut short. (Whether that update shows up inside
  the running transition's snapshots depends on when they were taken — the point is that you do not have to
  think about it.)
- **a later task.** A second click, a keypress, a timer: a new intention, so it supersedes. The move the
  reader just asked for happens now, and the transition in flight is replaced by it.

So a duplicate handler is harmless and a rapid second gesture is answered, without either case becoming your
problem. Override it only when you know something the timing does not:

```ts
// a poll or a resize writing on a schedule: never a second transition per write
runViewTransition(update, { concurrency: 'coalesce' })

// always start a transition, whatever the timing
runViewTransition(update, { concurrency: 'supersede' })
```

## The result, if you want it

The call resolves to an outcome instead of rejecting whenever the transition could not run. Most callers fire
it and ignore the result; branch on it when the difference matters, such as reporting why nothing animated:

```ts
const result = await runViewTransition(() => {
  setOpen(true)
})

if (!result.transitioned) {
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
whether your change happened — and the one thing the call refuses loudly rather than reporting is an
asynchronous callback, because that is a mistake rather than a platform situation.

## See it together

[The layout projection demo ↗](/demo/view-transitions/) is the whole story on one page: candidates styling
the old and new snapshots, a real layout shift, a second click arriving mid-transition, and a switch to the
browser's own behaviour to compare.
