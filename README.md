# Jumi 🎬

All CSS properties are animatable, unless otherwise specified [see list](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties).

A comprehensive CSS animation library built as a TailwindCSS plugin. Transform your web interfaces with smooth, physics-based animations powered by CSS custom properties, natural language patterns, and advanced motion design.

[![npm version](https://badge.fury.io/js/jumi.svg)](https://badge.fury.io/js/jumi)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## ✨ Features

- 🎯 **TailwindCSS Plugin** - Seamlessly integrates with your TailwindCSS workflow
- 🔧 **TypeScript Support** - Full type definitions and IntelliSense
- 🎨 **Rich Animation Library** - 200+ pre-built effects with transform, property, and keyframe animations
- 🌊 **Physics-Based Motion** - Natural parabolic arcs, floating, and realistic motion curves
- ⚡ **Performance Optimized** - GPU-accelerated transforms and CSS custom properties
- 🎪 **Composable Architecture** - Mix and match animations for complex effects
- 📱 **Responsive & Accessible** - Works with all TailwindCSS variants and respects motion preferences
- 🗣️ **Natural Language API** - Intuitive class names like `if-child-is`, `effect-arc-bottom-left`
- 🎛️ **Highly Configurable** - Customize durations, easings, stagger timing, and more
- 🌟 **Tree Shakable** - Only includes the utilities you actually use
- 🎭 **Modern Animation Patterns** - Stagger animations, directional arcs, and fade-in effects

## 🚀 Quick Start

### Installation

```bash
npm install jumi
# or
yarn add jumi
# or
pnpm add jumi
```

### Setup

Add Jumi to your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  plugins: [
    require("jumi")(), // Add Jumi plugin
  ],
};
```

### Basic Usage

```html
<!-- Modern effect animations -->
<div class="animate effect-fade-in animation-duration-1">Hello World!</div>
<div class="animate effect-bounce-in animation-duration-500">Bouncy entrance!</div>

<!-- Physics-based arc animations -->
<div class="animate effect-arc-bottom-left animation-duration-2">
  Arcs in from bottom-left with natural parabolic motion
</div>
<div class="animate effect-arc-top-right animation-duration-1.5">
  Swoops down from top-right corner
</div>

<!-- Smooth property animations -->
<div class="animate animate-width-full animation-duration-1000">
  Width grows smoothly to 100%
</div>
<div class="animate animate-background-color-blue-500 animation-duration-750">
  Background color transitions smoothly
</div>

<!-- Transform animations with natural timing -->
<div class="animate animate-translate-x-[20px] animate-rotate-45 animation-duration-500">
  Move and rotate simultaneously
</div>

<!-- Stagger animations for sequential effects -->
<div class="animation-delay-forward-100/5 *:animate *:effect-slide-in-up *:animation-duration-300">
  <div>Item 1 (0ms delay)</div>
  <div>Item 2 (100ms delay)</div>
  <div>Item 3 (200ms delay)</div>
  <div>Item 4 (300ms delay)</div>
  <div>Item 5 (400ms delay)</div>
</div>

<!-- Natural language variants -->
<div class="if-child-is-h1:animate-accent-color-amber-500">
  <h1>This heading triggers color animation on parent</h1>
</div>

<!-- Hover effects with proper timing -->
<button class="hover:animate-scale-110 animation-duration-200">
  Hover for smooth scale
</button>
```

## 🎯 Modern Animation Architecture

Jumi features a revolutionary animation system that combines CSS fidelity with natural language patterns, delivering smooth, physics-based motion that feels organic and performant.

### Physics-Based Arc Animations

Experience natural parabolic motion using transform-origin mechanics:

```html
<!-- Complete directional arc system -->
<div class="animate effect-arc-bottom-left animation-duration-2">
  Swoops up from bottom-left corner
</div>
<div class="animate effect-arc-bottom-right animation-duration-2">
  Arcs up from bottom-right corner  
</div>
<div class="animate effect-arc-top-left animation-duration-2">
  Swings down from top-left corner
</div>
<div class="animate effect-arc-top-right animation-duration-2">
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
<div class="animation-delay-forward-100/5 *:animate *:effect-bounce-in">
  <div>Animates first (0ms)</div>
  <div>Animates second (100ms)</div>
  <div>Animates third (200ms)</div>
  <div>Animates fourth (300ms)</div>
  <div>Animates fifth (400ms)</div>
</div>

<!-- Reverse stagger -->
<div class="animation-delay-backward-150/4 *:effect-slide-in-up">
  <div>Animates fourth (450ms)</div>
  <div>Animates third (300ms)</div>
  <div>Animates second (150ms)</div>
  <div>Animates first (0ms)</div>
</div>

<!-- Custom arbitrary values -->
<div class="animation-delay-forward-[0.25s]/[3] *:effect-fade-in">
  <div>0ms delay</div>
  <div>250ms delay</div>
  <div>500ms delay</div>
</div>
```

### Natural Language Variants

Intuitive relationship-based styling:

```html
<!-- Child state triggers parent animation -->
<div class="if-child-is-h1:animate-accent-color-blue-500">
  <h1>This heading triggers color change above</h1>
</div>

<!-- Sibling relationships -->
<div class="if-next-sibling-is-button:animate-width-full">
  This grows when followed by a button
</div>
<button>I'm the next sibling</button>

<!-- Direct child targeting -->
<nav class="if-direct-child-is-[*]:animate-height-auto">
  <a href="/">Direct child link</a>
</nav>
```

### Enhanced Property Animations

Smooth property transitions with intelligent defaults:

```html
<!-- Size animations -->
<div class="animate animate-width-full animation-duration-1000">
  Width expands from current to 100%
</div>
<div class="animate animate-height-[300px] animation-duration-750">
  Height grows to exact 300px
</div>

<!-- Color transitions -->
<div class="animate animate-background-color-red-500 animation-duration-500">
  Background smoothly transitions to red
</div>
<div class="animate animate-color-blue-600 animation-duration-300">
  Text color fades to blue
</div>

<!-- Border animations -->
<div class="animate animate-border-radius-full animation-duration-800">
  Morphs into a perfect circle
</div>
```

## 📚 Core Animation Concepts

### Animation Timing & Control

Precise timing control with natural feeling defaults:

```html
<!-- Duration (using fractional seconds for precision) -->
<div class="animate effect-fade-in animation-duration-0.5">Quick fade (500ms)</div>
<div class="animate effect-bounce-in animation-duration-2">Slow bounce (2s)</div>
<div class="animate effect-slide-in-up animation-duration-1.25">Custom timing (1.25s)</div>

<!-- Delay for choreographed sequences -->
<div class="animate effect-zoom-in animation-delay-0.5">Delayed zoom</div>
<div class="animate effect-slide-in-left animation-delay-1">Later slide</div>

<!-- Iteration control -->
<div class="animate effect-pulsate animation-iteration-count-infinite">Infinite pulse</div>
<div class="animate effect-shake animation-iteration-count-3">Shake 3 times</div>

<!-- Direction control -->
<div class="animate effect-bounce-in animation-direction-alternate">Bounces back and forth</div>
<div class="animate effect-slide-in-up animation-direction-reverse">Reverses motion</div>
```

### Transform Animations

Smooth, GPU-accelerated movement:

```html
<!-- Single-axis translation -->
<div class="animate animate-translate-x-[50px] animation-duration-0.75">Move right 50px</div>
<div class="animate animate-translate-y-[-30px] animation-duration-0.5">Move up 30px</div>

<!-- Combined transforms (compose naturally) -->
<div class="animate animate-translate-x-[20px] animate-rotate-45 animate-scale-110 animation-duration-1">
  Move, rotate, and scale together
</div>

<!-- Rotation with different units -->
<div class="animate animate-rotate-90 animation-duration-0.5">Quarter turn</div>
<div class="animate animate-rotate-[0.25turn] animation-duration-1">Same as above, turn units</div>

<!-- Scaling variations -->
<div class="animate animate-scale-125 animation-duration-0.3">Scale up 25%</div>
<div class="animate animate-scale-x-150 animation-duration-0.8">Scale width only</div>
<div class="animate animate-scale-[0.85] animation-duration-0.6">Scale down to 85%</div>
```

### Effect Animations

Carefully crafted entrance, exit, and attention effects:

```html
<!-- Entrance effects with natural motion -->
<div class="animate effect-bounce-in animation-duration-0.8">Bouncy entrance</div>
<div class="animate effect-fade-in animation-duration-1">Gentle fade in</div>
<div class="animate effect-slide-in-up animation-duration-0.6">Slides up from below</div>
<div class="animate effect-zoom-in animation-duration-0.5">Zooms into view</div>

<!-- Modern arc entrances (physics-based) -->
<div class="animate effect-arc-bottom-left animation-duration-1.5">Swoops from bottom-left</div>
<div class="animate effect-arc-top-right animation-duration-1.2">Arcs from top-right</div>

<!-- Floating and organic motion -->
<div class="animate effect-float animation-duration-3 animation-iteration-count-infinite">
  Gentle floating motion
</div>

<!-- Attention-seeking animations -->
<div class="animate effect-shake animation-duration-0.5 animation-iteration-count-3">
  Shake for attention
</div>
<div class="animate effect-pulsate animation-duration-2 animation-iteration-count-infinite">
  Continuous pulsing
</div>
<div class="animate effect-wobble animation-duration-1 animation-iteration-count-2">
  Playful wobble
</div>

<!-- Advanced effects -->
<div class="animate effect-fold-in animation-duration-1">Unfolds into view</div>
<div class="animate effect-magnetic animation-duration-0.8">Magnetic attraction effect</div>
<div class="animate effect-bubble animation-duration-1.5">Bubble burst effect</div>
```

### Property Animations

Direct CSS property animations with smooth transitions:

```html
<!-- Dimensional animations -->
<div class="animate animate-width-full animation-duration-1">Width grows to 100%</div>
<div class="animate animate-height-[200px] animation-duration-0.75">Height to 200px</div>
<div class="animate animate-max-width-[500px] animation-duration-1.2">Max width constraint</div>

<!-- Color transitions -->
<div class="animate animate-background-color-blue-500 animation-duration-0.8">
  Background fades to blue
</div>
<div class="animate animate-color-red-600 animation-duration-0.5">
  Text color shifts to red
</div>
<div class="animate animate-fill-green-500 animation-duration-0.75">
  SVG fill changes to green
</div>

<!-- Border and shape animations -->
<div class="animate animate-border-radius-full animation-duration-1">
  Morphs into a circle
</div>
<div class="animate animate-border-width-[3px] animation-duration-0.5">
  Border grows thicker
</div>

<!-- Shadow and depth -->
<div class="animate animate-box-shadow-xl animation-duration-0.3">
  Shadow expands dramatically
</div>
<div class="animate animate-text-shadow-md animation-duration-0.4">
  Text gains shadow depth
</div>

<!-- Filter effects -->
<div class="animate animate-filter-blur-md animation-duration-1.5">
  Gradually blurs
</div>
<div class="animate animate-filter-brightness-125 animation-duration-0.8">
  Brightens up
</div>
```

## 🎛️ Configuration

Customize Jumi to perfectly match your design system:

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require("jumi")({
      // Enable/disable feature sets
      enableHover: true,     // Hover variant support (default: true)
      enableGroup: true,     // Group hover variants (default: true) 
      enableFocus: true,     // Focus variants (default: true)
      enableDark: false,     // Dark mode variants (default: false)
      
      // Natural language variants
      enableVariants: true,  // if-child-is, if-sibling-is, etc. (default: true)
      
      // Stagger animation system
      enableStagger: true,   // animation-delay-forward/backward (default: true)
      
      // Theme extensions
      theme: {
        // Custom animation durations
        animationDuration: {
          'ultra-fast': '50ms',
          'lightning': '150ms', 
          'relaxed': '2.5s',
          'glacial': '10s',
        },
        
        // Custom distances for transforms
        animationDistance: {
          'tiny': '0.125rem',   // 2px
          'huge': '8rem',       // 128px
          'screen': '100vw',    // Full viewport width
          'half-screen': '50vh', // Half viewport height
        },
        
        // Custom timing functions
        animationTimingFunction: {
          'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
          'elastic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        },
        
        // Custom scale values
        animationScale: {
          'micro': '0.98',
          'massive': '2.5',
          'flip': '-1',
        },
        
        // Custom rotation angles
        animationRotate: {
          'slight': '2deg',
          'dramatic': '180deg', 
          'full-spin': '720deg',
        },
      },
    }),
  ],
};
```

## 🎯 Advanced Usage

### Arbitrary Values & Custom Properties

Precise control with arbitrary values:

```html
<!-- Custom durations -->
<div class="animate effect-fade-in animation-duration-[350ms]">Custom timing</div>
<div class="animate effect-bounce-in animation-duration-[1.75s]">Precise duration</div>

<!-- Custom distances -->
<div class="animate animate-translate-x-[150px]">Exact pixel movement</div>
<div class="animate animate-translate-y-[calc(100vh-50px)]">Viewport-relative</div>

<!-- Custom rotations -->
<div class="animate animate-rotate-[23deg]">Specific angle</div>
<div class="animate animate-rotate-[0.15turn]">Turn-based rotation</div>

<!-- Custom scales -->
<div class="animate animate-scale-[1.15]">Precise scaling</div>
<div class="animate animate-scale-x-[0.8]">Width-only scaling</div>
```

### Responsive Animation Design

Adaptive animations across breakpoints:

```html
<!-- Different effects per breakpoint -->
<div class="animate effect-slide-in-up md:effect-arc-bottom-left lg:effect-fade-in">
  Mobile: slide up, Tablet: arc motion, Desktop: simple fade
</div>

<!-- Responsive timing -->
<div class="animation-duration-0.3 md:animation-duration-0.6 lg:animation-duration-1">
  Faster on mobile, slower on larger screens
</div>

<!-- Conditional animations -->
<div class="md:animate md:effect-bounce-in">
  Only animates on medium screens and up
</div>
```

### Motion Preferences & Accessibility

Respect user motion preferences:

```html
<!-- Respect reduced motion preferences -->
<div class="motion-safe:animate motion-safe:effect-bounce-in">
  Only animates if user allows motion
</div>

<!-- Alternative for reduced motion -->
<div class="motion-safe:effect-slide-in-up motion-reduce:effect-fade-in">
  Slides normally, fades for reduced motion
</div>

<!-- Disable animations entirely -->
<div class="motion-reduce:animation-none animate effect-zoom-in">
  No animation for reduced motion preference
</div>
```

### Advanced Choreography

Complex animation sequences:

```html
<!-- Staged entrance choreography -->
<div class="space-y-4">
  <!-- Hero title enters first -->
  <h1 class="animate effect-arc-top-left animation-duration-1.2">
    Welcome to Our Site
  </h1>
  
  <!-- Subtitle follows with delay -->
  <p class="animate effect-fade-in animation-duration-0.8 animation-delay-0.3">
    Beautiful animations made simple
  </p>
  
  <!-- Buttons stagger in -->
  <div class="animation-delay-forward-200/3 *:animate *:effect-slide-in-up *:animation-duration-0.6">
    <button>Get Started</button>
    <button>Learn More</button>
    <button>Contact Us</button>
  </div>
</div>

<!-- Card grid with wave entrance -->
<div class="grid grid-cols-3 gap-4 animation-delay-forward-150/9">
  <!-- Cards animate in wave pattern (150ms between each) -->
  <div class="animate effect-arc-bottom-left animation-duration-1 *:bg-blue-100 *:p-4 *:rounded">
    <div>Card 1</div>
  </div>
  <div class="animate effect-arc-bottom-left animation-duration-1 *:bg-green-100 *:p-4 *:rounded">
    <div>Card 2</div>
  </div>
  <!-- ... 7 more cards ... -->
</div>
```

## 🎨 Complete Class Reference

### Animation Timing & Control

| Class Pattern | Description | Example |
|---------------|-------------|---------|
| `animation-duration-{time}` | Set animation duration | `animation-duration-0.5`, `animation-duration-2` |
| `animation-delay-{time}` | Set animation delay | `animation-delay-0.3`, `animation-delay-1` |
| `animation-timing-function-{easing}` | Set easing function | `animation-timing-function-ease-in-out` |
| `animation-iteration-count-{count}` | Set repeat count | `animation-iteration-count-3`, `animation-iteration-count-infinite` |
| `animation-direction-{direction}` | Control direction | `animation-direction-reverse`, `animation-direction-alternate` |
| `animation-fill-mode-{mode}` | Set fill mode | `animation-fill-mode-forwards`, `animation-fill-mode-both` |

### Stagger Animation System

| Class Pattern | Description | Example |
|---------------|-------------|---------|
| `animation-delay-forward-{interval}/{count}` | Forward stagger delays | `animation-delay-forward-100/5` |
| `animation-delay-backward-{interval}/{count}` | Reverse stagger delays | `animation-delay-backward-150/4` |
| `animation-delay-forward-[{time}]/[{count}]` | Custom arbitrary stagger | `animation-delay-forward-[0.25s]/[6]` |

### Transform Animations

| Class Pattern | Description | Example |
|---------------|-------------|---------|
| `animate-translate-{axis}-{distance}` | Translate along axis | `animate-translate-x-[20px]`, `animate-translate-y-4` |
| `animate-rotate-{angle}` | Rotate element | `animate-rotate-45`, `animate-rotate-[23deg]` |
| `animate-scale-{scale}` | Scale uniformly | `animate-scale-110`, `animate-scale-[1.15]` |
| `animate-scale-{axis}-{scale}` | Scale single axis | `animate-scale-x-125`, `animate-scale-y-[0.8]` |

### Effect Animations (Physics-Based)

| Class | Description | Motion Type |
|-------|-------------|-------------|
| `effect-fade-in` | Gentle opacity transition | Linear fade |
| `effect-bounce-in` | Bouncy entrance | Spring physics |
| `effect-slide-in-{direction}` | Directional slide | Linear motion |
| `effect-zoom-in` | Scale-based entrance | Uniform growth |
| `effect-arc-bottom-left` | Parabolic motion from bottom-left | Transform-origin physics |
| `effect-arc-bottom-right` | Parabolic motion from bottom-right | Transform-origin physics |
| `effect-arc-top-left` | Parabolic motion from top-left | Transform-origin physics |
| `effect-arc-top-right` | Parabolic motion from top-right | Transform-origin physics |
| `effect-float` | Gentle floating motion | Organic suspension |
| `effect-shake` | Attention-seeking shake | Rapid oscillation |
| `effect-wobble` | Playful wobble | Elastic deformation |
| `effect-pulsate` | Rhythmic pulsing | Scale breathing |

### Property Animations

| Class Pattern | Description | Example |
|---------------|-------------|---------|
| `animate-width-{size}` | Animate width property | `animate-width-full`, `animate-width-[300px]` |
| `animate-height-{size}` | Animate height property | `animate-height-64`, `animate-height-[200px]` |
| `animate-background-color-{color}` | Background color transition | `animate-background-color-blue-500` |
| `animate-color-{color}` | Text color transition | `animate-color-red-600` |
| `animate-border-radius-{radius}` | Border radius morphing | `animate-border-radius-full` |
| `animate-box-shadow-{shadow}` | Shadow depth animation | `animate-box-shadow-xl` |
| `animate-filter-{filter}-{value}` | Filter effect animation | `animate-filter-blur-md` |

### Natural Language Variants

| Class Pattern | Description | Example |
|---------------|-------------|---------|
| `if-child-is-{selector}:{utility}` | Child state triggers parent | `if-child-is-h1:animate-color-blue-500` |
| `if-sibling-is-{selector}:{utility}` | Sibling state triggers | `if-sibling-is-button:animate-width-full` |
| `if-direct-child-is-{selector}:{utility}` | Direct child targeting | `if-direct-child-is-a:animate-height-auto` |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [TailwindCSS](https://tailwindcss.com/)

---

**Made with ❤️ by [Ridwan Olanrewaju](https://github.com/ibnlanre)**
