import { createViewTransition } from '../../vendor/jumi-view-transition.js'

const transition = createViewTransition()

/**
 * The demo's behaviour, in a module rather than in the page's `<script>` block.
 *
 * Not tidiness. A `<script>` inside `.astro` is checked by **nothing** that runs here: `tsc` cannot parse
 * `.astro`, so the `types` stage never sees it, and `docs:build` strips types without verifying them. That
 * is not a hypothetical gap — a real error shipped in this file (`pseudoElement` read off
 * `Animation.effect`, declared as the wider `AnimationEffect`) with a green gate, because the editor was the
 * only thing looking. One directory out, the same code is in the project `tsconfig.json` already covers —
 * every TypeScript file under the repository root — which also makes the vendored declaration load-bearing
 * in CI: `allowJs` is false, so this import cannot resolve without
 * `docs/vendor/jumi-view-transition.d.ts` existing.
 */

const grid = document.querySelector<HTMLElement>('.demo-grid')!
const cards = [...document.querySelectorAll<HTMLButtonElement>('.demo-card')]
const readout = document.querySelector<HTMLElement>('#demo-motion')!
const modes = [...document.querySelectorAll<HTMLButtonElement>('.demo-mode')]

/**
 * Which snapshot motion is in play.
 *
 * `jumi` is the default because it is the feature. `native` is the same layout shift with the names
 * written by hand — the comparison the page exists to make — and the only difference in the DOM is
 * which classes the cards carry, so nothing else can account for what changes.
 */
let mode: 'jumi' | 'native' = 'jumi'
let active = 'alpha'

const setMode = (next: 'jumi' | 'native') => {
  mode = next
  document.documentElement.dataset.demoMode = next

  for (const card of cards) {
    // Removed and re-added rather than toggled, because the candidates are what *name* the element
    // and one name per card is the whole mechanism: leaving both sets on would give every card two
    // names, and the browser refuses duplicates outright.
    for (const token of [...card.classList])
      if (token.startsWith('view-transition-')) card.classList.remove(token)
    if (next === 'jumi')
      card.classList.add(
        ...(card.dataset.jumi ?? '').split(' ').filter(Boolean),
      )
  }

  for (const button of modes)
    button.setAttribute('aria-pressed', String(button.dataset.mode === next))
  readout.textContent = 'waiting for a move'
}

const apply = () => {
  for (const card of cards) {
    const on = card.dataset.id === active
    card.toggleAttribute('data-active', on)
    card.setAttribute('aria-pressed', String(on))
  }
}

/**
 * Which motion ran, read off the animation rather than off the mode.
 *
 * `animationstart` on the root element is the moment the pseudo animations exist: the tree hangs off
 * the root, so its animations' events fire there — not on `body`, and not by bubbling — with
 * `pseudoElement` set, which is what makes one name addressable. That matters because the transition
 * object belongs to `createViewTransition` and is deliberately not handed out, so `transition.ready` is
 * not the page's to await; this event is the public equivalent, and it arrives when it happens rather
 * than after a poll.
 *
 * The blend the tree re-declares on each side starts on the same pseudo as the motion does, so it has
 * to be excluded by name or the readout could report it instead.
 */
document.documentElement.addEventListener('animationstart', event => {
  const identity = mode === 'jumi' ? active : `plain-${active}`

  if (event.pseudoElement !== `::view-transition-old(${identity})`) return
  if (event.animationName === '-ua-mix-blend-mode-plus-lighter') return

  // Named rather than counted, and named the way the page talks about it: the browser's own
  // cross-fade is `-ua-…`, Jumi's is a keyframe of its own. This is the one line that says which of
  // the two modes just ran without asking anyone to open a DevTools panel.
  readout.textContent = event.animationName.startsWith('jumi-')
    ? event.animationName
    : "the browser's own cross-fade"
})

/**
 * The move, inside the transaction boundary the wrapper opens.
 *
 * `startViewTransition` is not decoration here — it is the feature. The layout change has to happen
 * inside its callback for the browser to capture the before and after at all, which is why a demo of
 * this cannot avoid JavaScript the way the cross-document case can. What the page no longer does is
 * keep track of the lifecycle: which transition is current, what a second call means, that an aborted
 * call's callback still runs, and that a click has to be held until the geometry settles are all
 * `createViewTransition`'s, which is why this is three lines instead of forty.
 *
 * **And no options.** The default is this page's behaviour in both of its cases: a duplicate handler
 * firing in the same task as the gesture it belongs to is coalesced — the update still applies, and no
 * second transition aborts the one the reader is watching — while a real second click arrives in a later
 * task and supersedes, which is exactly what a reader clicking another card mid-flight is asking for. It
 * would take work to get the wrong answer here, which is the abstraction earning its place.
 */
const move = (id: string) => {
  if (!id || id === active) return

  const change = () => {
    active = id
    apply()
  }

  void transition.run(change)
}

for (const card of cards)
  card.addEventListener('click', () => move(card.dataset.id ?? ''))

/**
 * A click during a transition, which no card can receive.
 *
 * While a transition runs, the browser's pseudo tree covers the viewport and takes the hit outright:
 * `elementFromPoint` resolves to `<html>` for the whole duration and even `elementsFromPoint` returns
 * a bare `html`, so there is no element to resolve — a card's own listener never fires, and the click
 * reads as the page ignoring you. The event is still dispatched to the *document*, though, so it can
 * be resolved by hand, and that is what makes a 1s motion affordable instead of a dead second.
 *
 * Nothing queues and nothing is held. A move interrupts the transition in flight — the wrapper
 * supersedes it, because a click is a later task and therefore a new intent — and the platform is what
 * makes that safe for the boundary, so the gesture is answered where it lands rather than a quarter of
 * a second later.
 */
document.addEventListener('click', event => {
  /**
   * The overlay holding the hit is not a side effect to work around — it is the signal.
   *
   * While a transition runs, the click's target is `<html>`: the pseudo tree replaces the page's
   * hit-testing, so nothing else receives it. A click whose target is still an element was delivered
   * normally, and that element's own listener has already answered it.
   *
   * Acting on it here anyway would start a *second* transition for one gesture — and because the
   * update callback runs in a later rendering update rather than synchronously, `active` has not been
   * updated yet when this handler runs, so `move()`'s guard would not catch it. Measured, one click:
   * two `startViewTransition` calls 2ms apart, the first aborted, the aborted one's callback making the
   * DOM change, and the surviving one animating a boundary it did not fill in. That works only as long
   * as the browser runs the aborted call's callback *after* the surviving call's capture — an ordering
   * nothing guarantees, and the failure it risks is precisely a swap that changes the layout and
   * animates nothing.
   */
  if (event.target !== document.documentElement) return

  const { clientX, clientY } = event

  const contains = (element: HTMLElement) => {
    const { height, width, x, y } = element.getBoundingClientRect()

    return (
      clientX >= x &&
      clientX <= x + width &&
      clientY >= y &&
      clientY <= y + height
    )
  }

  // The mode switch is answered *first*, and deliberately not gated on the projection the way the
  // cards are. It does not move while a transition runs, so unlike a card there is nothing ambiguous
  // about a click on it — and since the browser's own motion lasts exactly as long as the projection,
  // every click on the switch during a native swap lands inside that window. Gating it dropped the
  // switch silently and the next swap then ran the mode the page was already in, which is a reported
  // bug and not a hypothetical one: "after switching from Browser default to Jumi, the first swap
  // behaves like it's still Browser default."
  //
  // Switching mid-transition is safe rather than merely survivable: the names the running transition
  // captured are already resolved into its pseudo tree, so a new `view-transition-name` belongs to the
  // next move and leaves the current one alone.
  const button = modes.find(contains)

  if (button) {
    setMode(button.dataset.mode as 'jumi' | 'native')

    return
  }

  // The cards, on the other hand, are mid-flight — and that is now the whole of the answer. The card
  // is resolved geometrically against its *live* box, which is where it is going rather than where it
  // is painted: the layout change has already happened, inside the callback, so the point maps to the
  // destination either way. The move then supersedes the transition in flight, so the reader gets the
  // card they clicked without waiting for the dissolve — and without the platform animating a boundary
  // that the aborted call filled in, which is what holding the gesture used to protect against.
  const card = cards.find(contains)

  if (!card) return

  move(card.dataset.id ?? '')
})

for (const button of modes)
  button.addEventListener('click', () =>
    setMode(button.dataset.mode as 'jumi' | 'native'),
  )

// Set once so the cards begin in the mode the page describes. `grid` is read only to keep the
// selector honest — a demo that silently did nothing would otherwise look identical.
if (grid) setMode('jumi')
