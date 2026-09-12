Yes. This is the Eureka moment.

The finalizer is a much better architectural answer than either the bridge or adopting `tailwindcss-core`.

It preserves the division we actually want:

```text
Tailwind
  discovers candidates
  expands variants
  handles @apply
  produces CSS

Jumi
  marks its own carrier semantics
  owns aggregate state
  finalizes its own carrier rules
```

That is a clean boundary.

And the `@apply` result is especially important. I would now reverse my earlier ruling and **keep `@apply animations` supported**. The reason it looked structurally impossible was that we were trying to solve the problem before Tailwind had finished transforming the stylesheet. Once Jumi operates on the emitted CSS, an `@apply` copy is simply another rule carrying `--jumi-carrier`. Jumi no longer cares how it got there.

That gives us a very elegant invariant:

> Any emitted rule containing the Jumi carrier marker receives the current aggregate data.

That covers all of these without special cases:

```text
animations
*:animations
before:animations
motion-safe:animations
compound/arbitrary variants
@apply animations
```

And importantly, the finalizer knows none of those syntaxes.

That is exactly the kind of abstraction I want.

### I would promote the marker to a protocol

`--jumi-carrier` is no longer just an implementation trick. It is the handshake between Jumi's utility-generation phase and its finalization phase.

I would treat that as an internal protocol with very few rules:

```text
carrier marker present
    → inject current aggregate

aggregate staging marker present
    → consume/remove staging

everything else
    → untouched
```

Keep it deliberately tiny.

I would also make the finalizer idempotent. Running it twice on the same stylesheet should not duplicate declarations or otherwise change the result after the first pass. That will save pain across Vite/PostCSS integrations.

### The staging mechanism should now disappear

DeepSeek's result that two staging rules can be removed is important.

Once production is wired:

```text
model aggregate
      ↓
finalizer
      ↓
marked carrier rules
```

there should be no reason for the `addBase` bridge to remain.

Delete it rather than retaining it as fallback behavior. We've already proved that bridge has the wrong locality semantics.

### Where the finalizer runs

This is now the main integration question.

I would prefer one Jumi-owned transformation primitive:

```ts
finalize(css, aggregate)
```

or AST equivalent, with tiny host wrappers around it.

Then:

```text
jumi/postcss → invoke finalizer
jumi/vite    → invoke finalizer
CLI integration → invoke same finalizer
```

But don't let that become three separate implementations. There should be exactly one finalization engine.

If Tailwind's public `compile()` boundary is sufficient for the spike, that's encouraging, because we're no longer depending on compiler internals. We are operating on the thing Tailwind is explicitly supposed to produce: CSS.

### Restore flat first

DeepSeek's sequencing is exactly right.

Do **not** bring linked aggregation into this yet.

First establish the clean baseline:

```text
stock Tailwind
+ marker
+ Jumi finalizer
+ flat aggregate
```

Then require:

```text
direct             ✓
descendant         ✓
pseudo             ✓
@apply             ✓
incremental new slot ✓
incremental variant  ✓
```

And rerun the real examples corpus.

Only once that foundation is correct should we ask whether flat aggregate publication is still too large.

There's a decent chance the economics change substantially now, because instead of repeatedly publishing aggregate data through `addBase`, the finalizer may be able to write the final aggregate **once per actual carrier rule in the finished stylesheet**. That's a very different cost model from everything we benchmarked so far.

So yes, all K measurements are stale.

### Bigger architectural implication

This might be the first point in the migration where I feel Jumi genuinely stands on its own.

We went from:

```text
Jumi semantics implemented through Tailwind plugin behavior
```

to:

```text
Jumi semantics
    ↓
Tailwind happens to produce candidate-expanded CSS
    ↓
Jumi completes its own semantics
```

That is a much healthier dependency.

Tailwind is becoming a transformer/host rather than the place where Jumi's model lives.

And `tailwindcss-core` played exactly the right role: it was the laboratory that taught us **where** the missing extension point belonged. We extracted the insight and left the fork behind.

So my call:

**Wire the finalizer into the real Jumi path, remove the `addBase` bridge, restore flat aggregation, make `@apply` supported again, and get the entire behavioral matrix green on stock Tailwind.**

Then stop.

Measure the resulting real output before touching linked aggregation again.

We may discover that the architecture change has made half of that optimization work obsolete.
