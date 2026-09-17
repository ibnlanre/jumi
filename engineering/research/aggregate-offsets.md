# Offset aggregates: a value-free keyframe with element-scoped data

_RESEARCH — measured, not shipped. Not a workstream, and not filed._

Two executable books under `scripts/research/`. They are assertions, not tables, and both exit
non-zero:

```bash
node scripts/research/aggregate-offsets.mjs        # 12 assertions — one element
node scripts/research/cross-element-isolation.mjs  # 11 assertions — several elements
```

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

So an instance is an _ownership channel_, not merely a clock: one animated property per instance, and
two instances may share a definition only when their whole timing program agrees — in which case they
are one instance and the browser has to be told so exactly once (two identical activations are two
instances; it does not dedupe).

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
only when stop set + timing align       always composable
```

Both are measured. The aggregate is simpler where it applies and impossible where it does not; the
per-leaf form is the general one and is what the typed path already does.

## The next question, and its answer

> **Can Jumi determine, without element-context inference, when several constituents share the same
> full timing program and therefore qualify for aggregate batching?**

Measured, and the answer is **yes**, because the compiler already writes the evidence. A control
writes its scope's variable and nothing else:

```text
sheet                                       writes
animate-translate-x-[5] + y-[7]             nothing at the component rung
  + animation-duration-500/translate-x      --jumi-translate-x-animation-duration
  + animation-duration-900/translate-y      --jumi-translate-y-animation-duration
```

and each slot's chain reads a component rung, an attribute rung and a global rung. So two
constituents qualify for batching exactly when

```text
their stop sets are equal
AND their modifiers/names are equal
AND every rung of their timing chains is either unwritten in the sheet,
    or written identically for both components
```

All three are sheet-level facts, including variant-prefixed controls: a control behind `hover:` still
declares the component rung, so the pair is disqualified rather than conditionally batched. When a
pair qualifies, coalescing needs no knowledge of which classes coexist, because both candidates write
the **same activation variable** and the element gets one instance automatically.

That makes aggregate batching an **optimization over a per-leaf model**, not a replacement for it —
and it is the shape worth taking into a decision record before any of it is emitted in production.
