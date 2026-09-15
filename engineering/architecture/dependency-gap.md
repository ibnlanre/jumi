# Dependency gap — what still stands between Jumi and independent emission

The question this answers, asked before spending anything on Phase 3c:

> If Jumi independently discovers raw candidates and can parse their semantics, what Tailwind
> capability would still remain load-bearing before Jumi can emit the corresponding utility itself?

The answer is **not scanning**. Three of the four things discovery was bundled with are already
settled by measurement: parsing (3a, proven — `engineering/research/scanner-inventory.md`), ordering (3b, closed — a
lexical sort of raw candidates) and the theme vocabulary (Phase 2, closed — a token, a formula or a
literal, with the gate enforcing it). What is left is larger than a scanner and mostly not in this
repository yet.

## Capability by capability

| Capability                                                                                | Status                       | Evidence                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jumi's own semantics — slots, phrases, effects, labels, composition, aggregate, keyframes | **Jumi's**                   | `@/core`; the aggregate is Jumi's own protocol                                                                                                                                                            |
| Theme vocabulary → representation (token / formula / literal)                             | **Jumi's**                   | Phase 2, 71 keys classified, enforced by `pnpm theme:map`                                                                                                                                                 |
| Reading the user's `@theme` and resolving it                                              | **host's**                   | `resolveTheme` asks `api.theme(key)` and never sees a `@theme` block. Owning emission means parsing `@theme` itself: multiple blocks, cascade, and the `inline` / `static` / `reference` / `prefix` modes |
| Candidate discovery                                                                       | ownable, parked              | 3c. Substring-level, low value alone                                                                                                                                                                      |
| Candidate semantics                                                                       | **proven, in `scripts/`**    | 3a: 123 Jumi-relevant candidates, 0 real deltas                                                                                                                                                           |
| Candidate ordering                                                                        | **solved**                   | 3b: byte order of raw candidates; `@apply` is a second, authored-order source                                                                                                                             |
| Data-type inference (bare values only)                                                    | ownable, small               | `360` → `360deg`; `animate-width-abc` calls nothing. Arbitrary values are never type-checked                                                                                                              |
| **Variant transformation**                                                                | **host's — the largest gap** | measured below                                                                                                                                                                                            |
| Rule placement and layer structure                                                        | **host's**                   | every Jumi rule lands in `@layer utilities`; `@property` and the staging rule are placed by the host too                                                                                                  |
| Theme variable emission and tree-shaking                                                  | **host's**                   | measured in Phase 2: only the _referenced_ `--color-*` tokens are emitted, which is why pointing at tokens does not pull in the namespace                                                                 |
| `@apply` expansion                                                                        | **host's**                   | and it is a shipped Jumi feature (principle 6 of `CONTRIBUTING.md`), so it stays load-bearing                                                                                                             |
| Global `important` and `prefix`                                                           | **host's**                   | Jumi passes neither, but a user can set them, and the emitted CSS has to respect them                                                                                                                     |
| Sources: `@source`, `source(none)`, ignores, incremental invalidation                     | **host's**                   | 3c's other half, and the one with real ongoing cost                                                                                                                                                       |
| Pipeline integration (CLI / Vite / PostCSS)                                               | **Jumi's, composed**         | `jumi/vite` and `jumi/postcss` exist, but they compose Tailwind's plugins rather than replacing the compiler                                                                                              |

## The variant surface, measured

`node scripts/spike-variants.mjs` compiles one carrier and one tween utility under every variant
Jumi's own corpora actually use, and prints the wrapper the host produces:

| Variant         | Transformation                                                          |
| --------------- | ----------------------------------------------------------------------- |
| `hover`         | `@media (hover: hover)` + `:hover`                                      |
| `before`        | `::before`                                                              |
| `hover:before`  | composed: media **and** pseudo-element                                  |
| `*`             | re-parents: `:is(.… > *)` — the carrier included                        |
| `*:odd`         | `:is(.… > *):nth-child(odd)`                                            |
| `sm`            | `@media (width >= 40rem)`                                               |
| `not-sm`        | `@media not (width >= 40rem)` — negation, not a second breakpoint       |
| `motion-safe`   | `@media (prefers-reduced-motion: no-preference)`                        |
| `motion-reduce` | `@media (prefers-reduced-motion: reduce)`                               |
| `[&:is(h1)]`    | `&:is(h1)` — the host's arbitrary variant, which replaced Jumi's `is-*` |
| `has-[>button]` | `&:has( > button)` — the host's built-in, which Jumi no longer shadows  |

Every one of them sits inside `@layer utilities`, and every one applies to the **carrier** as well
as to the utility — which is the case `engineering/architecture/carrier-locality.md` describes from the other side: `*`
re-parents the carrier body, and that re-parenting is why the aggregate cannot be published at a
literal selector.

Two of these are worth naming as the shape of the work: `not-sm` is a _negated_ media query, and `*`
is a _re-parenting_ selector, not a class wrapper. A Jumi emitter needs a variant registry
(name → media/selector transform), composition of several, and the ability to move a carrier — and
that is a larger subsystem than the scanner it would replace.

## A. Selector / variant semantics — prototype result

`scripts/lib/variants.mjs` is a prototype representation, and `pnpm spike:variants` checks it against
the host: for every variant Jumi's corpora use, the model's rendered output has to equal the wrapper
Tailwind emits — for the **utility and the carrier**, because the carrier is the one that moves.

```text
11/11 transformations reproduced (11 registry entries + 3 arbitrary rules, ~20 lines)
```

The shape that does it: **a variant is a list of steps, a step is a media query or a selector
transform, and composition is `&` substitution, left to right.** `hover:before` is
`[(media: hover: hover), (&:hover)] + [(&::before)]`; `*:odd` is `[:is(& > *), (&:nth-child(odd))]`.
Nothing else was needed for the whole corpus.

Two things the exercise turned up that matter more than the model size:

- **Two of the variants are Jumi's, and one used to shadow the host's.** `is-` and `where-` are
  registered by `src/variants/index.ts` through `matchVariant` — measured, neither exists in a build
  without Jumi. `has-` was registered there too, and that was a regression: it replaced the host's
  correct `has-*` with a descendant form, so `has-[.x]` went from `&:has(:is(.x))` to `& :has(.x)`,
  and `has-hover:` — composition the host supports — stopped emitting anything at all.
- **Both were emitting a descendant selector, which is now fixed.** `src/variants/index.ts` handed
  `matchVariant` a bare string, and the host appends a string generator to the utility's selector, so
  `:is(h1)` became `& :is(h1)` — "an element inside an h1", not the element itself. Measured, before
  and after, out of the recorded snapshot:

  ```css
  /* before */
  .is-\[h1\]\:animate-fade-in :is(h1) { … }        /* an h1 inside the carrier */
  .has-\[\>button\]\:animate-scale-110 :has(>button) { … }

  /* after */
  .is-\[h1\]\:animate-fade-in:is(h1) { … }         /* the carrier, if it is an h1 */
  .has-\[\>button\]\:animate-scale-110:has( > button) { … }
  ```

  The fix was the `&` in the generator, and dropping Jumi's `has-` so the host's built-in applies —
  which also brings back `has-hover:`. The bare `has-button` form that only Jumi's variant accepted is
  listed under "Avoid" in principle 5 of `CONTRIBUTING.md`, so nothing documented was lost.

**Then `is-*` and `where-*` were removed too**, on the same reasoning one step earlier: registering
`is-[h1]:` was a bet that Tailwind will not ship an `is-*` variant with richer composition or
different wrapping, and that bet is exactly the one `has-*` lost. Nothing was lost for users — the
host's arbitrary form is the same semantics with more characters:

```html
<h1 class="animate-fade-in [&:is(h1)]:animate-fade-in">
  <!-- replaces is-[h1]:  -->
  <section class="[&:where(.card)]:animate-slide-in-up">
    <!-- replaces where-[.card]: -->
  </section>
</h1>
```

Measured, the arbitrary form emits the same transformation: `&:is(h1)`, same element. Jumi's own
variant surface is now **empty**, which is the strongest form of the principle: it owns motion, and
nothing in the host's namespace.

### The assertions are discriminating

`pnpm behaviour:check` gained three, each of which the old selector fails:

```text
✓ [&:is(h1)] matches the element               the carrier itself, an h1
✓ [&:is(h1)] does not match a descendant       a carrier h1 *inside* a div carrying the class
✓ has-[>button] matches the element            the div with a direct <button> child
```

### Does the shape extrapolate?

| Capability                                          | Expressible in the shape?                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `group-*` / `peer-*`                                | yes — measured: `group-hover:` is `&:is(:where(.group):hover *)`, a selector step |
| arbitrary variants `[&>*]`                          | yes — a verbatim selector step containing `&`                                     |
| `not-*`                                             | yes — a selector step (`&:not(:is(h2))`)                                          |
| `@supports`, `@container`                           | yes — another at-rule step beside media                                           |
| prefix                                              | no, and it is not a variant — it rewrites class names                             |
| specificity, `:where()` placement                   | a per-variant detail, not a new kind                                              |
| the catalogue: ~40 built-ins plus `@custom-variant` | the actual cost, and it is a catalogue plus an ordering rule, not a new shape     |

### Who owns variants now

| Kind                                                                                                                                               | Owner                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| everything Jumi's corpora actually use — `hover`, `sm`, `not-sm`, `motion-*`, `before`, `*`, `*:odd`, `has-*`, and the arbitrary form `[&:is(h1)]` | **host**                                                           |
| Jumi's own                                                                                                                                         | **nothing** — the variant surface is empty after the removal below |
| the catalogue at large — parity beyond what Jumi uses                                                                                              | **not a 1.0 goal**                                                 |

That is the ownership boundary, and it is now a written principle: **do not claim host vocabulary
because the host does not implement it yet** (principle 9 of `CONTRIBUTING.md`, with the test to
apply). The shape stays small; owning _parity_ means owning the catalogue. That is what the exercise
was for.

## B. Stylesheet / theme semantics — the surface, scoped

Not evaluated yet. The surface is read out of the host rather than recalled: `@theme` carries five
modes (`reference`, `inline`, `default`, `static`, `prefix(…)`), prefix key rewriting, a
namespace-to-token mapping, the cascade across multiple blocks, and tree-shaking of unused variables
(measured in Phase 2: only _referenced_ `--color-*` tokens are emitted). Beside it sit `@source`
parsing, `@apply` expansion and layer placement.

The Phase 2 boundary may already be the right long-term answer: **Jumi owns what theme values mean
to Jumi — token, formula, literal — while the host keeps parsing and exposing the user's theme.**

## C. Does any Jumi behaviour depend on undocumented internals?

That is the success criterion now, so it deserves an answer. The whole dependency is
`addBase`, `addUtilities`, `matchComponents`, `matchUtilities`, `matchVariant`, `theme` and
`createPlugin` — all documented. The behaviours Jumi has had to work around are enumerated in
`engineering/roadmap/migration.md`, and each is handled by construction rather than by assumption. Two entries remain
worth naming:

- **candidate ordering.** The aggregate's precedence follows the order candidates reach the matcher,
  which is a scanner implementation detail — byte order of raw candidates, measured in 3b — not a
  documented contract. This is **a pinned compatibility assumption, not a migration target**: it is
  named here, `pnpm css:check` pins it for the corpora, and **a failing ordering gate on a Tailwind
  bump is a release blocker** rather than something to re-tune. It would not fail in a user's project
  on a Tailwind minor, which is exactly why the assumption lives in one place instead of everywhere.
- **the collapsed-scale spread.** `api.theme('radius')` returning character keys is undocumented
  behaviour Jumi _guards against_ (measured: those names are unreachable, `rounded-1` emits nothing)
  rather than depends on.

Neither is a blocker, and both are named so they cannot be discovered later. With them on the table,
the honest position is that Jumi owns its semantics and the host owns the utility language — and that
turning the remainder into a Jumi CSS compiler is a product decision, not a dependency to remove.

## What this says about the order

```text
3c discovery          substring-level, low value alone — paused indefinitely
3d arbitrary values   decoding + phrase validation, and bare-value derivation
variants              prototype done: the shape is small, parity is a catalogue
@theme reading        the other load-bearing piece, and the one not yet evaluated
```

So the recommendation runs against the sequence: **do not build the scanner.** Discovery is the
cheapest of the remaining capabilities and the one that removes the least; the reason Jumi still
needs Tailwind is that it cannot transform a variant or read the user's own stylesheet. If the goal
is fewer dependencies rather than more coverage, the next investigation is `@theme` — the second
pillar, and the one whose surface has only been scoped so far.

Discovery stays in `scripts/` as a proven prototype, and the parser stays with it. Nothing here is
scheduled: this is an inventory of what remains, not a plan to cross it.
