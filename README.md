# Jumi 🎬

**A comprehensive CSS animation library built as a TailwindCSS plugin.**

Transform your interfaces with smooth, physics-based animations powered by CSS custom properties and modern motion design principles.

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

---

## Why Jumi?

Traditional animation libraries force you to choose between ease-of-use and flexibility. Jumi gives you both:

- **Native TailwindCSS integration** – Works seamlessly with your existing workflow
- **200+ pre-built animations** – From subtle fades to physics-based arcs
- **Composable by design** – Combine utilities to create complex effects
- **Performance first** – GPU-accelerated transforms, tree-shakable output
- **Accessible** – Respects `prefers-reduced-motion` automatically

---

## Quick Start

```html
<!-- Fade in smoothly -->
<div class="jumi animate-fade-in animation-duration-1000">
  Hello World!
</div>

<!-- Physics-based arc motion -->
<div class="jumi animate-arc-bottom-left animation-duration-1500">
  Swoops in from bottom-left with natural parabolic motion
</div>

<!-- Staggered list animations -->
<div class="animation-delay-forward-100/5">
  <div class="jumi animate-slide-in-up animation-duration-300">Item 1</div>
  <div class="jumi animate-slide-in-up animation-duration-300">Item 2</div>
  <div class="jumi animate-slide-in-up animation-duration-300">Item 3</div>
</div>
```

---

## Core Concepts

### 1. Just-in-Time Generation
Only the animations you actually use get generated. No bloated CSS bundles.

### 2. Millisecond-Based Timing
Precise control with intuitive millisecond values:
```html
<div class="animation-duration-500">Fast</div>
<div class="animation-duration-1250">Custom</div>
```

### 3. Composable Architecture
Mix and match transforms naturally:
```html
<div class="jumi animate-translate-x-[20px] animate-rotate-45 animate-scale-110">
  Move, rotate, and scale simultaneously
</div>
```

### 4. Per-Property Overrides
Fine-tune individual properties while keeping global defaults:
```html
<!-- Rotate at 600ms, everything else at 300ms -->
<div class="jumi animate-rotate-90 animate-scale-110 animation-duration-600/rotate animation-duration-300">
</div>
```

---

## Animation Types

### Transform Animations

GPU-accelerated movement with smooth, natural motion:

```html
<!-- Translation -->
<div class="jumi animate-translate-x-[50px] animation-duration-750">
  Slides 50px to the right
</div>

<!-- Rotation -->
<div class="jumi animate-rotate-45 animation-duration-500">
  Rotates 45 degrees
</div>

<!-- Scaling -->
<div class="jumi animate-scale-125 animation-duration-300">
  Grows by 25%
</div>

<!-- Combined transforms -->
<div class="jumi animate-translate-y-[-20px] animate-rotate-90 animate-scale-110">
  Complex motion in one declaration
</div>
```

**Available transforms:**
- `animate-translate-{axis}-{value}` – Move along X or Y axis
- `animate-rotate-{angle}` – Rotate by degrees or turns
- `animate-scale-{value}` – Scale uniformly or per axis (`scale-x`, `scale-y`)

---

### Effect Animations

Carefully crafted entrance, exit, and attention effects:

```html
<!-- Entrances -->
<div class="jumi animate-bounce-in animation-duration-800">
  Bouncy entrance with spring physics
</div>

<div class="jumi animate-slide-in-up animation-duration-600">
  Slides up from below
</div>

<!-- Physics-based arcs -->
<div class="jumi animate-arc-bottom-left animation-duration-1500">
  Natural parabolic motion from bottom-left corner
</div>

<!-- Attention-seeking -->
<div class="jumi animate-shake animation-duration-500 animation-iteration-count-3">
  Shakes 3 times to grab attention
</div>

<!-- Organic motion -->
<div class="jumi animate-floating animation-duration-3000 animation-iteration-count-infinite">
  Gentle floating suspension
</div>
```

**Popular effects:**
- **Entrances:** `animate-fade-in`, `animate-bounce-in`, `animate-zoom-in`, `animate-slide-in-{direction}`
- **Physics arcs:** `animate-arc-bottom-left`, `animate-arc-bottom-right`, `animate-arc-top-left`, `animate-arc-top-right`
- **Attention:** `animate-shake`, `animate-wobble`, `animate-pulsing`
- **Organic:** `animate-floating`
- **Distortions:** `animate-skew-{direction}`, `animate-fold-in`

---

### Property Animations

Direct CSS property transitions with intelligent defaults:

```html
<!-- Dimensions -->
<div class="jumi animate-width-full animation-duration-1000">
  Width expands to 100%
</div>

<!-- Colors -->
<div class="jumi animate-background-color-blue-500 animation-duration-800">
  Background fades to blue
</div>

<!-- Borders -->
<div class="jumi animate-border-radius-full animation-duration-1000">
  Morphs into a perfect circle
</div>

<!-- Effects -->
<div class="jumi animate-filter-blur-md animation-duration-1500">
  Gradually blurs
</div>
```

**Animatable properties:**
- **Size:** `width`, `height`, `max-width`, `gap`
- **Color:** `background-color`, `color`, `fill`
- **Border:** `border-radius`, `border-width`
- **Effects:** `opacity`, `box-shadow`, `text-shadow`
- **Filters:** `filter-blur`, `filter-brightness`, `backdrop-filter-blur`

---

## Advanced Features

### Stagger Animations

Create sequential animations with automatic timing calculation:

```html
<!-- Children animate one after another -->
<div class="animation-delay-forward-100/5">
  <div class="jumi animate-bounce-in animation-duration-300">0ms delay</div>
  <div class="jumi animate-bounce-in animation-duration-300">100ms delay</div>
  <div class="jumi animate-bounce-in animation-duration-300">200ms delay</div>
  <div class="jumi animate-bounce-in animation-duration-300">300ms delay</div>
  <div class="jumi animate-bounce-in animation-duration-300">400ms delay</div>
</div>

<!-- Reverse order -->
<div class="animation-delay-backward-150/4">
  <!-- Last child animates first -->
</div>

<!-- Custom arbitrary values -->
<div class="animation-delay-forward-[250ms]/[3]">
  <!-- 250ms intervals between 3 items -->
</div>
```

**Pattern:** `animation-delay-{direction}-{interval}/{count}`

---

### Timing & Control

Precise control over animation behavior:

```html
<!-- Duration -->
<div class="animation-duration-500">Fast (500ms)</div>
<div class="animation-duration-2000">Slow (2s)</div>
<div class="animation-duration-[350ms]">Custom</div>

<!-- Delay -->
<div class="animation-delay-500">Starts after 500ms</div>

<!-- Iteration -->
<div class="animation-iteration-count-infinite">Loops forever</div>
<div class="animation-iteration-count-3">Repeats 3 times</div>

<!-- Direction -->
<div class="animation-direction-alternate">Bounces back and forth</div>
<div class="animation-direction-reverse">Plays backward</div>

<!-- Fill mode -->
<div class="animation-fill-mode-forwards">Stays at end state</div>
<div class="animation-fill-mode-both">Applies both start and end states</div>
```

---

### Responsive Animations

Adapt animations across breakpoints:

```html
<!-- Different effects per screen size -->
<div class="jumi animate-slide-in-up md:animate-arc-bottom-left lg:animate-fade-in">
  Mobile: slide, Tablet: arc, Desktop: fade
</div>

<!-- Responsive timing -->
<div class="animation-duration-300 md:animation-duration-600 lg:animation-duration-1000">
  Faster on mobile, slower on desktop
</div>

<!-- Conditional animations -->
<div class="md:jumi md:animate-bounce-in">
  Only animates on medium screens and up
</div>
```

---

### Accessibility

Respect user motion preferences automatically:

```html
<!-- Only animate if user allows motion -->
<div class="motion-safe:jumi motion-safe:animate-bounce-in">
  Respects prefers-reduced-motion
</div>

<!-- Provide alternative for reduced motion -->
<div class="motion-safe:animate-slide-in-up motion-reduce:animate-fade-in">
  Slides normally, fades for reduced motion users
</div>

<!-- Disable animations entirely -->
<div class="jumi animate-zoom-in motion-reduce:animation-none">
  No animation for users who prefer reduced motion
</div>
```

---

## Arbitrary Values

Use any custom value for precise control:

```html
<!-- Custom durations -->
<div class="animation-duration-[350ms]">Exact timing</div>

<!-- Custom distances -->
<div class="jumi animate-translate-x-[150px]">Exact pixels</div>
<div class="jumi animate-translate-y-[calc(100vh-50px)]">Calculated values</div>

<!-- Custom rotations -->
<div class="jumi animate-rotate-[23deg]">Specific angle</div>
<div class="jumi animate-rotate-[0.15turn]">Turn-based</div>

<!-- Custom scales -->
<div class="jumi animate-scale-[1.15]">Precise scaling</div>
```

---

## Complete Class Reference

### Timing & Control

| Class | Description |
|-------|-------------|
| `animation-duration-{ms}` | Set duration in milliseconds |
| `animation-delay-{ms}` | Delay before animation starts |
| `animation-timing-function-{easing}` | Easing function |
| `animation-iteration-count-{count}` | Number of repetitions |
| `animation-direction-{direction}` | Play direction |
| `animation-fill-mode-{mode}` | State before/after animation |
| `animation-duration-{ms}/{property}` | Per-property duration override |
| `animation-delay-{ms}/{property}` | Per-property delay override |

### Stagger System

| Class | Description |
|-------|-------------|
| `animation-delay-forward-{interval}/{count}` | Sequential forward delays |
| `animation-delay-backward-{interval}/{count}` | Sequential reverse delays |
| `animation-delay-forward-[{ms}]/[{count}]` | Custom arbitrary stagger |

### Transform Animations

| Class | Description |
|-------|-------------|
| `animate-translate-{axis}-{value}` | Translate along X or Y axis |
| `animate-rotate-{angle}` | Rotate element |
| `animate-scale-{value}` | Scale uniformly |
| `animate-scale-{axis}-{value}` | Scale single axis |

### Effect Animations

| Class | Motion Type |
|-------|-------------|
| `animate-fade-in` | Linear fade |
| `animate-bounce-in` | Spring physics |
| `animate-slide-in-{direction}` | Linear motion (up, down, left, right) |
| `animate-zoom-in` | Uniform growth |
| `animate-arc-bottom-left` | Transform-origin physics |
| `animate-arc-bottom-right` | Transform-origin physics |
| `animate-arc-top-left` | Transform-origin physics |
| `animate-arc-top-right` | Transform-origin physics |
| `animate-floating` | Organic suspension |
| `animate-shake` | Rapid oscillation |
| `animate-wobble` | Elastic deformation |
| `animate-pulsing` | Scale breathing |
| `animate-skew-{direction}` | Angular shear (left, right, up, down) |
| `animate-skew-{diagonal}` | Diagonal shear (left-up, right-down, etc.) |
| `animate-fold-in` | Unfold effect |
| `animate-magnetic` | Magnetic attraction |
| `animate-bubble` | Bubble burst |

### Property Animations

| Class Pattern | Example |
|---------------|---------|
| `animate-width-{size}` | `animate-width-full`, `animate-width-[300px]` |
| `animate-height-{size}` | `animate-height-64`, `animate-height-[200px]` |
| `animate-max-width-{size}` | `animate-max-width-[500px]` |
| `animate-background-color-{color}` | `animate-background-color-blue-500` |
| `animate-color-{color}` | `animate-color-red-600` |
| `animate-opacity-{value}` | `animate-opacity-0`, `animate-opacity-[0.35]` |
| `animate-gap-{size}` | `animate-gap-4`, `animate-gap-[12px]` |
| `animate-border-radius-{radius}` | `animate-border-radius-full` |
| `animate-border-width-{size}` | `animate-border-width-[3px]` |
| `animate-box-shadow-{shadow}` | `animate-box-shadow-xl` |
| `animate-text-shadow-{shadow}` | `animate-text-shadow-md` |
| `animate-filter-{filter}-{value}` | `animate-filter-blur-md` |
| `animate-backdrop-filter-{filter}-{value}` | `animate-backdrop-filter-blur-md` |
| `animate-fill-{color}` | `animate-fill-green-500` |

---

## Browser Support

Jumi uses modern CSS features including CSS Custom Properties and CSS Animations. Supported in all modern browsers:

- Chrome/Edge 88+
- Firefox 89+
- Safari 14+

---

## Performance Notes

- **GPU Acceleration**: Transform animations use `translate`, `rotate`, and `scale` for hardware acceleration
- **Tree Shaking**: Only utilities you use are included in the final CSS bundle
- **CSS Custom Properties**: Enables dynamic, performant animations without JavaScript
- **Minimal Runtime**: All animations run purely in CSS

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [Ridwan Olanrewaju](https://github.com/ibnlanre)**