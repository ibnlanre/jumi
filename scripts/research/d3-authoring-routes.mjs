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
 * The condition is the part a one-leaf record has no place for, and it is not decoration: **every verdict that is
 * not `movable` carries one**, because the record's whole job is to answer *under what authoring state* this public
 * route enters typed execution.
 *
 * The measurement is the shipped build in a browser — the authoring class compiled by the plugin, applied **alone**,
 * and read at five instants. Alone is not a convenience: the projection contract of D.3.7 builds a candidate's
 * projection from its own slots and the model's resting values, so a sibling authoring class is invisible to it by
 * construction, and an arm that supplied one would be measuring the harness. Four verdicts come out of that series,
 * and the middle two are the pair that must not be confused:
 *
 *   movable               the series changes, so the route's assignment is observable
 *   equivalent-no-op      the route executes and publishes exactly its contracted leaf, and the *native* reference
 *                         is equally flat — the flatness is the property's own behaviour at a mid-anchored axis
 *   fixture-unobservable  the route assigns its leaf and neither the arm nor a reference discriminates it
 *   declined              the route writes none of its contracted leaves
 *
 * The emitted CSS is read too, and structurally: a route that emits no execution-endpoint slot cannot be moving the
 * leaves it claims.
 */
import { chromium } from 'playwright'

import { nativeSheet } from '../lib/frames.mjs'
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
  'object-position-x': '40%',
  'object-position-x-edge': 'right',
  'object-position-x-offset': '10%',
  'object-position-y': '40%',
  'object-position-y-edge': 'bottom',
  'object-position-y-offset': '10%',
  'offset-anchor-x-edge': 'left',
  'offset-anchor-y-edge': 'top',
  'offset-position-x': '40%',
  'offset-position-x-edge': 'right',
  'offset-position-x-offset': '10%',
  'offset-position-y': '40%',
  'offset-position-y-edge': 'bottom',
  'offset-position-y-offset': '10%',
}

/**
 * The **native reference** each edge route is checked against, in **two** arms: the claim, and the control that
 * says the claim is worth anything.
 *
 * The first spelling this book used was `left 50%` → `right 50%`, and it moved: `0% 50%` → `100% 50%`. That is not a
 * finding about the route, it is a finding about the spelling. In a two-value `<position>` the second component binds
 * the **other** axis, so `right 50%` is x at the right edge over a zero offset and y at 50% — the edge plus its
 * offset needs the four-value form, `right 50% top 50%`. Fixture defect 17 is this same confusion, so an arm built
 * to test it must not commit it: `control` keeps the falsified spelling **because** it moves, and an arm whose
 * reference cannot move proves nothing — the void comparison that the camelCase reference produced is the defect
 * this pair of arms exists to make impossible.
 *
 * So `equivalent` spells the position the way the route spells it: the resolved pair it rests at, against the same
 * position as an edge with its offset. Flat there means the two spellings name one position natively, which is what
 * makes a route that publishes such an endpoint native-equivalent rather than inert.
 *
 * Only the four edge routes carry one. An offset route resolves away from the rest state and moves, so there is
 * nothing left for a reference to settle.
 */
const NATIVE = {
  'object-position-x-edge': {
    control: { from: 'left 50%', to: 'right 50%' },
    equivalent: { from: '50% 50%', to: 'right 50% top 50%' },
  },
  'object-position-y-edge': {
    control: { from: '50% top', to: '50% bottom' },
    equivalent: { from: '50% 50%', to: 'left 50% bottom 50%' },
  },
  'offset-position-x-edge': {
    control: { from: 'left 50%', to: 'right 50%' },
    equivalent: { from: '50% 50%', to: 'right 50% top 50%' },
  },
  'offset-position-y-edge': {
    control: { from: '50% top', to: '50% bottom' },
    equivalent: { from: '50% 50%', to: 'left 50% bottom 50%' },
  },
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
        const declared = PROBES[component]

        if (!declared)
          throw new Error(`no probe is declared for \`${component}\``)

        const entry =
          typeof declared === 'string' ? { probe: declared } : declared

        return { component, family, leaves, ...entry }
      })

    return { family, leaves, routes, surface: execution.authoring ?? [] }
  })
const ENTRY = `\n@import "tailwindcss" source(none);\n@plugin "${path.join(root, 'dist', 'index.js')}";\n`

/**
 * The five samples an arm is read at, shared by the shipped arm and the native reference.
 *
 * Shared rather than written twice on purpose: two arms read by two samplers compare samplers, and the instants are
 * part of what an arm measures. The animation is paused and **seeked**, so a sample is a point on the interpolation
 * rather than a moment in wall-clock time.
 */
const samplesOf = (page, id, observable) =>
  page.evaluate(
    async ({ id: elementId, observable: property }) => {
      const element = document.getElementById(elementId)
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
    { id, observable },
  )

/** The shipped arm: the authoring class applied **alone**, compiled by the plugin, read at five instants. */
const series = async (classes, observable) => {
  const css = finalizeCss((await compiler(ENTRY, root)).build(classes)).css
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>` +
      `<div id="probe" class="${classes.join(' ')}" style="animation-timing-function: linear"></div>` +
      `</body></html>`,
  )

  const values = await samplesOf(page, 'probe', observable)

  await browser.close()

  return { css, values }
}

/**
 * The **native reference** for an edge route: the browser animating the same property between the two spellings the
 * route's axis chooses between, with no plugin involved.
 *
 * A flat shipped series is not on its own a finding. "The route executes and its endpoints are equal" is an
 * explanation, and an explanation is what the previous pass produced; this arm is the reading that says which way
 * the flatness points. If the browser is equally flat between the two spellings, a route that resolves them to one
 * position is native-equivalent — and filing it `fixture-unobservable` would put an observation we made under a
 * label that says we could not make it.
 */
const nativeReference = async (family, { control, equivalent }) => {
  const property = observableOf(family)
  const read = async (id, { from, to }) => {
    const arm = nativeSheet({ from, id, property, to })
    const browser = await chromium.launch()
    const page = await browser.newPage()

    await page.setContent(
      `<!doctype html><html><head><style>${arm.css}</style></head><body>` +
        `<div id="${arm.name}"></div>` +
        `</body></html>`,
    )

    const series = await samplesOf(page, arm.name, arm.property)

    await browser.close()

    return {
      from,
      series,
      to,
      turns: new Set(series).size > 1 ? 'moves' : 'flat',
    }
  }

  return {
    control: await read('native-control', control),
    equivalent: await read('native-equivalent', equivalent),
  }
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

/**
 * The **endpoint** a route publishes for one execution leaf, read from the emitted declaration.
 *
 * Read rather than inferred, because it is the one thing a flat series cannot show: the series is flat precisely
 * because the endpoint equals the rest, so the value has to come from the sheet. `calc(100% - 50%)` is the Edge-plus-offset
 * resolution for `right` over the resting offset, and seeing it is what turns "the route is quiet" into "the route
 * resolved to the position it already rests at".
 */
const resolvedOf = (css, leaf) =>
  new RegExp(`--jumi-${leaf}-100:\\s*([^;]+);`)
    .exec(css)?.[1]
    ?.replace(/\s+/g, ' ')
    .trim() ?? null

for (const { family, leaves, routes, surface } of FAMILIES)
  for (const { component, probe } of routes) {
    const klass = `animate-${component}-[${probe}]`
    const resting = await series([klass], observableOf(family))
    const moves = read => new Set(read.values).size > 1
    const assigned = leavesOf(resting, leaves)
    const native = NATIVE[component]
      ? await nativeReference(family, NATIVE[component])
      : null

    /**
     * Four verdicts, and the middle two are this pass's finding. A route that **executes**, publishes the execution
     * leaf its contract requires, and legitimately resolves to the same endpoints as the rest is an
     * `equivalent-no-op`: `left 50%` and `right 50%` are the same position, so a mid-anchored axis cannot be
     * displaced by an edge alone. The native clause is not decoration — the verdict is only available when the
     * **native reference is equally flat**, because a flat journey over a reference that moves is a route the
     * fixture cannot discriminate, and that keeps its own name rather than borrowing one about the property.
     */
    const verdict = !assigned.length
      ? 'declined'
      : moves(resting)
        ? 'movable'
        : native?.equivalent.turns === 'flat' &&
            native.control.turns === 'moves'
          ? 'equivalent-no-op'
          : 'fixture-unobservable'

    records.push({
      authoring: {
        component,
        context: surface.filter(one => one !== component),
      },
      condition:
        verdict === 'declined'
          ? 'declines, and no sibling authoring state unblocks it: the projection is built when this candidate compiles, from this candidate\u2019s own slots'
          : verdict === 'equivalent-no-op'
            ? `executes and publishes ${assigned.join(' and ')}, and the endpoint it publishes is ${assigned.map(leaf => resolvedOf(resting.css, leaf)).join(' and ')} — a value native-equal to the position the route already rests at, so the endpoints are equal at every sample. The reference proves it rather than asserting it: the edge-with-its-offset spelling of that position is flat (${native.equivalent.from} → ${native.equivalent.to}: ${native.equivalent.series.join(' → ')}), while the control that spells the same edges without their offsets moves (${native.control.from} → ${native.control.to}: ${native.control.series.join(' → ')}) — in a two-value position the second component binds the other axis, so the control is what makes the flat reading admissible. Executed, contracted leaf published, native-equivalent: not a decline, and not an unobservable fixture, because the fixture answered the question.`
            : verdict === 'fixture-unobservable'
              ? 'assigns its execution leaf and neither the arm nor a native reference discriminates it, which is a reading of the fixture rather than of the route'
              : null,
      consumer: family,
      evidence: {
        book: 'scripts/research/d3-authoring-routes.mjs',
        ...(native ? { native } : {}),
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
