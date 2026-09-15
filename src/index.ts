/**
 * Jumi's entry point, which is Tailwind-shaped by definition: the adapter that
 * registers Jumi's definitions with Tailwind's plugin API. The semantics it
 * drives live in `@/core`.
 */
export { default } from './helpers/create'

/**
 * The carrier protocol, for hosts. Tailwind emits `animate-*` utilities as it discovers them, so
 * no utility can hold the composition — it is a list of every slot in the stylesheet, and each
 * entry resolves only on the element. So the model stages the data in a rule that is never output,
 * and this pass reads it, derives the selectors that animate, and writes the composition where a
 * browser will apply it.
 *
 * One engine, three boundaries. `finalize(root)` walks a CSS AST in place, for a host that
 * already has one; `finalizeCss(css)` is the same thing across parse/serialize; and
 * `@ibnlanre/jumi/postcss` and `@ibnlanre/jumi/vite` adapters call it at the two host integrations
 * Jumi supports.
 */
export {
  finalize,
  finalizeCss,
  type Finalized,
  stagingMarker,
} from './helpers/carriers'
