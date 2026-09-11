# Stops — shipped

`animate-<attr>-<value>/[at-<offset>]` puts a value at a frame of the attribute's
one shared timeline. Documented for users in `docs/src/pages/docs/controls.md`
("Set where the action happens").

## The model

One keyframe per attribute, never one per stop:

```css
@keyframes jumi-rotate {
  50% { rotate: var(--jumi-rotate-at-50, var(--jumi-rotate-x-at-50, …)) }
  75% { rotate: var(--jumi-rotate-at-75, var(--jumi-rotate-x-at-75, …)) }
}
```

- `animate-rotate-[-45deg]/[at-50%]` writes `--jumi-rotate-at-50: -45deg` and
  activates the attribute-wide slot (`--jumi-rotate-animation-name`). It adds no
  animation of its own.
- `at-50%` and `at-50` are the same stop: the offset is parsed out of the
  modifier and the variable is respelled from the number, so there is no `%` to
  escape.
- Frames sort by offset. A stop the element does not pin falls back past the
  per-part variables to the attribute's base variable.
- Because the shared keyframe is global, its frame set is the union of every
  stop in the build. Unpinned frames land on the element's resting value.

## Why not composition, and why not per-stop keyframes

- `animation-composition` sums complete animations. Two same-property
  animations each carry their own 0% and 100%, so their return legs disagree and
  `replace` discards all but the last. `accumulate` compounds per iteration,
  which runs away on `infinite`.
- Per-stop keyframes (the earlier shape: `jumi-<attr>-<stop>`, one slot each)
  had the same problem in a different costume — several animations of one
  property, arbitrated by `replace`.

Frames of one keyframe share one pair of endpoints, so the phrase closes and
loops cleanly.

## Aliases are not stops

`/[1]`, `/[50]` — a bare modifier — still names an instance, with a keyframe and
a slot of its own so it can carry its own timing. That is the tool for two
separately driven tracks of one property. `at-` is the reserved prefix;
anything that does not parse as an offset keeps its alias meaning.

## Where it lives

`src/helpers/create/index.ts`:

- `stopOffset(modifier)` — `at-50%` → `50`; anything else returns `null`.
- `stops: Map<attribute, Set<offset>>` — stops, feeding the shared keyframe.
- `aliases: Map<attribute, Set<string>>` — bare modifiers, one keyframe and slot
  each.
- `registerStop()` folds a frame into `@keyframes jumi-<attr>`;
  `computePropertyKeyframes` runs values → composed → stops → aliases so a stop
  merges into a keyframe the composed path may have already created.
- `propertyKeyframeValue(attribute, suffix, fallback)` carries the fallback for
  dependency-less properties too, which is what makes an unpinned frame resolve
  to the resting value rather than the property's initial value.
