# Segment easing: a proposal, measured and not built

**Status:** proposal — awaiting a ruling. Nothing in `src/` changes for this document; the measurements
are reproducible with `pnpm spike:segments` (`scripts/spike-segment-easing.mjs`).

## The distinction

The CTO's model, which the measurements below support:

```text
slot easing      →  variable-driven, addressable, one easing for the whole animation
segment easing   →  keyframe-local, literal, part of the motion definition
```

Slot easing is shipped and addressable: `animation-timing-function-ease-out`,
`…-ease-out/rotate` (a property scope) and `…-ease-out/flick` (a name) all resolve to
`--jumi-<token>-animation-timing-function`, which the composition reads per position.

Segment easing is the missing half: one easing per segment, which is how a motion eases "out" into a
rest and "in" to a turn without becoming two animations. Today the docs teach the workaround — two
animations summed by `animation-composition: add`, each with one moving segment
(`docs/src/pages/docs/controls.md`) — which is correct and expensive.

## Why it can only be keyframe-local

Not a stylistic choice. Measured (`spike:segments` case 3), a `var()` inside a keyframe's
`animation-timing-function` is **dropped**: the segment falls back to the animation-level easing.

```text
50% { animation-timing-function: var(--segment-ease) }   with --segment-ease: step-start
  at 75% → 0.5 (linear, the animation-level easing) — not 0, which step-start would give
```

So segment easing cannot be variable-driven and cannot be addressed by a control: it is part of the
motion's definition, in the same sense its frames are. That has three consequences the model already
knows how to handle:

1. It belongs in the **phrase**, which is the syntax for a value that declares its own keyframe.
2. It is part of the phrase's **identity** — `phraseKey(frames)` is the frames' text — so two phrases
   differing only in easing are two keyframes, correctly and for free.
3. Nothing in the aggregate changes, no new control, and no new entry in `slotParts`: a control keeps
   meaning the whole animation, and the phrase keeps meaning the definition.

## What is measured

| # | question | measurement | what it decides |
| --- | --- | --- | --- |
| 1 | does a frame's easing govern its segment only? | `linear` animation-level, `step-start` on the 50% frame → 25% is `0.5`, 75% is `0` | per-segment easing is expressible, and does not rewrite the whole motion |
| 2 | does it compose with a **variable-driven** slot easing? | animation-level `var(--slot-ease)` = `step-end`, frame `step-start` → 75% is `0` | slot easing stays the default for unclaimed segments; the two do not compete |
| 3 | can it be a variable? | the case above, written as a variable → 75% is `0.5` | **no** — the declaration is dropped; keyframe-local is forced |
| 4 | can a segment overshoot? | `ease-out-back` on the 0→100 segment → 75% is `105.965px` against a `100px` target | the thing one-easing-per-animation cannot do: eased rest, overshoot, settle |
| 5 | does a separator survive a candidate? | `~`, `@`, `^` and `:` in `animate-rotate-[0:0deg<sep>ease-out-back\|100:45deg]` — all four emitted | carriage does not choose the syntax; ambiguity does |
| 6 | what does the **last declared** frame's easing govern? | frames at 0% and 80%, easing on the 80% frame → value held at `0` from 800 ms (see below) | the phrase's implicit final segment is a segment, and can be eased |
| 7 | does it ever apply *backwards*? | the same easing on the 50% frame vs the 100% frame → `0` vs `0.5` | the easing belongs to the segment **after** its frame |

Case 6's shape is worth stating, because it is also an independent confirmation of a documented promise:
with frames at `0%` and `80%` and no `100%` frame, the value runs `12.5 … 100` by 800 ms and then
**returns** to the resting value (`75, 50, 25, 5`) as the implicit final keyframe takes over — exactly what
`controls.md` means by "a phrase holds still until its first frame and closes itself at the end". The last
*declared* frame is therefore not the last *keyframe*: an easing written there governs that closing
segment, and only an explicitly written `100%` frame has no segment after it (case 7).

## The syntax candidates

The frame grammar is `offset:value`, frames joined by `|`, offsets in a frame split by `,`. So the easing
needs a separator that cannot be confused with any of those, and that survives a candidate.

| candidate | example | reading | verdict |
| --- | --- | --- | --- |
| suffix `~` | `0:0deg~ease-out-back\|100:45deg` | the segment from this frame eases like this | **recommended** |
| suffix `@` / `^` | `0:0deg@ease-out-back` | same, no resonance | usable, worse to read |
| second `:` | `0:0deg:ease-out-back` | reads well, and collides | **rejected** |
| leading token | `0:ease-out-back 0deg` | mirrors a keyframe block | **rejected** |
| brackets | `0:[ease-out-back]0deg` | Tailwind's own delimiter | **rejected, unverified** |

- **`:` is rejected by a real value.** Values carry colons, and the frame grammar already says
  "everything after the first colon is the value" — measured, `animate-background-image-[0:url(a:b)|100:url(c:d)]`
  compiles today and its frames' values are `url(a:b)` and `url(c:d)`. A second colon makes every such frame
  ambiguous between a value and a value-plus-easing, so the parser would have to guess inside the value.
- **A leading token is rejected because it makes the parse value-dependent.** It reads well
  (`0:ease-out-back 0deg`), but it has to consult the vocabulary to find where the value *begins*, and a
  frame whose value merely starts with an easing word changes meaning without changing text: measured,
  `animate-filter-[0:linear|100:blur(4px)]` compiles today. That particular value is not valid CSS — no
  valid value of a property Jumi animates begins with an easing keyword, so this costs less than it first
  looks — but a delimiter should not need to look inside the value to know where it ends.
- **Brackets are rejected as unverified.** They are the arbitrary-value delimiters Tailwind has already
  stripped by the time Jumi sees the value, `_` means a space inside them, and nothing has measured how a
  nested pair survives. The syntax should not rest on an unmeasured parse.
- **`~` is recommended** because it is absent from CSS values in practice (it lives in selectors),
  needs no lookup to disambiguate, and reads in the right direction: it annotates the frame whose segment
  *follows* it. Collision risk is a value that literally contains a top-level `~`, which no CSS value
  does — and the parse stays total either way: a phrase with two top-level `~` is not a phrase rather
  than a guess.

Vocabulary: an easing word should resolve through the map the controls already use
(`@/theme/animation-timing-function`), so `ease-out-back` means the same `cubic-bezier` in a phrase as in
a control, and an arbitrary `cubic-bezier(…)`, `steps(…)` or `linear(…)` passes through unresolved.

## What implementing it would take

Three small edits and no new concept:

1. `parsePhrase` — a frame's content splits on its first top-level `~`; the left side is the value, the
   right the easing (resolved through the easing map, or passed through if it is a function).
2. `phraseKey` — include the easing, so identity follows the definition. Nothing else changes: frames are
   already the identity.
3. `phraseKeyframe` — emit `animation-timing-function` as a **literal** on that frame's step, beside the
   property. A `var()` there would be dropped (case 3), so it must be resolved at emission.

Plus documentation of the two rules the measurements establish: the easing governs the segment **after**
its frame, and the last declared frame's easing governs the phrase's closing segment.

Cost: one declaration per eased frame. Resolved literals are the price of keyframe-local easing — a theme
name is ~14 characters and its `cubic-bezier` is ~40 — and it is paid only on frames that ask for one.
Nothing appears in the aggregate.

## What this does not propose

- **No control, and no address.** Impossible rather than undesirable (case 3), and it would put a
  definition-level fact into the address space the instance work just settled.
- **No second API.** `stops` and `aliases` were removed for sharing keyframes the phrase grammar now owns
  privately; segment easing is the same kind of decision and belongs in the same grammar.
- **No change to slot easing.** It stays variable-driven and addressable, and case 2 measures that the two
  compose rather than compete: a frame claims its segment, the slot's control governs the rest.

## Recommendation

Adopt the suffix form in the phrase, with the easing vocabulary the controls already use, and resolve it
to a literal at emission. The three measurements that make it safe are: a frame's easing governs only the
segment after it (1, 7), it leaves the variable-driven slot easing in charge everywhere else (2), and the
closing segment of a phrase that stops short of `100%` is a real segment an easing can govern (6) — with
the one constraint that no part of it can be a variable (3).

Not implemented, pending the ruling.
