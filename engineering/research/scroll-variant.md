# The composition variant — `animation-range-entry:animate-fade-in`

*RESEARCH — measured, not shipped. Not a workstream, and not filed.*

The CTO's question, after the scroll-driven workstream closed, was whether a range can qualify the
motion that follows it in a class list:

```html
class="animation-timeline-view animation-range-entry:animate-fade-in animation-range-exit:animate-fade-out"
```

read as *apply this `animation-range` to the animation candidate that follows*. The five things such a
variant would have to do:

1. instantiate the wrapped motion normally,
2. identify the slot that motion created,
3. add `animation-range: <value>` to **that same slot**,
4. leave the source selector semantically intact,
5. work the same for an effect, a single value, and an arbitrary phrase.

**The answer is yes**, with one shape that makes it work and two traps that decide the implementation.
Measured by `pnpm spike:scroll-variant` in Chromium 153.0.8010.12 on 2026-09-14, against a real build
(Tailwind emits, `dist/index.js` finalizes) with the variant registered from a scratch plugin — nothing
in `src/` was changed.

## The shape: the variant is a pure identity

A Tailwind variant callback is handed **only its own value and modifier** — never the utility it
wraps. So it cannot know which slot it is qualifying, and the first reading of this problem ("the
variant adds the range to the slot") is not implementable *as stated*. What is implementable is a
split:

| what the emission needs | where it comes from |
| --- | --- |
| the range (`entry`, `exit`, `entry 20% cover 50%`) | the class the author typed, which lands in the emitted **selector**, escaped |
| the slot (`fade-in`, `opacity-sluPU`) | the **activation declaration** in the same rule — the mechanism the hoist already uses to find every slot in a stylesheet |

So the variant's entire contribution is `&`:

```js
api.matchVariant('animation-range', () => '&', { values: { contain, cover, entry, … } })
```

and a **finalizer pass** does the rest: read the rule's selector, decode the range, read the activation
for the slot, publish `--jumi-<slot>-animation-range: <range>` onto that same rule — one declaration per
ranged slot, exactly what the hoist already does for `--jumi-slot-<slot>`, one property over.

Two things follow from `&` being the identity rather than a marker, and both matter:

- **The motion still reaches the element.** The view-transition variant deliberately returns a
  never-matching selector, because a view transition must *not* run on the source element. A range
  qualification is the opposite: the element has to animate. `&` is what makes the composition a
  composition.
- **The callback cannot refuse, and should not try.** A variant callback has no warning channel, and
  Tailwind calls it once at configuration time with a sentinel value (`'a'`, no candidate, even on a
  page with no range variant at all — the same trap the view-transition spike measured). Identity has
  nothing to record and nothing to reject, so all the judgement lives in the pass that reads the
  selector and *can* report.

## What was measured

**Emitted shape** — `animation-range-entry:animate-fade-in` produces
`.animation-range-entry\:animate-fade-in { --jumi-fade-in-animation-name: jumi-fade-in }`: the wrapped
utility's body, unchanged, under a selector the element matches because it wrote the class. The
activation is there, so the slot is recoverable.

**Decode** — every kind the fifth requirement names, read off the selector alone:

| author wrote | decoded range | slot found |
| --- | --- | --- |
| `animation-range-entry:animate-fade-in` | `entry` | `fade-in` |
| `animation-range-exit:animate-fade-out` | `exit` | `fade-out` |
| `animation-range-entry:animate-rotate-45` | `entry` | `rotate-3zWYd` |
| `animation-range-entry:animate-opacity-[0:0\|100:1]` | `entry` | `opacity-sluPU` |
| `animation-range-[entry_20%_cover_50%]:animate-fade-in` | `entry 20% cover 50%` | `fade-in` |

**Publication and survival** — `--jumi-fade-in-animation-range: entry` and
`--jumi-fade-out-animation-range: exit`, one on each rule that carries its motion, and both survive
`finalizeCss`: the composition's range list reads
`var(--jumi-fade-in-animation-range, var(--jumi-animation-range)), var(--jumi-fade-out-animation-range, …)`,
which is the whole mechanism — the list position for that slot resolves the range the variant supplied.

**Runtime** — one element carrying both motions, driven by one `view()` timeline:

| | computed `animation-range` | at scroll 0 | at ¼ |
| --- | --- | --- | --- |
| `animation-range-entry:animate-fade-in` + `animation-range-exit:animate-fade-out` | `0%, 0%, entry, exit` | fade-in 1, fade-out *idle* | fade-in 1, fade-out 0.73 |
| the same two motions with no ranges | `0%, 0%, 0%, 0%` | both 0.51 | both 0.94 |

Two motions, one driver, two different ranges — which is what the syntax is for.

## Two traps

- **The separator is an escaped colon.** `\:` is where the variant ends, and the first version of the
  decode scanned for a bare `:` and read `[entry 20% cover 50%]:animate-fade-i` off a selector — it had
  stopped at the `:where()` of a marker. Every colon inside the variant's own value is escaped too
  (`animate-opacity-\[0\:0\|100\:1\]`), so only the separator is that two-character sequence.
- **Validation belongs in the pass, not in the callback** — for the reason above, and because of what
  an unvalidated value actually does. Measured, and this is the one that *changed* the recommendation:

  > `animation-range: … , entry, nonsense` computes to **`0%, 0%, entry, 0%`**. The invalid position
  > falls back on its own and **the neighbouring position keeps its range**.

  That is the opposite of what an invalid *whole* value does — `normal 0% normal 100%` fails to parse
  as a list at all and takes every position with it (measured in `engineering/research/scroll-driven.md`).
  So a range the emission cannot honour is not dangerous to its neighbours; it is *silent*, which is the
  argument for refusing it with a warning, not the argument for refusing it to stay safe.

## One finding outside the variant, about `/`

The CTO's sketch spelled identity as `animate-opacity-[0:0|100:1]/reveal`. Measured: **that emits
nothing at all** — not the label, not the motion. The spelling that works is the bracketed one:

```text
animate-opacity-[0:0|100:1]/[reveal]   → --jumi-opacity-sluPU-label: reveal, and the slot chain gains
                                          var(--jumi-label-reveal-animation-duration, …)
animation-duration-500/reveal          → --jumi-label-reveal-animation-duration: 500ms
```

> The address variable read `--jumi-reveal-animation-duration` when this was measured. Names now live in
the label namespace, so a name cannot be a property scope — `engineering/research/addressing-instances.md`
has the ruling. The finding itself is unaffected: the unbracketed form still fails by vanishing, and the
label is still what a control addresses.

So `/` does introduce identity, and a control does address the label — but only when the label is
written in brackets, and the unbracketed form fails by *vanishing* rather than by refusing. Worth
knowing before the vocabulary is written down anywhere: either the docs spell it `/[name]`, or the
unbracketed form is made to work.

**Answered, and it is not a spelling fix.** The reason is in the registration: a Jumi *control* declares
`modifiers: 'any'` (`src/properties/controls.ts`), which is what accepts a bare word, while the *motions*
— every matcher in `src/properties/tween.ts` — declare no modifiers at all. Tailwind then takes
`/[reveal]` (arbitrary) and refuses `/reveal` (bare) for a motion, and refusing means dropping the **whole
candidate**: the class produces no animation whatsoever, which is what the measurement above shows.

Making the bare form work is therefore a per-matcher change, and it cannot be done alone:

| motion kind | `/[reveal]` today | `/reveal` today | what makes a label work |
| --- | --- | --- | --- |
| phrase (frames), e.g. `animate-opacity-[0:0\|100:1]` | works | refused | `modifiers: 'any'` on that matcher |
| single value, e.g. `animate-opacity-50`, `animate-width-4` | **silently ignored** | refused | the label must become part of the **slot's identity** in `@/core`, so the composition has a position that reads `--jumi-<label>-…` |
| effect, e.g. `animate-fade-in` | **silently ignored** | refused | the same, for the effect slot |

Declaring modifier support on the phrase matchers only would convert a loud refusal into a silent no-op
for the other two kinds — the exact failure mode this whole line of work has been removing. The complete
fix is the three rows together, plus the loud half: a finalizer check for a `--jumi-<name>-<part>`
declaration that no labelled slot and no activation answers to, so a typo'd or answering-nothing label
warns instead of doing nothing. Deferred deliberately, not overlooked.

## Shipped

Decided and implemented. The variant **sits beside** the range utilities rather than replacing them: they
answer different questions — `animation-range-entry` places the element's animations,
`animation-range-entry:animate-fade-in` places one — and the emission already composes them, because a
utility writes `--jumi-animation-range` and the variant writes `--jumi-<slot>-animation-range`, which
falls back to it. Nothing was removed for this to ship.

- **The reader** is `src/helpers/carriers/animation-range.ts`: the grammar (`RANGE_GRAMMAR`, quoted in
  the warnings), `rangeFromSelector`, `rangeAccepted`, `rangeReadings`.
- **The registration** is one `matchVariant('animation-range', () => '&', { values: animationRangeName })`
  in `src/helpers/create/index.ts`, beside `view-transition` and documented as its opposite: that one
  returns a never-matching marker so the motion cannot reach the element, this one returns the identity
  so it must.
- **The pass** is phase 1a in `src/helpers/carriers/index.ts`, before the view-transition staging walk
  because that walk removes the rules it takes. It publishes `--jumi-<slot>-animation-range` onto the rule
  the author wrote, and warns through the same channel when it will not.
- A selector only counts as ranged when something **wraps** it. `animation-range-entry` is the utility;
  `animation-range-entry:animate-fade-in` is the variant. Reading both as a qualification would put a
  warning on every page that uses the shipped utilities, which is why the check is positional and why the
  gate asserts the utility stays silent.
- A rule that declares **two** motions is refused rather than guessed: one body cannot hold two ranges,
  and a guess would range the wrong animation without saying so.

### What the gate holds (13 assertions, stage 11 of `pnpm check`)

| claim | how it is held |
| --- | --- |
| the range ranges its own slot and no other | one element, two motions, one ranged: the fade runs 0 → 0.5 → 1 across ¼ ½ ¾ while the rotation beside it still reads 0.25 → 0.5 → 0.75 |
| two named ranges do not swap | one element, `entry` on one motion and `exit` on the other, matched by **name position** in the computed list |
| stacking | `motion-safe:`, `sm:` and `hover:` each publish `25% 75%` **in the same rule** that activates the slot, and the stacked arm measures live under `no-preference` |
| the utility stays silent | no warning whose source is the bare utility class |
| refusal | `[nonsense]` and `[normal_0%]` each warn naming the class, and the refused motion still runs on the whole range |
| no motion to qualify | a range over a control says "declares none" rather than writing a variable nothing reads |

One correction to the trap list above, measured while writing the gate: `animation-range-[normal_0%]` is
*not* refused by Tailwind, because the arbitrary spelling bypasses the `values` filter — it reaches the
pass and is refused there. The **bare** spelling of an unknown name (`animation-range-nonsense:`) is not a
candidate at all, so the variant's name list is the first gate and the pass is the second.

Two traps in the *harness*, for whoever adds the next arm:

- **Search rules by the declaration, not by the selector.** An optimizer merges candidates with identical
  declarations into one rule whose selector *list* holds several of them — the first match for any
  substring search, holding none of the publications. Matching by exact selector is not enough either,
  once `hover:` appends to the class. `rulePublishing(stem)` searches by the publication and matches the
  selector by prefix.
- **Map computed lists by name position, not by count.** A composed position with no animation serializes
  its range as `0%` alone and contributes nothing to `getAnimations()`, so a positional match against that
  list is off by one the moment an element has a slot it does not activate.

The frozen public story in `engineering/research/scroll-driven.md` now includes this syntax, and
`docs/src/pages/docs/controls.md` states the two spellings, the fallback chain between them, and the
refusal.
