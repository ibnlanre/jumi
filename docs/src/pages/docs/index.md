---
layout: ../../layouts/Docs.astro
title: Make your move.
description: Jumi is a motion vocabulary for Tailwind CSS. Start with an effect, then make every part your own.
---

## A little class goes a long way

Bring an element into view with a single named effect. Add `animations` to activate Jumi on that element, then choose its motion and timing.

```html
<div class="animations animate-bounce-in animation-duration-[800ms]">
  Hello, movement.
</div>
```

Jumi generates CSS at build time. Your animations run in the browser's CSS engine, without a Jumi JavaScript runtime.

## Four pieces to play with

| Piece | Syntax | Purpose |
| --- | --- | --- |
| Effects | `animate-bounce-in` | A complete, named keyframe animation |
| Properties | `animate-rotate-45` | A target value for a CSS property |
| Controls | `animation-duration-[800ms]` | Timing, repetition, direction, and playback |
| Transitions | `transition-duration-[300ms]` | Motion between changes of state |

Use `animations` to activate animations and `transitions` to activate transitions. These opt-ins assemble the relevant CSS declarations on the element.

## Compose something personal

Each property can have its own duration. This element rotates over 800 milliseconds while its scale changes over 1.2 seconds.

```html
<div class="animations
  animate-rotate-45 animate-scale-110
  animation-duration-[800ms]/rotate
  animation-duration-[1200ms]/scale
  animation-direction-alternate
  animation-iteration-count-infinite">
  Make your move.
</div>
```

## Start here

1. [Install Jumi](/docs/installation/) in a Tailwind CSS project.
2. [Explore the effect catalog](/effects/) to find a starting point.
3. [Compose properties](/docs/properties/) and [tune their timing](/docs/controls/).
4. [Respect motion preferences](/docs/accessibility/) before you ship.

This documentation site uses Astro, Tailwind CSS, and the same Jumi plugin. The rotating hero, breathing petals, and staggered bars are all examples of its atomic animation utilities.
