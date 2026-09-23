---
name: jumi
description: Write motion with Jumi, a Tailwind CSS v4 plugin. Use when adding animation, property tweens, phrases, staggering, scroll-driven motion, transitions or view transitions to markup, or when wiring Jumi into a Vite, PostCSS, Astro or CLI build.
---

# Jumi

Jumi is a motion vocabulary for Tailwind CSS v4. You write classes, Tailwind compiles them, and a build
step finishes the stylesheet. Nothing of Jumi's ships to the browser: the output is ordinary
`animation-*` and `transition-*` declarations, so the browser's own CSS engine runs the motion.

There are 235 named effects, 395 property targets, timing controls for every one of them, a way to write
a keyframe inside a class name, a stagger, scroll-driven timelines, and transitions for both state changes
and page changes. This skill is the whole vocabulary and the rules that hold it together.

Reading it in order is the fastest route. Sections 1 to 4 are the minimum to write working markup;
sections 5 to 12 are one feature each; 13 to 15 are the rules and the failure modes; the appendices list
every class name the library can compile.

---

## 1. Set it up

Install Jumi in a project that already has Tailwind CSS configured:

```sh
pnpm add @ibnlanre/jumi
```

`npm install @ibnlanre/jumi`, `yarn add @ibnlanre/jumi` and `bun add @ibnlanre/jumi` work the same way.

Jumi has two halves, and both are needed:

| Half        | What it is                                                       | What it does                                                                 |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| The plugin  | `@plugin "@ibnlanre/jumi"`                                       | Teaches Tailwind the utilities, so `animate-fade-in` compiles to real CSS    |
| Integration | `jumi()` from `@ibnlanre/jumi/vite`, or `@ibnlanre/jumi/postcss` | Assembles the animation lists once every `animate-*` class has been compiled |

Wire up only the plugin and the utilities compile while the page stays still, with no error. The lists
cannot be written while any single utility is being compiled, because they depend on which other classes
are present. So the integration is the half that makes motion happen.

### Vite, the short route (recommended)

Replace Tailwind's plugin with Jumi's. One entry does both jobs:

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
@import 'tailwindcss';
```

Then import that stylesheet from your application's entry point. Tailwind has to scan the files holding
your classes, so keep them in files it can see.

### Vite, the explicit route

Register the plugin in CSS, and finish the stylesheet with Jumi beside Tailwind's plugin. Both routes
compile to the same CSS:

```css
@import 'tailwindcss';
@plugin "@ibnlanre/jumi";
```

```ts
// vite.config.ts: Tailwind's entry, plus Jumi after it
import tailwindcss from '@tailwindcss/vite'
import { jumiFinalizer } from '@ibnlanre/jumi/vite'

export default defineConfig({ plugins: [tailwindcss(), jumiFinalizer()] })
```

### PostCSS

One entry replaces `@tailwindcss/postcss`:

```js
// postcss.config.js
export default { plugins: { '@ibnlanre/jumi/postcss': {} } }
```

If `@tailwindcss/postcss` is configured separately and you would rather not replace it, put
`jumiFinalizer()` from `@ibnlanre/jumi/postcss` after it and keep `@plugin "@ibnlanre/jumi";` in the
stylesheet, since nothing registers Jumi in that shape.

### Tailwind CLI or a plain script

The CLI has no hook to finish in, so run one step after Tailwind writes its output:

```js
import { finalizeCss } from '@ibnlanre/jumi'

const { css } = finalizeCss(readFileSync('dist/output.css', 'utf8'))
writeFileSync('dist/output.css', css)
```

### Astro

```js
import { defineConfig } from 'astro/config'
import jumi from '@ibnlanre/jumi/vite'

export default defineConfig({
  vite: { plugins: [jumi()] },
})
```

Then import your stylesheet from an Astro layout.

### Two setup rules that cause most "it does not work" reports

1. **Write complete class names.** Tailwind finds classes by scanning text, so a class built from
   fragments such as `` `animate-${effect}` `` is never seen. Map choices to full class strings, or
   register them explicitly:

   ```css
   @source inline("animate-bounce-in animate-fade-in animate-reveal-swipe");
   ```

2. **Check the integration, not just the plugin.** If a motion compiles into the stylesheet but nothing
   moves, the finalizer did not run. Section 15 is the checklist.

---

## 2. The model: five kinds of motion

Every Jumi class is one of five things. Knowing which kind you are writing is most of the expertise,
because they compose differently.

| Kind                | Example                        | What it means                                                |
| ------------------- | ------------------------------ | ------------------------------------------------------------ |
| **Effect**          | `animate-bounce-in`            | A named keyframe timeline, ready to run                      |
| **Property target** | `animate-rotate-45`            | Animate one CSS property toward a value                      |
| **Phrase**          | `animate-opacity-[0:0\|100:1]` | Write the frames of one property in the class name           |
| **Control**         | `animation-duration-800`       | Configure timing, repetition, direction, playback, timelines |
| **Transition**      | `transition-property/scale`    | Motion between two states of the element                     |

Two laws govern the whole system:

- **A control never creates motion.** It configures a motion that exists, or it does nothing at all.
  `animation-duration-500` on an element with no animation writes a variable and animates nothing. The
  same is true of `animation-duration-500/reveal` when nothing is named `reveal`.
- **Motion comes from a declaration, not from a wrapper.** There is no setup class, no provider, no
  `motion` attribute. An element animates because it carries an effect, a property target, a phrase, or a
  transition property.

Composition is automatic. One element can carry as many motion utilities as you like, and each declares
its own value; the build gathers them into the animation lists the browser needs.

```html
<div
  class="animate-rotate-45 animate-scale-110
         animation-duration-800/rotate animation-duration-1200/scale
         animation-direction-alternate animation-iteration-count-infinite"
>
  Two rhythms. One element.
</div>
```

---

## 3. Effects

An effect is a complete, named keyframe animation. Put it on the element and it runs once, in one second,
easing in and out of rest, holding its final value.

```html
<div class="animate-bounce-in animation-duration-800">Make your move.</div>
```

Measured defaults for every element Jumi animates:

| Setting     | Default                                         |
| ----------- | ----------------------------------------------- |
| Duration    | `1s`                                            |
| Easing      | `ease`                                          |
| Delay       | `0s`, or the stagger's distribution (section 8) |
| Iterations  | `1`                                             |
| Direction   | `normal`                                        |
| Fill mode   | `forwards` (the final frame is held)            |
| Play state  | `running`                                       |
| Composition | `replace`                                       |

Use `motion-safe:` for decorative entrances so the visitor's preference is respected:

```html
<div class="motion-safe:animate-fade-in-up animation-duration-[600ms]">
  Nice to see you.
</div>
```

### Choosing effects

- **Entrances** are named `-in`: `fade-in`, `bounce-in-up`, `slide-in-left`, `zoom-in-elastic`,
  `blinds-in-y`, `unmask-top-left`, `diamond-in`, `triangle-in-bottom-right`.
- **Exits** are named `-out`: `fade-out`, `slide-out-up`, `zoom-out-elastic`, `hinge-drop`,
  `radial-wipe-out`, `mask-center`.
- **Attention** effects repeat naturally: `pulsing`, `spinning`, `floating`, `wiggle`, `shimmer`,
  `wobbling`. Pair them with `animation-iteration-count-infinite`.
- **Emphasis** effects are one-shot highlights: `bounce`, `flash`-like `flicker`, `pop`-like `jello`,
  `tada`, `heart-beat`, `shake`, `swing`.
- **Presentation** effects own `clip-path` and reveal one stationary element: `reveal-*`, `wipe-*`-style
  `radial-wipe-*`, `blinds-*`, `mask-*`, `unmask-*`, `circle-*`, `square-*`, `diamond-*`, `triangle-*`,
  `iris`-style `radial-*`.

Effect names are hyphenated and directional: `-in`, `-out`, `-in-up`, `-out-left`, `-in-top-right`.
`-bottom`/`-top`/`-left`/`-right` and `-up`/`-down` are used as the family's geometry requires, so read
the name or check the catalog rather than assuming a pair exists in every direction.

### Effects compete for properties

An effect writes one or more CSS properties. Two effects writing the same property replace each other,
because `animation-composition` defaults to `replace`. Nest elements when you want independent layers:

```html
<div class="animate-fade-in">
  <div
    class="animate-spinning animation-duration-[8s] animation-timing-function-linear animation-iteration-count-infinite"
  >
    *
  </div>
</div>
```

The same warning applies to a clip reveal beside another clip animation, and to anything writing
`transform` or `opacity` beside `hinge-drop`. A named motion gives you timing control, not conflict
resolution.

---

## 4. Property targets

Where an effect is a whole timeline, a property target animates one CSS property toward a value:

```html
<div
  class="animate-rotate-[0.25turn] animate-scale-110 animation-duration-[3s]"
>
  Toward a value.
</div>
```

Names follow the CSS specification: `animate-{property}-{value}`. If you know the CSS property, you know the
class. `animate-background-color-red-600`, `animate-border-radius-[40px]`, `animate-box-shadow-blur-[8px]`,
`animate-filter-blur-[8px]`, `animate-stroke-width-4`, `animate-z-index-10`, `animate-grid-column-start-2`,
`animate-hyphenate-limit-chars-minimum-word-length-4`.

### Where values come from

1. **Tailwind's theme scales**: `animate-background-color-blue-500` compiles to
   `var(--color-blue-500)`, and spacing, opacity and font scales work the same way.
2. **Bare numbers**, converted to the unit the property needs:
   - `animate-rotate-45` is `45deg`
   - `animate-opacity-50` is `0.5`
   - `animate-scale-110` is `1.1`
3. **Arbitrary values in brackets**, which are the escape hatch for anything else:
   `animate-width-[240px]`, `animate-rotate-[0.25turn]`, `animate-filter-blur-[8px]`,
   `animate-offset-distance-100`, `animate-width-[calc-size(auto,size+2rem)]`.

When a bare number's meaning is ambiguous for the property, write the arbitrary form with an explicit
unit. `animation-duration-800` is 800 milliseconds, and so is `animation-duration-[800ms]`; `[0.8s]` is
equivalent too.

### Each property keeps a resting value

Every animatable property has an underlying value that the animation travels from. Measured, Jumi sets
`--jumi-opacity: 1`, `--jumi-width: auto`, `--jumi-background-color: transparent`,
`--jumi-filter-blur: blur(0)`, `--jumi-translate-x: 0px`, `--jumi-scale: 1 1 1`. A property target
writes a `to` frame, so the motion starts from the element's own styles. Set a deliberate starting value
in your own CSS when the resting value is not what you want to interpolate from.

### Compound properties share one slot

Compound CSS values are assembled from parts, and the parts share the compound property's timing. Blur and
brightness both feed the filter, so their rhythm is `filter`:

```html
<div
  class="animate-filter-blur-[4px] animate-filter-brightness-[1.2] animation-duration-[900ms]/filter"
>
  A softer glow.
</div>
```

The same is true of transform parts (`/transform` covers `animate-translate-x-*`, `animate-rotate-*`,
`animate-scale-*` and the rest), box-shadow parts, text-shadow parts, border-radius corners,
background-position axes and mask-border parts. Address the compound, not the part.

### Keyword sizes belong to the platform

`auto`, `min-content`, `max-content` and `fit-content` interpolate only with `interpolate-size:
allow-keywords`. Jumi does not set it, because the declaration is inherited and setting it on an element
opts in everything beneath it:

```html
<div class="interpolate-size-allow-keywords animate-width-auto w-[200px]">
  Keyword target.
</div>
```

Without it the target still applies, but as a discrete change: the property holds its starting value and
flips at the midpoint. `interpolate-size-numeric-only` stops a subtree inheriting the switch. A value
carrying its own intrinsic size needs no switch at all:
`animate-width-[calc-size(auto,size+2rem)]`.

### Motion paths

A path is declared once and the distance along it is animated:

```html
<div
  class="[offset-path:path('M0,0_L200,0_L200,200')] [offset-rotate:auto]
         animate-offset-distance-100 animation-duration-2000"
></div>
```

`offset-path`, `offset-rotate`, `offset-anchor` and `offset-position` are written once as ordinary
utilities with arbitrary values. `offset-distance` is the animated property, and because it is an ordinary
animation, everything else composes with it, including scroll timelines. Animating `offset-path` itself
from `none` is a discrete step rather than an ease onto the path, so declare the path.

### SVG strokes

Dash patterns and offsets are ordinary property animations:

```html
<svg viewBox="0 0 240 80">
  <path
    d="M 10 40 H 230"
    fill="none"
    stroke="currentColor"
    stroke-width="4"
    stroke-dasharray="8 4"
    class="animate-stroke-dashoffset-[0:12|40:4|100:0]/trace
           animation-duration-[2s]/trace animation-timing-function-linear/trace"
  />
</svg>
```

`animate-stroke-dasharray-*` takes `none`, numbers, lengths, percentages and dash lists (use underscores
for spaces, or commas). `animate-stroke-dashoffset-*` takes numbers, lengths and percentages, including
negatives. Percentages resolve against the SVG viewport, not the path length, so a stroke-drawing recipe
needs an explicit `pathLength` and dash convention on the asset. Jumi exposes the properties; it does not
ship a `draw` preset.

### CSS still decides what can interpolate

A utility cannot make a non-animatable property interpolate. Some properties change discretely, and some,
such as `width`, trigger layout work on every frame. Prefer `transform` and `opacity` for frequent
decorative motion, and test the expensive properties on your target devices.

---

## 5. Phrases: a keyframe written in a class name

A phrase declares the frames of one property inside the utility:

```html
<div
  class="animate-scale-[0:0.5|50:1.1|100:1] animate-opacity-[0:0|50:1|100:1]
         animation-duration-2600 animation-iteration-count-infinite"
>
  Gather, overshoot, settle.
</div>
```

No `@keyframes` block, no stylesheet edit, no runtime. The class compiles to a keyframe rule of its own.

### The grammar

```text
phrase      := frame ("|" frame)*
frame       := offset-list ":" value
offset-list := <offset> ("," <offset>)*
offset      := 0 to 100, integer or decimal, the % is implied and never written
value       := any CSS value
```

- **Frames are separated by a pipe.** `0:0|100:1` is two frames.
- **One value may carry several offsets.** `0,100:45deg|50:0deg` is two frames, not three, and it declares
  the same motion as `0:45deg|50:0deg|100:45deg`.
- **A frame may omit its offset**, and then it takes the property's resting value. That is why a phrase
  holds still until its first frame and closes itself at the end, and why it is safe to run `infinite`:
  the loop has no seam.
- **A property taking several values takes all of them at each frame**, with `_` standing in for the
  space. `animate-scale-[0:0.42_0.30|50:1.03_1.03]` scales both axes together.
- **A bare value is the degenerate phrase.** `animate-rotate-45` means `45deg` at the end.

### Why the separator is a pipe

A comma is a legitimate CSS value character, as in `translate(1px, 2px)`, so it cannot separate frames.
Measured: `animate-opacity-[0:0|100:1]` builds a two-stop keyframe, while `animate-opacity-[0:0,100:1]`
builds **one** stop and warns about nothing, because it is a legal single frame whose value happens to
contain a comma. Semicolons are refused outright by the host, and `%` and `!` are legal CSS values too.
Write pipes, and read a phrase that animates nothing as a separator mistake first.

### Identity and reuse

A phrase is hashed from its canonical frames: frames are sorted by offset, duplicated offsets are
last-wins, and the result is trimmed. So `0:a|50:b` and `50:b|0:a` are one keyframe, and two elements
sharing a phrase share one rule. A different phrase gets a rule of its own. Measured, the same phrase
twice on a page emits one keyframe and two different phrases emit two.

Nothing else can change what your phrase does, which is also why you write **one phrase per property per
element** rather than layering several.

### Naming a phrase as a slot

Append `/name` where you declare it, and address it with the same word in the controls:

```html
<div
  class="animate-clip-path-[0:inset(0_100%_0_0)|100:inset(0_0%_0_0)]/reveal
         animation-duration-[900ms]/reveal
         animation-timing-function-ease-out/reveal"
>
  Frames and controls, one slot.
</div>
```

A name is one word, so it is usually written bare. Brackets are for a name that needs them, and a name
cannot contain whitespace: an underscore inside brackets becomes a space in the custom property name, so
it is reported and dropped rather than written.

A phrase is a value, so it can live in your Tailwind theme and be referenced by name:

```js
theme: {
  rotate: {
    unfurl: '0:16deg,58:0deg'
  }
}
```

and then used as `animate-rotate-unfurl`, which keeps the frames in one place when several elements share
them.

### What is refused

An offset outside 0 to 100 is reported and dropped: the motion emits nothing and the build warns with the
class and the offset it refused, rather than handing the browser a frame it will discard. Measured, the
warning names both, for example `a phrase's offsets are percentages in 0-100, and this one writes 150`.
An ordinary arbitrary value is validated differently: `animate-offset-distance-[50%]` is accepted while
`animate-offset-distance-[abc]` produces no rule at all, because the host checks a plain value against the
property's CSS type while a phrase is checked against Jumi's own grammar.

---

## 6. Controls

Controls configure a motion. They never create one.

| Control         | Syntax                                               | Accepted values                                           |
| --------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| Duration        | `animation-duration-800`, `[1.2s]`                   | Bare number is milliseconds; arbitrary values take a unit |
| Delay           | `animation-delay-150`, `[150ms]`                     | Same                                                      |
| Easing          | `animation-timing-function-ease-out-quint`           | 37 named curves, or `[cubic-bezier(.4,0,.6,1)]`           |
| Iterations      | `animation-iteration-count-3`, `-infinite`           | 1 to 10 by name, `infinite`, or an arbitrary number       |
| Direction       | `animation-direction-alternate`                      | `normal`, `reverse`, `alternate`, `alternate-reverse`     |
| Fill mode       | `animation-fill-mode-both`                           | `none`, `forwards`, `backwards`, `both`                   |
| Play state      | `animation-play-state-paused`                        | `running`, `paused`                                       |
| Composition     | `animation-composition-add`                          | `replace`, `add`, `accumulate`                            |
| Name            | `animation-name-[none]`                              | `none`, used to switch off what an element was given      |
| Timeline, range | `animation-timeline-scroll`, `animation-range-entry` | Section 10                                                |
| Transitions     | `transition-duration-300`                            | Section 9                                                 |

A control written on its own is configuration waiting for a motion:

```html
<div
  class="animate-rotate-90 animation-duration-1400 animation-timing-function-ease-in-out
         animation-direction-alternate animation-iteration-count-infinite"
>
  Back and forth.
</div>
```

Easing names cover the common curves and their families: `linear`, `ease`, `ease-in`, `ease-out`,
`ease-in-out`, `step-start`, `step-end`, plus `-quad`, `-cubic`, `-quart`, `-quint`, `-sine`, `-circ`,
`-expo`, `-back` in the `in`, `out` and `in-out` forms, and `ease-entrance`, `ease-exit`,
`ease-exit-sharp`, `ease-smooth`, `ease-bounce-out`, `ease-elastic`. Appendix C lists all of them.
Use `linear` for steady rotation, and a `-back` or `-elastic` curve when you want overshoot.

### Altering rather than replacing

`animation-composition` decides how two animations of one property combine. The default `replace` gives
the last entry the win; `add` lets both apply at once:

```html
<div
  class="animate-rotate-[0:0deg|12:-8deg|100:-8deg]/flick
         animate-rotate-[0:0deg|12:0deg|100:8deg]/return
         animation-composition-add/rotate
         animation-timing-function-ease-in-out-circ/flick
         animation-timing-function-linear/return
         animation-iteration-count-infinite"
>
  A flick that lands, then a plain return.
</div>
```

That is the pattern for one property needing two different rhythms, since a single easing applies to every
segment of one animation.

---

## 7. Addressing one motion

A control may be scoped to a single animation with a slash. What you write after the slash is either a
**property** Jumi animates (`/rotate`, `/scale`, `/filter`) or a **name** you chose (`/reveal`,
`/flick`).

```html
<div
  class="animate-rotate-45 animate-scale-110
         animation-duration-500 animation-duration-1200/rotate"
>
  Scale at 500ms. Rotate at 1200ms.
</div>
```

An unscoped control is the fallback every animation reads when it has nothing narrower. The resolution
order is **name, then property or effect, then global**. Measured on `animate-fade-in/reveal`, the emitted
chain is
`var(--jumi-label-reveal-animation-duration, var(--jumi-fade-in-animation-duration, var(--jumi-animation-duration)))`.

Rules worth knowing before you name anything:

- **A word that is a property belongs to that property.** `animation-duration-500/scale` reaches every
  motion animating `scale`, in every stylesheet, whether or not this element animates it. Give a motion
  its own word, and make it a word that is not a property. A collision is reported, not dropped:
  measured, naming a rotate motion `scale` warns that the name is also a property and to reword it.
- **A control for a name that is not present does nothing**, exactly like an unscoped control. That is
  why a named control beside a conditional motion is unremarkable.
- **Two motions on one element may share a name**, and then a control written for that name reaches both.
  That is how several properties are tuned as one thing.
- **Names do not travel into descendants.** A wrapper and the element inside it can use the same word
  without knowing about each other.
- **A property scope does cross a wrapper boundary**, because nothing declares that property's variable
  on the element. Measured, a `/{property}` control on a wrapper reaches an unlabelled animation inside
  it.
- **A global control does not cross it.** Every animating element declares the global defaults itself,
  and a declaration beats inheritance. Measured, a wrapper's `--jumi-animation-duration: 5s` leaves a
  child at `1s`.

Because a name is written into the rule, you can retime that animation from your own CSS without touching
the markup:

```css
.petal {
  --jumi-label-flick-animation-duration: 900ms;
}
```

---

## 8. Stagger

The stagger distributes a delay across the direct children of the element it is written on. Put the
stagger on the parent and the children's motion on the parent too, with Tailwind's `*:` variant:

```html
<div class="animate-stagger-forward-[120ms]/3 *:animate-bounce-in">
  <div>One</div>
  <div>Two</div>
  <div>Three</div>
</div>
```

Delays are 0ms, 120ms and 240ms. `animate-stagger-backward-[150ms]/3` runs the same distribution
backwards. The interval is the value; the number after the slash is the child count.

- **The count-free form adapts to any list.** `animate-stagger-forward-[100ms]` emits one rule using
  `sibling-index()` and `sibling-count()`, which Chrome, Edge and Safari support.
- **The `/{count}` form generates an `:nth-child` fallback** for browsers without those functions. Engines
  that have them still take the adaptive rule, so the count is a compatibility hint rather than a hard
  limit. Keep it aligned with the number of children you mean to stagger.
- **The relationship must be direct.** The delay variable is written to direct children, so adding
  wrappers between the parent and the animated elements stops the distribution. Move the parent closer.
- **An explicit delay on the child wins.** `animation-delay-*` written on a child overrides the stagger's
  fallback for that child.

The stagger is delay-based, which matters for scroll-driven motion: a staggered group is staggered along
the scroll, with each child's motion compressed into its own share of the range.

---

## 9. Transitions between states

A transition animates a change of state rather than animating on arrival. `transition-property/…` is what
activates one:

```html
<button
  class="transition-property/scale transition-duration-300
         hover:scale-110 focus-visible:scale-110"
>
  Take a closer look.
</button>
```

`transition-duration`, `transition-delay` and `transition-timing-function` configure it, and all three
take the same `/{property}` scope:

```html
<button
  class="transition-property/background-color transition-property/scale
         transition-duration-[200ms]/background-color transition-delay-[80ms]/background-color
         transition-timing-function-ease-out/scale
         bg-lime-300 hover:bg-lime-200 hover:scale-110"
>
  A delayed colour and a lifted card.
</button>
```

`transition-property/all` is available when you intentionally want everything transitionable. Explicit
property names make it easier to see which changes should move. Tailwind v4's `scale-*` utility writes the
individual `scale` property, so scope that transition with `/scale`.

A property the browser cannot interpolate, `display` being the usual one, does not transition unless you
say it may:

```html
<div
  class="transition-property/display transition-duration-300 transition-behavior-allow-discrete"
>
  Appear and disappear.
</div>
```

With that, the flip is placed so content stays on screen: at the start on the way in, at the end on the way
out. What it cannot supply is the before-style a first render has nothing to travel from. `@starting-style`
is plain CSS and belongs in your own stylesheet, next to the markup it describes.

---

## 10. Motion driven by scroll

Three declarations answer three different questions:

```text
animation           what motion happens
animation-timeline  what drives its progress
animation-range     where on that driver the motion runs
```

A motion is not written differently when a scroll drives it. The same `animate-fade-in` is scrubbed by
scroll position the moment a timeline names the driver:

```html
<article class="animate-fade-in animation-timeline-view"></article>
```

- `animation-timeline-scroll` follows the nearest scroller.
- `animation-timeline-view` tracks the element through its scrollport.
- `animation-timeline-[--feed]` consumes a timeline your own CSS declares.
- `animation-timeline-scroller-nearest|root|self` picks which scroller a `scroll()` timeline takes.
- `animation-timeline-axis-block|inline|x|y` picks the axis.
- `animation-timeline-inset-start-[10%]` and `animation-timeline-inset-end-[25%]` place where tracking
  begins and ends inside the scrollport for a `view` timeline.

Every one of those is a control: it configures a timeline, it does not give one, so it does nothing on an
element that names no driver.

### Declaring a named timeline

The declaration side is plain CSS on the scroller, and Jumi does not wrap it:

```css
#feed {
  scroll-timeline-name: --feed;
  scroll-timeline-axis: block;
}
```

```html
<div
  class="h-64 overflow-y-auto"
  id="feed"
>
  <article class="animation-timeline-[--feed] animate-opacity-100">
    Tracked entry.
  </article>
</div>
```

Two details are easy to get subtly wrong. `--feed` in `scroll-timeline-name` is a timeline name, not a
custom property, so `var()` does not apply and the bracketed spelling is how it reaches the control;
`(--feed)` means `var(--feed)`, which is a different thing entirely. And a named timeline is visible to
the **descendants** of the element that declares it and to nothing else, not to siblings and not to the
document, so declare it on an element the animated content lives inside.

### Placing the motion

```html
<div class="animate-fade-in animation-range-entry"></div>
```

`animation-range-entry`, `-cover`, `-contain` and `-exit` name a whole range, and `-start-entry`,
`-end-exit`, `-start-offset-25` and `-end-offset-75` place a half. Anything with both a name and an offset
in it is the arbitrary form, and it is the one to reach for whenever an offset is involved, since the
value is written as it stands:

```html
<div class="animate-fade-in animation-range-[entry_0%_cover_50%]"></div>
```

The same vocabulary works as a prefix on a single motion, so one animation can be ranged while its
neighbour fills the whole range:

```html
<div
  class="animate-fade-in animate-rotate-45 animation-timeline-scroll
         animation-range-[25%_75%]:animate-fade-in"
></div>
```

A range Jumi cannot write is reported and dropped, and the motion it qualified still runs on the default
range. That matters most for a range that looks legal and is not: `normal` joined to an offset is dropped
by the engine without a word, so the warning is the only signal that the range you wrote is not the range
you got.

### Fallback

If the browser has no scroll-driven timelines, the animation falls back to the document timeline and runs
as a normal time-based animation. The motion and its final state are kept, so a view-driven entrance plays
on load instead of tracking entry. When you want scroll-driven or nothing, put both halves behind one
capability query:

```html
<div
  class="supports-[animation-timeline:scroll()]:animate-fade-in
         supports-[animation-timeline:scroll()]:animation-timeline-scroll"
></div>
```

Inside the query the pair applies together and the motion is scrubbed; outside it neither applies, so the
element keeps its base state and no motion runs.

On a scroll-driven animation the time controls are reinterpreted rather than ignored: 100% of the timeline
is the animation's own end, so `animation-delay` becomes a share of the scroll, and
`animation-iteration-count` divides the range. Reach for `animation-range` when you want to place a motion
deliberately, and reach for `animation-play-state-paused` when you want to stop one.

Note that a `while`-style timeline the page declares in `@keyframes`-adjacent CSS is not Jumi's business:
`animation-timeline-[--feed]` is how you consume one, and `scroll-timeline-name` is how you declare it.

---

## 11. View transitions

A view transition animates the browser's snapshot of an element rather than the element, so Jumi writes
the motion onto the generated pseudo-elements for you. Name the visual with the class:

```html
<div
  class="view-transition-old/hero:animate-fade-out view-transition-new/hero:animate-fade-in"
>
  hero
</div>
```

Measured, that emits `view-transition-name: hero` on the element and the motion on
`::view-transition-old(hero)`. The name after the slash is yours (`hero`, `my-card-2`, whatever the thing
is), and anything Jumi can animate works after the colon: an effect, a phrase, an arbitrary value.

```html
<div
  class="view-transition-old/card:animate-scale-90 view-transition-new/card:animate-scale-110"
></div>
```

Either side on its own is fine. With only the incoming side, the outgoing side keeps the browser's own
cross-fade, which is usually what you want when the old state simply disappears.

The name is a **claim on the document**, not a label. The browser addresses a snapshot only by name, so a
candidate attaches its motion to whatever carries that name, including an element it has never seen.
Keep candidate names distinct from any `view-transition-name` you write yourself. Two elements sharing one
name is the same mistake in another form, and it fails differently: the browser refuses that transition
outright and reports a duplicate name rather than animating the wrong thing.

- Each side takes its own controls: `view-transition-old/hero:animation-duration-300`,
  `view-transition-new/hero:animation-duration-500`. As everywhere else, a control without a motion on
  that side does nothing.
- Conditional variants work and apply to the side they are written on.
- `motion-safe:` is honoured. `motion-reduce:` is reported rather than accepted, because Jumi has already
  decided that its view transition motion does not run under reduced motion and the browser's cross-fade
  is what remains.
- A name the browser will not accept, including the reserved words `none` and `auto`, is reported.
- A variant that depends on the element's own state, such as `hover:`, is reported: there is no element on
  the other side for `:hover` to be about.

For a navigation between documents, the page opts in the way the platform requires and nothing else
changes:

```css
@view-transition {
  navigation: auto;
}
```

---

## 12. Same-document transitions at runtime

Everything above is CSS. When the thing that moves is your own state (a card taking the corner, a panel
opening, a list reordering) the browser cannot see the change happen, so someone has to say when it is.
That half lives behind its own subpath, so the root package stays free of runtime code:

```ts
import { createViewTransition } from '@ibnlanre/jumi/view-transition'

const transition = createViewTransition()

transition.run(() => {
  setActive('bravo')
})
```

The classes from section 11 style what happens next. Three rules govern the call:

1. **The callback must finish synchronously.** Do not `await` inside it, do not return a promise, and do
   not wait for a frame. A promise handed to the browser is a pending callback, and awaiting a frame
   inside one wedges the transition permanently: no capture, no animation, no error, and the change never
   lands. Do asynchronous work first, then transition the result.
2. **Two calls while a transition is running are decided by when the second arrives.** A second call in
   the same task is the same interaction twice, so your update runs and no second transition starts. A
   second call in a later task, such as another click or a timer, is a new intention and supersedes the
   one in flight. Override the policy only when you know something the timing does not:
   `createViewTransition({ concurrency: 'coalesce' })` or `run(update, { concurrency: 'supersede' })`.
3. **The call resolves to an outcome instead of rejecting when the transition could not run.** Branch on
   it when the difference matters.

| Result                                           | Meaning                                                  |
| ------------------------------------------------ | -------------------------------------------------------- |
| `{ transitioned: true }`                         | The transition ran, with your change inside its boundary |
| `{ transitioned: false, reason: 'in-flight' }`   | A duplicate call in the same interaction                 |
| `{ transitioned: false, reason: 'aborted' }`     | Replaced or skipped before it animated                   |
| `{ transitioned: false, reason: 'hidden' }`      | The document is in a background tab                      |
| `{ transitioned: false, reason: 'unsupported' }` | The browser has no view transitions                      |

Your update runs exactly once per call in every one of those cases: an outcome describes the animation,
never whether your change happened. Update errors and asynchronous callbacks reject rather than becoming
platform outcomes. For reusable operations, `transition.wrap(update, hooks)` keeps the update's argument
types, replaces its return value with the outcome promise, and gives each wrapped operation its own
lifecycle: `onTransitionStart`, `onTransitionEnd`, `onDecline(reason)` and `onError(error)`. Wrapping is
operation attribution, not invocation attribution: `open(true)` and `open(false)` may overlap and invoke
the same hooks, so treat the returned promise as each call's own channel.

A framework's setter does not necessarily commit the DOM synchronously, and Jumi cannot infer a rendering
schedule. In React, make the commit boundary explicit:

```ts
import { flushSync } from 'react-dom'
import { createViewTransition } from '@ibnlanre/jumi/view-transition'

const transition = createViewTransition()
const open = transition.wrap((next: boolean) => {
  flushSync(() => setOpen(next))
})

await open(true)
```

---

## 13. Accessibility

Decorative motion should be optional, and the element should be readable when the motion is off.

```html
<div class="motion-safe:animate-fade-in-up">
  Always readable. Animated when welcome.
</div>
```

Keep the base element visible: avoid an unconditional `opacity-0` or an off-screen transform that leaves
content hidden when the animation is disabled.

For continuous motion, the inverse variant is the one to reach for, because it strips the repetition only
for the visitors who asked for less:

```html
<div
  class="animate-pulsing animation-iteration-count-infinite
         motion-reduce:animation-iteration-count-1"
>
  Pulses until you say otherwise.
</div>
```

There is no carrier class to switch off, so reducing motion across a surface means reaching the elements
themselves:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

Give persistent decorative movement a real pause control, labelled, with `aria-pressed`, and pause it the
same way:

```css
.motion-paused *,
.motion-paused *::before,
.motion-paused *::after {
  animation-play-state: paused !important;
}
```

For exits, choose the final state explicitly, as in `motion-reduce:opacity-0` on an outgoing surface while
application code handles removal and focus. Do not apply a hidden base style to an entrance. Keep
essential information available without animation, avoid flashing and rapid repetition, give focus states
the same care as hover states, and test with reduced motion enabled as well as with motion paused.

---

## 14. Rules that separate a working answer from a broken one

1. **Controls configure, they never create.** If a control seems to do nothing, look for the motion first.
2. **Say which kind of motion you are writing.** Effect, property target, phrase, transition. Mixing the
   mental models is what produces markup that compiles and does not move.
3. **One phrase per property per element.** A phrase owns its property; layering two on one property is
   how you get one of them silently.
4. **Write pipes in phrases, never commas.**
5. **Name a motion with a word that is not a property**, and give each motion you want to time separately
   its own word.
6. **Nest elements to layer motion.** An effect owns the properties it writes, and a second effect writing
   the same property replaces it.
7. **Fill mode owns the end state.** The default `forwards` holds the final frame. `animation-fill-mode-none`
   releases it, so a clip exit such as `diamond-out` or `mask-center` returns to the unclipped surface the
   moment the animation ends.
8. **A one-shot animation runs when it is applied.** Replaying it means remounting the element or removing
   and reapplying the class; it is not a function you call.
9. **Size effects read the containing block.** `expand-*` animates a percentage of the container, and
   `typing` animates `width` from `0` to `100%` of it. Measured, a 46.7px line inside a 320px column is
   fully visible at about 11% of the timeline, and the rest is invisible layout growth. Give the element a
   shrink-wrapped parent (`inline-block`, or `width: fit-content`) and the animation ends exactly when the
   last character appears.
10. **`accordion` has a ceiling.** It ramps `max-height` from 0 to 1000px through a 500px stop, so content
    taller than 1000px stays at the ceiling and short content finishes early (measured, a 40px panel is
    fully open at about 5% of the timeline). Size the ramp to the content, or use a reveal such as
    `fade-in-up` when the height itself does not need to move.
11. **Clip entrances reach full coverage.** `diamond-in` and the `triangle-in` family grow past the corners,
    so their final frame covers the whole box; the `-out` variants are exact reversals.
12. **`100%` in these effects is the container, not the content**, so give the container the dimensions the
    motion should land on.
13. **Keyword sizes are opt-in.** `animate-width-auto` interpolates only with
    `interpolate-size-allow-keywords`, which is inherited.
14. **Declare a motion path rather than animating from `none`**, or the element appears on the path halfway
    through instead of easing onto it.
15. **Write complete class names**, or register the ones you assemble with `@source inline()`.

---

## 15. Troubleshooting

| Symptom                                            | Cause                                                                                    | Fix                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| The utilities exist in the CSS, nothing moves      | Only the plugin is wired up; the finalizer never ran                                     | Use `jumi()` from `/vite` or `/postcss`, or call `finalizeCss` after the CLI   |
| One class seems missing from the stylesheet        | The class is assembled from fragments, so the scanner never saw it                       | Write full class names, or list them in `@source inline("...")`                |
| A phrase animates nothing, with no warning         | Commas used as frame separators                                                          | Use pipes: `0:0\|100:1`                                                        |
| A phrase warns and does nothing                    | An offset outside 0 to 100                                                               | Keep offsets in range; the warning names the offset                            |
| A duration or delay is ignored                     | Arbitrary values need a unit, and the motion must exist                                  | `animation-duration-[800ms]`, and check the motion it should configure         |
| A scoped control has no effect                     | The name addresses nothing on this element                                               | Match the name to the motion, and remember property words belong to properties |
| Two effects fight or one disappears                | Both write `transform`, `opacity` or `clip-path`                                         | Nest elements, or combine them deliberately                                    |
| A clip exit snaps back the moment it ends          | `animation-fill-mode-none` released it                                                   | Keep the default `forwards`, or remove the element                             |
| An entrance does not play again                    | A one-shot animation runs when applied                                                   | Remount, or remove and reapply the class                                       |
| `typing` reveals the text early, or never finishes | `100%` is the containing block's width, and the clip needs `overflow: hidden` + `nowrap` | Give it a shrink-wrapped parent                                                |
| `accordion` cuts off content                       | Content taller than the 1000px ramp                                                      | Own keyframes, a taller-aware reveal, or no height motion                      |
| The list stagger only moves the first item         | The animated elements are not direct children                                            | Put the stagger parent next to them                                            |
| A view transition does nothing                     | The name is duplicated in the document, or the browser declined it                       | Keep names unique, and read `reason` from the runtime outcome                  |
| A scroll-driven entrance plays on load             | No scroll-driven timeline support, so it fell back to time                               | Guard both halves with `supports-[animation-timeline:scroll()]:`               |

---

## 16. Where the rest lives

| Surface               | Where                                                                     |
| --------------------- | ------------------------------------------------------------------------- |
| Effects catalog       | the site's `/effects/` page, and Appendix A here                          |
| Twelve guides         | `docs/src/pages/docs/` in the repository                                  |
| Setup, in full        | `docs/src/pages/docs/installation.md` and `build-step.md`                 |
| Effective class names | the editor's autocomplete, since every utility is a real Tailwind utility |

---

## Appendix A: the 235 effect names, by family

Use these with the `animate-` prefix: `animate-fade-in`, `animate-zoom-in-elastic`, and so on.

- **accordion** (1): accordion
- **arc** (4): arc-bottom-left, arc-bottom-right, arc-top-left, arc-top-right
- **back** (5): back-in, back-in-down, back-in-left, back-in-right, back-in-up
- **blinds** (4): blinds-in-x, blinds-in-y, blinds-out-x, blinds-out-y
- **blink** (1): blink
- **blur** (2): blur-in, blur-out
- **bounce** (10): bounce-in, bounce-in-down, bounce-in-left, bounce-in-right, bounce-in-up, bounce-out, bounce-out-down, bounce-out-left, bounce-out-right, bounce-out-up
- **bubble** (1): bubble
- **circle** (10): circle-in, circle-in-bottom-left, circle-in-bottom-right, circle-in-top-left, circle-in-top-right, circle-out, circle-out-bottom-left, circle-out-bottom-right, circle-out-top-left, circle-out-top-right
- **diamond** (2): diamond-in, diamond-out
- **distort** (1): distort
- **drip** (1): drip
- **elastic** (1): elastic
- **expand** (4): expand-down, expand-left, expand-right, expand-up
- **explode** (1): explode
- **fade** (10): fade-in, fade-in-down, fade-in-left, fade-in-right, fade-in-up, fade-out, fade-out-down, fade-out-left, fade-out-right, fade-out-up
- **fall** (4): fall-down, fall-left, fall-right, fall-up
- **figure** (1): figure-eight
- **flicker** (1): flicker
- **flip** (17): flip-card-x, flip-card-y, flip-diagonal, flip-in-bottom, flip-in-left, flip-in-right, flip-in-top, flip-in-x, flip-in-y, flip-wobble-x, flip-wobble-y, flip-x, flip-x-elastic, flip-y, flip-y-elastic, flip-zoom-x, flip-zoom-y
- **floating** (1): floating
- **fold** (2): fold-in, fold-out
- **glitch** (1): glitch
- **glow** (1): glow
- **heart** (1): heart-beat
- **hinge** (1): hinge-drop
- **hue** (1): hue-shift
- **implode** (1): implode
- **jello** (1): jello
- **letter** (2): letter-space-in, letter-space-out
- **lift** (1): lift
- **magnetic** (1): magnetic
- **mask** (9): mask-bottom, mask-bottom-left, mask-bottom-right, mask-center, mask-left, mask-right, mask-top, mask-top-left, mask-top-right
- **melt** (1): melt
- **morph** (1): morph
- **neon** (1): neon
- **power** (2): power-off, power-on
- **pulsing** (1): pulsing
- **radial** (2): radial-wipe-in, radial-wipe-out
- **reveal** (5): reveal-down, reveal-left, reveal-right, reveal-swipe, reveal-up
- **ripple** (1): ripple
- **rotate** (2): rotate-left, rotate-right
- **rush** (8): rush-in-down, rush-in-left, rush-in-right, rush-in-up, rush-out-down, rush-out-left, rush-out-right, rush-out-up
- **scatter** (1): scatter
- **shadow** (1): shadow
- **shake** (1): shake
- **shimmer** (1): shimmer
- **skew** (10): skew-down, skew-in, skew-left, skew-left-down, skew-left-up, skew-out, skew-right, skew-right-down, skew-right-up, skew-up
- **slide** (17): slide-in-down, slide-in-down-elastic, slide-in-left, slide-in-right, slide-in-up, slide-in-up-elastic, slide-in-up-left, slide-in-up-right, slide-out-down, slide-out-left, slide-out-right, slide-out-up, slide-peek-down, slide-peek-left, slide-peek-right, slide-peek-up, slide-stack
- **spinning** (1): spinning
- **spiral** (6): spiral, spiral-back-in, spiral-back-out, spiral-in, spiral-out, spiral-path
- **splash** (1): splash
- **spring** (4): spring-down, spring-left, spring-right, spring-up
- **square** (10): square-in, square-in-bottom-left, square-in-bottom-right, square-in-top-left, square-in-top-right, square-out, square-out-bottom-left, square-out-bottom-right, square-out-top-left, square-out-top-right
- **swing** (1): swing
- **tada** (1): tada
- **throw** (4): throw-down, throw-left, throw-right, throw-up
- **tilt** (1): tilt
- **triangle** (10): triangle-in, triangle-in-bottom-left, triangle-in-bottom-right, triangle-in-top-left, triangle-in-top-right, triangle-out, triangle-out-bottom-left, triangle-out-bottom-right, triangle-out-top-left, triangle-out-top-right
- **twist** (3): twist, twist-in, twist-out
- **typing** (1): typing
- **unfold** (2): unfold-x, unfold-y
- **unmask** (9): unmask, unmask-bottom, unmask-bottom-left, unmask-bottom-right, unmask-left, unmask-right, unmask-top, unmask-top-left, unmask-top-right
- **wave** (1): wave
- **wiggle** (1): wiggle
- **wobble** (1): wobble
- **wobbling** (1): wobbling
- **word** (1): word-slide
- **zoom** (17): zoom-in, zoom-in-down, zoom-in-elastic, zoom-in-left, zoom-in-right, zoom-in-up, zoom-out, zoom-out-down, zoom-out-elastic, zoom-out-left, zoom-out-right, zoom-out-up, zoom-pulse, zoom-pulse-grow, zoom-pulse-shrink, zoom-tilt-in, zoom-tilt-out

## Appendix B: the 395 property stems

Every one of these takes the `animate-` prefix and a value: `animate-opacity-50`,
`animate-background-position-x-offset-[10px]`. Names are the CSS property names, with part tokens added
for compound values (`filter-blur`, `box-shadow-offset-x`, `border-image-slice-x`, `offset-anchor-x-edge`,
`background-position-x-offset`, `contain-intrinsic-block-size`, `hyphenate-limit-chars-minimum-word-length`).

```text
  accent-color align-content align-items align-self alignment-baseline all appearance
  aspect-ratio aspect-ratio-height aspect-ratio-width backdrop-filter backdrop-filter-blur
  backdrop-filter-brightness backdrop-filter-contrast backdrop-filter-drop-shadow
  backdrop-filter-drop-shadow-blur backdrop-filter-drop-shadow-color
  backdrop-filter-drop-shadow-offset-x backdrop-filter-drop-shadow-offset-y
  backdrop-filter-grayscale backdrop-filter-hue-rotate backdrop-filter-invert
  backdrop-filter-opacity backdrop-filter-saturate backdrop-filter-sepia backdrop-filter-url
  backface-visibility background background-attachment background-blend-mode background-clip
  background-color background-image background-origin background-position background-position-x
  background-position-x-edge background-position-x-offset background-position-y
  background-position-y-edge background-position-y-offset background-repeat background-repeat-x
  background-repeat-y background-size background-size-height background-size-width block-size
  border border-block border-block-color border-block-end-radius border-block-end-width
  border-block-start-radius border-block-start-width border-block-width
  border-bottom-left-radius border-bottom-radius border-bottom-right-radius border-bottom-width
  border-collapse border-color border-end-end-radius border-end-start-radius border-image
  border-image-outset border-image-outset-bottom border-image-outset-left
  border-image-outset-right border-image-outset-top border-image-outset-x border-image-outset-y
  border-image-repeat border-image-repeat-x border-image-repeat-y border-inline-end-radius
  border-inline-end-width border-inline-start-radius border-inline-start-width
  border-inline-width border-left-radius border-left-width border-radius border-right-radius
  border-right-width border-start-end-radius border-start-start-radius border-top-left-radius
  border-top-radius border-top-right-radius border-top-width border-width bottom
  box-decoration-break box-shadow box-shadow-blur box-shadow-color box-shadow-offset-x
  box-shadow-offset-y box-shadow-spread box-sizing break-after break-before break-inside
  caption-side caret-color clear clip-path clip-rule color color-interpolation
  color-interpolation-filters color-scheme column-count column-fill column-gap column-rule
  column-rule-color column-rule-style column-rule-width column-span column-width columns
  contain contain-intrinsic-block-size contain-intrinsic-height contain-intrinsic-inline-size
  contain-intrinsic-size contain-intrinsic-width content content-visibility counter-increment
  counter-reset counter-set cursor cx cy d display display-inside display-outside
  dominant-baseline empty-cells fill fill-opacity fill-rule filter filter-blur
  filter-brightness filter-contrast filter-drop-shadow filter-drop-shadow-blur
  filter-drop-shadow-color filter-drop-shadow-offset-x filter-drop-shadow-offset-y
  filter-grayscale filter-hue-rotate filter-invert filter-opacity filter-saturate filter-sepia
  filter-url flex flex-basis flex-direction flex-flow flex-grow flex-shrink flex-wrap float
  flood-color flood-opacity font-family font-feature-settings font-kerning font-size
  font-size-adjust font-style font-synthesis font-synthesis-small-caps font-synthesis-style
  font-synthesis-weight font-variant font-variant-alternates font-variant-caps
  font-variant-east-asian font-variant-ligatures font-variant-numeric font-variant-position
  font-variation-settings font-weight forced-color-adjust gap grid grid-auto-columns
  grid-auto-flow grid-auto-rows grid-column grid-column-end grid-column-start grid-row
  grid-row-end grid-row-start grid-template-areas grid-template-columns grid-template-rows
  hanging-punctuation height hyphenate-character hyphenate-limit-chars
  hyphenate-limit-chars-minimum-characters-after
  hyphenate-limit-chars-minimum-characters-before hyphenate-limit-chars-minimum-word-length
  hyphens image-orientation image-rendering initial-letter inline-size inset inset-block
  inset-block-end inset-block-start inset-inline inset-inline-end inset-inline-start
  justify-content justify-items justify-self left letter-spacing lighting-color line-break
  line-clamp line-height list-style list-style-image list-style-position list-style-type margin
  margin-block margin-block-end margin-block-start margin-bottom margin-inline
  margin-inline-end margin-inline-start margin-left margin-right margin-top marker marker-end
  marker-mid marker-start mask mask-border mask-border-mode mask-border-outset
  mask-border-outset-bottom mask-border-outset-left mask-border-outset-right
  mask-border-outset-top mask-border-outset-x mask-border-outset-y mask-border-repeat
  mask-border-slice mask-border-slice-bottom mask-border-slice-left mask-border-slice-right
  mask-border-slice-top mask-border-slice-x mask-border-slice-y mask-border-source
  mask-border-width mask-clip mask-composite mask-image mask-mode mask-origin mask-position
  mask-repeat mask-size mask-type math-depth math-depth-add math-style max-block-size
  max-height max-inline-size max-width min-block-size min-height min-inline-size min-width
  mix-blend-mode object-fit object-position object-position-x object-position-x-edge
  object-position-x-offset object-position-y object-position-y-edge object-position-y-offset
  offset offset-anchor offset-anchor-x-edge offset-anchor-y-edge offset-distance offset-path
  offset-position offset-position-x offset-position-x-edge offset-position-x-offset
  offset-position-y offset-position-y-edge offset-position-y-offset offset-rotate opacity order
  orphans outline outline-color outline-offset outline-style outline-width overflow
  overflow-anchor overflow-block overflow-clip-margin overflow-inline overflow-wrap overflow-x
  overflow-y overscroll-behavior overscroll-behavior-block overscroll-behavior-inline
  overscroll-behavior-x overscroll-behavior-y padding padding-block padding-block-end
  padding-block-start padding-bottom padding-inline padding-inline-end padding-inline-start
  padding-left padding-right padding-top page paint-order perspective perspective-origin
  position right rotate rotate-3d rotate-angle rotate-x rotate-y rotate-z row-gap scale scale-x
  scale-y scale-z skew skew-x skew-y stroke stroke-dasharray stroke-dashoffset stroke-width
  text-align text-shadow text-shadow-blur text-shadow-color text-shadow-offset-x
  text-shadow-offset-y top transform transform-origin transform-origin-x transform-origin-y
  transform-origin-z transform-style translate translate-3d translate-x translate-y translate-z
  visibility width x y z-index
```

## Appendix C: easing names, and the other keyword scales

Timing functions, for `animation-timing-function-*` and `transition-timing-function-*`:

```text
linear, ease, ease-in, ease-out, ease-in-out, step-start, step-end,
ease-in-quad, ease-out-quad, ease-in-out-quad, ease-in-cubic, ease-out-cubic, ease-in-out-cubic,
ease-in-quart, ease-out-quart, ease-in-out-quart, ease-in-quint, ease-out-quint, ease-in-out-quint,
ease-in-sine, ease-out-sine, ease-in-out-sine, ease-in-circ, ease-out-circ, ease-in-out-circ,
ease-in-expo, ease-out-expo, ease-in-out-expo, ease-in-back, ease-out-back, ease-in-out-back,
ease-entrance, ease-exit, ease-exit-sharp, ease-smooth, ease-bounce-out, ease-elastic
```

Other scales, for the controls that take them:

```text
direction          normal, reverse, alternate, alternate-reverse
fill mode          none, forwards, backwards, both
play state         running, paused
composition        replace, add, accumulate
iterations         1 through 10, infinite, or any number
timeline           auto, none, scroll, view, [--your-timeline]
timeline scroller  nearest, root, self
timeline axis      block, inline, x, y
range names        entry, exit, contain, cover, entry-crossing, exit-crossing
transition behavior normal, allow-discrete
interpolate size   allow-keywords, numeric-only
animation name     none
```
