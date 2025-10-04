# Jumi 🎬

All CSS properties are animatable, unless otherwise specified [see list](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties).

A comprehensive CSS animation library built as a TailwindCSS plugin. Transform your web interfaces with smooth, physics-based animations powered by CSS custom properties and advanced motion design.

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## ✨ Features

- 🎯 **TailwindCSS Plugin** - Seamlessly integrates with your TailwindCSS workflow
- 🔧 **TypeScript Support** - Full type definitions and IntelliSense
- 🎨 **Rich Animation Library** - 200+ pre-built effects with transform, property, and keyframe animations
- 🌊 **Physics-Based Motion** - Natural parabolic arcs, floating, and realistic motion curves
- ⚡ **Performance Optimized** - GPU-accelerated transforms and CSS custom properties
- 🎪 **Composable Architecture** - Mix and match animations for complex effects
- 📱 **Responsive & Accessible** - Works with TailwindCSS variants and respects motion preferences
- 🌟 **Tree Shakable** - Only includes the utilities you actually use
- 🎭 **Modern Animation Patterns** - Stagger animations, directional arcs, and fade-in effects

## 🚀 Quick Start

### Basic Usage

```html
<!-- Modern effect animations -->
<div class="jumi animate-fade-in animation-duration-1000">Hello World!</div>
<div class="jumi animate-bounce-in animation-duration-500">Bouncy entrance!</div>

<!-- Physics-based arc animations -->
<div class="jumi animate-arc-bottom-left animation-duration-2000">
  Arcs in from bottom-left with natural parabolic motion
</div>
<div class="jumi animate-arc-top-right animation-duration-1500">
  Swoops down from top-right corner
</div>

<!-- Smooth property animations -->
<div class="jumi animate-width-full animation-duration-1000">
  Width grows smoothly to 100%
</div>
<div class="jumi animate-background-color-blue-500 animation-duration-750">
  Background color transitions smoothly
</div>

<!-- Transform animations with natural timing -->
<div class="jumi animate-translate-x-[20px] animate-rotate-45 animation-duration-500">
  Move and rotate simultaneously
</div>

<!-- Stagger animations for sequential effects -->
<div class="animation-delay-forward-100/5 jumi animation-duration-300">
  <div class="jumi animation-duration-300 animate-slide-in-up">Item 1 (0ms delay)</div>
  <div class="jumi animation-duration-300 animate-slide-in-down">Item 2 (100ms delay)</div>
  <div class="jumi animation-duration-300 animate-slide-in-up">Item 3 (200ms delay)</div>
  <div class="jumi animation-duration-300 animate-slide-in-down">Item 4 (300ms delay)</div>
  <div class="jumi animation-duration-300 animate-slide-in-up">Item 5 (400ms delay)</div>
</div>

<!-- Hover effects with proper timing -->
<button class="hover:animate-scale-110 animation-duration-200">
  Hover for smooth scale
</button>
```

## 🎯 Modern Animation Architecture

Jumi provides a flexible animation system using CSS custom properties, delivering smooth motion that feels organic and performant.

### Physics-Based Arc Animations

Experience natural parabolic motion using transform-origin mechanics:

```html
<!-- Complete directional arc system -->
<div class="jumi animate-arc-bottom-left animation-duration-2000">
  Swoops up from bottom-left corner
</div>
<div class="jumi animate-arc-bottom-right animation-duration-2000">
  Arcs up from bottom-right corner  
</div>
<div class="jumi animate-arc-top-left animation-duration-2000">
  Swings down from top-left corner
</div>
<div class="jumi animate-arc-top-right animation-duration-2000">
  Curves down from top-right corner
</div>
```

**How it works:**
- Uses `transform-origin: bottom/top` for natural pivot points
- Combines `translateX`, `translateY`, and `rotate` for parabolic curves
- Fades in during motion for elegant entrance effects
- GPU-accelerated for smooth 60fps performance

### Intelligent Stagger System

Create sequential animations with automatic timing calculation:

```html
<!-- Forward stagger with CSS calc() -->
<div class="animation-delay-forward-100/5 *:jumi *:animate-bounce-in">
  <div>Animates first (0ms)</div>
  <div>Animates second (100ms)</div>
  <div>Animates third (200ms)</div>
  <div>Animates fourth (300ms)</div>
  <div>Animates fifth (400ms)</div>
</div>

<!-- Reverse stagger -->
<div class="animation-delay-backward-150/4 *:animate-slide-in-up">
  <div>Animates fourth (450ms)</div>
  <div>Animates third (300ms)</div>
  <div>Animates second (150ms)</div>
  <div>Animates first (0ms)</div>
</div>

<!-- Custom arbitrary values -->
<div class="animation-delay-forward-[250ms]/[3] *:animate-fade-in">
  <div>0ms delay</div>
  <div>250ms delay</div>
  <div>500ms delay</div>
</div>
```

<!-- Relationship-based styling can be expressed using Tailwind's built-in :is() and :has() variants in v4 -->
<!-- Example (conceptual): is-[p]:animate-width-full, has-[>img]:animate-height-auto -->

### Enhanced Property Animations

Smooth property transitions with intelligent defaults:

```html
<!-- Size animations -->
<div class="jumi animate-width-full animation-duration-1000">
  Width expands from current to 100%
</div>
<div class="jumi animate-height-[300px] animation-duration-750">
  Height grows to exact 300px
</div>

<!-- Color transitions -->
<div class="jumi animate-background-color-red-500 animation-duration-500">
  Background smoothly transitions to red
</div>
<div class="jumi animate-color-blue-600 animation-duration-300">
  Text color fades to blue
</div>

<!-- Border animations -->
<div class="jumi animate-border-radius-full animation-duration-800">
  Morphs into a perfect circle
</div>
```

## 🧠 Concepts at a glance

- Just‑in‑time utilities: only the CSS you use is generated.
- Millisecond‑based timing: `animation-duration-600`, `animation-delay-150`.
- Composable by design: combine `animate-translate-*`, `animate-rotate-*`, `animate-scale-*`.
- Per‑property overrides: `animation-duration-600/rotate` with a global fallback.
- Prefer Tailwind v4 relationship variants like `is-*`/`has-*` when needed.

### Animation Timing & Control

Precise timing control with natural feeling defaults:

```html
<!-- Duration (using fractional seconds for precision) -->
<div class="jumi animate-fade-in animation-duration-500">Quick fade (500ms)</div>
<div class="jumi animate-bounce-in animation-duration-2000">Slow bounce (2000ms)</div>
<div class="jumi animate-slide-in-up animation-duration-1250">Custom timing (1250ms)</div>

<!-- Delay for choreographed sequences -->
<div class="jumi animate-zoom-in animation-delay-500">Delayed zoom</div>
<div class="jumi animate-slide-in-left animation-delay-1000">Later slide</div>

<!-- Iteration control -->
<div class="jumi animate-pulsing animation-iteration-count-infinite">Infinite pulse</div>
<div class="jumi animate-shake animation-iteration-count-3">Shake 3 times</div>

<!-- Direction control -->
<div class="jumi animate-bounce-in animation-direction-alternate">Bounces back and forth</div>
<div class="jumi animate-slide-in-up animation-direction-reverse">Reverses motion</div>
```

### Transform Animations

Smooth, GPU-accelerated movement:

```html
<!-- Single-axis translation -->
<div class="jumi animate-translate-x-[50px] animation-duration-750">Move right 50px</div>
<div class="jumi animate-translate-y-[-30px] animation-duration-500">Move up 30px</div>

<!-- Combined transforms (compose naturally) -->
<div class="jumi animate-translate-x-[20px] animate-rotate-45 animate-scale-110 animation-duration-1000">
  Move, rotate, and scale together
</div>

<!-- Rotation with different units -->
<div class="jumi animate-rotate-90 animation-duration-500">Quarter turn</div>
<div class="jumi animate-rotate-[0.25turn] animation-duration-1000">Same as above, turn units</div>

<!-- Scaling variations -->
<div class="jumi animate-scale-125 animation-duration-300">Scale up 25%</div>
<div class="jumi animate-scale-x-150 animation-duration-800">Scale width only</div>
<div class="jumi animate-scale-[0.85] animation-duration-600">Scale down to 85%</div>
```

### Effect Animations

Carefully crafted entrance, exit, and attention effects:

```html
<!-- Entrance effects with natural motion -->
<div class="jumi animate-bounce-in animation-duration-800">Bouncy entrance</div>
<div class="jumi animate-fade-in animation-duration-1000">Gentle fade in</div>
<div class="jumi animate-slide-in-up animation-duration-600">Slides up from below</div>
<div class="jumi animate-zoom-in animation-duration-500">Zooms into view</div>

<!-- Modern arc entrances (physics-based) -->
<div class="jumi animate-arc-bottom-left animation-duration-1500">Swoops from bottom-left</div>
<div class="jumi animate-arc-top-right animation-duration-1200">Arcs from top-right</div>

<!-- Floating and organic motion -->
<div class="jumi animate-floating animation-duration-3000 animation-iteration-count-infinite">
  Gentle floating motion
</div>

<!-- Attention-seeking animations -->
<div class="jumi animate-shake animation-duration-500 animation-iteration-count-3">
  Shake for attention
</div>
<div class="jumi animate-pulsing animation-duration-2000 animation-iteration-count-infinite">
  Continuous pulsing
</div>
<div class="jumi animate-wobble animation-duration-1000 animation-iteration-count-2">
  Playful wobble
</div>

<!-- Advanced effects -->
<div class="jumi animate-fold-in animation-duration-1000">Unfolds into view</div>
<div class="jumi animate-magnetic animation-duration-800">Magnetic attraction effect</div>
<div class="jumi animate-bubble animation-duration-1500">Bubble burst effect</div>

### Per‑property modifiers (selective tweaks)

You can target specific animated properties with modifiers while keeping a global default.

Syntax: `animation-duration-{ms}/{property}`

Examples:

```html
<!-- Rotate runs at 600ms, everything else at 300ms -->
<div class="jumi animate-rotate-90 animate-scale-110 animation-duration-600/rotate animation-duration-300"></div>

<!-- Width at 800ms, global 400ms -->
<div class="jumi animate-width-full animation-duration-800/width animation-duration-400"></div>

<!-- Works for any animatable property: width, height, color, translate-x, etc. -->
<div class="jumi animate-height-[200px] animate-translate-x-[24px] animation-duration-500/height animation-duration-300"></div>
```

### Property Animations

Direct CSS property animations with smooth transitions:

```html
<!-- Dimensional animations -->
<div class="jumi animate-width-full animation-duration-1000">Width grows to 100%</div>
<div class="jumi animate-height-[200px] animation-duration-750">Height to 200px</div>
<div class="jumi animate-max-width-[500px] animation-duration-1200">Max width constraint</div>

<!-- Color transitions -->
<div class="jumi animate-background-color-blue-500 animation-duration-800">
  Background fades to blue
</div>
<div class="jumi animate-color-red-600 animation-duration-500">
  Text color shifts to red
</div>
<div class="jumi animate-fill-green-500 animation-duration-750">
  SVG fill changes to green
</div>

<!-- Border and shape animations -->
<div class="jumi animate-border-radius-full animation-duration-1000">
  Morphs into a circle
</div>
<div class="jumi animate-border-width-[3px] animation-duration-500">
  Border grows thicker
</div>

<!-- Shadow and depth -->
<div class="jumi animate-box-shadow-xl animation-duration-300">
  Shadow expands dramatically
</div>
<div class="jumi animate-text-shadow-md animation-duration-400">
  Text gains shadow depth
</div>

<!-- Filter effects -->
<div class="jumi animate-filter-blur-md animation-duration-1500">
  Gradually blurs
</div>
<div class="jumi animate-filter-brightness-125 animation-duration-800">
  Brightens up
</div>
```

## 🎛️ Usage Notes

- Works out of the box with Tailwind v4 plugin API in this repo. No extra config is required here.
- Utilities are injected just-in-time: only variables and keyframes you use are emitted.
- Use arbitrary values for precise control: `animate-width-[320px]`, `animate-rotate-[23deg]`, `animation-duration-[350ms]`.

## 🎯 Advanced Usage

### Arbitrary Values & Custom Properties

Precise control with arbitrary values:

```html
<!-- Custom durations -->
<div class="jumi animate-fade-in animation-duration-[350ms]">Custom timing</div>
<div class="jumi animate-bounce-in animation-duration-[1750ms]">Precise duration</div>

<!-- Custom distances -->
<div class="jumi animate-translate-x-[150px]">Exact pixel movement</div>
<div class="jumi animate-translate-y-[calc(100vh-50px)]">Viewport-relative</div>

<!-- Custom rotations -->
<div class="jumi animate-rotate-[23deg]">Specific angle</div>
<div class="jumi animate-rotate-[0.15turn]">Turn-based rotation</div>

<!-- Custom scales -->
<div class="jumi animate-scale-[1.15]">Precise scaling</div>
<div class="jumi animate-scale-x-[0.8]">Width-only scaling</div>
```

### Responsive Animation Design

Adaptive animations across breakpoints:

```html
<!-- Different effects per breakpoint -->
<div class="jumi animate-slide-in-up md:animate-arc-bottom-left lg:animate-fade-in">
  Mobile: slide up, Tablet: arc motion, Desktop: simple fade
</div>

<!-- Responsive timing -->
<div class="animation-duration-300 md:animation-duration-600 lg:animation-duration-1000">
  Faster on mobile, slower on larger screens
</div>

<!-- Conditional animations -->
<div class="md:animate md:animate-bounce-in">
  Only animates on medium screens and up
</div>
```

### Motion Preferences & Accessibility

Respect user motion preferences:

```html
<!-- Respect reduced motion preferences -->
<div class="motion-safe:animate motion-safe:animate-bounce-in">
  Only animates if user allows motion
</div>

<!-- Alternative for reduced motion -->
<div class="motion-safe:animate-slide-in-up motion-reduce:animate-fade-in">
  Slides normally, fades for reduced motion
</div>

<!-- Disable animations entirely -->
<div class="motion-reduce:animation-none animate animate-zoom-in">
  No animation for reduced motion preference
</div>
```

<!-- Advanced choreography examples removed for brevity -->

## 🎨 Complete Class Reference

### Animation Timing & Control

| Class Pattern | Description | Example |
|---------------|-------------|---------|
| `animation-duration-{ms}` | Set animation duration (milliseconds) | `animation-duration-300`, `animation-duration-1250` |
| `animation-delay-{ms}` | Set animation delay (milliseconds) | `animation-delay-150`, `animation-delay-800` |
| `animation-timing-function-{easing}` | Set easing function | `animation-timing-function-ease-in-out` |
| `animation-iteration-count-{count}` | Set repeat count | `animation-iteration-count-3`, `animation-iteration-count-infinite` |
| `animation-direction-{direction}` | Control direction | `animation-direction-reverse`, `animation-direction-alternate` |
| `animation-fill-mode-{mode}` | Set fill mode | `animation-fill-mode-forwards`, `animation-fill-mode-both` |
| `animation-duration-{ms}/{property}` | Per‑property duration override | `animation-duration-600/rotate`, `animation-duration-800/width` |
| `animation-delay-{ms}/{property}` | Per‑property delay override | `animation-delay-150/opacity`, `animation-delay-300/translate-x` |

### Stagger Animation System

| Class Pattern | Description | Example |
|---------------|-------------|---------|
| `animation-delay-forward-{interval}/{count}` | Forward stagger delays | `animation-delay-forward-100/5` |
| `animation-delay-backward-{interval}/{count}` | Reverse stagger delays | `animation-delay-backward-150/4` |
| `animation-delay-forward-[{ms}]/[{count}]` | Custom arbitrary stagger | `animation-delay-forward-[250ms]/[6]` |

### Transform Animations

| Class Pattern | Description | Example |
|---------------|-------------|---------|
| `animate-translate-{axis}-{distance}` | Translate along axis | `animate-translate-x-[20px]`, `animate-translate-y-4` |
| `animate-rotate-{angle}` | Rotate element | `animate-rotate-45`, `animate-rotate-[23deg]` |
| `animate-scale-{scale}` | Scale uniformly | `animate-scale-110`, `animate-scale-[1.15]` |
| `animate-scale-{axis}-{scale}` | Scale single axis | `animate-scale-x-125`, `animate-scale-y-[0.8]` |

### Effect Animations

| Class | Description | Motion Type |
|-------|-------------|-------------|
| `animate-fade-in` | Gentle opacity transition | Linear fade |
| `animate-bounce-in` | Bouncy entrance | Spring physics |
| `animate-slide-in-{direction}` | Directional slide | Linear motion |
| `animate-zoom-in` | Scale-based entrance | Uniform growth |
| `animate-arc-bottom-left` | Parabolic motion from bottom-left | Transform-origin physics |
| `animate-arc-bottom-right` | Parabolic motion from bottom-right | Transform-origin physics |
| `animate-arc-top-left` | Parabolic motion from top-left | Transform-origin physics |
| `animate-arc-top-right` | Parabolic motion from top-right | Transform-origin physics |
| `animate-floating` | Gentle floating motion | Organic suspension |
| `animate-shake` | Attention-seeking shake | Rapid oscillation |
| `animate-wobble` | Playful wobble | Elastic deformation |
| `animate-pulsing` | Rhythmic pulsing | Scale breathing |
| `animate-skew-{direction}` | Directional skew (left, right, up, down) | Angular shear |
| `animate-skew-{diagonal}` | Diagonal skew (left-up, right-down, left-down, right-up) | Angular shear |

### Property Animations

| Class Pattern | Description | Example |
|---------------|-------------|---------|
| `animate-width-{size}` | Animate width property | `animate-width-full`, `animate-width-[300px]` |
| `animate-height-{size}` | Animate height property | `animate-height-64`, `animate-height-[200px]` |
| `animate-max-width-{size}` | Animate max-width constraint | `animate-max-width-[500px]` |
| `animate-background-color-{color}` | Background color transition | `animate-background-color-blue-500` |
| `animate-color-{color}` | Text color transition | `animate-color-red-600` |
| `animate-opacity-{value}` | Opacity transition | `animate-opacity-0`, `animate-opacity-[0.35]` |
| `animate-gap-{size}` | Grid/flex gap transition | `animate-gap-4`, `animate-gap-[12px]` |
| `animate-border-radius-{radius}` | Border radius morphing | `animate-border-radius-full` |
| `animate-border-width-{size}` | Border width animation | `animate-border-width-[3px]` |
| `animate-box-shadow-{shadow}` | Shadow depth animation | `animate-box-shadow-xl` |
| `animate-text-shadow-{shadow}` | Text shadow animation | `animate-text-shadow-md` |
| `animate-filter-{filter}-{value}` | Filter effect animation | `animate-filter-blur-md` |
| `animate-backdrop-filter-{filter}-{value}` | Backdrop filter animation | `animate-backdrop-filter-blur-md` |
| `animate-fill-{color}` | SVG fill color transition | `animate-fill-green-500` |

<!-- Natural language variants were removed. Prefer Tailwind's :is/:has patterns in v4 (e.g., is-[p]:..., has-[>img]:...) -->

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [TailwindCSS](https://tailwindcss.com/)

---

**Made with ❤️ by [Ridwan Olanrewaju](https://github.com/ibnlanre)**
