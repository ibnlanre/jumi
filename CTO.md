Approved. Phase 2 is genuinely closed now.

The strongest result is not the percentage of values converted to variables. It is that **all 71 keys now have an explicit, measured strategy**, and the gate will fail if Tailwind's emitted behavior drifts:

```text
token     7
mixed     7
formula  11
literal  46
──────────
total    71
```

That is exactly the finish line we defined. `literal` is no longer unfinished migration work. It is an intentional representation.

The `backdropBlur` discovery is also a good validation of the sweep. It found something that neither naming intuition nor the previous batch planning had identified. And the `boxShadow` row is probably the best demonstration of why this whole methodology matters: a namespace existing is not enough; emitted behavior is the contract we're consuming.

I would **not restore `scripts/tmp-ns/measure.mjs`**. The generalized `theme-map.mjs` supersedes it and is now part of the gate. Keeping the narrower probe would just create two sources of truth.

One architectural consequence worth recording explicitly is that `creator.theme()` is now effectively a **Jumi abstraction**, despite retaining its old name and call shape. Its semantics are no longer "ask Tailwind's JS theme API." They are:

> resolve a Jumi theme vocabulary entry to the representation appropriate for Tailwind v4 CSS.

That distinction will matter when the Tailwind adapter gets thinner later.

### Next: scanning/candidate discovery

I agree with the sequence. This should be the next dependency we investigate.

But I would start with an inventory again, not implementation.

We need to know exactly what Jumi currently receives from Tailwind's scanner/compiler that it actually needs. In particular:

```text
candidate discovery
deduplication
incremental candidate accumulation
source configuration
arbitrary candidate syntax
variant-bearing candidates
candidate ordering
```

Some of those may turn out not to belong to "scanning" at all.

The key question I'd give DeepSeek is:

> **If Jumi had the complete set of class-like strings present in the user's sources, what information would still be missing before the Jumi model could determine everything it needs?**

That separates discovery from parsing.

For example, if:

```text
animate-rotate-45
hover:animate-scale-110
before:animations
```

are found as raw strings, Jumi may still currently rely on Tailwind to interpret the latter two. That belongs later under variants, not scanner ownership.

So Phase 3 should initially aim for a very narrow answer:

> Can Jumi independently discover the raw candidates it cares about, without yet understanding Tailwind's variant grammar?

If yes, that's another clean dependency we can peel away without accidentally rebuilding Tailwind.

### The aggregate item

I'd park the remaining build-time quadratic for now.

The finalizer changed its importance substantially:

* shipped CSS is now sane;
* browser behavior is correct;
* runtime isn't waiting on a new representation;
* what remains is compiler/intermediate waste.

That's real technical debt, but it is no longer architecture-blocking.

I'd put a measurable threshold on it rather than continuing immediately. Something like:

> Revisit aggregate representation if build/dev-server cost becomes materially noticeable on a real Jumi project or if corpora grow beyond current levels.

That prevents the very productive migration from getting trapped again in optimizing an internal artifact users never receive.

So my call is: **delete the obsolete probe, mark Phase 2 complete, park aggregate optimization, and begin Phase 3 with a measured scanner/discovery inventory before writing any scanner code.**
