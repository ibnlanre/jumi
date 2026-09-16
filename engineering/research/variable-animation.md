# What if a constituent animates its own custom property?

_RESEARCH — measured, not shipped. Not a workstream, and not filed._

The CTO's question, after pausing the canonical-body work:

> What if constituent phrases animate their own registered custom properties, while the actual CSS
> property is composed once outside the animation?

Jumi already does half of it. `--jumi-scale` is a composition of three slots, declared once on the
element, and a component phrase writes a per-frame key — `--jumi-scale-x-<id>-0: 1`. What it does
_not_ do is let the keyframe write the **element-level** slot. Instead every frame re-composes the
real property, reading its own leaf, the leaf's frame key, and the element level, in one chain:

```css
@keyframes jumi-transform-27qJ3B {
  0% {
    transform: … var(--jumi-rotate-3d-27qJ3B-0, var(--jumi-rotate-3d)) …;
  }
}
```

The proposal is to stop there — animate the slot, compose the property once:

```css
@property --jumi-skew-x {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
.transform-element {
  transform: … skew(var(--jumi-skew-x), var(--jumi-skew-y)) …;
}
@keyframes jumi-skew-x-abc {
  from {
    --jumi-skew-x: 0deg;
  }
  to {
    --jumi-skew-x: 10deg;
  }
}
```

**It works, and it is worth having — but not as a uniform mechanism.** It interpolates identically
(§1), it makes sibling components independent by default (§2), and it would remove about seven eighths
of the bytes the frames cost (§5) — but only for slots whose value is a scalar. The addressing idiom
splits in two: an **animated** slot must be typed and read _directly_, because its `var()` fallback is
unreachable; only the **whole-versus-leaves** boundary keeps `var(x, fallback)`, and it keeps it by
staying permissive, which is exactly why it cannot animate.

Measured by `pnpm spike:variable-animation` in Chromium 153.0.8010.12 on 2026-09-16, hand-written CSS
with deterministic sampling (each probe `paused`, `animation-fill-mode: both`, stepped by a negative
`animation-delay`). Nothing in `src/` was touched.

## 1 · Registration decides everything, and it cuts both ways

One motion (scale-x `1 → 3` over 1s), three shapes, the same samples:

| shape                                       | the curve                       |
| ------------------------------------------- | ------------------------------- |
| today: keyframe writes the composed `scale` | `1 · 1.5 1 · 2 1 · 2.5 1 · 3 1` |
| proposed: keyframe writes a typed slot      | `1 · 1.5 1 · 2 1 · 2.5 1 · 3 1` |
| control: the same slot, unregistered        | `1 · 1 · 3 1 · 3 1 · 3 1`       |

Today ≡ proposed, exactly. An unregistered slot does not interpolate — it steps at the frame
boundary and holds the endpoint. So **registration is not an optimisation here; it is the
precondition.**

And the same registration kills the fallback:

| registration of `--x`                    | `var(--x, 5)`, `--x` never declared |
| ---------------------------------------- | ----------------------------------- |
| none                                     | `5 1` — the fallback answers        |
| `syntax: "*"`, no `initial-value`        | `5 1` — the fallback answers        |
| `syntax: "<number>"`, `initial-value: 1` | `1` — **the fallback is dead**      |

Jumi's existing registration (`syntax: "*"`, no `initial-value`, see the `property` sink in
`@/helpers/create`) is precisely the one that _preserves_ the addressing idiom, and precisely the one
that cannot interpolate. A custom property cannot both interpolate and be reachable by fallback.

Read at the composition level, the consequences are concrete:

| composition                                        | reads  |
| -------------------------------------------------- | ------ |
| `scale: var(--p8x) 1 1`, registered, authored `2`  | `2 1`  |
| `scale: var(--p8x, 7) 1 1`, registered, unauthored | `1`    |
| `scale: var(--nope, 7) 1 1`, unregistered          | `7 1`  |
| `scale: var(--a, var(--b)) 1 1`, neither written   | `none` |

That last row is the hazard a typed registration _removes_: today, a chain whose every level is
unwritten makes the declaration invalid at computed-value time and the property dies. With a typed
registration there is always a computed value, and the natural thing to give it is the property's own
identity — `1` for a scale, `0px` for a translate, `0deg` for a rotation.

## 2 · The payoff: sibling components stop fighting

Two motions on one property, 1s and 3s, samples at 0.25s:

| shape                                      | 0.25s                              |
| ------------------------------------------ | ---------------------------------- |
| proposed: a variable each                  | `1.5 1.16667` — both motions       |
| today: two keyframes, both writing `scale` | `1 1.16667` — the x motion is gone |
| today + `animation-composition: add`       | `1.5 1.16667` — both motions       |
| today + one shared keyframe (one phrase)   | `1.5` — one motion, as authored    |

Today's default loses the first motion entirely: the second animation _replaces_ the first on the
composed property. The variable architecture makes the two independent by construction. Measured
alongside it, `animation-composition: add` also recovers both — so this is a competing fix for the
sibling case specifically, and a smaller one.

Scroll-driven sibling ranges behave the same way (§6): with `0% 25%` and `25% 100%` on one scroll
timeline, at the end of the scroller the two-animations shape reads `1 3` — the y motion ran, the x
motion never appeared at any scroll position — while a variable each reads `3` (`3 3`), both complete.

**Trap.** `add` is not a free escape hatch inside the variable model. On a _registered_ custom
property it composes with the underlying value as well, so an element that authors the slot and runs
two animations gets **three** contributions: measured `3 2 2` where two motions were intended.

## 3 · The nested case, which this model relocates rather than erases

A whole-property phrase and a component phrase on one element, both live. The whole phrase has to
write the same leaf the component writes — that is what expanding a whole means:

| `animation-name` order           | 0.25s                                                        |
| -------------------------------- | ------------------------------------------------------------ |
| whole first, component second    | `1.5 1.25 1.25` — component wins `x`, whole supplies `y`/`z` |
| component first, whole second    | `1.25 1.25 1.25` — whole wins all three, component invisible |
| as the first, with `add` on both | `3.75 2.25 2.25` — the underlying value counts too           |

So the shared leaf is still settled by order — but by **`animation-name` order**, which CSS defines,
rather than by **candidate-arrival order**, which nothing defines and which is the defect the
canonical-body work exists to fix. That is a real improvement in kind and not a deletion: `scale` +
`scale-x` would still be order-dependent, for a reason a reader can see in the emitted CSS.

Read against the CTO's list of problems the model might erase: sibling merging — yes. Nested writer
routing, "which intermediate must be expanded", candidate-order-dependent bodies — **no**; they move
from the compiler's shared definition to the browser's animation list.

## 4 · The two things a typed slot cannot hold, and the one reshape

A function-valued slot, `--jumi-filter-blur`, animated `blur(0px) → blur(8px)`:

| shape                                               | the curve                                                              |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| today: the keyframe writes the composed `filter`    | `blur(0px) · 2px · 4px · 6px · 8px`                                    |
| proposed as-is: the slot registered `syntax: "*"`   | `blur(0px) · blur(0px) · blur(8px) · blur(8px) · blur(8px)` — discrete |
| proposed as-is: the slot registered `<length>`      | `none · none · none · none · none` — the property dies                 |
| reshaped: `filter: blur(var(--amount))`, `<length>` | `blur(0px) · blur(2px) · blur(4px) · blur(6px) · blur(8px)`            |

The third row is not a nuance: a typed registration **rejects** a value that does not match its
syntax, so the slot computes to the guaranteed-invalid value and the whole `filter` declaration dies.
The fourth row is the fix — the function stays as text in the composition and its argument is the
typed slot — and it keeps sibling timing (§10): blur over 1s and brightness over 3s are both visible,
where today only the later phrase survives (`blur` pinned at `0px` throughout).

Four further limits, each measured:

| probe                                     | result                                                |
| ----------------------------------------- | ----------------------------------------------------- |
| `<angle>` slot whose `to` frame is `none` | the frame is dropped; the curve stays `0deg`          |
| `<length-percentage>` slot                | interpolates — `0px … 1264px`                         |
| `initial-value: var(--seed, red)`         | the at-rule is dropped, animation reverts to discrete |
| `<length>+` slot, `0px → 30px 20px`       | discrete — a token-count change does not pad          |

So: keywords (`none`, `auto`, `normal`) cannot be frame values; an `initial-value` cannot be themed
through a variable, because it must be computationally independent; and a whole-property tween on a
list-shaped slot (`scale`, `translate`) must normalise to a fixed token count or it will step.

## 5 · The census

From the tree, not from a browser: `src/variables/property.ts` for the slots a phrase can fill, and
the canonical render (`scripts/css-snapshot/snapshot.css`) for what a build emits today.

**The inventory**

|                                     |     |
| ----------------------------------- | --- |
| entries in the property table       | 624 |
| composites — they name their leaves | 104 |
| leaves                              | 520 |
| · scalar-shaped (a bare literal)    | 497 |
| · function-shaped (`css('f', …)`)   | 20  |
| · neither                           | 3   |

The 20 function-shaped leaves are exactly two families: `filter-blur … filter-url` and
`backdrop-filter-blur … backdrop-filter-url`. Every one of them is the reshape case of §4 — a function
whose argument can be a typed slot — so the whole surface is reachable, at the cost of rewriting
twenty declarations and the compositions that read them.

**What the corpus animates, and what it would cost**

|                                                    |                                               |
| -------------------------------------------------- | --------------------------------------------- |
| `@keyframes` blocks / belonging to a phrase        | 42 / 37                                       |
| frame declarations / bytes inside them             | 62 / 9,718                                    |
| `var()` reads inside those frames                  | 294                                           |
| distinct slots the corpus animates                 | 10 — 9 scalar, 1 function (`backdrop-filter`) |
| the same frames restated as slot assignments       | 775 bytes                                     |
| registrations the model adds (9 slots × ~74 bytes) | 666 bytes                                     |
| **today, frames + published per-frame keys**       | **10,820 bytes**                              |
| **proposed, frames + registrations**               | **1,441 bytes**                               |

33 of the 62 frames hold a value that can be restated from data the build already emits. The rest are
an **effect**'s frames, which write the composed property directly and have no composition to
decompose — untouched by any of this. Two of the 33 are the wholesale `backdrop-filter` frames, which
need the value decomposed at compile time (`blur(8px)` → `8px` for the amount slot) before they can
be assigned to anything.

## What this does not measure

- **Minified bytes.** The canonical render is unminified, and it is the only one a reader can inspect.
  Minification moves the ratio, not its sign: the removed text is the long
  `var(--slot-<id>-<offset>, var(--slot))` chains, and the added text is short assignments.
- **The author-facing surface.** `--jumi-filter-blur` would become something like
  `--jumi-filter-blur-amount` plus a function in the composition. That is a documented vocabulary, and
  the rename is a public change, not an implementation detail.
- **`animation-composition: add` as a shipped alternative** for siblings. It recovered both motions in
  the measurement, but it also composes with the underlying value (§2) and does nothing for the nested
  case (§3).
- **Legibility in DevTools** beyond the shape of the emitted CSS: the model shows one variable per
  motion rather than one re-composed chain per frame, which should read better, but that is a claim
  about readers, not a measurement.

## What it would change, if it is taken up

1. every slot a build animates gets a typed `@property`, with the property's identity as its
   `initial-value`;
2. the composition is emitted once and reads its leaves **directly** — the fallbacks it carries become
   unreachable, and their job (the resting value) is done by the registration instead;
3. the 20 function-shaped leaves are reshaped into function-text plus a typed argument, and a phrase
   whose value is a function is decomposed at compile time to fill them;
4. a whole-property phrase on a list-shaped slot normalises its token count, or it steps.

Note the relationship to the design that survived the earlier falsifications (the static body
`var(--I-<id>-<offset>, var(--I-expanded-<id>-<offset>, var(--I)))`). That design kept a middle rung —
an "expanded" slot — because the animated slot had to stay permissive. This spike shows the middle
rung is only needed if the animated slot is the _whole_. Animate the **leaf**, register it typed, read
it directly, and the chain collapses to one rung at the boundary.

## Reproducing

```
pnpm spike:variable-animation
```

Sections §1–§10 are browser probes over hand-written CSS; §11 is the census over the tree and the
canonical render.
