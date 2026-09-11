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

## Write the shape of the animation

A value can declare its own frames — an offset, a colon, a value — so one utility describes the whole motion:

```html
<div class="animations animate-rotate-[0:0deg,50:0deg,100:45deg]
  animation-duration-[2000ms]
  animation-iteration-count-infinite">
  Rest, then turn one way over the second half.
</div>
```

Frames are separated by commas, each written `<offset>:<value>`. The offset is a bare number — the `%` is implied, and `0` and `100` are the endpoints. Any offset you leave out is the property's resting value, so a phrase holds still until its first frame and closes itself at the end. That is what makes it safe to run `infinite`: the loop has no seam.

A phrase owns its property, and its keyframe is named after the phrase, so nothing else can share it. Two elements running the same phrase run the same keyframe; a different phrase gets a keyframe of its own. No other markup can change what your animation does — which is also why you write one phrase per property per element rather than layering several.

Placing an action inside the cycle, rather than spreading it across the whole of it, is what this is for. A step earlier in the phrase is a step later in the cycle:

```html
<div class="animations animate-scale-[0:0.5,50:1.1,100:1]
  animate-opacity-[0:0,50:1,100:1]
  animation-duration-[2600ms]
  animation-iteration-count-infinite">
  Gather, overshoot, settle — and arrive while it settles.
</div>
```

A property that takes several values takes all of them at each frame, with `_` standing in for the space: `animate-scale-[0:0.42_0.30,50:1.03_1.03]` scales both axes together.

This site's hero is built this way. Each of its twelve petals carries two phrases — one for `scale`, one for `rotate` — and a delay of `230ms` more than the petal before it, so the bloom travels around the ring:

```html
<div class="petal animations
  animate-scale-[0:0.42_0.30,12:0.42_0.30,50:1.03_1.03]
  animate-rotate-[0:16deg,12:16deg,58:0deg]
  animation-duration-[2000ms]
  animation-direction-alternate
  animation-timing-function-[cubic-bezier(0.45,0,0.25,1)]/scale
  animation-timing-function-[cubic-bezier(0.5,0,0.3,1)]/rotate"
  style="--jumi-animation-delay:-230ms"></div>
```

The scale holds at the bud until 12%, overshoots at 50% and settles; the rotation untwists later, so the petals straighten after they arrive.

A phrase is a value, so it can live in your theme and be referenced by name:

```js
theme: { rotate: { unfurl: '0:16deg,58:0deg' } }
```

```html
animate-rotate-unfurl
```

That is the shorter spelling when one phrase is used on several elements, and it keeps the frames in a single place.

## Timelines and composition

Jumi also exposes global `animation-timeline`, `animation-composition`, and animation-range controls. These are separate CSS declarations from the core animation shorthand. Treat them as progressive enhancements and verify them in the browsers you support.

Composition is not how Jumi brings several values of one property together — a phrase is, and it needs no browser support flag. Keep `animation-composition` for blending an animation with a value that is already on the element.

For predictable independent timing, use the duration, delay, easing, iteration, direction, fill, and playback controls above. Scoped composition and timeline values are not currently assembled into per-slot longhand lists; use their global forms.

## Pause long-running motion

Give visitors a way to stop decorative loops. This site uses a pause button that applies `animation-play-state: paused` to its Jumi elements, alongside a reduced-motion stylesheet.
