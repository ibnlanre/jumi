---
layout: ../../layouts/Docs.astro
title: From zero to moving.
description: Install the plugin, wire it into your build, and make your first entrance.
---

## 01 — Install

Add Jumi to a project with Tailwind CSS already configured. The examples on this site target Tailwind CSS v4.

```sh
pnpm add @ibnlanre/jumi
```

Using another package manager? `npm install @ibnlanre/jumi`, `yarn add @ibnlanre/jumi`, and `bun add @ibnlanre/jumi` work too.

## 02 — Wire it into your build

Jumi needs two things: the plugin, which teaches Tailwind the utilities, and an integration, which finishes the stylesheet once every `animate-*` class on the page has been compiled. Replacing Tailwind's Vite plugin with Jumi gives you both at once:

```diff
- import tailwindcss from '@tailwindcss/vite'
+ import jumi from '@ibnlanre/jumi/vite'

  export default defineConfig({
-   plugins: [tailwindcss()],
+   plugins: [jumi()],
  })
```

Your stylesheet does not mention Jumi:

```css
@import "tailwindcss";
```

Import that stylesheet into your application. Tailwind needs to scan the files containing your animation classes.

### Prefer to be explicit?

Register the plugin in CSS and finish the stylesheet with Jumi beside Tailwind's plugin:

```css
@import "tailwindcss";
@plugin "@ibnlanre/jumi";
```

```ts
// vite.config.ts — Tailwind's entry, plus Jumi after it
import tailwindcss from '@tailwindcss/vite'
import { jumiFinalizer } from '@ibnlanre/jumi/vite'

export default defineConfig({ plugins: [tailwindcss(), jumiFinalizer()] })
```

Both forms compile to the same CSS. Registration alone is not enough: `@plugin "@ibnlanre/jumi"` teaches Tailwind the utilities but never finishes the stylesheet, so the animations would compile to nothing. [Why there is a build step](/docs/build-step/) is what the second half does, and why Tailwind's plugin API cannot do it for you.

### Using PostCSS instead?

One entry replaces `@tailwindcss/postcss`:

```js
// postcss.config.js
export default { plugins: { '@ibnlanre/jumi/postcss': {} } }
```

If `@tailwindcss/postcss` is already configured separately and you would rather not replace that
entry, put `jumiFinalizer()` after it instead. Nothing registers Jumi in that shape, so the
stylesheet still names the plugin — the same `@plugin "@ibnlanre/jumi";` as the explicit setup
above:

```js
// postcss.config.js
import tailwindcss from '@tailwindcss/postcss'
import { jumiFinalizer } from '@ibnlanre/jumi/postcss'

export default { plugins: [tailwindcss(), jumiFinalizer()] }
```

### Building with the Tailwind CLI?

The CLI has no hook to finish in, so add one step after Tailwind writes its output:

```js
import { finalizeCss } from '@ibnlanre/jumi'

const { css } = finalizeCss(readFileSync('dist/output.css', 'utf8'))
writeFileSync('dist/output.css', css)
```

## 03 — Make an entrance

```html
<div class="motion-safe:animate-fade-in-up
  animation-duration-[600ms]">
  Nice to see you.
</div>
```

`motion-safe:animations` activates the animation only when the visitor has not requested reduced motion. The element stays visible otherwise.

## Using Astro

Use Jumi's Vite integration in your Astro configuration:

```js
import { defineConfig } from 'astro/config';
import jumi from '@ibnlanre/jumi/vite';

export default defineConfig({
  vite: { plugins: [jumi()] },
});
```

Then import your main stylesheet in an Astro layout. See the [official Astro styling guide](https://docs.astro.build/en/guides/styling/#tailwind) for Tailwind setup.

## Class names must be discoverable

Write complete class names in your source. Tailwind cannot discover a class assembled from fragments such as `animate-${effect}`. Map choices to full class strings, or explicitly register them with Tailwind's `@source inline()` directive.

```css
@source inline("animate-bounce-in animate-fade-in animate-reveal-swipe");
```

## If nothing moves

- Check that the element carries the motion utility, and that the variant is on that utility —
  `motion-safe:animate-*` — rather than on an ancestor.
- Check that your build includes the integration, not only the plugin. `@plugin "@ibnlanre/jumi"` on its own leaves the stylesheet unfinished, and the animations then compile to nothing, without an error.
- Check that your stylesheet is imported by your app.
- Use explicit units for arbitrary timing values: `animation-duration-[800ms]`.
- Check whether reduced motion is enabled on your device.
- Remember that a one-shot animation runs when applied. Remount the element or remove and reapply the animation to replay it.
