---
layout: ../../layouts/Docs.astro
title: Give motion a rhythm.
description: Control how an animation begins, travels, repeats, and settles.
---

## The essential controls

| Utility | Example | Purpose |
| --- | --- | --- |
| Duration | `animation-duration-[800ms]` | Length of one iteration |
| Delay | `animation-delay-[200ms]` | Time before starting |
| Easing | `animation-timing-function-ease-out` | Acceleration through the motion |
| Iterations | `animation-iteration-count-3` | Number of repeats |
| Direction | `animation-direction-alternate` | Alternate forwards and backwards |
| Fill | `animation-fill-mode-both` | Apply endpoint styles before and after |
| Playback | `animation-play-state-paused` | Pause an animation |

Defaults are a 1-second duration, one iteration, normal direction, and forwards fill. Forwards fill preserves the final animated value after completion.

## One motion, many personalities

```html
<div class="animate-rotate-90 animation-duration-1400 animation-timing-function-ease-in-out animation-direction-alternate animation-iteration-count-infinite">
  Back and forth.
</div>
```

Use `animation-timing-function-linear` for steady rotation. Try `animation-timing-function-ease-out-back` for a curve with overshoot, or an arbitrary `cubic-bezier()` value for a custom feel.

```html
<div class="animate-scale-110 animation-timing-function-ease-out-quint">
  Settle into place.
</div>
```

## Target a property or effect

Append `/{property}` or `/{effect}` to timing controls:

```html
<div class="animate-rotate-45 animate-scale-110 animation-duration-500 animation-duration-1200/rotate">
  Scale at 500ms. Rotate at 1200ms.
</div>
```

Any motion can be named, and the name goes after a slash: `animate-fade-in/reveal`, `animate-opacity-50/reveal`, `animate-rotate-[0:0deg|12:-8deg|100:-8deg]/reveal`. `[brackets]` are only for a name that needs them — a name is one word, so you can write it directly.

When one property carries more than one animation, name each where you declare it and address it by that name:

```html
<div class="animate-rotate-[0:0deg|12:-8deg|100:-8deg]/flick
  animate-rotate-[0:0deg|12:0deg|100:8deg]/return
  animation-composition-add/rotate
  animation-timing-function-ease-in-out-circ/flick
  animation-timing-function-linear/return">
  A flick that lands, then a plain return.
</div>
```

`/flick` gives that animation a name, and the same name on a control times it on its own. Each animation reads its own name first, then the property's control, then the global one, so anything else in the list is left alone — and naming one does not change its phrase.

A name belongs to the motion that declared it, on the element that wrote it. Two elements may use the same word for different motions, and naming a motion elsewhere in your stylesheet never widens what this element answers to. Two motions on one element may also share a name, and then a control written for that name reaches both — which is how a transition of several properties is tuned as one thing.

The name is yours to choose, and it becomes the variable name exactly as written — nothing is prepended. Names and property names are one namespace, which is what lets `/rotate` and `/flick` be written the same way on a control: `--jumi-rotate-animation-timing-function` is the variable every rotate animation reads, so `rotate` is the name all of them answer to, and a name is a word one of them answers to. Give each animation you want to time apart its own word.

Naming is registered non-inheriting: a name does not travel into descendants, so a wrapper and the element inside it can use the same word without knowing about each other.

The three links do not behave alike across that boundary. A `/{property}` control on a wrapper does reach the animations inside it, because nothing declares `--jumi-{property}-animation-{part}` on the element, so the value it writes is inherited. A global control does not: every animating element declares the global defaults itself, and a declaration beats inheritance. A name never does.

Naming a motion that is not there is not an error: controls configure motion, they do not create it, so `animation-duration-500/reveal` with nothing named `reveal` on the element does nothing at all — exactly like `animation-duration-500`. That is what makes a named control beside a conditional motion (`motion-safe:animate-fade-in/reveal`) ordinary rather than suspect. A name that cannot be written, though, is reported and dropped: a name becomes part of a custom property's name, and whitespace cannot appear there — which is what an underscore becomes inside `[brackets]`, so write a name bare.

Reach for naming when one easing is not enough. A single `animation-timing-function` applies to every segment of an animation, so pairing an eased flick with a linear return takes two animations, each with one moving segment. `animation-composition: add` lets both apply at once instead of the second replacing the first.

The name is written into the rule, so you can retime or re-ease that animation from your own CSS without touching the markup:

```css
.petal { --jumi-flick-animation-duration: 900ms; }
```

## Write the shape of the animation

A value can declare its own frames — an offset, a colon, a value — so one utility describes the whole motion:

```html
<div class="animate-rotate-[0:0deg|50:0deg|100:45deg]
  animation-duration-2000
  animation-iteration-count-infinite">
  Rest, then turn one way over the second half.
</div>
```

Frames are separated by commas, each written `<offset>:<value>`. The offset is a bare number — the `%` is implied, and `0` and `100` are the endpoints. Any offset you leave out is the property's resting value, so a phrase holds still until its first frame and closes itself at the end. That is what makes it safe to run `infinite`: the loop has no seam.

A phrase owns its property, and its keyframe is named after the phrase, so nothing else can share it. Two elements running the same phrase run the same keyframe; a different phrase gets a keyframe of its own. No other markup can change what your animation does — which is also why you write one phrase per property per element rather than layering several.

Placing an action inside the cycle, rather than spreading it across the whole of it, is what this is for. A step earlier in the phrase is a step later in the cycle:

```html
<div class="animate-scale-[0:0.5|50:1.1|100:1]
  animate-opacity-[0:0|50:1|100:1]
  animation-duration-2600
  animation-iteration-count-infinite">
  Gather, overshoot, settle — and arrive while it settles.
</div>
```

A property that takes several values takes all of them at each frame, with `_` standing in for the space: `animate-scale-[0:0.42_0.30|50:1.03_1.03]` scales both axes together.

This site's hero is built this way. A wrapper around each petal carries a slow, seamless winding, and the petal inside it carries the flick:

```html
<div class="petal-position
  animate-rotate-[0:var(--angle)|100:calc(var(--angle)_-_360deg)]
  animation-duration-[75s]
  animation-timing-function-linear
  animation-iteration-count-infinite"
  style="--angle:0deg">

  <div class="petal
    animate-rotate-[0:0deg|20:-8deg|100:-8deg]/flick
    animate-rotate-[0:0deg|20:0deg|100:8deg]/return
    animation-composition-add/rotate
    animation-duration-3000
    animation-timing-function-[cubic-bezier(.4,0,.6,1)]/flick
    animation-timing-function-linear/return
    animation-iteration-count-infinite"
    style="--jumi-animation-delay:-250ms"></div>
</div>
```

The wrapper turns a full circle over `75s`, ending exactly one turn from where it starts, so its loop has no seam and the petals can wind continuously in one direction. The petal's own two animations are symmetric — back `8deg`, then forward to rest — so the winding is what keeps the composed rotation moving the same way throughout.

The petals are staggered `250ms` apart, one twelfth of the `3s` cycle, so each flick overlaps the next and the motion travels around the ring rather than arriving everywhere at once.

A phrase is a value, so it can live in your theme and be referenced by name:

```js
theme: { rotate: { unfurl: '0:16deg,58:0deg' } }
```

```html
animate-rotate-unfurl
```

That is the shorter spelling when one phrase is used on several elements, and it keeps the frames in a single place.

## Timelines and composition

Three declarations, three questions, and keeping them apart is the whole of this feature:

```text
animation  ────────►  what motion happens
animation-timeline ─►  what drives its progress
animation-range ────►  where on that driver the motion runs
```

A motion is not written differently because a scroll drives it. The same `animate-fade-in` is scrubbed by scroll position instead of by time the moment a timeline names the driver:

```html
<div class="animate-fade-in animation-timeline-view">
```

`animation-timeline-scroll` follows the nearest scroller, `animation-timeline-view` tracks the element through its scrollport, and `animation-timeline-[--name]` consumes a timeline the page declares in its own CSS. A timeline can be given to one animation on an element and not its neighbour with `/{property}` or `/{label}`, exactly as the timing controls are.

A range then places the motion along that driver. The arbitrary form is the value itself, so it is the one to reach for whenever a range has an offset in it:

```html
animation-range-[entry_0%_cover_50%]
animation-range-start-[entry_25%]
animation-range-end-[exit_75%]
```

For a range with no offset, the range names are the utilities:

```html
animation-range-entry
animation-range-cover
animation-range-contain
animation-range-exit
animation-range-start-entry
animation-range-end-exit
```

and an offset on its own is its own utility: `animation-range-start-offset-25` makes the motion start 25% into the default range.

Those utilities place the element's animations. To place **one** of them and leave its neighbours where they are, the same vocabulary works as a prefix on the motion itself:

```html
<div class="animate-fade-in animate-rotate-45 animation-timeline-scroll animation-range-[25%_75%]:animate-fade-in">
```

The fade is scrubbed between 25% and 75% of the scroll while the rotation beside it still fills the whole range. The two spellings compose rather than compete — a ranged motion falls back to the element's range, which falls back to the whole range — so `animation-range-entry:animate-fade-in` says *this animation uses the entry range*, and `animation-range-entry` says *this element's animations do*.

A range Jumi cannot write is reported and dropped: the motion it qualified still runs, on the default range. That matters most for a range that looks legal and is not — `normal` joined to an offset, as in `animation-range-[normal_0%]`, is dropped by the engine without a word, so the warning is the only thing that tells you the range you wrote is not the range you got.

**Fallback:** If the browser does not support scroll-driven timelines, the animation falls back to the document timeline and runs as a normal time-based animation.

That is a real fallback rather than a transparent one: the animation and its final state are kept, but a view-driven entrance plays on load instead of tracking entry. When you want scroll-driven or nothing, put the motion and its timeline behind one capability query:

```html
<div class="supports-[animation-timeline:scroll()]:animate-fade-in supports-[animation-timeline:scroll()]:animation-timeline-scroll">
```

Inside the query the pair applies together and the motion is scrubbed; outside it neither applies, so the element keeps its base state and the motion never runs. There is no separate strict syntax for this — the guard is the whole mechanism, and it works because both halves are ordinary utilities.

Composition is not how Jumi combines several values of one property — a phrase is. Use `animation-composition` to blend an animation with a value already on the element, or to apply two animations of one property at once, as in the labelled example above.

Composition, timeline and range are assembled per animation, alongside duration, delay, easing, iteration, direction, fill and playback, so `/{property}` and `/{label}` reach them the same way.

On a scroll-driven animation the time controls are reinterpreted rather than ignored: 100% of the timeline is the animation's own end, so `animation-delay` becomes a share of the scroll that also shortens the motion, and `animation-iteration-count` divides the range. Stagger is delay-based, so a staggered group is staggered along the scroll the same way — each child's motion is compressed into its own share. Reach for `animation-range` when you want to place a motion deliberately.

## Pause long-running motion

Give visitors a way to stop decorative loops. This site uses a pause button that applies `animation-play-state: paused` to its Jumi elements, alongside a reduced-motion stylesheet.
