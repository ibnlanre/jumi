# Are typed leaves a first-class path?

_RESEARCH — measured, not shipped. Not a workstream, and not filed._

The ruling that commissioned this, and the rule it is held to:

> Prove that typed leaves can carry Jumi's existing motion semantics **without creating a second-class
> path.** … I would not touch `computeSlots()` globally yet, but inside the prototype I would give every
> animation instance an explicit semantic ordering key: whole decomposed motion < constituent motion, with
> a stable tiebreak after that.

The prototype is `scripts/prototype/typed-leaves.mjs`. It is **not** a hand-assembled sheet: it is a second
finalizer that takes the sheet the shipping finalizer produces — every activation chain, every variant,
every named motion already correct — and rewrites only what the pivot changes. Registration, keyframes,
the static read, and the aggregate order. Everything else is left alone deliberately, which is what makes
§4 a real test rather than a reimplementation check.

Measured by `node scripts/spike-typed-leaves.mjs` in Chromium 153.0.8010.12 on 2026-09-16.

## The answer

**Yes, and the two mandatory questions both come out in the pivot's favour.** Whole-before-constituent
gives exactly the ownership rule the ruling wanted, the result is identical in both candidate discovery
orders, and the motion surface that the prototype does not touch still works unchanged.

Three things the pivot must build at compile time came out of it, and one of them needs grammar rather
than a guess.

## §1 The categories, on a real sheet

| category        | instances on the probe surface                     | what happens                                                             |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| **constituent** | `animate-scale-x→scale-x`, `animate-skew-x→skew-x` | the frame re-emits the read it already had, as a write to the leaf       |
| **whole**       | `animate-scale`                                    | the frame literal is distributed across the leaves the composition names |
| **native**      | `animate-transform`                                | untouched — the ruling's third row                                       |
| **argument**    | `animate-filter-blur`, `animate-filter-brightness` | **not built**, and reported rather than mistyped                         |

The keyframe rewrite needed no new parsing, because the composed value is already one read per leaf: a
frame contains `var(--jumi-scale-x-<id>-<offset>, var(--jumi-scale-x))`, and that operand names both the
frame key and the leaf. A constituent re-emits its own operand **verbatim**, so the frame-first-then-
element-level precedence is preserved rather than re-derived.

**A leaf is not registered today.** Only the per-instance activation names and the slot keys are, because a
leaf has never needed a computed value — every read of one falls through a chain. So the pivot's
registrations are _additions_, not rewrites of existing ones, and the census's ~775-byte figure is a
growth rather than a substitution.

## §2 Independence: the collapse is upstream of the finalizer

The ruling asked whether `skew`+`skew-x` and `drop-shadow`+blur become independent animations. The answer
is narrower than the question, and the distinction matters:

| the two classes                                                          | today            | prototype |
| ------------------------------------------------------------------------ | ---------------- | --------- |
| `animate-skew-[0:0deg\|100:5deg]` + `animate-skew-x-[0:0deg\|100:10deg]` | **2** animations | 2         |
| `animate-filter-drop-shadow-[…]` + `…-blur-[0:0px\|100:12px]`            | **2** animations | 2         |

**As phrases they are already independent.** Each phrase owns its keyframe and therefore its slot. What
collapses — measured in the ordering probe — is the **tween** form: `animate-skew-x-10` and
`animate-skew-10` share the attribute's composed slot because a _value_ motion of a part resolves the
shared keyframe, while a phrase does not.

So this is not a finalizer change at all. It is a change to how a part motion is **keyed**, which lives in
`computeSlots()` — and the prototype cannot demonstrate it without changing that function, which this
increment deliberately does not do. The precise statement for the production decision is: _a part motion
expressed as a value shares its parent's animation; a part motion expressed as a phrase does not._

## §3 The two mandatory questions

The whole motion is `scale: 1 1 1 → 2 2 2` (it owns x, y and z); the constituent is `scale-x: 1 → 5` (it
owns x alone). So the component owning x while the whole keeps y and z is `5 2 2` at 100%.

| sheet         | candidate order | the aggregate list               | `scale` at 100% |
| ------------- | --------------- | -------------------------------- | --------------- |
| **today**     | whole first     | `scale-1vrwYB, scale-1vrwYE`     | `5 1`           |
| **today**     | reversed        | **`scale-1vrwYE, scale-1vrwYB`** | **`2`**         |
| **prototype** | whole first     | `scale-1vrwYB, scale-1vrwYE`     | **`5 2 2`**     |
| **prototype** | reversed        | `scale-1vrwYB, scale-1vrwYE`     | **`5 2 2`**     |

1. **Determinism: the prototype has it, and today does not.** Identical markup, identical classes, one
   element: today the list reverses with the compilation order and computes `5 1` or `2`. The prototype
   emits the same list in both orders. The key is whole-before-constituent with the candidate name as a
   stable tiebreak — the class an author wrote, rather than an order no one can see.
2. **Ownership: the prototype expresses it, and today cannot in either order.** `5 2 2` — the constituent
   owns x, the whole supplies y and z. Today gives `5 1` (the constituent wins the whole property, y and z
   fall back to the element level) or `2` (the whole wins everything). Neither is a component override.

This is the rule the ruling proposed, measured end to end on real Jumi classes rather than hand-written
CSS, which is what the earlier ordering probe could not do.

## §4 The rest of the surface, which the prototype never touches

`animate-scale-[0:1|100:2]/reveal` with `animation-duration-500` and `animation-duration-2000/reveal`
compiled through both paths:

|           | on the element | with an inline `1s` |
| --------- | -------------- | ------------------- |
| today     | `2s, 0.5s`     | `1s`                |
| prototype | `2s, 0.5s`     | `1s`                |

Two motions, each with its own duration, the named one taking `2000ms` and the unnamed one `500ms` — and
the values are _identical between the two paths_. They are computed by the chains the shipping finalizer
wrote, and the prototype only reorders the lists those chains are entered from. Reduced motion, ranges and
timelines travel the same way and are therefore in the same position: untouched, and tested by the
shipping gate rather than by this probe.

That is the strongest evidence available that this is a first-class path rather than a parallel one: the
prototype did not have to teach it any of this.

## §5 What the pivot must build at compile time

**1. Registrations — additive.** §1. A leaf has never had one.

**2. List normalisation — and it is grammar, not padding.** A whole motion writes one value and its
composition reads several leaves, so the value must be distributed. `scale: 2` means `2 2 2` — a single
component applies to every axis — but `translate: 100px` means `translate(100px, 0)`, so the missing
component is the **identity**. Measured: padding `scale: 2` with the identity reads `5 1` where the
decomposition should read `5 2 2`, which is the difference between the ownership rule working and not. The
prototype carries this as an explicit table (`REPEATS`), and an attribute that is not listed is refused
rather than padded on a guess.

**3. The function reshape — built.** A slot whose value is a call (`filter-blur: blur(0)`) has no
argument to animate until the composition reads one, so the substrate becomes
`blur(var(--jumi-filter-blur-amount))`. The shape is deliberately narrow: **the composition owns the
function, the typed slot owns only the argument, and no function string ever appears in the animated
slot.** The keyframe writes `--jumi-filter-blur-amount: 0px`, never `blur(0px)`.

It is applied to a whole **attribute**, not to the instance that needs it, because the composition is one
expression: a partly-reshaped `filter` could not decompose a whole filter motion at all, since some of
its operands would hold arguments and some whole functions. So when any instance of a property animates an
argument, every call-shaped leaf that property composes becomes `fn(var(--jumi-<leaf>-amount))` — and a
leaf is excluded when its value is not a single call, when its grammar is a `url` (that slot holds a whole
function — `opacity(1)` at rest, `url(…)` when written — so pinning it to one loses the other), and when
the census mapped no syntax for its grammar. On `filter` that is nine leaves reshaped and `url` left
alone.

**4. A native instance blocks the reshape for its attribute.** This is the part that is easy to get wrong.
A native instance writes the property itself as one self-contained expression built from the attribute's
old operand list, so it does **not** compose with a reshaped instance — whichever animation lands last in
the aggregate list wins the property outright and the other is silent. Measured on `animate-filter-url`
(a native instance, whose grammar the reshape cannot carry) plus `animate-filter-blur` (an argument), the
reshape swapped which one won and the url motion went quiet: `blur(8px)` became `blur(0px)`. With the rule
in place the attribute falls back whole, reproducing the shipping emission exactly — including the fact
that this pair is order-dependent, by the same two values, in both sheets. The reshape neither introduces
nor repairs that, which is the correct result for a gate that may not touch the ordering of attributes it
does not own.

**5. Ordering is a claim about ownership, so it is only made where something is owned.** The semantic
ordering is applied per attribute and only to attributes the reshape carries; an attribute whose every
instance fell back to native keeps compile order. This was not a stylistic choice: ordering the url/blur
pair by candidate name alone handed the slot from the blur motion to the url one, silently changing a
property's value. Order _between_ attributes is not constrained, since two attributes never contest the
same slot.

**6. The reshape's category is not in the corpus.** Neither `variant.css` nor `input.css` contains a single
argument instance — zero in both — so the canonical corpus cannot measure the reshape at all. Its cost and
its gains are measured on sheets built for it, in §6.

**7. One structural fact worth recording.** A whole motion's composed value is **one outer `var()`** whose
fallback is the composed value:

```css
scale: var(
  --jumi-scale-<id>-<offset>,
  var(…scale-x…) var(…scale-y…) var(…scale-z…)
);
```

so the leaf order lives in the fallback and not at the top level, while a constituent's keyframe is
space-separated reads with the part first. Unwrapping unconditionally reads the first `var(`'s own argument
list and produces `--jumi-scale-x: var(--jumi-scale-x)) var(--jumi-scale-y-1vrwYE-0,` — which is what the
prototype did until the unwrap was gated on the value being a single operand.

## §6 What the reshape costs and saves

The shape is `compose(fn)(amount)`: the static composition owns how argument units become a property
value, and the animated slot owns only the unit. That is the architecture sentence — **Jumi should animate
the smallest independently interpolable unit it can, while the static CSS composition owns how those
units become a property value** — applied to the last constituent category that had no mechanism.

| shape                           | bytes                      | keyframe bytes        | registrations | decls/frame |
| ------------------------------- | -------------------------- | --------------------- | ------------- | ----------- |
| independent blur and brightness | 13421 → 11777 (**−12.2%**) | 3129 → 267 (**−91%**) | 0 → 9         | 1 → 1       |
| whole filter + blur constituent | 13503 → 12375 (**−8.4%**)  | 3214 → 868 (**−73%**) | 0 → 9         | 1 → 9       |
| named control                   | 11265 → 10380 (−7.9%)      | 2279 → 176 (−92%)     | 0 → 9         | 1 → 1       |
| scroll range and timeline       | 12072 → 11844 (−1.9%)      | 1576 → 130 (−92%)     | 0 → 9         | 1 → 1       |
| constituent tween (`scale-x`)   | 8228 → 8161 (−0.8%)        | 386 → 200             | 0 → 1         | 1 → 1       |
| whole that cannot be decomposed | unchanged                  | unchanged             | 0 → 0         | 1 → 1       |
| quoted / arbitrary whole, `url` | unchanged                  | unchanged             | 0 → 0         | 1 → 1       |

**Every case the reshape owns shrinks, and every case it declines is byte-identical.** That is a stronger
result than the increment began with, and it only held once two defects the required tests exposed were
removed (§6.1, §6.2): each was paying bytes for nothing, and together they turned the one growing case — a
whole filter motion, `+13 bytes` — into `−1128`.

The shape of the saving is the point: shipping writes the **whole 11-operand filter expression into every
frame** — every leaf read, each with its own fallback — and the reshape writes one small variable per
function instead. One large declaration per frame becomes several small declarations, and the keyframe
bytes fall by 73–92%.

On `input.css`, which contains no arguments, the prototype is **+2.17% bytes and +44 registrations** with
`var()` _falling_ from 1549 to 1390. So the corpus measurement is really a measurement of the
whole/constituent decomposition already in the prototype, not of the reshape: the reshape's own category
appears nowhere in it. Registrations are the recurring price — nine for a function-shaped family, paid
once per family rather than once per instance — and the one a real build can gate on a used-in-the-sheet
check, since a registration is only emitted for a leaf some instance animates.

### §6.1 A function-holding leaf is never a typed component

A first pass had an argument instance register its own leaf, which published:

```css
@property --jumi-filter-blur {
  syntax: '<length>';
  inherits: false;
  initial-value: css('blur', '0');
}
```

Both halves are wrong. `--jumi-filter-blur` is `blur(0px)` — the composition's operand, not an
interpolable unit — so `grammarOf`'s answer is the grammar of the argument _inside_ the call, and
labelling the leaf with it mistypes the leaf. The identity is the model's own source text, which is not a
CSS value at all. After the reshape the composition reads `blur(var(--jumi-filter-blur-amount))` and this
leaf is unreferenced, so there is nothing to register; on the native path it stays an ordinary custom
property holding a function, which is what it is today. Only the `-amount` sibling is typed. Dropping
these nine registrations is what moved the whole-motion case from `+13` bytes to `−1128`.

### §6.2 The id must come from the canonical name, not the slot key

The id that locates a slot's keyframes was sliced off the slot key, and a slot key carries the variant
path: `animate-filter-blur-[…]/scroll` keys as `6-scroll-Z2nKX36-filter`, so the slice yielded an empty id
and the keyframes lookup missed. The reshape then reshaped the substrate, **paid for its registrations**,
and rewrote nothing — a silent no-op that cost `+1326` bytes on the scroll sheet and was invisible until
the cost table counted keyframe bytes and found them unchanged. The canonical name is available in the
slot variable's own value (`var(--jumi-filter-Z2nKX36-animation-name, …)`), so the id is read from there
now, and the same sheet is `−228` bytes. Variant-carrying instances are the common case, not an edge one:
the scroll, `@supports`, media and segment-easing forms all key this way.

### What the browser shows that the byte count does not

Two of the ruling's cases differ from shipping, and both differ because **a motion shipping lets go silent
now animates**:

| case                                                | shipping @100%              | reshape @100%               |
| --------------------------------------------------- | --------------------------- | --------------------------- |
| `animate-filter-blur` + `animate-filter-brightness` | `blur(0px)` `brightness(3)` | `blur(8px)` `brightness(3)` |
| `animate-filter` (whole) + `animate-filter-blur`    | `blur(8px)` `brightness(1)` | `blur(8px)` `brightness(2)` |

In the first, both motions address one slot, one of them wins the property, and the loser's keyframes are
published and never read — the all-or-nothing ownership the ordering probe measured, now visible as a
capability loss rather than a list artefact. In the second the whole motion was the one going silent.

## What this does not measure

- **Scroll timeline, animation range and segment easing beyond the named cases.** The reshape is now
  exercised on a scroll range and timeline instance and matches shipping; segment easing is carried by the
  same chain, and the shipping gate remains the assertion.
- **Studio export/replay.** Out of reach in this increment and named as such.
- **Independence for the tween form** (§2), which needs `computeSlots()` and is therefore the production
  decision rather than a prototype one.
- **DevTools inspectability.** Named as a manual check rather than automated here; the emitted shape is
  one registered custom property per function, so a frame reads as nine small declarations instead of one
  long expression.
- **3D transform wholes**, for the reason the transform probe gives.

## Reproducing

```bash
pnpm bundle && node scripts/spike-typed-leaves.mjs
```
