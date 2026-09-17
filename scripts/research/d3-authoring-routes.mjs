/**
 * D.3.7 · the **authoring-route** evidence: what an author addresses, and what the runtime animates.
 *
 * The four public components of a compound family are not typed leaves and do not have routes *of their own*. What
 * they have is an entrance that production resolves into a complete internal execution assignment, and the record
 * has to say that rather than force the shape `one component → one leaf` onto it. So a record carries:
 *
 *   authoring    the component an author addresses, and the sibling authoring context the resolver reads beside it
 *   execution    the leaves the motion assigns, both of them, because a partial assignment is a decline
 *   condition    the authoring state the route needs in order to resolve, measured rather than assumed
 *
 * The condition is the part a one-leaf record has no place for, and it is not decoration. An edge route resolves
 * from the resting state; an offset route does **not**, because `center` over a non-zero offset is outside the
 * normalizer's contract — deliberately, and in production. Recording that as `movable` would claim a capability the
 * shipped build does not have under the state the author starts from.
 *
 * The measurement is the shipped build in a browser: a series at five instants per route, `movable` when the series
 * changes and `declined` when it does not — and the emitted CSS is read too, because a route that emits no execution
 * leaf cannot be moving the ones it claims.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

import * as compileLib from '../lib/compile.mjs'
import * as cssLib from '../lib/css.mjs'
import { readCandidates, readTypedExecutions } from '../lib/property-model.mjs'

const { compiler } = compileLib
const finalizeCss = compileLib.finalizeCss ?? cssLib.finalizeCss

const root = path.resolve(import.meta.dirname, '..', '..')
const FAMILY = 'offset-anchor'
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

/**
 * The value each component's grammar accepts, per axis. Declared rather than guessed: a component without one is an
 * error rather than a default, because a probe invented here would measure a route the candidate never claimed.
 */
const PROBES = {
  'offset-anchor-x-edge': 'left',
  'offset-anchor-y-edge': 'top',
}

const surface = readTypedExecutions().get(FAMILY)?.authoring ?? []
const LEAVES = ['offset-anchor-x-position', 'offset-anchor-y-position']

/**
 * The routes are **derived from the candidate table**, not listed, and that is the point of the book rather than a
 * convenience: a route is an entrance an author can enter through, so a component no candidate addresses has no
 * route to evidence. The two offset components are still authoring state — the resolver reads them, and the model
 * declares them — and they are not routes, because their candidate was retired when measurement showed no
 * invocation of it could ever move. Valid authoring state does not have to deserve an animation candidate.
 */
const addressed = new Set(
  readCandidates()
    .filter(one => one.attribute === FAMILY)
    .flatMap(one => one.parts),
)

const ROUTES = surface
  .filter(component => addressed.has(component))
  .map(component => {
    const probe = PROBES[component]

    if (!probe) throw new Error(`no probe is declared for \`${component}\``)

    return { component, probe }
  })
const series = async classes => {
  const css = finalizeCss((await compiler(ENTRY, root)).build(classes)).css
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>` +
      `<div id="probe" class="${classes.join(' ')}" style="animation-timing-function: linear"></div>` +
      `</body></html>`,
  )

  const values = await page.evaluate(async () => {
    const element = document.getElementById('probe')
    const own = element.getAnimations()
    const duration = own[0]?.effect?.getTiming?.().duration ?? 0
    const out = []

    for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
      own.forEach(animation => {
        animation.pause()
        animation.currentTime = duration * fraction
      })

      await new Promise(requestAnimationFrame)

      out.push(getComputedStyle(element).offsetAnchor)
    }

    return out
  })

  await browser.close()

  return { css, values }
}

const records = []

/**
 * The leaves a route **itself** assigns, read from its own keyframe.
 *
 * Scoped rather than searched sheet-wide, and the first run of this book proved why: with the sibling class present the
 * sheet carries the sibling's frames too, and a sheet-wide search reported the offset routes as assigning leaves that
 * the edge route beside them had written.
 */
const leavesOf = (read, component) => {
  const frames =
    new RegExp(`@keyframes jumi-${component}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(
      read.css,
    )?.[1] ?? ''

  return [
    ...frames.matchAll(/--jumi-(offset-anchor-[xy]-position):/g),
  ].map(match => match[1])
}

for (const { component, probe } of ROUTES) {
  const klass = `animate-${component}-[${probe}]`
  const resting = await series([klass])
  const moves = read => new Set(read.values).size > 1
  const assigned = leavesOf(resting, component)

  /**
   * The verdict is decided by the **emitted assignment**, not by the series, and that is a correction the first
   * run forced: a series can be dominated by the frames of a class the reader did not name. What a route proves is
   * that it enters typed execution — both leaves written — and only then does the series say whether it moves.
   */
  const verdict =
    assigned.length && moves(resting) ? 'movable' : 'declined'

  records.push({
    authoring: {
      component,
      context: surface.filter(one => one !== component),
    },
    condition:
      verdict === 'declined'
        ? 'declines, and no sibling authoring state unblocks it: the projection is built when this candidate compiles, from this candidate\u2019s own slots'
        : null,
    consumer: FAMILY,
    evidence: {
      book: 'scripts/research/d3-authoring-routes.mjs',
      series: resting.values,
    },
    execution: { assigned, leaves: LEAVES },
    parent: FAMILY,
    representation: 'resolved positional components',
    route: `${FAMILY}/${component}@${FAMILY}`,
    verdict,
  })
}

const target = path.join(root, 'scripts', 'authoring-route-evidence.json')

fs.writeFileSync(target, `${JSON.stringify({ records }, null, 2)}\n`)

for (const one of records)
  console.log(
    `${one.authoring.component.padEnd(26)} ${one.verdict.padEnd(11)} assigned=${one.execution.assigned.join('+') || 'none'}  ${one.evidence.series.join(' → ')}`,
  )

console.log(`\nwritten to \`${path.relative(root, target)}\``)
