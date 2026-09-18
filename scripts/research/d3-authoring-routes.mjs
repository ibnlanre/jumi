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

import {
  readCandidates,
  readTypedExecutions,
  readTypedLeaves,
} from '../lib/property-model.mjs'

import fs from 'node:fs'
import path from 'node:path'

import * as compileLib from '../lib/compile.mjs'
import * as cssLib from '../lib/css.mjs'

const { compiler } = compileLib
const finalizeCss = compileLib.finalizeCss ?? cssLib.finalizeCss

const root = path.resolve(import.meta.dirname, '..', '..')
/** The property a family is observed through, derived from its own name — the one conversion this book makes. */
const observableOf = family =>
  family.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

/**
 * The value each addressed component is animated to, and the only authored input in this book.
 *
 * Small and explicit on purpose: a probe is a value the component's grammar accepts, and never a statement about
 * what the route means — the resolver is the authority on that. An edge is probed with the **opposite** edge, an
 * offset with a component away from its rest, and a compound axis with a concrete position, so every probe is both
 * a value the candidate accepts and a value the resting state does not already hold.
 *
 * A component with no probe is an error rather than a default, because a probe invented here would measure a route
 * the candidate never claimed.
 */
const PROBES = {
  'background-position-x': '40%',
  'background-position-x-edge': 'right',
  'background-position-x-offset': '10%',
  'background-position-y': '40%',
  'background-position-y-edge': 'bottom',
  'background-position-y-offset': '10%',
  'offset-anchor-x-edge': 'left',
  'offset-anchor-y-edge': 'top',
}

/**
 * The **compound families** and the routes each owes evidence for, both derived from the model.
 *
 * A family is compound when it declares an authoring surface, because execution is resolved *out of* that state — a
 * family with a resolver has one and a family without has none. A route exists when a **candidate addresses** the
 * component, which is an entrance an author can enter through; a component no candidate addresses has no route to
 * evidence while remaining perfectly valid authoring state, which is the distinction that retired `offset-anchor`'s
 * offset candidates without retiring its offset components.
 *
 * The execution leaves come from the family's own declaration, so nothing here is keyed on a family's name and a
 * family added tomorrow owes its evidence without this book being edited. The workbook started as `offset-anchor`'s
 * and that is the correction: a harness narrower than the model it verifies cannot be trusted to say the model is
 * wrong.
 */
const FAMILIES = [...readTypedExecutions()]
  .filter(([, execution]) => (execution.authoring ?? []).length > 0)
  .map(([family, execution]) => {
    const leaves = [...readTypedLeaves()]
      .filter(([, one]) => one.execution && one.family === family)
      .map(([leaf]) => leaf)
      .sort()
    const addressed = new Set(
      readCandidates()
        .filter(one => one.attribute === family)
        .flatMap(one => one.parts),
    )
    const routes = (execution.authoring ?? [])
      .filter(component => addressed.has(component))
      .map(component => {
        const probe = PROBES[component]

        if (!probe) throw new Error(`no probe is declared for \`${component}\``)

        return { component, family, leaves, probe }
      })

    return { family, leaves, routes, surface: execution.authoring ?? [] }
  })
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

const series = async (classes, observable) => {
  const css = finalizeCss((await compiler(ENTRY, root)).build(classes)).css
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>` +
      `<div id="probe" class="${classes.join(' ')}" style="animation-timing-function: linear"></div>` +
      `</body></html>`,
  )

  const values = await page.evaluate(
    async ({ observable: property }) => {
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

        out.push(getComputedStyle(element)[property])
      }

      return out
    },
    { observable },
  )

  await browser.close()

  return { css, values }
}

const records = []

/**
 * The execution leaves a route's **own emitted definition** publishes an endpoint for.
 *
 * Structural rather than textual, and the distinction is a correction this book paid for: the compound branch
 * publishes exactly one endpoint slot per leaf it assigns (`--jumi-<leaf>-100`), so the set of published slots *is*
 * the assignment — read from declarations the compiler emitted rather than recovered from the shape of a keyframes
 * block by a wider regex. The earlier version searched the frames text and, with a sibling class in the sheet,
 * credited the offset routes with leaves the edge route beside them had written. This one asks the sheet that
 * carries one class, which is the fixture's own guarantee.
 */
const leavesOf = (read, leaves) =>
  leaves.filter(leaf => read.css.includes(`--jumi-${leaf}-100`))

for (const { family, leaves, routes, surface } of FAMILIES)
  for (const { component, probe } of routes) {
    const klass = `animate-${component}-[${probe}]`
    const resting = await series([klass], observableOf(family))
    const moves = read => new Set(read.values).size > 1
    const assigned = leavesOf(resting, leaves)

    /**
     * The verdict is decided by the **emitted assignment**, not by the series, and that is a correction the first
     * run forced: a series can be dominated by the frames of a class the reader did not name. What a route proves is
     * that it enters typed execution — it publishes an endpoint for an execution leaf — and only then does the
     * series say whether it moves.
     */
    const verdict = assigned.length && moves(resting) ? 'movable' : 'declined'

    records.push({
      authoring: {
        component,
        context: surface.filter(one => one !== component),
      },
      condition:
        verdict === 'declined'
          ? 'declines, and no sibling authoring state unblocks it: the projection is built when this candidate compiles, from this candidate\u2019s own slots'
          : null,
      consumer: family,
      evidence: {
        book: 'scripts/research/d3-authoring-routes.mjs',
        probe,
        series: resting.values,
      },
      execution: { assigned, leaves },
      family,
      parent: family,
      representation: 'resolved positional components',
      route: `${family}/${component}@${family}`,
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
