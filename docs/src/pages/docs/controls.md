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
<div class="animate-rotate-90 animation-duration-1400 animation-timing-function-ease-in-out animation-direction-alternate animation-iteration-count-infinite">
  Back and forth.
</div>
```

Use `animation-timing-function-linear` for steady rotation. Try `animation-timing-function-ease-out-back` for a curve with overshoot, or an arbitrary `cubic-bezier()` value for a custom feel.

```html
<div class="animate-scale-110 animation-timing-function-ease-out-quint">
  Settle into place.
</div>
```

## Target a property or effect

Append `/{property}` or `/{effect}` to timing controls:

```html
<div class="animate-rotate-45 animate-scale-110 animation-duration-500 animation-duration-1200/rotate">
  Scale at 500ms. Rotate at 1200ms.
</div>
```

When one property carries more than one animation, name each where you declare it with `/[name]`, and address it by that name:

```html
<div class="animate-rotate-[0:0deg,12:-8deg,100:-8deg]/[flick]
  animate-rotate-[0:0deg,12:0deg,100:8deg]/[return]
  animation-composition-add/rotate
  animation-timing-function-ease-in-out-circ/flick
  animation-timing-function-linear/return">
  A flick that lands, then a plain return.
</div>
```

`/[flick]` gives that animation a name, and the same name on a control times it on its own. Each animation reads its own label first, then the property's control, then the global one, so anything else in the list is left alone — and naming one does not change its phrase.

The label is yours to choose, and it becomes the variable name exactly as written — nothing is prepended. Labels and property names are one namespace, which is what lets `/rotate` and `/[flick]` be written the same way on a control: `--jumi-rotate-animation-timing-function` is the variable every rotate animation reads, so `rotate` is the name all of them answer to, and a label is a name one of them answers to. Give each animation you want to time apart its own word.

A label belongs to the element that declared it. Its variable is registered non-inheriting, so it does not travel into descendants, and two elements can use the same word for different values without knowing about each other.

The three links do not behave alike across that boundary. A `/{property}` control on a wrapper does reach the animations inside it, because nothing declares `--jumi-{property}-animation-{part}` on the element, so the value it writes is inherited. A global control does not: every animating element declares the global defaults itself, and a declaration beats inheritance. A label never does.

Reach for it when one easing is not enough. A single `animation-timing-function` applies to every segment of an animation, so pairing an eased flick with a linear return takes two animations, each with one moving segment. `animation-composition: add` lets both apply at once instead of the second replacing the first.

The name is written into the rule, so you can retime or re-ease that animation from your own CSS without touching the markup:

```css
.petal { --jumi-flick-animation-duration: 900ms; }
```

## Write the shape of the animation

A value can declare its own frames — an offset, a colon, a value — so one utility describes the whole motion:

```html
<div class="animate-rotate-[0:0deg,50:0deg,100:45deg]
  animation-duration-2000
  animation-iteration-count-infinite">
  Rest, then turn one way over the second half.
</div>
```

Frames are separated by commas, each written `<offset>:<value>`. The offset is a bare number — the `%` is implied, and `0` and `100` are the endpoints. Any offset you leave out is the property's resting value, so a phrase holds still until its first frame and closes itself at the end. That is what makes it safe to run `infinite`: the loop has no seam.

A phrase owns its property, and its keyframe is named after the phrase, so nothing else can share it. Two elements running the same phrase run the same keyframe; a different phrase gets a keyframe of its own. No other markup can change what your animation does — which is also why you write one phrase per property per element rather than layering several.

Placing an action inside the cycle, rather than spreading it across the whole of it, is what this is for. A step earlier in the phrase is a step later in the cycle:

```html
<div class="animate-scale-[0:0.5,50:1.1,100:1]
  animate-opacity-[0:0,50:1,100:1]
  animation-duration-2600
  animation-iteration-count-infinite">
  Gather, overshoot, settle — and arrive while it settles.
</div>
```

A property that takes several values takes all of them at each frame, with `_` standing in for the space: `animate-scale-[0:0.42_0.30,50:1.03_1.03]` scales both axes together.

This site's hero is built this way. A wrapper around each petal carries a slow, seamless winding, and the petal inside it carries the flick:

```html
<div class="petal-position
  animate-rotate-[0:var(--angle),100:calc(var(--angle)_-_360deg)]
  animation-duration-[75s]
  animation-timing-function-linear
  animation-iteration-count-infinite"
  style="--angle:0deg">

  <div class="petal
    animate-rotate-[0:0deg,20:-8deg,100:-8deg]/[flick]
    animate-rotate-[0:0deg,20:0deg,100:8deg]/[return]
    animation-composition-add/rotate
    animation-duration-3000
    animation-timing-function-[cubic-bezier(.4,0,.6,1)]/flick
    animation-timing-function-linear/return
    animation-iteration-count-infinite"
    style="--jumi-animation-delay:-250ms"></div>
</div>
```

The wrapper turns a full circle over `75s`, ending exactly one turn from where it starts, so its loop has no seam and the petals can wind continuously in one direction. The petal's own two animations are symmetric — back `8deg`, then forward to rest — so the winding is what keeps the composed rotation moving the same way throughout.

The petals are staggered `250ms` apart, one twelfth of the `3s` cycle, so each flick overlaps the next and the motion travels around the ring rather than arriving everywhere at once.

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

Composition is not how Jumi combines several values of one property — a phrase is. Use `animation-composition` to blend an animation with a value already on the element, or to apply two animations of one property at once, as in the labelled example above.

Composition and timeline are assembled per animation, alongside duration, delay, easing, iteration, direction, fill and playback, so `/{property}` and `/{label}` reach them the same way.

## Pause long-running motion

Give visitors a way to stop decorative loops. This site uses a pause button that applies `animation-play-state: paused` to its Jumi elements, alongside a reduced-motion stylesheet.
