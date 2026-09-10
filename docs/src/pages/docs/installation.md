---
layout: ../../layouts/Docs.astro
title: From zero to moving.
description: Install the plugin, register it with Tailwind CSS, and make your first entrance.
---

## 01 — Install

Add Jumi to a project with Tailwind CSS already configured. The examples on this site target Tailwind CSS v4.

```sh
pnpm add jumi
```

Using another package manager? `npm install jumi`, `yarn add jumi`, and `bun add jumi` work too.

## 02 — Register the plugin

In your main CSS file:

```css
@import "tailwindcss";
@plugin "jumi";
```

Import this stylesheet into your application. Tailwind needs to scan the files containing your animation classes.

## 03 — Make an entrance

```html
<div class="motion-safe:animations
  animate-fade-in-up
  animation-duration-[600ms]">
  Nice to see you.
</div>
```

`motion-safe:animations` activates the animation only when the visitor has not requested reduced motion. The element stays visible otherwise.

## Using Astro

Use Tailwind's Vite plugin in your Astro configuration:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
});
```

Then import your main stylesheet in an Astro layout. See the [official Astro styling guide](https://docs.astro.build/en/guides/styling/#tailwind) for Tailwind setup.

## Class names must be discoverable

Write complete class names in your source. Tailwind cannot discover a class assembled from fragments such as `animate-${effect}`. Map choices to full class strings, or explicitly register them with Tailwind's `@source inline()` directive.

```css
@source inline("animate-bounce-in animate-fade-in animate-reveal-swipe");
```

## If nothing moves

- Check that the element includes `animations` or `motion-safe:animations`.
- Check that your stylesheet registers Jumi and is imported by your app.
- Use explicit units for arbitrary timing values: `animation-duration-[800ms]`.
- Check whether reduced motion is enabled on your device.
- Remember that a one-shot animation runs when applied. Remount the element or remove and reapply the animation to replay it.
