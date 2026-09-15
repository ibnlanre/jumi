# Segment easing: a phrase-valued timing control

**Status:** probe complete, design recommended, **not implemented**. The measurements are reproducible with
`pnpm spike:timing-phrase` (the mechanism, simulated by rewriting compiled CSS) and `pnpm spike:segments`
(what CSS itself permits). Nothing in `src/` changes for this document.

## The shape

```html
animate-rotate-[0:0deg|100:45deg]/test              what the property does at each offset
animation-timing-function-[0:ease-out-back]/test    how the motion leaves particular offsets
```

Two orthogonal statements, one grammar: the motion phrase stays strictly `offset:value`, and all easing
stays under `animation-timing-function-*` — scalar for the whole motion, a phrase for the offsets. A
segment phrase maps `offset:easing`, and the easing applies to the segment **after** that offset (measured
in `spike:segments`: the easing belongs to the segment after its frame, never before).

The suffix form `0:0deg~ease-out-back` was proposed first and rejected: it works, but it makes the motion
phrase carry two kinds of information, and it invents a delimiter for a concept that already has a home.

## The finding that sets the implementation shape

**The phrase must not reach the control chain.** Not a preference — measured: with
`animation-timing-function-[0:cubic-bezier(0.34,1.56,0.64,1)]/back` on an element, the motion dies
completely.

```text
animation-name: none        animation-duration: 0s        document.getAnimations().length: 0
```

A phrase is not an `<easing-function>`, so the control's variable resolves to an invalid token sequence and
the composition's whole `animation` shorthand becomes invalid at computed-value time — the same
invalid-at-computed-value-time hazard the carrier's `FALLBACK` table exists to avoid, one declaration
higher up. So a timing phrase cannot be "the same matcher with a different value shape", which is what its
syntax invites. It needs:

1. a **phrase-aware handler** on the timing controls — the same split the motion matchers already use, where
   a phrase is routed to a second handler because Tailwind validates the value type before the first one
   runs — which records the segments in an **inert declaration** (the shape `--jumi-<key>-label` uses) and
   writes nothing into a control variable;
2. finalizer work: read the records, **specialize** each addressed definition, and **select** the
   specialization per element.

`~` never had this problem: it lives inside the motion phrase, which has no variable path to break. That is
the one real advantage it had, and it is not worth the public API.

## The mechanism, and where it must be written

The specialization is two halves, and the second is the architectural one:

| half | what it is | where it lives |
| --- | --- | --- |
| **content** | the addressed definition cloned with `animation-timing-function: <literal>` added to the named frames, named by `hash(definition + segment map)` | global — a keyframe is shared exactly when the declaration is |
| **selection** | a write of the clone's name into the activation variable the composition resolves | the **timing candidate's own rule** |

Measured on a structural address (`animation-timing-function-[0:step-start]/rotate`), both placements:

```text
written in the control's rule   element with the control → 90      element without → 86.441  (unaffected)
written in the motion's rule    element with the control → 90      element without → 90      ← LEAKED
```

A definition is shared text, so writing the selection where the *motion* is declared gives the
specialization to every element that animates that motion. Writing it where the *control* is declared is
what keeps it element-local — and it is what lets two instances of one definition hold different segment
easings, since each writes the same variable from its own rule and an element matches only one of them.

## The probes the CTO asked for

| # | probe | measurement |
| --- | --- | --- |
| 1 | two identical motions, different segment easings | `/enter` (0:step-start) → `1` throughout; `/exit` (0:linear) → `0.25, 0.75`; a third instance with no timing phrase → `0.409, 0.96` (the substrate's own easing, untouched). Two specialized definitions, not one: `…-seg-1uqle` and `…-seg-lcrog` |
| 2 | identical segment easings — deduplicate? | same name on both (`…-seg-1uqle`), **one** clone emitted, sheet holds base + one clone. Deduplication is not a special case: identity is the declaration's text |
| 3 | named and structural addresses | both work; the named form addresses its own instance, `/rotate` addresses every rotate motion on the element the control reaches. The leak table above is this probe |
| 4 | the scalar slot easing as fallback | frames `0:0\|50:1\|100:0`, phrase claims `0%` only, scalar `/mixed` is `linear` → `250ms → 1` (the phrase's step-start), `750ms → 0.5` (the scalar's linear). The scalar control keeps everything the phrase did not claim |
| 5 | arbitrary `cubic-bezier()`, `steps()`, `linear()` | `cubic-bezier(0.34,1.56,0.64,1)` → `48.82, 81.629, **105.965**` — overshoot past a `100deg` target; `steps(4,end)` → `0, 25, 75` — plateaus. Both survive the phrase grammar and land as literals in the keyframe |
| 6 | unaddressed — implementable without element-local knowledge? | **Yes, contrary to the suspicion.** The control's own rule rewrites every definition's activation, so the specialization reaches exactly the elements that wrote the control, and only those. Cost is the sheet's definition count, not the element's |
| 7 | size and keyframe count | 36 candidates / 19 definitions / 46,086 bytes: **addressed** `/reveal` → +257 bytes, 1 clone, 1 declaration. **Unaddressed** → +4,844 bytes (+10.5%), 19 clones, 19 declarations in one rule |

Probe 6's alternative — refusing the unaddressed form — also has a reason, and it is arithmetic rather than
correctness: the unaddressed cost is **multiplicative**. Each distinct unaddressed phrase needs its own
clone of every definition (`19 × 2 = 38` clones for two of them), while the addressed form is linear in the
definitions actually named. Unaddressed is therefore *allowed but expensive*, and its recommendation is a
question rather than a blocker.

## Separate bug this probe found

Writing a phrase into a timing control **kills the motion silently** today — no rule is invalid, nothing
warns, the page simply stops animating. That is provable from the value's shape alone (a phrase is never a
valid easing function), so it fits the standing warning policy: impossibility that can be shown without
element context. Worth a warning whether or not the feature ships, because the destructive spelling is
exactly what the proposed syntax will teach people to type.

## `~` against this, on public API coherence

| | suffix `~` | phrase-valued control |
| --- | --- | --- |
| motion phrase means | `offset:value` **plus** a second kind of fact | `offset:value`, unchanged |
| where easing lives | a new delimiter, nowhere else used | `animation-timing-function-*`, where all easing already lives |
| discovery | a reader must learn a delimiter introduced for this | a reader who knows `animation-timing-function-ease-out/test` guesses `[0:…]/test` correctly |
| unaddressed form | `0:0deg~ease-out-back` is inherently per-motion | `animation-timing-function-[0:…]` is a question with a cost, not a syntax error |
| implementation | parser + keyframe emission, nothing else | a handler, a record, specialization, per-element selection, plus a cascade placement decision |
| failure mode if the phrase reaches the control chain | cannot happen | kills the animation (measured) — needs the handler, not discipline |

`~` is smaller to build. The control form is the better language, at the cost of a real mechanism.

## What implementing it would take

1. **A phrase-aware handler** on `animation-timing-function-*`, routed the way motion phrases already are,
   recording the segment map in an inert declaration keyed by the address. The phrase never becomes a
   control value.
2. **A warning** for the destructive spelling above, and (per the policy) for an unaddressed segment phrase
   if that form is refused.
3. **Finalizer specialization** — clone the addressed definition with the resolved literals, name it by
   content, and select it in the control's own rule. The selection must beat the motion utility's own
   activation declaration deterministically: the composition's placement (last in the utilities layer) is
   the obvious home, and it needs its own measurement before it is settled.
4. **Documented limitation.** Two instances of *one definition* addressed by two different segment phrases
   on *one element* write the same activation variable, so the cascade picks one. That is find2's shape
   (contradictory controls for one address) — not statically provable at stylesheet level, so it belongs to
   Studio, not to a build warning.

## Recommendation

Adopt the phrase-valued `animation-timing-function-*` control, with `offset:easing` where the easing
governs the segment after its frame, resolving easing words through the vocabulary the controls already
use and passing arbitrary easing functions through as literals. The probes say the design holds on every
axis the CTO asked about: instances stay independent, identical declarations deduplicate, the scalar
control remains the fallback, structural and named addresses both work, arbitrary functions survive, and the
specialization stays element-local provided it is written in the control's rule.

Two things to rule on rather than implement by default:

- **the unaddressed form** — allowed at ~10% sheet growth and 19 clones on a 19-definition sheet, with a
  cost that multiplies per distinct unaddressed phrase, or refused in favour of `/name` or `/{property}`;
- **the cascade placement** of the selection declaration, which is the one piece of this design that still
  needs a measurement of its own.
