---
layout: ../../layouts/Docs.astro
title: Size is part of the effect.
description: What accordion, typing and the expand family need from the box they animate.
---

## Percentages belong to the container

`accordion`, `typing` and the four `expand-*` effects animate a dimension: `max-height`, `width` or
`height`. Nothing about them is unusual except where the number comes from. A percentage resolves
against the **containing block**, and a `max-height` ramp ends at a number somebody typed, so these
are the effects whose motion is decided partly by the layout around them.

## Grow a box from its leading edge

```html
<div class="w-[320px]">
  <div
    class="motion-safe:animate-expand-right animation-duration-[600ms]
           h-2 rounded-full bg-black"
  ></div>
</div>
```

`expand-left` and `expand-right` animate `width` from `0%` to `100%`; `expand-up` and `expand-down`
animate `height`. All four grow from the **leading edge** of the box — the left edge for the
horizontal pair, the top edge for the vertical pair. A percentage width extends from the box's start
edge, and no `transform-origin` can move it, so the effect has no far-edge anchor to declare.

That means the pair share one geometry: `expand-left` grows rightward exactly as `expand-right` does,
and `expand-down` grows downward exactly as `expand-up` does. Pick the name that matches how your
layout reads, not a physical direction you expect the box to travel. A box that grows toward its far
edge needs to be positioned at that edge, which these keyframes do not do — animate `width` in your
own keyframes, or put the box in a container that is already anchored where you want it.

`100%` is the containing block's width, so the reveal ends at the size of the container rather than
the size of the content. Give the container the dimensions you want the motion to land on.

## Type on a line that is already the right width

```html
<div class="inline-block">
  <span
    class="motion-safe:animate-typing animation-duration-[1200ms]
           overflow-hidden whitespace-nowrap font-mono"
  >
    Typing needs a box.
  </span>
</div>
```

`typing` animates `width` from `0` to `100%`, and two properties of that number decide how it reads.

- **`100%` is the containing block's width.** In a full-width parent the box keeps growing after the
  text has finished appearing: measured, a 46.7px line inside a 320px column is fully visible at
  about 11% of the timeline, and the remaining 89% is empty layout growth. Text wider than its
  containing block never finishes visually, because `overflow: hidden` clips at the container's edge
  rather than at the text's own edge.
- **The reveal needs `overflow: hidden` and `white-space: nowrap`.** Without the first the text is
  never clipped; without the second the line wraps and the clip reads as a vertical wipe instead of
  typing.

Both are cured by the same move: give the element a **shrink-wrapped parent** — `inline-block`, or
`width: fit-content` — so the parent's width is the text's own width. Then `100%` is the length of
the line and the animation ends exactly when the last character appears.

## Open a panel on a fixed ramp

`accordion` animates `max-height` from `0` to `1000px` through a `500px` stop, with `scaleY` from
`0` to `1.1` to `1`, `opacity` from `0` to `0.8` to `1`, and `transform-origin: top` in every stop so
the panel unfolds downward from its top edge.

The ceiling is a number, not `auto`, and that is visible in two ways:

- **Content taller than 1000px stays at the ceiling.** The default `forwards` fill holds the final
  value, so a taller panel keeps a 1000px box; with `overflow: hidden` — which an accordion panel
  normally needs anyway — everything past that edge is cut off, for as long as the value is held.
- **Short content finishes early.** Measured, a 40px panel is fully open at about 5% of the timeline,
  and the remaining 95% is layout growth you cannot see.

Size the ramp to the content. A panel that has to exceed 1000px needs its own keyframes — `accordion`
is a keyframe first, and the ceiling is part of it — or a different reveal such as `fade-in-up` when
the height itself does not need to move. The pivot is the top edge in all three stops, so the panel
grows downward; if you set a `transform-origin` of your own, the keyframes override it for as long as
the animation runs.

See [timing & controls](/docs/controls/) for `animation-fill-mode` and the rest of the defaults.
