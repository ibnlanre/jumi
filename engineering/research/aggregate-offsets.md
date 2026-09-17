# Offset aggregates: a value-free keyframe with element-scoped data

_RESEARCH — measured, not shipped. Not a workstream, and not filed._

Three executable books under `scripts/research/`. They are assertions, not tables, and all three exit
non-zero:

```bash
node scripts/research/aggregate-offsets.mjs        # 12 assertions — one element
node scripts/research/cross-element-isolation.mjs  # 11 assertions — several elements
node scripts/research/batching-eligibility.mjs     # 14 assertions — a real sheet vs a batched one
```

The third one compiles the shipped emitter and reads a real element, so it needs a bundle
(`pnpm bundle && …`); it is the one that falsifies this note's original closing claim, and the last
section says what replaces it.

The question they answer: **can one `@keyframes` definition per family serve many motions, with the
authored values living outside it?** The definition would be identified by `(family, stop set)` and
read _buckets_ — element-scoped custom properties — instead of embedding what an author wrote:

```css
@keyframes jumi-translate-x-0-100 {
  0% {
    --jumi-translate-x: var(--x-0, var(--jumi-translate-x));
  }
  100% {
    --jumi-translate-x: var(--x-100, var(--jumi-translate-x));
  }
}
```

and the candidates contribute data only — `--x-0: 0px; --x-100: 30px` — writing no definition, no
value and no timing into its identity.

## The four findings

### 1. Value-free keyframes are viable

One definition, two unrelated elements, different values, independent curves:

```text
A  --x-0: 0px   --x-100: 30px    0px      | 7.5px     | 15px      | 22.5px    | 30px
B  --x-0: 50px  --x-100: 120px   50px     | 67.5px    | 85px      | 102.5px   | 120px
```

The same definition also serves two different **timings** on those elements — A at `500ms` completes
and holds at `30px` while B runs its own `2s` clock — because the instances are element-local. This
is the property the whole idea rests on, and it holds: a definition with no authored value in it is
reusable across whatever elements happen to use the family.

### 2. Stop vocabulary is semantic

`{0,100}` and `{50,100}` cannot be unioned into `{0,50,100}` without changing what the `{0,100}`
program means. Measured, x spanning `0→100` beside a foreign `50%` stop:

```text
intended   0px | 7.5px  | 15px  | 22.5px | 30px
measured   0px | 0px    | 0px   | 15px   | 30px     ← pinned at its previous bucket, then a rush
```

The interpolation is not merely re-segmented, it is wrong — x sits at its previous bucket until the
foreign stop, so the composite goes non-monotonic. So the stop set belongs in **definition**
identity. Many stop-set definitions may coexist for one family, and an element activates only the one
its candidate selected: a single stop at `0` holds `30px` and acquires no `35%` stop, and a single
stop at `35` rises to `50px` at 700ms and acquires no `0%` stop, with both definitions in the sheet.

### 3. Animation instances are ownership channels

Two instances cannot own the same animated property unless they are the same timing program. Measured
three ways on one element, with both instances reading the _same_ element-scoped aggregate:

```text
durations 500ms + 2000ms   only the later clock is visible; the 500ms program is gone
easings   linear + ease-in only the later easing is visible
delay     0s + 1000ms      the property JUMPS BACK: 500ms:7.5px 5px | 1000ms:0px
```

and the heterogeneous case, both instances writing the composite:

```text
x read 0px | 3.75px | 0px | 15px | 30px     ← neither program, and non-monotonic
```

while each instance **owning its own leaf** carries both stop sets and both clocks exactly:

```text
x {0,100} + y {50,100}   0px | 7.5px 12.5px  | 15px 25px    | 22.5px 22.5px | 30px 20px
x 500ms + y 2000ms       0px | 30px 5px       | 30px 10px    | 30px 15px     | 30px 20px
```

So an instance is an _ownership channel_, not merely a clock: one animated property per instance.
Sharing a **definition** needs no agreement at all — finding 1 shares one across different elements
and different clocks. What needs agreement is the **instance**: two motions can share one only when
their whole timing program agrees, and then the browser has to be told so exactly once, because two
identical activations are still two instances and it does not dedupe.

### 4. Element-local buckets are the isolation boundary

Buckets must not inherit. The falsification is in the book and it passes the _other_ way — with
`inherits: true` a child that declares only one of its definition's two buckets consumes its
parent's:

```text
inherits: false   child  50px | 50px | 50px | 50px | 50px     (own value, or the initial)
inherits: true    child  50px | 45px | 40px | 35px | 30px     ← 30px is the PARENT's --x-100
```

The first version of that arm could not fail, because the child declared both buckets and its own
declarations masked any inheritance. It is recorded that way on purpose: an arm that cannot fail is
not evidence, and this one is the reason `inherits: false` belongs in the semantic contract rather
than in emitted boilerplate.

## The rule that is easy to rediscover the hard way

> A frame that animates `--leaf` must not use `var(--leaf)` as the fallback of the value assigned to
> `--leaf`. That is a cycle, and it resolves through the registered initial value.

Measured: a child whose frame was `--jumi-translate-x: var(--x-0, var(--jumi-translate-x))` with
`--x-100` unset read `0px` at every instant — the registered initial — not the resting value it was
reaching for. The aggregate arrangement escapes this by animating the **property** and falling back
to the **leaf**; the per-leaf arrangement cannot use a self-fallback at all, so a phrase must write
its complete own stop data.

## The identity separation

```text
definition identity   (family, stop set)                    value-free, stylesheet-global
instance identity     (stop set, timing, ownership channel) element-local
values                buckets                               element-local
composition           property/leaf ownership               instance-local
```

## Not decided: which arrangement is the production representation

```text
aggregate instance                     per-leaf instance
owns the composite property            owns one leaf
clean fallback semantics               cannot use a self-fallback
batches several leaves into one clock   independent timing and stop sets
only under a sheet-level proof          always composable
```

Both are measured. The aggregate is simpler where it applies and impossible where it does not; the
per-leaf form is the general one and is what the typed path already does.

Both are measured. The aggregate is simpler where it applies and impossible where it does not; the
per-leaf form is the general one and is what the typed path already does.

## The next question, and the answer that does not survive

> **Can Jumi determine, without element-context inference, when several constituents share the same
> full timing program and therefore qualify for aggregate batching?**

An earlier version of this note answered **yes**, from sheet-level equality of timing writes: a scoped
control writes its own component rung and nothing else, so if the sheet writes both components' rungs
identically — and writes no other rung that only one of them reads — the pair must share a program.

**That answer is falsified.** A third book, `scripts/research/batching-eligibility.mjs` (14
assertions), compiles the real sheet and reads a real element. The sheet contains both constituents
and **both** controls:

```text
sheet     animate-translate-x-[30px]  animate-translate-y-[20px]
          animation-duration-500/translate-x   animation-duration-500/translate-y

element   animate-translate-x-[30px]  animate-translate-y-[20px]
          animation-duration-500/translate-x              ← the y control is deliberately absent
```

Both component rungs in the sheet say `500ms`, so the criterion authorises batching. Production
resolves two programs; the batched representation — one instance, the clock the pair shares — cannot
represent that:

```text
production   500ms, 1000ms   0px | 24.0721px 8.17021px | 30px 16.0481px | 30px 20px | 30px 20px
batched              500ms   0px | 24.0721px 16.0481px | 30px 20px      | 30px 20px | 30px 20px
```

They disagree on `y` at 250ms and 500ms. The general statement is the one that keeps recurring here:

> **presence of a candidate in the sheet is not presence of that candidate on this element.**

Sheet symmetry is a _positive_ check, and a missing class breaks it silently; a `hover:` control makes
it worse, since the element's carrying it is state-dependent and the two variant classes are
textually symmetric while an element can carry either.

### What replaces it: two negative existence claims

Batching is safe when the sheet contains **no rung that can independently address either
constituent** — or when the only rung written is one **both constituents read by construction**. Both
survive element selection precisely because they are negative existence claims over the sheet, which
a missing class cannot silently violate. Both are measured, and in each case production and the
batched representation agree **exactly**:

```text
no constituent-addressable rung          both resolve 1s, the sheet default     production == batched
attribute rung (…/translate)             both read it by construction, 500ms    production == batched
```

which is the conservative rule and the permissive one, and they are the whole of what is proven. The
tempting case is also measured, and it is why the criterion looked right: **when the element does
carry both controls**, production equals the batched representation exactly. The defect is not in the
batched arrangement; it is in believing the sheet when only the element knows.

The guarantee is **relative to the sheet, not to the element**. An element-level override of one
constituent's rung (`--jumi-translate-x-animation-duration: 250ms` inline) diverges from the batched
representation even under a sheet with no scoped controls at all — measured, and asserted. So the safe
rule earns its safety by giving up the thing the architecture is otherwise built to allow, which is
cascade-first per-constituent control.

This tightens the fork rather than settling it:

```text
value-free definition sharing     yes — one definition, many elements, different values and clocks
per-leaf instance                 the general semantic model
aggregate batching                an optimization only, and only under a negative sheet-level proof
sheet-level equality of writes    not sufficient
```
