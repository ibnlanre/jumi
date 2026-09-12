# Upstream limitation: a plugin utility whose output depends on the candidate set

*PARKED — research evidence, not a workstream. Not filed.*

Keeping this here rather than filing it, because the limitation stopped blocking
us: the base-layer bridge made the plain plugin path incrementally correct, and
the harness is green. We go upstream only when Tailwind creates a problem we
cannot reasonably solve on our side without damaging Jumi's API, correctness, or
performance. Until then Tailwind is one host among the ones we could have — see
`migration.md` for the active direction.

It is worth keeping because the measurements below are what established that the
problem was Jumi's to solve, and because a future requirement that genuinely needs
host-level integration would start from exactly this evidence.

## Summary

A plugin utility whose output depends on which *other* candidates have been
compiled cannot stay correct across incremental builds. Tailwind caches one AST
per candidate, so when `build(candidates)` is called again with more candidates,
that utility's rule is reused even though its content should have changed. There
is no supported way for a plugin to invalidate or recompute a candidate, and
plugin output is materialised eagerly, so nothing can be computed after all
candidates are known.

This is a limitation rather than a bug report against documented behaviour: as far
as I can tell, `matchUtilities` was never specified to be aware of other
candidates, and for the vast majority of plugins it doesn't need to be. It only
bites when a utility has to enumerate the set — in our case a single rule that
must list every animation in the stylesheet.

## Reproduction

```js
import { compile } from '@tailwindcss/node'

const compiler = await compile(css, { base, onDependency() {} })

// 1. the scanner sorts candidates, so the aggregate utility is compiled last
compiler.build(['animate-rotate-[0:0deg,20:-8deg,100:-8deg]', 'animations'])

// 2. a second tween appears: the candidate set only ever grows in a dev session
const out = compiler.build([
  'animate-rotate-[0:0deg,20:-8deg,100:-8deg]',
  'animate-rotate-[0:30deg,50:-30deg,100:30deg]/[return]',
  'animations',
])
```

The plugin's `animations` utility lists one entry per slot it has seen:

```js
matchUtilities({
  animations: () => ({
    'animation-name': slots.map(slot => `var(${slot.nameVar}, var(--jumi-animation-name))`).join(', '),
  }),
}, { values: { default: 'x' } })
```

The second `build()` reuses the cached `animations` rule, so the newly registered
slot never reaches the list, and the element's animation does not run. A compiler
restart produces the correct output, and so does a single-pass build.

This is reproducible outside Tailwind's own test suite with the harness in
`scripts/incremental-build.mjs` of the plugin in question:
`pnpm incremental:check` asserts the list grows, and it does not.

## What we measured, in case it narrows things

- **Candidate order decides the output in a single pass.** Passing
  `['animations', tween]` yields an empty list; `[tween, 'animations']` yields the
  correct one. In practice the scanner sorts candidates, and every
  `animate-…`/`animation-…` sorts before `animations` (`-` < `s`), so a fresh pass
  is correct by the alphabet.
- **Incremental passes reuse a cached AST.** Calling `build()` again with one more
  tween does not grow the list.
- **The Vite plugin is this path**: it holds one compiler and calls
  `build([...this.candidates])` per update, and its candidate set is created once
  per session and never cleared — so candidates added later are appended *after*
  the aggregate, and a restart is the only reliable fix.
- **Eager materialisation**: a getter on `addBase` and on a utility value returned
  its first value across three consecutive builds, so deferring computation is not
  available to plugins.
- **At-rules are unconditional, class rules are not**: `addBase` and
  `@keyframes`-shaped `addUtilities` calls made *during* a new candidate's
  compilation do appear in that build's output; a class-selector utility only
  appears when its candidate exists, and re-registering a rule for an
  already-generated candidate is ignored on later builds.

## What we did instead, and what it costs

Because `addBase` output is unconditional, the plugin now publishes the mutable
part of the utility as *data* — custom properties in a base-layer rule of the same
selector — and keeps the cached utility rule constant:

```css
@layer base { .animations { --jumi-aggregate-animation-name: …; } }
@layer utilities { .animations { animation-name: var(--jumi-aggregate-animation-name, …); } }
```

That is correct across incremental builds, and it made the ordinary case
*cheaper*, because one constant rule replaces a full list per candidate form (a
docs page of ours went from 433 KB to 261 KB). Its cost is the sharper argument
for recomputing after compilation rather than just bypassing the cache:

- publication is **O(n)** when the utility compiles after the slots exist — the
  ordinary path, one publication per pass;
- it is **O(n²)** when a variant form of the utility compiles early, because
  `*:animations` sorts before `animate-…`, so each later slot re-emits the whole
  list. That form is legitimate rather than exotic — it is how a surface opts its
  descendants in — and one fixture of ours hit 17 publications for 15 slots,
  50 KB → 133 KB.

A pass that ran after the candidates were compiled would publish once, at the
right position, and need neither behaviour.

## The smallest capability that would fix it

A pass that runs **after** the candidates for a build have been compiled, on
**every** build, which may register rules — and where a re-registration for an
existing selector wins.

Note that bypassing the cache alone is not sufficient: recomputing at the
candidate's own position still happens before candidates appended later in the
session, so the recomputed output would still be incomplete. The position of the
recomputation is the point.

## What we are not asking for

Not a lifecycle API, not AST mutation services, not `finalize`/`rulesByUtility`/
`appendDeclarations`/`replaceDeclarations`. We looked at those shapes and they are
a framework extension, not a fix for this. If a narrow primitive is acceptable, we
will take it; if the answer is that this pattern is unsupported, that is a useful
answer too, and we have already moved the artefacts we can out of the cache.
