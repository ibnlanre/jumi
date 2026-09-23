---
layout: ../../layouts/Docs.astro
title: A chain reaction.
description: One motion, passed from child to child. No JavaScript loop required.
---

## Forward stagger

Put the stagger utility on the parent and the children's animation on it too; `*:` applies a utility to every direct child:

```html
<div class="animate-stagger-forward-[120ms]/3 *:animate-bounce-in">
  <div>One</div>
  <div>Two</div>
  <div>Three</div>
</div>
```

The delays are 0ms, 120ms, and 240ms. The `/3` count allows Jumi to generate a fallback for browsers without CSS sibling functions.

## Reverse the order

```html
<div class="animate-stagger-backward-[150ms]/3 *:animate-fade-in-up">
  <div>Last</div>
  <div>Second</div>
  <div>First</div>
</div>
```

## Adaptive lists

Omit the count to use a single rule based on `sibling-index()` and `sibling-count()`:

```html
<div class="animate-stagger-forward-[100ms]">
  <!-- Any number of animated direct children -->
</div>
```

This form requires support for those CSS functions. Use an explicit count when you need the `:nth-child` fallback. Keep that count aligned with the number of children you intend to stagger.

## Keep the relationship direct

The delay variable is written to direct children. If you add wrappers, move the stagger parent closer to the animated elements. An explicit global animation delay on the child overrides the stagger delay fallback.
