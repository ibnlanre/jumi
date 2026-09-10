---
layout: ../../layouts/Docs.astro
title: Compose, then compose again.
description: Animate property targets directly. Give simple pieces a shared purpose.
---

## Pick a target

Property utilities follow `animate-{property}-{value}`. Values come from the relevant Tailwind theme scale, built-in keywords, or arbitrary values in brackets.

```html
<div class="animations animate-color-red-600">Color</div>
<div class="animations animate-width-[240px]">Width</div>
<div class="animations animate-rotate-[0.25turn]">Rotation</div>
<div class="animations animate-filter-blur-[8px]">Blur</div>
<div class="animations animate-border-radius-[40px]">Corners</div>
```

Simple property animations generate a `to` keyframe. The starting point comes from the element's underlying styles. Set a useful starting value when the default does not interpolate as you expect.

## Separate properties, separate rhythms

```html
<div class="animations
  animate-rotate-[180deg]
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
<div class="animations
  animate-filter-blur-[4px]
  animate-filter-brightness-[1.2]
  animation-duration-[900ms]/filter">
  A softer glow.
</div>
```

These parts share a `filter` animation slot. Their timing belongs to `/filter`, not `/filter-blur` or `/filter-brightness`. The same distinction matters for parts of `transform`, shadows, and other compound properties.

## Choose compatible effects

An effect can animate several properties. Combining two effects that both write `transform` or `opacity` can cause one to replace the other. Use nested elements when you want independent effects on the same visual object.

```html
<div class="animations animate-fade-in">
  <div class="animations animate-spin
    animation-duration-[8s]
    animation-timing-function-linear
    animation-iteration-count-infinite">✳</div>
</div>
```

## CSS still sets the boundaries

A utility cannot make a non-animatable CSS property interpolate. Some properties change discretely, and properties such as width can trigger layout work. Use transform and opacity for frequent decorative motion where they suit the effect, and test more complex properties on your target devices.
