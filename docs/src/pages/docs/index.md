---
layout: ../../layouts/Docs.astro
title: Make your move.
description: Jumi is a motion vocabulary for Tailwind CSS. Start with an effect, then make every part your own.
---

## A little class goes a long way

Bring an element into view with a single named effect. Choose its motion and timing; the utilities compose automatically.

```html
<div class="animate-bounce-in animation-duration-[800ms]">Hello, movement.</div>
```

Jumi generates CSS at build time. Your animations run in the browser's CSS engine, without a Jumi JavaScript runtime.

## Four pieces to play with

| Piece       | Syntax                        | Purpose                                     |
| ----------- | ----------------------------- | ------------------------------------------- |
| Effects     | `animate-bounce-in`           | A complete, named keyframe animation        |
| Properties  | `animate-rotate-45`           | A target value for a CSS property           |
| Controls    | `animation-duration-[800ms]`  | Timing, repetition, direction, and playback |
| Transitions | `transition-duration-[300ms]` | Motion between changes of state             |

Animation and transition utilities compose automatically. Add the motion or transition properties you need; no setup class is required.

That assembly is the whole job, and it is Jumi's rather than yours. One element can carry as many utilities as you like: each one declares its own value, and the composition gathers them into the animation lists the browser needs. To switch motion off across a surface, target the elements themselves, which is how [reduced motion](/docs/accessibility/) is handled.

## Compose something personal

Each property can have its own duration. This element rotates over 800 milliseconds while its scale changes over 1.2 seconds.

```html
<div
  class="animate-rotate-45 animate-scale-110
  animation-duration-[800ms]/rotate
  animation-duration-[1200ms]/scale
  animation-direction-alternate
  animation-iteration-count-infinite"
>
  Make your move.
</div>
```

## Start here

1. [Install Jumi](/docs/installation/) in a Tailwind CSS project, and read [why it takes two pieces](/docs/build-step/).
2. [Explore the effect catalog](/effects/) to find a starting point.
3. [Compose properties](/docs/properties/) and [tune their timing](/docs/controls/).
4. [Respect motion preferences](/docs/accessibility/) before you ship.

This documentation site uses Astro, Tailwind CSS, and the same Jumi plugin. The rotating hero, its unfurling petals, and the staggered bars are all examples of its atomic animation utilities.
