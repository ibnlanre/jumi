/**
 * Does the showcase do what its page says it does?
 *
 * Deliberately **not** in the gate: the demo is a showcase and the evidence for the feature is
 * `view-transition:check`. This exists because a demo that silently animates nothing looks exactly like
 * a demo whose effect is subtle — the failure mode `stories:check` was written for — and it has already
 * earned its place twice: it caught the emitter refusing every candidate in a page after a CSS optimizer
 * merged the staged rules into one selector list, and it caught the demo's own mode switch leaving
 * Jumi's motion attached to the hand-written names.
 *
 * It builds the docs first, because what it serves is the built site. `DEMO_BASE` points it at a running
 * dev server instead, which is how the same page can be checked before a build exists.
 *
 * The third thing it caught is not a bug in the emission and cannot be one: while a transition runs, the
 * browser's pseudo tree covers the viewport and takes the pointer hit outright — `elementsFromPoint` returns
 * a bare `html` — so no card sees a click, and the page answers it by hand instead. That rescue has been
 * wrong twice, and both arms now exist to keep it right. A gesture inside the projection is answered where
 * it lands, by a second transition that supersedes the first: dropping it was reported as "sometimes it
 * works, sometimes it doesn't", because what a reader got depended only on how fast they had clicked before,
 * and holding it until the geometry settled made the page feel a quarter of a second behind. The lifecycle
 * that made holding necessary — which transition is current, and what a second call does to the first — is
 * `runViewTransition`'s, and the arms below assert the boundary it opens is filled by the call that survives.
 * The mode switch is answered without the projection gate the cards used to need: the switch does not move,
 * so nothing about a click on it is ambiguous, and gating it dropped the switch during every native swap.
 *
 * Run: pnpm demo:check
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { chromium } from 'playwright'

import path from 'node:path'

if (!process.env.DEMO_BASE) {
  console.log('· building the docs')
  execFileSync('pnpm', ['run', 'docs:build'], {
    cwd: path.join(path.dirname(new URL(import.meta.url).pathname), '..'),
    stdio: 'pipe',
  })
}

const here = path.dirname(new URL(import.meta.url).pathname)
const dist = path.join(here, '..', 'docs', 'dist')

const types = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
}

const server = createServer((request, response) => {
  let name = decodeURIComponent(
    new URL(request.url, 'http://127.0.0.1').pathname,
  )
  if (name.endsWith('/')) name += 'index.html'

  try {
    const body = readFileSync(path.join(dist, name))
    response
      .writeHead(200, {
        'content-type': types[path.extname(name)] ?? 'application/octet-stream',
      })
      .end(body)
  } catch {
    response.writeHead(404).end('no')
  }
})

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const base =
  process.env.DEMO_BASE ?? `http://127.0.0.1:${server.address().port}`

const checks = []
const check = (label, pass, detail = '') => checks.push({ detail, label, pass })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { height: 900, width: 1200 },
})

/**
 * One record per `startViewTransition` call, so the boundary can be asserted rather than assumed.
 *
 * Two things went wrong inside the boundary once already, and neither was visible in the page's own code:
 * the document-level handler for clicks the overlay swallows fired *in addition* to a card's own listener,
 * so one click started two transitions — the first aborted, and the aborted one's callback making the DOM
 * change while the surviving one animated a boundary it had not filled in. That works only while the
 * browser runs the aborted callback after the survivor's capture, which nothing guarantees, and the failure
 * it risks is a swap that changes the layout and animates nothing.
 */
await context.addInitScript(() => {
  window.__transitions = []

  const install = () => {
    const original = document.startViewTransition.bind(document)

    document.startViewTransition = callback => {
      const record = {
        activeAfter: null,
        activeBefore:
          document.querySelector('.demo-card[data-active]')?.dataset.id ?? null,
        activeInCallback: null,
        groupAtReady: null,
        ready: 'pending',
      }

      window.__transitions.push(record)

      const transition = original(() => {
        record.activeInCallback =
          document.querySelector('.demo-card[data-active]')?.dataset.id ?? null

        const result = callback()

        record.activeAfter =
          document.querySelector('.demo-card[data-active]')?.dataset.id ?? null

        return result
      })

      transition.ready
        .then(() => {
          record.ready = 'resolved'
          record.groupAtReady = document
            .getAnimations()
            .some(
              animation =>
                animation.effect?.pseudoElement ===
                `::view-transition-group(${record.activeBefore})`,
            )
        })
        .catch(error => {
          record.ready = `rejected: ${error.name}`
        })

      return transition
    }
  }

  if (document.readyState === 'loading')
    addEventListener('DOMContentLoaded', install)
  else install()
})

const page = await context.newPage()

const errors = []
page.on('pageerror', error => errors.push(String(error)))
page.on(
  'console',
  message => message.type() === 'error' && errors.push(message.text()),
)

await page.goto(`${base}/demo/view-transitions/`)
await page.waitForLoadState('load')

const box = id =>
  page.evaluate(card => {
    const { height, width, x, y } = document
      .querySelector(`.demo-card[data-id="${card}"]`)
      .getBoundingClientRect()

    return {
      height: Math.round(height),
      width: Math.round(width),
      x: Math.round(x),
      y: Math.round(y),
    }
  }, id)

/** The centre of a card, which is where a real mouse gesture has to be aimed. */
const centre = async id => {
  const { height, width, x, y } = await box(id)

  return { x: x + width / 2, y: y + height / 2 }
}

/** What ran on the outgoing snapshot of a card, read while the transition is still live. */
const ran = async card => {
  await page.waitForTimeout(160)

  return page.evaluate(id => {
    const animations = document.getAnimations()
    const [outgoing] = animations.filter(
      animation =>
        animation.effect?.pseudoElement === `::view-transition-old(${id})`,
    )
    const [travel] = animations.filter(
      animation =>
        animation.effect?.pseudoElement === `::view-transition-group(${id})`,
    )
    const group = animations.some(
      animation =>
        animation.effect?.pseudoElement === `::view-transition-group(${id})`,
    )

    return {
      group,
      groupDuration: travel?.effect?.getTiming().duration ?? 0,
      name: outgoing instanceof CSSAnimation ? outgoing.animationName : '',
      pseudoDuration: outgoing?.effect?.getTiming().duration ?? 0,
    }
  }, card)
}

const name = id =>
  page.evaluate(
    card =>
      getComputedStyle(document.querySelector(`.demo-card[data-id="${card}"]`))
        .viewTransitionName,
    id,
  )

/* ------------------------------------------------------------------ Jumi mode (the default) */

const alphaBefore = await box('alpha')
const bravoBefore = await box('bravo')

check(
  'the page names every card in Jumi mode',
  (await name('alpha')) === 'alpha' && (await name('bravo')) === 'bravo',
)
check(
  'and starts with the first card expanded',
  alphaBefore.width > bravoBefore.width,
  `alpha ${alphaBefore.width}×${alphaBefore.height}, bravo ${bravoBefore.width}×${bravoBefore.height}`,
)

await page.click('.demo-card[data-id="bravo"]')
const jumi = await ran('bravo')

const bravoAfter = await box('bravo')
const alphaAfter = await box('alpha')

check(
  'the browser projects the geometry, not just the style',
  bravoAfter.width > bravoBefore.width &&
    bravoAfter.x < bravoBefore.x &&
    alphaAfter.x > alphaBefore.x,
  `bravo ${bravoBefore.width}→${bravoAfter.width} wide and left ${bravoBefore.x}→${bravoAfter.x};` +
    ` alpha left ${alphaBefore.x}→${alphaAfter.x}`,
)

check('the group is built for the card that moved', jumi.group)
check(
  "Jumi's motion runs on the outgoing snapshot",
  jumi.name.startsWith('jumi-'),
  jumi.name || 'none',
)
check(
  'and the page says so',
  (await page.textContent('#demo-motion')) === jumi.name,
  (await page.textContent('#demo-motion')) ?? '',
)

/* ------------------------------------------------- the boundary the swap happens inside --------------- */

const [boundary] = await page.evaluate(() => window.__transitions)

check(
  'one click starts exactly one transition',
  (await page.evaluate(() => window.__transitions.length)) === 1,
  `${await page.evaluate(() => window.__transitions.length)} call(s) for the first swap`,
)

check(
  'and its callback is where the page changes, so the boundary wraps the change',
  boundary?.activeInCallback === boundary?.activeBefore &&
    boundary?.activeAfter === 'bravo',
  `active ${boundary?.activeBefore} → in callback ${boundary?.activeInCallback} → ${boundary?.activeAfter}`,
)

check(
  'with `ready` resolving rather than rejecting, and a group for the card that left',
  boundary?.ready === 'resolved' && boundary?.groupAtReady === true,
  `ready ${boundary?.ready}, group(${boundary?.activeBefore}) ${boundary?.groupAtReady}`,
)

/**
 * The dissolve outlives the projection on purpose, and that overhang is the effect the page is for.
 *
 * The opposite was tried first: matching the two durations is the obvious reading of "the motion should
 * not hold the page up", and it is wrong here. The browser's 250ms projection lands the box at the same
 * instant a 250ms dissolve resolves it, and the shift reads as a cut instead of a glide — the projection
 * stops looking like layout. So this asserts the inequality rather than the equality, in the direction
 * that looks like a bug if you only read the numbers.
 */
check(
  'the dissolve outlives the projection — the overhang is the glide',
  jumi.pseudoDuration > jumi.groupDuration,
  `motion ${jumi.pseudoDuration}ms, projection ${jumi.groupDuration}ms`,
)

/* ------------------------------ the click the overlay swallows, and the handler that answers it */

const foxtrot = await centre('foxtrot')

await page.click('.demo-card[data-id="echo"]')
await page.waitForTimeout(110)

const overlay = await page.evaluate(
  ({ x, y }) => ({
    elementFromPoint:
      document.elementFromPoint(x, y)?.tagName.toLowerCase() ?? '(nothing)',
    elementsFromPoint: document
      .elementsFromPoint(x, y)
      .map(element => element.tagName.toLowerCase())
      .join(' > '),
  }),
  foxtrot,
)

check(
  'while a transition runs the pseudo tree holds the hit outright',
  overlay.elementFromPoint === 'html' &&
    !overlay.elementsFromPoint.includes('button'),
  `elementFromPoint → ${overlay.elementFromPoint}; elementsFromPoint → ${overlay.elementsFromPoint}`,
)

// A raw mouse click, not `page.click`: Playwright's actionability check waits for an element to be able
// to receive a pointer event, so it would sit out the transition instead of measuring it.
const beforeGesture = await page.evaluate(() => window.__transitions.length)

await page.mouse.click(foxtrot.x, foxtrot.y)
await page.waitForTimeout(40)

const midFlight = await page.evaluate(
  () => document.querySelector('.demo-card[data-active]')?.dataset.id,
)

/**
 * Answered where it lands, by a *second* transition that supersedes the first.
 *
 * This was held until the projection settled first, for one reason: the platform aborts the transition in
 * flight and the aborted call's callback still runs, so the survivor could animate a boundary it had not
 * filled in. That is `runViewTransition`'s job now — the page asks for `supersede` and the wrapper passes the
 * caller's mutation inside the boundary it opens — so the gesture applies in the frame it arrives instead of
 * a quarter of a second later. Asserting the change alone would pass on a version that jumped the layout with
 * no transition at all, so the call itself is read out of the record: the *surviving* call's callback is
 * where the change happened, which is the failure the old hand-rolled version shipped.
 */
check(
  'a click inside the projection lands there and then',
  midFlight === 'foxtrot',
  `active became ${midFlight} within 40ms of the gesture`,
)

const promoted = await page.evaluate(() => window.__transitions.at(-1))

check(
  'by superseding the transition in flight, with the change inside the new boundary',
  (await page.evaluate(() => window.__transitions.length)) ===
    beforeGesture + 1 &&
    promoted?.activeInCallback === 'echo' &&
    promoted?.activeAfter === 'foxtrot',
  `${await page.evaluate(() => window.__transitions.length)} call(s) across the gesture; the call that` +
    ` survived saw ${promoted?.activeInCallback} in its callback and ${promoted?.activeAfter} after it`,
)

await page.waitForTimeout(400)

const landed = await page.evaluate(
  () => document.querySelector('.demo-card[data-active]')?.dataset.id,
)

check(
  'and it is still that card once the dissolve is over',
  landed === 'foxtrot',
  `active ${landed}`,
)

await page.waitForTimeout(1200)

/* ------------------------- the same gesture on the dissolve, where no projection is left to gate on */

await page.click('.demo-card[data-id="bravo"]')
await page.waitForTimeout(400)

// `delta`, not `charlie`: the arms below open in native mode by clicking `charlie`, and a card that is
// already active would make that click a no-op and the measurement meaningless.
const delta = await centre('delta')

await page.mouse.click(delta.x, delta.y)
await page.waitForTimeout(30)

const immediate = await page.evaluate(
  () => document.querySelector('.demo-card[data-active]')?.dataset.id,
)

check(
  'and on the dissolve it lands straight away',
  immediate === 'delta',
  `active became ${immediate} within a frame`,
)

const honoured = await ran('delta')

check(
  'by starting a transition of its own',
  honoured.name.startsWith('jumi-'),
  honoured.name || 'none',
)

await page.waitForTimeout(1200)

/* ------------------------------------------------------------------ the browser's own motion */

await page.click('.demo-mode[data-mode="native"]')
await page.waitForTimeout(60)

const nativeName = await name('bravo')
const nativeBefore = await box('charlie')

check(
  'the hand-written names take over, and the cards still participate',
  nativeName === 'plain-bravo',
  nativeName,
)

await page.click('.demo-card[data-id="charlie"]')
const native = await ran('plain-charlie')

const nativeAfter = await box('charlie')

check(
  'the same layout shift still happens',
  nativeAfter.width > nativeBefore.width,
  `charlie ${nativeBefore.width}→${nativeAfter.width} wide`,
)
check(
  "with the browser's own cross-fade instead of Jumi's",
  native.group && !native.name.startsWith('jumi-') && native.name !== '',
  native.name || 'none',
)
check(
  'and the page says that too',
  (await page.textContent('#demo-motion')) === "the browser's own cross-fade",
  (await page.textContent('#demo-motion')) ?? '',
)

/* ------------------------------------------------------------------ reduced motion */

const reduced = await browser.newContext({
  reducedMotion: 'reduce',
  viewport: { height: 900, width: 1200 },
})
const reducedPage = await reduced.newPage()

await reducedPage.goto(`${base}/demo/view-transitions/`)
await reducedPage.waitForLoadState('load')
await reducedPage.click('.demo-card[data-id="echo"]')
await reducedPage.waitForTimeout(160)

const quiet = await reducedPage.evaluate(() =>
  document
    .getAnimations()
    .filter(animation =>
      (animation.effect?.pseudoElement ?? '').startsWith('::view-transition'),
    )
    .map(
      animation =>
        `${animation.effect.pseudoElement} ${animation.animationName}`,
    ),
)

check(
  'under reduced motion the element still participates',
  quiet.some(entry => entry.includes('group(echo)')),
  quiet.filter(entry => entry.includes('(echo)')).join(' | ') ||
    'no echo pseudo animations',
)
check(
  'and no Jumi keyframe runs',
  quiet.every(entry => !entry.includes(' jumi-')),
  quiet.filter(entry => entry.includes(' jumi-')).join(' | ') ||
    'no Jumi keyframes',
)

/* --------------- the control the overlay hides, and the window it must not be gated on --------------- */

// This is a reported bug, reproduced rather than imagined. The page is in native mode by now, and the
// browser's own motion lasts exactly as long as its projection — so *every* click on the switch during a
// native swap lands inside the projection window. Gating the switch on that window, the way the cards must
// be gated, dropped it silently; the next swap then ran the mode the page was already in.
await page.click('.demo-card[data-id="delta"]')
await page.waitForTimeout(110)

const jumiButton = await page.evaluate(() => {
  const { height, width, x, y } = document
    .querySelector('.demo-mode[data-mode="jumi"]')
    .getBoundingClientRect()

  return { x: x + width / 2, y: y + height / 2 }
})

await page.mouse.click(jumiButton.x, jumiButton.y)
await page.waitForTimeout(40)

const switched = await page.evaluate(
  () => document.documentElement.dataset.demoMode,
)

check(
  'a mode switch inside the projection is answered, not dropped',
  switched === 'jumi',
  `data-demo-mode = ${switched} after reaching for the switch 110ms into a native swap`,
)

await page.waitForTimeout(1400)

await page.click('.demo-card[data-id="echo"]')

const afterSwitch = await ran('echo')

check(
  "and the swap after it is Jumi's, not the mode the page just left",
  afterSwitch.name.startsWith('jumi-'),
  afterSwitch.name || 'none',
)

await page.waitForTimeout(1200)

check(
  'the page throws nothing',
  errors.length === 0,
  errors.slice(0, 3).join(' | ') || 'clean console',
)

await browser.close()
server.close()

for (const { detail, label, pass } of checks)
  console.log(`${pass ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`)

const failed = checks.filter(entry => !entry.pass).length

console.log(`\n${checks.length - failed}/${checks.length} assertions passed`)
if (failed) process.exit(1)
