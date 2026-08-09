# Jumi

A comprehensive CSS animation library for Tailwind CSS. Declarative, composable,
and generated just-in-time — only the utilities you actually use end up in your
CSS.

## Install

```bash
pnpm add jumi
```

Register the plugin in your CSS (Tailwind CSS v4):

```css
@import "tailwindcss";
@plugin "jumi";
```

## What you can animate

| Capability | Utility | What it does |
|-----------|---------|--------------|
| **Effects** | `animate-{effect}` | 200+ named keyframe animations — fades, bounces, slides, arcs, flips, reveals |
| **Properties** | `animate-{css-property}-{value}` | Animate any CSS property — color, size, transform, filter, border, layout |
| **Controls** | `animation-{control}-{value}` | Tune timing, easing, iteration, direction, fill-mode, timeline, range |
| **Transitions** | `transition-{part}-{value}` | CSS transitions for hover and state changes |

Plus `animate-stagger-*` to sequence a motion across direct children. Every
motion is materialized on its element by the `animations` opt-in (and
transitions by `transitions`):

```html
<div class="animations animate-bounce-in animation-duration-800">
  Hello World!
</div>
```

## Effects — `animate-{effect}`

Keyframe animations organized by intent — entrances, exits, attention (looping),
emphasis (one-shot), and presentation (masks / clip-paths):

```html
<div class="animations animate-slide-in-up animation-duration-600">Entrance</div>
<div class="animations animate-shake animation-iteration-count-3">Attention</div>
<div class="animations animate-reveal-swipe animation-duration-800">Clip-path reveal</div>
```

See [the full effect catalog](documentation/effects.md).

## Properties — `animate-{css-property}-{value}`

Animate any CSS property — color, size, transform, filter, border, layout, and
more — using Tailwind's theme values or arbitrary values:

```html
<div class="animations animate-color-red-600 animation-duration-800">Color</div>
<div class="animations animate-width-full animation-duration-1000">Size</div>
<div class="animations animate-rotate-45 animate-scale-110 animation-duration-500">Transform</div>
<div class="animations animate-filter-blur-md animation-duration-1500">Filter</div>
<div class="animations animate-border-radius-full animation-duration-1000">Border</div>
```

Arbitrary values give full precision:

```html
<div class="animations animate-translate-x-[50px] animate-rotate-[0.15turn] animate-scale-[1.15]">
```

Transforms compose through CSS custom properties, so translate, rotate, and
scale combine naturally in one declaration.

## Controls — `animation-{control}-{value}`

Tune any motion with `duration`, `delay`, `timing-function`, `iteration-count`,
`direction`, `fill-mode`, `play-state`, `composition`, `timeline`, and `range`:

```html
<div class="animations animate-rotate-45 animation-duration-500 animation-delay-100 animation-iteration-count-infinite animation-direction-alternate">
```

Controls accept a `/{property}` modifier to target a single property's slot:

```html
<!-- rotate animates at 600ms; everything else at 300ms -->
<div class="animations animate-rotate-90 animate-scale-110 animation-duration-600/rotate animation-duration-300">
```

## Stagger — `animate-stagger-{direction}-{interval}[/{count}]`

Sequentially distribute a motion across direct children:

```html
<div class="animate-stagger-forward-100">
  <div class="animations animate-bounce-in animation-duration-300">1</div>
  <div class="animations animate-bounce-in animation-duration-300">2</div>
  <div class="animations animate-bounce-in animation-duration-300">3</div>
</div>
```

Count-free by default — one rule driven by `sibling-index()` / `sibling-count()`
that adapts to any list length (Chrome, Edge, Safari). Firefox lacks those
functions, so append `/[{count}]` for an `:nth-child` fallback:

```html
<div class="animate-stagger-backward-150/3">…</div>
```

## Transitions — `transition-{part}-{value}`

CSS transitions for hover and state changes, with per-property scoping:

```html
<div class="transitions transition-property/all transition-duration-300 hover:scale-125">
```

Scope any part (`property`, `duration`, `delay`, `timing-function`) to a single
property:

```html
<div class="transitions transition-property/background-color transition-duration-500 hover:bg-purple-500">
```

## Accessibility

Respect user motion preferences with Tailwind's built-in variants:

```html
<div class="motion-safe:animations motion-safe:animate-bounce-in">…</div>
<div class="motion-reduce:animate-fade-in">…</div>
```

## Browser support

Modern evergreen browsers. Count-free stagger relies on
`sibling-index()` / `sibling-count()` (Chrome, Edge, Safari); Firefox uses the
`/[{count}]` fallback.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).