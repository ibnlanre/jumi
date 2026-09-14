---
layout: ../../layouts/Docs.astro
title: Compose, then compose again.
description: Animate property targets directly. Give simple pieces a shared purpose.
---

## Pick a target

Property utilities follow `animate-{property}-{value}`. Values come from the relevant Tailwind theme scale, built-in keywords, or arbitrary values in brackets.

```html
<div class="animate-color-red-600">Color</div>
<div class="animate-width-[240px]">Width</div>
<div class="animate-rotate-[0.25turn]">Rotation</div>
<div class="animate-filter-blur-[8px]">Blur</div>
<div class="animate-border-radius-[40px]">Corners</div>
```

Simple property animations generate a `to` keyframe. The starting point comes from the element's underlying styles. Set a useful starting value when the default does not interpolate as you expect.

### Keyword sizes belong to the platform

`auto`, `min-content`, `max-content` and `fit-content` interpolate only with `interpolate-size: allow-keywords`. Jumi does not set it for you, because the declaration is **inherited**: setting it on an element opts in everything beneath it, and that should be your decision rather than a side effect of animating something.

```html
<div class="interpolate-size-allow-keywords animate-width-auto w-[200px]">Keyword target</div>
```

Without it the keyword still applies, but as a discrete change — the property holds its starting value and flips at the midpoint. `interpolate-size-numeric-only` stops a subtree inheriting the switch.

A value that carries its own intrinsic size needs no switch at all:

```html
<div class="animate-width-[calc-size(auto,size+2rem)]">Arbitrary intrinsic value</div>
```

## Separate properties, separate rhythms

```html
<div class="animate-rotate-[180deg]
  animate-scale-[0.75]
  animation-duration-[3s]/rotate
  animation-duration-[1s]/scale
  animation-direction-alternate
  animation-iteration-count-infinite">
  Two rhythms. One element.
</div>
```

The `/rotate` and `/scale` modifiers target those property slots. A global control supplies the fallback for slots without an override.

## Compose compound values

Jumi assembles parts of compound CSS values through custom properties. For example, blur and brightness contribute to the same filter:

```html
<div class="animate-filter-blur-[4px]
  animate-filter-brightness-[1.2]
  animation-duration-[900ms]/filter">
  A softer glow.
</div>
```

These parts share a `filter` animation slot. Their timing belongs to `/filter`, not `/filter-blur` or `/filter-brightness`. The same distinction matters for parts of `transform`, shadows, and other compound properties.

## Choose compatible effects

An effect can animate several properties. Combining two effects that both write `transform` or `opacity` can cause one to replace the other. Use nested elements when you want independent effects on the same visual object.

```html
<div class="animate-fade-in">
  <div class="animate-spinning
    animation-duration-[8s]
    animation-timing-function-linear
    animation-iteration-count-infinite">✳</div>
</div>
```

## Follow a path

A motion path is a property you declare and a property you animate, and keeping those two apart is the whole of it. The path is where the motion happens; the distance is how far along it the element has got. Declare the path, animate the distance:

```html
<div class="[offset-path:path('M0,0_L200,0_L200,200')]
  animate-offset-distance-100
  animation-duration-2000">
```

The geometry is arbitrary, so anything the platform accepts is available: `path()`, `ray()`, `circle()`, `ellipse()`, `inset()`, `polygon()`, and the box keywords `border-box`, `padding-box`, `content-box`. `offset-path:border-box` needs no geometry at all — the element travels its own border box.

Three properties describe the geometry, and they are written once rather than animated: `offset-path`, `offset-rotate` — `auto` turns the element to follow the tangent — and `offset-anchor`, which decides which point of the element rides the path. All of them are ordinary utilities with an arbitrary value, so nothing new has to be learned:

```html
<div class="[offset-path:circle(60px)] [offset-position:50%_50%]
  [offset-rotate:auto]
  animate-offset-distance-100
  animation-duration-[4s]
  animation-iteration-count-infinite">
```

Because the driver is an ordinary animation, everything else composes with it. Scroll works unchanged:

```html
<div class="[offset-path:path('M0,0_L200,0_L200,200')]
  animation-timeline-scroll
  animation-range-[25%_75%]:animate-offset-distance-100">
```

**A note for the adventurous.** `offset-path` is itself animatable *between two compatible paths* — the same command list, different coordinates — so a path can morph as it is travelled. Animating it from `none`, though, is a discrete step: the element does not ease onto the path, it appears on it halfway through. Declare the path.

## CSS still sets the boundaries

A utility cannot make a non-animatable CSS property interpolate. Some properties change discretely, and properties such as width can trigger layout work. Use transform and opacity for frequent decorative motion where they suit the effect, and test more complex properties on your target devices.
