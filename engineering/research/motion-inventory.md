# What motion primitives are actually missing?

Chromium 153.0.8010.12. `pnpm spike:motion-inventory` (`scripts/spike-motion-inventory.mjs`). No `src/`
changes, no syntax proposals. 51 candidates spanning the platform's motion surface.

## Summary

**Nothing is missing as a category.** Every motion _category_ the platform offers is already reachable
through Jumi; what the sweep found instead is one reachability cluster, two newer knobs, and a handful of
properties that are not motion at all:

```text
named timelines (scroll-timeline-*, view-timeline-*, timeline-scope)   the only motion-relevant gap
view-transition-group                                                  discrete, and newer than the feature
scroll-behavior, scroll-snap-type, will-change, transform-box           not motion
```

The named-timeline cluster is not a missing subsystem either: it is two plain declarations on a _scroller_ —
an element that is not the animated one — plus a reference through the `animation-timeline` control Jumi
already has. So the honest reading is that **1.0 has nothing left to invent in the motion family**, and the
remaining work is coverage and hardening rather than another subsystem.

## 1 · The method, and why each reading can be trusted

Three readings per candidate, each taken from the side that can actually answer it:

1. **Animatability — from the browser.** A keyframe writes the property from one endpoint to the other, and
   the paused animation is seeked to 0 / 50 / 100%. A midpoint value differing from _both_ endpoints
   interpolated; a value equal to one of them did not. This is what separates a motion primitive from a knob
   that merely looks animatable.
2. **Jumi motion — from Jumi's build, by differential.** `animate-<property>-[<value>]` emits a rule or emits
   nothing. The arbitrary form is deliberate, so the reading is "is this property registered as a motion",
   not "does the theme happen to have this value".
3. **Jumi control — from `src/properties/controls.ts`**, which is where a property lives when it configures a
   motion rather than being one.

Two guards, both of which changed the answer:

- **A host-only build, for comparison.** Tailwind ships `will-change-*` and other property utilities of its
  own, so a bare `<property>-[…]` candidate that emits proves nothing about Jumi until the same candidate is
  built without the plugin. `will-change-[transform]` was credited to Jumi until this comparison existed.
- **The endpoints are checked with `CSS.supports` first.** A candidate whose fixture is not legal CSS reports
  **unmeasured**, never "not animatable" — an invalid fixture and a platform limitation look identical in
  output, which is the trap this repository has paid for repeatedly.

## 2 · The inventory

`interpolates` is the browser reading; the coverage column names the mechanism that owns the property.

### Covered as motion

| property                                                        | browser      | Jumi                               |
| --------------------------------------------------------------- | ------------ | ---------------------------------- |
| `transform`, `transform-origin`, `translate`, `rotate`, `scale` | interpolate  | motion                             |
| `offset-path`, `offset-distance`, `offset-rotate`               | interpolate  | motion                             |
| `offset-anchor`, `offset-position`                              | discrete     | motion                             |
| `transform-style`, `backface-visibility`                        | discrete     | motion                             |
| `display`, `visibility`, `content-visibility`                   | discrete     | motion                             |
| `perspective`                                                   | interpolates | a transform composition part       |
| `perspective-origin`                                            | interpolates | named in the keyframe/property map |

Two corrections, from the follow-up surface audit (`surface-audit.md`): the two `perspective` rows name where
the _string_ appears, not that the property is reachable. `--jumi-perspective` is a part of the `transform`
value — the `perspective()` **function** — and neither `animate-perspective-*` nor
`animate-perspective-origin-*` emits anything, so the `perspective` **property** is not animatable through
Jumi at all. And `will-change` is not credited to Jumi anywhere: `will-change-[transform]` emits
byte-identically with and without the plugin, so the host owns it and Jumi registers nothing for it.

### Covered as controls

`animation-composition`, `animation-timeline`, `animation-range`, `animation-range-start`,
`animation-range-end`, `animation-delay`, `animation-duration`, `animation-timing-function`,
`animation-iteration-count`, `animation-direction`, `animation-fill-mode`, `animation-play-state`,
`transition-property`, `transition-duration`, `transition-delay`, `transition-timing-function`,
`transition-behavior` — 17 controls, none of them animatable **as a property** (`does not interpolate` in
every row), which is exactly why they are controls and not motions.

### Covered elsewhere

| property                                        | browser  | owned by                                                                  |
| ----------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `view-transition-name`, `view-transition-class` | discrete | the view-transition pass, which writes the name onto the author's element |
| `interpolate-size`                              | discrete | the explicit utility, deliberately not the motion substrate               |
| `overlay`                                       | discrete | the author, next to `@starting-style` (see `entry-exit.md`)               |

## 3 · The gaps, each classified

Nine rows came back with no Jumi motion, no control, and no named pass. Seven of them are one cluster:

| property                                                          | browser              | classification                                                                                                          |
| ----------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `scroll-timeline-name`, `scroll-timeline-axis`, `scroll-timeline` | discrete             | **reachability, not a category**                                                                                        |
| `view-timeline-name`, `view-timeline-axis`, `view-timeline`       | discrete             | **reachability, not a category**                                                                                        |
| `timeline-scope`                                                  | discrete             | **reachability, not a category**                                                                                        |
| `view-transition-group`                                           | discrete             | a capture knob on a covered feature, newer than the feature itself                                                      |
| `scroll-behavior`                                                 | does not interpolate | not motion — a scrolling mode                                                                                           |
| `scroll-snap-type`                                                | discrete             | not motion — snapping positions                                                                                         |
| `will-change`                                                     | does not interpolate | an optimisation hint, and Tailwind already provides it — Jumi registers nothing for it (measured in `surface-audit.md`) |
| `transform-box`                                                   | discrete             | a coordinate-space switch, not motion                                                                                   |

Why the timeline cluster is _reachability_ rather than a category: Jumi covers the **consumer** side of
scroll-driven animation (`animation-timeline`, `animation-range`, `view-timeline-inset`) and the platform's
other half is the **declaration** side, which the author writes on the scroller — a different element from the
one being animated. That is what makes a _named_ timeline different from the anonymous `scroll()`/`view()`
Jumi already writes: it lets one scroller drive elements that are not its descendants, and lets several
elements share one timeline. It is two declarations plus a reference, not a new mechanism — and it is the one
place where a Jumi spelling would be ergonomics rather than capability.

## 4 · What this means for 1.0

The motion family is closed as a family: keyframes, transitions, view transitions, scroll-driven, motion
paths, entry/exit discrete state, intrinsic/layout interpolation — all reachable, all measured, none of them
waiting on an invention. What remains is the shape of hardening rather than expansion:

- the named-timeline declarations, as documentation first and a utility only if authors need the shorthand;
- the two newer knobs (`view-transition-group`) tracked rather than adopted;
- `perspective` reachable as a transform part but not under its own `animate-perspective-…` spelling — a
  spelling question worth one deliberate check, since `animate-transform-origin` exists but
  `animate-perspective-origin` does not.

## Instrument notes

Five readings were wrong before they were right, and every one of them was wrong in the direction of a false
_gap_ — which is the worse direction, because it invites work:

- **A gap from probing one spelling.** `view-transition-name` reported as uncovered because the probe tried
  `animate-view-transition-name-[card]`; the property is written by the view-transition pass, under a variant.
  One spelling per property cannot answer a question about a library with more than one registration route.
- **The host's utility credited to Jumi.** `will-change-[transform]` emits in a host-only build. Fixed by
  building every candidate twice, with and without the plugin.
- **The property catalogue crediting everything.** `src/types/index.ts` lists every animatable property, so a
  mention there is a statement that the property is _modelled_, never that it is exposed. Catalogue files are
  now reported as `modelled only` instead of being counted as coverage.
- **A value credited as a property owner.** `overlay` came back owned by `theme/mix-blend-mode` — the word
  appears there as a blend-mode _value_. Ownership is now decided by the string form of the property name in a
  non-catalogue file, and even then read as "named by", not "handled by".
- **The composition parts detector reading an empty build.** Counting the parts from a stylesheet with no
  candidates found none, which is the correct answer to the wrong question. It was removed rather than fixed:
  the coverage ladder does not need it, and a measurement that reports zero for a reason the reader cannot see
  is worse than no measurement.
