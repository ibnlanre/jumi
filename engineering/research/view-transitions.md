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

**The composition is selector-agnostic.** The rules a build emits — the substrate that declares the
slot variables and the `--jumi-animation-*` defaults, the aggregate that carries the `animation`
shorthand, and the activation rule that publishes `--jumi-slot-<slot>` — work unchanged when they are
replayed under `::view-transition-old(name)` / `::view-transition-new(name)`. The slot resolves, the
33-entry list resolves, the registered keyframes run, and the per-slot controls compose exactly as
they do on an element. It holds in a cross-document transition too, with no JavaScript in either
page. (P3b, P13)

**All three of those rules are needed, and that is new since pass one.** The hoist moved the slot
publication onto the rule that declares the activation, which is a utility selector a pseudo never
matches. Replaying the substrate and the aggregate alone leaves every position falling back to `none`
— the composition applies and nothing animates. Emission is therefore per-slot, not only
per-composition.

**The composition cannot be reached from the source element.** The generated pseudo tree is attached
to the root element, not to the named element, and Jumi's slot variables are registered
`inherits: false` — the same registration that stops an ancestor's activation reaching an animating
descendant. So an element that carries `view-transition-name: hero` and `animate-fade-in` resolves
`--jumi-fade-in-animation-name` to `jumi-fade-in` on itself and to *nothing* on
`::view-transition-new(hero)`, which animates with the UA default. (P3a, P4)

**The incoming document governs, and the group stays the browser's.** Cross-document, the destination
document's stylesheet governs the whole pseudo tree and the outgoing document's contribute nothing, so
one side is enough (P18). An author animation on `::view-transition-group(name)` replaces the shared
element's travel rather than adding to it (P12), so the group is out of scope by default.

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

> ### ⚠️ Superseded by pass two — read this before implementing from the code below
>
> **The two-rule model in this section is wrong as of the hoisted representation, and the CSS below is
> the pre-hoist form.** It is kept because the finding it records (the composition is
> selector-agnostic) still stands and the history is useful — but the *mechanics* it shows will produce
> an emitter that silently animates nothing.
>
> The retarget needs **three pieces**, not two, because the hoist moved the slot publication onto the
> rule that declares the activation:
>
> | | then | now |
> | --- | --- | --- |
> | 1 | substrate | substrate — unchanged |
> | 2 | aggregate, declaring ten `animation-*` longhands | aggregate, declaring the `animation` shorthand — **no `animation-name` declaration at all** |
> | 3 | — | **the activation rule's whole body**, because `--jumi-slot-<slot>` lives there |
>
> Declaring `--jumi-fade-in-animation-name` directly on the pseudo, as this section does, is exactly
> the incomplete form: the composition's `var(--jumi-slot-fade-in, none)` falls back to `none`, the
> composition applies, a 33-entry list resolves, and nothing animates. See *"The consequence that
> matters: the publication has to be re-materialized too"* in pass two for the measured form, and the
> recommendation for the shape the finalizer should emit.

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

**The aggregate is reusable as-is.** Nothing about it is element-specific. The list is the same text on
a pseudo-element as on a `<div>` — true of the hoisted form too, which pass two re-measured. What is
*not* reusable as-is is the *activation*: since the hoist, the slot publication has to travel with it.

**The activation has to be written on the pseudo.** Which is not a stylistic preference: P3a and P4
establish that there is no other place it *could* be written from — and pass two established that "the
activation" now means the activation rule's whole body, publication included.

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

## Pass two: the two unknowns, and what the hoist changed underneath them

This pass closed the two questions pass one left open, and found that the representation change in
between had invalidated the instrument. Everything below is Chromium 153.0.8010.12, 2026-09-13.

### First, a correction: this spike was measuring nothing

The hoist landed between the passes. The spike's composition extractor looked for a rule declaring
`animation-name: var(--jumi-…)`, and the hoisted composition declares `animation` — so it returned
`null`, the retarget replayed the literal string `null`, and `P3b` (the probe the whole recommendation
rests on) reported a pseudo running the browser's own animations while looking green. The extractor is
now structural, matching the same predicate `scripts/lib/css.mjs` uses: the shorthand, the two
longhands it resets, in that order, and a `var(--jumi-slot-` reference. It reads the **file** with
postcss rather than reading the rule back out of the page, because a shorthand carrying `var()` cannot
be expanded into longhands and CSSOM therefore reports it as the empty string.

### The consequence that matters: the publication has to be re-materialized too

Replaying the substrate and the aggregate onto a pseudo is **no longer sufficient**. The composition
reads `--jumi-slot-<slot>`, and the hoist moved that publication onto the rule that declares the
*activation* — a utility selector a pseudo-element never matches. Without it every position falls back
to `none`: the composition applies, the pseudo resolves a 33-entry list, and **nothing animates**
(`P3b` measured exactly that, as three variants of `P19` with byte-identical output before it was
fixed).

So a retarget needs three things, not two, and this is the emission requirement pass one did not know
about:

```css
::view-transition-old(hero), ::view-transition-new(hero) {
  /* 1. the substrate: the `--jumi-animation-*` defaults — 79 declarations, 4,555 bytes */
  /* 2. the aggregate: the `animation` shorthand plus the two it resets — 6,599 bytes */
  --jumi-animation-duration: 3000ms;
}
::view-transition-old(hero) {
  /* 3. the activation rule's *whole body*, which is where the slot publication now lives */
  --jumi-fade-in-animation-name: jumi-fade-in;
  --jumi-slot-fade-in: var(--jumi-fade-in-animation-name, var(--jumi-animation-name)) …;
}
```

Measured with all three (`P3b`): `::view-transition-new(hero) → jumi-fade-in`, a 33-entry list, and
the duration control landing — the same result pass one reported, now on the shipped representation.

### Which document styles which side (P18)

Answered, and the answer is the favourable one: **the incoming document governs the whole pseudo tree;
the outgoing document's styles contribute nothing.** Two runs, each with the two documents linking
*different* stylesheets, so the answer cannot be an artefact of which file happens to hold which
markers:

| destination links | `:root` markers | pseudo markers (group, image-pair, old, new) |
| --- | --- | --- |
| `/own-to.css` | `from: "", to: yes` | `--probe-to-old`, `-new`, `-pair`, `-group` |
| `/own-from.css` | `from: yes, to: ""` | `--probe-from-old`, `-new`, `-pair`, `-group` |

The markers follow the sheet the **destination linked**, and the outgoing sheet's markers appear
nowhere. A third signal from the same rule confirms it is the cascade and not a readback quirk: a
keyframe reading `var(--probe-<side>-varvalue, 1)` resolves the computed `opacity` to the declared
`0.25` rather than the fallback `1`, in both runs.

**So one side is enough.** Jumi can promise symmetric old/new styling from the destination document
alone — which is the case that matters, because the outgoing document is gone by the time the
transition runs and has no chance to be styled by the new document's build.

Three things cost time here, and all three produced a confident wrong answer first:

- **A control is not optional.** "No marker reached the pseudo tree" and "a marker cannot be read
  back" are the same observation until the second is measured separately. The probe now declares the
  same kind of marker in a document known to apply and reads it back with the same call, and
  `conclusive` is defined by *that* rather than by any marker turning up.
- **A field dropped from a mapping is invisible downstream.** The recorder captured `pseudos`; the
  per-entry projection carried three of its members and not the object itself, so every marker map
  came back empty for three consecutive runs while the field that *was* carried said otherwise.
- **The outgoing document's sheet being empty is the finding, not a failure.** It is also why the
  cross-document fixture stays JavaScript-free: nothing on the outgoing side needs to run.

### The cross-fade the UA was doing (P19)

The UA runs `-ua-mix-blend-mode-plus-lighter` on both snapshots so that two half-transparent layers
composite additively. An author `animation` **replaces** that UA animation, and the computed
`mix-blend-mode` then falls back to **`normal`** — measured both same-document (`P19`) and
cross-document (`P18`'s root old pseudo reads `normal` in both runs).

That is not cosmetic. With the two variants held at **identical opacities and the same seek time**,
differing in exactly one property, the composited pixel differs:

| variant | `mix-blend-mode` | opacities (old/new) | tile pixel | backdrop pixel |
| --- | --- | --- | --- | --- |
| composition, no blend declared | `normal` | 0.802 / 0.802 | `226, 187, 207` | `0, 255, 0` |
| composition + `plus-lighter` | `plus-lighter` | 0.802 / 0.802 | `251, 213, 255` | `0, 255, 0` |
| UA default cross-fade | `plus-lighter` | 0.198 / 0.802 | `233, 185, 216` | `0, 255, 0` |

The backdrop is pure green and reads `0, 255, 0` in every frame, which is the sampler's own control.
The A/B is exact — same timeline, same resolved opacities, one declaration different — so **the blend
mode is load-bearing for what the user sees.**

**What this does not establish, and it is the distinction that matters:** that the `normal` variant
looks *worse*. The tile reading is not a clean two-colour composite in either variant — the pixel sits
at an entirely different point in the first table's green channel than the tile colours can explain —
because three levels composite here (hero old/new over the root snapshots over the page) and
decomposing that needs a model of the stack, not a sample. What is measured is that the composite
**changes**; whether it degrades is a post-deploy visual check.

One number that bears on the risk, derived from the measured opacities and stated as derived:
backdrop visibility under `normal` compositing is $(1-o_{old})(1-o_{new})$ — **0.039** for the Jumi
composition at its midpoint against **0.159** for the UA's own cross-fade at its. The Jumi-shaped
cross-fade sits *less* transparent than the browser's default does, by about 4×.

### The group stays browser-owned (P12, restated as a rule)

Measured in pass one and unchanged: an author `animation` on `::view-transition-group(name)` replaces
the UA geometry animation, and the shared element stops travelling — it only scales in place. A
composition aimed at the group is not additive, it is a replacement of the mechanism. **Jumi must
never animate `::view-transition-group(name)` unless the user explicitly opts into replacing the
browser's spatial interpolation.**

### Reduced motion: which emitted shape actually stops it (P20)

The platform does not clamp (P10). With the *emitted* composition on old/new, three shapes, both
preferences:

| preference | shape | ran | resolved list |
| --- | --- | --- | --- |
| `no-preference` | bare / wrapped / clamped | yes | 33 entries, 1 live |
| `reduce` | bare — no media query | **yes** | 33 entries, 1 live |
| `reduce` | wrapped in `prefers-reduced-motion: no-preference` | **no** | 2 entries, the UA's two |
| `reduce` | clamped with `animation: none !important` | **no** | 1 entry, nothing |

So the emission rule is settled: **wrap the emitted old/new composition in
`@media (prefers-reduced-motion: no-preference)`.** It is transparent when motion is allowed, and under
`reduce` it leaves the browser's own cross-fade running — which is the correct degradation, since the
transition itself is not Jumi's to cancel. The `clamped` shape suppresses the append unconditionally
and would remove the browser's cross-fade along with Jumi's, which is more than Jumi owns.



## Capability matrix

| Question | Verdict | Probes |
| --- | --- | --- |
| Does the existing Jumi composition run on the pseudos unchanged | yes — with the hoist's publication replayed alongside it | P3b |
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
| Which emitted shape stops it under `reduce` | wrapping the old/new composition in `@media (prefers-reduced-motion: no-preference)`; it leaves the UA cross-fade running | P20 |
| Merging a VT selector into a utility rule | invalidates the whole rule | P8 |
| Which document styles the pseudo tree cross-document | the **incoming** one, entirely; the outgoing document's styles contribute nothing | P18 |
| Does an author `animation` on old/new preserve the UA's additive blend | no — it replaces `-ua-mix-blend-mode-plus-lighter` and `mix-blend-mode` falls back to `normal` | P19, P18 |
| Does the blend mode change the painted result | yes — with opacities and seek time held equal, one declaration moves the composited pixel | P19 |
| Does replacing it make the result visibly worse | **not established.** The composite changes; three levels stack here and decomposing it needs a model, not a sample | P19 |
| Must the hoist's slot publication be replayed on the pseudo | yes — without it the composition applies and nothing animates | P3b |

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
- **Whether dropping `plus-lighter` degrades the cross-fade visually.** The composite is measured to
  change (P19); that it looks worse is untested, and the derived backdrop visibility is *lower* for
  the Jumi-shaped cross-fade than for the UA's own.
- **`::view-transition-image-pair` as a target.** P2 and P18 show author rules reach it; no probe
  animates it on purpose, and the CTO's scope excludes it for now.
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

### Five that cost time in pass two

- **A shorthand carrying `var()` cannot be read back.** `rule.style.getPropertyValue('animation')`
  returns the empty string for exactly the declaration being looked for, and `cssText` omits it — so a
  page-side reader reports "no composition in the stylesheet" about a stylesheet whose composition is
  demonstrably running. Read the file.
- **Two joined blocks need a terminator.** Building a retarget by pasting declaration text together
  without a final `;` makes the first block's last declaration **absorb** the second's first: a custom
  property followed by `animation: …` parses as one custom property. The symptom was precise —
  `animation-composition` and `animation-timeline` applied, the `animation` shorthand vanished, and the
  edge silently fell back to the UA cross-fade.
- **A field dropped from a projection is invisible downstream.** The recorder captured `pseudos`; the
  per-entry projection carried three of its members and not the object, so every marker map read empty
  for three runs while the field that *was* carried said the opposite.
- **Observability differs between a variable and a standard property.** A custom property declared on
  a pseudo rule reads straight back; so does a variable consumed by keyframes and observed through
  `opacity`. Prefer the second — it is the cascade being measured, not CSSOM's bookkeeping.
- **Backticks inside a CSS comment inside a template literal end the template.** It looks like a
  comment to a CSS reader and like a syntax error to the JS one, three separate times.

## Pass three: the syntax spike

`scripts/spike-vt-syntax.mjs` — not a proposal, a measurement of which spelling the host will actually
resolve. Two constraints were settled before it ran, and both are load-bearing:

1. **The modifier slot is already occupied.** Jumi reads `/word` two ways today: `/rotate` addresses a
   *property*, `/[flick]` addresses a *labelled slot*. Any grammar that spells a side `/<side>` is
   proposing a third meaning for the same slot.
2. **A relationship between two classes cannot be inferred from co-location.** The finalizer sees a flat
   candidate universe, not elements — so `view-transition-old/[flick]` on its own cannot know *which*
   `flick`. The association has to be inside the candidate that names the side.

That leaves a reference of the form `view-transition-old/[<identity>:<label>]`, and the question is
whether such a reference resolves to the intended slots after compilation.

### The grammar, measured

| finding | measurement |
| --- | --- |
| The payload arrives in the **modifier**, not the value | `view-transition-old/[hero:flick]` → utility `view-transition-old`, value = default, **modifier** = `hero:flick`; brackets stripped |
| A candidate **cannot carry two `/` segments** | `view-transition-old/hero/[flick]` is **dropped by the host** — no row, no warning |
| `view-transition/hero` emits **exactly** the native declaration | `view-transition-name: hero`, and nothing else |

So `side/<identity>:<label>` inside one bracketed modifier is the only spelling that reaches a matcher,
and a side utility reads its reference from the modifier — the same slot `view-transition/hero` uses for
the identity.

### The resolution, measured

Read out of the emitted stylesheet: a label is recorded as `--jumi-<slot>-label: <label>`, so a
reference resolves to *every* slot carrying that label.

| case | resolved | slots |
| --- | --- | --- |
| one label, one slot | ✓ | `flick → [rotate-Z2excak]` |
| **shared label across two motions** | ✓ | `enter → [opacity-Z2p4Ykg, rotate-Z2excak]` |
| two identities on one page | ✓ | `hero:flick → [rotate-Z2excak]`, `card:return → [rotate-1CgNAd]` |
| arbitrary hyphenated identity | ✓ | `my-card-2:return → [rotate-1CgNAd]` |
| unqualified `[flick]`, no identity | resolves | but carries no identity, so it is ambiguous the moment two motions share a label |
| one-sided, or identity only | n/a | nothing is emitted for the other side — the browser's cross-fade stands |

**A label is therefore a motion group, not an alias** — and that needed no new machinery. Two motions
sharing `[enter]` both record it, and a single reference reaches both. Whether that is *desirable* is a
design decision, not a technical one: the code's own comment on the mechanism says "a label names ONE
animation, on the element that declared it". The data supports both readings, so a group reading would
be a deliberate widening of what a label means rather than a discovery.

### The blocking finding: a label is phrase-only

**`animate-fade-in/[enter]` records no label at all.** Neither does a single-value tween such as
`animate-rotate-45/[flick]`.

That is not a parser result — the candidate *does* parse and the modifier *does* arrive. It is where the
label is written: `src/core/index.ts` sets `labels` **inside the phrase branch**, so only a multi-frame
tween (`0:…|50:…|100:…`) records one. And the effect matcher, `'animate'`, ignores its second argument
entirely, so an effect cannot record one even in principle.

| motion | labelled? | why |
| --- | --- | --- |
| `animate-rotate-[0:0deg\|50:90deg]/[flick]` | **yes** | phrase branch |
| `animate-rotate-45/[flick]` | no | single value — takes the other path |
| `animate-fade-in/[enter]` | no | the `'animate'` matcher never reads the modifier |

So the shape the design discussion settled on —

```html
class="view-transition/hero animate-fade-in/[enter] view-transition-new/[hero:enter]"
```

— **parses, and resolves to nothing.** Three ways out, and choosing between them is the next decision
rather than a measurement:

1. **Extend labels to effects and single-value tweens.** Smallest conceptual change, and it makes the
   reference vocabulary uniform; it is a change to `src`, so it is a real widening of what a label means.
2. **Let the reference name an effect directly** — `view-transition-new/[hero:fade-in]`. An effect does
   record `--jumi-fade-in-animation-name`, so a resolver can reach it. This costs the single-vocabulary
   property: labels and effect names would be two namespaces behind one syntax.
3. **Require a phrase for anything a transition animates.** Honest and zero change, but it means
   `animate-fade-in` — the most natural thing to write in a page transition — is unavailable.

Nothing else in the measured picture is blocked. The identity, the reference grammar, the per-identity
isolation, the arbitrary names and the one-sided case all work.

### The single-candidate proposal

The next shape proposed was one candidate carrying all three facts:

```html
view-transition-old/hero:animate-fade-out  view-transition-new/hero:animate-fade-in
```

**It is refused by the host.** Both candidates are dropped and nothing is emitted, because a `:`
cannot appear unquoted in a modifier — it is the variant separator, and the parser will not use it
as a word. Bracketed, the same payload survives untouched:

```html
view-transition-old/[hero:animate-fade-out]
```

So the spelling is available, and it is the *reference* semantics that then decide between two models.
Two further facts, both measured:

**A reference does not create the motion.** `view-transition-old/[hero:animate-fade-out]` alone emits
nothing — `stem: MISS, label: MISS`, and the only variables in the output are the staging transport's.
A utility's name inside a modifier is a string, not a candidate. So the motion has to be written as its
own candidate as well, which makes the side utility a **reference** rather than a definition.

**The reference resolves in exactly one namespace, decided by its spelling:**

| reference | namespace | resolves when |
| --- | --- | --- |
| `[hero:animate-fade-out]` | the motion utility's own slot | the motion is also a candidate — `stem: hit` |
| `[hero:out]` | a label, `--jumi-<slot>-label` | the label was recorded — `label: hit [rotate-Z2excak]` |

### Why the label model *was* the one that held

> **Superseded by the variant model below.** Everything in this subsection is measured and still
> true, but it is no longer the recommendation: a variant parameterised by a modifier resolves
> everything the label model is blocked on, and removes the phrase-only limitation entirely. Read the
> next subsection before designing from this one. It is kept because the comparison is the argument —
> the variant model wins *because* of what is measured here.

Measured against the capability the design needs — *the same modifier form has to work for the side
assignment and for the existing controls*:

| spelling | side utility | motion | existing controls |
| --- | --- | --- | --- |
| `view-transition-old/hero:animate-fade-out` | **dropped** | — | — |
| `view-transition-old/[hero:animate-fade-out]` | parses | by slot stem | **`animation-duration-500/hero:out` is dropped** — a control cannot carry a `:` either |
| `view-transition-old/[hero:out]` | parses | by label | **already works**: `animation-duration-500/[out]` scopes to the same label the motion declared |

Only the label form gives one vocabulary for both. `animation-duration-500/[out]` and
`view-transition-old/[hero:out]` are the same modifier shape addressing the same recorded label, so a
control can be aimed at one side of one transition without any new control syntax — which the motion-name
form cannot do, since the control matchers exist already and will not accept a `:`.

**The blocker is unchanged and it is now clearly the pivotal decision.** Labels are recorded only in the
phrase branch of `src/core/index.ts`, so `animate-fade-out/[out]` — the natural way to label an effect —
records nothing, and the label model cannot reference an effect without a change to `src`. The
motion-name model sidesteps that, at the cost of losing the single vocabulary for controls.

### The variant model — and it dissolves the blocker

`view-transition-old/hero:animate-fade-out`, read the way Tailwind's own `group-hover/button:` is read:
a **variant parameterised by a modifier**, not a utility parameterised by a modifier.

**The earlier "dropped by the host" result was a different reading of the same string**, and that
distinction is the whole finding. As a *utility*, `view-transition-old` with modifier
`hero:animate-fade-out`, the candidate is refused — a `:` cannot appear unquoted in a utility modifier.
As a *variant*, nothing is refused, because the parser is doing something else entirely:
`matchVariant(name, cb)` matches `name-<value>/<modifier>`, so one registration named
`view-transition` splits the spelling into three parts.

```text
view-transition-old/hero:animate-fade-out
└──────┬──────────┘ └─┬┘ └────────┬────────┘
  variant name        value     the utility
   + value            (side)   — a real candidate
                  modifier
                  (identity)
```

Measured with a `matchVariant('view-transition', …)` registration:

| case | variant receives | motion instantiated | notes |
| --- | --- | --- | --- |
| `view-transition-old/hero:animate-fade-out`<br>`view-transition-new/hero:animate-fade-in` | `side=old identity=hero`<br>`side=new identity=hero` | **yes** — slots `fade-out`, `fade-in` | both sides, one self-contained candidate each |
| `view-transition-old/hero:animation-duration-500` | `side=old identity=hero` | yes | **a control scoped to a side with no label vocabulary at all** |
| `view-transition-old/hero:animate-rotate-[0:0deg\|20:-8deg\|100:-8deg]` | `side=old identity=hero` | yes — slot `rotate-Z2excak` | an arbitrary phrase works |
| `view-transition-old/my-card-2:animate-fade-out` | `side=old identity=my-card-2` | yes | arbitrary hyphenated identity |
| `hover:view-transition-old/hero:animate-fade-out` | `side=old identity=hero` | yes | stacks with a real selector variant |
| `motion-safe:view-transition-old/hero:animate-fade-out` | `side=old identity=hero` | yes | stacks with the motion preference |
| `view-transition-old:animate-fade-out` | `side=old identity=—` | yes | the identity is optional |

**Three things follow, and they are why this supersedes the label model:**

1. **The motion is a candidate, not a reference.** `animate-fade-out` after the `:` is an ordinary
   utility, so it is instantiated, and "a reference does not create the motion" stops being a problem
   because nothing is a reference any more.
2. **The phrase-only blocker is gone.** Nothing depends on a label, so it does not matter that labels
   are recorded only in the phrase branch — an effect, a single value and a phrase all work.
3. **Controls need no new vocabulary.** `view-transition-old/hero:animation-duration-500` is the same
   modifier shape as `group-hover/button:opacity-100`. There is no `:`-in-a-modifier problem because
   the identity is a *variant* modifier, which is exactly what `group-hover/button` already is.

**The callback is a marker, not selector rewriting** — which is the constraint the design set. It
returns a staging selector that matches nothing (`&:where(.jumi-vt-old-hero)`), so the wrapped utility
is emitted where the finalizer can collect and delete it rather than where a page would apply it. That
is the same staging idea the carrier protocol already uses.

**One implementation trap, measured.** Tailwind calls the callback **once at configuration time with a
sentinel `{ value: 'a', modifier: null }`, with no `view-transition-*` candidate in the source at all**
— and the `values` option does not filter that call. A marker that recorded unconditionally would put a
bogus `side=a` into every page's metadata, so the side has to be validated before anything is recorded.

**What this does not settle.** Whether the variant should return a staging selector or a real one is a
design choice with consequences for what the *element* runs — a real selector would put the motion on
the source element as well as the pseudo, which is not obviously wrong (the element is snapshotted and
hidden during the transition) but is a second effect of writing one class. And the `@supports` +
`no-preference` wrapper, the `plus-lighter` restoration and the three-rule emission all still apply
unchanged; this section only settles how the author *names* the three facts.

### The marker model, proven end to end from the emitted stylesheet

Decided: **staging only.** `view-transition-old/hero:animate-fade-out` means "animate the old `hero`
snapshot with `fade-out`" and nothing else — the source element exists outside a transition far more
often than the pseudo does, so it must not acquire an animation because somebody configured a future
snapshot. Measured shape:

```css
.view-transition-old\/hero\:animate-fade-out:where(.jumi-vt-old-hero) {
  --jumi-fade-out-animation-name: jumi-fade-out;
}
```

The trailing `:where(.jumi-vt-…)` matches no page, so the motion never reaches the element, and the
**author's own class is in the selector** — which is what makes the identity utility unnecessary.

**The finalizer recovers all three facts from the stylesheet**, not from the callback:

| recovered | from | example |
| --- | --- | --- |
| `side` | the marker class | `old` |
| `identity` | the marker class | `hero` |
| the **source selector** | everything before the marker | `.view-transition-old\/hero\:animate-fade-out` |
| the publication | the declarations | `--jumi-fade-out-animation-name` |

The source selector is what lets each candidate independently emit
`view-transition-name: hero` on its own class. Two candidates for one identity emit the same
declaration and simply agree, so `view-transition-old/hero:animate-fade-out` plus
`view-transition-new/hero:animate-fade-in` **is sufficient** — no carrier class, no identity utility,
no label indirection.

**Coverage, measured in one build each:** effects; a side-specific control
(`view-transition-old/hero:animation-duration-300` stages `--jumi-animation-duration: 300ms` under the
same marker, so the control needs no new vocabulary); an arbitrary phrase; two identities on one page;
and a one-sided transition, where only the one staged rule exists.

### The sentinel guard is structural, not a blacklist

Tailwind calls the callback once at configuration time with `{ value: 'a', modifier: null }` and no
candidate present. Blacklisting `'a'` would be relying on a host internal that can change, so the guard
is different: **the metadata lives in the selector the variant returns, not in anything the callback
records.** A configuration-time probe is attached to no candidate, so it emits no rule, so there is
nothing to read.

Measured: on a build with no `view-transition-*` candidate at all, the callback still fires with
`{ value: 'a' }`, and **zero** staged rules are recoverable from the CSS. Recording is impossible by
construction rather than by a filter that has to be kept current.

### Which stacked variants survive retargeting

Decided by the **shape of the emitted selector**, not by a list of variant names — so it holds for
variants Tailwind adds later. Strip the marker, and:

- **Transferable** — the remainder is exactly one class selector, every `:` escaped. The variant's own
  meaning is an at-rule, which can be carried onto the pseudo rule unchanged.
- **Not transferable** — the remainder carries unescaped compound selector text or a relational
  `:is(…)` that refers to the *source element* or another element. That has no meaning on a pseudo tree
  which is not a descendant of the element.

| variant | remainder after the marker | environment | verdict |
| --- | --- | --- | --- |
| `motion-safe:` | `.motion-safe\:view-transition-old\/hero\:animate-fade-out` | `@media (prefers-reduced-motion: no-preference)` | **transferable** |
| `sm:` | `.sm\:…` | `@media (width >= 40rem)` | **transferable** |
| `supports-[display:grid]:` | `.supports-\[display\:grid\]\:…` | `@supports (display:grid)` | **transferable** |
| `hover:` | `.hover\:…:hover` | `@media (hover: hover)` | not transferable |
| `focus:` | `.focus\:…:focus` | — | not transferable |
| `group-hover:` | `.group-hover\:…:is(:where(.group):hover *)` | `@media (hover: hover)` | not transferable |
| `peer-checked:` | `.peer-checked\:…:is(:where(.peer):checked ~ *)` | — | not transferable |

The parser accepting the composition proves only that it parsed; this is the test for whether the
*meaning* survives, and it is mechanical.

**Corrected by P22 (below).** An earlier version of this subsection ended here with the claim that
`motion-safe:` *"is both transferable and already the wrap the reduced-motion decision requires (P20),
so the two agree."* Transferable is not the same as *belongs on both products*, and the two do not
agree. P22 measures what applying the wrapper to the identity actually does, and it is not a
suppression of Jumi motion — it is a removal of participation.

### Identity serialization (P21)

Hostile input, fifteen names, each measured in three places: does the object model accept
`view-transition-name: X`, does it accept a `::view-transition-old(X)` selector, and does the browser
actually **build** `::view-transition-group(X)`.

| identity | `view-transition-name: X` | `::view-transition-old(X)` | group built | constructed == built |
| --- | --- | --- | --- | --- |
| `hero` | ✓ | ✓ | `…group(hero)` | ✓ |
| `my-card-2` | ✓ | ✓ | `…group(my-card-2)` | ✓ |
| `--foo` | ✓ | ✓ | `…group(--foo)` | ✓ |
| `HERO` | ✓ | ✓ | `…group(HERO)` | ✓ |
| `_x` | ✓ | ✓ | `…group(_x)` | ✓ |
| `1hero` | ✗ | ✗ | none | ✗ |
| `none` | **✓** | **✓** | **none** | ✗ |
| `auto` | ✗ | ✓ | none | ✗ |
| `initial` | **✓** | ✗ | none | ✗ |
| `inherit` | ✓ | ✗ | none | ✗ |
| `unset` | ✓ | ✗ | none | ✗ |
| `revert` | ✓ | ✗ | none | ✗ |
| `hero)` | ✗ | ✗ | none | ✗ |
| `hero{` | ✗ | ✗ | none | ✗ |
| `a b` | ✗ | ✗ | none | ✗ |

Three things fall out, in order of how much they change:

1. **No accepted identity needs escaping.** Everything that reaches both positions arrives unchanged
   and builds the group the map predicted. Five forms — hyphenated, leading double hyphen, uppercase,
   leading underscore, plain — survive byte-identical. That is what makes the earlier decision to
   concatenate the identity into a selector defensible: for the values that work, concatenation is
   faithful.
2. **`CSS.supports` is not a gate.** It reports `true` for `view-transition-name: none` and
   `view-transition-name: initial`, and both produce **no group at all**. A validator built on
   `CSS.supports` would accept `none`, emit `::view-transition-old(none)`, and animate nothing. The
   decisive column is not either validity column, it is **constructed == built**.
3. **The two validity columns disagree with each other**, which is why neither alone is enough:
   `auto` is invalid as a name but parses as a pseudo argument; `initial`/`inherit`/`unset`/`revert`
   are the reverse. Only `none` is accepted by both and still yields nothing — the single most
   dangerous case, because it is also the one an author is most likely to type by accident.

So the accepted-identity rule is **not** "whatever the parser took". It is: a valid `<custom-ident>`,
not one of the reserved keywords (`none`, `auto`, and the CSS-wide `initial` / `inherit` / `unset` /
`revert`), **and** the concatenated selector must still select a group. Validated *before* the
selector is built, and refused loudly rather than handed to postcss to rescue, because a malformed
`view-transition-name` fails open — the page still renders, the element simply never travels.

### What a transferable wrapper conditions (P22)

The question the variant table could not answer: does a transferable wrapper condition **participation
in the transition**, or only **Jumi's motion**? Measured under `prefers-reduced-motion: reduce` — a
context confirmed to match — with three shapes of the same screen:

| shape | where the wrapper sits | group built | travelled |
| --- | --- | --- | --- |
| `bare` | nowhere | ✓ | ✓ (24px → 180.1px) |
| `identityWrapped` | the identity declaration is inside the wrap | **✗** | **✗** |
| `motionWrapped` | bare identity, Jumi's vars inside the wrap | ✓ | ✓ (24px → 180.1px) |

**A transferable wrapper conditions participation, not only motion.** With the identity inside the
wrap, `reduce` removes the group outright: no shared-element travel, no old/new pair, nothing to
suppress. That is strictly more than the reduced-motion decision intends and directly contradicts the
"the two agree" reading. The identity's job is to *pair* the sides; Jumi's job is to *animate* them.
A condition placed on the pairing deletes the transition; a condition placed on the animation only
quiets Jumi's part of it.

**But the wrapper only matters where it sits.** `motionWrapped` is byte-for-byte the behaviour of
`bare`, so a wrapper on the pseudo-side animation has no effect on whether the source element
participates. This is the measurement that makes the marker's two products independent:

> **The source-side identity rule and the pseudo-side animation rule are separate products of the
> marker, and a transferable wrapper is not distributed onto both by default.**

**Which wrappers go where.** Not one universal rule, and not "strip every wrapper from the identity":

- **`motion-safe:` is stripped from the identity product.** Jumi already owns reduced-motion policy
  (P20 wraps Jumi's own contribution in precisely that query), so honouring it a second time on the
  identity double-applies it and deletes participation. The author's `motion-safe:` intent is
  satisfied by the wrap Jumi already emits.
- **Every other transferable wrapper is kept on both products** — `sm:`, `supports-[…]:`, and
  whatever Tailwind adds later — because the author's condition is about *when they want this
  screen to be a view transition at all*, and `sm:`-wrapped identity was measured to behave exactly
  that way: with the query unmatched, no group is built, which is the author's own condition doing
  the author's own work.

**One instrument trap worth recording.** The first version of this probe mounted the element with the
harness's `name`, which sets `view-transition-name` as an **inline style** — outside any media query.
So the wrapped stylesheet was never the source of the identity and all three shapes reported
`travelled: true`. The fix is not a threshold or a longer wait; it is to make sure the declaration
under test comes from the stylesheet, then re-read the query to confirm it matched. This is the second
time in this pass that the harness's own scaffolding was the thing being measured.

### What is left, and it is not a platform question

The platform side is closed — P13 runs the retargeted composition cross-document with zero JavaScript,
and P18/P19/P20 settled the ownership, the blend and the reduced-motion wrap. The syntax side is closed
above, and the two conditions that were outstanding before production are measured rather than
assumed: **identity serialization** (P21) and **what a transferable wrapper conditions** (P22). Both
are stated as rules above, and the second one changed the model — the marker has two products, and a
wrapper is not distributed onto both.

What remained was the **emitter**, and it is built: `src/helpers/carriers/view-transition.ts`, called
from `finalize`. `pnpm view-transition:check` is the gate stage that runs the emitted path in a real
browser.

### The emitter

The variant is registered in the adapter and nothing else about the author's input changes:

```js
matchVariant('view-transition', (side, { modifier }) => {
  if (side !== 'old' && side !== 'new') return invalid   // the configuration-time sentinel
  if (!modifier || !identityAccepted(modifier)) return invalid
  return `&:where(.jumi-vt-${side}-${modifier})`
}, { values: { new: 'new', old: 'old' } })
```

Both refusals return the same never-matching marker rather than `&`. Returning `&` is the mistake worth
naming, because it would apply the motion to the source element, where it would run as a second
animation over the real one — output that looks entirely reasonable and a wrong page.

The finalizer then reads the staged rules out of the finished stylesheet — never from the callback —
and writes two products per the rules measured above. Three things about the shipped shape are
decisions rather than transcriptions:

**1. A staged rule is an activator.** It declares `--jumi-<slot>-animation-name`, which is exactly the
declaration the carrier pass uses to find the rules that animate, so the hoist runs over the staged
rules with the same call it runs over element activators. That is not a convenience: the publication it
appends (`--jumi-slot-<slot>`) is what the emitted composition resolves through, and replaying only the
substrate and the aggregate produces an emission that applies and animates nothing — the failure this
pass already paid for once on the element side. But the staged rule is *excluded from the element's
composition*, and has to be: left in place it would contribute `.…:where(.jumi-vt-old-hero)` to the
composition's selector list, which matches nothing.

**2. One owning rule per condition set, rather than one rule per identity.** The emission's unit is
`(identity, side, conditions)`. The spike's sheet listed both sides of an identity unconditionally, which
is sufficient when both sides are animated — what it measured — and wrong in two ways it could not have
seen: a side with no motion has no activation to supply its slot, so listing it replaces the browser's
cross-fade with a list of `none`s and makes the element pop; and a side whose motion is wrapped has to be
owned under that wrapper, not outside it. "A side with no motion means leave the UA cross-fade alone" is a
stated contract above, and grouping ownership by condition set is the shape that honours it in the
ordinary case and in the conditional one. In the common case — every unit unconditioned — the groups
collapse to the single shared rule the spike's shape describes, so this costs nothing until a wrapper
actually differs.

**3. The identity is written once per motion-bearing candidate**, not once per identity. Two rules
declaring the same name with the same value on the same element do not conflict, and one rule per
candidate is what makes conditions compose — `sm:` on one side and no wrapper on the other has to mean
"participates in either case", and no single rule can say that. An earlier version emitted one rule
from whichever candidate came first and silently discarded the other side's conditions.

Two implementation facts that are only interesting because they were wrong first:

- **The conditions have to be read while the rule is still in the document.** A detached PostCSS rule
  has no ancestors, so a reader that walked up from the rule at emission time found nothing — which
  made `motion-reduce:` silently accepted and every wrapper silently non-transferring, while every
  selector-shape refusal still fired correctly. The bug was invisible in the text and its own test.
- **Removing the staging empties the at-rule around it.** `@media (width >= 40rem) { }` left behind is
  this pass's litter rather than the author's, so the pass prunes what it emptied — never a layer,
  because `@layer utilities` means something even with no body.

Refusals are **returned** rather than thrown: `finalize` stays pure, and each adapter turns the list
into its host's channel — `result.warn` for PostCSS, `this.warn` for Vite. A refusal that never printed
would be indistinguishable from one that worked, because the page renders either way.

### Release hygiene, and what it found

Four things were checked before calling this shipped, and two of them found something.

**The gate could not run on a clean checkout.** `pnpm check` failed at its first stage with
`tailwind.config.ts(3,18): Cannot find module './dist/index.js'` — the root Tailwind config imports the
bundle, and every harness from `css` down loads the finalizer out of it, so on a fresh clone or in CI
before a build the gate stopped before checking anything. Pre-existing rather than introduced here, and
invisible to anyone whose machine already had a `dist`. Fixed by making the bundle the gate's **first**
stage: a gate that only works on the machine that last built is not a gate. Measured after: 13 stages,
green, from a tree with `dist/`, `docs/dist`, `docs/vendor`, `docs/.astro` and `docs/node_modules/.vite`
all deleted.

**The same trap, twice, and the second time it closed two gaps.** The vendored modules under `docs/vendor/`
are what the site imports, and nothing in the gate generated them — so a missing declaration was a silent
loss of types rather than a failure, and the demo's own script was in a `<script>` block inside `.astro`,
which `tsc` cannot parse and `docs:build` strips without checking. A real error shipped there
(`pseudoElement` read off `Animation.effect`, declared as the wider `AnimationEffect`) with a green gate,
found by the editor and by nothing else. Both are closed by *where the code lives*, not by loosening
anything: the demo's behaviour moved to `docs/src/demo/view-transitions.ts` and the site config became
`docs/astro.config.ts`, both of which the root project already includes — `allowJs` is `false`, so the
import cannot resolve without the vendored declaration, which makes it load-bearing — and `docs:prepare`
joined the gate second, right after `bundle`, for the same reason `bundle` is first. Measured: 14 stages
green from a tree with `dist/`, `docs/vendor` and `docs/src/data` deleted; and deleting
`docs/vendor/jumi-view-transition.d.ts` alone now fails `types` with `TS7016`, which is the assertion that
the gap is closed rather than moved.

**The one thing that still cannot be checked this way** is an `.astro` script block itself: `tsc` has no
`.astro` parser, so nothing short of `astro check` (a new dependency) reaches it. Which is why the page now
holds an import and the code holds the logic — a rule worth keeping for any page whose script has to be
right rather than merely plausible.

**A comment that overclaimed.** `src/vite.ts` skipped finalizing any stylesheet without the carrier
payload marker, and the comment justified the extra `jumi-vt-` test with "a stylesheet whose only motion
is a view transition stages no carrier payload". That is false — measured, a view-transition candidate
always stages a payload, because the utility it wraps registers a slot. The test is worth keeping as
insurance; the claim was not, and a wrong reason attached to a right line is how the line gets deleted
later.

The other two found nothing, which is the point of running them:

- **the refusal messages**, read one at a time as an author would receive them. Two problems came out of
  it: the internal marker was leaking into the text (`.view-transition-old\:animate-fade-out:where(.jumi-vt-invalid-missing)`),
  and the rest was printing escaped CSS at somebody. Against the test of *could an author act on this
  sentence*, all four are rewritten to name the candidate as the author wrote it, in author-facing words
  — and the two identity failures are now **separate reasons with separate markers**, because "the name
  after the `/` is not one the browser accepts" is a useless thing to say about a class with no `/` in
  it. `motion-reduce:` is told what to write instead, the source-state refusal names the variants that
  do transfer, and the unreachable one tells the author it is a Jumi bug and where to report it.
- **the diff**: 23 files, no generated artifacts, no strays. Two files in it — `engineering/README.md`
  and `engineering/architecture/phrases.md` — predate this round and are unrelated edits that happen to
  sit in the same commit; the index entry for this file was extended to name the shipped emitter rather
  than only the research.

### The review that found a defect no measurement had

A code-quality pass over the emitter — prompted by asking, of each decision, *who reads this and what do
they do with it* — turned up one real defect and one real hazard. Neither was reachable from the
platform measurements, because both are about shape rather than semantics.

**Defect: a wrapper reached the identity but not the motion.** `sm:view-transition-old/hero:A` beside an
unconditioned `view-transition-new/hero:B` produced a *conditional* `view-transition-name` and an
*unconditional* pseudo rule. Above the breakpoint the two agreed and every probe passed; below it, the
outgoing side still ran Jumi's keyframe while claiming to be conditioned. The invariant is that a
transferable wrapper applies to participation **and** to that side's motion, and it did not hold.

The fix is that the unit of emission is `(identity, side, conditions)` rather than `(identity, side)`.
Ownership is grouped by condition set, so taking a side from the browser happens inside exactly the
conditions the author put on that side's motion; declaration groups are emitted per condition set too.

It also sharpened a rule the review did not ask about: **ownership follows the motion, not the
declarations.** A control written under a condition no motion shares contributes its declaration but
must not take the side away from the browser on its own — otherwise a `control` is doing the thing
invariant 1 forbids, one layer down.

The measuring instrument for this is a **differential**, and a differential was the only way to see it:
the same document and the same stylesheet at two viewports, where the only difference is whether one
side is Jumi's.

| viewport | `::view-transition-old(mixed)` | `::view-transition-new(mixed)` |
| --- | --- | --- |
| 900px | `jumi-fade-out` | `jumi-fade-in` |
| 500px | `-ua-view-transition-fade-out` | `jumi-fade-in` |

Below the breakpoint the conditioned side returns to the browser's own cross-fade — not to *nothing*,
which is what a side listed in an owning rule it does not satisfy would do. That second row is the
assertion that a wrapper reached the motion rather than only the name.

**Hazard: what counts as staging is what gets deleted.** `isViewTransitionRule` decides which rules the
pass *takes out of the document*, and the marker documentation in this very file names
`.jumi-vt-old-hero` — a class an author could reasonably write. Tested by prefix, any author rule whose
selector merely mentions that class would be removed. It now requires the marker's **shape**
(`:where(.jumi-vt-…)` at the end of the selector), which admits nothing an author writes by accident and
still admits a *malformed* marker, since that has to be collected in order to be reported.

### Incremental builds, and a scenario that could not fail for the right reason

The instinct — build with a candidate, rebuild without it, assert nothing is left — turns out not to be
expressible through the compiler API, and finding that out is the useful result.

**`Compiler.build()` on a long-lived instance is additive.** Measured: `inst.build([])` immediately after
`inst.build([old])` returns **byte-identical** output. Tailwind carries the candidate set forward, which
is the same property `incremental:check` already depends on and the reason a dev session keeps a class
until it reloads. So an "incremental removal" arm written the obvious way tests Tailwind's cache and
reports a bug in the finalizer that does not exist. It is pinned in the check as a measured host fact so
the next person does not spend the afternoon on it.

What *is* Jumi's to prove is tested instead, and both hold:

| arm | what it establishes |
| --- | --- |
| a fresh build with a smaller candidate set | no trace of what is not in it — one side emits that side only, and neither side emits nothing at all |
| the pass across changing inputs | finalize full → smaller → full again returns the first result byte for byte, so the pass holds nothing between calls |
| Vite and PostCSS vs the pass | all three produce the same bytes, on a real build with real candidates |

The last of those matters more than it looks. PostCSS hands the pass an AST it already parsed and Vite
hands it a string, so a divergence would surface as a feature that works in development and not in a
build — and this feature lives almost entirely in that step.

**One instrument trap, the same species as the others.** The first version of the side detector used
`css.includes('::view-transition-old(hero)')`, which is **true for an emission with no old-side rule at
all** — the `@supports` guard names a pseudo-element and satisfies it by itself. The arms now read
selectors out of a parse. The guard also names the first unit's own side now rather than always `old`,
which is equivalent as a capability test and stops the text from reading as though an old side existed.

### The public story, and the arm that keeps it honest

`docs/src/pages/docs/view-transitions.md` is deliberately **much smaller than this document**, and the
test of whether it is small enough is whether any of it would have to change if the emission were
rewritten. It is four examples and five short sections: name the visual, controls, when it applies,
reduced motion, across two pages — plus one closing section for the two things that are refused, because
an author whose candidate is refused will otherwise be looking at a page that simply did nothing.

Nothing about the marker, the two products, the condition set, the hoist or the `@supports` guard appears
there. `stories:check` exists because the Storybook once named 187 effects that Jumi has never shipped,
and nothing failed — the demo was not built by the gate and Tailwind ignores a class it cannot resolve.
The same hazard applies to a documentation page, and it is the page a reader is most likely to copy from,
so the gate now reads the classes **out of the page** and compiles each one:

```text
docs/src/pages/docs/view-transitions.md
  → every class="…" token in every ```html block
  → compiled alone, on a compiler of its own
  → the class must appear as a selector in what Tailwind emits
```

Read out of the page rather than copied into the check, because a hand-kept list catches the library
moving away from the page and misses the page moving away from the library — which is the direction that
actually happens. Two mistakes were made getting there, both worth recording because both *passed*:

- **The payload is not a resolution signal.** `--jumi-` looks like the fingerprint of a Jumi class and is
  published in the carrier payload for *any* input, including `nothing-at-all`. Falsified by mistyping a
  class in the page: the check stayed green. It reads the selector now.
- **The finalized output is the wrong side of the pipeline.** A lone duration control keeps its only
  `--jumi-` name in the staging rule, which the finalizer removes *by design* — so asking the finished
  stylesheet whether that class resolved reported the page's own correct example as an unknown class.

And the page's two negative claims are asserted separately, because resolving and emitting are different
questions: a lone duration control resolves perfectly well, and the page's claim about it is that it
leaves the element out of the transition.

**The live demo, and a decision that was reversed.** This document previously reasoned its way to not
having one, and none of that reasoning was wrong. A cross-document demo would need
`@view-transition { navigation: auto }` in a stylesheet every page of this site loads, and a
same-document demo driven by `document.startViewTransition()` looked like it would replace the story the
feature is about — the cross-document case, the one with no script to write — with exactly the machinery
the docs exist to hide.

What changed is the *concept*, not the objections. "Prove view transitions work" is not worth a live
demo. This is:

> a grid of six cards, one expanded at a time. Clicking a card moves it to the front and the other five
> reflow around it, so every card's box changes size *and* position.

That is a **projection**, not a cross-fade, and a cross-fade is what a reader assumes a view transition
is. It is also the case where Jumi's contribution has somewhere to show. The browser projects the
geometry by itself, so the demo isolates the one thing Jumi adds — the motion on the outgoing
snapshot — and then makes the difference *legible* by letting you switch it off. `[data-demo-mode]`
strips the candidates from the cards' class lists at runtime, and the page prints which animation
actually ran on `::view-transition-old(<identity>)`, read back off `document.getAnimations()`. One mode
prints `jumi-fade-out`, the other `-ua-view-transition-fade-out`, and the geometry is identical in both.

The script is not the feature under test; it is a **control surface over candidates the build already
emitted**. The cross-document claim is untouched, and the cost is one entry point
(`docs/src/styles/demo.css`) plus `pnpm demo:check` — deliberately **outside** the gate, because it
builds the whole docs site and drives a real browser: too much to ask of a pre-commit pass, about right
before a release.

One thing had to be discovered rather than designed. Jumi's emitted pseudo rules are keyed by
**identity**, not by which classes happen to be present — so "switch to the browser default" by writing
the *same* name in plain CSS still picked up `jumi-fade-out`, and the two modes were identical while both
switches appeared to work perfectly. Native mode names the cards `plain-<card>` instead, so there is no
identity for Jumi's rules to attach to: the mode is browser-owned because it is **unmatched**, not
because it is written on a list somewhere. `demo:check` asserts the different animation rather than the
presence of a class attribute, which is the difference between testing the switch and testing what the
switch claims.

### The bug the optimizer found

The demo was written to answer a documentation question and it found a production defect instead — in a
path that had already passed the emitter's own instrument, a 61-test unit file, and a full release build.

Six cards declaring the *same* motion is the shape a CSS optimizer merges: same declarations, so the docs
build handed the finalizer **one** rule whose selector was a list.

```css
.view-transition-old\/alpha\:animate-fade-out:where(.jumi-vt-old-alpha),
.view-transition-old\/bravo\:animate-fade-out:where(.jumi-vt-old-bravo),
…
```

The reader assumed **one marker per rule** — `STAGING_SHAPE`, anchored at the end of `rule.selector` — so
it matched the trailing marker, took the whole list for a single candidate, found it was not one class,
and refused every card in the page. Politely: one warning each, each naming a real identity, which is why
it read like an authoring mistake rather than a bug. And politely is the expensive part — with no
identity rule there is no participation, so the feature did nothing, and it did nothing quietly.

**Why nothing else could see it.** The CLI never merges. Every other arm in the gate compiles through the
CLI, or through Vite with the optimizer off, so the arms were measuring a pipeline the release path does
not use. The falsification is worth the space because of which arms pass:

| arm | with one marker per rule |
| --- | --- |
| `view-transition:check` (CLI) | passes |
| `build · dev` | passes |
| `build · optimize: false` | passes |
| `build · optimize` | **0/3 identities named, 0/3 sides animated** |
| `build · two entries` | **0/3 identities named** |
| `unit` — the two coalescing tests | fails |

The fix is a change of shape rather than of logic: collection returns **one entry per staged selector**
(`rule.selectors.filter(isStagingSelector)`) instead of one per rule, and a rule is removed only if every
one of its selectors was staged. A rule that merely *ends* in the marker's shape is therefore left alone —
an author's rules are not this pass's to delete — and one merged input rule becomes three independent
products rather than one.

Three things were kept:

1. **The blind spot was structural, not accidental.** The lesson is not "checkers should merge"; it is
   that a gate had been measuring a pipeline nobody ships. The optimizing arm now runs on *every* build
   shape rather than in one dedicated arm, because the shape under test is the bundler's, not Jumi's.
2. **A staged rule is an activator.** One rule can be staged for several identities, so the hoist runs
   over the staged rules themselves rather than over a per-rule map. The second test pins the other
   direction: `.mine`, sharing a rule with a staged selector, survives.
3. **A refusal must be loud enough to be wrong.** Eleven invariants and forty-odd assertions all held.
   What was missing was not a check — it was a *user*, watching a page do nothing.

### The click a transition swallows, and where it goes instead

A reader reported that clicking a second card while one was still moving did nothing — "as though the DOM
just pauses for that alone to happen" — which is a fair description of what the platform does.

Measured with real mouse events:

| probe | result |
| --- | --- |
| `elementFromPoint` at every card's centre, mid-transition | `html` — the `::view-transition` overlay is holding the hit |
| `elementsFromPoint` at the same point | a bare `html`: not even the element stack sees through the overlay |
| the same real click, mid-transition | the event **is** dispatched, with `target = html`; no card's listener fires |
| the same click, programmatically | the second transition **interrupts** the first — `#1 finished` resolves in the same millisecond as call #2, call #2's update callback runs, no rejection, no error |
| the length of that transition | 1035ms, against a 250ms projection |

So nothing is missing from the emission and nothing needs scheduling. The event arrives — it just arrives
at the document rather than at the button, because the pseudo tree replaces the page's hit-testing for the
duration. That is the difference between this and a lost event, and it is what makes the page answerable:
a document-level listener sees the click, and `move()` is called from there.

**Where it went wrong first, since the reasoning was plausible.** The reading taken was "the lock is as
long as the slowest pseudo animation, Jumi's default is 1s against a 250ms projection, therefore the
duration is the defect" — and the fix was to carry an `animation-duration-250` on every side. It works, and
it is wrong: the overhang *is* the effect. The browser lands the box at 250ms, and a 250ms dissolve
resolves the change at the same instant, so the shift reads as a cut; keeping the change unresolved for the
rest is what makes it read as one continuous glide. The user's one-line rebuttal — "now it kills the
illusion. The 1s was load-bearing, in that sense" — is the finding. A duration that looks like a defect
from the outside was the thing being demonstrated.

The demo therefore keeps the 1s and asserts the inequality, in the direction that reads like a bug if you
only look at the numbers:

```js
check('the dissolve outlives the projection — the overhang is the glide',
  jumi.pseudoDuration > jumi.groupDuration,
  `motion ${jumi.pseudoDuration}ms, projection ${jumi.groupDuration}ms`)
```

Three things the handler has to get right, each from a measurement rather than a preference:

- **Resolution is geometric, because the DOM cannot answer.** `elementsFromPoint` returns a bare `html`
  while a transition runs, so the card under the pointer is found by testing the point against each card's
  live box.
- **The gesture is answered where it lands.** The layout change runs inside the transition's callback, before
the first animated frame — measured: the callback at 1608, `ready` at 1611 — so for the first 250ms the live
layout is where the cards are *going*, and the card under the pointer is not the card on screen. The first
version declined a click in that window on exactly that reasoning, which is sound about *which* card and
wrong about *whether* to answer: dropping a gesture is not caution, it is silence. It came back as "a bit
unpredictable, sometimes it works, sometimes it doesn't", and the timing map is precisely the gate —
**50ms nothing, 150ms nothing, 300ms onwards yes** — so what a reader got depended on nothing but how fast
they had clicked before. The second version held the *move* until the projection settled: honest about the
resolution (the point maps to the destination either way, so the card never changes) and still a quarter of a
second behind the finger. The demo keeps neither. The click is one call —
`runViewTransition(() => { active = id; apply() }, { concurrency: 'supersede' })` — the platform aborts the
transition in flight, and the wrapper passes the mutation inside the boundary *it* opens. What the hold
existed to protect is asserted instead of hand-rolled: `demo:check` reads the surviving call out of its own
record, *"the call that survived saw `echo` in its callback and `foxtrot` after it"*, which is the failure
the hand-rolled version shipped.
- **Nothing queues, and nothing awaits the transition.** Starting a transition while one is active finishes
the first immediately, so an interrupt is free. An interrupted transition's `ready` **rejects** — measured,
and the reason `runViewTransition` derives its outcome from `ready` rather than from `finished`, which
resolves either way. The readout used to chain `transition.ready` with a `catch` for that rejection; the
transition object belongs to the wrapper now, so the page reads the same moment off `animationstart` on the
root element instead (the tree's animations fire there, with `pseudoElement` set), and a rejection nobody is
watching cannot exist at all. The one animation to exclude by name is `-ua-mix-blend-mode-plus-lighter`,
which starts on the same pseudo as the motion does.

The handler answers the mode switch as well as the cards, because the overlay hides it identically and a
reach for the switch is the gesture that follows a move. But the two must be resolved under *different*
rules, and getting that wrong was the second bug in this feature rather than a hypothetical:

> "after switching from Browser default to Jumi, the first swap behaves like it's still Browser default"

Reproduced at 120ms into a native swap: the switch was dropped, `data-demo-mode` stayed `native`, and the
next swap ran the browser's cross-fade — the mode the page was already in. The cause was applying the
projection gate to both, and the gate has a *reason* that only applies to one of them. A card is gated inside
the projection because it is mid-flight and its position cannot be resolved honestly — but the gate belongs on
the card's *move*, not on the answer (see above: dropping it was the unpredictable bug). **The switch does not
move at all**, so there is nothing ambiguous about a click on it, and the window is not a corner case: the
browser's own motion lasts exactly as long as its projection, so every click on the switch during a native
swap lands inside it. Modes are resolved first, with no gate at all.

Switching mid-transition is safe rather than merely survivable: the names the running transition captured
are already resolved into its pseudo tree, so a new `view-transition-name` belongs to the next move and
leaves the current one alone. Both halves are permanent arms now — the switch is made 110ms into a native
swap, and the swap after it must be Jumi's.

And one thing that is no longer load-bearing but is still true: `jumi-fade-out` is `opacity: 1 → 0` and
`jumi-fade-in` is `0 → 1` — frame for frame, what the browser's own cross-fade does. At *matched*
durations the page's two modes would be indistinguishable, which is part of what made the equal-duration
version feel like it had lost the plot. At 1s against the browser's 250ms they are not.

**A property animation cannot dress an incoming side.** `animate-scale-110` compiles to
`@keyframes jumi-scale-d38 { to { scale: var(--jumi-scale-d38) } }` — a single `to` frame, held by the
substrate's `animation-fill-mode: forwards`. The snapshot therefore *ends* at 1.1 while the element it hands
back to is at 1, so the transition ends on a 10% jump. An effect's last frame is at rest, which is why
`fade-out`/`fade-in` and `zoom-out`/`zoom-in` end where they should and `animate-scale-90` on a `new` side
does not. (Both halves measured — the keyframe body and the fill-mode. The *size* of that jump at teardown
is not.)

Two consequences for the instrument, and the first one bit immediately:

- **The demo check must not be pointed at a dev server when the candidates change.** Tailwind carries a
  dev session's candidate set forward, so the first run against the running dev server reported
  `jumi-fade-out` — at the *new* 250ms, because the old rule and the new one had both been emitted for the
  same identity and the reader took the first animation. `DEMO_BASE` is for checking a page, not a change.
- **`page.click` cannot make this measurement.** Playwright's actionability check waits for an element to
  be able to receive a pointer event, so it sits out the transition instead of observing it; these arms use
  a raw `page.mouse.click`.


### The document's first transition, and a fix that did not survive measurement

A reader watching the elements panel described the pseudo tree appearing on the first click "with no
animation, because it was not formerly present". The structural half of that is right and was already
recorded — the tree exists only while a transition does, and its lifetime is exactly where the two click
mechanisms hand over. The timing half is right too, and it is the part worth keeping:

| | Jumi | the browser's own motion |
| --- | --- | --- |
| the document's **first** moving transition | ready after **52–58ms** | 19ms |
| the second | 20ms | 7ms |
| the third | 12ms | 13ms |

The window between the layout change and the tree being ready is a window with nothing animating in it, and
it is where a move can read as a cut rather than a glide.

**The fix that follows from that diagnosis does not work, and that is the finding.** If the cost is the tree
not being *formerly present*, make it formerly present: run one transition on arrival with an empty callback
and skip it once it is ready. It is invisible by construction — nothing changes, so the old and new snapshots
are the same image and `plus-lighter` composites them back to the original, which is the same reason the
cross-fade never dips — and it was measured before being believed:

| | first swap of the document |
| --- | --- |
| no warm-up | 52–58ms |
| warm-up, skipped at `ready` | 58ms |
| warm-up, allowed to run 250ms first | 49ms |

The warm-up's own transition was ready in **14ms**, so neither building the tree nor starting the animations
is the cost, and 250ms of running them does not warm whatever is. Nor is the cost per *browser process*:
three documents in the same warm process each took 52–58ms on their first swap, so nothing a page can do
before the reader clicks can pre-empt it either. Reverted rather than shipped — a fix that does not move the
number is not a fix, and a 250ms freeze on arrival that does not help would be worse than the thing it
claimed to fix.

What remains is a real but unprofiled ~40ms on the first moving transition, and Jumi's share of it is only
the ratio: the platform shows the same gradient (19 → 7ms), and Jumi's steady state (12ms) sits close to the
platform's first (19ms). The next step is a profile — style recalc, the layout of twelve pseudo boxes, or
rasterising six snapshots — rather than another emission change reasoned from the outside. And worth
recording alongside it: on the reader's own warm tab the same first swap measured **5–7ms**, so this does not
reproduce in a real browser under normal conditions at all.

### The boundary, and the bug that made it accidental

The first click's lifecycle was instrumented — click, old geometry, `startViewTransition`, callback entered,
DOM mutated, callback settled, `ready`, `finished` — on the hypothesis that the mutation was landing outside
the transition boundary. The hypothesis was right about the failure *class* and wrong about the cause, and the
timeline showed both halves.

One click, before the fix:

```text
2462.0ms  click (capture phase) — bravo
2462.4ms  startViewTransition called [call 1] — active=alpha
2464.7ms  startViewTransition called [call 2] — active=alpha
2464.8ms  ready REJECTED [call 1] — AbortError
2504.8ms  callback entered [call 1] — active=alpha
2505.3ms  callback settled [call 1] — active=bravo        ← the mutation, in the ABORTED call
2508.9ms  callback settled [call 2] — no further change
2520.7ms  ready resolved [call 2] — group(alpha)=true, 23 pseudo animations
```

**Two transitions for one click.** A card's own listener called `move()`, and so did the document-level handler
added for the clicks the overlay swallows — and `move()`'s `active === id` guard did not catch the second one,
because the update callback had not run yet. It does **not** run synchronously: Chromium defers it to a later
rendering update — measured at 52ms after the call on a cold document, 16ms warm. So the surviving transition
animated a boundary whose mutation had been made by the aborted one.

That is not harmless duplication. It works only while the browser runs the aborted call's callback *after* the
survivor's capture. Measured in that order — but guaranteed by nothing, and reversed the boundary is empty:
the layout changes and nothing animates, which is exactly the symptom the instrument was built to chase.

The fix is the signal already measured for the overlay rather than another flag: while a transition runs the
click's target is `<html>`, because the pseudo tree replaces the page's hit-testing, so a click whose target is
still an element was delivered normally and that element's own listener has answered it. The handler returns.
The race disappears because the discriminator is the event itself, not a boolean whose value depends on when a
callback happens to run. After it: one call per click, the callback entering on the old state and settling on
the new, `ready` resolving with the group for the card that left.

Three arms now hold that ordering in `demo:check`, because two failures live inside this boundary and neither
was visible in the page's own code: exactly one call per click; the callback is where the page changes; `ready`
resolves with a group for the card that left rather than rejecting.

### What the emitter's instrument asserts, and what it falsified

`pnpm view-transition:check` builds through the real two steps with real candidates, serves the result,
and navigates with a plain link click. The fixtures are HTML and CSS only — no script, and no
`view-transition-name` anywhere — so what is under test is a document a build produced; the observation
is injected with `addInitScript`.

It asks the browser three questions text cannot answer: does `::view-transition-group(hero)` exist
(which is the assertion that the identity came out of the finalizer), does the pseudo animation's name
start with `jumi-` (rather than the browser's `-ua-view-transition-fade-out`), and does the element
carrying only a duration control get no group at all. Then three more arms: at a viewport where an
author's `sm:` fails, that identity must not participate while the `motion-safe:` one still does — which
is what tells a *kept* condition from an *ignored* one, since in text they are identical; under
`reduce` the element must still participate while Jumi's motion must not run; and the group's own
animation must not be a Jumi keyframe, because aiming at it makes the shared element animate in place
instead of travelling.

One consequence of per-candidate identity rules is worth stating because the narrow-viewport arm found
it rather than the design: **a pair with one unconditioned side is unconditioned**. Each motion-bearing
candidate names the element, so an unwrapped `new` beside an `sm:`-wrapped `old` writes an
`unconditional view-transition-name` — correct, since the author did ask for that side unconditionally,
but surprising if you were thinking of the pair as one thing. The fixtures wrap both sides for that
reason.

Both were falsified before being trusted, and both failed in exactly the way they were built to fail:

| falsification | what the instrument reported |
| --- | --- |
| remove the `motion-safe:` strip | hero's identity lands inside `no-preference`; under `reduce`, **no hero pseudo animations at all** — no group, nothing travels |
| treat every candidate as motion-bearing | `view-transition-name: inert` emitted, and the browser builds `::view-transition-group(inert)` for an element carrying only `animation-duration-300` |

Both falsifications also failed a *text* arm, which is why the gate is not the browser arm alone: the
browser says the feature is broken, the text says which rule broke it.

### The invariants, as design law

The eleven rules this design now rests on are written out in the module header of
`src/helpers/carriers/view-transition.ts`, and each has a unit test named after the rule rather than
after the mechanism, so a failure reads as "the invariant broke" rather than as an assertion about a
string:

```text
 1. A view-transition control never establishes participation.
 2. A motion-bearing candidate establishes its own identity.
 3. Candidates for one identity contribute independently; no "winner" is selected.
 4. A side with no motion stays entirely browser-owned.
 5. `motion-safe:` suppresses Jumi's motion, never the transition identity.
 6. `motion-reduce:` is invalid for Jumi view-transition motion.
 7. Other transferable at-rule conditions apply to participation *and* to that side's motion.
 8. Source-state and relational variants are refused rather than approximately translated.
 9. Jumi never emits onto `::view-transition-group()`.
10. Jumi restores `mix-blend-mode: plus-lighter` whenever it replaces a side's UA animation.
11. An at-rule this pass empties is pruned; a structural layer never is.
```

Two of them are worth more than the other nine, and the two are the two that are falsified rather than
asserted: reversing 1 or 5 breaks a real page in a real browser, visibly and in opposite directions.
They are kept as permanent gate arms even though unit coverage of the same rules looks redundant beside
them, because the unit tests check the *shape* the rule produces and only the browser checks that the
shape does what the rule says.

Both were re-falsified after the condition-set refactor, and the second attempt is worth recording
because it *passed*. Treating every unit as motion-bearing changed nothing — participation is governed by
the **identity push**, not by the unit's ownership flag, so the falsification had been aimed at the wrong
gate and the check looked vacuous for one run. The rule that falls out: a falsification that passes is
not evidence that the check is weak, it is evidence that the wrong line was changed, and the way to tell
the difference is to ask which line the invariant is actually enforced by.

Two traps the instrument itself hit, both worth the space because they are the same trap twice: the
first version matched the shared pseudo rule with a per-side pattern (so the blend assertion read the
wrong rule), and its idempotence arm **rebuilt** instead of re-finalizing — a fresh build stages the
candidates again, so it proves nothing about a second pass.

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

## What the finalizer needs — the minimal metadata

Not a syntax proposal. This is the smallest set of facts the emission cannot be built without, stated
so the API can be designed from the finalizer's needs rather than from variant mechanics.

**Four names, and one of them is a pair.** A transition targets `old` and `new` for a *transition
identity*; the identity is what pairs the sides, and the two sides are independently animated. So:

```text
identity     required    the transition name — an arbitrary author string (P6b), which is why it
                         cannot come from a utility's own selector
old motion   optional    what the outgoing side runs; absent means leave the UA cross-fade alone
new motion   optional    what the incoming side runs
```

and the emitted rule set, per identity, in this order (the order is load-bearing — the shorthand resets
the two longhands that follow it):

```css
@supports selector(::view-transition-old(hero)) {
  @media (prefers-reduced-motion: no-preference) {
    ::view-transition-old(hero), ::view-transition-new(hero) {
      <substrate>            /* the emitted defaults, verbatim — unmodified, 79 declarations */
      <aggregate>            /* the emitted composition, verbatim — unmodified */
    }
    ::view-transition-old(hero) { <the old side's activation rule body> }
    ::view-transition-new(hero) { <the new side's activation rule body> }
  }
}
```

**Three things this pass settled about that shape, each of which a design would otherwise get wrong:**

1. **The activation rule body, not just the activation.** The hoist puts `--jumi-slot-<slot>` on the
   utility rule; replaying only the substrate and the aggregate produces a composition that applies and
   animates nothing. Whatever the metadata is, the emission has to carry the *publication*, which means
   the emission is per-slot and not only per-composition.
2. **Re-declare `mix-blend-mode: plus-lighter` on old and new.** The UA's declaration of it lives in an
   animation that the emitted `animation` replaces, and the composite measurably depends on it (P19).
   Preserving the browser's own behaviour is the conservative default; departing from it is a separate,
   unmeasured decision.
3. **The `no-preference` wrap is Jumi's, not the platform's** (P20). Nothing in the platform clamps a
   view-transition animation, and an unconditional `animation: none` under `reduce` would cancel the
   browser's cross-fade as well as Jumi's.

**What the metadata does *not* need**, on this evidence: nothing about the group (browser-owned by
default), nothing about the image-pair, nothing about lifecycle or timing — the browser owns duration
and orchestration, and the identity is only needed because the composition is emitted onto a selector
the author never wrote.

**And it must not be a variant.** A variant rewrites the selector of the element that carries the class;
this has to write the selector of a *different* pseudo tree, keyed by a name that exists only as a
`view-transition-name` declaration — possibly an arbitrary one, possibly set inline. The reachability
result (P3a, P4) makes that structural rather than a limitation of the variant API, and nothing in this
pass contradicts it.

## Reproducing

```bash
pnpm view-transition:check   # the emitter, end to end, in a real browser — in the gate
pnpm spike:view-transitions  # the platform probes, P0-P22
pnpm spike:vt-syntax         # the syntax probes, against Tailwind's variant API
```

The two spikes serve `scripts/spike-view-transitions/` over `http://127.0.0.1` — a cross-document
transition needs a same-origin navigation, which `file://` cannot provide — and print one JSON block
per probe. The fixtures link the committed snapshot rather than a fresh build, so the substrate,
aggregate, registrations and keyframes under test are the ones that ship.

`view-transition:check` instead builds its corpus in-process from the candidates in its own fixtures,
so what it serves is the output of the emitter under test rather than a checked-in artifact — which is
the only arrangement that can tell "the emitter writes the right thing" from "the emitter writes what
it wrote last time".
