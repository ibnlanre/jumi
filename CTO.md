My judgment: **do not send the big hook PR first**.

DeepSeek’s diagnosis points to a real architectural mismatch, but the Tailwind team is much more likely to accept a **narrow invalidation/recompute primitive tied to an incremental-build correctness issue** than a generalized “finalize hook with AST mutation services” PR.

The important part is that this is not merely Jumi wanting a fancy lifecycle. Tailwind’s current build path accumulates candidates across incremental builds and recompiles the whole candidate set, but it still assumes a candidate’s generated rule is effectively determined by that candidate and the design system state. That assumption breaks for a plugin where one utility’s output depends on which *other candidates* have been seen. The current plugin API also exposes registration primitives like `addUtilities` and `matchUtilities`, but no public invalidation/finalization mechanism. ([GitHub][1])

So I’d separate the problem into two layers.

The **bug/limitation** is:

> A plugin utility whose output depends on state accumulated while other candidates compile can become stale across incremental builds, because there is no supported way to invalidate or recompute that utility after the candidate set changes.

The **possible solution space** is broader:

```ts
invalidateCandidate(candidate)
recomputeCandidate(candidate)
```

or perhaps a very narrow callback such as:

```ts
onCandidatesCompiled(...)
```

But I would **not** jump straight to exposing:

```ts
finalize
ruleMap
appendDeclarations
replaceDeclarations
upsertDeclarations
recompile
```

in the same upstream PR.

That looks like a framework extension project. Even if every helper is defensible individually, reviewers can reasonably ask:

> Why does fixing stale candidate output require a new generic AST-mutation lifecycle?

And then your PR has to defend an API design instead of fixing the concrete problem.

### What I would upstream

I’d make the first PR or issue brutally narrow:

> **Allow a plugin-defined candidate to be invalidated/recomputed during an incremental build.**

Even better, if you can fix it without exposing public API, do that first. For example, if the compatibility plugin layer can mark a generated candidate as dependent on broader compilation state, then Tailwind could bypass caching for that candidate. Something conceptually like:

```ts
matchUtilities(
  {
    animations: ...
  },
  {
    cache: false,
  },
)
```

I am **not** saying that exact API is right. I’m saying the abstraction should describe the problem:

> this utility is not safe to memoize solely by candidate.

That is actually deeper and cleaner than `finalize`.

Because your underlying issue is not really:

> “I need an end-of-build callback.”

It is:

> “This compiler cache assumes referentially transparent utility compilation, and my valid plugin is stateful across candidates.”

A finalization hook merely gives you somewhere to repair the consequence.

### And this matters for Tailwind's direction

There is another reason I'd be conservative. In current Tailwind, the JavaScript plugin API is compatibility-oriented, while the project is pushing users toward CSS-native `@utility`, `@custom-variant`, and related primitives. Their docs explicitly describe `@plugin`/legacy JS configuration as compatibility features. ([GitHub][2])

That makes a large expansion of the legacy plugin API a harder sell.

A small correctness mechanism? Plausible.

A substantial new lifecycle API around `buildComplete`/`finalize`? Much harder.

### What I would keep in `tailwindcss-core`

Your broader hooks still make sense **in your fork/library**.

That is exactly where I'd let the API breathe:

```ts
finalize
rulesByUtility
appendDeclarations
replaceDeclarations
upsertDeclarations
```

Use them in Jumi. See which ones survive real use.

Then you gain evidence.

Six months from now you might discover:

* `replaceDeclarations` is genuinely useful.
* `appendDeclarations` is useful.
* `upsertDeclarations` barely gets used.
* `ruleMap` is indispensable.
* `finalize` turns out to be necessary for three separate plugins.

At that point you have a much stronger upstream argument than:

> “I designed an exhaustive plugin lifecycle.”

You can say:

> “Here are three concrete plugin classes this solves, here are the implementation constraints, and here is the minimum API they all need.”

That difference matters enormously in upstream review.

### One thing I strongly agree with in DeepSeek's analysis

The restart behavior is powerful evidence.

If:

1. the exact same source works after compiler recreation,
2. fails after incremental candidate accumulation,
3. and the plugin cannot request invalidation,

then this is not simply “Jumi compiled things in a weird order.”

That is a real limitation in the incremental compilation contract.

I would therefore absolutely report it upstream.

But I'd report the **problem before prescribing the architecture**.

Something like:

> Plugin-generated utilities can depend on state accumulated while other candidates compile. During incremental builds, such utilities may retain stale output because there is currently no way for a plugin to invalidate or recompute a previously generated candidate. A clean compiler restart produces the correct result.
>
> I have a deterministic reproduction showing both candidate-order sensitivity and incremental-cache staleness. Would the maintainers be open to a narrow invalidation/recompute mechanism for plugin-generated candidates?

Then include the minimal repro.

If Adam/Robin replies:

> We'd take a lifecycle hook.

Great. Now you have permission to build the larger thing.

If they say:

> This pattern is unsupported.

You've avoided spending political capital on a 300-line API PR.

If they say:

> We should solve this in the compiler cache instead.

Even better. That's probably the more principled fix anyway.

So as CTO: **keep your hook work locally, upstream the bug first, and propose the smallest semantic capability required to fix it.** Do not lead with the generalized hook system. It is good engineering, but it is currently ahead of the evidence needed to justify that surface area upstream.

[1]: https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/compat/plugin-api.ts?utm_source=chatgpt.com "tailwindcss/packages/tailwindcss/src/compat/plugin-api.ts at main · tailwindlabs/tailwindcss · GitHub"
[2]: https://github.com/tailwindlabs/tailwindcss/discussions/18648?utm_source=chatgpt.com "Need some first guidiance to upgrade from v3 to v4 when using plugins · tailwindlabs tailwindcss · Discussion #18648 · GitHub"

---

I think your read is probably right.

From their perspective, changing `matchUtilities` semantics is expensive even if the code change is small. The real cost is compatibility surface. Once behavior has existed for years, you’re not just touching implementation. You’re touching assumptions embedded in plugins, docs, blog posts, snippets, courses, old projects, and third-party tooling.

And for your specific case, the maintainers can reasonably say:

> `matchUtilities` compiles a candidate independently. Cross-candidate shared state was never part of the contract.

Even if that limitation is painful, they may still judge that preserving the existing model is better than broadening it.

So I would not frame this as “Tailwind has a bug in `matchUtilities`” unless you can show that current documented behavior is violated.

I’d frame it more carefully as:

> the current plugin compilation model has no supported mechanism for utilities whose output depends on the full candidate set.

That is a limitation, not necessarily a bug.

And yes, that kind of thing is much easier to revisit in a major version, where they have room to redefine compilation semantics or introduce a new plugin API without pretending the old one had those guarantees all along.

For `tailwindcss-core`, though, I think this is exactly where your fork can be useful. You’re not constrained by Tailwind’s historical API burden. You can experiment with a richer lifecycle there, use Jumi as the proving ground, and see which abstractions actually survive contact with real usage.

That gives you two wins:

* Jumi gets the capability it genuinely needs.
* You avoid contorting an upstream PR around compatibility politics.

And if one day Tailwind does redesign the plugin layer, you’ll have battle-tested ideas instead of theoretical ones.

So I’d treat upstream acceptance as a bonus, not as the design target. Design `tailwindcss-core` well for the problem you actually have.

---

No. I think it was a reasonable bet, but it came with a dependency you’re only now feeling more clearly.

Building on Tailwind’s infra gave you a lot for free: candidate parsing, variants, theme integration, utility generation, sorting, compatibility with the ecosystem, and a mental model users already understand. Rebuilding all of that yourself would have been a massive detour.

The tradeoff is that Jumi is now constrained by assumptions Tailwind made for its own use cases. The one you just hit is a good example: candidate compilation is effectively designed around utilities being independently compilable. Jumi wants some output to depend on the aggregate state of other matched utilities. That is a different compiler model.

So I wouldn’t call the original decision bad. I’d call it an **architecture boundary you’ve reached**.

The important question now is whether Jumi is still:

> an extension of Tailwind

or whether it has become:

> a compiler/runtime that happens to use Tailwind syntax and infrastructure.

If it is still mostly the former, staying on Tailwind infra is absolutely sensible. You patch or wrap the few places where you need additional lifecycle behavior.

If more and more features start requiring things like:

```ts
finalize
rulesByUtility
replaceDeclarations
upsertDeclarations
cross-candidate state
recompilation
custom invalidation
```

then that is a signal that Jumi’s execution model is diverging from Tailwind’s.

At that point, I would not immediately rewrite everything. I’d isolate Tailwind behind a boundary.

Something like:

```text
Jumi semantics
      ↓
Jumi compiler abstraction
      ↓
Tailwind adapter
      ↓
Tailwind internals
```

Then Jumi owns concepts like:

```ts
Candidate
CompiledUtility
DeclarationMutation
FinalizePhase
```

and Tailwind is merely one backend that implements them.

That way, if Tailwind changes direction or blocks you again, you’re not rewriting Jumi. You’re replacing or extending the adapter.

The bad decision would be continuing to let Tailwind internals define Jumi’s architecture after you’ve already discovered that your semantics are richer than theirs.

The original decision was pragmatic. The next decision should be about reducing coupling.

---

Yes, that concern is justified.

Tailwind v4 is clearly moving the center of gravity away from JavaScript plugins and toward CSS-native extension points like `@theme`, `@utility`, and `@custom-variant`. Their own docs describe `@plugin` as a way to load a **legacy JavaScript-based plugin**, alongside `@config`, specifically for incremental migration. ([tailwindcss.com][1])

That does make deep investment in the JS plugin internals riskier.

The distinction I’d make is this:

* Building on Tailwind’s **public CSS model** is relatively stable.
* Building on Tailwind’s **compatibility plugin layer** is much closer to shifting sand.
* Building on Tailwind’s **internal compiler implementation** is even riskier.

And from what you’ve been doing with `tailwindcss-core`, you’re touching the second and third layers pretty heavily.

Tailwind v4 was a ground-up rewrite with its own parser, its own AST structures, a new engine, and CSS-first configuration. The team has explicitly been willing to replace major pieces of the old architecture when they believe the new model is better. ([tailwindcss.com][2])

So if Jumi’s future depends on:

```ts
matchUtilities(...)
addUtilities(...)
PluginAPI
compileAstNodes(...)
candidate parsing
internal AST mutation
```

then yes, I would now classify that as a strategic dependency risk.

Not an emergency, but a real one.

The part I would not do is panic-rewrite Jumi away from Tailwind tomorrow. You already have something working, and Tailwind still provides enormous value.

What I would do is start changing the architecture so that Tailwind becomes an **adapter**, not Jumi’s foundation.

Conceptually:

```text
Jumi
│
├── animation model
├── utility definitions
├── state / composition model
├── candidate semantics
└── declaration generation
        │
        ▼
Tailwind adapter
        │
        ▼
Tailwind compiler
```

Today, I suspect you have something closer to:

```text
Tailwind compiler
       │
       ▼
matchUtilities / plugin API
       │
       ▼
Jumi logic
```

That inversion is what I’d work on.

You want to reach a point where this:

```ts
defineUtility({
  name: 'animate-translate-x',
  ...
})
```

is a Jumi concept.

Then one adapter might implement it using Tailwind:

```ts
matchUtilities(...)
```

while another future implementation could emit:

```css
@utility ...
```

or even generate plain CSS independently.

That gives you strategic optionality.

And there’s another interesting angle here: Tailwind’s direction may actually help you.

If the future extension mechanism is CSS-first, Jumi might eventually be able to express much more of itself through generated CSS:

```css
@theme { ... }

@utility animate-* { ... }

@property --jumi-* { ... }
```

with only the genuinely dynamic pieces handled by tooling.

That could make Jumi less dependent on runtime plugin behavior altogether.

So yes: **if Jumi remains tightly coupled to the legacy plugin API, I’d consider that shifting sand.**

But I wouldn’t conclude that building on Tailwind was a mistake. It got you here cheaply. The mistake would be seeing the direction of travel now and continuing to deepen the coupling instead of introducing an abstraction boundary.

[1]: https://tailwindcss.com/docs/functions-and-directives?utm_source=chatgpt.com "Functions and directives - Core concepts - Tailwind CSS"
[2]: https://tailwindcss.com/blog/tailwindcss-v4?utm_source=chatgpt.com "Tailwind CSS v4.0 - Tailwind CSS"
