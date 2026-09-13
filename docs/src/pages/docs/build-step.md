---
layout: ../../layouts/Docs.astro
title: Why there is a build step.
description: Jumi is a plugin plus an integration, because the animation lists are assembled after Tailwind compiles. Here is what that means, and what it costs you.
---

## Two pieces, two jobs

Jumi ships a plugin and an integration, and they are not interchangeable:

| | What it is | What it does |
| --- | --- | --- |
| The plugin | `@plugin "@ibnlanre/jumi"` | Teaches Tailwind Jumi's utilities, so `animate-fade-in` and `animation-duration-[600ms]` compile to real CSS |
| The integration | `jumi()` from `@ibnlanre/jumi/vite`, or `@ibnlanre/jumi/postcss` | Assembles the animation lists once every `animate-*` class has been compiled |

Wire up only the plugin and your utilities compile, your page has no animations, and nothing warns you. That is why the installation guide starts with the integration: it is the half that has to be there.

## What the second step does

`animations` is a gathering class. It has to produce one list per animation longhand, covering every `animate-*` utility on the element:

```html
<div class="animate-rotate-45 animate-fade-in">…</div>
```

```css
.animations {
  animation-name: var(--jumi-rotate-…-animation-name, var(--jumi-animation-name)),
                  var(--jumi-fade-in-…-animation-name, var(--jumi-animation-name));
  animation-duration: …;
  /* one entry per animated slot, for each longhand */
}
```

Two things make that impossible to write while any single utility is being compiled. The lists depend on **which other classes are present**, and their order is the order the browser resolves them in — `animation-composition: replace` gives the last entry the win. Both facts are only settled at the end of the build.

`animations` is one of two carriers; `transitions` is the other. It composes a `transition` shorthand from whichever `transition-property/…` motions are on the element, and it has the identical problem — the list depends on which utilities exist — so it is assembled the same way. Everything below applies to both.

## The three places that list could live

There are only three, and each one gives up something:

| Written… | Locality | Freshness |
| --- | --- | --- |
| **In the `animations` utility body** | ✓ the body travels with the class — `*:animations`, `before:animations` and `@apply animations` all carry it | ✗ Tailwind caches a utility's output per candidate, so a list that depends on other classes is reused stale |
| **In a separate rule at a literal selector** | ✗ the rule that needs it has moved — a variant re-parents the class body, so `.animations` is not where `*:animations` ended up | ✓ it is rewritten whenever the lists change |
| **After Tailwind emits** | ✓ written into each rule the class ended up in, wherever that is | ✓ computed once every class has been compiled |

The first two are complements rather than alternatives: locality wants the list inside the class, freshness wants it outside. That is the entire reason the step exists, and it is why no `@plugin` configuration can stand in for it.

Said another way, four things have to be true at once — the lists must be **fresh**, and they must reach the element in the **direct**, **variant** and **`@apply`** cases. A Tailwind plugin callback runs per candidate, before the stylesheet is finished, so there is no point inside one that has all four.

## What it leaves behind

Nothing of Jumi's. The integration writes the assembled longhands into each rule, then removes the internal names it used to find them. What ships is the CSS above — ordinary `animation-*` declarations, next to the values your `animate-*` classes declared. No markers, no runtime, no JavaScript.

## Where the step goes

Anywhere that runs after Tailwind and before the CSS is served. Jumi ships an integration for each shape a build tends to take, and [Installation](/docs/installation/) has the exact wiring for all three. If you are migrating, the short version is that Jumi's Vite entry replaces Tailwind's:

```diff
- import tailwindcss from '@tailwindcss/vite'
+ import jumi from '@ibnlanre/jumi/vite'

  export default defineConfig({
-   plugins: [tailwindcss()],
+   plugins: [jumi()],
  })
```

Because it is a plain step over CSS, it also composes with anything else that owns the stylesheet — another PostCSS plugin, a framework's build, or a `finalizeCss` call after the Tailwind CLI.

> **Could Tailwind do this itself?** Not today. Its plugin API can add a base-layer rule, or a utility whose body variants move, but it offers no point at which a plugin sees the finished rules with the compiler's final state. A hook there would remove the need for an integration entirely; until then, this step is the price of the four properties above.
