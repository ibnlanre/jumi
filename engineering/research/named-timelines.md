# Named timelines, and the Tailwind grammar they would travel through

Chromium 153.0.8010.12. `pnpm spike:named-timelines` (`scripts/spike-named-timelines.mjs`, with the
synthetic host probe in `scripts/named-timelines/probe-plugin.mjs`). No `src/` changes, **no syntax
proposal**: the point is to know the model and the grammar before choosing vocabulary for either.

## Summary

- **The `(...)` shorthand works, and it hands the matcher `var(--feed)` — but only where the utility declared
  a permissive type.** A typed matcher never sees it at all. That single fact decides most of the vocabulary
  question, because nearly every Jumi motion declares a type.
- **A named timeline is visible to descendants of the element that declares it, and to nothing else** —
  not siblings, not the rest of the document — and the name does **not** cascade. `timeline-scope` parses and
  computes in this browser and does **not** widen resolution, so the cross-subtree capability the property
  promises is **not available in Chromium 153**.
- Jumi owns the **consumer** side of scroll-driven animation. The declaration side is a different layer, and
  today it is natively written — which is a legitimate place for it to stay.

## 1 · What the `(...)` shorthand hands a plugin matcher

A synthetic plugin (importing nothing from Jumi) registers one permissive matcher and one typed matcher, each
recording the value it receives. One build per candidate, so a call is attributable.

| candidate                         | what the matcher received                                             |
| --------------------------------- | --------------------------------------------------------------------- |
| `probe-(--feed)`                  | `any:"var(--feed)"`                                                   |
| `probe-[var(--feed)]`             | `any:"var(--feed)"` — identical, so `(...)` is sugar for `[var(...)]` |
| `probe-(length:--feed)`           | `any:"var(--feed)"` — the hint is stripped before the callback        |
| `probe-(color:--feed)`            | `any:"var(--feed)"`                                                   |
| `probe-[12px]`                    | `any:"12px"`                                                          |
| `probelen-[12px]` (type `length`) | `length:"12px"`                                                       |
| **`probelen-(--feed)`**           | **no matcher call, and no rule**                                      |
| **`probelen-(color:--feed)`**     | **no matcher call, and no rule**                                      |

So, answering the question exactly as asked: the shorthand reaches `matchUtilities` as **`var(--feed)`**, not
`--feed`, and not as nothing — _provided the utility's declared type accepts it_. A `var()` cannot be
validated as a length, so a `type: ['length']` matcher refuses `(--feed)` and its type hint must agree with
the declared type (`(color:--feed)` against a length matcher is refused too).

That matters more for Jumi than for Tailwind, because Tailwind's own utilities are the permissive ones.
Jumi's motions declare types (`['length', 'percentage', 'any']` and so on), so `animation-timeline-(--feed)`
would reach nothing unless the registration changed. The one Jumi route that would already receive it is the
phrase route, which registers with `type: 'any'` deliberately.

And even then the matcher receives the **wrapper**, not the name: a Jumi spelling would have to parse
`var(--feed)` back to `--feed` to use it as an identifier, which is the opposite of "participate in the host's
grammar naturally".

## 2 · Where a named timeline exists, and who can reference it

`#scroller` declares `scroll-timeline-name: --feed`; every target references it with
`animation-timeline: --feed`. `timeline` is the constructor of the animation's timeline, so `null` means the
reference did not resolve.

| case                                                                          | reading                                                                                  |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| a **descendant** of the scroller                                              | `ScrollTimeline`                                                                         |
| a **sibling** of the scroller, no scope anywhere                              | `null`                                                                                   |
| a sibling of a _named_ scroller, referenced directly                          | `null`                                                                                   |
| a sibling twice removed, with `timeline-scope: --feed` on the common ancestor | **`null`**                                                                               |
| the same, two scrollers and one name in scope                                 | **`null`**                                                                               |
| `animation-timeline: scroll()` with no scrollable ancestor                    | `ScrollTimeline` — falls back to the root scroller                                       |
| two names on one source (`--one, --two`)                                      | both resolve, `ScrollTimeline`                                                           |
| nested scrollers, both named `--dup`, target inside both                      | `ScrollTimeline` — **which source wins is unmeasured** (progress read `null` either way) |
| a **view** timeline, from a descendant of the subject                         | `ViewTimeline`, progressing                                                              |
| the same view timeline, from outside the subject                              | `null`                                                                                   |
| computed `scroll-timeline-name` on the scroller vs its child                  | `--feed` vs **`none`** — the name does not cascade                                       |

Supported _syntactically_, checked so an unimplemented property cannot read as a fixture bug:
`scroll-timeline-name`, `view-timeline-name`, `view-timeline-inset` and `timeline-scope` all return `true`
from `CSS.supports`, and `timeline-scope: --feed` **is** stored (the computing element reads it back). It
still does not widen resolution. Two things are indistinguishable in the rows above — "the property parses
but does nothing" and "this fixture is wrong" — so the support check is what makes `null` a platform
statement rather than a mistake.

The answers to the questions that mattered:

- **Descendants only.** A named timeline exists for the declaring element's subtree. Separate subtrees cannot
  see each other, and siblings cannot see each other, without `timeline-scope`.
- **`timeline-scope` is the only mechanism that would widen that** — and in Chromium 153 it does not, so the
  cross-subtree case is unavailable today. That is the whole of the "one scroller driving non-descendants"
  capability, and it is the reason not to build vocabulary for it yet: the platform cannot honour it.
- **The name is a reference, not a custom property.** It has dashed-ident syntax and subtree visibility,
  which makes it _look_ inherited, but `scroll-timeline-name` computes to `none` on a child of the scroller
  while `--feed` would inherit on any custom property. Nothing about `var()` semantics applies to it.
- **Anonymous and named differ in reach, not in kind.** Anonymous `scroll()` resolves against the nearest
  scroll container and falls back to the root scroller, which is why an element with no scrollable ancestor
  still gets a `ScrollTimeline`. Named timelines let the source be somewhere else in the subtree.
- **Unmeasured, and left that way:** which source wins when two scrollers share a name on the target's
  ancestor chain. The reading resolves to a `ScrollTimeline` in every arrangement and progress was `null` in
  each, which cannot distinguish "inner wins" from "outer wins" — so the record says so instead of picking.

## 3 · What this means for vocabulary, without proposing any

Two facts constrain the answer, and neither is a naming preference:

```text
animation-timeline-(--feed)  → reaches a typed matcher: never. Reaches a permissive one: as var(--feed),
                               which a Jumi spelling would then have to unwrap to use as an identifier.
scroll-timeline-name         → a declaration on the scroller, visible to its subtree only, and the
                               cross-subtree mechanism that would make it more than that is inert here.
```

The declaration side is ordinary CSS authoring on an element Jumi does not animate, and the platform's
cross-subtree capability is not available, so there is nothing for Jumi to integrate with yet. If it is
documented, it should be documented as native CSS — which also keeps it honest: an author writing
`scroll-timeline-name: --feed` on their scroller learns the actual requirement rather than a Jumi alias for it.

## 4 · The decision

```text
fix perspective / perspective-origin coverage      done — surface-audit.md
document named timelines with native CSS           done — docs/src/pages/docs/controls.md
keep animation-timeline-[--feed] as the spelling   verified: writes --jumi-animation-timeline: --feed
do not add (...) sugar for timeline names          animation-timeline-(--feed) writes no declaration
do not add timeline-scope utilities yet            parses and computes, widens nothing here
```

Three of those are measurements rather than preferences. `animation-timeline-[--feed]` emits and writes
`--jumi-animation-timeline: --feed`; the parenthesised form emits a rule that declares nothing, which is the
same dead end the plugin-API probe predicted from the other side; and `timeline-scope` is inert, so there is no
behaviour for a utility to expose.

The conceptual note is the one worth keeping in the docs, because it is the error a clever spelling would
invite:

```text
--feed in animation-timeline   → a <dashed-ident> timeline name
var(--feed)                    → a custom property reference

not the same thing
```

A timeline name has dashed-ident syntax and subtree visibility, which makes it look like a custom property,
and it is not one: it does not cascade (§2), and `var()` semantics do not apply to it. A `(...)` sugar would
teach exactly the wrong mental model — custom-property access — for something that is not a custom property.
`[...]`, by contrast, says "arbitrary CSS value", which is precisely what the name is.

### The spellings a utility-based example would need, tried

| candidate                                                                              | result                                                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `animation-timeline-[--feed]`                                                          | writes `--jumi-animation-timeline: --feed`                                |
| `animation-timeline---feed`                                                            | **refused** — a bare dashed-ident never reaches the matcher               |
| `scroll-timeline-name-[--feed]`, `scroll-timeline-name---feed`                         | refused — no declaration utility exists                                   |
| `scroll-timeline-name/--feed`                                                          | refused                                                                   |
| `scroll-timeline-axis-block`, `view-timeline-name-[--view]`, `timeline-scope-[--feed]` | refused                                                                   |
| `animation-timeline-scroll`                                                            | writes `--jumi-animation-timeline: var(--jumi-animation-timeline-scroll)` |
| `animation-timeline-scroll/--feed`                                                     | **writes nothing at the element level**                                   |

The last two rows are the important pair. A slash in Jumi addresses the **motion** with that name — that is the
whole naming mechanism — so `scroll-timeline-name/--feed` would read as "the `scroll-timeline-name` control,
applied to the motion named `--feed`", which is close to the opposite of setting a timeline name. The slash is
also why an unbracketed spelling cannot work: the value has to be an arbitrary value to carry a `<dashed-ident>`
at all, so `[...]` is not decoration, it is what makes the name expressible.

The declaration-side utilities do not exist in any spelling, and neither the bracketed nor the slash form is a
near miss — both are refusals today, which is also why the page cannot name them: the documentation claim gate
resolves every `class="…"` in the docs and refused an illustrative `scroller` class for exactly this reason.

### If they are ever added, they are declaration-only

The classification to preserve, so a future addition does not quietly become something else:

```text
interpolate-size-allow-keywords   → a declaration-only utility: no slot, no /name, no carrier required
animation-duration-500/foo        → a motion control: writes a slot variable, scoped by name
```

The declaration side belongs to the first kind. `scroll-timeline-name: --feed` exists on a scroller that Jumi
does not animate, it changes nothing about any motion, and it must work on an element that carries no Jumi
motion at all — which a carrier-scoped control cannot do. No slot scoping, no `/name`, no carrier requirement.

The naming that would fit is property-first and control-shaped — `scroll-timeline-axis-block`,
`scroll-timeline-name-[--feed]` — with no slash anywhere in it. They are deferred, not rejected: cheap syntax
still expands the public surface, the documentation surface, the testing surface and the compatibility
promises, so the shorthand waits until named timelines are common enough in real use to earn it.

### The frozen split

```text
animation-timeline-[--feed]        → consume a named timeline: part of Jumi's motion model
scroll-timeline-name: --feed       → declare it, in CSS, on the scroller: ordinary platform setup
```

The consumer is Jumi's; the declaration exists on another element and belongs to the platform. The page teaches
it that way deliberately — the real platform model rather than an alias that hides it — and the distinction the
`(...)` shorthand would blur is the reason the consumer spelling has to stay bracketed:

```text
--feed inside [--feed]   → a timeline name, a <dashed-ident>
(--feed)                 → Tailwind's custom-property shorthand, meaning var(--feed)
```

## Instrument notes

Three readings were wrong before they were right, and the shape of the error is the same each time — **an
under-specified fixture beating a claim the fixture could not support**:

- **A target that was not a descendant.** The first pass nested the animated element as a _sibling_ of the
  scroller and reported that named timelines do not work; the sibling case is the one that must not work.
  Descendant and sibling are different rows, and the row that decides the question is the descendant.
- **A view subject with no scroll container.** A view timeline describes the subject's visibility _inside a
  scrollport_; with none, it is inactive and reads `null`, which looks exactly like "view timelines are not
  visible to descendants". Once the subject was placed in a scroller it read `ViewTimeline`, progressing.
- **A property that parses and does nothing.** `timeline-scope` returns `true` from `CSS.supports` and stores
  its value, so "not implemented" and "my markup is wrong" produce identical output. `CSS.supports` plus a
  computed-value read is what separates them, and without it the record would have claimed a platform
  limitation from a fixture bug — or worse, invented vocabulary for a capability that is inert.
