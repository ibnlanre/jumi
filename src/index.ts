/**
 * Jumi's entry point, which is Tailwind-shaped by definition: the adapter that
 * registers Jumi's definitions with Tailwind's plugin API. The semantics it
 * drives live in `@/core`.
 */
export { default } from './helpers/create'

/**
 * The carrier protocol, for hosts. Tailwind expands a carrier into rules Jumi never
 * wrote — `:is(.animations > *)`, `.animations::before`, the copy `@apply` inlined — and
 * the aggregate those rules read cannot be published at a literal selector, because its
 * entries reference slot variables that exist only on the element. So the carrier marks
 * itself and the data is completed afterwards, on the emitted stylesheet.
 *
 * One engine, three boundaries. `finalize(root)` walks a CSS AST in place, for a host that
 * already has one; `finalizeCss(css)` is the same thing across parse/serialize; and
 * `jumi/postcss` and `jumi/vite` adapters call it at the two host integrations Jumi supports.
 */
export { carrierMarker, finalize, finalizeCss, type Finalized, stagingMarker } from './helpers/carriers'
