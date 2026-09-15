/**
 * Can a "same interaction" marker tell an echo from a new gesture?
 *
 * The wrapper's default is about to stop being one behaviour for every in-flight call. The evidence for
 * that came from two directions: coalescing an in-flight call does not necessarily cost the reader the
 * animation (measured — the changed element travelled either way), while the dangerous shape is narrower
 * than the docs implied — two calls in the *same task*, where the aborted call's callback does the mutating
 * and the survivor animates a boundary it did not fill in. A second call in one task cannot be a second
 * human gesture, so that shape is detectable in principle, which is what this spike is for.
 *
 * Three markers, each trying to answer "is the task I am in the same one the previous call was made in":
 *
 *   microtask  clear at the end of the current microtask checkpoint    (`queueMicrotask`)
 *   timeout    clear in a later macrotask                              (`setTimeout(…, 0)`)
 *   message    clear in a later macrotask                              (`MessageChannel` post)
 *
 * and six shapes, which are what the answer has to be right about:
 *
 *   oneTask          read, mark, read — what a duplicate writer *in the same task* sees
 *   microtaskAfter   mark, then a call from `queueMicrotask`             — an echo, and the tricky one
 *   timerAfter       mark, then a call from `setTimeout(…, 0)`           — a later task, so a new intent
 *   timerBefore      a caller's `setTimeout(…, 0)` queued *before* the mark — the ordering boundary
 *   clickPair        two real clicks, the second while a transition is running
 *   keyRepeat        a real key, then a real auto-repeat, via CDP
 *   doubleClick      `dblclick`: two clicks that the platform may deliver as one dispatch sequence
 *
 * Run: `pnpm spike:vt-concurrency`
 */
import { createServer } from 'node:http'
import { chromium } from 'playwright'

const html = `<!doctype html>
<html><head><style>#target { height: 120px; width: 240px; }</style></head><body>
  <button id="target">target</button>
  <script>
    /** A marker per strategy, sharing one shape: set on a call, cleared when the interaction is over. */
    const marker = {
      microtask: (() => {
        let same = false

        return { get: () => same, mark() { same = true; queueMicrotask(() => { same = false }) } }
      })(),
      timeout: (() => {
        let same = false

        return { get: () => same, mark() { same = true; setTimeout(() => { same = false }, 0) } }
      })(),
      message: (() => {
        const channel = new MessageChannel()
        let pending = false
        let same = false

        channel.port1.onmessage = () => { pending = false; same = false }

        return {
          get: () => same,
          mark() { same = true; if (!pending) { pending = true; channel.port2.postMessage(0) } },
        }
      })(),
    }

    window.__names = Object.keys(marker)
    window.__input = {}

    /** Read the marker at the start of a real input task, then mark it — so the next event reports delay. */
    const onInput = (kind) => () => {
      window.__input[kind] = Object.fromEntries(Object.entries(marker).map(([name, m]) => [name, m.get()]))

      for (const m of Object.values(marker)) m.mark()
    }

    addEventListener('click', onInput('click'))
    addEventListener('dblclick', onInput('dblclick'))
    addEventListener('keydown', onInput('keydown'))

    window.__spike = {
      input: () => window.__input,
      oneTask(name) {
        const m = marker[name]
        const before = m.get()

        m.mark()

        return { before, secondWriter: m.get() }
      },
      microtaskAfter(name) {
        const m = marker[name]

        m.mark()

        return new Promise(resolve => queueMicrotask(() => resolve(m.get())))
      },
      timerAfter(name) {
        const m = marker[name]

        m.mark()

        return new Promise(resolve => setTimeout(() => resolve(m.get()), 0))
      },
      timerBefore(name) {
        const m = marker[name]

        // The caller's later work queued *first*, which is the ordering this marker cannot win.
        return new Promise(resolve => {
          setTimeout(() => resolve({ queuedBeforeTheCall: m.get() }), 0)
          m.mark()
        })
      },
      reset() { window.__input = {} },
    }
  </script>
</body></html>`

const server = createServer((_, response) => {
  response.writeHead(200, { 'content-type': 'text/html' }).end(html)
})

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { height: 500, width: 700 },
})
const page = await context.newPage()

await page.goto(`http://127.0.0.1:${server.address().port}/`)

const names = await page.evaluate(() => window.__names)
const rows = []

for (const name of names) {
  rows.push([
    'oneTask',
    name,
    await page.evaluate(n => window.__spike.oneTask(n), name),
  ])
  rows.push([
    'microtaskAfter',
    name,
    await page.evaluate(n => window.__spike.microtaskAfter(n), name),
  ])
  rows.push([
    'timerAfter',
    name,
    await page.evaluate(n => window.__spike.timerAfter(n), name),
  ])
  rows.push([
    'timerBefore',
    name,
    await page.evaluate(n => window.__spike.timerBefore(n), name),
  ])

  await page.evaluate(() => window.__spike.reset())
  await page.waitForTimeout(20)
  await page.click('#target')
  await page.click('#target')
  rows.push([
    'clickPair',
    name,
    (await page.evaluate(() => window.__spike.input())).click?.[name] ??
      '(no reading)',
  ])

  await page.evaluate(() => window.__spike.reset())
  await page.waitForTimeout(20)
  await page.click('#target', { clickCount: 2, delay: 10 })
  rows.push([
    'doubleClick',
    name,
    (await page.evaluate(() => window.__spike.input())).click?.[name] ??
      '(no reading)',
  ])

  await page.evaluate(() => window.__spike.reset())
  await page.waitForTimeout(20)

  const session = await context.newCDPSession(page)

  await session.send('Input.dispatchKeyEvent', {
    code: 'KeyA',
    key: 'a',
    type: 'keyDown',
    windowsVirtualKeyCode: 65,
  })
  await session.send('Input.dispatchKeyEvent', {
    autoRepeat: true,
    code: 'KeyA',
    key: 'a',
    type: 'keyDown',
    windowsVirtualKeyCode: 65,
  })
  await session.send('Input.dispatchKeyEvent', {
    autoRepeat: true,
    code: 'KeyA',
    key: 'a',
    type: 'keyDown',
    windowsVirtualKeyCode: 65,
  })

  rows.push([
    'keyRepeat',
    name,
    (await page.evaluate(() => window.__spike.input())).keydown?.[name] ??
      '(no reading)',
  ])

  await session.detach()
}

const width = Math.max(...rows.map(([shape]) => shape.length))

console.log(
  '\n  false = "a later interaction" (supersede)   true = "the same one" (coalesce)\n',
)

for (const [shape, name, value] of rows) {
  const reading =
    typeof value === 'object' && value !== null
      ? Object.entries(value)
          .map(([key, entry]) => `${key}=${entry}`)
          .join(' ')
      : String(value)

  console.log(`  ${shape.padEnd(width)}  ${name.padEnd(9)}  ${reading}`)
}

await browser.close()
server.close()
