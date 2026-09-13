# View transitions

*RESEARCH — platform capability, measured. Not a workstream, and not filed.*

This is the first pass over the View Transition API: what the browser gives us, what Jumi's
existing animation model does with it, and what that implies for emission. It designs no syntax, it
changes no behaviour in `src/`, and it deliberately keeps same-document lifecycle orchestration out
of scope — `document.startViewTransition()` is a platform requirement, not an animation concern.

Everything below is a measurement against the finalized stylesheet in
`scripts/css-snapshot/snapshot.css`, in Chromium 153.0.8010.12, on 2026-09-13. Probe ids refer to
the report `pnpm spike:view-transitions` prints.

## Summary

Jumi does not need a new animation model for view transitions, and it cannot have one built out of
variants either. The two facts are separate and both are measured:

**The composition is selector-agnostic.** The two rules a build emits — the substrate that declares
the slot variables and the `--jumi-animation-*` defaults, and the aggregate that writes the
`animation-*` longhand lists — work unchanged when they are replayed under
`::view-transition-old(name)` / `::view-transition-new(name)`. The slot resolves, the 33-entry
longhand list resolves, the registered keyframes run, and the per-slot controls compose exactly as
they do on an element. It holds in a cross-document transition too, with no JavaScript in either
page. (P3b, P13)

**The composition cannot be reached from the source element.** The generated pseudo tree is attached
to the root element, not to the named element, and Jumi's slot variables are registered
`inherits: false` — the same registration that stops an ancestor's activation reaching an animating
descendant. So an element that carries `view-transition-name: hero` and `animate-fade-in` resolves
`--jumi-fade-in-animation-name` to `jumi-fade-in` on itself and to *nothing* on
`::view-transition-new(hero)`, which animates with the UA default. (P3a, P4)

Together those falsify the cheapest answer. "Only utilities for native View Transition CSS" (A) is
not enough, because no utility can put a *slot activation* on the pseudo tree — and no *variant* can
either, since a variant rewrites the selector of the element that carries the class, and
`::view-transition-old(hero)` is a different selector root whose name comes from the element rather
than from the utility. But the core model needs no change (C is falsified too): what is missing is
an *emission* step, not a composition adapter. See the recommendation.

## The boundary

```text
Jumi owns          CSS animation semantics on the view-transition pseudo-elements

Browser owns       snapshotting, old/new visual lifetime, the transition's duration,
                   the group's travel, cross-document orchestration

Application owns   the same-document DOM mutation and startViewTransition()
```

Nothing measured here pushes on that division, and each row of it is what makes the next section
possible: because the browser owns the lifetime, Jumi only ever has to answer "what animation does
this pseudo run".

## What the browser builds

A transition that moves one named element produces this tree, and `document.getAnimations()` names
the animation the UA put on each level (P1):

| Pseudo | UA animation | Notes |
| --- | --- | --- |
| `::view-transition` | — | the tree's root, a pseudo of the document root element |
| `::view-transition-group(root)` | `-ua-view-transition-group-anim-root` | geometry |
| `::view-transition-image-pair(root)` | — | |
| `::view-transition-old(root)` | `-ua-view-transition-fade-out`, `-ua-mix-blend-mode-plus-lighter` | the outgoing snapshot |
| `::view-transition-new(root)` | `-ua-view-transition-fade-in`, `-ua-mix-blend-mode-plus-lighter` | the incoming snapshot |
| `::view-transition-group(hero)` | `-ua-view-transition-group-anim-hero` | shared element geometry |
| `::view-transition-image-pair(hero)` | — | |
| `::view-transition-old(hero)` | `-ua-view-transition-fade-out`, `-ua-mix-blend-mode-plus-lighter` | |
| `::view-transition-new(hero)` | `-ua-view-transition-fade-in`, `-ua-mix-blend-mode-plus-lighter` | |

`root` always participates, whether or not anything is named. Author animations replace the UA ones
by name — an author `animation` on `::view-transition-old(hero)` and on
`::view-transition-image-pair(hero)` both take effect and interpolate (P2). The two UA animations
worth noticing are the ones that are *not* replaced by accident: the group's geometry animation, and
the `-ua-mix-blend-mode-plus-lighter` pair on old/new that composites the cross-fade.

## Retargeting the emitted composition

P3b takes the substrate rule and the aggregate rule out of the live stylesheet by their shape —
`--jumi-animation-name: none` for one, `animation-name: var(--jumi-…, var(--jumi-animation-name))`
for the other — and replays them verbatim under a pseudo selector, adding nothing but a slot
activation and a duration:

```css
::view-transition-old(hero), ::view-transition-new(hero) {
  /* the emitted substrate, verbatim */
  /* the emitted aggregate, verbatim — 33 slots, 26 KB */
  --jumi-animation-duration: 3000ms;
}
::view-transition-old(hero) {
  --jumi-fade-in-animation-name: jumi-fade-in;
  --jumi-fade-in-animation-direction: reverse;
}
::view-transition-new(hero) { --jumi-fade-in-animation-name: jumi-fade-in; }
```

Measured: both pseudos compute a 33-entry `animation-name` list whose only live entry is
`jumi-fade-in`; `getAnimations()` reports `::view-transition-new(hero) → jumi-fade-in` and
`::view-transition-old(hero) → jumi-fade-in`; and seeking to `t = 0` puts the old side at
`opacity: 1` and the new side at `opacity: 0`, because the direction control landed on the old
side's slot. An entrance becomes an exit through the same per-slot vocabulary an element uses.

Two consequences follow.

**The aggregate is reusable as-is.** Nothing about it is element-specific. The 33-slot list is the
same text on a pseudo-element as on a `<div>`.

**The activation has to be written on the pseudo.** Which is not a stylistic preference: P3a and P4
establish that there is no other place it *could* be written from.

## Reach: why the source element can never carry it

P3a mounts `#hero` with `class="tile animate-fade-in"` and a transition that moves it. With no
view-transition CSS of the harness's own, the measurement splits cleanly:

| | `--jumi-fade-in-animation-name` | `animation-name` |
| --- | --- | --- |
| `#hero` (the source element) | `jumi-fade-in` | 33 entries, one of them `jumi-fade-in` |
| `::view-transition-new(hero)` | *nothing* | the UA's two animations |

One rule in the document matches `#hero` and sets `animation-name`, and it is the aggregate. The
pseudo is not a descendant of the element and never sees it.

P4 isolates the mechanism, and it is worth being precise about, because the intuitive explanation is
wrong in one direction and useful in the other. The pseudo tree *does* inherit from the root element.
Set on `:root`, all four of these arrive unchanged on `::view-transition`, on
`::view-transition-group(root)` and on the named old/new pseudos:

| Set on `:root` | On the pseudo |
| --- | --- |
| `--jumi-animation-duration: 700ms` | `700ms` |
| `--jumi-animation-name: probe-global` | `probe-global` |
| `--not-registered-probe: reached` | `reached` |
| `--jumi-fade-in-animation-name: jumi-fade-in` | *nothing* |

Only the slot activation is missing, because it is registered `inherits: false`. So the obstacle is
not the pseudo tree's detachment from the document — it is the same invariant that keeps an
ancestor's activation from leaking into an animating descendant, applied to a tree the author does
not think of as a descendant.

That registration is not a defect to fix. `inherits: false` on a slot activation is what makes
`animate-fade-in` mean "this element" rather than "this element and its subtree", and the behaviour
harness asserts it. It simply also settles this question.

Two consequences, and they pull in opposite directions:

- **The global controls are a free win.** `--jumi-animation-duration` and its siblings reach the
  pseudo tree from `:root`, so a page-wide timing or easing override already applies to transition
  animations with nothing extra emitted.
- **The activation is not.** *Which* animation a side runs has to be written on the selector that
  matches the pseudo. That single sentence is the whole reason this needs an emission step.

## The emission consequence

No variant can express a view transition, and the reason is structural rather than a limitation of
the variant API.

```text
a variant starts from            this element → rewrite its selector

a view transition needs          source element declares "hero"
                                        ↓
                                 the browser builds a separate pseudo tree keyed by "hero"
                                        ↓
                                 animations target ::view-transition-old(hero)
```

The variant's own selector would have to become `::view-transition-old(hero)` — abandoning the
element it started from — and it would still have to learn `hero`, which exists only as a
`view-transition-name` declaration, possibly an arbitrary one, possibly set inline. A variant can
only ever *add* a class to the source element's selector; this needs the opposite.

So the emission belongs where Jumi already does post-candidate work: the finalizer, which runs after
every candidate is known and already rewrites rules the aggregate depends on. That is also the only
place the name set is knowable. This note stops at the constraint and does not propose a syntax.

## Rules that cannot be merged

**A view-transition selector must never be added to the utility rule.** An unrecognised selector in a
comma-separated list invalidates the entire rule, so a browser without view transitions would lose
the animation along with the transition. Measured with a deliberately bogus pseudo, which is the
same case an unsupported browser presents (P8):

```css
#plain, ::definitely-not-a-pseudo-element { --probe-merged: yes; }   /* dropped whole */
#hero { --probe-alone: yes; }                                        /* survives */
```

`getComputedStyle(#plain).getPropertyValue('--probe-merged')` is empty; `--probe-alone` is `yes`.
`CSS.supports('selector(::view-transition-old(root))')` is `true` here and
`CSS.supports('selector(::definitely-not-a-pseudo-element)')` is `false`, so `@supports selector(…)`
is a working guard — and emitted view-transition rules have to be their own rules regardless.

**Never aim at `::view-transition-group(name)`.** That pseudo carries the shared element's travel
between its old box and its new one, and it is the *only* thing that makes a shared element move.
Replacing its `animation-name` replaces the travel. Measured cross-document on the same pair of
pages, one navigation each (P11, P12):

| `::view-transition-group(hero)` | transform at ready | mid | late |
| --- | --- | --- | --- |
| untouched | `matrix(1,0,0,1,24,24)` | `matrix(1,0,0,1,253,85)` | `matrix(1,0,0,1,264,88)` |
| author `animation` | `matrix(1,0,0,1,0,0)` | `matrix(1.24,0,0,1.24,0,0)` | `matrix(1.57,0,0,1.57,0,0)` |

The second row still animates, and it no longer goes anywhere. A composition aimed at the group is
not additive; it is a replacement of the mechanism.

## Capability matrix

| Question | Verdict | Probes |
| --- | --- | --- |
| Does the existing Jumi composition run on the pseudos unchanged | yes | P3b |
| Do per-slot controls compose there as on an element | yes — duration, and direction turning an entrance into an exit | P3b |
| Can a value declared on the *source element* reach the pseudo | no — the tree hangs off the root, not off the element | P3a |
| Can a value declared on `:root` reach the pseudo | yes for plain and global variables; no for the `inherits: false` slot activations | P4 |
| Could a variant express it | no — structural, not an API gap | P3a |
| Can two named groups run different Jumi effects at once | yes | P5 |
| Do arbitrary names survive into the pseudo selector | yes — `hero-tile`, `my-card-2`, four pseudos each | P6b |
| Does `view-transition-class` let one rule reach several names | yes, via `::view-transition-group(*.class)` | P6 |
| Does the bare `.class` spelling also match | yes in Chromium 153; `CSS.supports` accepts both | P6 |
| Do author animations replace the UA defaults at every level | yes — old, new, group, image-pair | P2 |
| Cross-document, no JavaScript | yes, with `@view-transition { navigation: auto; }` on both documents | P11 |
| Cross-document with the retargeted Jumi composition | yes | P13 |
| Cross-document `types` without JavaScript | yes — `:active-view-transition-type()` matches on the root | P14 |
| Old side without a new side, and the reverse | the missing side is not built; the present one animates normally | P9 |
| Duplicate `view-transition-name` | aborts the transition, with a console error | P7 |
| Overriding `::view-transition-group(name)` | destroys the shared-element travel | P12 |
| Does the platform clamp for `prefers-reduced-motion` | no — the UA animations run regardless | P10 |
| Merging a VT selector into a utility rule | invalidates the whole rule | P8 |

## Cross-document, in full

The purest test of the idea, because there is no JavaScript animation layer anywhere: two
same-origin pages, each with `@view-transition { navigation: auto; }`, a `hero` element at a
different position in each, and a link between them.

With only hand-written keyframes (P11), the incoming document observes six animations at `ready`:
the two group geometry animations plus author `lab-out` / `lab-in` on the root snapshots and
`lab-hero-out` / `lab-hero-in` on the hero snapshots. The author keyframes replaced the UA defaults
on every level, with nothing running but CSS.

With the retargeted Jumi composition instead (P13), the same navigation reports
`::view-transition-old(root) → jumi-fade-in` and `::view-transition-new(root) → jumi-fade-in` — the
old side running the 33-entry aggregate list with the fade-in slot reversed — plus
`jumi-bounce-in` on both hero snapshots, while `::view-transition-group(hero)` keeps its UA travel.
A shared-element transition expressed entirely in Jumi's vocabulary, in two static pages.

Types work without JavaScript too (P14): with `types: slide;` in the at-rule,
`:active-view-transition-type(slide)` matches the root for the whole transition, and a rule written
as `html:active-view-transition-type(slide)::view-transition-new(root) { animation-name: vt-slide }`
takes effect in the destination document (`::view-transition-new(root) → vt-slide`). That is enough
to express forward/back or modal/page distinctions in an MPA with no script at all.

## Not measured

Recorded so the gaps are not mistaken for results.

- **Only Chromium.** Everything here is one engine. Firefox and Safari are unmeasured; the fallback
  argument rests on P8 (an unsupported selector drops its own rule and nothing else), not on a
  second engine.
- **Which document styles which side.** Both fixture pages link identical sheets, so the split
  between "the outgoing document styles the old snapshot" and "the incoming document styles the new
  one" is untested.
- **The `-ua-mix-blend-mode-plus-lighter` pair.** Author animations on old/new replace it, as P3b
  shows (`ua: []`). Whether losing it changes the cross-fade's appearance is unmeasured.
- **`view-transition-name: none`**, the `ViewTransition` JS object, `pageswap`, and
  `view-transition-name` on `:root` are untouched.
- **A variant that *observes* names** was reasoned from P3a, not built.

## Measurement notes

Four things cost time and are worth not rediscovering.

- **`getComputedStyle(el, pseudo)` is not an existence test.** It returns a usable declaration for a
  view-transition pseudo-element the browser never built — a `::view-transition-new(card)` with no
  `card` element still reports `animation-name: none`, `opacity: 1`. The only trustworthy evidence
  that a pseudo exists is that it appears in `document.getAnimations()`.
- **A CDP-driven navigation does not start a cross-document transition.** `page.goto()` produces a
  `pageswap`/`pagereveal` pair with no transition; a link click on the same pair produces one, and
  the same click with the at-rule removed produces nothing. The at-rule is the opt-in; the
  navigation source is what differed.
- **Seek, don't watch.** Pausing each pseudo animation and setting `currentTime` gives exact samples
  and survives a backgrounded page, where animation ticking freezes.
- **Declared `animation-name` lists need a depth-aware split.** Commas inside `var(…, …)` fallbacks
  roughly double a naive `split(',')`, which is how a 33-slot aggregate reads as 66.

## Recommendation

**B, narrowly — and not C.** A stays as the default for everything except the one thing P3a
falsifies.

- **A** for `view-transition-name` and `view-transition-class`: both are ordinary declarations on
  the element, they take arbitrary names (P6b), and a utility that sets them is all that is needed.
- **B** for the composition on `::view-transition-old(name)` / `::view-transition-new(name)`: not a
  new composition adapter — the existing composition is reused verbatim, which is the whole point of
  P3b and P13 — but a new *emission* step, in the finalizer, where the candidate set is closed and
  the names are knowable, emitting its own rules guarded by `@supports selector(…)`.
- **C** is falsified. Nothing in the core model needed to change for any measurement here to work,
  including cross-document with no JavaScript.

Two constraints the emission has to respect, both of them above: never merge a view-transition
selector into the utility rule (P8), and never target `::view-transition-group(name)` (P12).

The reason to want this at all is the cross-document result. Same-document transitions are already
reachable from application code; P11 and P13 are the case where a composition model earns its keep,
because there is no code to write the animation in.

## Reproducing

```bash
pnpm spike:view-transitions
```

The harness serves `scripts/spike-view-transitions/` over `http://127.0.0.1` — a cross-document
transition needs a same-origin navigation, which `file://` cannot provide — and prints one JSON
block per probe. The fixtures link the committed snapshot rather than a fresh build, so the
substrate, aggregate, registrations and keyframes under test are the ones that ship.
