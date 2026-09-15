# Style cost: what the aggregate costs the tooling

*RESEARCH — measured, and concluded. The representation below is recommended for adoption and the
release criteria change with it; the production change itself is a separate step and is not made
here.*

The page renders 228 effects at 60fps and Chrome DevTools freezes on the same page. Those are two
different workloads against the same stylesheet, and the previous investigation
(`engineering/architecture/aggregate-representation.md`) measured only the first one. This measures
the second, by asking the protocol instead of watching the Inspector.

The question, in the CTO's terms: is DevTools choking on the C2 selector set, the matched declaration
payload, the computed full-slot vectors, custom-property enumeration, or some combination — and does
the previously rejected hoisted representation fix it.

Three confirmations followed the first measurement, and they are what turned it into a decision: the
representation is **also 60% faster to recalculate**, the one semantic unknown it carried is
**closed and passing**, and the freeze is **confirmed by hand in the real Inspector at 20 s → 2.5 s**.

Everything below is Chromium 153.0.8010.12, 2026-09-13, medians of 15 CDP round trips after a
warm-up, against the real emission built by `compiler()` + `build()` at six slot counts.

## Summary

**B dominates, and by an order of magnitude more than the others combined.**

For one selected animated element at 228 slots, `CSS.getMatchedStylesForNode` returns **863,189
bytes**. The composition rule's own text is 177,882 bytes, so the protocol pays **4.9×** what the
stylesheet says. Where those bytes go:

| | bytes | share |
| --- | --- | --- |
| `matchedCSSRules` → `rule.style` (the declaration payload) | 704,988 | 81.7% |
| `matchedCSSRules` → `selectorList` metadata | 121,808 | 14.1% |
| `pseudoElements` + `inherited` | 33,130 | 3.8% |
| everything else | ~3,300 | 0.4% |

and inside `rule.style`, the declaration body is paid for **three times** — as each property's
`value`, again as each property's `text`, and a third time as the rule's `cssText`:

| | bytes | share |
| --- | --- | --- |
| `cssProperties` name + value | 346,849 | 40.2% |
| per-property overhead (`text` duplicate + `range`) | 183,088 | 21.2% |
| `cssText` (the whole body again) | 173,581 | 20.1% |
| `style` metadata | ~1,500 | 0.2% |

The computed-style response is not a factor: **39,173 bytes, of which 16,830 over an inert element**
(22,343 bytes), for 228 positions. Custom-property enumeration is not a factor: **3,322 bytes**, 0.4%.

So: **B ≫ A > C ≫ D**, with C and D together under 5%.

**Confirmed in the real Inspector, by hand, 2026-09-13.** Selecting the same element in the Elements
panel, time for the Styles pane to populate:

```text
current emission      20 s+
shallow-shorthand      2.54 s
```

That is the measurement this harness could not make for itself, and it makes the attribution causal
rather than correlational: the two pages carry the **identical** 231-selector list on two rules and
are within 3% of each other on disk, so a selector-driven freeze would have shown no difference.
Only the declaration payload changed, and the stall moved from 20 s to 2.5 s.

**And the fix is the representation the earlier investigation rejected — for a reason that no longer
applies.** Hoisting the per-position chains off the aggregate and onto the activator that owns the
slot, so the aggregate carries one *shallow* reference per position instead of ten nested chains,
takes the same 228-slot response from **863,189 → 339,774 bytes (−61%)** and **20.2 → 14.2 ms
(−30%)**, with the three live positions resolving **identically to the current emission**. The
earlier verdict measured runtime recalc (439 → 356 ms, −19%) and rejected it as not transformative.
The tooling payload is a 61% cut. Those are different numbers about the same change.

**The element-local-list dream is falsified, not merely doubted.** Every modern primitive that could
plausibly assemble a list from independent utilities was checked in a browser: `@function` (present,
verified), `if()` (present, verified), registered `<custom-ident>#` syntax (present, verified), style
queries (present, verified). **All four select a whole value; none accumulates.** The obstacle is not
concatenation — it is *counting*, and CSS has no primitive that counts anything but DOM siblings.

## Method, and what it does not measure

`CSS.getMatchedStylesForNode` is what DevTools calls when you select an element; the frontend then
parses the response and builds a DOM out of it. This measures the first half.

- **Bytes are the primary metric.** They are what the frontend has to receive, parse and render, and
  they are deterministic. The freeze is in the frontend process, which this harness cannot observe —
  so it was measured by hand, in step four below, and the two agree.
- **Latency is secondary**, and includes the Playwright-side JSON round trip. It is reported because
  it moves in the same direction as bytes, not as a rendering-time claim.
- The renderer's *recalc* cost is a different workload and is measured separately, in step one — the
  earlier verdict in `engineering/architecture/aggregate-representation.md` stands for the shape it
  measured, which is not the shape under consideration here.

## The sweep

One animated element carrying three activating utilities; the stylesheet registers N slots. The
instrument builds N distinct slots with `animate-rotate-[{i}deg]`.

`CSS.getMatchedStylesForNode`, bytes and median ms:

| slots | aggregate entries | jumi | shallow-shorthand | native | inert |
| --- | --- | --- | --- | --- | --- |
| 10 | 13 | 108,709 / 4.3 | 85,196 / 4.0 | 47,474 / 3.2 | 45,013 / 2.9 |
| 25 | 28 | 160,758 / 5.4 | 102,682 / 4.8 | 47,501 / 3.5 | 45,013 / 3.4 |
| 50 | 52 | 244,432 / 6.8 | 131,102 / 5.9 | 47,680 / 3.8 | 45,013 / 3.9 |
| 100 | 102 | 417,757 / 10.0 | 189,274 / 8.2 | 47,680 / 5.1 | 45,013 / 4.9 |
| 150 | 152 | 591,816 / 13.9 | 248,202 / 10.2 | 47,680 / 6.3 | 45,013 / 5.9 |
| 228 | 230 | **863,189 / 20.2** | **339,774 / 14.2** | 47,680 / 8.1 | 45,013 / 7.9 |

Growth is linear at roughly **3.7 KB per aggregate position** — and note the shape of it. The
`inert` column is flat at 45 KB: that is the floor for selecting *any* element on a page with this
stylesheet. The variable part is entirely the composition rule.

The CTO's estimate — `7.6 KB × 228 / 9 ≈ 193 KB` for one composition declaration block — is close
for the rule text: measured **177,882 bytes**. The gap the estimate did not anticipate is the
serialization multiplier: **863 KB on the wire.**

## The controls

Each removes one part so the others can be attributed.

| variant | what it removes | bytes | ms | declaration text | selector text | `selectorList` metadata |
| --- | --- | --- | --- | --- | --- | --- |
| jumi | — | 863,189 | 20.2 | 346,849 | 13,146 | 121,808 |
| no-declarations | the ten aggregate longhands | 175,769 | 10.2 | 4,029 | 13,146 | 121,808 |
| small-selectors | the giant selector lists | 749,331 | 17.0 | 346,849 | 490 | 7,962 |
| native | the aggregate entirely | 47,680 | 8.1 | 1,142 | 428 | 7,031 |
| inert | the selection's target | 45,013 | 7.9 | — | — | — |

Reading them:

- **B is the answer.** Removing the declaration payload removes **687,420 bytes, 80%** of the
  response, and drops the element's animation to nothing (`no-declarations` resolves 0 positions —
  it is a payload control, not a candidate).
- **A is real but secondary: 13%.** `small-selectors` is worth having only if B is fixed first, and
  it is not free — the giant selector list is emitted on **two** rules, the substrate and the
  aggregate. Collapsing only the composition rule measures 6% and understates the selector's share,
  which is what the first version of this control did.

  Note the ratio that makes this worth a sentence: the selector *text* is 13 KB, but its
  `selectorList` metadata is **122 KB** — 9× the text, because each of the 462 selectors carries a
  `range` and a `specificity` alongside its text.
- **C is not a factor.** The computed-style response is 39,173 bytes for 228 positions against an
  inert element's 22,343, and `animation-name` itself is 1,413 characters. Removing the aggregate
  drops it to 24,233 — a 15 KB swing against the matched response's 687 KB.
- **D is not a factor.** Custom-property declarations in the matched response total 3,322 bytes.
- **The floor is 45 KB.** Selecting any element costs 45 KB before the composition is considered,
  which is why the useful numbers are all deltas.

## The representation

The hoisted shape moves each position's chains off the aggregate and onto the activator that owns
the slot. An element that activates three slots declares three chains; the other 227 references
resolve to a fallback. Built by transforming the real emission, not hand-written:

```css
/* the activator that owns the slot */
.animate-rotate-45 { --jumi-slot-44: var(--jumi-rotate-45-animation-name, …) var(…) …; }

/* the aggregate: one shallow reference per position, not ten nested chains */
.activators… {
  animation: var(--jumi-slot-44, none), var(--jumi-slot-45, none), …;
  animation-composition: …;   /* the shorthand resets these two and cannot set them */
  animation-timeline: …;
}
```

At 228 slots:

| variant | bytes | ms | declaration text | `rule.style` |
| --- | --- | --- | --- | --- |
| jumi | 863,189 | 20.2 | 346,849 | 704,988 |
| **shallow-shorthand** | **339,774 (−61%)** | **14.2 (−30%)** | 82,313 | 181,573 |
| shallow-longhand | 644,723 (−25%) | 28.2 (+40%) | 232,637 | 481,802 |
| **shallow+small-selectors** | **230,584 (−73%)** | **11.3** | 82,313 | 181,567 |

**Behaviour is preserved where it is observable.** The parity check reads the resolved value of every
position whose `animation-name` is not `none` and compares it against the current emission:

```text
jumi              identical to jumi
shallow-shorthand identical to jumi     (name, duration, timing-function, fill-mode)
shallow-longhand  identical to jumi
small-selectors   identical to jumi
no-declarations   DIFFERS — []          (the payload control; nothing animates)
native            DIFFERS — its own three literal animations, as intended
```

### The divergence, measured rather than inherited

The earlier investigation rejected hoisting partly because a control shared across positions stops
reaching the inactive ones. That is reproduced here, and it is a real computed-style difference:

| variant | distinct `animation-duration` values across all 230 positions |
| --- | --- |
| jumi | `["1s"]` |
| shallow-shorthand | `["auto", "1s"]` |
| shallow-longhand | `["0s", "1s"]` |
| small-selectors | `["1s"]` |

In the current emission every position reads the shared attribute-scoped control, so all 230 carry
the same duration. Hoisted, only the activated position does; the other 227 fall back to a literal
and take the property's initial value. **This is harmless only because an inactive position's
`animation-name` is `none`** — nothing reads its duration. It is a semantic fork, not a transparent
optimisation, exactly as recorded before, and it is the price of the 61%.

### The trap that cost a run

The first `shallow-longhand` build used `none` as the fallback for all ten longhands. `none` is a
keyword for `animation-name` and *invalid* for `animation-duration`, so the substitution made the
whole declaration invalid at computed-value time and **every** position lost its duration — including
the live one. The parity check caught it as `DIFFERS` on all three live positions, with the names and
fill-modes correct and the durations absent.

Any longhand-shaped hoist needs a per-part fallback (`0s`, `linear`, `1`, `running`, `auto`, …). The
shorthand shape does not have this problem, because a missing item resolves to the whole shorthand
value `none`, which is valid. That is one reason to prefer the shorthand; the other is that it is the
shape that produces the 61% — the longhand hoist only reaches −25% and is *slower* than what it
replaces (28.2 ms against 20.2 ms, despite being smaller).

## Step one: recalc, re-priced for the exact shape

The earlier investigation rejected hoisting on the renderer's cost — 439 → 356 ms, −19%, "not
transformative". That number was for a hoisted *longhand* shape. The shape under consideration is a
different one, so the grid was re-run with **both** hoists present, over six slot counts and four
animated element counts (`pnpm spike:recalc`).

`RecalcStyleDuration` per control change, 1,000 animated elements, against an inert page of the same
DOM shape:

| slots | jumi | hoisted longhand | shallow-shorthand | inert | shallow saves |
| --- | --- | --- | --- | --- | --- |
| 10 | 90.2 | 87.2 | 56.3 | 0.4 | 38% |
| 25 | 146.8 | 136.4 | 84.7 | 0.4 | 42% |
| 50 | 251.8 | 216.4 | 119.8 | 0.4 | 52% |
| 100 | 454.2 | 391.0 | 200.7 | 0.4 | 56% |
| 150 | 662.9 | 537.8 | 271.2 | 0.4 | 59% |
| 228 | 975.8 | 825.8 | 392.2 | 0.4 | 60% |

Two things to read here.

**The old number is reproduced.** The longhand shape measures −15% at 228 slots against the −19%
recorded before. The prior verdict was correct about the prototype it measured; it was the
generalisation that was wrong.

**The shorthand shape is a different order of improvement — −60%, and better at every cell.** The
reason is not depth, it is *count*. The longhand hoist keeps ten N-position lists and only makes each
position cheaper to resolve, which is worth ~15%. The shorthand collapses ten N-position lists into
one plus the two the shorthand cannot carry, so an element resolves **3N positions instead of 10N**.
That is precisely the lever the earlier document named — "reducing the number of positions an element
resolves" — reached without changing what a slot universe is. The saving grows with slot count for
the same reason, which is why it is 38% at 10 slots and 60% at 228.

Wall clock agrees with the renderer's counters throughout (392.2 against 392.8 ms at the largest
cell), so the counters are not measuring work the user would not feel.

## Step two: the label-scoped control, closed

The one semantic unknown the earlier investigation left open was the collision between a hoisted
chain and a *label-scoped* control. Such a control writes `--jumi-<label>-<part>`, which is the
namespace a hoisted slot value has to coexist with, and the earlier fixture activated a slot whose
control never reached it — so it settled nothing in either direction.

The fixture now makes the control reach the slot on purpose, and asserts that it did, so a fixture
that stops reaching it fails loudly instead of passing quietly:

```html
class="animate-rotate-[0:0deg|20:-8deg|100:-8deg]/[flick]
       animation-duration-500/[flick]
       animation-timing-function-linear/[flick]
       animate-scale-110
       animation-delay-150/scale"
```

Measured on the element: the label marker `--jumi-rotate-Z2excak-label` and the control variable are both
present, the slot's duration chain reads the label first —
`var(--jumi-flick-animation-duration, var(--jumi-rotate-animation-duration, …))` — and the position
resolves `animation-duration: 0.5s`. The control is delivered. The label's own variable is
`--jumi-label-flick-animation-duration` since the namespace split, which does not change the order or the
measurement (`engineering/research/addressing-instances.md`).

**All ten longhands are identical** between the current emission and shallow-shorthand, on that
position and on every live position:

```text
animation-composition   replace             animation-iteration-count  1
animation-delay         0s                  animation-name             jumi-rotate-Z2excak
animation-direction     normal              animation-play-state       running
animation-duration      0.5s                animation-timeline         auto
animation-fill-mode     forwards            animation-timing-function  linear
```

There is no collision, because the label link lives *inside* the hoisted slot value — exactly where
it lived before. The unknown is closed, and it passes.

## Step three: both levers together

The selector share was 14% of an 863 KB response. After the hoist, the same 122 KB of selector
metadata is **36%** of what is left, so the two had to be priced together rather than added.

At 228 slots:

| variant | bytes | ms | `rule.style` | `selectorList` |
| --- | --- | --- | --- | --- |
| jumi | 867,857 | 20.2 | 704,982 | 121,808 |
| small-selectors | 749,291 (−14%) | 17.1 | 704,982 | 7,962 |
| shallow-shorthand | 339,734 (−61%) | 14.0 | 181,567 | 121,808 |
| **shallow+small-selectors** | **230,584 (−73%)** | **11.3** | 181,567 | 7,962 |

Stacking the selector reduction on the hoist is worth a further **32%** of the remaining payload, and
it stays parity-identical to the current emission on live positions. Selector metadata goes from 36%
of the hoisted response to 3.5% of the combined one — so the reduction that was worth 14% before the
hoist is worth a third of what is left after it.

## Step four: the real Inspector

Everything above measures the protocol. Whether Inspector stalls is a property of the DevTools
frontend process, which nothing in this repository can observe — so the two representations are
served rather than asserted, and the check is a page and a clock:

```bash
pnpm spike:cdp-cost --serve=jumi                  --port=8789 228
pnpm spike:cdp-cost --serve=shallow-shorthand     --port=8788 228
pnpm spike:cdp-cost --serve=shallow+small-selectors --port=8790 228
```

Each serves 228 animating elements plus the inspection target. Measured by hand in Chromium, timing
the Styles pane after selecting the same element:

```text
current emission      20 s+
shallow-shorthand      2.54 s
```

**Step four passes.** Two things it also establishes:

- **The fix is not complete.** 2.5 s is still a bad Inspector experience, which is the argument for
  step three — the combined variant is served on `:8790` so it can be timed the same way rather than
  argued for from bytes.
- **The file size was never the signal.** The two sheets differ by 3% (263,872 against 273,124 bytes)
  while the responses differ by 61%. A reader comparing stylesheets would have concluded there was
  nothing to fix.

## Step five: the real catalogue, and what actually drives the cost

Step four was measured on a synthetic page, and a synthetic page is a hypothesis about a real one. So
the shipped catalogue was served as well — `pnpm docs:build`, then `scripts/spike-real-page.mjs`,
which serves `docs/dist` and optionally applies the hoist to the one stylesheet carrying the
composition rule.

**The real page, timed by hand in the Elements panel:**

```text
as built     47.36 s
hoisted       2.73 s     17×
```

and through the protocol, on the same element:

| | as built | hoisted |
| --- | --- | --- |
| matched response | 965,075 B | 412,671 B (−57%) |
| CDP round trip | 21.5 ms | 15.7 ms (−27%) |
| resolved animations | 228/228 | **228/228, identical names and durations** |

The parity line is the important one: the hoist is correct on the real stylesheet, not merely on the
synthetic one, and the check is the same assertion `behaviour:check` makes.

### Selector text drives the cost, not selector count

The synthetic harness turned out to overstate one thing and understate another, and separating them
is what answered the question. Hand timings, all with the aggregate hoisted:

| selectors | selector text | Inspector |
| --- | --- | --- |
| 231 escaped utility names | 13,146 chars | 3.25 s |
| **231 short addresses** | **3,486 chars** | **0.42 s** |
| 1 selector | 7 chars | 0.23 s |

The first two rows hold the **same number of selectors** and differ by 3.8× in text and 7.7× in
time. So the frontend's cost tracks the **characters** it has to render in the matched selector list,
not the selector count and not the protocol metadata. That explains the earlier dead end: wrapping
the list in `:is()` collapses the metadata (121 KB → 49 KB) while keeping every character, and buys
only 12%.

It also corrects the synthetic corpus twice over. Its selectors average 57 characters — escaped
arbitrary values like `.animate-rotate-\[0\:0deg\|20\:-8deg\|100\:-8deg\]\/\[flick\]` — where the
shipped catalogue averages 22, plain effect names. But the response matches **two** rules carrying
the list, so the real total is 10,529 characters, not the 4,969 a single rule suggested. Real sits
between the synthetic points, which is exactly where its 2.73 s lands.

### What that means for the remaining 2.73 s

By the text model, **essentially all of the remaining 2.73 s is selector text.** The hoist cannot
touch it: the characters are the user's utility names, and no CSS shortens a selector list. So the
only route past 2.73 s is not enumerating the activating set at all — a short carrier selector,
which is `*`/`[class]` (correctness-equivalent, costed in `engineering/decisions/carrier-inference.md`
at "about 1 ms per 1,000 elements per style recalc, where the opt-in holds it at zero") or an opt-in
class (which is what the inference decision removed).

That is a placement decision, not a representation one, and it is now quantified: **2.73 s → ~0.2 s**,
against a recalc tax on every classed element rather than only on the animating ones.

## Falsifying the element-local list

If an element could receive only the slots it activates, both costs would disappear at the root:
the aggregate would be 1–3 positions instead of 228. The requirement, stated once:

> three elements each carry a different subset of three activating utilities, and each must end up
> with a list containing exactly its own subset, without a selector that enumerates the combination.

Measured in a browser (`pnpm spike:local-list`). A mechanism works only if the three position counts
are 1, 2 and 3:

| mechanism | only | pair | all | positions |
| --- | --- | --- | --- | --- |
| three utilities set one property | `a` | `b` | `c` | 1/1/1 |
| registered `syntax: "<custom-ident>#"` | `a` | `b` | `c` | 1/1/1 |
| `if()` | `a` | `a` | `a` | 1/1/1 |
| `@function` | `a` | `a` | `a` | 1/1/1 |
| `@container style()` | `a` | `b` | `b` | 1/1/1 |
| space toggle | `a, b, c` | `a, b, c` | `a, b, c` | 3/3/3 |
| `sibling-count()` as a number source | — | — | — | 1/1/1 |
| **control: one property holding a whole list** | `a` | `a, b` | `a, b, c` | **1/2/3** |

Four of the five mechanisms under test are present and verified by use, not by `CSS.supports`:
`@function` returns `rgb(255, 0, 0)`, `if()` computes `10px`, the registered list syntax accepts
`a`, style queries match. **Every one of them selects exactly one whole value.** The space toggle
inserts into space-separated positions and is a fixed count regardless of the classes. Only the
control produces the element's own subset — and it does so because a single declaration was handed
the whole list.

So the conclusion is not "CSS cannot concatenate". It is sharper and it closes the direction:

> **CSS cannot count.** Values are built from a fixed declaration text. Every primitive that could
> contribute to a list — cascade, `var()` fallback, `if()`, `@function`, registered syntax, style
> queries — resolves to *one value*, and none of them can make a value whose **length** depends on
> which other declarations happen to be present. The only numeric source in the language counts DOM
> siblings, and a class list is not a sibling list.

An element-local vector therefore requires knowing the combination, which means enumerating it —
2^N selectors — or reading the DOM at build time. Build-time source scanning does not help either:
Tailwind's scanner produces a flat candidate set, not co-occurrence per element, so the information
is not recoverable later in the pipeline without parsing HTML.

## What this changes, and what it does not

**Unchanged:** C2 is still the right placement. Carrier placement was not measured here and nothing
suggests revisiting it. Nor is there any finding against the `inherits: false` registrations — they
cost 0.4% of the payload.

**Changed:** the earlier conclusion that "the representation is not where it lives" was true of the
prototype it measured and false of the shape it generalised to. Splitting the C2 selector list, which
is the obvious response to a large rule, buys 14% on its own and a further 32% once the declaration
payload is small. The representation buys 61%; the two together, 73%.

**Ruled:** the divergence is accepted, and the acceptance is a contract rather than a shrug.

> **Jumi guarantees the semantics of active animation positions. The computed longhand values
> associated with inactive `animation-name: none` positions are not part of Jumi's semantic API.**

That distinction holds because a duration attached to a position whose `animation-name` is `none`
does not describe anything that runs. The one observable animation resolves identically — name,
duration, timing function and fill mode, plus the other six longhands, all measured, with the
label-scoped control delivered.

## Step six: the production build

Steps one to five priced the representation with a transform applied to an already-built stylesheet —
`shallowOf` in `scripts/lib/aggregate.mjs`, which is deliberately independent of the finalizer so that
the two can be compared. The change then went into the finalizer, and the question that closes it is
whether the *real* build behaves like the transform.

`scripts/measure-real-page.mjs` is the instrument. It serves a built site, opens the catalogue, reads
every animating element's live positions across all ten longhands, and inspects one element through
CDP. It differs from `spike-real-page` in being automated, and from `spike-cdp-cost` in measuring the
shipped page rather than a fixture it compiled itself. Two runs are diffable with `--compare`.

The baseline is the pre-hoist build of `docs/dist`, kept at `/tmp/jumi-dist-deep` before rebuilding:

**The real catalogue, production output, 228 effects:**

| | deep (`docs/dist`, pre-hoist) | hoisted (rebuilt from `src`) | |
| --- | --- | --- | --- |
| matched-styles response | 965,683 B | **419,673 B** | −57% |
| CDP round trip | 21.2 ms | 17.7 ms | −16% |
| computed-style response | 39,442 B | 38,630 B | −2% |
| stylesheet | 267,352 B | 293,060 B | +9.6% |
| positions per element | 228 | 228 | — |
| live positions | 228/228 | **228/228, 0 differences** | — |

**Step six passes.** The response is within 1.7% of the transform's 412,671 B on the same page, and
the parity is exact rather than approximate: 228 live positions, all ten longhands each, and not one
of them differs. The +9.6% stylesheet is the trade the measurement predicted — the per-slot
publications add bytes to the activation rules while the composition sheds far more, and the file size
was never the signal.

Four things the instrument had to be taught, all of which would have produced a confidently wrong
answer:

- **Headless Chromium reports `prefers-reduced-motion: reduce`**, and the catalogue honours it. Every
  glyph computes `animation-name: none` and the run reads as 228 broken effects until the preference
  is stated.
- **The catalogue only plays a card that carries `is-playing`** — its own rule is
  `.effect-card:not(.is-playing) .effect-glyph { animation: none !important }`. Idle glyphs resolve
  nothing, so the measurement puts the page into its own playing state first.
- **The comparison is falsified, not assumed.** A tampered baseline (one duration, one name) is
  detected as exactly two differences and the run exits non-zero; against the untampered baseline it
  exits zero.
- **The assertion that survives without a baseline had to be falsified too**, and it turned out to
  guard more than expected. Every glyph carries the same control, so every live position must resolve
  the same duration; removing the control from **one** of the 228 glyphs yields
  `2 distinct across live positions: 1s, 1.2s` and exit 1. The part worth keeping is what else
  happened: that glyph still resolved a **live** animation, 228/228. A position whose publication did
  not arrive can still name its animation — so "does it resolve?" passes while the element runs the
  wrong timing. That is the gap `--compare` closes and the baseline-free assertion now closes without
  one.

Only *live* positions are compared, which is the contract above rather than a convenience: the deep
and hoisted representations are known to give an inactive position different bookkeeping values, and
comparing those would report the accepted divergence as a regression.

### Keeping it: a permanent regression path with two modes

The instrument is kept, and the two modes are deliberately different in what they depend on.

**The default run needs nothing but a build.** It asserts every element resolves its own effect and
that every live position resolved its own control, so it is self-contained and can be run against any
build — including a deployed one, as the post-deploy confidence check. This is the mode that belongs
in a regression path, because it cannot rot: no fixture to update, no baseline to lose.

**`--compare` needs a baseline captured before the change**, and that baseline is an artifact of the
change rather than a fixture. It is 150 KB and records the directory it was taken from, so it is
deliberately not committed; capturing it is one `cp -R` before `pnpm docs:build`, and if the rebuild
happens first the diff can no longer be taken at all. That is the honest description of what it is: a
measurement you can only make at the moment of a representation change, not a check that runs forever.

It is not in `pnpm check`, which deliberately has no Chromium and no built site. `pnpm measure:real-page`
is the door.

## Recommendation

**Adopt shallow-shorthand as the aggregate representation.** Five numbers agree, and not one of them is
a regression:

```text
Inspector, real catalogue   47.36 s → 2.73 s      17×
matched response            965 KB → 413 KB        −57%
CDP round trip              21.5 → 15.7 ms         −27%
recalc                      976 → 392 ms           −60%
live semantics              identical — 228/228 on the real catalogue, all ten longhands on the probe
```

and the production build reproduces it: **419,673 B**, **228/228 live positions, 0 differences**.

### Status: landed, and closed for 1.0

The CTO's call on 2026-09-13:

> **Land the hoisted shallow-shorthand representation. Mark the representation investigation closed
> for 1.0. Keep the CDP/real-page measurement as a permanent regression path. Do not reopen carrier
> placement or element-local vectors unless a new platform primitive changes the constraints.**

Two conditions came with it, and both are satisfied above rather than promised. The manual Inspector
timing is **not** re-required — the protocol number reproduced within 1.7% and the live diff is zero,
so the production implementation is the same shape that produced the human improvement; the hand
figure is a post-deploy confidence check. And the representation record is annotated rather than
rewritten, because the earlier rejection measured a different hoist and established the cost model
that led to this one.

The next workstream is View Transitions, resumed without a known DevTools scalability defect
underneath it.

**The selector reduction is not part of this change.** It does not survive contact with the real
page: `small-selectors` was a bound (a single `#target` selector, unreachable), and the realizable
`:is()` form buys 12% for a specificity change. The 2.73 s that remains is selector *text*, and
dealing with it means changing the carrier's selector — a placement decision, not a representation
one.

The earlier rejection priced a *different shape* — the longhand hoist, which really is only −15% —
on a *different workload*. Neither of those numbers transfers to this one.

Three things to carry into the change:

1. **Emit it where the finalizer already works.** The aggregate is materialized after the candidate
   set is closed, which is exactly where a shallow list can be written instead of a deep one. No new
   placement, no new protocol, no new build step.
2. **A view-transition selector must never be merged into the utility rule.** Unrelated finding, same
   file of work, recorded in `engineering/research/view-transitions.md`.
3. **Keep the Inspector in the loop, permanently** — see the release criterion below.

**Do not pursue element-local vectors.** The direction is closed by measurement rather than by
opinion: the primitives all exist, and none of them counts.

## Release criteria

The freeze was invisible to every harness Jumi had. It passed visual correctness, `behaviour:check`,
the CSS byte snapshot and the recalc benchmark — because none of them look at what a *developer's
tooling* pays to read the stylesheet. Three consequences, which now belong in the gate:

- **DevTools inspectability is a release criterion.** A developer-facing CSS library that stalls
  Inspector has a usability regression even when the page itself is perfectly smooth, and the people
  who hit it are exactly the people the library is for.
- **`spike-cdp-cost` and `measure-real-page` are the permanent regression path**, and neither is in
  `pnpm check` — it deliberately has no Chromium and no built site. `spike-cdp-cost` prices a fixture
  it compiles itself; `measure-real-page` prices the shipped build, which is the only one that can
  disagree with the fixture. Run both when the aggregate changes, and `measure-real-page` after a
  deploy as a confidence check.
- **A stylesheet-size comparison would not have found it.** The two sheets differ by 3% while the
  responses differ by 61%, so the metric has to be the response, not the file.

## Reproducing

```bash
pnpm spike:cdp-cost            # the protocol sweep; `pnpm spike:cdp-cost 228` for one slot count
pnpm spike:cdp-cost --serve=jumi --port=8789 228   # park it for the hands-on Inspector check
pnpm spike:recalc              # the renderer grid
pnpm spike:local-list          # the falsification pass
pnpm measure:real-page         # the shipped build: resolve + control parity, no baseline needed
```

The production build, before and after — the baseline has to be kept before rebuilding, since
`docs:build` overwrites it:

```bash
cp -R docs/dist /tmp/jumi-dist-deep
node scripts/measure-real-page.mjs --site=/tmp/jumi-dist-deep --json=/tmp/deep.json
pnpm docs:build
node scripts/measure-real-page.mjs --json=/tmp/hoisted.json --compare=/tmp/deep.json
```

`measure:real-page` on its own exits non-zero if any element fails to resolve its own effect or if the
live positions disagree about their control; `--compare` adds the baseline diff to that. Neither is in
`pnpm check`, which needs no Chromium and no built site.

`spike-cdp-cost` builds each corpus through the real pipeline, serves it over `http://127.0.0.1`,
attaches a CDP session and measures. It asserts that the aggregate holds at least as many entries as
slots were requested, so a corpus that silently fails to register cannot be reported as a measurement
of something smaller.
