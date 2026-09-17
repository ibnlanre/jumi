import { describe, population } from './observation.mjs'
import { bucketOf } from './property-model.mjs'

/**
 * The cross-tab between **descriptor status** and the census's **morphology**.
 *
 * Pass one and pass two answered two questions in sequence: what the model can describe, and which of those
 * descriptions already carry a behavioural verdict. Both come back as single numbers, and a single number
 * cannot answer the question that follows — *what representation metadata is missing* — because the
 * unresolved-descriptor population is not one kind of problem. It contains three morphologies the census
 * already separates, and each points at different work:
 *
 *   `value`     the leaf rests on a value, so a typed syntax is plausibly derivable from information the model
 *               already carries — the work may be a rule rather than a family
 *   `keyword`   the leaf rests on an identifier, so the observation protocol (D.3.4) is the path, and the
 *               question is what surface and which contexts
 *   `reshape`   the leaf is a function argument or a nested composition, so no declaration alone helps: the
 *               interpolation unit itself is what D.1's decomposition work has to reach
 *
 * The tab is `status × morphology` over the constituent population, and it is **diagnostic**: nothing here
 * declares a representation, measures a browser, or reads a verdict. It only says where the pairs are.
 */
export const MORPHOLOGIES = ['value', 'keyword', 'reshape']

/** The descriptor outcomes, as the cells' row keys. */
export const STATUSES = ['complete', 'no-representation', 'no-candidate']

/** Which row a described pair belongs to, from the reason pass one recorded. */
export const statusOf = descriptor => {
  if (descriptor.status === 'complete') return 'complete'
  if (descriptor.reason === 'no candidate addresses the pair')
    return 'no-candidate'

  return 'no-representation'
}

/**
 * The table, as counts plus the pairs behind each cell.
 *
 * Pairs rather than only counts, because the follow-up question is always "which ones" — a migration queue is
 * picked from a list, and a count is a summary of a list that has to be derived again to be used.
 */
export const crossTab = () => {
  const constituent = population().filter(
    pair => bucketOf(pair.parent, pair.component) !== 'machinery',
  )

  const described = constituent.map(pair => ({
    descriptor: describe(pair),
    morphology: bucketOf(pair.parent, pair.component),
    pair,
    status: statusOf(describe(pair)),
  }))

  const cells = new Map()

  for (const one of described) {
    const key = `${one.status} · ${one.morphology}`

    cells.set(key, [...(cells.get(key) ?? []), one])
  }

  const at = (status, morphology) =>
    cells.get(`${status} · ${morphology}`) ?? []
  const row = status => MORPHOLOGIES.map(morphology => at(status, morphology))
  const column = morphology => STATUSES.map(status => at(status, morphology))

  return {
    at,
    column,
    constituents: constituent.length,
    described,
    row,
    rowTotal: status =>
      row(status).reduce((total, cell) => total + cell.length, 0),
    columnTotal: morphology =>
      column(morphology).reduce((total, cell) => total + cell.length, 0),
  }
}
