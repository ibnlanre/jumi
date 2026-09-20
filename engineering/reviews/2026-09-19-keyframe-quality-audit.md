# Keyframe quality audit — 19 September 2026

Review of the 235 effect definitions in `src/keyframes/effects.ts` at `9ac0375` (the promotion commit).
No production file was changed by this pass: it is a findings report, and the machine-readable
[audit matrix](2026-09-19-keyframe-quality-audit.matrix.json) travels beside it.

**Question.** Are the existing 235 definitions as good as they should be — geometry, endpoints,
origins, timing, symmetry, browser behaviour — or is something measurably wrong?

**Answer.** Six defects and one documentation cluster, listed in section B; everything else was
challenged and found defensible (section A). Nothing here is a reason to stop the release once the
approved corrections land.

**Disposition.** Items 1–5 of the recommended queue were approved and implemented in `dcc594d`:
21 of the 235 definitions changed, `src/keyframes/effects.ts` only. Section G carries the measured
before/after evidence for each approved item and states what was deliberately left alone.

## Method and instruments

Three instruments, none of which changed the library:

| Instrument                                            | What it measured                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Static matrix** (`scripts/tmp-audit-matrix.mjs`)    | Per effect: family, role, keyframe offsets, owned properties, `transform-origin` (and how many stops declare it), per-stop timing functions, endpoint states, per-stop transform arithmetic, net translation, scale extremes, clip function/vertex chains, exact duplicates, stop-for-stop reversal pairs, role-aware direction semantics.                                                                                                                                                                                                                          |
| **Sweep, all 235** (`scripts/tmp-audit-browser.mjs`)  | Chromium 153.0.8010.12 and Firefox 155.0, one live animation per effect, sampled **at the authored offsets and at the midpoints between them**: exactly one live Jumi animation; endpoint agreement with the authored `0%`/`100%` declarations; a midpoint hull check on translation/scale/rotation/opacity/size (a sample outside its segment's hull is a discrete step); and a discrete-interpolation test for `clip-path`, `filter`, `box-shadow`, `text-shadow` and `border-radius`.                                                                            |
| **Targeted probe** (`scripts/tmp-audit-targeted.mjs`) | Rendered coverage of every clip effect (pixel count of the visible area, plus enclosed-hole count for seams), the same element with `fill-mode: none` after the animation ends, `swing` with and without a base transform, `lift` across its loop point, the `expand-*` box geometry, `typing`'s end width, `accordion` at three content heights, 3D matrices and rendered boxes, the rendered displacement of the point at each declared origin on 3×element sizes, the pointer behaviour of an exit that finished with `forwards`, and filter-list interpolation. |

Two instrument lessons worth keeping:

- **Computed `clip-path` is serialized in px**, so an authored/measured string comparison is
  meaningless; clip questions have to be answered with pixels.
- **A stray inline `animation-iteration-count` silently corrupts every later seek** in the same page
  (a seek to `t=duration` lands at the start of iteration 2). The first run of the targeted probe
  measured three effects that way. Reset inline animation state between cases.

The origin model was **calibrated against the browser before it was trusted**: for an element with
`transform: rotate(90deg); transform-origin: bottom right`, the model's predicted bounding box
(`260,-20,380,180`) equals the rendered box exactly. The hinge measurements below are therefore
readings, not arithmetic.

## Verdicts at a glance

| Classification                       |                                         Count | Effects                                                                                                                                         |
| ------------------------------------ | --------------------------------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep exactly                         |                                           199 | everything not named below                                                                                                                      |
| Adjust keyframes                     |                                             8 | `swing`; `lift`; `diamond-in`; `triangle-in` + its four corner variants                                                                         |
| Adjust origin                        |                            5 (+2 conditional) | `accordion`, `fold-in`, `fold-out`; `expand-right`, `expand-up` (inert declaration); `unfold-x`/`unfold-y` when an author sets their own origin |
| Documentation clarification          |                                             4 | `typing`; the `expand-left`/`expand-down` anchor; `shadow` (text-only)                                                                          |
| Duplicate / alias observation        | 16 names (1 exact group, 13 near-alias pairs) | `pulsing`/`zoom-pulse`; `reveal-*`↔`unmask-*`; `square-in-*`↔`unmask-*`; `square-out-*`↔`mask-*`                                                |
| Adjust timing (perceptual)           |                                             1 | `zoom-out-elastic`                                                                                                                              |
| Needs browser-specific investigation |                                             0 | the two engines agree on every measurement; WebKit is unavailable on this host (see E)                                                          |

## A. Effects reviewed and kept unchanged

**All 235 were challenged mechanically; 226 survive every check.** The sweep found **no effect whose
rendered motion disagrees with its authored keyframes** in Chromium or Firefox: one live animation
each, endpoints equal to the authored `0%`/`100%` values at those offsets, every midpoint inside its
segment's hull for the components the anchors can answer for, and no string-valued property that
failed to interpolate. The hull check excludes full-turn rotations, 3D matrices and degenerate
(scale-0) anchors, where a decomposed hull is not a statement about the motion; those cases were
covered by the targeted probe instead.

Family by family, what was challenged and why it stands:

- **Translated arrivals and departures (47).** Role-aware direction audit over all 124 directional
  names: an entrance travels away from its named side, an exit toward it. **No disagreements** except
  the four `arc-*` names, which follow the entrance convention while being classified as sequences —
  i.e. they arrive from the named corner, which is what they are for. Distances are deliberately
  mixed (px in `fade-*`/`bounce-*`/`throw-*`, `%` in `slide-*`/`zoom-*`); that is a parameter choice,
  not an inconsistency. The `rush-out-*` family's small counter-move at 20% reads as anticipation and
  is kept.
- **Scale-led arrivals and departures (29).** Every entrance ends at identity, every exit starts at
  identity; the elastic members' oscillation decays (measured series for `zoom-*`); `bounce-in`'s
  1.1 overshoot and `zoom-in`'s 1.08 are the family's two amplitudes by design. `zoom-out-elastic`'s
  envelope is discussed in C.
- **Planar turns and spiral travel (16).** `spiral-path`'s counter-rotations keep the element upright
  while it orbits — the intermediate matrices confirm it. `arc-*` pivots **about the declared edge
  centre, not the named corner**, and _additionally translates_: the point at the declared origin
  travels 63.64px during the entry (identical at 200×120, 80×240 and 300×60). That is a _travel_
  with a pivot, not a fixed attachment; the names describe where the element comes from. Kept, worth
  one sentence in the docs.
- **3D orientation and folding (24).** The whole family renders as an **orthographic projection**:
  sampled matrices carry `m34 = 0` (no perspective) and the rendered box shrinks by `|cos θ|` —
  `flip-x` at 500ms is `matrix3d(1,0,0,0, 0,0.323,-0.946,0, …)` with a 38.8px-tall box, from 120px.
  None of the 27 flappy effects carries a `perspective()` component, so the convention is consistent;
  perspective belongs to the author (composition with the perspective utilities). `flip-card-x/y` set
  `backface-visibility: hidden` and end at 180° — with `forwards` the element is invisible at the end,
  which is the documented hand-off to a second face.
- **Hard clipping and apertures (61).** Every clip effect was rasterized at `0/25/50/75/100%`:
  **not one hole pixel at any sample** (the earlier 453-pixel reading was the element's white text,
  which the fixture now omits). Entrances that end at full coverage do so exactly (0.9488 of the
  2px-padded screenshot = the whole element) and exits start there; `mask-center` ends on its band
  (0.1898) and `unmask` starts there — the pair is a centre-band trajectory, not a conceal/collapse.
  The new `radial-wipe-*` and `blinds-*` are clean at every sample.
- **Attention, oscillation and activity (24).** Every member returns to rest — `shake`, `wobble`,
  `tada`, `jello`, `flicker`, `figure-eight`, `glitch`, `morph`, `scatter` — with two exceptions,
  `lift` (defect) and `heart-beat`, whose 35%→100% hold is the rest _between beats_ and is exactly how
  a heartbeat reads. `jello`'s halving skew series, `wobble`'s decay and `tada`'s alternating stops
  are deliberate shapes, not redundant stops.
- **Shear (10).** Sign semantics are internally consistent: the two-axis names match the single-axis
  ones (`skew-left-up` = `skewX(-20deg) skewY(-20deg)`, the same signs as `skew-left` and `skew-up`).
- **Light, focus and surface cues (7).** `neon` mixes filter **lists of different lengths** (2 shadows
  at the ends, 3 in the middle). Measured in both engines: the shorter list is padded with
  `drop-shadow(0 0 0 transparent)` and interpolates smoothly (the third shadow reads 0.804 alpha at
  250ms), so there is no snap. `glow`, `hue-shift` and `blur-*` are clean.
- **Material-like deformation and bursts (6).** `explode` ends concealed and `implode` ends visible —
  the pair is internally consistent; `bubble`, `drip`, `melt` and `splash` deform and settle with the
  endpoints their names promise.
- **Layout and display opening (7).** `power-on`/`power-off` are exact reversals with honest
  endpoints. `expand-*` and `accordion` carry the findings in B.
- **Typographic presentation (4).** `letter-space-in/out` are not mechanical inverses (−0.5em→0 vs
  0→+0.5em) but both _spread_ the text: the entrance converges to normal tracking, the exit leaves
  stretched. Intentional and kept; `typing` is discussed in B/C.

## B. Confirmed defects

Ordered by correctness, with the measurement that shows each one.

### B1. A `transform-origin` declared in only some keyframes drifts to the element's own origin

**Effects:** `accordion` (1 of 3 stops), `fold-in` (1 of 3), `fold-out` (1 of 3) — and
`unfold-x`/`unfold-y` (1 of 4), which are harmless _only_ while the element's own origin is the
default centre.

**Current behaviour (measured).** Per CSS, a keyframe that does not declare a property takes the
**underlying** value, so the property is animated from the one stop that declares it to the element's
own `transform-origin`:

```
fold-in    origin reads 100px 120px (bottom) → 95.49 → 71.86 → 62.37 → 60px (centre)
           rendered top edge   180 → 132.91 → 106.45 → 66.84 → 60
accordion  origin reads 100px 0px (top) → 24.51 → 48.14 → 57.63 → 60px (centre)
hinge-drop origin reads 0px 0px at every sample   ← declared in every stop: the control
```

So `fold-in`'s fold line slides from the bottom edge toward the vertical centre as it unfolds, and
`accordion`'s scaleY pivot slides from the top edge to the centre. The declared pivots are not the
pivots in use.

**Proposed correction.** Repeat the `transform-origin` declaration in every stop of those five
definitions (adjust origin). The **endpoint geometry is unaffected** — every one of them ends at an
identity transform, where the origin has no effect — so the visible change is the trajectory only.

**Compatibility impact.** Public motion changes for `fold-in`, `fold-out` and `accordion` (the pivot
becomes the declared edge). Low risk, but it is a motion change and belongs in the approved queue.

### B2. `swing` has no `0%` stop, so its first fifth belongs to the element, not the effect

**Current behaviour (measured).** `swing` declares 20/40/60/80/100% only. With no base transform the
first segment runs 0°→15°; with the element's own `transform: rotate(20deg)` set before the animation
starts, the same segment runs **20°→15°**:

```
base none          t=0: 0°      t=100: 12.04°  t=200: 15°
base rotate(20deg) t=0: 20°     t=100: 15.99°  t=200: 15°
```

Every sibling in the attention family (`wobble`, `shake`, `tada`, `jello`, `wave`, `blink`) declares
both `0%`/`from` and `100%`/`to`; `swing` is the only one that does not.

**Proposed correction.** Add an explicit `0%` stop (`transform: rotateZ(0deg)`).

**Compatibility impact.** Changes the first 20% of `swing` from element-dependent to defined. An
element that relied on a base rotation for the wind-up would lose it (that reliance was accidental).

### B3. `lift` does not return to rest, and breaks its own loop

**Current behaviour (measured).** `lift` ends displaced — `translateY(-5px) scale(1.02)` — in a
family where every other member returns to its start. Sampled across a two-iteration loop:

```
t=499: matrix(1.02, 0, 0, 1.02, 0, -4.99999)
t=500: matrix(1, 0, 0, 1, 0, 0)        ← the loop restarts: a 5px, 2% jump
t=1000: matrix(1.02, 0, 0, 1.02, 0, -5)
```

**Proposed correction.** Either add a return to identity at `100%` (adjust keyframes), or keep the
pose and document `lift` as a one-way motion that must not be looped. Product decision: the name
suggests a hover-style pose, and a pose is a legitimate effect — but then it is the only non-looping
member of the attention family and the docs should say so.

**Compatibility impact.** Returning to rest changes the effect's end state for every user who relies
on `forwards`.

### B4. `expand-left`/`expand-right` (and `-up`/`-down`) declare an inert origin, and the pair's geometry does not distinguish the names

**Current behaviour (measured).** `transform` is `none` at every sample, so `transform-origin` on
`expand-right` (right) and `expand-up` (bottom) does nothing. The box grows from the top-left in all
four: `expand-left` and `expand-right` are byte-identical in geometry (x 60, width 12 → 256.77 →
320px), and so are `expand-up`/`expand-down` (height 12 → 160.47 → 200px). A width/height animation
cannot anchor at the far edge without positioning, so `expand-right`'s declared pivot and
`expand-left`'s lack of one are both misleading.

**Proposed correction.** Remove the two inert `transform-origin` declarations (adjust origin), and
either document the anchor (all four grow from the leading/top edge) or rename/re-scope the pair.
Product decision on naming; the removal itself is correctness.

**Compatibility impact.** Removing an inert declaration cannot change rendering; it changes only the
keyframe text and any screenshot of it.

### B5. `diamond-in` and the `triangle-in-*` family end only half-visible, and the four triangles do not agree on which corner they keep

**Current behaviour (measured).** Coverage of the element at `100%` (full coverage = 0.9488):

```
diamond-in               0.4822      triangle-in              0.4791
triangle-in-bottom-left  0.4775      triangle-in-bottom-right 0.4783
triangle-in-top-left     0.4783      triangle-in-top-right    0.4791
```

Every other entrance in the clip families (`circle-in`, `square-in`, `reveal-*`, `unmask-*`,
`radial-wipe-in`, `blinds-in-*`) reaches 0.9488 — the whole element. `diamond-in`/`triangle-in`
instead _end on the shape_. With `animation-fill-mode: none` the clip is then dropped and the missing
area pops in: the same element reads **0.9488 immediately after the animation ends**. So the effect
holds a half-visible window and then snaps to full.

The four triangles are also internally inconsistent: `triangle-in-bottom-left` and
`triangle-in-bottom-right` leave the hidden half at the corner their names give, while
`triangle-in-top-left` leaves the **top-right** corner hidden and `triangle-in-top-right` leaves both
bottom corners hidden.

**Proposed correction.** Decide the intended endpoint (product decision):
_(a)_ make every entrance reach full coverage (grow past the corners, as `circle-in-bottom-*` already
does with its 150% radius) — then the endpoint matches its siblings and no snap remains; or
_(b)_ keep the shaped window as the effect's semantics and document that it requires
`animation-fill-mode: forwards`, that it ends partially hidden, and that the four variants' kept
corners are not rotations of one another.

**Compatibility impact.** (a) changes the end state for anyone using `forwards` with those six
definitions and removes the no-fill snap; (b) changes nothing and fixes the documentation instead.

### B6. `typing` reveals the text in about a tenth of its timeline

**Current behaviour (measured).** The element's natural width is 46.70px inside a 320px containing
block; the animation takes `width` from 0 to `100%`:

```
t=0: 12px   t=500: 256.77px   t=1000: 320px
```

The text is fully visible when the box passes 46.70px, at ≈ 11% of the timeline; the remaining 89% is
empty layout growth. For text wider than the containing block, the reveal never completes visually —
`overflow: hidden` clips at the container edge, not at the text's own edge.

**Proposed correction.** Documentation (the containing-block contract, plus the `display` /
`white-space: nowrap` / `overflow: hidden` requirements that make the effect read as typing), and a
recipe: give the element a shrink-wrapped parent so `100%` is the text's own width. A keyframe change
cannot fix this without an intrinsic-size mechanism (`calc-size(auto)` / `interpolate-size`, both
covered by the repository's existing research).

**Compatibility impact.** None (documentation only).

## C. Perceptual improvements

Not defects — the motion is as authored, and each would be a deliberate change.

- **`zoom-out-elastic` overshoots upward mid-exit.** Scale runs 1 → 1.1 → 0.7 → **1.3** → 0.1, so the
  element grows 30% brighter/larger at 75% of a departure that started by leaving. `zoom-in-elastic`'s
  oscillation decays; the exit's does not. Damping the middle peak (or making it monotonically smaller
  than rest) would read as a departure rather than a pop.
- **Distance units are mixed within families** — px in `fade-*`, `bounce-*`, `throw-*`; `%` in
  `slide-*`, `zoom-*`, `wobble`. Both are defensible (px gives a constant offset, `%` scales with the
  element); unifying would be cosmetic churn, so it is recorded rather than proposed.
- **`explode`/`ripple`/`melt` end concealed** while `implode`/`bubble`/`splash` end visible. One
  sentence in the docs about which members are one-shot exits would prevent a looping surprise.
- **`shadow` is a `text-shadow` effect.** The name suggests an element shadow; `glow`/`neon`
  (`drop-shadow`) are the element-wide ones. A naming or documentation clarification.

## D. Duplicate / alias observations

- **`pulsing` ≡ `zoom-pulse`.** Exact duplicates in source and, measured, byte-identical rendered
  series (the whole sampled matrix sequence is identical). `pulsing` writes its stops as
  `50%, from, to`; `zoom-pulse` as `0%, 50%, 100%` — the same timeline. Decision recorded, not
  implemented: keep both as vocabulary (drop-in familiarity), alias one later, or deprecate one at a
  major boundary. There is one exact duplicate group in the catalog and this is it.
- **`reveal-{down,up,left,right}` ≡ `unmask-{top,bottom,right,left}`** — the clip geometry is
  identical stop for stop; `reveal-*` adds `opacity 0 → 1`. Four near-alias pairs; the fade is the
  only difference.
- **`square-out-*` ↔ `mask-*` and `square-in-*` ↔ `unmask-*`** — the four corner pairs in each
  direction are identical geometry with different zero spellings (`0` vs `0%`), so five pairs on the
  exit side and four on the entrance side. (`square-in` and `unmask` themselves are _not_ aliases:
  `square-in` collapses from the centre point, `unmask` starts from the centre band.)
- **`word-slide` ≈ `fade-in-up`** — both fade in while translating up; the distance differs
  (20px vs 60px) and the transform spelling differs.
- **43 stop-for-stop reversal pairs** (the catalogue's in/out convention, including the three new
  pairs). Recorded so a mirror is not later mistaken for a duplicate — the promotion inventory
  carries the full list.

## E. Browser-specific issues

- **Cross-engine agreement.** Chromium and Firefox produced identical verdicts on every measurement
  in this pass: the same zero sweep flags, the same coverage maps, the same matrices, the same origin
  drift, the same filter padding.
- **WebKit could not be measured on this host** — Playwright 1.63.0's pinned build (26.6) segfaults
  when a page is created on macOS 26.0.1 (recorded in the promotion pass, with crash reports at
  `~/Library/Logs/DiagnosticReports/Playwright-*.ips`). The audit therefore reports two engines, and
  the same harness runs WebKit through the compatible Playwright 1.56.1 installation when
  `JUMI_WEBKIT_MODULE` names it. No finding above depends on a Chromium-only behaviour; the
  orthographic-3D and filter-padding results were both confirmed in Firefox.
- **`filter` list padding** (Chromium and Firefox): a shorter filter list is padded with a transparent
  function, so `neon` interpolates rather than snapping. Worth keeping in the record because it
  contradicts the common assumption that different list lengths are discrete.
- **Pointer behaviour of an exit left invisible** (measured): `fade-out` with `forwards` ends
  `opacity: 0, visibility: visible` and still receives `elementFromPoint`; `slide-out-left` ends
  `visibility: hidden` and does not. `slide-out-*` are the only exits that disable hit-testing, which
  is deliberate but worth documenting for everyone using `forwards` to stage a departure.

## F. Recommended implementation queue

Correctness first, polish second. Every item names the classification and whether a product decision
is required before implementation.

| #   | Item                                                                                                                                                                                                                                                 | Classification                        | Product decision?                                | Status                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| 1   | Repeat `transform-origin` in every stop of `accordion`, `fold-in`, `fold-out`, `unfold-x`, `unfold-y` (B1)                                                                                                                                           | adjust origin                         | endpoint unchanged; trajectory changes — approve | **implemented**, `dcc594d` (G)                         |
| 2   | Add an explicit `0%` stop to `swing` (B2)                                                                                                                                                                                                            | adjust keyframes                      | approve (first 20% of public motion)             | **implemented**, `dcc594d` (G)                         |
| 3   | Decide `lift`'s contract: return to rest, or document a pose (B3)                                                                                                                                                                                    | adjust keyframes / documentation      | yes                                              | **implemented as return to rest**, `dcc594d` (G)       |
| 4   | Remove the inert `transform-origin` from `expand-right`/`expand-up`; document the real anchor of all four (B4)                                                                                                                                       | adjust origin / documentation         | removal is safe; renaming is a separate decision | **removal implemented**, `dcc594d`; documentation open |
| 4b  | Clarify in the docs that `expand-left`/`expand-down` anchor at the leading/top edge like their pair (B4)                                                                                                                                             | documentation                         | no                                               | open                                                   |
| 5   | Decide `diamond-in`/`triangle-in*` endpoints, and make the four triangles consistent (B5)                                                                                                                                                            | adjust keyframes **or** documentation | yes                                              | **implemented as full reveal**, `dcc594d` (G)          |
| 6   | Document `typing`'s containing-block contract and the shrink-wrapped-parent recipe (B6)                                                                                                                                                              | documentation                         | no                                               | open                                                   |
| 7   | Document `accordion`'s fixed 500px/1000px ramp (content taller than 1000px stays clipped under `forwards`; a 40px element completes its reveal at ≈5% of the timeline) and `mask-*`/`diamond-in`/`triangle-in`'s dependence on `animation-fill-mode` | documentation                         | no                                               | open                                                   |
| 8   | `zoom-out-elastic` envelope (C)                                                                                                                                                                                                                      | adjust timing                         | yes — perceptual only                            | excluded from this pass                                |
| 9   | Alias decisions: `pulsing`/`zoom-pulse`; `reveal-*`↔`unmask-*`; `square-*`↔`mask-*`; `word-slide`↔`fade-in-up` (D)                                                                                                                                   | duplicate/alias observation           | yes — separate API pass, deliberately not now    | excluded from this pass                                |

Items 1–5 change public motion and all of them are small, local edits to `effects.ts`; item 1 and 4
cannot change any rendered endpoint. Items 6–7 change no motion at all and could land immediately.
Items 8–9 are optional.

## G. Implemented disposition — the approved corrections pass

Items 1–5 were approved with their stated decisions and implemented in `dcc594d`. 21 of the 235
definitions changed, all inside `src/keyframes/effects.ts`; the catalog is still 235. Each claim was
measured before and after in the browser at the authored offsets and at the midpoints between them,
with the same instrument for both records: 23 watched effects — the 21 changed names plus
`expand-left`/`expand-down` as untouched controls — and zero instrument diagnostics in either phase.
The before record ran in Chromium 153.0.8010.12 and Firefox 155.0; the after record adds WebKit 26.0
through the compatible Playwright runner.

| Approval | Change                                                                               | Before                                                                                                                                                                                                                                                                                      | After                                                                                                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Fixed origins kept fixed through every stop (`accordion`, `fold-in`, `fold-out`)     | 5 distinct computed origins across the animation — `accordion` `100px 0px → 100px 30.8px → 100px 53.1px → 100px 58.5px → 100px 60px`; `fold-in`/`fold-out` `100px 120px → … → 100px 60px`. The declared pivot interpolates toward the element's own origin, so it is only the pivot at `0%` | 1 distinct value at every authored offset and midpoint: `accordion` `100px 0px`, `fold-in`/`fold-out` `100px 120px`, in Chromium, Firefox and WebKit                                                                               |
| 1        | `unfold-x`, `unfold-y` state `center` instead of leaning on the element's own origin | already 1 distinct value — the declaration was true but implicit                                                                                                                                                                                                                            | unchanged (1 distinct) and now declared at `50%`, `80%`, `100%`                                                                                                                                                                    |
| 2        | `swing` gains an explicit `0%` rest state                                            | with a `rotate(20deg)` base it reads `20°` at `t=0` against `0°` with no base: the effect's first fifth belongs to the host element, not the effect                                                                                                                                         | both bases produce the identical series `0° → 6.128° → 12.036° → 14.407° → 15° → -10° → 0°`                                                                                                                                        |
| 3        | `lift` keeps its lifted pose as the perceptual peak and returns to rest              | `100%` was `translateY(-5px) scale(1.02)`, so the loop seam and any non-`forwards` run drop 5px and 2% of scale instantly                                                                                                                                                                   | `[t, translateY, scale]` = `0:0:1`, `500:-5:1.02`, `1000:0:1`; largest step 2.04px, in all three engines                                                                                                                           |
| 4        | `expand-right`, `expand-up` lose the inert `transform-origin`                        | declared an origin their keyframes never used                                                                                                                                                                                                                                               | per-frame `x/y/width/height` identical before and after, and identical to the `expand-left`/`expand-down` controls that never declared one                                                                                         |
| 5        | `diamond-in`/`diamond-out` and the ten triangle reveals end past the element         | terminal coverage ≈ 0.48 on the audit's 200×120 box — the reveal stops at half the element, and the five triangle directions disagree about which corner they keep                                                                                                                          | terminal coverage 1.0 with zero enclosed holes on 200×200, 320×120 and 120×320 boxes; monotone intermediates (`diamond-in` 0 → 0.41 → 0.97 → 1, `triangle-in` 0 → 0.65 → 1.0 → 1); each `-out` is its `-in` reversed stop for stop |

**The five claims, restated as results.** (a) The fixed origins stay fixed numerically throughout
interpolation: 1 distinct computed value per effect at every sample, three engines. (b) `swing` is
independent of a non-identity underlying transform: the two series are equal element for element.
(c) `lift` reaches the intended peak and returns continuously to identity: peak `-5px`/`1.02` at
500ms, `1000ms` reads `0`/`1`, no step larger than 2.04px. (d) Removing the expand origins produces
equivalent computed geometry: per-frame boxes equal, and equal to the two controls. (e) The diamond
and triangle reveals have zero uncovered pixels at the final frame and sensible intermediates on
square, wide and tall boxes: 36 cases (3 shapes × 12 effects) measured in each of 3 engines — every
`-in` reaches 1.0, every `-out` starts at 1.0, no case has an enclosed hole.

**Emission and snapshot.** The regenerated CSS snapshot is **byte-identical** to the recorded one —
`pnpm css:snapshot` rewrites `snapshot.css` and `structure.json` with no change, because the snapshot
corpus references none of the corrected effects. The 21 changed keyframe emissions in the records
are therefore the whole diff: no unrelated emission moved, and the two effects that were left alone
but still watched (`expand-left`, `expand-down`) emit byte-identical keyframes. Gate: 19/19 stages,
exit 0 (`pnpm check`).

**Left alone by instruction.** `zoom-out-elastic`, the alias groups, distance-unit normalization,
`slide-out`'s visibility behaviour and the naming asymmetries were explicitly out of scope for this
pass. The documentation items were closed separately — see H.

## H. Documentation closure — items 4b, 6 and 7

The three documentation items were the last of the queue, and they are written rather than recorded:
the four effect families they concern had no page of their own, only catalog entries.

**A new page, [sized effects](/docs/sizing-effects/),** covers the three effects whose keyframes
animate a dimension, and it carries all three items at once because they are the same question — what
the box has to be for the motion to read as intended.

- **Item 4b, the expand family.** All four grow from the leading edge — left for the horizontal pair,
  top for the vertical pair — and the page says why a percentage width cannot do anything else. It
  states the consequence the audit found: `expand-left` grows rightward exactly as `expand-right`
  does, so the names choose a reading, not a physical direction. Growing toward the far edge needs a
  container anchored there, because no `transform-origin` can move a percentage.
- **Item 6, `typing`.** The containing-block contract is stated with the measurement behind it (a
  46.7px line in a 320px column is fully visible at about 11% of the timeline), together with the
  requirement that makes the effect read as typing at all: `overflow: hidden` and
  `white-space: nowrap`. The shrink-wrapped-parent recipe is the page's answer — `inline-block` or
  `width: fit-content`, so `100%` is the length of the line and the animation ends on the last
  character.
- **Item 7, `accordion`.** The 500px/1000px ramp is documented as a ceiling rather than as `auto`,
  with both consequences: content past 1000px is held at that edge under the default `forwards` fill
  (and clipped where the panel sets `overflow: hidden`, which an accordion normally does), and a 40px
  panel finishes opening at about 5% of the timeline. The pivot is named as the top edge, in every
  stop.

**Item 7's second half, [reveals](/docs/reveals/) — "A clip lasts as long as the fill does".** The
dependence is stated where the clip family is taught: `mask-*`, `unmask` and the `-out` exits hold
their endpoint only because the default fill is `forwards`, and `animation-fill-mode-none` releases
the clip the moment the animation ends. The section also records what the corrections changed: after
`dcc594d` the entrances in this family — `diamond-in`, the five `triangle-in` variants, and the
`circle-in`/`square-in`/`reveal-*`/wipe members that already did — reach full coverage, so releasing
the clip no longer pops them in. The fill-mode dependence is now a property of the effects that
_conceal_, not of the reveals that used to stop half-way.

**Related drift, fixed in the same pass.** `CONTRIBUTING.md` said the gate ran "all eighteen stages"
and `scripts/check.mjs` described its pool as sixteen; the gate has been nineteen stages since the
`scroll-driven` and `studio` stages landed, so both now say nineteen and the contributor list names
the four checks it had never listed (`effects`, `view-transition`, `scroll-driven`, `studio`).

## Appendix — the numbers behind the findings

**Coverage (Chromium, 200×120 element, paused, `fill-mode: both`; full coverage = 0.9488 of the
2px-padded screenshot).** Entrance terminals: `circle-in*`, `square-in*`, `reveal-*`, `unmask-*`,
`radial-wipe-in`, `blinds-in-*` → 0.9488; `diamond-in` → 0.4822; `triangle-in` → 0.4791;
`triangle-in-bottom-left` → 0.4775; `-bottom-right` → 0.4783; `-top-left` → 0.4783; `-top-right` →
0.4791. Exit starts are the same values (the pairs are exact reversals). `mask-center` ends on its
band at 0.1898 and `unmask` starts there. No clip effect produced a single enclosed hole pixel at any
of `0/25/50/75/100%`.

**Origin drift (Chromium; computed `transform-origin` at `0/250/500/750/1000ms`).** `fold-in`:
`100px 120px → 95.49 → 71.86 → 62.37 → 60px`. `accordion`: `100px 0px → 24.51 → 48.14 → 57.63 →
60px`. `hinge-drop` (the control, origin declared in all six stops): `0px 0px` at every sample.

**Hinge attachment (Chromium, three element sizes, `0/250/500/699/701/1000ms`).** Displacement of the
point at the declared origin: `0, 0, 0, 0, 0.01, 144px` for 200×120; `…, 288px` for 80×240; `…, 72px`
for 300×60 — 120% of each element's height, and stationary to within 0.01px until the release.

**Arc pivot travel (Chromium, three sizes).** The point at the declared origin moves
`0 → 10.84 → 60.99 → 63.64px` over the entry, identically at 200×120, 80×240 and 300×60 — the pivot
is the declared edge centre and the effect also translates.

**Stop statistics.** 2–10 stops per effect (mean 2.94); five effects contain an explicit hold
(identical consecutive stops) — `heart-beat`, `jello`, `pulsing`, `tada`, `wobble` — all of them
loop rests, none redundant. `transform-origin` is declared by 16 of 235 effects; the rest rely on the
default centre, which is correct for the scale-led and clip families.

**Direction audit.** 124 directional names; an entrance travels away from its named side, an exit
toward it; no disagreements except the four `arc-*` names, which follow the entrance convention by
substance.
