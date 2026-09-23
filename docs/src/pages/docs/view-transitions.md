---
layout: ../../layouts/Docs.astro
title: Between one page and another.
description: Animate the browser's own view transition, on the outgoing and incoming sides.
---

## Name the visual

A view transition animates the browser's snapshot of an element rather than the element itself.
`hero` names the visual across the transition, `old` styles the outgoing snapshot and `new` styles the
incoming one, and Jumi handles the generated view transition pseudo-elements for you.

```html
<div
  class="view-transition-old/hero:animate-fade-out view-transition-new/hero:animate-fade-in"
>
  hero
</div>
```

The name after the `/` is yours (`hero`, `my-card-2`, whatever the thing is), and the motion after the
`:` is an ordinary Jumi class. An effect, a phrase, an arbitrary value, all work as they do anywhere
else:

```html
<!-- the card leaves by shrinking and arrives by growing -->
<div
  class="view-transition-old/card:animate-scale-90 view-transition-new/card:animate-scale-110"
></div>
```

Either side on its own is fine. With only `view-transition-new/…`, the outgoing side keeps the browser's
own cross-fade, which is usually what you want when the old state simply disappears.

## The name is a claim on the document

Choosing a name is not labelling the element, because the name is the only thing linking the two halves
of this. The browser addresses a snapshot _only_ by name ( `::view-transition-old(hero)` is the one
selector there is for it), so a candidate attaches its motion to whatever carries that name in the
document, including an element it has never seen:

```css
/* elsewhere in the same document: this element animates with Jumi's motion as well */
.card {
  view-transition-name: hero;
}
```

Nothing about that is visible at the call site, in either direction, so the rule is worth stating plainly:
**a name handed to a candidate is spoken for.** Keep it distinct from the names you write yourself.

Two elements sharing one name is the same mistake in its other form, and it fails differently: the
browser refuses that transition outright rather than animating the wrong thing, so it arrives as a console
error about a duplicate name rather than as a difference you can see.

[See it on a layout that actually moves ↗](/demo/view-transitions/): six cards, a real layout shift, and
a switch between this and the browser's own behaviour.

## Controls do not create a transition

The two sides are independent, so each takes its own controls:

```html
<div
  class="view-transition-old/hero:animate-fade-out view-transition-old/hero:animation-duration-300 view-transition-new/hero:animate-fade-in view-transition-new/hero:animation-duration-500"
></div>
```

And as everywhere else in Jumi, a control on its own does nothing: it configures a duration for an
element that would need a motion to have one:

```html
<!-- configures duration only; this element does not participate -->
<div class="view-transition-old/hero:animation-duration-300"></div>
```

## When it applies

Ordinary conditional variants work, and each one applies to the side it is written on:

```html
<div
  class="sm:view-transition-old/hero:animate-fade-out view-transition-new/hero:animate-fade-in"
></div>
```

Above the breakpoint both sides are yours. Below it the outgoing side keeps the browser's own
cross-fade rather than going quiet, so the transition still reads as a transition; it just stops being
yours on that side.

## Reduced motion

A `motion-safe:` motion runs for readers who have not asked for less motion, and the element takes part
in the transition either way:

```html
<div
  class="motion-safe:view-transition-old/hero:animate-fade-out motion-safe:view-transition-new/hero:animate-fade-in"
></div>
```

`motion-reduce:` is not available here. Jumi has already decided that its own view transition motion
does not run under reduced motion, and the browser's cross-fade is what remains, so a candidate asking
for the opposite is reported rather than accepted.

## Across two pages

Everything above works within one page. For a navigation (one document to another), the page opts in
the way the platform requires, and nothing else changes:

```css
@view-transition {
  navigation: auto;
}
```

## When Jumi cannot honour a candidate

Two things have no meaning on the browser's snapshot rather than on your element, and both are reported
as a build warning naming the candidate, rather than accepted and animated some other way:

- a name the browser will not accept, including the reserved words: `none`, `auto`, and the CSS-wide
  keywords
- a variant that depends on the element's own state, such as `hover:` or `group-hover:`; there is no
  element on the other side for `:hover` to be about
