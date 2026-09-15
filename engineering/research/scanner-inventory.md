# Scanner inventory — what discovery owns, measured

Phase 3 asks whether Jumi can find its own candidates. The useful question is not "how do we scan"
but **"if Jumi had the complete set of class-like strings in the user's sources, what information
would still be missing before the model could decide everything it needs?"** That separates
discovery from parsing.

The instrument is `node scripts/spike-candidates.mjs` (`pnpm spike:candidates`): the real CLI, Jumi's
own plugin with every matcher wrapped, and a fixture built as a candidate matrix. It records what
each candidate delivers to a Jumi callback — name, value, modifier, and the rest of the context
object.

## What this inventory concluded: discovery is parked, and why

The first measurement says discovery is _easy_. The rest say it is not _worth_ owning on its own,
because the host hands Jumi far more than presence:

| Concern                               | Cost                       | Value, if owned alone                                                                                     |
| ------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| Discovery (raw candidate strings)     | easy — a substring problem | **low** — it removes no dependency, since every candidate would go straight back to the host to be parsed |
| Candidate parsing, type validation    | meaningful                 | high — this is most of what the host does for Jumi                                                        |
| Ordering / precedence                 | semantic                   | high — the aggregate's order _is_ precedence                                                              |
| Arbitrary values, modifiers, negation | meaningful                 | high — same reason as parsing                                                                             |
| Variants                              | —                          | orthogonal: they are gone before a matcher runs                                                           |

So a Jumi-owned substring scanner that still hands strings to Tailwind for parsing would add a
subsystem without removing a dependency, and would leave Jumi owning discovery while depending on
the host's parser _and_ its ordering. That is the half-migration shape to avoid.

## What a Jumi matcher actually receives

| Candidate in the source                                                  | What Jumi is handed                     | What a raw string would _not_ give it                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `animate-rotate-45`                                                      | `animate-rotate` ← `"45deg"`            | the name → value lookup: `45` resolves through Jumi's own `values` map, which today the host performs                                                                                                                                                                                                                    |
| `animate-rotate-[23deg]`                                                 | `"23deg"`                               | bracket parsing                                                                                                                                                                                                                                                                                                          |
| `animate-rotate-[0.25turn]`                                              | `"0.25turn"`                            | bracket parsing                                                                                                                                                                                                                                                                                                          |
| `animate-rotate-[calc(1deg_+_2deg)]`                                     | `"calc(1deg + 2deg)"`                   | bracket parsing **and** `_` → space                                                                                                                                                                                                                                                                                      |
| `animate-rotate-[var(--spin)]`                                           | `"var(--spin)"`                         | bracket parsing                                                                                                                                                                                                                                                                                                          |
| `animate-width-[3rem]`                                                   | `"3rem"`                                | bracket parsing                                                                                                                                                                                                                                                                                                          |
| `animate-width-abc`                                                      | **nothing at all**                      | type validation — Jumi declares `type: 'length'` and never sees a value that fails it                                                                                                                                                                                                                                    |
| `hover:animate-scale-110`                                                | `animate-scale` ← `"1.1"`               | nothing: the variant is invisible _both_ ways. Measured identical to the bare candidate                                                                                                                                                                                                                                  |
| `*:animate-scale-110`                                                    | same                                    | same                                                                                                                                                                                                                                                                                                                     |
| `motion-reduce:animate-scale-110`                                        | same                                    | same                                                                                                                                                                                                                                                                                                                     |
| `transition-duration-600/rotate`                                         | `"600ms"`, `modifier: "rotate"`         | `/` splitting, plus the same values lookup                                                                                                                                                                                                                                                                               |
| `-animate-bottom-4`                                                      | `"calc(calc(var(--spacing) * 4) * -1)"` | negation, **composed onto Jumi's already-resolved value**                                                                                                                                                                                                                                                                |
| `animate-opacity-50`, twice                                              | **one** call                            | nothing — the host dedupes before matching                                                                                                                                                                                                                                                                               |
| `animate-bounce-in`, twice                                               | one call (`animate` ← `"bounce-in"`)    | nothing — effects are a matcher too, not static CSS                                                                                                                                                                                                                                                                      |
| `animate-` alone — what `animate-${name}` in a template literal scans as | one call (`animate` ← `""`)             | nothing. The empty name arrives as an ordinary value, and a matcher that then looks up a keyframe it does not have for that name takes down the **whole build** — from inside `addUtilities`, with no frame pointing back at the matcher. Guarded in `src/properties/tween.ts`, pinned by `src/properties/tween.test.ts` |
| `animations`                                                             | one call (`animations` ← `""`)          | nothing                                                                                                                                                                                                                                                                                                                  |

The context object carries exactly one key — `{ modifier }`. There is no variant, no source
location, and no original string. 15 calls arrive for 12 distinct utilities.

Two conclusions fall straight out of the table:

1. **Discovery does not need the variant grammar.** `hover:animate-scale-110` contains
   `animate-scale-110` as a substring, and the matcher cannot tell the two apart anyway, so a
   substring scan finds everything a variant-aware one would. What it _cannot_ do without more work
   is the parsing on the right-hand column — but that is the arbitrary-value workstream, not
   discovery.
2. **`type` is doing real filtering today.** `animate-width-abc` produces no call, no warning and no
   output. A Jumi-owned scanner that does not reproduce type validation does not merely scan
   differently — it starts emitting utilities that Tailwind currently refuses.

## Who owns what today

| Concern                 | Today                                                                      | If Jumi discovers candidates      |
| ----------------------- | -------------------------------------------------------------------------- | --------------------------------- |
| which files are scanned | host — `@source`, `source(none)`, globs, ignores                           | Jumi                              |
| candidate extraction    | host scanner                                                               | Jumi                              |
| deduplication           | host (measured above) plus Jumi's own registries                           | unchanged                         |
| ordering                | host — measured: **identical call sequence under reversed document order** | Jumi must reproduce it            |
| variants on a candidate | host, stripped before Jumi sees anything                                   | **not required** for discovery    |
| arbitrary syntax        | host (`[23deg]` → `23deg`, `_` → space)                                    | Jumi, as its own workstream       |
| type validation         | host                                                                       | Jumi                              |
| name → value            | host looks up the map Jumi supplied                                        | Jumi — it owns the vocabulary now |
| negation                | host composes onto Jumi's resolved value                                   | Jumi                              |
| incremental             | host re-scans and re-presents the whole candidate set                      | Jumi                              |

Ordering is the one row that is not merely plumbing. The aggregate's ten flat lists are built in
registration order, and their order **is** precedence: a later slot's longhand wins where two
animations share one. The host decides that order today and does so stably, which is why every
snapshot in this repo can assert a slot sequence at all. A Jumi scanner that finds candidates in a
different order changes animation precedence, not just bytes.

## Ordering: solved for scanner candidates

**The contract:**

> For scanner-discovered candidates, Jumi precedence follows raw candidate byte order before
> parsing.

Ordering is not formatting. The aggregate's ten flat lists are built in registration order, and
their order **is** precedence — a later slot's longhand wins where two animations share one. So the
relation that decides it is a contract, and it turned out to be a cheap one.

**It is a plain lexical sort of the raw candidate strings, made by the scanner before any parsing,
and preserved by the compiler.** Two pieces of the host's source say so, and the spike checks it:

```text
crates/oxide/src/scanner/mod.rs   returns `result.par_sort_unstable()` over the raw candidates
packages/tailwindcss/src/compile.ts
                                  iterates a Map keyed by the raw candidate, so matcher call
                                  order is that sorted list's order
```

```text
call order is the lexical sort of the raw candidates:  yes
reversed document order:                               identical sequence
```

No variant AST, no property order, no internal sort metadata — Jumi can reproduce it from raw
strings alone. One implementation note to keep in view: the host's sort is **byte** order and JS
`sort()` compares UTF-16 code units. Identical for ASCII, which is every candidate in these
corpora, and not identical for a non-ASCII arbitrary value. `candidates.sort()` is fine for today's
candidate space; claiming exact parity means a comparator, not an assumption.

### Two order domains, deliberately not normalized

```text
source
  scanner -> lexical sequence      raw candidate byte order
  @apply  -> authored sequence     the directive's own parameter order

        ↓  parseCandidate(raw)          (order-agnostic: parsing is semantics)

    JumiCandidate
```

`@apply` never goes through the scanner — `apply.ts` splits the directive's parameters — so those
candidates keep declared order. Measured:

```text
@apply animate-opacity-50 animate-scale-110
  -> animate-opacity-0.5 | animate-scale-1.1        (declared order, not sorted)
```

The two are not to be merged: they enter through different mechanisms, Tailwind sequences them
differently, and the `@apply` path is the one where the aggregate is read earliest — which is why
removing a single `@apply animations` rule moved publication counts so much in the aggregate
workstream. Sequencing belongs to the source; **the parser stays order-agnostic** so precedence
concerns cannot leak into it.

## What Jumi has for this now

Nothing. `src/` never touches the filesystem — no glob, no `readdir`, no `readFile` — and the
plugin is handed candidates by the host. Worth recording while it is in view: **`glob@^11` is
declared as a runtime dependency and is used only by `scripts/analyze.js`**, so it belongs in
`devDependencies` whether or not Phase 3 happens.

### 3a — result: the prototype matches the host

`scripts/lib/candidate.mjs` parses a raw candidate into `{ root, value, modifier, negative }`, and
`node scripts/candidate-diff.mjs` (`pnpm candidate:diff`) asks the host for the payload of the same
candidate and compares. The candidate set is every `class` and `@apply` parameter in
`css-snapshot/fixture.html`, `variant.html` and `examples/index.html`, plus the spike's edge cases.

```text
vocabulary: 426 matchers registered by Jumi
candidates: 123 Jumi-relevant, from 349 in the corpora plus 9 edge cases
121/123 payloads identical, 0 real deltas, 2 not modelled (variant validity)
```

The two exceptions are `if-child-is-[h3]:…` and `subsequent-[h2]:…`, and the cause was simpler than
"variant validity": **nobody declared those variants.** They were dead markup in
`examples/index.html`, left over from the abandoned natural-language variant design that
`CONTRIBUTING.md` principle 5 warns against — and they have since been cleaned out of the examples.

The distinction the pair does illustrate is worth keeping anyway:

```text
parse payload semantics      Jumi's, and now proven
≠
decide whether a candidate   the host's, because it depends on which variants exist
is valid at all
```

The vocabulary is the other half of the result: the wrapper records the options Jumi passes to
`matchUtilities`/`matchComponents`, so **426 matchers with their `values`, `type`, `modifiers` and
`supportsNegativeValues` are already available as data**. A parser does not need anything new from
the model.

What the differential test corrected, compared to the plan:

| Assumption                                         | Measured                                                                                                                                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the payload is `{root, value, modifier, negative}` | the observable payload is the **triple**. Negation is _in_ the value (`calc(<value> * -1)`), so the test still covers it                                                                       |
| type validation is a meaningful dependency         | it is much smaller than it looked: **arbitrary values are accepted whatever their shape.** Jumi's tween utilities take _phrases_ — `animate-rotate-[0:0deg                                     | 20:-8deg | 100:-8deg]` — which the host never type-checks. Only *bare* values are gated, and only by inference: a bare number is derived by type (`360`→`360deg`), a bare word is rejected (`animate-width-abc` calls nothing) |
| `modifiers` filters candidates                     | it does not. Measured with all three option shapes — the empty object Jumi passes by default, a property map, and `'any'` — the host accepts the modifier and hands it straight to the matcher |
| a bracketed modifier stays bracketed               | `/[flick]` arrives as `flick`, unwrapped like any arbitrary value                                                                                                                              |
| variants are a prefix to strip                     | stripping is enough to reproduce the _payload_, but not to reproduce _validity_ — an unknown variant rejects the whole candidate before any matcher runs                                       |

One more thing the tables above already said, and this run confirms: **arbitrary values are passed
through unresolved**. `[0:var(--angle)|100:calc(var(--angle)_-_360deg)]` arrives with the `_` decoded
to a space and nothing else touched. Phrase validation is the model's business (3d), not the host's.

### Locked conclusions

- `type` is much less central than the inventory feared — it gates **bare** values only.
- Arbitrary values are a **decoding** problem, not a validation problem.
- `modifiers` is permissive enough that Jumi needs no filter layer; it splits and unwraps, that is all.
- **Variant validity belongs to the variants workstream.** Parsing payload semantics and deciding
  whether a candidate is valid at all are separate concerns, and 3a owns only the first.
- **Phrase semantics stay with Jumi**, which is where they belong: the host passes a phrase through
  untouched, and the model decides whether it is a sequence of frames.

## The sequence, revised

Discovery comes **after** we know what we intend to do with the discovered strings:

```text
Phase 3a  candidate semantics — proven, kept in scripts/ until 3c needs it
Phase 3b  ordering / precedence — closed: scanner byte order; @apply authored order
Phase 3c  discovery — parked pending the dependency gap inventory
Phase 3d  arbitrary values and modifiers cleanup — decoding, phrase validation, bare derivation
Variants  later, and mostly orthogonal to a *matcher payload*; see `engineering/architecture/dependency-gap.md`
```

### 3a is the real question, and it has a definition of done

> Can Jumi parse its own utility candidate from a raw class string into the same semantic input
> Tailwind currently passes to the matcher?

That input is the shape below, and "the same" is checkable rather than a judgement call:

```ts
type JumiCandidate = {
  root: string // `animate-rotate`
  value: string // `45deg` — after the name-to-value lookup
  modifier: string | null
  negative: boolean
}
```

The differential run above is the answer for the corpora, measured against the host rather than
against our reading of it. What remains for 3a is not more parsing: it is that the prototype lives
in `scripts/` and would have to be lifted into `@/core` as the model's own candidate semantics,
with the diff kept as its gate. That is worth doing when 3c needs it — not before, so Jumi ships no
parser it does not yet use.

If it holds across `css-snapshot/fixture.html`, `variant.html`, `examples/` and the docs
catalogue, then discovery (3c) is worth owning, and `@apply` is the second source it has to feed.
Until then the host keeps the scanner — deliberately, not by default.

## Acceptance when discovery (3c) does happen

Not a new scanner API — a comparison against the harnesses that already exist:

1. Wrap the plugin as this spike does, over each real corpus, and record the candidates Jumi's
   matchers are called for.
2. Scan the same sources for class-like strings, and require the Jumi-relevant subset (`animate-*`
   and the carrier `animations`) to match that set **exactly** — no misses, no extras.
3. Require the resulting slot order to equal the host's, byte for byte, in `pnpm css:check`.

Until all three hold, the host keeps the scanner.
