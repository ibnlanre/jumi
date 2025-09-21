# Jumi 🎬

All CSS properties are animatable [see list](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties).

A comprehensive CSS animation library built as a TailwindCSS plugin. Transform your web interfaces with smooth, composable animations powered by CSS custom properties and TailwindCSS.

[![npm version](https://badge.fury.io/js/jumi.svg)](https://badge.fury.io/js/jumi)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## ✨ Features

- 🎯 **TailwindCSS Plugin** - Seamlessly integrates with your TailwindCSS workflow
- 🔧 **TypeScript Support** - Full type definitions and IntelliSense
- 🎨 **Rich Animations** - Transform, effect, and property-based animations
- ⚡ **Performance Optimized** - CSS custom properties for dynamic control
- 🎪 **Composable** - Mix and match animations for complex effects
- 📱 **Responsive** - Works with all TailwindCSS variants (hover, responsive, dark mode)
- 🎛️ **Highly Configurable** - Customize durations, easings, and more
- 🌟 **Tree Shakable** - Only includes the utilities you actually use
- 🚀 **Enhanced Architecture** - Built with TailwindCSS patterns for better performance

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
<!-- Fade in animation -->
<div class="animate-fade-in animate-duration-1">Hello World!</div>

<!-- Composable animations (NEW!) -->
<div
  class="animate-translate-x-4 animate-scale-110 animate-rotate-12 animate-duration-500"
>
  Multiple transforms in one animation!
</div>

<!-- Enhanced property animations -->
<div
  class="animate-opacity-50 animate-w-64 animate-bg-blue-500 animate-duration-1000"
>
  Animate multiple properties smoothly
</div>

<!-- Bounce with custom timing -->
<div class="animate-bounce-in animate-duration-500 animation-delay-200">
  I bounce on load!
</div>

<!-- Transform animations -->
<div class="animate-translate-right-5 animate-rotate-45 animate-duration-2">
  I move and rotate!
</div>

<!-- Hover effects -->
<button class="hover:animate-scale-110 animate-duration-300">Hover me!</button>
```

## 🎯 Enhanced Architecture (v2.0)

Jumi v2.0 introduces a revolutionary architecture inspired by TailwindCSS core plugins, providing unprecedented performance and composability.

### Composable Animations

Unlike traditional CSS animations that conflict with each other, Jumi's new system allows multiple animations to work together seamlessly:

```html
<!-- Multiple transforms compose into a single, smooth animation -->
<div
  class="animate-translate-x-8 animate-rotate-45 animate-scale-110 animate-duration-500"
>
  All transforms work together!
</div>

<!-- Complex property combinations -->
<div
  class="animate-w-64 animate-h-32 animate-bg-gradient-to-r animate-opacity-75 animate-duration-1000"
>
  Width, height, background, and opacity animate simultaneously
</div>

<!-- Filter compositions -->
<div
  class="animate-blur-sm animate-brightness-110 animate-saturate-150 animate-duration-2000"
>
  Multiple filter effects in harmony
</div>
```

### CSS Custom Property System

The new architecture leverages CSS custom properties for optimal performance:

```css
/* Generated CSS for composable transforms */
.animate-translate-x-8 {
  @defaults jumi-transform;
  --jumi-translate-x: 2rem;
  animation-name: jumi-translate-x;
}

.animate-rotate-45 {
  @defaults jumi-transform;
  --jumi-rotate: 45deg;
  animation-name: jumi-rotate;
}

/* Single keyframe that uses all transform variables */
@keyframes jumi-translate-x, jumi-rotate {
  to {
    transform: translateX(var(--jumi-translate-x, 0)) translateY(
        var(--jumi-translate-y, 0)
      )
      rotate(var(--jumi-rotate, 0deg)) scale(
        var(--jumi-scale-x, 1),
        var(--jumi-scale-y, 1)
      );
  }
}
```

### Performance Benefits

1. **Reduced CSS Bundle Size** - Shared keyframes for property combinations
2. **Better Browser Optimization** - CSS custom properties are highly optimized
3. **No Animation Conflicts** - Multiple utilities work together instead of overriding
4. **Smoother Animations** - Browser can optimize custom property changes
5. **Dynamic Control** - Runtime animation customization via JavaScript

### Enhanced Property Animations

```html
<!-- Direct property animations with intelligent defaults -->
<div class="animate-opacity-50">Animates opacity from current value to 0.5</div>
<div class="animate-w-full">Animates width from current to 100%</div>
<div class="animate-bg-red-500">Smoothly transitions background color</div>

<!-- Combine with timing controls -->
<div class="animate-h-64 animate-duration-500 animate-ease-out">
  Fast height change
</div>
<div class="animate-rounded-full animate-duration-2000 animate-ease-bounce">
  Bouncy border radius
</div>
```

### Advanced Utility Patterns

The new system follows TailwindCSS patterns for consistency and power:

```html
<!-- Negative values support -->
<div class="animate-translate-x-[-50px] animate-rotate-[-45deg]">
  Custom negative values
</div>

<!-- Arbitrary value support -->
<div class="animate-w-[250px] animate-duration-[350ms]">
  Precise custom values
</div>

<!-- Type-safe property validation -->
<div class="animate-opacity-[0.75]">Validated opacity value</div>
<div class="animate-scale-[1.25]">Validated scale value</div>
```

## 📚 Core Concepts

### Animation Timing

Control the timing of your animations with precision:

```html
<!-- Duration -->
<div class="animate-fade-in animate-duration-500">Fast fade</div>
<div class="animate-fade-in animate-duration-2">Slow fade</div>

<!-- Delay -->
<div class="animate-bounce-in animation-delay-1">Delayed bounce</div>

<!-- Easing -->
<div class="animate-slide-in-up animate-ease-ease-out-back">Bouncy slide</div>

<!-- Iteration -->
<div class="animate-pulsate animate-count-infinite">Infinite pulsating</div>
<div class="animate-bounce-in animate-repeat-3">Bounce 3 times</div>
```

### Transform Animations

Create dynamic movement with transform utilities:

```html
<!-- Translation -->
<div class="animate-translate-right-5">Move right</div>
<div class="animate-translate-top-left-3">Move to top-left</div>

<!-- Rotation -->
<div class="animate-rotate-90">Rotate 90 degrees</div>
<div class="animate-rotate-360 animate-count-infinite">Spin forever</div>

<!-- Scaling -->
<div class="animate-scale-125">Scale up 25%</div>
<div class="animate-scale-x-150">Scale width only</div>

<!-- Combined transforms -->
<div class="animate-translate-right-5 animate-rotate-45 animate-scale-110">
  Move, rotate, and scale!
</div>
```

### Effect Animations

Beautiful pre-built animation effects:

```html
<!-- Entrance effects -->
<div class="animate-bounce-in">Bounces in</div>
<div class="animate-fade-in">Fades in</div>
<div class="animate-slide-in-up">Slides up</div>
<div class="animate-zoom-in">Zooms in</div>

<!-- Exit effects -->
<div class="animate-bounce-out">Bounces out</div>
<div class="animate-fade-out">Fades out</div>

<!-- Attention seeking -->
<div class="animate-shake animate-count-infinite">Shaking</div>
<div class="animate-pulsate animate-count-infinite">Pulsing</div>
<div class="animate-wobble animate-count-infinite">Wobbling</div>
```

### Property Animations

Animate CSS properties directly:

```html
<!-- Size animations -->
<div class="animate-w-full animate-duration-2">Width grows</div>
<div class="animate-h-64 animate-duration-1">Height changes</div>

<!-- Color animations -->
<div class="animate-bg-red-500 animate-duration-1">Background changes</div>
<div class="animate-color-blue-600 animate-duration-500">
  Text color changes
</div>
<div class="animate-fill-green-500 animate-duration-750">SVG fill changes</div>

<!-- Border animations -->
<div class="animate-rounded-full animate-duration-1">Becomes circular</div>
<div class="animate-border-4 animate-duration-500">Border grows</div>

<!-- Shadow animations -->
<div class="animate-shadow-xl animate-duration-300">Shadow grows</div>
```

## 🎛️ Configuration

Customize Jumi to match your design system:

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require("jumi")({
      // Plugin options
      enableHover: true, // Enable hover variants (default: true)
      enableGroup: true, // Enable group hover variants (default: true)
      enableDark: false, // Enable dark mode variants (default: false)

      // Theme customization
      theme: {
        durations: {
          "ultra-fast": "25ms",
          lightning: "100ms",
          "custom-slow": "5s",
        },
        distances: {
          tiny: "2%",
          huge: "200%",
          "screen-width": "100vw",
        },
        easings: {
          "custom-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        },
        scales: {
          micro: "0.95",
          jumbo: "3",
        },
      },
    }),
  ],
};
```

## 🎯 Advanced Usage

### Arbitrary Values

Use arbitrary values for custom animations:

```html
<!-- Custom duration -->
<div class="animate-fade-in animate-duration-[350ms]">Custom timing</div>

<!-- Custom distance -->
<div class="animate-translate-right-[150px]">Custom distance</div>

<!-- Custom rotation -->
<div class="animate-rotate-[23deg]">Custom angle</div>
```

### Responsive Animations

Combine with TailwindCSS responsive variants:

```html
<div class="animate-bounce-in md:animate-slide-in-left lg:animate-fade-in">
  Different animations at different breakpoints
</div>

<div class="animate-duration-500 md:animate-duration-1 lg:animate-duration-2">
  Different speeds at different breakpoints
</div>
```

### Dark Mode

Enable dark mode animations:

```js
// tailwind.config.js
require("jumi")({
  enableDark: true,
});
```

```html
<div class="animate-fade-in dark-animate:animate-slide-in-up">
  Fades in light mode, slides in dark mode
</div>
```

### CSS Custom Properties

Jumi maintains CSS custom properties for dynamic control:

```css
/* Available CSS variables */
:root {
  --jumi-duration: 1s;
  --jumi-timing-function: ease;
  --jumi-delay: 0s;
  --jumi-translate-x: 0;
  --jumi-translate-y: 0;
  --jumi-rotate-z: 0deg;
  --jumi-scale-x: 1;
  --jumi-scale-y: 1;
  /* ... and many more */
}
```

```html
<!-- Override with inline styles -->
<div
  class="animate-translate-r-5 animate-duration-2"
  style="--jumi-duration: 500ms; --jumi-translate-x: 100px;"
>
  Custom overrides
</div>
```

## 📖 Migration Guide

### From Jumi v1 (Sass) to v2 (TailwindCSS Plugin)

| Old (v1)                  | New (v2)                        | Notes                           |
| ------------------------- | ------------------------------- | ------------------------------- |
| `jumi-duration-2s`        | `animate-duration-2`            | Simplified naming               |
| `jumi-translate-l-5`      | `animate-translate-left-5`      | Added `animate-` prefix         |
| `jumi-bounce-in`          | `animate-bounce-in`             | Added `animate-` prefix         |
| `base:jumi-translate-l-5` | `animate-translate-left-5-base` | Base classes renamed            |
| `hover:jumi-bounce-in`    | `hover:animate-bounce-in`       | Works with TailwindCSS variants |

### Key Changes

1. **Prefix**: All classes now use the `animate-` prefix for consistency with TailwindCSS
2. **Variants**: Hover and responsive variants now use TailwindCSS's variant system
3. **Configuration**: Plugin configuration through `tailwind.config.js` instead of Sass variables
4. **TypeScript**: Full TypeScript support with intellisense
5. **Tree Shaking**: Only used utilities are included in the final CSS

## 🎨 Complete Class Reference

### Animation Timing

| Class                     | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `animate-duration-{time}` | Set animation duration (25ms-10s)                    |
| `animation-delay-{time}`    | Set animation delay (0-5s)                           |
| `animate-ease-{easing}`   | Set timing function (linear, ease-in-out-back, etc.) |
| `animate-repeat-{count}`  | Set iteration count (1-infinite)                     |
| `animate-reverse`         | Reverse animation direction                          |
| `animate-alternate`       | Alternate animation direction                        |
| `animate-fill-forwards`   | Keep final animation state                           |
| `animate-pause`           | Pause animation                                      |

### Transform Animations

| Class Pattern                        | Description            | Example                     |
| ------------------------------------ | ---------------------- | --------------------------- |
| `animate-translate-{dir}-{distance}` | Translate in direction | `animate-translate-right-5` |
| `animate-rotate-{angle}`             | Rotate around z-axis   | `animate-rotate-90`         |
| `animate-scale-{scale}`              | Scale uniformly        | `animate-scale-125`         |
| `animate-perspective-{distance}`     | Set 3D perspective     | `animate-perspective-500`   |
| `animate-origin-{position}`          | Set transform origin   | `animate-origin-top-left`   |

**Transform Directions:**

- `x`, `y`, `z` - Single axis
- `top`, `right`, `bottom`, `left` - Physical directions
- `start`, `end` - Logical directions (i18n-friendly)
- `top-left`, `top-right`, `bottom-left`, `bottom-right` - Diagonal corners

### Effect Animations

| Class                          | Description          |
| ------------------------------ | -------------------- |
| `animate-bounce-in`            | Bouncy entrance      |
| `animate-bounce-out`           | Bouncy exit          |
| `animate-fade-in`              | Fade in              |
| `animate-fade-out`             | Fade out             |
| `animate-slide-in-{direction}` | Slide from direction |
| `animate-zoom-in`              | Zoom in              |
| `animate-zoom-out`             | Zoom out             |
| `animate-flip-x`               | Flip on X axis       |
| `animate-flip-y`               | Flip on Y axis       |
| `animate-shake`                | Shake effect         |
| `animate-pulsate`                | Pulsing effect         |
| `animate-swing`                | Swing effect         |
| `animate-wobble`               | Wobble effect        |

### Property Animations

| Class Pattern              | Description           | Example                  |
| -------------------------- | --------------------- | ------------------------ |
| `animate-w-{size}`         | Animate width         | `animate-w-full`         |
| `animate-h-{size}`         | Animate height        | `animate-h-64`           |
| `animate-bg-{color}`       | Animate background    | `animate-bg-red-500`     |
| `animate-color-{color}`    | Animate text color    | `animate-color-blue-600` |
| `animate-fill-{color}`     | Animate SVG fill      | `animate-fill-green-500` |
| `animate-rounded-{radius}` | Animate border radius | `animate-rounded-full`   |
| `animate-shadow-{shadow}`  | Animate box shadow    | `animate-shadow-xl`      |
| `animate-blur-{blur}`      | Animate blur filter   | `animate-blur-md`        |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [TailwindCSS](https://tailwindcss.com/)
- Inspired by [Animate.css](https://animate.style/)
- CSS custom properties pattern from the original Jumi v1

---

**Made with ❤️ by [Ridwan Olanrewaju](https://github.com/ibnlanre)**
