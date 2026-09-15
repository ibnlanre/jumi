#!/usr/bin/env node
/**
 * Named timelines, from both sides — and the Tailwind grammar they would have to travel through.
 *
 * Jumi owns the **consumer** side of scroll-driven animation: `animation-timeline`, `animation-range`, the
 * inset controls. The platform's other half is the **declaration** side, written on a scroller rather than on
 * the animated element, and it decides *where a timeline exists and who can reference it*. That is a
 * different conceptual layer, so it is measured here rather than assumed:
 *
 *   1. what does Tailwind v4 hand a plugin's `matchUtilities` for the `(...)` custom-property shorthand —
 *      `var(--feed)`, `--feed`, or nothing at all — and does a declared `type` still validate it?
 *   2. where does a named scroll timeline become visible, what exactly does `timeline-scope` widen, can
 *      siblings share one, which declaration wins when names collide, and does the name behave like a custom
 *      property at all?
 *
 * No syntax proposal: the point is to know the model before choosing vocabulary for it.
 *
 * Fixture prose lives above the template, never inside it — a backtick in a browser fixture ends the
 * template, and this repository has paid for that mistake ten times.
 *
 * Run: pnpm spike:named-timelines
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const probePlugin = path.join(here, 'named-timelines', 'probe-plugin.mjs')

execFileSync('pnpm', ['run', 'bundle'], { cwd: root, stdio: 'pipe' })

const line = (label, value) => console.log(`  ${label.padEnd(46)} ${value}`)

// ── 1 · what the (...) shorthand hands a plugin matcher ───────────────────────────────────────────────
const { build, compiler, root: project } = await import('./lib/compile.mjs')
const { seen } = await import(probePlugin)

const jumiEntry = `
@import "tailwindcss";
@plugin "${path.join(project, 'dist', 'index.js')}";
@plugin "${probePlugin}";
`
const probes = [
  'probe-(--feed)',
  'probe-[var(--feed)]',
  'probe-(length:--feed)',
  'probe-(color:--feed)',
  'probe-[12px]',
  'probelen-(--feed)',
  'probelen-[12px]',
  'probelen-(color:--feed)',
]

console.log(
  '\n1 · the parenthesised custom-property shorthand, through matchUtilities',
)
console.log('─'.repeat(100))

const emitted = build(await compiler(jumiEntry, project), probes).css

for (const candidate of probes) {
  const before = seen.length

  // One build per candidate, so a call can be attributed to the candidate that caused it.
  build(await compiler(jumiEntry, project), [candidate])

  const calls = seen.slice(before)
  const declared = new RegExp(
    `\\.${candidate.replace(/[[\]()]/g, character => `\\\\${character}`)}[^{]*\\{([^}]*)\\}`,
  ).exec(emitted)

  line(
    candidate,
    calls.length
      ? `matcher called with ${calls.map(call => `${call.kind}:"${call.value}"`).join(', ')}`
      : declared
        ? 'no matcher call — resolved without the plugin'
        : 'no matcher call and no rule',
  )
}

// ── 2 · the platform's declaration and scope model ────────────────────────────────────────────────────
const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { margin: 0; font: 12px/1.4 system-ui; }
  .sc { height: 80px; overflow-y: scroll; border: 1px solid #999; width: 200px; }
  .sc > div { height: 400px; }
  .target { width: 40px; height: 12px; background: #333; }

  /* a) a scroller and a descendant that references its timeline by name */
  #scroller { scroll-timeline-name: --feed; scroll-timeline-axis: block; }
  #inside { animation: fade 1s linear both; animation-timeline: --feed; }
  /* b) a sibling of the scroller, with no scope anywhere */
  #outside { animation: fade 1s linear both; animation-timeline: --feed; }
  /* c) the same, once a common ancestor declares the scope */
  #scoped { timeline-scope: --feed; }
  #sibling-one, #sibling-two { animation: fade 1s linear both; animation-timeline: --feed; }
  /* d) anonymous scroll() with no scrollable ancestor, against the named form */
  #anonymous { animation: fade 1s linear both; animation-timeline: scroll(); }
  #named { animation: fade 1s linear both; animation-timeline: --feed; }
  /* e) one source declaring two names */
  #two { scroll-timeline-name: --one, --two; scroll-timeline-axis: block; }
  #from-one { animation: fade 1s linear both; animation-timeline: --one; }
  #from-two { animation: fade 1s linear both; animation-timeline: --two; }
  /* f1) two sources declaring one name, both on the target's ancestor chain: which one wins? */
  #nested-outer { scroll-timeline-name: --dup; scroll-timeline-axis: block; }
  #nested-inner { scroll-timeline-name: --dup; scroll-timeline-axis: block; }
  #shadowed { animation: fade 1s linear both; animation-timeline: --dup; }
  /* f2) the same two names, in scope through a common ancestor rather than an ancestor chain */
  #duplicates { timeline-scope: --dup; }
  #near, #far { scroll-timeline-name: --dup; scroll-timeline-axis: block; }
  /* g) a view timeline: the subject has to be inside a scroll container to have a range at all */
  #view-scroller { height: 120px; overflow-y: scroll; border: 1px solid #999; width: 200px; }
  #view-scroller > div { height: 600px; }
  #subject { height: 200px; view-timeline-name: --view; view-timeline-axis: block; }
  #subject-descendant { animation: fade 1s linear both; animation-timeline: --view; }
  #subject-parent { animation: fade 1s linear both; animation-timeline: --view; }

  @keyframes fade { from { opacity: 0.2 } to { opacity: 1 } }
</style></head>
<body>
<div id="host">
  <div id="scroller" class="sc"><div id="scroller-child">content</div><div id="inside" class="target"></div></div>
  <div id="outside" class="target"></div>
</div>
<div id="scoped">
  <div id="scroller-two" class="sc"><div>content</div></div>
  <div id="sibling-one" class="target"></div>
  <div id="sibling-two" class="target"></div>
</div>
<div id="anon-host">
  <div id="scrollable" class="sc"><div>content</div></div>
</div>
<div id="anonymous" class="target"></div>
<div id="named" class="target"></div>
<div id="two" class="sc"><div id="from-one" class="target"></div><div id="from-two" class="target"></div></div>
<div id="nested-outer" class="sc"><div id="nested-inner" class="sc"><div id="shadowed" class="target"></div></div></div>
<div id="duplicates">
  <div id="near" class="sc"><div>near</div></div>
  <div id="far" class="sc"><div>far</div></div>
</div>
<div id="subject-host">
  <div id="view-scroller"><div id="subject"><div id="subject-descendant" class="target"></div></div><div>tail</div></div>
</div>
<div id="subject-parent" class="target"></div>
<script>
  /** The timeline kind an element's animation actually runs on, and its progress after a scroll. */
  window.__read = (id) => {
    const node = document.getElementById(id)
    const animations = [...document.getAnimations()].filter(animation => animation.effect?.target === node)

    if (!animations.length) return { timeline: 'no Animation object' }

    const timing = animations[0].effect.getComputedTiming()

    return {
      computedTimeline: getComputedStyle(node).animationTimeline,
      computedName: getComputedStyle(node).animationName,
      count: animations.length,
      progress: String(timing.progress),
      timelineKind: typeof animations[0].timeline,
      timeline: animations[0].timeline ? animations[0].timeline.constructor.name : 'null timeline',
    }
  }

  /** Scroll a scroller and read a target, so the reading says which source is actually driving it. */
  window.__scroll = (scrollerId, fraction, targetId) => {
    const scroller = document.getElementById(scrollerId)
    const range = scroller.scrollHeight - scroller.clientHeight

    scroller.scrollTop = Math.round(range * fraction)

    return { scrolled: scroller.scrollTop, ...window.__read(targetId) }
  }

  window.__inheritedName = (id) => getComputedStyle(document.getElementById(id)).scrollTimelineName
  window.__ready = true
</script>
</body></html>`

const server = (await import('node:http'))
  .createServer((request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(html)
  })
  .listen(0)

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(`http://127.0.0.1:${server.address().port}`)
await page.waitForFunction(() => window.__ready === true)

const show = ({ computedTimeline, count, progress, timeline, timelineKind }) =>
  `${timeline} (${timelineKind}, ${count}) · computed ${computedTimeline} · progress ${progress}`

console.log('\n2 · where a named timeline exists, and who can reference it')
console.log('─'.repeat(100))

// The guard: a scope that is not implemented and a scope that does not work look identical in the rows
// below, so the implementation is asked directly.
const support = await page.evaluate(() => ({
  scopeComputed: getComputedStyle(document.getElementById('scoped'))
    .timelineScope,
  scrollTimelineName: CSS.supports('scroll-timeline-name', '--feed'),
  timelineScope: CSS.supports('timeline-scope', '--feed'),
  viewTimelineInset: CSS.supports('view-timeline-inset', '20%'),
  viewTimelineName: CSS.supports('view-timeline-name', '--view'),
}))

for (const [name, value] of Object.entries(support)) {
  line(`supported: ${name}`, String(value))
}

line(
  'a · a descendant of the scroller',
  show(await page.evaluate(() => window.__scroll('scroller', 0.5, 'inside'))),
)
line(
  'b · a sibling, with no scope anywhere',
  show(await page.evaluate(() => window.__read('outside'))),
)
line(
  'c · two siblings, common ancestor scopes',
  show(
    await page.evaluate(() =>
      window.__scroll('scroller-two', 0.5, 'sibling-one'),
    ),
  ),
)
line(
  '   …the second sibling, same scope',
  show(await page.evaluate(() => window.__read('sibling-two'))),
)
line(
  'd · scroll(), no scrollable ancestor',
  show(
    await page.evaluate(() => window.__scroll('scrollable', 0.5, 'anonymous')),
  ),
)
line(
  '   …a sibling of a named scroller, no scope',
  show(await page.evaluate(() => window.__read('named'))),
)
line(
  'e · two names on one source',
  `${show(await page.evaluate(() => window.__scroll('two', 0.5, 'from-one')))} | ${show(await page.evaluate(() => window.__read('from-two')))}`,
)
line(
  'f1 · inner scroller, both named --dup',
  `inner: ${show(await page.evaluate(() => window.__scroll('nested-inner', 0.9, 'shadowed')))}`,
)
line(
  '   …then the outer one, same name',
  `outer: ${show(await page.evaluate(() => window.__scroll('nested-outer', 0.9, 'shadowed')))}`,
)
line(
  'f2 · two scrollers, one name, scoped',
  `near: ${show(await page.evaluate(() => window.__scroll('near', 0.9, 'shadowed')))}`,
)
line(
  'g · the view timeline, from a descendant',
  show(await page.evaluate(() => window.__read('subject-descendant'))),
)
line(
  '   …and from outside the subject',
  show(await page.evaluate(() => window.__read('subject-parent'))),
)
line(
  'h · does scroll-timeline-name inherit?',
  await page.evaluate(() =>
    ['scroller', 'scroller-child', 'outside']
      .map(id => `${id}: ${window.__inheritedName(id)}`)
      .join(' · '),
  ),
)

await browser.close()
server.close()

console.log('')
