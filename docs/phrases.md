# Phrases — shipped

A tween value can declare its own frames. One utility = one animation = one
keyframe, named after the declaration, so isolation is structural.

User-facing docs: `docs/src/pages/docs/controls.md` ("Write the shape of the
animation").

## Grammar

```
phrase := frame ("," frame)*
frame  := <offset> ":" <value>
offset := 0–100, integer or decimal — the % is implied and never written
value  := any CSS value, may contain ":" "," "(" ")" ";" and spaces
```

```html
animate-rotate-[0:0deg,50:0deg,100:45deg]
animate-scale-[0:0.42_0.30,50:1.03_1.03]     <!-- `_` stands in for a space -->
```

Tailwind rejects `{` and `}` in an arbitrary value, so the object-literal
spelling (`[{0:16deg}]`) silently produces nothing. It accepts `@`, `,`, `:`,
`_` and `%` intact, and `_` arrives at the plugin already converted to a space.

Frames split on commas at nesting depth 0, so `rgb(0,0,0)` stays one value, and
each frame splits on its FIRST colon, so `url(data:image/png;base64,x)` stays
one value. A value is a phrase iff it matches `^\s*\d+(?:\.\d+)?\s*:`; no plain
CSS value starts `digits:`, and ratios use a slash.

- Reparsed and normalised per declaration: frames sorted by offset, duplicated
  offsets last-wins, trimmed. Hashed from that canonical form, so `0:a,50:b` and
  `50:b,0:a` are one keyframe.
- A bare value is the degenerate phrase: `animate-rotate-45` ≡ `45deg@100`, and
  its output is unchanged.
- Undeclared offsets are the property's resting value, which is why a phrase
  closes itself and loops without a seam.

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
