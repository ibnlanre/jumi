---
layout: ../../layouts/Docs.astro
title: Between one state and another.
description: Smooth the change on hover, focus, or any other change of style.
---

## Activate transitions

Choose the transition property, then set the duration:

```html
<button class="transition-property/background-color
  transition-duration-[300ms]
  bg-lime-300 hover:bg-lime-200 focus-visible:bg-lime-200">
  Take a closer look.
</button>
```

The transition starts when the property's underlying value changes. Unlike a named effect, it does not play just because the element appears.

## Controls do not create a transition

`transition-property/…` is what says which properties transition. Everything else configures it, and on its own it does nothing:

```html
<!-- configures duration only; no transition by itself -->
<div class="transition-duration-500">

<!-- transitions all changing properties for 500ms -->
<div class="transition-property/all transition-duration-500">
```

The same holds for animations: `animation-duration-500` says how long an animation should take if the element has one, and does not give it one.

## Independent timing

```html
<button class="transition-property/background-color
  transition-property/scale
  transition-duration-[200ms]/background-color
  transition-duration-[500ms]/scale
  bg-lime-300 hover:bg-lime-200
  hover:scale-110 focus-visible:scale-110">
  A little lift.
</button>
```

You can scope `duration`, `delay`, and `timing-function` to the same property name. Tailwind v4's scale utility changes the individual `scale` property, so use `/scale` for that transition.

## Be selective

`transition-property/all` is available when you intentionally want every transitionable property. Explicit property lists make it easier to understand which changes should move.

Remember keyboard interactions. Give focus states the same care as hover states, and [reduce nonessential motion](/docs/accessibility/) for visitors who request it.
