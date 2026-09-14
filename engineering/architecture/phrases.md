# Phrases — shipped

A tween value can declare its own frames. One utility = one animation = one
keyframe, named after the declaration, so isolation is structural.

User-facing docs: `docs/src/pages/docs/controls.md` ("Write the shape of the
animation").

## Grammar

```
phrase      := frame ("|" frame)*
frame       := offset-list ":" value
offset-list := <offset> ("," <offset>)*
offset      := 0–100, integer or decimal — the % is implied and never written
value       := any CSS value, may contain ":" "," "(" ")" and spaces
```

```html
animate-rotate-[0:0deg|50:0deg|100:45deg]
animate-rotate-[0,100:45deg|50:0deg]         <!-- one value, two offsets -->
animate-scale-[0:0.42_0.30|50:1.03_1.03]     <!-- `_` stands in for a space -->
```

**The separator is a pipe because the comma became the offset separator, and the obvious replacement
— a semicolon — does not survive the host.** Tailwind drops any candidate containing a `;` inside its
arbitrary value. Measured against `@`, `%`, `|`, `!`, `~` and `^`, a semicolon is the only one of the
seven that emits nothing at all — and it emits nothing *quietly*: with every phrase in the canonical
corpus written with semicolons, the keyframe count fell from 33 to 27 and no harness said a word. `%`
and `!` are carried but unusable here, since both are legal in a CSS value (`50%`, `!important`) —
which is the same reason the comma could not stay the frame separator. A pipe is carried, appears in
no CSS value, and collides with nothing in the host's own syntax.

Tailwind rejects `{` and `}` in an arbitrary value, so the object-literal spelling (`[{0:16deg}]`)
silently produces nothing. It accepts `@`, `,`, `|`, `:`, `_` and `%` intact, and `_` arrives at the
plugin already converted to a space. A value is a phrase if it matches
`^\s*\d+(?:\.\d+)?(?:\s*,\s*\d+(?:\.\d+)?)*\s*:`; no plain CSS value starts `digits:`, and
ratios use a slash.

- Offsets that share a value are **one frame**, not a spelling of several, which is what the change
  was for: `0,100:45deg|50:0deg` and `0:45deg|50:0deg|100:45deg` are the same declaration, hash to
  one keyframe, and emit identical CSS. A frame's offsets are last-wins among themselves, the same
  way a duplicated offset is.
- Reparsed and normalised per declaration: frames sorted by offset, duplicated offsets last-wins,
  trimmed. Hashed from that canonical form, so `0:a|50:b` and `50:b|0:a` are one keyframe.
- A bare value is the degenerate phrase: `animate-rotate-45` ≡ `45deg@100`, and its output is
  unchanged.
- Undeclared offsets are the property's resting value, which is why a phrase closes itself and loops
  without a seam.

### The key is the phrase's own text, and the grammar made that load-bearing

`phraseKey` serialises the canonical frames as `0:45deg|50:0deg|100:45deg`, and the keyframe is named
after the hash of that. It was a comma join before, which the new grammar turns from a style into a
hazard: `0:0deg,50:0deg` is read as ONE frame — offset 0, value `0deg,50:0deg` — so a comma join
gives it the same string as the two-frame `0:0deg|50:0deg`, and one spelling would silently share,
and then overwrite, the other's keyframe. A value can never hold a top-level `|`, because `splitFrames`
has already cut every one, so the join is injective.

Every emitted slot id changed once with the grammar, since the key is the phrase text. It is visible
only in the byte snapshot.

**This is a breaking change to a shipped syntax.** A phrase written with commas now reads as a single
frame whose offset list is one number and whose value happens to contain commas, which for most
properties is not a valid CSS value — so it will not animate, and nothing will say so. The pre-1.0
window is the time to take it.

## Labelled slots

A phrase can be labelled where it is declared — `animate-rotate-[0:0deg|58:0deg]/[flick]` — and
a control can then address that slot by the same word: `animation-timing-function-[…]/[flick]`. The
label is the handle, not a property-qualified path; it becomes `--jumi-flick-animation-timing-function`.Nothing is prepended, so `/[rotate-flick]` on `animate-rotate` is `--jumi-rotate-flick-animation-timing-function`
— one `rotate`, because the label is written, not derived; the attribute came back out of the chain when
the dot form went away.

There is no second namespace. Labels and property names are the same kind of word, which is what lets a
control's modifier be either; the chain settles it, since a labelled slot reads `--jumi-{label}-{part}`,
then `--jumi-{attr}-{part}`, then `--jumi-{part}`. So a label equal to its own attribute name is inert
rather than dangerous: `/[rotate]` on `animate-rotate` emits
`var(--jumi-rotate-animation-…, var(--jumi-rotate-animation-…, var(--jumi-animation-…)))` — the unlabelled
chain with the property link repeated. The animation already read that variable first, and the tween rule
sets no timing variable, so nothing changes and nothing is added to the element (measured).

What the flat space does cost is that two animations labelled `flick` share one variable. That is a naming
choice rather than a defect, and it is the price of a label being sufficient on its own: the control knows
only the word, never the property, so the variable can only be keyed by that word. It is bounded, though —
a label is element-local, like a phrase name and for the same reason. Every link the chain reads for a
labelled slot is registered `inherits: false`, emitted where the label is recorded rather than when
the composition is assembled, so the registration cannot be missed by a slot created late. Measured: a
wrapper carrying `animation-timing-function-ease-out/flick` over a child whose own phrase is labelled
`[flick]` leaves the child's label link unset, where before the child inherited `ease-out`. The property
link still crosses a wrapper boundary — nothing declares `--jumi-{attr}-animation-{part}` on the element,
so a `/rotate` control above it cascades (measured: `500ms` reaching a child's unlabelled rotate) — while
the global links do not, unregistered though they are: the derived defaults rule declares them on every
animating element, and a declaration beats inheritance (measured: a wrapper's `--jumi-animation-duration: 5s` leaves
a child at `1s`). Registration is skipped when a label IS the attribute name, since that variable is the
property scope's, and the scope is the link that does cross the boundary.
The label is not part of the phrase and not part of a keyframe's identity: the phrase still
decides the keyframe, the label only routes controls, and it is recorded in the declaring rule
as `--jumi-{attr}-{hash}-label` so the slot's name is visible in the CSS rather than being
plugin state. The frame variables are keyed by a hash nobody can write; the label is the address
a person can.

Keep that declaration. Without it, `animate-rotate-[…]/[flick]` and `animate-rotate-[…]` emit
byte-identical rules, so a class judged by its own CSS looks as though the modifier does nothing
— which is what made tooling suggest dropping it, and dropping it silently unmakes the scoped
control, since nothing would then read the label's variable. An index cannot be that. Slots are collected page-wide, so the number one
element's animation answers to depends on what every other element animates — measured on a
page with three other rotate animations, the hero petal's two slots came out as `3` and `4`,
and adding a fourth would renumber them.

This is the part of the old alias idea worth keeping. Aliases were inert because two animations
of one property are arbitrated by `animation-composition: replace`; with `add` they sum, and
per-slot timing is what makes that useful — an eased flick and a linear return have to be two
animations, because one easing times every segment of an animation.

Note the asymmetry with frames: `animation-composition` and `animation-timeline` are animation
longhands, so a variable drives them, and they are assembled per slot. A keyframe's own
`animation-timing-function` is not — a `var()` there is dropped by the browser and the animation
falls back to its own timing (verified: literal → the cubic-bezier, `var(--ease, linear)` →
`ease`). Per-segment easing therefore has to be a property of the keyframe, which is why this
route eases a whole slot rather than one frame of it.

## Why phrases and not any of the earlier designs

- **A shared keyframe per attribute cannot work.** Every element animating that
  property runs the union of everyone's offsets, and CSS has no way to skip a
  frame — `@supports` cannot live inside `@keyframes`. Measured: an element
  pinning one offset animates through another element's offset, resolving it to
  its own resting value. It was already happening in the docs build, where a
  study card's composed `to` frame merged into the same `jumi-scale` the hero
  petals used.
- **Aliases (per-instance keyframes) cannot work either.** Two animations of one
  property are arbitrated by `animation-composition: replace`, so the earlier
  slot was inert. What the hero actually used them for was per-property timing,
  which `animation-{control}-{v}/rotate` does with no syntax at all.
- Keyframe identity must therefore be something only the declaring element
  controls — and that is its value string.

## Where it lives

`src/helpers/create/index.ts`:

- `parsePhrase(value)` / `phraseKey(frames)` / `splitFrames(value)` at module
  scope, after the export.
- `phrases: Map<attribute, Map<id, Frame[]>>` — replaces `stops` and `aliases`.
- `property()` — a phrase claims the keyframe and the slot
  (`--jumi-{attr}-{id}-animation-name`); a plain value keeps the per-value path,
  and parts keep the shared composed keyframe (one `to` frame, so nothing can
  union into it).
- `computePropertyKeyframes` — one keyframe per phrase; the frame var is
  `--jumi-{attr}-{id}-{offset}` (or `--jumi-{part}-{id}-{offset}`).
- `propertyKeyframeValue(attribute, suffix, fallback)` unchanged, now called with
  `{id}-{offset}` as the suffix.

Deleted: `aliases`, `stops`, `stopOffset`, `registerStop`, the alias branch in
`property()`, the alias branches in `animationParts`/`computeAnimationRegister`,
and `scope()`'s `attribute.alias` form.

## Type gate

Tailwind type-checks arbitrary values before the plugin runs, and a phrase is not
a number or a length. An entry accepts phrases only if `'any'` is in its `type`
list — 221 of 395 already had it. Widened so far: `animate-scale`,
`animate-scale-x/y/z`, `animate-opacity`. The wider change loosens validation for
that property's *bare* arbitrary values, which is why it is done per property
rather than wholesale; theme-defined phrases are resolved from the values map and
skip the gate entirely.

## Known limitation: the slot list is per pass, not per update

> **Superseded in mechanism, not in cause.** The carrier this section names left userland: the
> composition is now derived from the finished stylesheet, so nothing has to enumerate slots inside a
> candidate any more. The host facts below are unchanged, and they are why the model re-publishes its
> data instead of trusting a single pass — Tailwind caches one AST per candidate, and an incremental
> scan appends rather than sorts.

`animations` used to enumerate every slot in the build, so its rule was not a
function of its own candidate — and Tailwind caches one AST per candidate. Both
halves were measured against `@tailwindcss/node`'s `compile()` +
`build(candidates)`, which is the path the Vite plugin takes:

- **A fresh pass is correct by the alphabet.** The scanner returns candidates
  sorted (`animate-rotate-…`, `animate-scale-110`, `animation-duration-500`,
  `animations` — measured with `Scanner`, for markup that lists `animations`
  first), and every `animate-…` / `animation-…` sorts before `animations` because
  `-` < `s`. So every slot is registered before the list is built. Hand the same
  candidates in another order and the list is short or empty: `['animations',
  tween]` → no slot, `[tween, 'animations']` → one slot.
- **An incremental pass can be stale.** Calling `build()` again with one more
  tween reuses the cached `.animations` AST, and the list does not grow. The Vite
  plugin holds one compiler and calls `build([...this.candidates])` per update,
  and its candidate Set is created once per session and never cleared — so
  candidates added later are appended *after* `animations`, which makes the
  alphabetical guarantee a first-scan guarantee. That is why the workaround is a
  dev-server restart, not a CSS edit: recreating the compiler does not reorder the
  Set. Symptom: a newly added tween class does not animate, because the element's
  slot is missing from the list.

There is no plugin-side fix. The plugin API has no end-of-build hook and no way
to invalidate a candidate, and plugin output is materialised eagerly — a getter
on `addBase` and on a utility value returned its first value on three consecutive
builds. Making the rule constant is the one structural alternative: a
fixed-length list of `var(--jumi-slot-<n>-…)` positions, each tween writing its
own slot's variables, so the rule depends on nothing. It costs two things: the
list length becomes a fixed maximum shipped on every page, and a slot's
*position* moves into the tween's own cached rule — and position is exactly how
`perValue`'s move-to-end makes a re-registered value win under
`animation-composition: replace`.
