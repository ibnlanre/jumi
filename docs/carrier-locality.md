# Where Tailwind puts a utility, and why the bridge cannot follow

**Status:** open — the finding below decides whether the aggregate bridge is the right
foundation, so the linked representation is paused behind it.

## The question

Jumi's aggregate is published with `api.addBase({ '.animations': … })`. That selector is
literal, while the carrier utility it serves is not: a variant moves it somewhere else.

```html
<div class="animations animate-…">          <!-- consumer on the element -->
<div class="*:animations"><i class="animate-…"></i></div>   <!-- consumer on the child -->
<div class="before:animations before:animate-…">            <!-- consumer on ::before -->
```

Measured in a browser, only the first animates. The other two resolve `animation-name:
none`, because their aggregate stayed on `.animations` while the consumer moved — and the
aggregate's entries reference slot variables that only exist where the consumer is.
`pnpm behaviour:check` asserts all three.

So: **how does Tailwind keep a utility correct across direct, descendant and pseudo
contexts, when our publication loses locality?** Read from the source rather than inferred.

## What the pipeline actually does

`compileAstNodes` builds the utility **body** first, then wraps it in a rule, then applies
variants to *that rule*:

```ts
// packages/tailwindcss/src/compile.ts:222
let asts = compileBaseUtility(candidate, designSystem)     // the body
let selector = `.${escape(candidate.raw)}`
for (let nodes of asts) {
  let node: StyleRule = { kind: 'rule', selector, nodes }  // wrapped, still the body
  for (let variant of candidate.variants) {
    let result = applyVariant(node, variant, designSystem.variants)  // transforms the rule
  }
}
```

And a variant does not copy the body — it **re-parents** it:

```ts
// packages/tailwindcss/src/variants.ts:359
function staticVariant(name, selectors, { compounds } = {}) {
  variants.static(name, (r) => {
    r.nodes = selectors.map((selector) => rule(selector, r.nodes))
  }, { compounds })
}

staticVariant('*', [':is(& > *)'], { compounds: Compounds.Never })
```

`*:animations` therefore emits `:is(.animations > *) { …the body… }` and `before:animations`
emits `.animations::before { …the body… }` — with the declarations *inside*, wherever the
selector ended up.

**That is the whole answer to why the old carrier worked everywhere and our bridge does
not.** Anything declared in the utility body travels with the body. Our aggregate is not in
the body: `addBase` is a separate pass with no candidate and no variants, written to a
literal selector. The data and the consumer diverge the instant a variant moves the
consumer, and no choice of selector in `addBase` can fix it — `:root` fails for the
element-local slot variables, `.animations` fails for every prefixed form, and a universal
`*` would pay ten aggregate properties on every element in the document.

## The seam that would solve it

The local fork (`~/Desktop/workspace/tailwindcss-core`, branch `feat/tailwind-hooks`,
commit `fb86833b`) adds a hook system, and one of its events is exactly a late-bound
mutation point on the compiled rules:

```ts
// packages/tailwindcss/src/compat/plugin-api.ts:150
buildComplete: {
  ast: AstNode[]
  ruleMap: Map<string, CompiledRule>
}

export type CompiledRule = Array<{
  node: StyleRule
  /** Replaces a matching declaration's value, or appends it if missing. */
  set: (css: CssInJs) => void
}>
```

`ruleMap` is keyed by **utility name** — for a static utility that is `candidate.root`, so
`ruleMap.get('animations')` — and holds one entry per **variant form**, each with the node
that variants already transformed:

```ts
// packages/tailwindcss/src/compile.ts:92 — "all variants"
//   Map of utility name → compiled entries for that utility (all variants).
```

`set` reaches the declarations wherever they ended up, by descending through the wrappers
variants introduced:

```ts
// packages/tailwindcss/src/compile.ts:141
function drill(node: StyleRule, callback: (node: StyleRule) => void) {
  let children = node.nodes.filter((child): child is StyleRule => child.kind === 'rule')
  if (children.length === node.nodes.length) {
    for (let child of children) drill(child, callback)
    return
  }
  callback(node)
}

// compile.ts:158 — find-or-replace a declaration in the innermost rule
function setDeclarations(node: StyleRule) {
  return (css: CssInJs) => { /* existing.value = …, else innermost.nodes.push(…) */ }
}
```

So a plugin can write the aggregate **into the carrier utility body, per variant form,
after variant transformation** — the data then travels exactly as the consumer does, in all
three contexts, with no literal selector anywhere.

### Why this does not reintroduce the stale-cache problem

The bridge exists because a utility that changes as slots appear is reused stale. The hook
is not that: it fires *after* every candidate has been compiled and *before* sorting and
return, on every pass that compiles anything:

```ts
// packages/tailwindcss/src/compile.ts:180
emit('buildComplete', { ast: astNodes, ruleMap })
```

and `build()` recompiles the **whole accumulated candidate set** whenever anything changed,
which is also what registers slots:

```ts
// packages/tailwindcss/src/index.ts:717
build(newRawCandidates: string[]) {
  /* …adds to allValidCandidates… */
  if (!didChange) { compiled ??= optimizeAst(ast, designSystem, opts.polyfills); return compiled }
  let newNodes = compileCandidates(allValidCandidates, designSystem, { onInvalidCandidate }).astNodes
```

The values written by `set` are current as of that pass, because the model's slot registry
is as current as that pass. When nothing changed there is nothing to refresh, and the
short-circuit returns the previous AST. That is a *refresh per build*, not a cache of
plugin output — the opposite of what `addUtilities` would give us.

### `@apply` becomes reachable, in principle

`@apply` resolves its candidates through the same compiler:

```ts
// packages/tailwindcss/src/apply.ts:217
let compiled = compileCandidates(candidates, designSystem, { respectImportant: false, … })
```

If the aggregate lives in the carrier's body, `@apply animations` inlines it along with
everything else — so the path recorded as *deliberately unsupported* would become
supportable. It is not free: `@apply` runs while the CSS is parsed, before template
candidates are scanned, so any data inlined there is whatever existed at parse time. The
behaviour matrix pins that case in the failing direction, so if it ever changes the matrix
says so rather than a doc.

## What is not available in stock Tailwind

The hook is **fork-only**. The installed `tailwindcss@4.3.3` contains zero occurrences of
`buildComplete` or `PluginHookName`:

```text
node_modules/tailwindcss/dist/lib.js: 0
```

Stock Tailwind's plugin API offers `addBase`, `addUtilities` and `matchUtilities`, and none
of them expose a compiled, post-variant rule that can be mutated with current state:

| API | What it can reach | Why it fails here |
| --- | --- | --- |
| `addBase` | an at-rule pass, no candidate, no variants | literal selector only — this is the bridge's limit |
| `addUtilities` | a class rule per candidate | cached per candidate; dynamic values go stale |
| `matchUtilities` | same, and re-registration is ignored | the same staleness, measured earlier |

So the choice is upstreaming the seam, adopting the fork, or accepting that prefixed
carriers cannot be correct — which would be the first genuine Tailwind blocker in this
workstream rather than an inconvenience.

## What this means for the sequencing

1. The linked representation is **paused** and `K` is not chosen yet: if the aggregate moves
   into the utility body, both the chain's placement and its per-element resolution change,
   and today's K measurements become stale.
2. `pnpm behaviour:check` now carries the carrier-context matrix — direct, descendant,
   pseudo as requirements, `@apply` pinned as a non-feature — so the P0 is a standing red
   gate rather than a note.
3. The seam is **proven** — see below. The bridge is not deleted yet: the experiment proves
   the mechanism, not that the fork is a foundation Jumi should depend on.

## The experiment

`scripts/spike-carrier-seam.mjs` builds the same carrier twice with the fork's compiler,
differing only in *where* the aggregate is published, and asks a browser which carrier
contexts resolve. Both arms use one carrier body and one aggregate; the slot utilities are
identical. It loads the compiler from `tailwindcss-core` by path and is deliberately not
wired into Jumi.

```text
context                              addBase (stock API)   buildComplete (fork hook)
direct carrier                       ✓ jumi-rotate-45deg   ✓ jumi-rotate-45deg
*:animations descendant              ✗ none                ✓ jumi-rotate-45deg
before:animations pseudo             ✗ none                ✓ jumi-rotate-45deg
@apply animations                    ✗ none                ✓ jumi-rotate-45deg

where the aggregate is declared      addBase   hook
  .animations                          ✓        ✓
  :is(.\*\:animations > *)             ✗        ✓
  .before\:animations::before          ✗        ✓

required contexts correct            1/3       3/3
```

The hook saw **all three carrier forms from one lookup** — `ruleMap.get('animations')`
returned the entry for `.animations`, for `:is(.\*\:animations > *)` and for
`.before\:animations::before` — which is the "all variants" grouping doing exactly what the
comment in `compile.ts` says it is for.

### What this establishes, and what it does not

It establishes that **the locality loss is placement, not semantics**: the same carrier
body, the same aggregate and the same slot variables resolve in every context when the data
is written into the transformed body, and in one context when it is written by `addBase`.
The required extension point is a late, candidate-aware mutation of already-variant-
**transformed** utility rules. That is now measured rather than inferred, and it is
evidence that the hook design itself is sound.

It does **not** establish that the fork is a credible production host. The capability is our
own addition, so it cannot serve as independent evidence about the fork's stability, and
adopting it would make Jumi depend on our patches continuing to apply through Tailwind's
internals. `tailwindcss-core` is a laboratory for now, not a platform.

### One caveat the experiment cannot settle

`@apply animations` resolves in the hook arm, but the aggregate there was a **constant**. In
the real design `@apply` runs while the CSS is parsed, before template candidates are
scanned, so the copy it inlines is a *snapshot* — and because it is a copy, the hook cannot
refresh it later. So the expected production behaviour is still `none`, which is what the
matrix pins. It is worth confirming on the real model before the matrix is changed either
way.

## The answer: a Jumi-owned finalizer over emitted CSS

`scripts/spike-carrier-finalize.mjs` (`pnpm spike:carrier-finalize`) runs **stock Tailwind**, the
real plugin, and three incremental builds:

```text
build 1 · the contexts          direct ✓   descendant ✓   pseudo ✓   @apply ✓
build 2 · + a slot              all four ✓               + jumi-shake resolves
build 3 · + a variant slot      all four ✓               + jumi-fade-in resolves
staging rules removed           2 → the finalizer is sufficient, not additive
```

So the open question is answered: **Jumi can own this capability on stock Tailwind, without a
fork.** Three pieces:

1. the carrier body declares `--jumi-carrier` — a declaration in the utility body, so variants
   carry it wherever they move the body
2. Jumi publishes the aggregate as it does today, as a staging rule
3. a finalizer resolves that aggregate, injects it into every marked rule, and removes the staging

The finalizer's entire vocabulary is Jumi's own: **a carrier is a rule declaring the marker**;
staging is a rule declaring aggregate data that is not a carrier. It knows nothing about Tailwind
selectors, variants or AST — so `*:animations`, `before:animations`, compound variants, and
whatever Tailwind invents next all behave identically. Tailwind owns transformation; Jumi owns the
data.

### `@apply` resolves, and stays current

That is the one result the fork could not have produced. `@apply` copies the carrier body while
the CSS is parsed, and the aggregate does not exist yet — a node-level hook can only mutate the
*compiled* carrier rule, not the copy inlined into the author's rule. A finalizer runs over the
emitted stylesheet, where that copy **is** a rule with the marker, so it receives current data
like every other carrier.

So it is supported. It was pinned as a non-feature before the mechanism existed, and the pin was
wrong: `.applied-motion { @apply animations animate-rotate-45 }` resolves its slot in a browser,
with the same list lengths as every other carrier. `behaviour:check` requires it now.

### What remains, in order — all four, done

1. **Where the finalizer runs.** In-process, at the boundary `@tailwindcss/vite` and
   `@tailwindcss/postcss` occupy: `finalize(css)` is a pure string → string step over the emitted
   stylesheet, exported from the package, and every harness here calls it right after `build()`.
2. **The bridge is deleted.** `publishAggregate` hands the flat lists to the sink, the adapter
   stages them under `:root` with the marker, and the carrier body declares `--jumi-carrier`.
3. **The flat aggregate is restored.** The chain is gone from `src/core`, from the tests and from
   the metrics. `behaviour:check` is 8/8 including `@apply`, `incremental:check` is 6/6, and the
   snapshot carries the whole aggregate per carrier instead of per publication — canonical shipped
   bytes went 164,910 → 66,772 and the carrier variant 116,379 → 90,173.
4. **`@apply`: supported.** Above.

The `K` curve was **not** remeasured, and that is the point: the placement change made per-element
resolution a non-question, and the real-emission benchmark that rejected the linked representation
(1.82× at `K = 8`) measured a cost the flat lists no longer pay. The numbers in
`aggregate-representation.md` stand as the reason it was rejected, not as something to re-run.

The `tailwindcss-core` fork stays a laboratory: it produced the diagnosis (`compileAstNodes` builds
the body, variants re-parent it) and the proof that late mutation is the right shape, and the
finalizer now delivers that shape inside Jumi.

### The boundary is real, and it is not where it looks

`pnpm vite:check` drives `@tailwindcss/vite` — the plugin users install — in dev and in a build,
with a browser checking the four contexts and a source edit while the dev server runs. It passes,
and it settled the one thing that could not be reasoned out from the source:

```
dev    pre    CSS      ← Tailwind generates here
       normal CSS      ← Jumi finalizes here
       post   JS       ← Vite's CSS→JS step has already run
build  pre    CSS
       normal CSS      ← Jumi finalizes here (after Tailwind's own optimize)
       post   ''       ← already bundled into an asset
```

Tailwind's three Vite plugins are all `enforce: 'pre'`, so `enforce: 'post'` reads as the obvious
seat for a finalizer. It is the wrong one: at `post` the stylesheet is a JS module in dev and an
empty string in build, so the pass would find nothing and — worse — would look wired up. A plugin
with no `enforce` is the only position both modes agree on, which is why `jumiFinalizer()` declares
none — and why `jumi()` composes Tailwind's plugin and that finalizer behind one entry, so no author
has to know any of this. `tailwindcss({ optimize: false })` changes nothing the protocol relies on:
the marker and the staging are ordinary custom properties, and the aggregate is injected after the
optimizer either way.
