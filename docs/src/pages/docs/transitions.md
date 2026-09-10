---
layout: ../../layouts/Docs.astro
title: Between one state and another.
description: Smooth the change on hover, focus, or any other change of style.
---

## Activate transitions

Use `transitions`, choose the property, and set the duration:

```html
<button class="transitions
  transition-property/background-color
  transition-duration-[300ms]
  bg-lime-300 hover:bg-lime-200 focus-visible:bg-lime-200">
  Take a closer look.
</button>
```

The transition starts when the property's underlying value changes. Unlike a named effect, it does not play just because the element appears.

## Independent timing

```html
<button class="transitions
  transition-property/background-color
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
