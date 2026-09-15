# View transition orchestration — what is the smallest wrapper worth shipping?

The question: _what is the smallest framework-agnostic orchestration API Jumi can provide around
`document.startViewTransition()` that eliminates browser lifecycle footguns without owning application state?_

The framing is accepted: class-only motion is the strongest part of this feature, and the imperative boundary
is not removable — the browser's contract is _capture old → run the application's mutation → capture new_, and
no class can say what state to change. What follows is what the boundary costs today, measured, and the
smallest thing that removes the parts of that cost which are not the author's problem.

Everything below was measured in Chromium 153 this session; the raw numbers live in
`engineering/research/view-transitions.md` and `/memories/repo/view-transitions.md`.

## The footguns, each with what it actually does

| #   | behaviour                                                                                           | measured                                                                                                           | what it looks like to an author                                                                           |
| --- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 1   | the update callback is **deferred** to a later rendering update                                     | 52ms after the call on a cold document, 16ms warm                                                                  | guards keyed on the value the callback sets do not catch a second call in the same task                   |
| 2   | a second `startViewTransition` **aborts** the first, and the aborted call's callback **still runs** | `#1`'s `ready` rejects `AbortError`; `#1`'s callback mutates the DOM at 2505ms; `#2` animates                      | one gesture produces two transitions, and the surviving one animates a boundary the aborted one filled in |
| 3   | therefore the boundary can be **empty** — the layout changes and nothing animates                   | reproduced on demand: two `supersede` calls → `old/new(bravo)` **absent**, no animation, `finished` still resolves | "the first click changes layout but doesn't animate"                                                      |
| 4   | `ready` **rejects** in normal operation                                                             | `AbortError` when aborted; `InvalidStateError` when the document is hidden                                         | an unhandled rejection in a console that is otherwise asserted clean                                      |
| 5   | a **hidden document** skips the transition entirely; the callback still runs                        | `ready` rejects, `finished` resolves                                                                               | works in a test, not in a background tab                                                                  |
| 6   | the pseudo tree **replaces hit-testing** — the click's target becomes `<html>`                      | `elementsFromPoint` returns a bare `html` for the whole transition                                                 | clicks during a transition resolve to nothing unless the app handles them itself                          |
| 7   | the tree's lifetime **is** the slowest animation on it                                              | 1s motion ⇒ the page is click-blocked for 1s                                                                       | motion duration is a UX decision, not a detail                                                            |

7 is the one already settled and it belongs to the emission. 6 is a demo-level concern. **1–5 are the
orchestration surface**, and none of them is discoverable from the API's shape.

## The smallest API that absorbs them

The surface as decided, with one question still open at the end of this note:

```ts
type ViewTransitionOutcome =
  | { transitioned: true }
  | {
      transitioned: false
      reason: 'unsupported' | 'hidden' | 'in-flight' | 'aborted'
    }

type ViewTransitionOptions = { concurrency?: 'coalesce' | 'supersede' }

function runViewTransition(
  update: () => void,
  options?: ViewTransitionOptions,
): Promise<ViewTransitionOutcome>
```

Its whole body is the ~25 lines prototyped this session, and the guarantees it can make are narrow:

- **the update always runs, exactly once per call** — the wrapper never drops the caller's mutation, because
  dropping it desynchronises the DOM from the application's intent. This is what keeps it out of the state
  business.
- **at most one transition in flight, and the second call decides by _when_ it arrives.** Two calls in one task
  are an echo and are coalesced into the one running; a call from a later task is a gesture and supersedes. This
  is `auto`, the default, and the section below is the measurement it rests on.
- **the update is inside the boundary the caller gets animated**, because the wrapper passes its own callback.
- **no unhandled rejections**, and a stated reason for every case where nothing was transitioned. This one is
  only cheap to claim and expensive to get right: the platform publishes the update's error on three promises
  at once, and consuming the two an implementer has a reason to look at still leaks the third (below).

Two deliberate silences, argued rather than overlooked:

- **`transitioned`, not `animated`.** A view transition can be meaningful with identical geometry (opacity,
  colour, content, clipping, an image swap) and geometry can change without a useful transition, so neither a
  geometry comparison nor a pseudo-tree probe defines "visibly animated". The wrapper knows whether it invoked
  `startViewTransition`, whether the update ran, whether it coalesced and whether the transition was aborted.
  It cannot know whether the reader perceived motion, and the outcome vocabulary says exactly that much.
- **no `no-change` in 1.0.** See below: the boundary can be empty and `finished` still resolves, so an outcome
  derived from `finished` cannot tell. Proving it would mean watching the DOM across the callback, which is
  both a heuristic and a claim about relevance the wrapper is not entitled to make.

### Why the default is `auto`, and what "the same interaction" means

The first default was `coalesce` for every in-flight call, on the argument that starting a second transition is
the dangerous operation. Two measurements narrowed that. The danger is real but _specific_: the empty boundary
needs the mutation to live in the **aborted** call's callback, and a supersede that lands once the first
transition is already running fills its boundary correctly (probed with a same-task pair and a 200ms gap). And
coalescing an in-flight call does **not** necessarily cost the reader the animation, which is what the argument
assumed — with a second write 200ms into a running transition, the changed element travelled 250ms either way.

What survives is a shape the wrapper can detect: two calls in one task cannot be two human gestures, so that one
is an echo and should not be allowed to abort anything. A call from a later task can be a gesture, and should
win. `pnpm spike:vt-concurrency` measures three candidate markers against seven dispatch shapes:

| shape                                   | microtask   | timeout    | message    |
| --------------------------------------- | ----------- | ---------- | ---------- |
| duplicate writer, one task              | same        | same       | same       |
| call from `queueMicrotask`              | **later ✗** | same       | same       |
| call from `setTimeout(…, 0)`            | later       | later      | later      |
| caller's timer queued _before_ the call | later       | **same ✗** | **same ✗** |
| second real click                       | later       | later      | later      |
| `dblclick`                              | later       | later      | later      |
| keyboard auto-repeat                    | later       | later      | later      |

Clearing in a microtask is wrong: a promise-deferred echo is still an echo. Clearing in a later _task_ gets all
five of the cases that matter right, and `setTimeout(…, 0)` scores identically on every shape — but a timer is a
duration and this is a boundary, so the clear is a `MessageChannel` post, which is a task and nothing else.

The one shape no marker can win is a caller's own macrotask queued _before_ the call: that write reads as the
same interaction and is coalesced. It fails in the safe direction — the update still runs, nothing is aborted,
and only the animation is missed.

So the default is `auto`: an echo is coalesced, a gesture supersedes. The demo now calls
`runViewTransition(change)` with no options and gets both, and `demo:check` asserts the superseding half through
a real mouse click mid-transition — the call that survives is the one whose callback made the change.

`coalesce` and `supersede` remain as overrides, for callers who know something the timing does not: a poll or a
resize writing on a schedule wants `coalesce` whatever the task, and a programmatic double-write that must land
as two transitions wants `supersede`. The gate asserts all of it, including the microtask case that decided the
marker.

### Supersede is safe once the first transition is running (measured)

The empty-boundary row above describes **one** shape: two calls in the same task where the change lives in the
_aborted_ call's callback, which runs after the surviving call has already captured — so the surviving boundary
animates a change it never photographed. A supersede that lands while the first transition is already running
is a different shape, and it is the demo's: the reader clicks a second card mid-flight.

Probed directly — two named elements, each call moving a different one, checking whether the second call's
element has a boundary at all:

```text
same task   dos boundary: present   ::view-transition-{group,new,old}(uno) and (dos)
200ms gap   dos boundary: present   ::view-transition-{group,new,old}(uno) and (dos)
```

Both survive. The reason is the ordering above: when the first transition has materialised, its mutation is
long since done, so the second call's capture contains the real before-state — and because that state is the
first transition's _painted_ one, the new move continues from mid-flight instead of restarting from a settled
layout. So the danger is not "supersede" but "supersede inside one task, with the mutation in the aborted
callback", which is exactly the double-trigger the demo hit and fixed.

What this does **not** say is that the same-task probe above reproduces _absence_: it does not, because both
its calls mutate a different element. The absence measurement stands on its own shape (one element, the
mutation in the aborted callback) and is not generalised here.

### Reading the tree from the page (measured)

The demo's readout names the motion that just ran, so it needs the moment those pseudo animations exist. It
cannot use `transition.ready` — the wrapper owns the transition object and does not hand it out — and it should
not poll. `animationstart` on `document.documentElement` is that moment:

```text
-ua-view-transition-group-anim-root   ::view-transition-group(root)
-ua-view-transition-fade-out          ::view-transition-old(root)
jumi-fade-out                         ::view-transition-old(hero)
```

which is the list `document.getAnimations()` returns at `ready`, delivered as events. Two details worth keeping:
the events fire on the root element for the transition's pseudo animations — not on `body`, and not by bubbling,
so a capture-phase listener on `document` sees them and a listener on `body` does not — and `pseudoElement` is
set, which is what lets a page filter for one name. So a caller can observe readiness, and name the motion,
entirely through the platform; the wrapper does not have to expose its transition for it.

### `finished` resolving does not mean anything animated

The reason the vocabulary has no `animated`, and the reason `no-change` is not in 1.0. On the supersede path
above, `finished` resolved normally while no pseudo animation existed at all — the boundary contained no
change, so the transition completed instantly. An outcome derived from `finished` reports success for a swap
that did nothing, and the wrapper would be claiming to know something about perception that it does not.

It could compare geometry across its own callback and catch the ordinary case (a layout swap changes a box),
but that is a heuristic: it misses opacity, colour, content, clipping and image replacement, and it would treat
an irrelevant geometry change as meaningful. A reported `no-change` that is sometimes wrong is worse than
silence, so the claim is left to the author who knows what their update does.

### What the outcome is derived from, and the two bugs a fake could not have caught

The first implementation read `finished` and reported `transitioned: true` whenever it resolved. Against the
platform that is wrong in both directions at once, and the browser arms caught it on the first run:

```text
supersede, two calls    2 transitions: [{"transitioned":true},{"transitioned":true}]
                        ↑ the call that was aborted claims it transitioned, and `aborted` is unreachable
refusal arm             unhandled rejection: AsyncUpdateError …
                        ↑ while the arm asserting "no unhandled rejection" reads the same error as handled
```

**The outcome is `ready`, not `finished`.** On the supersede path the platform aborts the first transition
before it materialises, and its `finished` still resolves — the property measured above, which the vocabulary
already described and the implementation did not yet act on. So the wrapper records readiness and reports
`aborted` from it, which is what makes the outcome mean "this transition materialised and its boundary held
my update" rather than "the platform finished something". `finished` is still what the returned promise waits
on, because that is when the transition is over.

**The update's error is published three times.** `ready`, `updateCallbackDone` and `finished` all reject with
it, and the arms assert this as a platform property rather than a library one, on a page the wrapper never
touches: consume all three → 0 unhandled rejections; consume `ready` and `finished` only → 1. A wrapper that
looks at the two promises it has a reason to look at leaks the third into the host's console, which is exactly
what this one did. The caller still receives the error once, through the returned promise.

Neither bug was reachable from the fake, which is the point: it modelled `finished` resolving and aborting as
the real platform does _as far as the fake's author believed_, and the belief was wrong in the two places the
wrapper's honesty depends on. The type contract that survives in `src/view-transition.test.ts` is the part a
unit test can actually enforce — that an async update is refused at the type level and at runtime.

## Async updates: measured, and why 1.0 stays synchronous

Widening the signature to `() => void | Promise<void>` was conditional on this being measured, so it was — one
fresh context per scenario, because the first attempt ran them in a single page and an un-settled transition
poisoned every scenario after it.

| update                                          | result                                                                                                                                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `await setTimeout(0)`, then mutate              | **works** — the boundary spans the await, `ready` resolves after it, the animation runs and the mutation is inside the boundary                                                                       |
| `await Promise.resolve()`, then mutate          | **works** — same, the promise merely defers within the task                                                                                                                                           |
| `await requestAnimationFrame(...)`, then mutate | **wedges the transition permanently** — no `ready`, no `finished`, no mutation, ever                                                                                                                  |
| rejects after mutating                          | `ready` rejects, `finished` rejects with the update's error, **and the callback's own promise is unobserved: unhandled rejection _and_ page error**. The DOM is left mutated                          |
| rejects before mutating                         | same rejections; the DOM is left unmutated                                                                                                                                                            |
| two async calls, the second settling later      | both mutations apply — the superseded call's promise still settles, so its mutation lands **during the later transition's window**, the same foreign-boundary shape as the synchronous double-trigger |

The rendering-frame row is the one that decides it. `await new Promise(resolve => requestAnimationFrame(resolve))` is the most idiomatic thing an author writes to let the DOM settle, and inside the update callback it is fatal: the transition waits for the promise, the promise waits for a rendering update that the pending transition is holding, and neither ever happens. Nothing is reported to the caller because nothing fails — the page simply stays as it was, with a transition pending.

Three independent reasons, and the wrapper cannot fix two of them without owning the caller's promise:

1. **The outcome vocabulary has no room for a rejected update.** A rejection is not an abort, and reporting it as one would hide an author bug behind a lifecycle word. A `reason: 'failed'` would be needed, and the wrapper would have to observe the callback's promise to report it at all.
2. **A wedged transition is unobservable and unrecoverable from inside.** The wrapper could timebox `ready` and apply the update itself, but that mutates outside the boundary it promised — a worse contract than the one it is protecting.
3. **A superseded async update mutates during the next transition's window.** The only defence is not superseding while an update is pending, which is a rule for the caller, not a guarantee the wrapper can give.

The recommendation is therefore to keep `update: () => void` for 1.0. **Open question:** even with a synchronous signature, an author can trivially write `runViewTransition(async () => …)` and the wrapper cannot refuse it without a runtime type check — so the rAF wedge is reachable through the shipped API, and the decision is whether to document it, to timebox `ready` and report `{transitioned: false, reason: 'hidden'}`-style, or to widen the signature with a `failed` reason after all.

**Settled:** neither document it nor widen it. The signature refuses the shape (`() => T & Synchronous<T>`, so
the `@ts-expect-error` cases in `src/view-transition.test.ts` fail the `types` stage if that ever stops
holding), and the runtime refuses the value — a returned thenable is never handed to the platform, which is the
only way the wedge is reachable at all. Both are asserted against the real platform: the refusal arm checks the
error that reaches the caller _and_ that the call after it still reports `transitioned: true`, because an
enforcement that leaves the document unwedgeable but a transition abandoned forever would pass the first check
and fail the second. Measured: two transitions started across three calls, and the document is not wedged.

## What the wrapper must not do

- **Not own state.** No `setActive`-shaped API. The CTO's preference for `transition(() => setActive('bravo'))`
  over `useViewTransition('alpha')` is right for this reason — the latter owns the value and would have to
  re-implement whatever the framework already does.
- **Not interpret events.** `data-view-transition-trigger` cannot exist: the browser needs the mutation, and
  only the application knows what it is. A wrapper that decided the mutation would be an interaction framework.
- **Not decide reduced motion.** That decision is already made in the emission — Jumi's rules live inside
  `@media (prefers-reduced-motion: no-preference)` and leave the browser's own cross-fade in place. A wrapper
  second-guessing it would duplicate the policy in two places, and the measured cost of getting it wrong is
  a reader who asked for less motion getting a full 1s fade.
- **Not keep the tree mounted.** It is per-transition by design; audited, and nothing in the emission can
  create, hold, or hide it.

## Layering, and the part that stays zero-JS

```text
@ibnlanre/jumi                 → the CSS / Tailwind motion system (unchanged)
@ibnlanre/jumi/view-transition → the wrapper above, framework-agnostic, no dependencies
@ibnlanre/jumi/react           → optional: a hook that returns the wrapper, owning no state
```

Cross-document stays CSS-only — `@view-transition { navigation: auto }` and Jumi's classes doing both sides'
motion, with nothing to orchestrate and no footguns available. That is the half of the story that needs no
runtime at all, and it should stay the headline.

## Open questions for the CTO

1. **The rAF wedge.** It is reachable through the shipped API even with a synchronous signature (an author can
   pass an async function; nothing refuses it at runtime). Document it, timebox `ready` and report, or add
   `failed` and accept async properly? My recommendation is to document it in 1.0 and keep the signature
   honest, because timeboxing changes where the update lands and a `failed` reason widens the contract to own
   the caller's promise.
2. **The demo.** It currently wraps its own `startViewTransition` calls and tracks in-flight state by hand,
   which is the wrapper's job — so dogfooding it is the natural end-to-end proof. It also reads `getAnimations()`
   to say which motion ran, which is exactly the platform observation the wrapper deliberately does not expose;
   the demo can keep doing that from outside the wrapper, which is the layering working as intended.

## Appendix — the case study this session produced

The strongest argument for owning the wrapper is that two people and one instrument failed to avoid these
footguns in a _demo_:

- the document-level click handler double-fired with a card's own listener → two transitions per click
  (footgun 2), which survived review and instrumentation until the timeline above caught it;
- the demo's readout chained `ready.then(...)` with no `catch`, and `ready` rejects whenever a transition is
  superseded — an unhandled rejection waiting for the first interrupted swap (footgun 4);
- the fix for the double-fire was not a flag but the _event target_, because while a transition runs the
  pseudo tree takes the hit (footgun 6) — an argument that would have to be rediscovered by every Jumi user.

If the ambition is "assign classes, change state, get motion", then the state change is the only platform
detail an author should have to know, and this wrapper is the difference between that and knowing all seven.
