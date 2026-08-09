## What an "effect" is, mechanically

An effect (`creator.effect('fade-in')`) is a **single-element keyframe timeline**:

```ts
effect(attribute) {
  effects.add(attribute)
  keyframes.set(attribute, effectKeyframes[attribute])  // 0%/50%/100% keyframes
  return `jumi-${attribute}`
}
```

It produces a named animation (`jumi-fade-in`) that plays **on the element that carries the class**, and it's wired in as a slot in the `animation` list. A keyframe is a closed timeline — it has no knowledge of *where* its element sits among siblings. `@keyframes` can't read `sibling-index()`; `animation-name` is discrete and can't be `calc()`'d.

## What stagger is, mechanically

Stagger is the opposite axis entirely. It doesn't describe *what* happens to an element — it describes *how timing differs across siblings*. It distributes a **numeric part** (today: `animation-delay`) per child:

```ts
stagger('animation-delay', ({ index, value }) =>
  index === null
    ? `calc((sibling-index() - 1) * ${value})`   // adaptive
    : `calc(${value} * ${index})`                 // nth-child fallback
)
```

That's why it writes a *variable* (`--jumi-stagger-animation-delay`) into the same data path as `scope('animation-delay')` — it's a **property-path concern**, not a keyframe concern. It's a delay distributor, and it composes with whatever animation the children actually run:

```html
<div class="animate-stagger-forward-100">
  <div class="animate-fade-in">…</div>   <!-- the WHAT (an effect) -->
  …
</div>
```

Stagger provides the *when-relative*; the effect provides the *what*. They're orthogonal and compose precisely because they're separate mechanisms.

## What "stagger as an effect" would have to look like

You *could* force it, but only in the degenerate form: define N named keyframes (one per index) and apply the right one per child via `:nth-child`. That's exactly the enumeration fallback — and it would be strictly worse on every axis:

| | Current (property-style) | Effect-style |
|---|---|---|
| Count-free adaptive (`sibling-index()`) | ✅ | ❌ — `animation-name` can't be `calc()`'d, so a count is always required |
| Composable with any effect/property on children | ✅ | ❌ — each stagger would bake in one specific animation |
| Output size | 1 var rule | N keyframes + N rules per stagger |
| Generalizes to `animation-duration`, `iteration-count`, … | ✅ (any `part`) | ❌ — would need separate effect sets per part |

So making it an effect would force the *worst* version of the design we already rejected — count-required, non-adaptive, non-composable — for the sole gain of calling it an "effect."

## The honest nuance

In **UX language**, "staggered entrance" is absolutely an effect — but the stagger utility is the *timing coordinator*, and the entrance is still `animate-fade-in`/`animate-bounce-in` on the children. If anything, stagger is closer to a **modifier on an effect** ("fade-in, but staggered") than an effect itself — which is exactly the role `--jumi-stagger-animation-delay` plays in the current design: it decorates the delay part of whatever the children animate.

So: mechanically no, it couldn't have been an effect — it lives on the property/timing axis, and that's precisely what makes it count-free, composable, and general.