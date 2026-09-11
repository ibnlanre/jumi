---
layout: ../../layouts/Docs.astro
title: Give motion a rhythm.
description: Control how an animation begins, travels, repeats, and settles.
---

## The essential controls

| Utility | Example | Purpose |
| --- | --- | --- |
| Duration | `animation-duration-[800ms]` | Length of one iteration |
| Delay | `animation-delay-[200ms]` | Time before starting |
| Easing | `animation-timing-function-ease-out` | Acceleration through the motion |
| Iterations | `animation-iteration-count-3` | Number of repeats |
| Direction | `animation-direction-alternate` | Alternate forwards and backwards |
| Fill | `animation-fill-mode-both` | Apply endpoint styles before and after |
| Playback | `animation-play-state-paused` | Pause an animation |

Defaults are a 1-second duration, one iteration, normal direction, and forwards fill. Forwards fill preserves the final animated value after completion.

## One motion, many personalities

```html
<div class="animations animate-rotate-[90deg]
  animation-duration-[1400ms]
  animation-timing-function-ease-in-out
  animation-direction-alternate
  animation-iteration-count-infinite">
  Back and forth.
</div>
```

Use `animation-timing-function-linear` for steady rotation. Try `animation-timing-function-ease-out-back` for a curve with overshoot, or an arbitrary `cubic-bezier()` value for a custom feel.

```html
<div class="animations animate-scale-110
  animation-timing-function-[cubic-bezier(0.22,1,0.36,1)]">
  Settle into place.
</div>
```

## Target a property or effect

Append `/{property}` or `/{effect}` to timing controls:

```html
<div class="animations animate-rotate-45 animate-scale-110
  animation-duration-[500ms]
  animation-duration-[1200ms]/rotate">
  Scale at 500ms. Rotate at 1200ms.
</div>
```

## Place an action with an alias

A modifier can also carry an alias — a number naming one instance of that property's animation. Add `/[n]` to the animation utility, then target the instance from any control as `/{property}.{n}`:

```html
<div class="animations animate-scale-125/[1]
  animation-duration-[2000ms]
  animation-delay-[1000ms]/[scale.1]">
  Grow, then wait a second before repeating.
</div>
```

`animate-scale-125/[1]` names the instance `scale.1`. Any control can address it, and an unset alias falls back to the property's value, then to the global default — so you only write the controls that differ. Two aliases of the same property let it run twice with different timing.

That is how you place an action inside a cycle rather than spreading it across the whole of it:

```html
<div class="animations animate-scale-[0.05] animate-rotate-[-45deg]/[1]
  animation-duration-[4200ms]
  animation-direction-alternate-reverse
  animation-timing-function-[cubic-bezier(.85,0,.15,1)]
  animation-direction-normal/[rotate.1]
  animation-timing-function-[cubic-bezier(1,0,1,1)]/[rotate.1]
  animation-iteration-count-infinite">
  Grow first, turn on the way out.
</div>
```

The scale uses the shared controls: it opens, holds, and withdraws across the cycle. The rotation is a separate instance: `animation-direction-normal/[rotate.1]` takes it out of the shared `alternate-reverse`, and `cubic-bezier(1,0,1,1)` hugs its resting pose before releasing, so nothing turns until the second half. This site's hero is exactly this composition.

## Timelines and composition

Jumi also exposes global `animation-timeline`, `animation-composition`, and animation-range controls. These are separate CSS declarations from the core animation shorthand. Treat them as progressive enhancements and verify them in the browsers you support.

For predictable independent timing, use the duration, delay, easing, iteration, direction, fill, and playback controls above. Scoped composition and timeline values are not currently assembled into per-slot longhand lists; use their global forms.

## Pause long-running motion

Give visitors a way to stop decorative loops. This site uses a pause button that applies `animation-play-state: paused` to its Jumi elements, alongside a reduced-motion stylesheet.
