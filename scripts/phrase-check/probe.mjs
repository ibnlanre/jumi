/**
 * A synthetic matcher set for the phrase contract, kept permanently because the architecture depends on
 * a behaviour of the host that nothing in Jumi's own table can prove on its own: **two handlers may share
 * one utility prefix, and Tailwind consults them per value, in either registration order.**
 *
 * Each handler brands what it emits, so a compiled rule says which of them accepted the value — which is
 * the only way to tell "the phrase route works" from "something else happened to emit". Nothing here
 * imports Jumi, so a result cannot be a Jumi behaviour in disguise.
 */
import plugin from 'tailwindcss/plugin'

/** Jumi's phrase shape, reduced to what the contract needs: `offset:value` pairs on `|`. */
export const phraseOf = value => /^\d+:[^|]+(\|\d+:[^|]+)*$/.test(value)

const brand = owner => value => ({
  '--probe-owner': owner,
  '--probe-value': value,
})

const phraseRoute = (owner, inner) => (value, extra) =>
  phraseOf(value) ? inner(value, extra) : {}

export default plugin(api => {
  // a · the status quo: one typed handler, so a phrase never arrives.
  api.matchUtilities(
    { 'probe-a': brand('typed') },
    { type: 'length', values: {} },
  )

  // b · typed first, phrase-capable second — and the same pair again in the other order, because the
  // claim is that registration order does not matter.
  api.matchUtilities(
    { 'probe-b': brand('typed') },
    { type: 'length', values: {} },
  )
  api.matchUtilities(
    { 'probe-b': phraseRoute('phrase', brand('phrase')) },
    { type: 'any', values: {} },
  )
  api.matchUtilities(
    { 'probe-b2': phraseRoute('phrase', brand('phrase')) },
    { type: 'any', values: {} },
  )
  api.matchUtilities(
    { 'probe-b2': brand('typed') },
    { type: 'length', values: {} },
  )

  // c · untyped only: the shape that would make `[abc]` valid, which is why it is not the one in use.
  api.matchUtilities({ 'probe-c': brand('any') }, { type: 'any', values: {} })

  // d · a typed handler **with a named value**, beside a phrase handler that declares none. The pair is
  // what keeps a theme value on the typed route, and it is what Jumi registers.
  api.matchUtilities(
    { 'probe-d': brand('typed') },
    { type: 'length', values: { 100: '100px' } },
  )
  api.matchUtilities(
    { 'probe-d': phraseRoute('phrase', brand('phrase')) },
    { type: 'any', values: {} },
  )
})
