# The phrase-versus-type contract

Found while measuring motion paths (`engineering/research/motion-paths.md`): a phrase is not a CSS value
of any type, Tailwind validates an arbitrary value against the matcher's declared `type` **before** the
matcher runs, so a typed matcher never receives one. The claim Jumi makes — *a phrase is how one property
gets its own frames* — was therefore false for part of the table, and silently so.

Chromium/Node. The instrument is now the gate itself — `pnpm phrase:check`, stage 8 of 16
(`scripts/phrase-check.mjs` + `scripts/phrase-check/probe.mjs`). The spike this grew out of was removed
when the sweep was promoted: one instrument in the gate beats two that can drift apart.

## The measurement that shaped the fix

A **synthetic** plugin (no Jumi import, so a result cannot be a Jumi behaviour in disguise) registers two
handlers under one prefix. Each brands what it emits, so a compiled rule says which handler accepted the
value:

| registered | `[4rem]` | `[50%]` | `[abc]` | `[0:0%\|100:100%]` |
| --- | --- | --- | --- | --- |
| `type: 'length'` only | emits (typed) | refused | refused | **refused** |
| `'length'` then `'any'` + phrase check | emits (typed) | refused | refused | **emits (phrase)** |
| the same two, **reversed** | identical | identical | identical | identical |
| `type: 'any'` only | emits | emits | **emits** ✗ | emits |

Two conclusions, both load-bearing:

1. **Tailwind consults every handler registered for a prefix, per value, and uses the one that accepts
   it** — in either registration order. So a scalar still reaches the typed handler and is still judged by
   the declared type, while a phrase, which no scalar handler will take, reaches a phrase-only handler.
2. **A second handler replaces nothing.** The earlier worry — that two handlers for one prefix is
   undefined behaviour — is answered by the reversed row being identical.

That gives the invariant without giving up validation:

```text
scalar arbitrary value → validated as the property's declared CSS type   (Tailwind, unchanged)
Jumi phrase            → validated by Jumi's phrase grammar              (parsePhrase)
```

Handler-side validation on its own (**shape 4**, `type: 'any'` plus a hand-written scalar check) also
works — measured — but it means reimplementing length/number/angle/colour grammar for 161 matchers.
Interception before the gate (**shape 2**) has no API: `matchUtilities` accepts `type` as
`string | string[]` and nothing else, and a variant callback never sees the utility it wraps — the same
wall the range variant hit. Relaxing the types alone (**shape 3**) makes `[abc]` valid, which is the one
outcome that was ruled out in advance.

## What shipped

`registerPhrases` in `src/helpers/create/index.ts`: for every tween matcher whose declared type does not
include `'any'`, a second handler under the same prefix with `type: 'any'`, no named values, and a wrapper
that declines anything which is not a phrase (`isPhrase`, exported from `@/core`, so both sides agree on
the grammar). Controls are excluded: a duration or an easing is never per-frame, and their types stay as
they were.

No named values on the phrase handler is deliberate: a theme value must keep going to the typed handler,
which is the one that knows the value, and a phrase handler with `values` could be asked for one and
decline it.

## The sweep

The two claims, asked of **every** matcher in `src/properties/tween.ts` whose type lacks `'any'` (the list
is read out of the source, not kept here — a hand-kept list would stop checking the thing it exists for):

| claim | 161 typed matchers |
| --- | --- |
| a valid phrase emits | **0 refused** (was: every `['length', 'percentage']` and `'color'` matcher) |
| an invalid scalar is still refused | **1 exception, and it is Tailwind's**: `animate-font-family-[!]` emits `--jumi-font-family-x: !` from the *typed* handler, because Tailwind's `family-name` grammar accepts it |

Four other facts from the same run, worth keeping:

- **Validation was never uniform.** `animate-padding-[abc]`, `animate-rotate-[abc]`, `animate-opacity-[abc]`
  and `animate-width-[abc]` all *emit* today, because those matchers' type lists contain `'any'` — so the
  inconsistency the fix removes was two-sided: some families refused phrases, others refused nothing.
  Tightening the loose ones is a separate decision, not part of this change, and no page can be relying on
  a phrase that never emitted.
- **A phrase's frame values are not type-checked**, only its shape — `[0:abc|100:def]` is a phrase by the
  grammar and emits. The value is left to the browser, exactly as an arbitrary value is. That boundary is
  deliberate and now documented.
- **An empty rule is a refusal.** Tailwind writes the selector and leaves the body empty when a handler
  declines, so a sweep that counts *rules* reports refused candidates as emitted — which is how
  `animate-font-family` first looked like a leak.
- **A `]` inside a character class closes it.** The class-token reader started as
  `/^\.((?:\\.|[^\s.:#[]>+~])+)/`, whose character class ended at the `]` — matching nothing, and reading
  as "everything is refused". `carriers/animation-range.ts` walks the same token by hand for the same
  reason.

## Promoted to the gate

`pnpm phrase:check` is **stage 8 of 16**. The spike it grew out of is gone: one instrument in the gate
beats two that can drift, and the research narrative lives here. It holds:

| | |
| --- | --- |
| two handlers, one prefix | a synthetic plugin, importing nothing from Jumi, so a result cannot be a Jumi behaviour in disguise |
| registration order is irrelevant | the same pair registered in the other order, asserted equal — the architecture rests on this |
| a scalar keeps the host's check | `[4rem]` → typed handler, `[abc]` → **no rule** |
| a phrase takes the bypass | phrase → phrase handler |
| a named value stays typed | the phrase handler declares no `values`, so it cannot claim one |
| every typed tween matcher | **derived from `src/properties/tween.ts` on each run** — matcher 162 is covered the day it is written, not the day someone updates a count |

Falsified by disabling the phrase route: 161 of 161 refused, 9/11 assertions failed. The failure message
was 200 lines of matcher names, which is a stage nobody reads — it now reports the count and five names.

## Only phrases take the bypass

`isPhrase` is the doorway, so its false positives are pinned in `src/core/index.test.ts` against an
adversarial corpus: scalars (`#123456`, `23deg`, `calc(1px:2px)`), values with colons that are not phrases
(`url(data:image/png;base64,…)`, `color-mix(in srgb, red 50%, blue)`, `50%:0`, `a:b`), partial and
malformed syntax (`:` , `0:`, `|`, `0:50%|`, `0:50%||100:1`), a value with a leading number and no colon,
and — from the other direction — a phrase *inside* a value (`url(0:0%|100:100%)`), which must not make the
value a phrase. Plus the end-to-end version on the real table in the gate: a data URL, a colour function
and a colon-bearing `calc()` all keep the scalar route.

Writing that corpus settled one open question by making it explicit. `1:2%:3` **is** a phrase: the grammar
is `number:value` and the value is left to the browser, exactly as an ordinary arbitrary value is left to
whatever the host type check does not catch. So the asymmetry is deliberate and now documented, rather
than something to fix later:

```text
Tailwind  → validates ordinary candidate/value grammar, as far as its APIs do
Jumi      → validates Jumi phrase structure
browser   → validates the CSS values inside the generated declarations
```

## The loose families — boundary adopted, nothing changed

Jumi **preserves the validation the host provides, and does not claim that Tailwind's matcher types
constitute complete CSS validation.** So `animate-padding-[abc]` staying accepted is not a defect to fix,
and the phrase mechanism fixes a Jumi-specific incompatibility without pretending to normalise the host's
inconsistencies. The count is reported by the stage (`accepted an invalid scalar (host grammar, not
asserted)`) so a change in it is visible without being treated as a failure — and `animate-font-family-[!]`
is on that list because Tailwind's `family-name` grammar accepts `!`.
