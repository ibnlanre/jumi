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

`scripts/spike-carrier-seam.mjs` (retired) builds the same carrier twice with the fork's compiler,
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

`scripts/spike-carrier-finalize.mjs` (retired) runs **stock Tailwind**, the
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
3. a finalizer resolves that aggregate, writes it into every marked rule as that rule's own
   declarations — the `animation-*` longhands, or the `transition` shorthand — and removes both
   the staging and the marker

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
   Both are build-time only: `finalize` materializes the lists into the carrier's longhands and
   erases the marker, so a finished stylesheet holds none of the protocol.
3. **The flat aggregate is restored.** The chain is gone from `src/core`, from the tests and from
   the metrics. `behaviour:check` is 8/8 including `@apply`, `incremental:check` is 6/6, and the
   snapshot carries the whole aggregate per carrier instead of per publication — canonical shipped
   bytes went 164,910 → 66,772 and the carrier variant 116,379 → 90,173.
4. **`@apply`: supported.** Above.

The `K` curve was **not** remeasured, and that is the point: the placement change made per-element
resolution a non-question, and the real-emission benchmark that rejected the linked representation
(1.82× at `K = 8`) measured a cost the flat lists no longer pay. The numbers in
`engineering/architecture/aggregate-representation.md` stand as the reason it was rejected, not as something to re-run.

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
the marker and the staging are ordinary custom properties, and the aggregate is materialized after
the optimizer either way.

### The transport does not ship

Those three pieces are build-time only, and that is an asserted invariant rather than a
description: `--jumi-carrier`, `--jumi-carrier-staging` and every `--jumi-aggregate-*` are absent
from a finished stylesheet, and `css:check`, `vite:check`, `postcss:check` and `examples:build`
fail on any occurrence of the three.

It used to ship. The finalizer kept the marker and injected the staged declarations into each
carrier, so a carrier read its own data through a pointer it also declared:

```css
.animations {
  --jumi-carrier: animations;
  animation-duration: var(--jumi-aggregate-animation-duration, var(--jumi-animation-duration));
  --jumi-aggregate-animation-duration: var(…), var(…);
}
```

Now the data is written where it is read, and the pointer and the marker are dropped:

```css
.animations {
  animation-duration: var(…), var(…);
}
```

The carrier's longhands **are** the aggregate, so "is this carrier finished?" is answerable by
reading the declarations a browser applies instead of by trusting a marker. That is also why the
marker is erased only when something was materialized: a carrier with no data behind it keeps its
marker, which is what lets the invariant fire — a build that published no aggregate leaves the
protocol in the output and the checks say so, rather than shipping a carrier that silently animates
nothing.

Measured across the harnesses, before → after: canonical `snapshot.css` 92,303 → **89,877 bytes**,
the carrier variant 90,577 → **85,659**, `examples/output.css` 272,553 → **267,635**. The PostCSS
fixture's four carriers went 23,861 → **18,987**. Nothing about the data changed — the same 40
declarations across the same 4 carriers — only where it is written.

### The carrier's own declarations are the contract

Two requirements pull in opposite directions:

- **locality** wants the list *inside* the utility body, because that is what travels with a
  re-parented or `@apply`-copied body
- **freshness** wants it *outside*, because Tailwind caches one AST per candidate and will not
  revisit the carrier when a later class changes what the list should say

The finalizer is neither. The body is **constant** and names the parts it applies; the list is
staged and written late. What makes that extensible is that the carrier's own declarations are the
whole of the contract — a staged part is written only where the carrier already declares that
property:

```ts
const existing = ownDeclarations(rule).find(declaration => declaration.prop === longhand)

if (!existing || existing.value === value) continue
```

Nothing is appended. A property a carrier does not declare is not one it wants, so the finalizer
needs **no knowledge of carrier types**: `animations` declares the ten animation longhands and
`transitions` declares `transition`, each is handed only its own, and both travel one flat staging
channel. A carrier says what it is by what it declares — which is also why erasing the marker costs
nothing: the declarations left behind *are* the distinction.

That is a better trade than a per-carrier protocol branch. A third carrier needs no change in the
finalizer, only a body that declares what it applies.

### `transitions` had the same problem, from the other side

`animations` was refactored into that shape first; `transitions` was left composing its `transition`
shorthand **inside** the utility body, from the live set of motions:

```css
/* was */
.transitions {
  transition: var(--jumi-background-color-transition), var(--jumi-scale-transition);
  --jumi-background-color-transition: var(…) var(…) var(…) var(…);
}
```

That gets locality for free — the body travels — and gives up freshness, because the shorthand is
part of the thing Tailwind caches. Measured on one long-lived compiler:

```text
build 1                                              .animations 1 slot    .transitions [background-color]
build 2  + animate-scale-110, + transition-property/scale
                                                     .animations 2 slots   .transitions [background-color]
```

`.animations` picked the new slot up; `.transitions` never saw the new motion. One-shot builds were
correct only because Tailwind sorts candidates lexically and every `transition-*` utility precedes
`transitions` — a lifecycle accident, not a contract, and exactly the class of thing the rest of
this migration removed.

It now uses the same means. The intermediate `--jumi-<motion>-transition` variables went with it:
they were dynamic too — which motions exist is — and every dynamic declaration is another part that
would have to be materialized, so the composed list is inlined into the single declaration the
finalizer writes.

### Three levels, because the bug has three shapes

*Fresh build correct, incremental compiler stale, only the browser shows it* is the shape this
class of bug takes, and it has now appeared twice. The property is pinned at three levels, each
catching a different failure:

```text
unit       src/helpers/create/create.test.ts   a motion arriving after a pass republishes the list
compiler   scripts/incremental-build.mjs       both carriers grow on one long-lived compiler
browser    scripts/vite-check.mjs              the dev server's element reports both motions
```

The browser level is the one that is not optional. `incremental:check` asserts the emitted
stylesheet; the user's symptom is a computed style. `vite:check` reads
`getComputedStyle(el).transitionProperty`, edits the page while the server runs, and requires
`background-color` to become `background-color, scale` with no restart.

### Why the data travels in CSS and not in memory

The transport has always been justified by a claim that was never measured: that the plugin
Tailwind loads and the finalizer cannot share one model, so the data has to travel through the
stylesheet. `scripts/spike-shared-runtime.mjs` (retired) measured it, and the claim is **wrong as
stated** — identity is available, with no globals and no Tailwind internals.

Tailwind's own loader branches on the *form* of the plugin id, and `@tailwindcss/node` ships an
`esm-cache.loader` that propagates a parent's `?id` to whatever that parent imports:

```js
if (id[0] !== '.') return import(resolve(id))        // bare or absolute
return import(resolve(id) + '?id=' + Date.now())     // relative
```

So a relative `@plugin` path is cache-busted on every load and gets a **private instance**, while a
bare or absolute one falls through to Node's ESM registry, which is per-process — and therefore
shared, whichever side imports first:

| `@plugin` form | vite dev | dev, 2nd entry | two entrypoints | recompile | vite build | postcss |
| --- | --- | --- | --- | --- | --- | --- |
| `"./runtime.mjs"` | PRIVATE | PRIVATE | ISOLATED | REPLACED | PRIVATE | PRIVATE |
| absolute path | SHARED | SHARED | **SHARED** | STABLE | SHARED | SHARED |
| `"@jumi/probe"` | SHARED | SHARED | **SHARED** | STABLE | SHARED | SHARED |

The middle column is why the design was not taken. Sharing is exactly the problem: **one instance
serves both entrypoints.** A shared runtime knows everything that happened in the process and
nothing about which stylesheet a motion belongs to, so a finalizer handed the process-wide
aggregate would write one stylesheet's motions into another's carrier — including motions whose
keyframes Tailwind emitted only into the other file. Today two entrypoints get isolated instances,
and each stylesheet's staging carries only its own data.

Nor can that be repaired by keying the model per stylesheet, because the plugin cannot see which
stylesheet it is serving. Measured from inside the plugin: `api.base` is `null`, and the API
surface is `addBase, addComponents, addUtilities, addVariant, config, matchComponents,
matchUtilities, matchVariant, prefix, theme` — nothing path-like. The stylesheet path is known only
to the finalizer, so per-stylesheet scoping would need a map the plugin cannot fill.

Two further consequences, both structural:

- **An out-of-process finalizer is excluded.** The Tailwind CLI — and `examples:build` — emits in a
  child process and completes in the parent. No loader trick crosses that, so a pure in-memory
  design would have no CLI story at all.
- **The documented form and our own fixtures disagree.** The docs say `@plugin "@ibnlanre/jumi"`
  (bare → shared); `examples/input.css` and `stories/globals.css` use `@plugin '../dist/index.js'`
  (relative → isolated). A design that depended on the form would work in the docs and break in the
  fixtures, which is the kind of coupling this migration has been removing.

So the CSS channel is doing real work, but not the work it was credited with. It is not
compensating for a missing hook — it is the only place the **per-stylesheet boundary** exists.

### Why the marker stays

That leaves the narrower question, which is about *locating* the carrier rather than about carrying
the data: the aggregate travels in CSS, but `--jumi-carrier` is a synthetic name a browser never
reads, and both carriers already declare something better. `transitions` declares
`transition: var(--jumi-transition)`; `animations` could declare
`animation-name: var(--jumi-animation-name)`. Both are real reads of real controls, so they travel
through variants, are copied by `@apply`, and are meaningful CSS whether or not a post-pass runs.

`scripts/spike-marker-elimination.mjs` measured it, with the shipping finalizer as the oracle: the
real plugin over the real corpora, transformed mechanically into the marker-free shape, then
finalized both ways. **The outputs must be identical** — the marker is only doing work if they are
not.

| corpus | carrier rules | verdict |
| --- | --- | --- |
| `input.css` | 3 | IDENTICAL |
| `variant.css` | 4 | IDENTICAL |
| carrier matrix | 7 | IDENTICAL |
| no slots or motions | 2 | IDENTICAL but for 1 marker the shipping pass leaked |

Covered contexts, all written: `animations`, `transitions`, `*:animations`, `before:animations`,
`motion-safe:animations`, `hover:animations`, `@apply animations`, `@apply transitions`. So the
marker is **not needed to find a carrier**, on Jumi's own output, under either locator.

It fails on the rest:

- **It is ambiguous, and not in a contrived way.** The fallback is a *public* read —
  `--jumi-animation-name` and `--jumi-transition` are documented controls with defaults. A page
  that writes `transition: var(--jumi-transition)` writes the same declaration the carrier does.
  Measured: **2 of 2 such rules rewritten** by the proposal, against **0** for the shipping pass. A
  locator that cannot tell a carrier from a page reading a control is not a locator.
- **It is value-sensitive where the marker is not.** The marker identifies a rule by *property*, so
  a declaration whose value has drifted is still written. Matching on the value misses it: with one
  value changed, the shipping pass left **0** declarations behind, per-declaration matching left
  **1**, silently. Per-rule matching also leaves 0 — but only by widening the ambiguity above, since
  a rule that matches gets every part it declares overwritten.
- **It loses the only success signal there is.** A carrier with nothing to apply keeps its fallback
  — correct output, and indistinguishable from a carrier the locator never found. The shipping pass
  distinguishes them by erasing a marker; there is nothing here to erase.

The marker would go only if the fallback stopped being a public name, which means introducing a
private variable per part and reading that instead. That is the same shape with a new spelling —
the thing this spike existed to rule out.

**And it found a real defect in what ships.** With no motions, `transitions` already declares
`transition: var(--jumi-transition)` and the staged list is the same string, so nothing was
replaced, `changed` stayed `false`, and the marker was never erased:

```text
no slots or motions · emitted by the CLI, as examples:build runs it
  before   1 carrier written, 1 staging rule consumed,   1 carrier left
  after    1 carrier found,   0 written,  1 staging rule consumed,   no protocol left
```

A page with `class="transitions"` and no `transition-*` utility shipped
`--jumi-carrier: transitions` and tripped the zero-occurrence invariant on a legitimate build.
`animations` escaped only because its body reads *through* the transport, so replacing that read is
a change even when the value is unchanged. It stayed latent because no corpus had a motionless
carrier; `postcss:check` has one now, and it reproduced the leak in all five of its configurations
before the fix.

The mistake was conflating two questions — *did this carrier need a new value?* and *did this
carrier complete the protocol?* — and reporting only the first. They are separate fields now,
`carriersChanged` and `carriersFound`, and the erasure follows participation rather than change.

One thing did **not** become unconditional, and the distinction is why. Erasing whenever a marker is
found would have removed the only signal left for a stylesheet that never published an aggregate: a
carrier with no data behind it would lose its marker, ship nothing, and look exactly like a carrier
whose animations are meant to be inert. So the gate is whether the pass had an aggregate at all —
staging consumed, or one handed in — which keeps that build a loud failure while letting a
motionless carrier finish.

What each carrier can be caught by differs, which is what makes the gate pass-level rather than
per-rule: an unfinalized `animations` carrier still reads through the transport, so the leftover
`--jumi-aggregate-*` name is a second signal, while an unfinalized `transitions` carrier declares
only the fallback — the marker is the *only* thing that says it was never completed.
