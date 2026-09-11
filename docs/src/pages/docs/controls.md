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
<div class="animations animate-rotate-90 animation-duration-1400 animation-timing-function-ease-in-out animation-direction-alternate animation-iteration-count-infinite">
  Back and forth.
</div>
```

Use `animation-timing-function-linear` for steady rotation. Try `animation-timing-function-ease-out-back` for a curve with overshoot, or an arbitrary `cubic-bezier()` value for a custom feel.

```html
<div class="animations animate-scale-110 animation-timing-function-ease-out-quint">
  Settle into place.
</div>
```

## Target a property or effect

Append `/{property}` or `/{effect}` to timing controls:

```html
<div class="animations animate-rotate-45 animate-scale-110 animation-duration-500 animation-duration-1200/rotate">
  Scale at 500ms. Rotate at 1200ms.
</div>
```

When one property carries more than one animation, name each where you declare it with `/[name]`, and address it by that name:

```html
<div class="animations
  animate-rotate-[0:0deg,12:-8deg,100:-8deg]/[flick]
  animate-rotate-[0:0deg,12:0deg,100:8deg]/[return]
  animation-composition-add/rotate
  animation-timing-function-ease-in-out-circ/rotate.flick
  animation-timing-function-linear/rotate.return">
  A flick that lands, then a plain return.
</div>
```

`/[flick]` labels the slot; `/[rotate.flick]` writes that slot's own variable. A slot reads its own value first, then the property's, then the global one, so an unlabelled animation in the same list is untouched. The label is only a name — the phrase is unchanged — and `animation-composition: add` is what lets two animations of one property apply at once instead of the second replacing the first.

This is the escape hatch when one easing is not enough. A single `animation-timing-function` times every segment of an animation, so an eased flick and a linear return have to be two animations. Here the flick is eased and then holds still, and the return runs `linear`: each slot has exactly one moving segment, so one easing per slot says precisely what is meant.

The label is recorded in the rule as well — `--jumi-rotate-<hash>-label: flick` — because the frame variables are keyed by a hash of the phrase, which nobody can write by hand. The label is the address a person can write, so the CSS states it. Read the slot's name in the inspector, then set any `--jumi-rotate-flick-…` variable from your own CSS: `--jumi-rotate-flick-animation-duration: 900ms` retimes that slot alone, without touching the markup.

That is also why tooling leaves the modifier alone. A class judged only by its own rule used to look identical with and without the label, because the label's only effect was on the `.animations` list; now the rule carries it.

## Write the shape of the animation

A value can declare its own frames — an offset, a colon, a value — so one utility describes the whole motion:

```html
<div class="animations animate-rotate-[0:0deg,50:0deg,100:45deg]
  animation-duration-2000
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
  animation-duration-2600
  animation-iteration-count-infinite">
  Gather, overshoot, settle — and arrive while it settles.
</div>
```

A property that takes several values takes all of them at each frame, with `_` standing in for the space: `animate-scale-[0:0.42_0.30,50:1.03_1.03]` scales both axes together.

This site's hero is built this way. A wrapper around each petal carries a slow, seamless winding, and the petal inside it carries the flick:

```html
<div class="petal-position animations
  animate-rotate-[0:var(--angle),100:calc(var(--angle)-360deg)]
  animation-duration-[75s]
  animation-timing-function-linear
  animation-iteration-count-infinite"
  style="--angle:0deg">

  <div class="petal animations
    animate-rotate-[0:0deg,20:-8deg,100:-8deg]/[flick]
    animate-rotate-[0:0deg,20:0deg,100:8deg]/[return]
    animation-composition-add/rotate
    animation-duration-3000
    animation-timing-function-[cubic-bezier(.4,0,.6,1)]/rotate.flick
    animation-timing-function-linear/rotate.return
    animation-iteration-count-infinite"
    style="--jumi-animation-delay:-250ms"></div>
</div>
```

The wrapper's phrase ends exactly one turn from where it starts, so `-360deg` and `0deg` are the same orientation and the loop closes with no seam — the winding is the one motion that is allowed to be continuous, because it never has to snap back. Because it only ever turns one way, the composed rotation never travels forward either: the petals flick back `8deg` and ride, and the drift keeps the total moving the same direction throughout.

The twelve petals are staggered `250ms` apart, one twelfth of the petal's `3s` cycle, so the wave wraps the ring once per cycle instead of twelve petals firing together. Two numbers decide whether that reads as a ripple or a ticker: how long a petal is actually in motion, and how far apart the petals start. The flick occupies `20%` of the cycle, and the easing concentrates that movement into about `440ms` — comfortably more than the `250ms` stagger, so each petal hands on to the next. Shorten either one and you get discrete steps with pauses between them: when the motion is shorter than the stagger, twelve petals read as a wall clock, however gentle the easing and however long the segment.

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

Composition is not how Jumi brings several values of one property together — a phrase is. Keep `animation-composition` for two things: blending an animation with a value already on the element, and letting two animations of one property apply at once, as in the labelled-slots example above.

Composition and timeline are assembled per animation, alongside duration, delay, easing, iteration, direction, fill and playback, so `/{property}` and `/{property}.{label}` reach them exactly as they reach the others.

## Pause long-running motion

Give visitors a way to stop decorative loops. This site uses a pause button that applies `animation-play-state: paused` to its Jumi elements, alongside a reduced-motion stylesheet.
