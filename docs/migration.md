# Independence migration

Status: **active roadmap.** Supersedes the upstream-first plan.

The bridge made the incremental problem Jumi's own to solve, and it is solved. So
the goal is no longer to get Tailwind changed — it is to need Tailwind less.

## The rule

We go upstream only when Tailwind creates a problem we cannot reasonably solve on
our side without damaging Jumi's API, correctness, or performance. Until then,
Tailwind is one host among the ones we could have.

`upstream-limitation.md` is parked as research evidence, not a workstream.

## The test we keep applying

> If Tailwind disappeared tomorrow, which Jumi concepts would stop existing,
> versus which integrations would merely stop working?

Target: **concepts: none. Integrations: some.** Integration loss is acceptable and
recoverable; concept loss means a Jumi idea was living in Tailwind's head.

## Where the boundary is today

```text
animations / transitions   Jumi's public carrier abstractions
Jumi model (@/core)        owns their shared semantics — slots, phrases,
                           effects, labels, composition, aggregate, keyframes
Tailwind adapter           transports that state into Tailwind's plugin API
base-layer bridge          repairs incremental publication
```

State ownership inside that boundary is deliberate, and worth stating precisely —
including where the data has to *resolve*:

```text
.animations  owns the aggregate data on the element, and carries behaviour
```

The aggregate is carrier-local state, not sheet-wide state. Each entry is
`var(--jumi-<slot>-animation-name, …)`, and those slot variables are declared by the
`animate-*` utilities **on the element itself**. A `var()` chain inside a custom property
resolves where it is *declared* — so the data has to sit on the carrier. Published on
`:root` the slot variables do not exist, the declaration computes to the
guaranteed-invalid value, that invalid value inherits, and every carrier resolves
`animation-name: none`. That was shipped and measured in a browser; see the P0 note under
"Gaps the inventory found".

`src/helpers/create/index.ts` is the only module that knows the host. Measured
surface of the dependency — everything the adapter touches:

```
addBase, addUtilities, matchComponents, matchUtilities, matchVariant, theme
tailwindcss/plugin (createPlugin)
```

`Api` also declares `addComponents`, `addVariant`, `config`, `prefix`. Jumi uses
none of them, so a Jumi-owned host interface is already ≈5 calls wide.

## Inventory

Classifications: **keep** (worth keeping — the host is better at it), **own**
(easy for Jumi to own), **retain** (hard dependency we intentionally keep).

| Capability | How Jumi uses it | Evidence | Classification |
| --- | --- | --- | --- |
| Candidate scanning | Not at all — Jumi never walks source files | no scanner in `src/`; `@source` is the host's | **retain** (the largest piece a Jumi emitter would need) |
| Candidate parsing / arbitrary values | `animate-rotate-[0:0deg,_,:]` — the phrase grammar is shaped by Tailwind's value parser | `docs/phrases.md`: `_` arrives already converted to a space, `{`/`}` are rejected outright | **retain**, and the deepest coupling: a Jumi parser must accept its own grammar, so the syntax is currently Tailwind's |
| Variants | Built-ins (`motion-safe:`, `hover:`, `sm:`, `*:`, `before:`) plus Jumi's own `is`/`has`/`where` via `matchVariant` | `src/variants/index.ts`; `docs/src/pages/docs/*.md` | **retain** until last — largest trap |
| Candidate sorting / compile order | Load-bearing for *semantics*, not just output: slot registration order is what `perValue`'s move-to-end drives, and that order decides which animation wins under `animation-composition: replace` | `src/core/index.ts` `perValue`; the harness asserts "fresh-scan order" | **semantic precedence — its own workstream, below** |
| Theme values | One function: `theme(key, values)` → `api.theme(key)`, flattened, called with 71 distinct Tailwind scale keys from 193 call sites | `src/helpers/create/index.ts`; `src/properties/*` | **own** — active workstream, below |
| Utility registration | `matchComponents` / `matchUtilities` with `type`, `values`, `modifiers`, `supportsNegativeValues` | `src/properties/tween.ts`, `controls.ts` | **keep** — transport, and the option shape is already host vocabulary Jumi only passes through |
| `@apply` | User CSS may apply Jumi utilities, and the carrier itself | `.applied-motion { @apply animations animate-rotate-45 }` resolves its slot in a browser — `pnpm behaviour:check`. `@apply` copies the carrier body, marker included, and `finalize` completes the copy | **keep** |
| At-rule pass-through | `addBase({ '@property …' })` — at-rules are emitted unconditionally | `src/helpers/create/index.ts` sink | **retain** |
| Layer order + same-selector append | The bridge relies on it: data in base, consumer in utilities, later declaration wins | `src/core/index.ts` `publishAggregate` | **retain** |

## Already independent

- **The semantic core is extracted.** `@/core` has no Tailwind imports; it takes a
  theme lookup and two sinks, and it holds the decisions.
- **Publication is host-independent.** `incremental:check` is green with the plain
  plugin, so the aggregate no longer depends on Tailwind's candidate cache or on
  candidate order to be *complete*.
- **The carriers are Jumi vocabulary, not adapter accidents.** They stay through
  the migration; if a future generator makes them implicit, that is an API change
  with an explicit new home for what they carry, not cleanup. See principle 6 in
  `CONTRIBUTING.md`.
- **Host integration is one post-pass, and it is generic CSS.** `finalize(root)`
  walks a PostCSS AST; `finalizeCss(css)` is the same thing across parse/serialize;
  `jumi/vite` and `jumi/postcss` are adapters, and nothing in the pass knows
  Tailwind's selectors, variants or AST. The dependency direction is
  Jumi → generic CSS AST, never Jumi → Tailwind compiler AST, so the day Tailwind's
  internals change is the day nothing here changes. PostCSS is a **peer** dependency
  for the same reason `tailwindcss` and the host plugins are: they are the
  environment Jumi runs in, not versions Jumi chooses and has to keep current.
  `@tailwindcss/vite`, `@tailwindcss/postcss` and `vite` are *optional* peers — only
  the integration you install pulls its own.

## Adoption: the step count, and its deletion path

The finalizer has to run after Tailwind, so *something* has to invoke it. That is a
real cost and it is a product regression unless it converges back to one step, which
is why principle 7 of `CONTRIBUTING.md` states it as a constraint:

> **Jumi must converge back toward one integration step. Any temporary second setup
> requirement must have a deletion path.**

| | what the author writes | what is temporary about it |
| --- | --- | --- |
| **Now** | `plugins: [jumi()]` (or `{'jumi/postcss': {}}`), and nothing in the CSS | `jumi()` composes Tailwind's plugin, so it *replaces* an entry rather than adding one — and it registers Jumi itself, so the CSS directive is gone too. Measured: a build with the directive injected is byte-identical to one where the author wrote `@plugin "jumi"`. |
| **CLI** | the build, then `finalizeCss(css)` | The Tailwind CLI has no hook to finish in. Deletion path: the row below — a Jumi-owned emitter has nowhere it cannot finish. |
| **End** | `plugins: [jumi()]`, with no Tailwind JS plugin composed | Jumi owns the emission (theme, scanning, arbitrary values, variants — the rest of this document's sequence), so composing `@tailwindcss/vite` is no longer needed and finalization becomes an internal phase rather than an external pass. |

The middle two rows are the whole remaining cost: one entry, and it composes somebody else's plugin.
That is a big step down from where this started — the CSS directive is gone, and nothing asks an
author to understand plugin ordering — but it is not one step of Jumi's own, so it stays on this
list until it is.

## Gaps the inventory found

**P0 — the aggregate was published where it cannot resolve, and every harness stayed
green.** The bridge first published the data on `:root`, on the reasoning that
inheritance carries it to any element. It does not: a `var()` chain inside a custom
property resolves where it is *declared*, so at `:root` the declaration computes to the
guaranteed-invalid value, that invalid value inherits, and every carrier resolves
`animation-name: none`. Measured in Chromium on the real compiled corpora:

| build | `.animations animate-rotate-45` | `@apply animations animate-rotate-45` |
| --- | --- | --- |
| `:root` (was shipping) | `none` | `none` |
| `.animations` (the first fix) | `none, none, jumi-rotate-3zWYd, …` | `none` |
| completed into the carriers (now) | `none, none, jumi-rotate-3zWYd, …` | `jumi-rotate-3zWYd` |

The byte snapshot, `incremental:check` and 123 unit tests were all green throughout,
and the docs build emitted `:root{--jumi-aggregate-…}` — because **every harness read
emitted text**. `pnpm behaviour:check` now closes that hole: it compiles both corpora,
loads them in Chromium, and asserts the resolved `animation-name` of real carriers —
direct, descendant, pseudo-element and `@apply`ed — against the slot names in the
emitted CSS. End-to-end, the built `examples/index.html` resolves `animate-wiggle` to
all four of its slots.

**`@apply animations` resolves — it was a publication-site bug, not a platform limit.**
The carrier body is what Tailwind re-parents for a variant and *copies* for `@apply`, so a
rule that names a selector can reach neither the copy nor every prefixed form. The carrier
now marks itself (`--jumi-carrier`), the model publishes the aggregate as staging
(`--jumi-carrier-staging`, on a rule nothing reads), and `finalize` writes it into every
marked rule and deletes the staging. The earlier conclusion — that `@apply` inlines
utilities and never a base rule, so the data cannot arrive — was true of the *bridge*, not
of the platform: the data does not have to arrive through `@apply`, because it is written
afterwards. Recorded in `docs/carrier-locality.md`, asserted by
`scripts/behaviour-check.mjs`, and stated for contributors in principle 6 of
`CONTRIBUTING.md`.

The snapshot corpus keeps an `@apply`ed carrier (`.applied-motion`) so the path stays
measured, and the harness compares the aggregate it ends up with to the aggregate it
shipped.

**A deep import into Tailwind internals — owned.** `flattenColorPalette` came from
`tailwindcss/lib/util/flattenColorPalette`, a private path rather than a public
entry point. It is now `src/helpers/flatten`, with tests, and the emitted CSS is
byte-identical (the snapshot passed with no re-record). Measured while owning it:
`api.theme(key)` returns an **already flat** map in v4.3.3 and every map in
`src/theme/` is flat too, so the helper is a merge plus two compatibility rules —
nest joining and `DEFAULT` naming — that today's corpus does not exercise.

One host behaviour is deliberately *not* replicated: the host helper re-applies
the raw value at any key whose `__CSS_VALUES__` flag lacks bit 4 ("resolved"),
which is how `@theme inline` / `@theme reference` declare themselves. Measured
288/288 colour keys carry the bit for the default `@theme` form, so the branch is
inert for every input Jumi can produce today, and where it would fire it replaces
a flattened scalar with a subtree. **Named risk, revisited when the theme contract
is owned for real.**

## Theme representation — the mapping, measured

Theme **ownership** and theme **representation** are two changes, and the mapping
is proven before anything switches. `pnpm theme:map` prints the current table: it
reads the vocabulary out of `src/`, the tokens out of the shipped `theme.css`, and
counts a mapping only when the token exists *and* carries the same value — then
verifies every claim in `themeTokens` against the utilities Tailwind actually
emits, because neither of those two is the contract on its own.

The rule:

> If a Jumi theme key has a CSS token representation, resolve it to that token. If
> it does not, keep the explicit value supplied by Jumi or the host rather than
> inventing a token namespace.

And the policy for deciding what counts as a representation:

> **Names do not define compatibility. Value-equivalent shipped tokens do.**

No automatic literal fallback. `var(--color-red-500, #ef4444)` looks safe and
creates a second theme source inside Jumi: if a token changes or a user removes it,
Jumi silently serves its own stale idea of the value. A missing token has to be
visibly missing.

One thing worth knowing before reading a batch diff: Jumi names a slot after a hash
of its resolved value, so switching a value from a literal to a token *renames* that
slot's variables and keyframe. The utility and its candidate are unchanged; the
generated names are not.

### The classification, complete: 71 keys, one strategy each

Phase 2 is complete when every theme key Jumi consumes has an **explicit representation strategy** —
not when every value has become a CSS variable. A literal is a valid final representation when that
is what the host emits, so the requirement is that the choice is deliberate and can be justified.
`pnpm theme:map` derives both halves and prints them side by side: the strategy Jumi declares in
`src/helpers/create/theme.ts`, and what the emitted CSS does. It reports any key where the two
disagree, and any key whose namespace candidate could not be measured at all.

| Strategy | Keys | Count |
| --- | --- | --- |
| `token` — every name resolves to a namespace token | `accentColor`, `backgroundColor`, `boxShadowColor`, `caretColor`, `colors`, `letterSpacing`, `outlineColor` | 7 |
| `mixed` — a namespace for some names, literals or arithmetic for the rest | `backdropBlur`, `blur`, `borderColor`, `borderRadius`, `dropShadow`, `lineHeight`, `maxWidth` | 7 |
| `formula` — numeric names are `calc(var(--spacing) * n)` | `flexBasis`, `gap`, `height`, `inset`, `margin`, `maxHeight`, `minHeight`, `minWidth`, `padding`, `translate`, `width` | 11 |
| `literal` — the host emits a literal and Jumi keeps it | `boxShadow`, plus the 45 keys below | 46 |

`boxShadow` is the one literal key with a reason worth naming: `--shadow-*` exists and is spelled
like `--drop-shadow-*`, but `shadow-sm` inlines its value while `drop-shadow-sm` references its
token. The namespace exists, the name exists, the values correspond — and the emitted utility does
not use it. `theme:map` says exactly that, next to `0/71` names referencing the namespace.

The other 45 are literal because no candidate namespace resembles their values at all — the host
emits literals for these too, which is a sufficient reason and the end of the search rather than a
backlog. For the record: `borderWidth`, `outlineOffset`, `transitionDelay`, `backgroundSize`,
`opacity`, `scale`, `objectPosition`, `rotate`, `skew`, `transitionDuration`, `backgroundPosition`,
`backdropBrightness`, `backdropContrast`, `backdropGrayscale`, `backdropHueRotate`,
`backdropInvert`, `backdropOpacity`, `backdropSaturate`, `backdropSepia`, `backgroundImage`,
`brightness`, `contrast`, `grayscale`, `hueRotate`, `invert`, `saturate`, `sepia`, `flex`,
`flexGrow`, `flexShrink`, `gridAutoColumns`, `gridAutoRows`, `gridColumn`, `gridColumnEnd`,
`gridColumnStart`, `gridRow`, `gridRowEnd`, `gridRowStart`, `gridTemplateColumns`,
`gridTemplateRows`, `order`, `outlineWidth`, `strokeWidth`, `transformOrigin`, `zIndex`.

Measured 2026-09-12: **71 keys — 11 formula, 7 mixed, 46 literal, 7 token — no drift, and no
namespace candidate left unmeasured.** One candidate namespace was dropped earlier as a measured
false positive — `--inset-shadow-*` matches three `inset` names by spelling, and is the inset
*shadow* utility's namespace, not `inset`'s.

### Batches

**Batch 1 — landed: the colour family.** `colors`, `backgroundColor`, `borderColor`,
`caretColor`, `accentColor`, `boxShadowColor`, `outlineColor` → `var(--color-*)`,
and `letterSpacing` → `var(--tracking-*)`. Table: `src/helpers/create/theme.ts`.
7 keys, 16 call sites, 2016 values, one named exception: `borderColor.DEFAULT` has
no token (there is no bare `--color`), so it keeps the host's `currentColor` rather
than an invented `--color-DEFAULT`.

Three invariants were checked against the previous snapshot, not asserted:

```text
utilities removed                               0 of 24
previous slot sequence is an in-order
  subsequence of the new one                    yes
declarations that changed value, of the
  45 shared between old and new output          0
```

The headstone is the resolution metric, which is why it exists:

```text
before   colorValues: token 0   literal 6      themeResolution: literal 63
after    colorValues: token 6   literal 1      themeResolution: token 8, literal 57
```

`literal 1` is `borderColor.DEFAULT`, and it cannot be hidden.

**Batch 2 — landed: the spacing formula.** The 13 keys the measurement marks as spacing-backed
(`flexBasis`, `gap`, `height`, `inset`, `lineHeight`, `margin`, `maxHeight`, `maxWidth`, `minHeight`,
`minWidth`, `padding`, `translate`, `width`) now resolve numeric names to `calc(var(--spacing) * n)`,
with `1` emitted as `var(--spacing)` because that is what the host's own output does. `0`, `px`,
`auto`, the fractions and Jumi's own additions keep what the host supplied.

**The written plan was wrong twice, and the measurement is what says so.** `pnpm theme:map` now
prints the implemented set against the measured one and reports drift in either direction:

```text
planned                  outlineOffset, and no lineHeight or maxWidth
measured                 lineHeight and maxWidth carry spacing names; outlineOffset
                         does not — its scale is 1: 1px, 2: 2px, 4: 4px, 8: 8px
```

**And it found an implementation limitation in the host's JS theme.** With `--spacing` overridden
in `@theme`, the host's spacing scales are *unusable*: measured with `--spacing: 0.3rem`,
`api.theme('margin')` returns the characters of the base string — `1: '.'`, `2: '3'`, `4: 'e'` —
because the scale is derived by indexing the base rather than multiplying it. Anything that trusted
those values emitted `margin: 3`.

Whether that is a bug in the host or a limitation of an API that never promised derived spacing
values under an overridden `--spacing`, we do not have to settle: for Jumi the distinction does not
matter, and we have enough evidence not to depend on it. So the batch does not read the JS scale for
these names at all: **the name is the contract**, and a numeric name is the base multiple by
definition. This is the same reason the CSS variable is the right representation — it is the only
one that can follow an override.

The acceptance test is the corpus again, and it is stronger than batch 1's: `input.css` overrides
`--spacing` to `0.3rem`, `fixture.html` carries `animate-padding-4` and `animate-margin-2`, and
`behaviour:check` asserts in a browser that the resolved value is `calc(0.3rem * 4)` — not the
`0.25rem` the host's JS scale would have produced, and not a literal.

```text
before   themeResolution: formula 0, literal 57, token 8
         --jumi-padding-…: 1rem                 (a build-time literal, override ignored)
after    themeResolution: formula 2, literal 59, token 8
         --jumi-padding-…: calc(var(--spacing) * 4)
```

`literal 59` went *up* by two: the two new utilities bring their own non-multiple names (`0`, the
shorthand), which is the batch working as stated rather than a regression.

The acceptance test is in the corpus: `input.css` overrides the theme

```css
@theme {
  --color-brand: oklch(65% 0.2 150);
  --color-red-500: oklch(30% 0.02 250);
}
```

and both are consumed with no JS theme lookup in the path. The host emits
`--color-red-500: oklch(30% 0.02 250)` **because Jumi's generated CSS references
it** — measured: only the 6 referenced `--color-*` tokens are emitted, so pointing
at tokens does not pull in the namespace. That also answers the only real risk in
this design: a tree-shaken token would have resolved to nothing, and with no
fallback the animation would have silently stopped.

Two notes for whoever reviews a batch's diff:

- the corpus grew by 9 utilities, and because the fixture contains `*:animations`
  every added slot costs quadratically in the aggregate — 132 KB → 288 KB, of which
  146 KB is that known case and 3 KB is the batch itself. A corpus without
  `*:animations` would keep the byte metric readable.
- naming is value-derived, so a batch renames variables and keyframes even though
  the utility set and slot order are untouched.

**Batch 3 — landed: the partial namespaces, resolved per value.** Five scales are *partial*: some
names are token-backed, some are spacing arithmetic, and the rest keep what the host supplied. They
now resolve per **name** rather than per key, so one scale can carry all three modes at once:

| Key | Namespace | Token-backed | Stays literal | Spacing formula |
| --- | --- | --- | --- | --- |
| `borderRadius` | `--radius-*` | 8 (`xs sm md lg xl 2xl 3xl 4xl`) | `none`, `full`, `DEFAULT` | — |
| `blur` | `--blur-*` | 7 | `none`, `DEFAULT` | — |
| `dropShadow` | `--drop-shadow-*` | 6 | `none`, `DEFAULT` | — |
| `lineHeight` | `--leading-*` | 5 (`tight snug normal relaxed loose`) | `none` | `3`–`10` (batch 2) |
| `maxWidth` | `--container-*` | 13 | `none full min max fit prose px` | `0`–`96`, `0.5`… (batch 2) |

`backdropBlur` came from the closing sweep rather than from this batch's list: a *separate* key with
its own utility (`backdrop-blur-*`, beside `blur-*`), and it borrows the same `--blur-*` tokens —
measured, not inferred from the name. It is the one thing the sweep found still unclassified, and
adding it is what closed the classification: `backdropBlur` → `--blur-*`, literals `none` and
`DEFAULT`, 7 of 10 names.

`lineHeight` and `maxWidth` are in both tables, and that is the batch's shape: `leading-6` is
`calc(var(--spacing) * 6)` while `leading-tight` is `var(--leading-tight)`, out of one scale. A bare
number is never a namespace name — measured, every numeric name in these scales is either a spacing
multiple or an entry the host itself cannot reach (`rounded-1` emits nothing).

**`boxShadow` is not in the table, and that is the batch's most useful result.** The `--shadow-*`
namespace exists, and it is spelled exactly like `--drop-shadow-*`:

```css
.shadow-sm      { --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), …; }
.drop-shadow-sm { --tw-drop-shadow: drop-shadow(var(--drop-shadow-sm)); }
```

`shadow-sm` inlines its value; `drop-shadow-sm` references its token. The namespace exists, the name
exists and the value matches — and none of the three is the contract. That is why `theme:map` now
checks each name against the emitted utility and not against the theme file:

```text
token claims: 13 keys
  borderRadius        --radius-*: 8 of 18 names, literal 3
  blur                --blur-*: 7 of 10 names, literal 2
  dropShadow          --drop-shadow-*: 6 of 8 names, literal 2
  lineHeight          --leading-*: 5 of 14 names, literal 1
  maxWidth            --container-*: 13 of 50 names, literal 7
  …
no drift: every claim matches the emitted CSS
```

Three rules came out of this, and they are the batch discipline now:

1. For a spacing-derived scale the key *name* is the semantic contract and `--spacing` is its
   representation; `api.theme()` is not trusted to materialise those values.
2. A mapping is verified against emitted v4 CSS, never inferred from a similarly named scale.
3. A partial scale may legitimately mix resolution modes, so resolution has to be per value.

The acceptance test is the corpus, stronger than the last one: `input.css` overrides `--radius-sm`
to `0.9rem`, `fixture.html` carries `animate-border-radius-sm`, and `behaviour:check` asserts in a
browser that the resolved value is `0.9rem`. The utility is emitted as `var(--radius-sm)` either
way — only the override can tell a reference from a literal baked in at build time.

```text
before   themeResolution: formula 2, literal 59, token 8
after    themeResolution: formula 4, literal 71, token 12
         --jumi-border-radius-…: var(--radius-sm)      resolved 0.9rem in a browser
         --jumi-line-height-…:   var(--leading-tight)
         --jumi-line-height-…:   calc(var(--spacing) * 6)
         --jumi-box-shadow-…:    0 1px 3px 0 rgb(0 0 0 / 0.1), …   (not a token)
```

`literal 71` covers the new names that are not tokens, `animate-box-shadow-sm`'s inline shadow among
them; it also counts a *composed* reference like `blur(var(--blur-sm))`, because the resolution
metric only classifies a value that starts with `var(--` as a token. `formula 4` is the pair of
mixed names that proves the per-name resolution in emitted CSS.

Every batch has to hold this invariant, so a snapshot diff stays readable:

```text
same utility set
same candidate behaviour
same slot ordering
only resolved values change — a literal becomes a var(…)
```

## Aggregate representation (active workstream)

Theme migration is measured batch by batch rather than run straight through, and it
gives way to a cost measurement when one lands. The reason is not a change of
direction: rebuilding the examples corpus produced **1.47 MB for 60 slots, 96% of it
repeated bookkeeping**, because the bridge re-publishes the whole list on every
registration. That is `O(n²)`, and it is the normal path rather than an edge case.

### The cost, measured

| Build | Slots | Publications | Aggregate share |
| --- | --- | --- | --- |
| examples (`examples/output.css`) | 60 | 63 | 96% |
| canonical corpus | 24 | 27 | 92% |
| carrier-variant corpus | 18 | 19 | 91% |

An earlier reading of this was wrong and is corrected here: the trigger is **not**
a prefixed carrier form. Publication count tracks *registrations that happen after
the first read of `.animations`*, so any corpus whose tweens register after that
read pays it. Prefixed carriers (`*:animations`, `before:animations`) merely
guarantee an early read; ordinary corpora also publish once per registration.

**The open question is answered, and the answer is "no".** The effects catalogue
published once because its corpus contains *none* of the three things that move the
read earlier — it is 228 plain `animate-*` classes with no variants and no `@apply`,
and its carrier sorts last (`animate-…` < `animations`). Each cause was isolated by
experiment (`node scripts/spike-aggregate-read.mjs`):

| Cause | Evidence |
| --- | --- |
| **`@apply` of the carrier** — compiled while the CSS is parsed, before any scanned candidate | removing one `@apply animations` rule from the canonical corpus: registrations-after-read **56 → 11**, publications **32 → 7** |
| **A prefixed carrier** — `*:animations` sorts before `animate-…` (`*` < `a`), so the read happens on the first candidate | the carrier-variant corpus reads at **0 of 24** |
| **Variant-prefixed utilities** — anything sorting after `animations` that registers a slot republishes | corpora differing only by `hover:` and `motion-safe:` classes: registrations-after-read **0 → 2** |

```
entry                  registrations  publications  slots at first read
canonical fixture                 57            33       0 of 57
carrier variant                   24            19       0 of 24
examples                         139            65       2 of 139
docs effects catalogue           231             1     228 of 231
```

So publish-once is **not reachable by ordering**. `hover:animate-*`,
`motion-safe:animations` and composing a carrier through `@apply` are ordinary
usage, and each forces republication under the current representation. The
favourable timing is a byproduct of a corpus that happens to avoid all three, not a
property Jumi can guarantee. Per the decision rule, that sends us back to the
representation.

**Next: the representation redesign.** `docs/aggregate-representation.md` carries the
design spike: explicit precedence metadata is falsified (position is the only channel,
measured in a browser), and a linked-run representation is proposed that preserves the
current order exactly while publishing O(1) per change.

### What the spike established

1. **The mechanism works.** A custom-property chain
   (`--c7: var(--c6), entry-7`, with the carrier reading a pointer variable) was
   verified in a browser at depth 60: `getComputedStyle` returned the full 60-entry
   `animation-name` list and a parallel 60-entry duration list, and re-declaring one
   link with `none` vacated that position — the O(1) operation `perValue`'s
   move-to-end needs. Emitted size would be linear.
2. **But it cannot reproduce today's order.** A chain is append-only. Reading the
   examples build's own 63 publications: **0 of 58 registrations appended**; every
   one inserted mid-list, because the slot order is a *grouped and sorted view*
   (`values` by attribute, `composed` and `effects` alphabetically), not a
   registration log. `scripts/spike-aggregate-order.mjs` reproduces this.

   Kept as evidence rather than discarded, because it establishes what a replacement
   may assume: chains work at realistic depth, parallel chains stay aligned, a link
   can be vacated in O(1) — and the blocker is ordering semantics, not CSS.

So the quadratic cost is a consequence of the **order contract**, not of the
bridge's bookkeeping. Making publication incremental requires deciding what order
Jumi guarantees — which is why this workstream is named *order and representation*
and why it comes before more theme batches.

### Acceptance criteria

```text
same animation winner semantics
same perValue move-to-end behaviour
same carrier behaviour — direct, descendant, pseudo-element
@apply animations supported — asserted by behaviour:check
incremental:check 6/6
output growth approximately linear in slot count
K = 8: per-carrier restyle within 1.5× of today, total output under 0.5× at 63 publications
```

**How it resolved.** The order contract held (`same animation winner semantics`, same
move-to-end) and the linked representation was falsified on cost, not on correctness: at
`K = 8` per-carrier restyle measured **1.82×** today against a 1.5× bar, and the reason is
structural — a carrier restyles when any link it reads is re-declared, and every link is
re-declared whenever a run is rebuilt. Flat lists hold every criterion that survived, and
their one cost — one publication per registration, with the whole list in each — turned out
to be **build cost that never reaches the file**, once the aggregate is completed into the
carriers after the build. Measured on the frozen corpora: the canonical corpus emits
287,289 bytes of which 259,331 is staging, and ships 66,772; the carrier variant emits
179,618 and ships 90,173. `aggregateShare` no longer says what it used to say — the
remaining copy is one per carrier, which is what a carrier *is* — so the bounded checks are
now *a publication never survives into the output* and *staging is always consumed*.

If a representation cannot hold these, the finding is that precedence itself needs
redesign rather than optimisation.

### The representation: `K = 8`, measured

The K curve is run and the tradeoff is settled — see "Spike 3 — the K curve" in
`docs/aggregate-representation.md` for the full tables. `K` is the entries per link, so it
trades serial depth for rewrite size:

```text
              restyle vs today   total output @63 publications
  K=1               3.37×                 0.046×
  K=4               1.50×                 0.060×   on the bar, no margin
  K=8               1.19×                 0.092×   ← chosen
  K=16              1.06×                 0.159×
  K=32              1.12×                 0.296×
```

The chain is a *serial* dependency, so `K=1` walks 228 links where `K=8` walks 29; that is
the whole of the runtime story. Note that **a single publication does not get smaller**
(209.5 KB against 187.1 KB at `K=8`, because a chain spends a reference per link as well
as the entries) — the win is entirely the append unit, 14.0 KB per mutation against
185.9 KB, which is what compounds over the 27–63 publications these corpora make.

Still open before landing: the implementation itself, and cross-engine depth verification
at `K=8` (Chromium passes; Firefox and WebKit are the gate).

### Implemented: the chain ships, the flat lists are the oracle

> **Paused 2026-09-12.** The carrier-locality P0 (`docs/carrier-locality.md`) shows the
> aggregate is published where a variant cannot carry it: `*:animations` and
> `before:animations` resolve `none`. `K` is not chosen and the representation work stops
> until that is fixed, because fixing it changes both the aggregate's placement and its
> per-element resolution — the two things the numbers below measured.

The model now publishes the chain and keeps each link's identity across passes, so a
mutation re-says one link rather than the whole aggregate. `get animations` still returns
the flat lists — that is the oracle every list assertion is written against, and a test
compares the two after every mutation of a twenty-step sequence. Measured with `K = 8`:

```text
                           before       after    change
 examples   raw         1,539,289     444,030      −71%
 examples   gzip           54 KB       22.5 KB      −58%
 canonical  raw           281,959     164,848      −42%
 docs effects (228 slots) 260,802     205,143      −21%
```

Publications do not become rarer — 63 either way on the examples corpus, because the
trigger is unchanged — they become smaller: one to three links re-said each, never more
than four, against a chain of about twenty. That constant bound is what removes the
quadratic term. The remaining constant (a link is re-said in full as it grows, so filling
one costs `1 + 2 + … + K`) is why the corpora shrink by 3.5× rather than 11×; noted in
`docs/aggregate-representation.md`, not pursued.

### The corpora

`css:check` compiles two frozen corpora:

```text
canonical (fixture.html)   byte-snapshotted: any change at all is a change to decide
variant   (variant.html)   the prefixed carrier forms, held to a shape budget
```

The canonical corpus was *intended* to be the one with a linear, readable byte
metric. It is not: it publishes 27 times for 24 slots. The split is still worth
keeping — one corpus is a byte contract, the other carries the prefixed-carrier
coverage and the cost checks — but the readable-metric goal is unmet until the open
question above is answered.

The variant corpus is checked for shape rather than size, so it tolerates
legitimate corpus growth. These are **safety bounds, not desired performance**:
they stop the cost getting *worse* while the representation workstream is open, and
passing them is not evidence the architecture is acceptable — 91% aggregate
duplication passes a 95% ceiling.

```text
publication does not scale with the slot count    (19 for 18 slots; the target is 1)
repeated bookkeeping stays under 95% of the file  (91%)
```

Once the representation is settled, the target becomes `publication = 1`, or whatever
minimum the architecture can guarantee, and these bounds are replaced by it.

## Sequence

Split by dependency, not by size. The order is deliberate: syntax complexity
last, semantic ownership first.

1. **Finish the semantic core** — everything Jumi means lives in `@/core`:
   carriers, slots, phrases, effects, labels, composition, aggregate, keyframes.
2. **Thin the adapter** until it is only translation: candidate → model →
   registration.
3. **Keep the capability inventory honest** — every new host capability gets a row
   with a classification, in the same change that adds it.
4. **Theme ownership** (done — 2026-09-12). Replace Tailwind-scale lookup with a
   Jumi-owned resolver. Scope is measured rather than assumed: **193 call sites, 71
   distinct keys**. The contract stays `(key, values) => values map`, so no call
   site changes — the work was the 71-key vocabulary and what a resolved value
   *is*. **Done means every one of the 71 keys has an explicit representation
   strategy**, not that every value became a CSS variable: 7 `token`, 7 `mixed`,
   11 `formula`, 46 `literal`, with `pnpm theme:map` reporting no drift and no
   unmeasured namespace candidate. The classification and the batches are in
   "Theme representation" above.
   **Do not reproduce Tailwind theme semantics** — own the finite vocabulary Jumi
   actually consumes and nothing more. Literal is a final answer when the host
   emits a literal.
5. **Flattening ownership** (done — see gaps).
6. **Order and representation** (done — the representation shipped flat; see
   `aggregate-representation.md` for the measurement that rejected the linked one).
   What it settled:

   > If the same logical animation slot is registered multiple times, what
   > ordering rule does Jumi itself guarantee?

   It guarantees the order of the ten flat lists, and nothing about *when* they are
   published: a re-registered slot moves to the end of its group, groups are ordered by
   attribute, and the aggregate is whatever the last publication said. Publication timing
   stopped being a semantic question once the data was completed into the carriers after
   the build.
7. **`@apply`** (done). It did not merely have to keep working: it *materially changes when
   the carrier is evaluated* — compiled while the CSS is parsed, before any scanned
   candidate, and removing one `@apply animations` rule from the canonical corpus took
   publications from 32 to 7. That fact is what the finalizer was built for: `@apply`
   copies the carrier body, marker included, and the aggregate is written into the copy
   after the build, so when the carrier is evaluated stops mattering at all.
8. **Scanning / candidate discovery**, then **arbitrary values** (the phrase
   grammar is currently shaped by the host's value parser), then **variants** last.
   Variants are syntax and expansion complexity; nothing should depend on them being
   Tailwind's.

## Guardrails

- Carrier classes are preserved unless we find a genuinely better place for their
  responsibility. Answer *where does it move?* before proposing otherwise.
- Any new host capability we start relying on gets a row in the inventory above,
  with a classification, in the same change.
