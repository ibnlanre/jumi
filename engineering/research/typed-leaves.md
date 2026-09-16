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

**3. The function reshape — not built.** A slot whose value is a call (`filter-blur: blur(0)`) has no
argument to animate until the composition reads one, so the substrate must become
`blur(var(--jumi-filter-blur-amount))`. Two instances on the probe surface need it and both are reported.
This is the same technique the architecture spike measured as working (`blur(var())` interpolates
perfectly), just not yet wired.

**4. One structural fact worth recording.** A whole motion's composed value is **one outer `var()`** whose
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

## What this does not measure

- **The function reshape** (§5.3), and therefore nothing about the 18 function-shaped leaves.
- **Scroll timeline, animation range and segment easing by measurement.** They travel the chains §4
  exercises, so they are in the same position as duration and naming, but they are asserted by the
  shipping gate rather than compared here.
- **Studio export/replay.** Out of reach in this increment and named as such.
- **Independence for the tween form** (§2), which needs `computeSlots()` and is therefore the production
  decision rather than a prototype one.
- **Bytes and DevTools readability.** The registrations are additions (§1) and the keyframes grow from one
  composed declaration per frame to one per leaf; neither is counted here.
- **3D transform wholes**, for the reason the transform probe gives.

## Reproducing

```bash
pnpm bundle && node scripts/spike-typed-leaves.mjs
```
