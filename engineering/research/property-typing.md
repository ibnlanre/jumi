# Can every leaf hold a typed registration?

_RESEARCH — measured, not shipped. Not a workstream, and not filed._

The pivot's third question, after the spike that justified it and the CTO's ruling that took it up:

> Have DeepSeek classify the **520 leaves** into: typed safely, typed after reshape, cannot be typed
> without changing semantics, not actually animated publicly. For each proposed typed leaf, validate
> `syntax`, `initial-value`, valid frame values, keyword behaviour, token-count behaviour. I don't want
> us to go from "canonical-body overengineering" into "typed-property overgeneralization".

The trap is real, and the model states it in one line:

```ts
'width': { value: 'auto', … }                                  // the identity is a keyword
'animate-width': { type: ['length', 'percentage', 'any'], … }  // the candidate is lengths
```

294 of the 316 addressable leaves look scalar-shaped, and scalar-shaped is not typable. A census that
answered "497 look scalar" would have registered `--jumi-width` as `<length-percentage>` with
`initial-value: 0px` and quietly changed what an element with no width utility means.

So the census asks a question with a mechanical answer instead — **does the identity the model already
declares fit the syntax the candidate's declared types imply?** — and puts it to the browser, because
`CSS.registerProperty` rejects an `initial-value` outside its syntax and that is the same question.
**The identity is never substituted.**

Measured by `pnpm spike:property-typing` in Chromium 153.0.8010.12 on 2026-09-16, by a structural read of
`src/variables/property.ts` and `src/properties/tween.ts` (`scripts/lib/property-model.mjs`), with every
registration attempted for real. Nothing in `src/` was touched.

## The answer

|                           | leaves | what it means                                                            |
| ------------------------- | ------ | ------------------------------------------------------------------------ |
| **typed as written**      | 113    | the model's own identity registers for the syntax the candidate implies  |
| **typed after a union**   | 85     | the identity is a keyword; `<component> \| <keyword>` registers          |
| **typed after a reshape** | 18     | a function's argument is the unit; the function stays in the composition |
| **cannot be typed**       | 129    | 103 keyword-valued, 24 whose grammar is wider than one component         |
| **not animated publicly** | 204    | no candidate addresses it; 120 of those nothing names at all             |

**187 leaves were proposed for, and all 187 register.** 113 as written, 85 as one of 20 distinct unions,
18 as a reshaped argument. Nothing in the 187 was left unregisterable.

So the answer to "can we type the leaves" is: **yes for every leaf that has an interpolation unit, and 129
leaves turn out not to have one** — which is the finding the census existed to produce, because the
obvious reading of the model would have typed them anyway.

Of the 316, **112 are named as a part** of a composed value and **204 as their own attribute** — the
property _is_ the slot. Both are typed identically, because both have a frame key naming one slot; the
split is reported because the second group is the trivial case the pivot gets for free, and because the
two cannot be told apart without the build's own rule: a candidate's surfaces are its parts, or its
attribute when it declares none (`src/core/surfaces.ts`).

## Does the census hold? 89 of the 112 constituents

The pivot exists for the leaves that are a **part** of a composed value — that is what "the browser
composes the result" means. Of those 112:

|                                           | count |
| ----------------------------------------- | ----- |
| typed as written, or as one keyword union | 71    |
| typed after the function reshape          | 18    |
| cannot be typed                           | 23    |

**79%.** And the 23 are not unknowns — each has a named reason, and none of the reasons is "we do not
know what this is":

| the 23                                                                                                           | count | why                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------- |
| `background-position-x/y-edge`, `object-position-x/y-edge`, `offset-anchor-x/y-edge`, `offset-position-x/y-edge` | 8     | the keyword half of a position, whose numeric half (`…-offset`) **is** typed |
| `border-image-outset-{top,right,bottom,left}`                                                                    | 4     | `length` and `number` in one grammar                                         |
| `background-repeat-x/y`, `border-image-repeat-x/y`                                                               | 4     | keyword-valued                                                               |
| `overflow-x`, `overflow-y`, `outline-style`                                                                      | 3     | keyword-valued                                                               |
| `transform-origin-x/y`                                                                                           | 2     | typing them would remove `center`                                            |
| `filter-url`, `backdrop-filter-url`                                                                              | 2     | a slot that holds a whole function                                           |

So the census holds, with one caveat worth stating: **eight of the 23 are the keyword halves of the
position families, and their numeric halves are typed.** For those, the pivot is not incomplete — the
split of a position into an edge and an offset is exactly what makes the interpolable half interpolable,
and the keyword half is animated by the property as it is today.

The 103 keyword-valued leaves among the 204 attribute-named ones are the same story from the other side:
`align-content` and `border-collapse` are not constituents and have no constituents, so the property is
already the right unit and the pivot changes nothing about them.

## §1 The reshape is one technique applied 18 times, not 18 designs

The 20 function-shaped leaves are the only ones where the slot cannot hold a typed scalar at all — the
spike measured that a typed `<length>` on `blur(0)` kills the declaration. The fix is one move: the
**argument** becomes the interpolable unit and the function stays in the static composition.

```css
@property --jumi-filter-blur-amount {
  syntax: '<length>';
  inherits: false;
  initial-value: 0px;
}
.filter-element {
  filter: blur(var(--jumi-filter-blur-amount)) …;
}
```

The identity is the argument the model already rests at, so `css('blur', '0')` becomes amount `0` — the
same value, written once, not a substitute. Measured: `blur(var())` on `0px → 8px` reads `blur(4px)` at
50%, and `grayscale(var())` on `1 → 0` reads `grayscale(0.5)`. Both interpolate and both keep sibling
timing.

Two of the 20 are **not** reshapable, and the reason is structural:

```
filter-url            css('opacity', '1')   ← the identity, deliberately inert
animate-filter-url    type: 'url'           ← what a phrase writes
```

The slot holds a **whole function** — `opacity(1)` at rest, `url(…)` when written — so there is no fixed
function for the composition to keep and no argument to animate. The declared grammar is the tell: the
value grammars (length, number, angle) are arguments, a `url` is a call. Both `*url` slots are excluded on
that rule, and it is the one place the census's own proposal would have been wrong.

## §2 What the browser refused, and the union that fixed it

85 identities were refused. Every one is the same failure: **the identity is a keyword and the syntax is a
component.** All 85 registered as a union, in 20 distinct shapes:

| leaves | union that registered                                                                                   | identities                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 21     | `<length-percentage> \| auto`                                                                           | `width`, `height`, `block-size`, `inline-size`, `top`, `right`, `column-width`, `grid-auto-*` |
| 10     | `<length> \| medium`                                                                                    | the nine `border-*-width`, `outline-width`                                                    |
| 6      | `<length> \| none`                                                                                      | `contain-intrinsic-*`, `perspective`                                                          |
| 5      | `<number> \| auto`                                                                                      | `aspect-ratio-width`, `aspect-ratio-height`, the three `hyphenate-limit-chars-*`              |
| 4      | `<length-percentage> \| none`                                                                           | `max-width`, `max-height`, `max-block-size`, `max-inline-size`                                |
| 4      | `<integer> \| none`                                                                                     | `counter-increment`, `counter-reset`, `counter-set`, `column-span`                            |
| 4      | `<image> \| none`                                                                                       | `list-style-image`, `mask-image`, `mask-border-source`, `background-image`                    |
| 3      | `<url> \| none`                                                                                         | `marker-start`, `marker-mid`, `marker-end`                                                    |
| 2      | `<number> \| normal`                                                                                    | `font-weight`, `font-variation-settings`                                                      |
| 2      | `<number> \| none`                                                                                      | `line-clamp`                                                                                  |
| 2      | `<length-percentage> \| normal`                                                                         | `column-gap`, `letter-spacing`                                                                |
| 2      | `<integer> \| auto`                                                                                     | `column-count`, `z-index`                                                                     |
| 2      | `<color> \| auto`                                                                                       | `accent-color`, `caret-color`                                                                 |
| 1 each | `<url> \| auto`, `<integer> \| normal`, `<image> \| normal`, `<angle> \| from-image`, `<angle> \| auto` | `cursor`, `font-feature-settings`, `content`, `image-orientation`, `offset-rotate`            |
| 1      | `<length> \| currentColor`                                                                              | `column-rule-width` — see §6                                                                  |
| 1      | `<color> \| medium`                                                                                     | `column-rule-color` — see §6                                                                  |

**A union registers, but registering is not the question.** A union is only a fix if it interpolates
between two spellings of the _same_ component, which is the case the operator will actually hit:

| probe                                 | 0% → 100%     | at 50%   |                                    |
| ------------------------------------- | ------------- | -------- | ---------------------------------- |
| `<length-percentage> \| auto`         | `0px → 100px` | `50px`   | interpolates                       |
| `<length-percentage> \| auto`         | `0px → auto`  | `1264px` | STEPS                              |
| `<length> \| thin \| medium \| thick` | `0px → 20px`  | `10px`   | interpolates                       |
| `<number> \| <percentage>`            | `1 → 0`       | `0.5`    | interpolates                       |
| `<number-percentage>`                 | `0 → 2`       | `2`      | STEPS — the at-rule does not parse |

A component-against-keyword frame pair steps — **which is what it does today too**, because today the
property is animated between the two substituted values and the same `0px → auto` pair is discrete there.
No regression; the union costs nothing and preserves the identity.

`<number-percentage>` is the one dead end, and it is the Values spec's own component name: Chromium
rejects it as _"not a valid custom property syntax"_. It would affect 16 leaves — the `filter` and
`backdrop-filter` amount families, `opacity`, and the four `mask-border-slice-*`. The spelling that works
is `<number> | <percentage>`, measured at `0.5` for `1 → 0`. The spec's component list is not all
implemented, and the census would rather write the thing that works than the thing that reads better.

## §3 The 129 that cannot be typed, in two kinds

**103 keyword-valued leaves.** Their candidates declare `any` and nothing else, and their identities are
keywords:

```
align-content  align-items  align-self  appearance  background-attachment  background-blend-mode
background-clip  border-collapse  box-sizing  break-after  caption-side  clear  clip-path  clip-rule
column-rule-style  display  flex-direction  flex-wrap  float  font-style  font-variant
justify-content  list-style-type  mix-blend-mode  object-fit  outline-style  overflow-x
overscroll-behavior  position  text-align  transform-style  visibility  writing-mode  … and 70 more
```

There is no single interpolation unit to type, and there is nothing to lose: a keyword-valued property has
no interpolation to preserve. This is the CTO's third category — whole/complex motion, animated by the
property, whose native semantics are already the right abstraction.

**24 leaves whose grammar is wider than one component**, and this is a different finding:

| leaf                                                                                  | identity                     | the components its candidates declare                    |
| ------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------- |
| the eight `*-position-x/y-edge`, `offset-anchor-x/y-edge`, `offset-position-x/y-edge` | `left`, `top`, `center`      | `position`                                               |
| `transform-origin-x`, `transform-origin-y`, `perspective-origin`, `offset`            | `50%`, `center`, `none`      | `length`, `percentage`, `position`                       |
| the four `border-image-outset-*`, `bottom`, `line-height`, `stroke-width`             | `0`, `auto`, `normal`, `1px` | `length`, `number`, `percentage`                         |
| `font-size`                                                                           | `medium`                     | `absolute-size`, `relative-size`, `length`, `percentage` |
| `font-family`                                                                         | `inherit`                    | `generic-name`, `family-name`                            |

Typing `transform-origin-x` as `<length-percentage>` **registers and interpolates** — its identity is
`50%`. It would also _remove_ `center`, which the candidate accepts today. Whether that is acceptable is a
design decision, and it cannot be made from the model, because **the keyword set is recorded nowhere**: the
model records the value types a candidate accepts, not the keywords the CSS property allows. So the census
refuses to invent it, and reports these as needing model data rather than a mapping.

The `-edge`/`-offset` split is the one place this costs nothing, and it is worth seeing: the numeric half
(`background-position-x-offset`, `0%`) is among the 187 and types as `<length-percentage>`, while the
keyword half is separately typed as a keyword. **The split is what makes the numeric half interpolable.**

## §4 The fourth bucket is bigger than expected, and it is not about typing

204 leaves are addressed by no candidate. Their distinction matters more than their count:

- **84 are named by a composition** — `box-shadow-inset`, `-outset`, the `*position-x/y` axis entries.
  They are the routing the compositions read on the way down to a leaf. Structure, not motion.
- **120 are named by nothing at all** — no composition reads them, no candidate writes them.

The 120 are the finding here, because they are not a typing question at all. `color` is written, but
`will-change`, `z-index`, `zoom`, `max-width`, the whole `scroll-padding-*` and `text-decoration-*`
surface — the model carries an entry, a variable and an identity for each, and nothing in the build can
reach any of them. It is worth a ruling of its own, and it is outside this census's scope: the census can
only say that they need no registration because they are never animated. The CTO has ruled to leave it
for now, since it is unrelated to whether the animation architecture works.

## §5 What the corpus would actually move

The model's 520 leaves are not what a migration costs. The frozen sheet writes a frame key for 33 slots: 8
are whole-attribute keys (a phrase with no parts — `scale`, `rotate`, `margin`, `padding`, `box-shadow`,
`border-radius`, `backdrop-filter`, `backdrop-filter-drop-shadow`), and 25 are leaves.

| the 25 leaves the corpus animates | count | verdict                                                                                                                |
| --------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| own slot, types as written        | 14    | `scale-x/y/z`, `rotate-x/y/z`, `rotate-angle`, `opacity`, `outline-color`, `outline-width`, the four `border-*-radius` |
| reshaped argument                 | 9     | `backdrop-filter-blur/brightness/contrast/grayscale/hue-rotate/invert/opacity/saturate/sepia`                          |
| keyword-valued, one of the 103    | 1     | `outline-style`                                                                                                        |
| a slot holding a whole function   | 1     | `backdrop-filter-url`                                                                                                  |

**23 of the 25 typable, 2 not** — and the two are the ones where nothing is lost: a `url()` is not
interpolable, and `outline-style` is discrete.

The corpus is also unusually kind: its 8 whole-attribute keys are exactly the case the pivot _relocates_
rather than solves, and its 9 function leaves are exactly the reshape. A corpus that barely touches the 85
union leaves is not evidence that the union rung is unnecessary — it is evidence that the corpus does not
exercise it yet.

## §6 The defect the census surfaced without looking for it

`column-rule-width` and `column-rule-color` have each other's identity:

```ts
'column-rule-width': { value: 'currentColor', … }   // every other *-width leaf is medium/auto/none/1
'column-rule-color': { value: 'medium', … }         // every other *-color leaf is currentColor/transparent/…
```

**It is latent, not live, and the reason is that nothing reads either slot on its own.** Both candidates
address their leaf as its _own attribute_ (`property('column-rule-width')`, `color('column-rule-color')`),
so a motion writes `column-rule-width: var(--jumi-column-rule-width-<id>, …)` — its own property, not the
`column-rule` shorthand. The composition `column-rule: var(--width) var(--style) var(--color)` is only
emitted when the `column-rule` attribute itself is animated, and there the grammar is order-insensitive
(`<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>`), so the transposed pair lands
in the right slots anyway: both `column-rule: currentColor none medium` and
`column-rule: medium none currentColor` compute `width: 3px`, `style: none`, `color: rgb(0, 0, 0)`.

It becomes fatal where a slot is read **on its own**, which is precisely what the variable architecture
does: registering `--jumi-column-rule-width` as `<length>` is refused on `initial-value: currentColor`. And
the union rung would hide it again, since `<length> | currentColor` registers — which is the argument for
reading the identity out of the model rather than out of whatever makes a registration succeed.

**Fixed (2026-09-16).** The two are back where their families put them, and the invariant that catches it
is now a test — a `*-width` leaf may never rest at a colour, a `*-color` leaf never at a line width —
verified to fail on the transposition before being relied on. No shipped byte changed, which is itself the
proof of how latent it was: the canonical corpus never registers the `column-rule` composition, so the two
defaults were never emitted.

## §7 The census's own reader was wrong four times, and every wrong answer looked plausible

The join between the model and the candidate table is text, so it was read by pattern first, and all four
patterns failed the same way: they described the shape of what they wanted, and the source has more shapes
than that.

1. **`fn: property\(.*\)`, greedy.** `.*` runs to the last `)` in the entry's body, which is inside
   `values: theme(…)` two lines below, so the captured text contained the entry's own `type:` list and
   part extraction credited `animate-background-position` with writing the leaf `position` — a leaf the
   graph really has, written by a candidate that never mentions it.
2. **`call.slice(call.indexOf(',') + 1)`.** For `property('scale')` there is no comma, `indexOf` returns
   `-1`, and the slice is the whole call — so the attribute was read back as its own part.
3. **A scan for quoted names.** `property('filter', [['filter-blur', value => css('blur', value)]])`
   addresses one slot; the scan also found `'blur'` inside the wrapper and reported a part that is not in
   the graph.
4. **Reading only `property(`.** The candidate table has three shapes that address a property —
   `property('scale', ['scale-x'])`, `color('outline', ['outline-color'])`, and
   `token('display', 'prepend')` — and all eighteen `color(…)` candidates were left unattributed, six of
   which address a **part** of a composition. Every figure in the first two drafts of this document was
   reported with those six missing.

Each was caught by asserting a property of the _real_ model that could be read by eye: a writer of
`position` that could not be one, an attribute in its own parts list, a part named `blur` when the slot is
`filter-blur`, and `outline-color` classified as unreachable when `animate-outline-color` plainly exists.
Together they moved the addressable set from 236 to 316 and the proposal count from 123 to 187. **No
headline number from the first draft survived, and none of them was obviously wrong.**

Two further corrections had to be made on the way, and they are recorded because each looked like a
finding:

- Refusing to read any part from a call with no comma (fixing 2) dropped the addressable set to 106 — but
  `property('opacity')` genuinely does address the leaf `opacity`, because the attribute _is_ the slot.
  The rule is the build's own (`src/core/surfaces.ts`): a candidate's surfaces are its parts, or its
  attribute when it declares none.
- The first "latent, not live" reading of §6 was argued from **plain CSS** written by hand, not from what
  Jumi emits. The conclusion held, but the evidence did not support it. Re-derived above from the emitted
  candidates.

The reader balances parentheses and brackets (`readCall`), splits the parts list at its own top level
(`readParts`), reads all three addressing shapes, and is pinned by `scripts/lib/property-model.test.mjs` —
the same correction `scripts/lib/var-references.mjs` needed when a pattern over `var(...)` described one
expression's text and the expressions became nested.

## What this does not measure

- **Whether the var model reproduces the browser's own property interpolation for composite values.** The
  `transform` prototype answers this for `transform` and the answer is a boundary, not a yes:
  [measured separately](../research/transform-interpolation.md).
- **Token-count behaviour**, except by citation: the earlier spike measured `<length>+` with a changing
  token count as discrete, and `<angle>` to `none` as a dropped frame. No leaf among the 187 has a
  list-valued grammar.
- **Whether all 20 union shapes interpolate.** Three were sampled, chosen to cover the families the corpus
  touches (length-percentage, line-width, number-percentage). The other 17 share their shape but are
  registered only.
- **Cost.** The spike's census (10,820 → 1,441 bytes of frames and published keys) stands; this census adds
  the registrations, which are ~775 bytes today and would grow with the 85 unions.

## What it would change, if it is taken up

1. **Registration stops being uniform.** Today every `@property` the build emits is `syntax: "*"`,
   `inherits: false`, no `initial-value`. A typed slot needs a per-leaf `syntax` and `initial-value`, and
   the model is where they belong — beside the value that is the identity.
2. **The identity becomes load-bearing, so it has to be right.** `column-rule-width` proves the model has
   never been read this way. A typed registration turns every such transposition from invisible to fatal,
   which is the reason to do it and the reason to audit the identities before doing it.
3. **187 leaves, not 520.** 169 own-slot, 18 reshapes. The other 333 need nothing: 103 have no
   interpolation unit, 24 need model data the model does not have, 84 are routing, 120 are unreachable,
   2 hold whole functions.

## Reproducing

```bash
pnpm spike:variable-animation   # the architecture the census is for
pnpm spike:property-typing      # this census
```
