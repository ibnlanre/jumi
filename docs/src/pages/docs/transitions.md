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

## Delay, easing, and discrete properties

`transition-delay` and `transition-timing-function` are the other two halves of the same shape as `transition-duration`, and both take the `/{property}` scope:

```html
<button class="transition-property/background-color
  transition-property/scale
  transition-duration-[200ms]/background-color
  transition-delay-[80ms]/background-color
  transition-timing-function-ease-out/scale
  bg-lime-300 hover:bg-lime-200
  hover:scale-110">
  A delayed colour and a lifted card.
</button>
```

A property the browser cannot interpolate — `display` is the usual one — does not transition at all unless you say it may:

```html
<div class="transition-property/display transition-duration-300 transition-behavior-allow-discrete">
```

With that, the flip is placed so the content stays on screen: at the start on the way in, at the end on the way out. That is what makes appear-and-disappear work as a transition rather than as an animation. The one thing it cannot supply is the before-style a first render has nothing to travel from — `@starting-style` is plain CSS and belongs in your own stylesheet, next to the markup it describes. `transition-behavior-normal` is the default.

Where the property is unknown, the declaration is ignored, and a discrete property simply does not transition — the change still happens, instantly. Everything else on this page is unaffected, since nothing else here is conditional on it.

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
