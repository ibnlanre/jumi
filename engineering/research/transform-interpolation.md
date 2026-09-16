# Does decomposing a whole `transform` motion change it?

_RESEARCH — measured, not shipped. Not a workstream, and not filed._

The ruling made this the gatekeeper for the pivot:

> Whole-before-component gives exactly the ownership semantics we want, but only if the whole motion also
> writes the constituent slots. … For `transform` that is potentially semantics-changing. So I'd do the
> transform interpolation prototype before changing `computeSlots()` or production ordering.

And it named the three outcomes in advance: **A** equivalent across the meaningful surface, **B** diverges
only for mismatched or reordered wholes, **C** diverges even for ordinary matched cases.

**The answer is B — and the boundary is sharper than "mismatched".** The operative test is not whether the
two ends match. It is **whether the author's function order is Jumi's composition order.** When it is not,
the decomposed form does not interpolate the motion differently — it describes a **different transform**,
because Jumi's composition is a fixed sequence of seven functions and a native list applies its functions
in the order the author wrote.

Measured by `node scripts/spike-transform-interpolation.mjs` in Chromium 153.0.8010.12 on 2026-09-16,
comparing computed matrices at 0/25/50/75/100%. The decomposed side uses the substrate the real build
emits — `--jumi-transform` and the seven intermediates it reads, lifted out of a compiled sheet verbatim —
so the comparison is against Jumi's own composition, not a reconstruction of it. Nothing in `src/` was
touched.

## The result, in three groups

| group                              | cases |                                                                      |
| ---------------------------------- | ----- | -------------------------------------------------------------------- |
| **exact** — same motion, same path | 4     | every matched case, identical to <1e-6 at all five points            |
| **same endpoints, different path** | 2     | `translate → rotate`, `scale → translate`                            |
| **a different motion**             | 3     | different function counts, different function order, `none → a list` |

### Exact (4 of 4 matched)

`translate → translate`, `rotate → rotate`, `scale → scale`, and one three-function sequence written in
Jumi's own order. All five sampled matrices are identical to six decimal places. **Decomposing a matched
whole transform in Jumi's order is exact** — outcome A holds wherever the comparison is well posed.

### Same endpoints, different path (2)

| case                                    | 25%    | 50%    | 75%    |
| --------------------------------------- | ------ | ------ | ------ |
| `translate(100px, 0)` → `rotate(90deg)` | 28.701 | 35.355 | 23.097 |
| `scale(2)` → `translate(100px, 0)`      | 18.750 | 25.000 | 18.750 |

(worst matrix component, native against decomposed). The endpoints agree and the path does not: native
converts both ends to matrices and decomposes, while the decomposed form interpolates each leaf and
rebuilds the fixed list each frame. This is outcome B exactly — expressible as leaves, interpolates
differently, so it must keep the property.

### A different motion (3)

| case                                                                      | endpoint difference |
| ------------------------------------------------------------------------- | ------------------- |
| `translate(100px, 0)` → `translate(100px, 0) rotate(90deg)`               | **100.000**         |
| `translate(100px, 0) rotate(45deg)` → `rotate(90deg) translate(100px, 0)` | **70.711**          |
| `none` → `translate(100px, 0) rotate(45deg)`                              | **70.711**          |

These are not interpolation differences. At 100% the native list `translate(100px) rotate(90deg)` is the
matrix `[0, 1, −1, 0, 100, 0]` — the translation is unrotated — while the decomposed form is
`[0, 1, −1, 0, 0, 100]`, because Jumi's composition puts `rotate` before `translate`. **Translating a
motion into leaves is what changes it**, and no ordering of the animation list can recover that.

## Why, and what it means

Jumi's composition is one fixed sequence:

```
perspective · matrix · matrix3d · rotate · scale · skew · translate
```

A native list applies whatever functions the author wrote, in the order they wrote them, and
`transform` interpolates pairwise when the two lists match and through matrix decomposition when they do
not. The two agree only when the author's list _is_ Jumi's sequence restricted to some functions, with the
same functions at both ends.

Today the author's order is preserved exactly, and that is worth stating because it is what would be lost:
a whole transform phrase emits

```css
--jumi-transform-1STdEi: translate(100px, 0px) rotate(90deg); /* the author's list, verbatim */
@keyframes jumi-transform-1STdEi {
  to {
    transform: var(--jumi-transform-1STdEi);
  }
}
```

so the property-level keyframe carries the list as written. **Decomposing is the operation that would
discard the order.** That is the semantics change the ruling was right to gate on.

### The rule this yields

```
component transform motion
  → typed leaf                                    (the pivot, unchanged)

whole transform motion, both ends matched and in Jumi's composition order
  → typed leaves                                  (exact — measured)

whole transform motion, otherwise
  → the actual transform property                 (native list interpolation, order preserved)
```

The third row is broad, and it is the honest reading of the data rather than a hedge: **any** whole
transform phrase not written in Jumi's order falls into it, and `translate(…) rotate(…)` — the order an
author reaches for by habit — is not Jumi's order. So `transform` is the hybrid's clearest case, and it
splits whole transform motions into two categories rather than exempting the property.

Two consequences worth naming:

- **The component-override guarantee is narrower for `transform` than for `scale`.** It applies where the
  whole participates in the decomposed representation, and a whole transform motion usually will not. That
  is outcome B's own caveat, and it is now measured rather than suspected.
- **The census's 78% is unaffected.** `transform`'s _constituents_ — `rotate-x`, `rotate-angle`, `skew-x`,
  `skew-y` — are typed leaves in the component path exactly as before. What this decides is only whether a
  _whole_ transform motion may decompose, and the answer is "sometimes, and the test is order".

## Corroboration worth recording

The composed chain parses, `perspective(none)` included. That was a real risk: if it were invalid the whole
`transform` declaration would be dropped and every decomposed probe would have read as the identity. The
matched cases read the correct non-identity matrices at 100% (`scale` reads `2.000 0.000 0.000 2.000`), so
the chain resolves.

## What this does not measure

- **`rotate3d`, `matrix`, `matrix3d`, `perspective`, `translate3d`'s z axis, and the 3D cases.** The probe
  is 2D: the seven-function composition is exercised, but the four slots with three-valued parts are not.
  A 3D whole would need the same treatment and might diverge in the matched case too, since matrix
  decomposition of a 3D transform is not the same problem.
- **Percentage and `calc()` translations**, where the native and decomposed paths could resolve against
  different reference boxes.
- **The ordering probe's companion question.** The ruling expects, under the pivot, that `skew + skew-x`
  and `drop-shadow + blur` — which today collapse into one shared slot — become independently animated
  slots. That is a question for the compiler prototype, not this one, and it is not measured here.
- **Whether real Jumi pages use whole transform phrases often enough to matter.** The frozen corpus writes
  a `jumi-transform` frame key, so it uses one; how a broader corpus uses them is not measured.

## Reproducing

```bash
node scripts/spike-transform-interpolation.mjs
```
