---
layout: ../../layouts/Docs.astro
title: Make room for stillness.
description: Good motion includes the option to experience less of it.
---

## Honor reduced motion

Activate decorative animation through Tailwind's `motion-safe` variant:

```html
<div class="motion-safe:animate-fade-in-up">
  Always readable. Animated when welcome.
</div>
```

Keep the base element visible. Avoid an unconditional `opacity-0` or off-screen transform that leaves content hidden when the animation is disabled.

When the movement is continuous rather than an entrance, the inverse variant is the one to reach for. It strips the repetition, and only for the visitors who ask for it:

```html
<div class="animate-pulsing animation-iteration-count-infinite motion-reduce:animation-iteration-count-1">
  Pulses until you say otherwise.
</div>
```

## Reduce motion across a surface

For a dedicated showcase, a CSS rule can disable Jumi animation throughout the page:

```css
@media (prefers-reduced-motion: reduce) {
  .animations {
    animation: none !important;
  }
  .transitions {
    transition: none !important;
  }
}
```

This is the approach used for the animated specimens in this documentation site. Their geometry and labels remain readable while still.

## Let people pause

Provide an accessible pause control for persistent decorative movement. Use a real button, label its action, and communicate whether it is pressed with `aria-pressed`.

```css
.motion-paused .animations {
  animation-play-state: paused !important;
}
```

## Movement should support meaning

- Keep essential information available without animation.
- Avoid flashing and rapid, repetitive changes.
- Let an entrance finish rather than looping it beside reading material.
- Use visible keyboard focus and touch-sized controls.
- Test with reduced motion enabled, as well as with motion paused.

The site-wide pause button controls the specimens. Catalog effects play on request so that browsing a library does not become a wall of simultaneous motion.
