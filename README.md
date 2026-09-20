# Jumi

### Big motion. Small classes.

Give your interface life with a composable animation library for Tailwind CSS.
Choose from **228 effects**, animate property targets, give each its own rhythm,
and stagger motion across children—all from your markup.

**[Start here](https://jumi-css.vercel.app/docs/installation/)** ·
**[Learn to compose](https://jumi-css.vercel.app/docs/properties/)** ·
**[Explore the effects](https://jumi-css.vercel.app/effects/)** ·
**[Run the docs site](#the-documentation-site)**

```html
<div class="motion-safe:animate-bounce-in animation-duration-800">
  Make your move.
</div>
```

Jumi generates CSS through Tailwind at build time. There is no Jumi animation
runtime to ship to the browser.

## Start moving

Install Jumi in a project with Tailwind CSS configured:

```sh
pnpm add @ibnlanre/jumi
```

Register it by replacing `@tailwindcss/vite` with Jumi in your Vite config:

```diff
- import tailwindcss from '@tailwindcss/vite'
+ import jumi from '@ibnlanre/jumi/vite'

  export default defineConfig({
-   plugins: [tailwindcss()],
+   plugins: [jumi()],
  })
```

and that is the whole setup. Your stylesheet does not mention Jumi:

```css
@import 'tailwindcss';
```

`jumi()` owns Jumi's lifecycle inside the build: it registers Jumi with Tailwind, lets Tailwind
compile what you wrote, and then completes the stylesheet — because the composition lists cannot be
known until every `animate-*` class on the page has been compiled.

Prefer to be explicit? Both work, and they compile to the same CSS:

```css
@import 'tailwindcss';
@plugin "@ibnlanre/jumi";
```

```ts
// vite.config.ts — Tailwind's entry, plus Jumi after it
import tailwindcss from '@tailwindcss/vite'
import { jumiFinalizer } from '@ibnlanre/jumi/vite'

export default defineConfig({ plugins: [tailwindcss(), jumiFinalizer()] })
```

PostCSS instead? Same shape — one entry replaces `@tailwindcss/postcss`:

```js
// postcss.config.js
export default { plugins: { '@ibnlanre/jumi/postcss': {} } }
```

With `@tailwindcss/postcss` already configured separately, `jumiFinalizer()` from
`@ibnlanre/jumi/postcss` goes after it instead — and the stylesheet names
`@plugin "@ibnlanre/jumi";`, because nothing registers Jumi in that shape.

Building with the Tailwind CLI, or from a script? The CLI has no hook to finish in, so that one
still needs a final step:

```js
import { finalizeCss } from '@ibnlanre/jumi'

const { css } = finalizeCss(readFileSync('dist/output.css', 'utf8'))
writeFileSync('dist/output.css', css)
```

Choose an effect, then its timing:

```html
<div class="animate-reveal-swipe animation-duration-900">
  A little class. A lot of character.
</div>
```

Use `motion-safe:animate-reveal-swipe` for decorative motion that respects the
visitor's reduced-motion preference. Keep the element visible in its unanimated
state.

## Motion, atom by atom

Effects are a starting point. Property utilities let you author your own motion:

```html
<div
  class="animate-rotate-45 animate-scale-110 animation-duration-800/rotate animation-duration-1200/scale animation-direction-alternate animation-iteration-count-infinite"
>
  Two rhythms. One element.
</div>
```

Here, rotation takes 800ms and scale takes 1200ms. The `/rotate` and `/scale`
modifiers scope a control to that property's animation slot.

| Piece       | Example                             | What it does                       |
| ----------- | ----------------------------------- | ---------------------------------- |
| Effects     | `animate-bounce-in`                 | Apply a named keyframe effect      |
| Properties  | `animate-rotate-[0.25turn]`         | Animate a property toward a target |
| Controls    | `animation-duration-[800ms]/rotate` | Give a property its own timing     |
| Stagger     | `animate-stagger-forward-[100ms]/3` | Sequence direct children           |
| Transitions | `transition-property/scale`         | Animate a change of state          |

Theme values and arbitrary values work together. Compound properties such as
filters and transforms are assembled from custom properties; their parts share
the timing of the compound property's slot.

## Start a chain reaction

```html
<div class="animate-stagger-forward-120/3 *:animate-fade-in-up">
  <div>One</div>
  <div>Two</div>
  <div>Three</div>
</div>
```

The parent sets the rhythm; each direct child owns its motion. The `/3` count
provides an `:nth-child` fallback for browsers without CSS sibling functions.
Omit the count when targeting browsers that support `sibling-index()` and
`sibling-count()`.

## Make state changes feel considered

```html
<button
  class="transition-property/scale transition-duration-300 hover:scale-110 focus-visible:scale-110"
>
  Take a closer look.
</button>
```

Scope transition duration, delay, and easing with the same `/property` syntax.

## Know the boundaries

- Write complete class names so Tailwind can discover them at build time.
- CSS determines whether a property interpolates, changes discretely, or cannot animate.
- Effects that write the same property can compete. Nest elements for independent layers of motion.
- Advanced timeline and composition controls require browser support. Keep essential behavior independent of them.
- Respect reduced motion and offer a pause control for persistent decorative loops.

## The documentation site

The Astro site in `docs/` is a working showcase: a kinetic landing page, seven
guides, and a searchable catalog with previews of all 228 effects. Its animation
examples use Jumi itself.

```sh
pnpm install
pnpm run docs:dev
```

To generate the static site, run `pnpm run docs:build` and preview it with
`pnpm run docs:preview`.

## Development

```sh
pnpm run test:run
pnpm run check-types
pnpm run bundle
```

Created by [Ridwan Olanrewaju](https://github.com/ibnlanre).

## License and support

MIT. Commercial use needs no permission and no payment, and only the copyright notice has to travel with the
code — that is deliberate, because a CSS library is more useful when nobody has to ask.

If it earns a place in something you ship, [sponsoring the work](https://github.com/sponsors/ibnlanre) is what
keeps it maintained. That is a request rather than a condition: the licence is unchanged for anyone who does not,
and no attribution beyond the notice is expected either way.
