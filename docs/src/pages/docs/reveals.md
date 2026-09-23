---
layout: ../../layouts/Docs.astro
title: Reveal the surface. Keep the content still.
description: Angular wipes, parallel apertures, hinge exits and a feathered-mask recipe.
---

## Sweep an angle

```html
<div class="motion-safe:animate-radial-wipe-in animation-duration-[900ms]">
  Stationary content, opening clockwise from the top center.
</div>
```

`radial-wipe-in` changes angular coverage around the center. It does not rotate the content or expand a
circle. `radial-wipe-out` runs that geometry toward concealment. Both own only `clip-path`.

The implementation uses a fixed polygon fan, with a boundary moving around the box in eight equal
segments. This is a perimeter-timed angular wipe, not constant angular velocity; a wide or tall box
changes the apparent sweep speed. The fully visible endpoint includes the whole rectangle.

Use `animation-direction-reverse` when you want the exact reversed playback. No separate start-angle
or corner variants are implied.

## Open parallel strips

```html
<div class="motion-safe:animate-blinds-in-y animation-duration-[800ms]">
  Five horizontal apertures open vertically.
</div>
<div class="motion-safe:animate-blinds-in-x animation-duration-[800ms]">
  Five vertical apertures open horizontally.
</div>
```

`blinds-in-x`, `blinds-out-x`, `blinds-in-y`, and `blinds-out-y` reveal or conceal one stationary element
through five parallel strips. The axis names the direction in which each aperture opens. Content is
not sliced, duplicated or shifted; the effect changes one `clip-path` polygon. Strip count is fixed.

Unlike `reveal-*` or `unmask`, these effects have several apertures at once. They do not change stripe
frequency or stagger child elements.

## Let an attachment give way

```html
<div
  class="motion-safe:animate-hinge-drop motion-reduce:opacity-0
            animation-duration-[1400ms]"
>
  An outgoing decorative card.
</div>
```

`hinge-drop` is an exit: the top-left attachment stays in place while the surface swings, then the
surface releases and drops while fading. It owns `transform`, `transform-origin`, opacity and local
segment easing. Translation starts at 70% of the timeline; the final drop is 120% of the element's own
height. It does not promise to travel beyond the viewport.

This differs from a swing that settles back to rest or a fall that lands. There is no entrance inverse.
Use it sparingly for expressive dismissal, not as the default for every notification.

## Compose with care

The reveal effects own `clip-path`; another clip animation on the same element competes with them.
The hinge owns transform and opacity, so another effect writing those properties can replace part of
its motion. A named motion gives you timing control, not automatic conflict resolution. Use a wrapper
when you need independently moving and clipped surfaces.

Clipping also clips descendants and decorations such as shadows. None of these visual exits removes
layout, manages focus or removes an element from the DOM. SVG transforms need a deliberate
`transform-box` and origin; the hinge's default attachment is designed around a rectangular HTML box.

## Feather a wipe with native CSS

A soft reveal needs a mask, not blurred content. Keep the mask setup visible and animate its position
with the existing property API; there is no named `feather-wipe` effect.

```css
@media (prefers-reduced-motion: no-preference) {
  [data-feather='x'] {
    mask-image: linear-gradient(90deg, #000 45.454545%, transparent 54.545455%);
    mask-size: 220% 100%;
    mask-repeat: no-repeat;
  }
  [data-feather='y'] {
    mask-image: linear-gradient(
      180deg,
      #000 45.454545%,
      transparent 54.545455%
    );
    mask-size: 100% 220%;
    mask-repeat: no-repeat;
  }
}
```

The `data-feather` hook is an example selector; use whatever reaches your element.

```html
<div
  data-feather="x"
  class="motion-safe:animate-mask-position-[0:100%_0%|100:0%_0%]
         animation-duration-[900ms] animation-timing-function-linear"
>
  Horizontal feather. Text remains sharp outside the soft band.
</div>
<div
  data-feather="y"
  class="motion-safe:animate-mask-position-[0:0%_100%|100:0%_0%]
         animation-duration-[900ms] animation-timing-function-linear"
>
  Vertical feather.
</div>
```

The mask is 2.2 times the element's size on the moving axis: one element-length of opaque mask, a
0.2-length feather, then one length of transparent mask. Moving it from 100% to 0% gives fully hidden
and fully visible endpoints without a repeated-mask leak. Reverse the animation for a concealment.

This recipe intentionally exposes mask ownership, direction and feather width. Existing masked assets
need an explicit composition decision. Masking may require painting large surfaces; keep the affected
area modest and test target devices.

## A clip lasts as long as the fill does

`mask-*` conceals the element down to a band, `unmask` opens out of one, and the `-out` exits end
concealed. Each of them holds that endpoint only because the default `animation-fill-mode` is
`forwards`: with `animation-fill-mode-none` the clip is released the moment the animation ends and the
element returns to its unclipped shape, the whole surface back for `mask-center`, a full box for
`diamond-out` or `triangle-out`. If a departure should stay gone, keep the fill, or remove the element
and animate whatever replaces it.

The entrances in this family no longer hold a half-visible window. `diamond-in` and the five
`triangle-in` variants grow past the element's corners, so their final frame covers the whole box and
releasing the clip changes nothing, the same way `circle-in`, `square-in`, `reveal-*`,
`radial-wipe-in` and `blinds-in-*` already reached full coverage. The `-out` variants are their exact
reversals, so they start at full coverage and conceal from there.

## Reduced motion and final state

The entrance examples use `motion-safe:` with visible base content. The feather setup itself is also
inside the preference query so a disabled animation cannot leave a static mask hiding the content.

For exits, choose the final state explicitly. For example, `motion-reduce:opacity-0` hides an outgoing
surface immediately while application code handles removal and focus. Do not apply an unconditional
hidden base style to an entrance. See [accessible motion](/docs/accessibility/).
