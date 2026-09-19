# Effect catalog discovery — 19 September 2026

## Decision

**Keep the catalog at 228 for now. Research three strong semantic additions: an angular wipe, repeated-strip reveals, and a hinge-and-release exit. Keep a feathered wipe as a conditional fourth.** These are proposals, not approved names or implementations.

Most apparent omissions resolve to an existing effect, a parameter variation, a composition, or a scene/runtime concern. Adding orbit, breathe, curtain, card-flip, parallax, or spring under new effect names would mostly increase vocabulary without increasing capability.

There is also a separate, verified public-surface gap: stroke-dash properties have internal metadata but the expected public property-animation classes do not emit keyframes. A named `draw` effect should not be used to conceal that distinction. No fix is proposed in this pass.

**Resolved the same day — see [Resolution](#resolution--19-september-2026).** Prototyping promoted seven of the candidates (`radial-wipe-in/out`, `blinds-in/out-x/y`, `hinge-drop`), kept the feathered wipe as a documented recipe, and fixed the stroke-dash public routes. The catalog is **235**. The original decision above is kept as the baseline the promotion was measured against.

## Scope and evidence

Audited HEAD: `e77624cba033317f37d1c3136869a677b2c2a407`. The working tree was clean at the start. Production code and existing keyframe definitions were not changed. This report and its [machine-readable inventory](2026-09-19-effect-discovery.inventory.json) are the deliverables.

The inventory records every effect's exact public class, primary semantic family, authored properties and keyframes, plus source hash, emitted-catalog counts and narrow property-route probes.

Read directly:

- [Effect registry](../../src/keyframes/effects.ts), including the `cssEffects` export built from its keys.
- [Public tween registration](../../src/properties/tween.ts), especially the `animate` matcher and selected property matchers.
- [Generated docs catalog](../../docs/src/data/effects.json) and [generated Storybook catalog](../../stories/animations/effects.generated.ts).
- [Docs generator](../../scripts/prepare-docs.mjs), [Storybook generator](../../scripts/prepare-stories.mjs), and [effect-model architecture](../architecture/effect-model.md). The architecture note's old example spelling is not treated as current API authority.
- Current property/phrase/control documentation and [research rules](../research/rules.md).

Verification:

| Surface | Result |
| --- | --- |
| Evaluated registry keys | 228 |
| Evaluated `cssEffects` keys | 228 |
| Generated docs entries | Same 228 names |
| Generated Storybook entries | Same 228 names |
| Fresh bundle → Tailwind compile → shipped finalizer | 228 effect keyframes; all 228 individual effect selectors present; no warnings |
| Additional emitted selector rules | Two shared selector-list rules, not two additional effects |
| Exact normalized keyframe duplicate groups | One: `pulsing`, `zoom-pulse` |

**Regenerated after the resolution pass** ([Resolution](#resolution--19-september-2026) below): the
inventory now carries **235** registry keys, 235 docs entries, 235 Storybook entries, 235 emitted
effect keyframes and 235 individual effect selectors — the seven promotions are recorded in its
`promotion` block. The counts in this table remain the discovery measurement they were taken at.

The source contains explicit definitions, not a hidden Cartesian expansion. `cssEffects` makes one public name per definition; the docs and Storybook generators enumerate those names. There are **66 spelling-prefix groups**, but those are sidebar organization, not 66 independent motion concepts. The taxonomy below uses 11 semantic groups instead.

A fresh `pnpm bundle` preceded the emission census. The census used `scripts/lib/compile.mjs` with `@import "tailwindcss" source(none)` and the freshly bundled plugin, passed all `animate-${name}` candidates through `build()`, then parsed the finalized CSS with PostCSS. Duplicate detection expanded grouped stops, normalized `from`/`to`, and sorted declarations. It did not equate arbitrary transform matrices or claim visual equivalence from text.

**Evidence limit:** this is a source/emission and external-reference discovery pass. No new-effect browser prototypes were built. Emission proves availability, not interpolation quality, smoothness, or cross-browser fidelity. Candidate browser caveats below are research requirements, not passed tests. Existing keyframe quality remains deliberately unreviewed.

## A. Catalog map

Each name appears exactly once in this primary taxonomy. Effects can have secondary roles: a translated entrance may also scale; a flip can also fade. Counts do not add those secondary roles again.

| Primary family | Count | Semantic coverage / density |
| --- | ---: | --- |
| Translated arrivals and departures | 47 | Cardinal entrances/exits, overshooting arrival, short peek, diagonal entry, layered entry |
| Scale-led arrivals and departures | 29 | Zoom, bounce, elastic zoom, turn-and-scale arrival, tilted zoom |
| Planar turns and spiral travel | 16 | Full rotation, pivoted arc arrival, twist, hinge release, spiral scaling and spiral approach |
| 3D orientation and folding | 24 | X/Y flips, half-turn cards, diagonal turns, wobble, fold/unfold |
| Hard clipping and apertures | 61 | Circle, square, triangle, diamond; edge/corner collapse and reveal; center band; angular sweep and parallel apertures |
| Layout and display opening | 7 | Dimension expansion, accordion-like entry, power-on/off squeeze |
| Attention, oscillation and activity | 24 | Pulse, shake, swing, wobble, float, flicker, heartbeat, irregular excursion |
| Shear | 10 | Cardinal and diagonal skew; skew entrance/exit |
| Light, focus and surface cues | 7 | Blur, glow, hue cycle, text shadow, moving shimmer |
| Material-like deformation and bursts | 6 | Bubble, drip, melt, splash, burst and implosion |
| Typographic presentation | 4 | Tracking, width-based typing, word slide |
| **Total** | **235** | |

Source-property census: 157 effects write `transform`; 129 write `opacity`; 55 write `clip-path`; six write `filter`. Counts overlap. None writes a `mask-*`, `offset-*`, `stroke-dasharray`, or `stroke-dashoffset` property. This is a statement about **named effects**, not the entire public property API.

Important semantic distinctions:

- `mask-*` / `unmask-*` are polygon **clips**, not alpha/luminance masks.
- `morph` changes scale/skew; it is not arbitrary SVG-path morphing.
- `scatter` is one element's excursion and return, not distribution of children.
- `slide-stack` moves one element and changes its z-index; it does not arrange a stack of siblings.
- `typing` changes width; it does not split text, discover graphemes, or generate a caret.
- `spring-*` are predetermined keyframes; they are not velocity-aware spring simulations.
- Loop-friendly geometry does not itself request infinite playback. Iteration, direction and timing are controls.

### Canonical members

The full membership list follows in Appendix A. It is generated from the evaluated registry and checked for exactly-once coverage; it is not a list reconstructed from effect names in examples.

### Aliases and near-duplicates

These observations serve deduplication only. They are not instructions to remove or edit an existing definition.

| Names / relationship | Finding | Consequence for additions |
| --- | --- | --- |
| `pulsing` ↔ `zoom-pulse` | Identical declared keyframes after normalizing `from`/`to` and ordering; also identical under that normalization in emitted CSS | Do not add `pulse` or `breathe` just to obtain another spelling |
| `square-in-{corner}` ↔ `unmask-{corner}` | Same authored corner-to-rectangle polygon trajectories, with zero-unit spelling differences | Do not add a third corner-reveal family; not claiming a browser comparison here |
| `square-out-{corner}` ↔ `mask-{corner}` | Corresponding rectangle-to-corner trajectories | Same restraint on corner exits |
| `reveal-down/up/right/left` ↔ `unmask-top/bottom/left/right` | Matching clip geometry, but reveal adds opacity; direction words refer to different aspects of movement | Not exact aliases; plain “wipe” risks another overlapping name |
| `bounce-in` ↔ `zoom-in` | Same broad scale-arrival idea with different overshoot values; not identical frames | More overshoot amounts are parameter choices, not new semantics |
| `zoom-pulse`, `zoom-pulse-grow`, `zoom-pulse-shrink` | Related scale-cycle amplitudes/signs | “Breathing,” “pop,” and “throb” need evidence beyond new amplitudes |
| `word-slide` ↔ `fade-in-up` | Both translate upward into place while fading; different distance/transform spelling | Text use alone does not establish a new geometry |
| `glow` ↔ `neon` | Related drop-shadow modulation; different shadow stacks | Brand/style recipes should not automatically become effects |

The exact-normalization census yields 227 distinct declared timelines, **not** 227 distinct perceived motions. Semantic similarity is broader, and no exhaustive visual deduplication was attempted.

## B. Strong additions to consider

“Strong” means the missing semantic concept is credible. It does not mean a production implementation has passed a browser gate. All proposed names are working labels.

### B1. `radial-wipe-in` / `radial-wipe-out`

- **Family / visual:** angular reveal. A boundary rotates around a center and progressively exposes a sector, like a clock hand sweeping out an image.
- **Evidence:** Adobe distinguishes a radial wipe from linear and iris-style reveals in its [transition reference](https://helpx.adobe.com/after-effects/desktop/apply-effects-and-animation-presets/list-of-effects/transition-effects.html). The missing concept is changing angular coverage, not adopting Adobe's catalog wholesale.
- **Closest Jumi:** `circle-in/out`, `reveal-*`, `rotate-left/right`.
- **Distinctness:** a circle grows radially; a wipe increases angle. Rotating an element moves its content, rather than progressively exposing stationary content. Changing a circle's origin/radius cannot produce this geometry.
- **Likely CSS:** animated compatible `clip-path` geometry, or a static conic-mask construction driven by an animated typed angular value. Do not assume changing gradient strings interpolates.
- **Intent / variants:** both entrance and exit. Clockwise/counterclockwise are meaningful; cardinal start angles are parameters. Begin with one centered geometry, not many corner/angle names.
- **Composition:** potentially independent of translation/scale/rotation because it can own the clip or mask alone. It conflicts with another animation of the same clip/mask. Naming motions does not resolve a property collision.
- **Browser/interpolation caveats:** polygon approximation must keep compatible vertices and avoid wedges crossing/self-intersecting around a full revolution; non-square boxes change apparent angular speed. A gradient route must prove its typed progress path in current Jumi and test actual browser interpolation. Mask paint cost and the zero/full-coverage seam need observation.
- **Confidence:** high that the semantic gap exists; medium that it belongs as a self-contained effect in the current model.
- **Disposition:** strong prototype candidate. If it requires a new public progress primitive or editor-only state, stop and report that requirement; do not add it in this exercise. A scene recipe is preferable to an effect with hidden prerequisites.
- **Resolved:** added as `radial-wipe-in` / `radial-wipe-out` — a fixed polygon fan and nine stops, no new primitive, `clip-path` the only property owned. See [Resolution](#resolution--19-september-2026).

### B2. `blinds-in` / `blinds-out`

- **Family / visual:** repeated apertures. Multiple parallel strips reveal the *same stationary surface* together, leaving alternating visible and hidden regions during the transition.
- **Evidence:** the same [Adobe reference](https://helpx.adobe.com/after-effects/desktop/apply-effects-and-animation-presets/list-of-effects/transition-effects.html) describes Venetian-blind reveals as strips. That topology is absent from all 55 existing Jumi clips.
- **Closest Jumi:** `reveal-*`, `mask-center`, `unmask`, `square-in/out`.
- **Distinctness:** current clips expose or hide a single connected region. More strip boundaries are not a different origin or distance. This is not “apply reveal to several children”: the intended subject is one image/component without duplicating it into strips.
- **Likely CSS:** repeated mask geometry and a compatible animated mask parameter; alternatively, fixed-count compatible clip geometry. The first research question is whether either can remain understandable and artifact-free.
- **Intent / variants:** both entrance and exit; horizontal/vertical are meaningful. Strip count/width are parameters or a modest fixed default, not separate effect names. Staggering strips is a later composition, not required for the concept.
- **Composition:** independent of transform/opacity if the effect owns only its reveal surface. Conflicts with other mask/clip owners; may clip shadows and descendants. Layered 3D card flips are a different multi-element scene.
- **Browser/interpolation caveats:** repeating gradient stop interpolation is not assumed; simple mask-size animation must not merely change strip frequency. Polygon connections can leave seams. Test device-pixel ratios, fractional sizes, tall/wide content, reduced-motion final visibility and paint cost.
- **Confidence:** high semantic distinction; medium packaging confidence.
- **Disposition:** strong prototype candidate, but promote only if it works on one element with a clear static contract. If it needs duplicated content or generated strip DOM, keep it a Studio composition instead.
- **Resolved:** added as `blinds-in-x`, `blinds-in-y`, `blinds-out-x`, `blinds-out-y` — one polygon per element, five apertures, no duplicated or sliced content. See [Resolution](#resolution--19-september-2026).

### B3. `hinge-drop`

- **Family / visual:** constrained movement followed by release. A surface hangs from one corner, swings around that attachment, then detaches and falls away.
- **Evidence:** Animate.css's [hinge source](https://raw.githubusercontent.com/animate-css/animate.css/main/source/specials/hinge.css) demonstrates the recognizable sequence of corner rotation followed by departure. It is evidence for the concept, not a keyframe template to copy.
- **Closest Jumi:** `swing`, `arc-*`, `fall-*`, `fold-out`, `throw-*`.
- **Distinctness:** Jumi's `swing` settles; `arc-*` arrive; `fall-*` land; `fold-out` closes around an attached edge. None encodes “attached, unstable, released.” Merely reversing an arrival does not establish that sequence.
- **Composition filter:** it can be authored as phrases, as any fixed effect can. Simply stacking existing `swing` and `fall-*` does not reproduce the constraint handoff: their endpoints, direction and transform ownership differ. This earns consideration as a semantic macro, but if a clear two-stage existing-effect recipe proves equally good, prefer that recipe.
- **Likely CSS:** `transform` or separate rotate/translate, a stable `transform-origin`, opacity near departure, and segment timing. Keep the attachment point fixed until release rather than moving it unintentionally with the origin.
- **Intent / variants:** exit. Top-left/top-right attachments may justify a mirror; upward “gravity” and an automatic entrance inverse do not. A horizontal or arbitrary launch belongs to parameterized choreography.
- **Composition:** do not call it freely composable. It owns transform/origin and usually opacity; use a wrapper when combining with other transform effects. SVG needs explicit transform-box/origin context.
- **Browser/interpolation caveats:** avoid a discontinuity when changing from rotation to translation; ordered transform lists matter. Exit distance depends on clipping/scene size. It must not claim to remove layout or manage focus after a visual exit.
- **Confidence:** high semantic distinction; medium confidence that this expressive exit is common enough to ship.
- **Disposition:** strong, small prototype candidate. Evaluate on a card, notification and decorative illustration; reject if it only reads well in one contrived demo.
- **Resolved:** added as `hinge-drop`, after a card / toast / illustration comparison and an explicit comparison against an existing `swing` → reversed-`fall` composition. See [Resolution](#resolution--19-september-2026).

## C. Possible addition

### C1. `feather-wipe-in` / `feather-wipe-out`

- **Family / visual:** soft spatial reveal. A band of partial transparency moves across stationary content, with fully hidden content behind one side and fully visible content behind the other.
- **Evidence:** the [CSS Masking specification](https://www.w3.org/TR/css-masking-1/#intro) distinguishes alpha/luminance masking from clipping. This is the useful gap: localized partial visibility, rather than a hard edge or whole-element fade.
- **Closest Jumi:** `reveal-*`, `unmask-*`, `blur-in/out`, `shimmer`.
- **Distinctness:** adding global opacity to a hard clip does not feather its boundary; blur also changes the content itself. `shimmer` moves the element, not a reveal boundary over it.
- **Likely CSS:** static alpha-gradient `mask-image`, explicit mask extent/repeat, animated `mask-position` or `mask-size`. The public `animate-mask-position-[100%_0%]` route emits a keyframe in the narrow compile probe; this does not establish the finished effect.
- **Intent / variants:** both; horizontal/vertical direction is useful. Feather width is a parameter.
- **Composition:** transform-independent; conflicts with existing masks and may change stacking/paint behavior. Existing masked assets require explicit mask composition, not accidental replacement.
- **Browser/interpolation caveats:** verify percentages against the mask positioning area, full coverage at both endpoints, no repeats/leaks, and text sharpness. A fixed image with animated position avoids assuming mask-image interpolation, but still needs browser testing.
- **Confidence:** medium.
- **Disposition:** **recipe first**, effect only if the static setup can be made reusable without surprising mask replacement. It may ultimately belong in composition docs, not the registry. Do not inflate this into separate fog, mist, dissolve and soft-reveal names.
- **Resolved:** the recipe carried it. The static mask, its extent and its repeat stay in the author's CSS; `animate-mask-position-*` moves it. Documented on [Reveals & exits](../../docs/src/pages/docs/reveals.md) instead of adding a preset. See [Resolution](#resolution--19-september-2026).

## D. Rejected candidates and better homes

“Rejected” here means rejected **as a new named effect in this pass**, not that the visual treatment is undesirable.

| Concept researched | Classification | Decision / closest route |
| --- | --- | --- |
| Pulse / breathe / throb / pop | Alias or amplitude/timing variation | `pulsing`, `zoom-pulse*`, `heart-beat`; use controls/phrases |
| Float / bob / drift / pendulum | Existing motion or composition | `floating`, `swing`, `wave`; add position/origin/timing intentionally. Horizontal drift is not a new category |
| Tremor / buzz / head-shake | Parameter variation or composition | `shake`, `glitch`, `wiggle`, `flip-wobble-y`; frequency, amplitude and an axis do not establish a new semantic family |
| Recoil / settle / overshoot / snap | Parameter/segment timing | Existing bounce, spring, rush and elastic families, or a property phrase with appropriate timing. User-driven velocity is a runtime concern |
| Rubber band / jelly | Existing deformation | `elastic`, `jello`, `morph`, `distort` cover the concepts; retain current names |
| Roll in/out | Translation + rotation composition | Author coordinated rotate/translate/opacity; distinguish decorative rolling from physically constrained rolling. Do not add a synonym for `throw`/`back`/spiral-like coordinates |
| Puff / vanish / fog entrance | Blur + scale + opacity composition | `blur-in/out` plus a scale phrase/appropriate zoom. Whole-property filter ownership must be explicit |
| Light-speed / swoosh | Existing skewed arrival/departure | `rush-in/out-*`; speed and skew amount are parameters |
| Iris / aperture | Existing reveal | `circle-in/out`; elliptical or shifted-center geometry is a parameter choice |
| Curtain / single shutter / center slit | Geometry parameterization | `unmask`/`mask-center` and arbitrary clip phrases. A full closed-to-open slit changes endpoints; it is not the repeated-strip topology proposed above |
| Diagonal wipe / chevron wipe / diamond wipe | Usually polygon parameterization | Existing polygon families and clip phrases; no name multiplication without a distinct UI reason |
| Card flip / rigid door / rigid page turn | Existing 3D orientation plus scene structure | `flip-card-x/y`, `flip-in-*`, origin/perspective. Two faces need actual scene markup |
| Curled page / peeling sticker | Too scene/material dependent | Actual bending, back surface and shading are not a rigid flip. Keep as a dedicated composition, SVG/mesh/media treatment, not a generic keyframe promise |
| Stack/unstack / fan / scatter/gather | Multi-element choreography | Studio/examples; sibling positions, count and order are external to one effect. Existing `scatter` and `slide-stack` do not solve this automatically |
| Orbit / ellipse / perimeter travel | Existing property route | Declare a native offset path and animate `offset-distance`; [Jumi already documents this](../../docs/src/pages/docs/properties.md). A new fixed-radius effect adds little |
| Parallax / depth reveal | Driver + geometry + composition | Scroll timeline/range plus transform/perspective. Jumi effect naming should not encode a scroll layout |
| Dolly / fly-through | Parameterized depth transformation | Perspective and translate-Z with opacity where required; camera/scene assumptions prevent a broadly useful fixed preset |
| Skeleton / shine / shimmer stripe | Existing motion plus visual styling | `shimmer` on an appropriate overlay; gradient, clipping and pseudo-element belong to CSS |
| Loading dots / spinner / radial activity | Existing motion + repetition/choreography | Rotate/pulse and stagger. An indeterminate algorithm is not made correct by naming it an effect |
| Underline draw / border sweep / hover lift | Component decoration or transition | Pseudo-element geometry, state transitions, scale/size; Hover.css is useful reference, not evidence of missing keyframe categories |
| Text focus / tracking / word reveal | Existing effect or composition | `blur-*`, `letter-space-*`, `word-slide`; clipping wrappers and stagger |
| Split letters / scramble / counter / typewriter engine | Runtime/content transformation | Grapheme segmentation, text mutation and counts are not generic keyframes. `typing` is only a width animation |
| Shared-element movement / FLIP / reordering | Browser/runtime behavior | View transitions or measured layout mechanisms; do not add a `morph-layout` effect |
| Real spring / inertia / magnetic cursor | Interaction physics | Fixed `spring-*`/`magnetic` keyframes do not acquire dynamic targets or velocity. [Motion's spring model](https://motion.dev/docs/spring-value) illustrates the separate runtime concern |
| SVG stroke trace / erase / marching dash | Property recipe, with a current public-route gap | See Appendix B. Do not smuggle property registration into a named preset |
| Arbitrary SVG path morph | Asset correspondence / context | Compatible source/target path data are essential. A universal named `morph` would overpromise |
| Checkerboard / random tile dissolve | Scene/segmentation treatment | Revisit only after strip reveals prove useful. Tile counts, order and randomness are a composition problem; not yet a strong single-element effect |
| RGB glitch / liquid distortion | Layer/filter scene setup | Existing `glitch`/`distort` cover simpler attention; true channel separation/displacement needs extra visual structure, not another synonym |

External comparisons were conceptual, not parity checklists: [Animate.css](https://animate.style/), [Magic](https://www.minimamente.com/project/magic/), and [Hover.css](https://ianlunn.github.io/Hover/) show many combinations of existing transforms, blur, origins and decoration. [Carbon](https://carbondesignsystem.com/elements/motion/overview/) and [Material motion](https://m1.material.io/motion/material-motion.html) emphasize intent and relationships; a design-system role does not require its own catalog keyframe. [Motion layout animation](https://motion.dev/docs/layout-animations) provides another clear example of behavior that depends on changing layout, not a predetermined effect.

## E. Meaningful asymmetries

These are catalog-shape findings, not keyframe correction requests. A missing inverse name is not automatically a missing motion.

| Existing family | Observed asymmetry | Assessment |
| --- | --- | --- |
| `back-in*` | Five entrances, no named back-out | Document reverse/phrase option first; do not add five exit names without distinct departure semantics |
| `arc-*` | Four pivoted arrivals, no named exits | Naming/coverage asymmetry; reversal already gives departure geometry |
| `flip-in-*` | Center X/Y and four edge entrances, no flip-out counterparts | Most noticeable 3D vocabulary asymmetry, but still not a new geometry. Research user intent before multiplying names |
| `slide-*` | Diagonal entrances only for up-left/up-right; elastic entrances only up/down; four basic exits | Axis/coordinate variants rather than distinct effects; keep out of new-effect queue |
| `spring-*`, `fall-*`, `throw-*` | Cardinal arrivals, no separately authored exits | A landing sequence is not necessarily improved by mechanically reversing it. No additions solely for symmetry |
| `fold-*` vs `unfold-*` | Fold pair is one edge-oriented Y treatment; unfold has X/Y with center origin | Origin/axis variation exists; no need for a matrix of combinations |
| `expand-*`, `accordion` | Open/expand names without close/collapse peers | Closing can reverse or use explicit size states. Intrinsic layout belongs to native CSS/state authoring, not another fixed-size effect |
| `mask-center` ↔ `unmask` | Asymmetric names for opposite center-band trajectories | Discoverability/documentation observation, not a missing effect |
| `letter-space-in/out` | Tracking endpoints are not a mechanically symmetric pair | Do not treat “contracting exit” as a new concept or change the definitions in this pass |
| `wave`, `swing`, `wiggle` | Related 2D rotational emphasis; 3D counterparts exist elsewhere as flip-wobble/tilt/wobbling | Taxonomy makes coverage visible; a matching naming matrix is unnecessary |
| SVG stroke treatment | No named trace and no public dash matcher found, despite internal metadata | Genuine coverage distinction, but primitive/API scope rather than permission to add a catalog preset |

Reversing an animation reverses its timing too; it does not prove a perceptually appropriate exit. That is why this report records asymmetries without recommending automatic inverse generation.

## F. Areas searched and considered complete for this pass

“Complete” means no additional *semantic preset* earned a recommendation from the sources examined. It does not mean all possible curves or combinations exist, or that existing quality was tested.

- **Basic fade, translate, scale and overshooting arrival:** extensive coverage. More distances, diagonal directions, and amplitudes belong to parameters.
- **Rigid planar/3D turning:** rotation, card flips, pivoted arrivals, tilt, fold and unfold cover the reusable motions found. Curled material is a separate rendering problem; hinge release is the one shortlisted semantic exception.
- **Pulse, shake, swing and elastic emphasis:** enough distinct rhythms and deformation mechanisms already exist. No new names for breathe, buzz, rubber-band or gentle variants.
- **Single connected hard reveals:** circle, rectangle, polygon and edge/corner clip mechanisms are well represented. The shortlist concerns angular coverage and repeated apertures, not another polygon outline.
- **Simple focus and light modulation:** blur, glow, neon, hue and shadow plus property composition cover the useful concepts examined. A beam or shine generally needs scene styling.
- **Basic text-container entrances:** tracking, fade/slide, blur, clip and width treatment suffice at the single-element level. Text splitting remains outside this catalog.
- **Path traversal:** named path effects are sparse, but the public offset-distance route already provides the general capability. No orbit preset is needed merely to increase the count.
- **Loading vocabulary:** existing loops and sibling timing cover ordinary spinners, pulses and dots. Application progress/state should remain outside keyframes.

## G. Recommended research queue — new effects only

No existing effect is ranked here. Do not begin prototypes until this discovery result is accepted.

| Order | Candidate | Why now | Promotion test / stop condition |
| --- | --- | --- | --- |
| 1 | Angular/radial wipe | Adds a visibly different reveal geometry to the densest family | One unchanged-content element; full range coverage; smooth angular progression; square/wide/tall cases. Stop if a new private progress mechanism is needed |
| 2 | Repeated-strip/blinds reveal | Tests a missing topology and whether one-element packaging is honest | Multiple apertures on one element; no duplicated content; no seams/frequency substitution. Demote to Studio composition if DOM slicing is necessary |
| 3 | Hinge-and-release exit | A small, understandable test of a new semantic sequence | Stable attachment, clear release, sensible departure across several uses. Reject if a simple existing-effect recipe is equally clear or usefulness is too narrow |
| 4 | Feathered wipe | Distinct mechanism, but likely a recipe rather than a preset | Compare static gradient + public mask-position recipe against proposed effect. Promote only if catalog packaging meaningfully reduces setup without hiding it |

A future prototype should compare entry/quarter/half/three-quarter/exit states, verify live Jumi animation before reading pixels, compare to an independently authored native reference with the same timing, and test Chromium/Firefox/WebKit rather than infer support from accepted CSS. Include reduced-motion end states, HTML/SVG where appropriate, and the same-property composition conflicts described above. A flat sample must not count as success.

## Resolution — 19 September 2026

The findings above were carried through in the queue's order. Prototypes were built outside the library
and measured against independently authored native references before anything was promoted; promotion
required the checklist in item 6 of the handoff (semantic distinctness, stable endpoints, meaningful
intermediate states, browser support, reduced-motion behaviour, no hidden DOM or runtime prerequisite,
property ownership, generated catalogs, fresh emission, duplicate check, full gate).

| Candidate | Verdict |
| --- | --- |
| Angular / radial wipe | **added** — `radial-wipe-in`, `radial-wipe-out` |
| Repeated-strip / blinds reveal | **added** — `blinds-in-x`, `blinds-in-y`, `blinds-out-x`, `blinds-out-y` |
| Hinge-and-release | **added** — `hinge-drop` |
| Feathered wipe | **documented recipe** — no named effect |
| Stroke-dash public routes | **fixed** — `animate-stroke-dasharray-*`, `animate-stroke-dashoffset-*` |

### What landed

| Public name | Mechanism | Property ownership | Endpoints |
| --- | --- | --- | --- |
| `radial-wipe-in` / `radial-wipe-out` | one `clip-path` polygon — a ten-vertex fan at the box centre, nine stops (0 → 100 in eighths); the boundary walks the perimeter clockwise from the top centre | `clip-path` | in: `0%` a degenerate sliver, `100%` the whole rectangle; out: the exact reverse |
| `blinds-in-x` / `blinds-in-y` / `blinds-out-x` / `blinds-out-y` | one `clip-path` polygon of twenty vertices — five parallel apertures, each opened by moving its own pair of edges; the axis names the direction each aperture opens | `clip-path` | `0%` five degenerate lines, `100%` full coverage (and the reverse) |
| `hinge-drop` | a `transform` list with a fixed `transform-origin: top left`: rotate 0 → 60 → 40 → 55 → 50, then a release into `translateY(120%)` with `rotate(65deg)` as `opacity` reaches `0`; segment easing is local (ease-out, then ease-in-out ×3, then ease-in) | `transform`, `transform-origin`, `opacity`, `animation-timing-function` | attached and stationary at `0%`, still attached at `70%`, gone at `100%` |

No new public progress primitive, runtime state or generated DOM was needed for any of the seven: the
reveals are a fixed fan and a fixed set of apertures, and the hinge is one transform list.

### Browser proof

Two passes, both pixel-compared against a reference the harness authors itself rather than against
another Jumi run: a prototype pass (**913** assertions, plain CSS keyframes) and a **shipped** pass
(**962** assertions — `scripts/effect-candidates-check.mjs`, the emitted Jumi effects compiled by the
real plugin and finalized by the shipped finalizer).

- Chromium 153.0.8010.12, Firefox 155.0 and WebKit 26.0 (the compatible runner below) — at device-pixel
  ratios 1, 1.5 and 2, at 160×160, 260.5×90.25 and 90.25×260.5.
- Samples per effect: `0`, `0.25`, `0.5`, `0.75`, `1`; the radial pair additionally at `0.0625` and
  `0.1875`, because its between-keyframe geometry is the claim.
- Differences are classified: a three-device-pixel neighbourhood around a native-reference raster edge
  is permitted (CSS polygons and SVG clip paths rasterize differently); **interior** differences —
  including any seam at the fully visible endpoint — must be exactly zero. Firefox's fractional-size
  differences were all of the first kind.
- The hinge is compared against a native `element.animate()` sequence of individual `rotate` /
  `translate` keyframes at `0`, `0.25`, `0.45`, `0.6`, `0.699`, `0.7`, `0.701`, `0.75`, `1`: box error
  under 0.06px on a card, a toast and an illustration, translation zero until the release and continuous
  across `0.699 → 0.701`.
- Every new effect is asserted live (exactly one running Jumi animation), at rest under
  `prefers-reduced-motion: reduce`, and owning only the properties listed above.
- The feather recipe is checked at five progress points on both axes: full opacity at one end, full
  concealment at the other, no repeated-mask leak, and no mask at all under reduced motion.

**Host caveat — recorded, not hidden.** Playwright 1.63.0's pinned WebKit (26.6, build 2359) segfaults
when a page is created on macOS 26.0.1 (`EXC_BAD_ACCESS` in WebKit/AppKit; reports at
`~/Library/Logs/DiagnosticReports/Playwright-*.ips`). Nothing in Jumi can fix that and reinstalling the
build does not. The harness therefore **probes each engine before running it**, skips one it cannot
launch *loudly and by name*, records it in `results.json` (`engines.ran` / `engines.skipped`) and fails
if fewer than two engines ran. WebKit proof for this promotion came from a compatible Playwright 1.56.1
installation (WebKit 26.0) named through `JUMI_WEBKIT_MODULE` — the same mechanism the gate stage uses
on any host whose pinned build cannot launch.

### Tests and catalogs

- `scripts/effect-candidates-check.mjs`, wired as `pnpm effects:check` and as gate stage #11 (`effects`):
  emission, ownership, geometry, the hinge sequence, the feather recipe, both SVG dash routes and the
  reduced-motion end states, in every engine the host can launch — 32.7s of the gate's 165.7s.
- `src/types/index.ts`: the seven names joined the `Effect` union. The `types` stage caught their absence
  (`tsc --noEmit`) while tsup's DTS build passed — the same split recorded for the motion-instance pass.
- Generated catalogs: `docs/src/data/effects.json` and `stories/animations/effects.generated.ts`, both at
  235, with three new Storybook families (`blinds`, `hinge`, `radial`) and their catalog stories.
- Docs: a new [Reveals & exits](../../docs/src/pages/docs/reveals.md) page (with its nav entry) covers,
  for every name that landed, what the motion represents, how it differs from the superficially similar
  existing effects (`circle-*`, `reveal-*`, `unmask-*`, `swing`, `arc-*`, `fall-*`, `fold-out`), whether
  it is entrance, exit or continuous, and its ownership and composition caveats; the feathered wipe is
  documented as a recipe; and the dash routes are documented under property animation on
  [Composing motion](../../docs/src/pages/docs/properties.md).
- The docs-class arm (`view-transition:check`) requires every class token in a documentation sample to
  resolve, and it rejected the recipe's page-local `feather-x`/`feather-y` classes. The sample now hooks
  its visible mask CSS through a `data-` attribute, which keeps the recipe in the page and the arm
  strict.

### Catalog integrity

| Measure | Discovery | After resolution |
| --- | ---: | ---: |
| Registry keys / `cssEffects` | 228 | **235** |
| Generated docs entries | 228 | **235** |
| Generated Storybook entries | 228 | **235** |
| Emitted effect keyframes | 228 | **235** |
| Individual effect selectors | 228 | **235** |
| Shared selector-list rules | 2 | 2 (unchanged) |
| Exact normalized duplicate groups | 1 (`pulsing`, `zoom-pulse`) | 1 (unchanged) |

- **No new duplicate, and no new near-duplicate.** No promoted name shares 0.5 or more of its normalized
  keyframe text with any other name: the nearest neighbours are the radial pair at 0.059, `hinge-drop`
  against `fade-out` at 0.087, and the blinds names at 0. (The metric is offset-pinned, so it cannot see
  a reversal — hence the separate check below.)
- **The new in/out pairs are stop-for-stop reversals**, and that is this catalog's existing convention:
  43 unordered reversal pairs in total, 40 of them pre-existing (`fade-*`, `bounce-*`, `circle-*`,
  `square-*`, `triangle-*`, `diamond-*`, `mask-*`/`unmask-*`, `power-*`, `skew-*`, `spiral-*`,
  `blur-*`). The inventory records them as `reversalPairs` so a mirror is not mistaken for a duplicate;
  the exit names exist as intent vocabulary, exactly as `fade-in`/`fade-out` do.
- **All 228 pre-existing definitions are unchanged** — the diff to `src/keyframes/effects.ts` is additions
  only, so the deferred keyframe-quality audit stays a separate pass.

### Deliberately not added

Start-angle, corner and counter-clockwise radial names; strip-count names for the blinds; a mirrored
hinge attachment or a hinge entrance inverse; `fog`, `mist`, `dissolve` or soft-reveal aliases; a `draw`
preset; and any name from the rejected table in section D or the asymmetry list in section E. Each was
left out for the reason the discovery pass gave, not for want of a prototype.

### Gate

`pnpm check` — **19/19 stages, exit 0**, 165.7s of stage work across 4 jobs, including the new `effects`
stage. Two gaps were caught by the gate itself during this pass and are fixed here: the missing `Effect`
union members (the `types` stage) and the recipe's unresolvable sample classes (the `view-transition`
stage's documentation arm).

## Appendix A. Complete canonical inventory

Every name below is the suffix of a public `animate-` class. Primary placement is semantic; subfamily names are retained for lookup.

### Translated arrivals and departures — 47

| Subfamily | Exact effect names |
| --- | --- |
| fade | `fade-in`, `fade-in-down`, `fade-in-left`, `fade-in-right`, `fade-in-up`, `fade-out`, `fade-out-down`, `fade-out-left`, `fade-out-right`, `fade-out-up` |
| fall | `fall-down`, `fall-left`, `fall-right`, `fall-up` |
| rush | `rush-in-down`, `rush-in-left`, `rush-in-right`, `rush-in-up`, `rush-out-down`, `rush-out-left`, `rush-out-right`, `rush-out-up` |
| slide | `slide-in-down`, `slide-in-down-elastic`, `slide-in-left`, `slide-in-right`, `slide-in-up`, `slide-in-up-elastic`, `slide-in-up-left`, `slide-in-up-right`, `slide-out-down`, `slide-out-left`, `slide-out-right`, `slide-out-up`, `slide-peek-down`, `slide-peek-left`, `slide-peek-right`, `slide-peek-up`, `slide-stack` |
| spring | `spring-down`, `spring-left`, `spring-right`, `spring-up` |
| throw | `throw-down`, `throw-left`, `throw-right`, `throw-up` |

### Scale-led arrivals and departures — 29

| Subfamily | Exact effect names |
| --- | --- |
| back | `back-in`, `back-in-down`, `back-in-left`, `back-in-right`, `back-in-up` |
| bounce | `bounce-in`, `bounce-in-down`, `bounce-in-left`, `bounce-in-right`, `bounce-in-up`, `bounce-out`, `bounce-out-down`, `bounce-out-left`, `bounce-out-right`, `bounce-out-up` |
| zoom | `zoom-in`, `zoom-in-down`, `zoom-in-elastic`, `zoom-in-left`, `zoom-in-right`, `zoom-in-up`, `zoom-out`, `zoom-out-down`, `zoom-out-elastic`, `zoom-out-left`, `zoom-out-right`, `zoom-out-up`, `zoom-tilt-in`, `zoom-tilt-out` |

### Planar turns and spiral travel — 16

| Subfamily | Exact effect names |
| --- | --- |
| arc | `arc-bottom-left`, `arc-bottom-right`, `arc-top-left`, `arc-top-right` |
| hinge | `hinge-drop` |
| rotate | `rotate-left`, `rotate-right` |
| spiral | `spiral`, `spiral-back-in`, `spiral-back-out`, `spiral-in`, `spiral-out`, `spiral-path` |
| twist | `twist`, `twist-in`, `twist-out` |

### 3D orientation and folding — 24

| Subfamily | Exact effect names |
| --- | --- |
| flip | `flip-card-x`, `flip-card-y`, `flip-diagonal`, `flip-in-bottom`, `flip-in-left`, `flip-in-right`, `flip-in-top`, `flip-in-x`, `flip-in-y`, `flip-wobble-x`, `flip-wobble-y`, `flip-x`, `flip-x-elastic`, `flip-y`, `flip-y-elastic`, `flip-zoom-x`, `flip-zoom-y` |
| fold | `fold-in`, `fold-out` |
| spinning | `spinning` |
| tilt | `tilt` |
| unfold | `unfold-x`, `unfold-y` |
| wobbling | `wobbling` |

### Hard clipping and apertures — 61

| Subfamily | Exact effect names |
| --- | --- |
| blinds | `blinds-in-x`, `blinds-in-y`, `blinds-out-x`, `blinds-out-y` |
| circle | `circle-in`, `circle-in-bottom-left`, `circle-in-bottom-right`, `circle-in-top-left`, `circle-in-top-right`, `circle-out`, `circle-out-bottom-left`, `circle-out-bottom-right`, `circle-out-top-left`, `circle-out-top-right` |
| diamond | `diamond-in`, `diamond-out` |
| mask | `mask-bottom`, `mask-bottom-left`, `mask-bottom-right`, `mask-center`, `mask-left`, `mask-right`, `mask-top`, `mask-top-left`, `mask-top-right` |
| radial | `radial-wipe-in`, `radial-wipe-out` |
| reveal | `reveal-down`, `reveal-left`, `reveal-right`, `reveal-swipe`, `reveal-up` |
| square | `square-in`, `square-in-bottom-left`, `square-in-bottom-right`, `square-in-top-left`, `square-in-top-right`, `square-out`, `square-out-bottom-left`, `square-out-bottom-right`, `square-out-top-left`, `square-out-top-right` |
| triangle | `triangle-in`, `triangle-in-bottom-left`, `triangle-in-bottom-right`, `triangle-in-top-left`, `triangle-in-top-right`, `triangle-out`, `triangle-out-bottom-left`, `triangle-out-bottom-right`, `triangle-out-top-left`, `triangle-out-top-right` |
| unmask | `unmask`, `unmask-bottom`, `unmask-bottom-left`, `unmask-bottom-right`, `unmask-left`, `unmask-right`, `unmask-top`, `unmask-top-left`, `unmask-top-right` |

### Layout and display opening — 7

| Subfamily | Exact effect names |
| --- | --- |
| accordion | `accordion` |
| expand | `expand-down`, `expand-left`, `expand-right`, `expand-up` |
| power | `power-off`, `power-on` |

### Attention, oscillation and activity — 24

| Subfamily | Exact effect names |
| --- | --- |
| blink | `blink` |
| distort | `distort` |
| elastic | `elastic` |
| figure | `figure-eight` |
| flicker | `flicker` |
| floating | `floating` |
| glitch | `glitch` |
| heart | `heart-beat` |
| jello | `jello` |
| lift | `lift` |
| magnetic | `magnetic` |
| morph | `morph` |
| pulsing | `pulsing` |
| ripple | `ripple` |
| scatter | `scatter` |
| shake | `shake` |
| swing | `swing` |
| tada | `tada` |
| wave | `wave` |
| wiggle | `wiggle` |
| wobble | `wobble` |
| zoom | `zoom-pulse`, `zoom-pulse-grow`, `zoom-pulse-shrink` |

### Shear — 10

| Subfamily | Exact effect names |
| --- | --- |
| skew | `skew-down`, `skew-in`, `skew-left`, `skew-left-down`, `skew-left-up`, `skew-out`, `skew-right`, `skew-right-down`, `skew-right-up`, `skew-up` |

### Light, focus and surface cues — 7

| Subfamily | Exact effect names |
| --- | --- |
| blur | `blur-in`, `blur-out` |
| glow | `glow` |
| hue | `hue-shift` |
| neon | `neon` |
| shadow | `shadow` |
| shimmer | `shimmer` |

### Material-like deformation and bursts — 6

| Subfamily | Exact effect names |
| --- | --- |
| bubble | `bubble` |
| drip | `drip` |
| explode | `explode` |
| implode | `implode` |
| melt | `melt` |
| splash | `splash` |

### Typographic presentation — 4

| Subfamily | Exact effect names |
| --- | --- |
| letter | `letter-space-in`, `letter-space-out` |
| typing | `typing` |
| word | `word-slide` |

## Appendix B. SVG route distinction: recorded, then fixed the same day

[Motion's SVG documentation](https://motion.dev/docs/svg-effect) and [GSAP DrawSVG](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/) identify progressive stroke rendering as useful. The underlying mechanism is dash length/offset, with geometry normalization and path assumptions—not an inherently new interpolation engine. The [SVG stroke specification](https://www.w3.org/TR/SVG2/painting.html#StrokeDashing) is the relevant platform contract.

The current repository has `stroke-dasharray` and `stroke-dashoffset` in `src/keyframes/property.ts`, `src/variables/property.ts` and type unions. It does **not** register the corresponding public matchers in `src/properties/tween.ts`. A fresh isolated candidate compilation found:

| Candidate | Emitted keyframes | Warning |
| --- | --- | --- |
| `animate-stroke-dashoffset-[0]` | None | None |
| `animate-stroke-dasharray-[1]` | None | None |
| `animate-offset-distance-[100%]` (positive control) | One | None |
| `animate-mask-position-[100%_0%]` (positive control) | One | None |

This is an emitted-surface finding, not a browser interpolation failure. It prevents the claim that stroke tracing is already available through those public classes. The discovery conclusion is **do not add a `draw` preset to paper over it**. If pursued later, first decide whether exposing those standard property routes is wanted; that is separate approval and separate work. A native CSS stroke recipe remains possible, but is not thereby a Jumi-authored animation.

Normalized stroke-length recipes also need explicit asset contracts (for example a path-length convention, stroke-only treatment, compatible dash patterns and multi-subpath handling). Do not claim that `100%` universally means the measured path length.

**Resolved the same day.** Both routes are now registered in the public tween matcher, with no special
semantics: `animate-stroke-dasharray-*` (numbers, lengths, percentages, `none`, comma- or
underscore-separated lists, odd-length lists left to the platform's repetition rules) and
`animate-stroke-dashoffset-*` (the same value types, negatives included). The four probes above now read
one emitted keyframe each, and [`scripts/effect-candidates-check.mjs`](../../scripts/effect-candidates-check.mjs)
compares both routes against an independent native `element.animate()` reference in every engine the host
can launch — numeric, multi-value, `px`, `%`, an odd-length list, a negative offset, a phrase form and a
named instance with its own duration, delay and easing. Documented under property animation on
[Composing motion](../../docs/src/pages/docs/properties.md), not in the effect catalog. No `draw` preset
was added, and no claim of path-length measurement is made.

## Appendix C. Source scope and platform caveats

Research performed on 19 September 2026. Primary sources were used for technical conclusions. No external keyframe implementation was copied into Jumi.

| Source | What it informed |
| --- | --- |
| [Animate.css catalog](https://animate.style/) and [hinge definition](https://raw.githubusercontent.com/animate-css/animate.css/main/source/specials/hinge.css) | Attention/entrance/exit comparison; constrained rotation then release |
| [Magic author site](https://www.minimamente.com/project/magic/) | Puff, perspective, turn and theatrical variation search; rejected broad name parity |
| [Hover.css author site](https://ianlunn.github.io/Hover/) | Distinguishing decoration/pseudo-elements from reusable keyframe motion |
| [Carbon motion](https://carbondesignsystem.com/elements/motion/overview/), [Material motion](https://m1.material.io/motion/material-motion.html) | Functional/expressive intent, spatial relationships and choreography |
| [Adobe transition effects](https://helpx.adobe.com/after-effects/desktop/apply-effects-and-animation-presets/list-of-effects/transition-effects.html) | Angular wipe and repeated-strip reveal as distinct mechanisms |
| [Motion SVG](https://motion.dev/docs/svg-effect), [GSAP DrawSVG](https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/) | Stroke progression and renderer/asset prerequisites |
| [Motion layout](https://motion.dev/docs/layout-animations), [spring values](https://motion.dev/docs/spring-value) | Excluding measured layout and interaction physics from a fixed catalog |
| [CSS Masking](https://www.w3.org/TR/css-masking-1/), [CSS Shapes interpolation](https://www.w3.org/TR/css-shapes-1/#basic-shape-interpolation) | Soft mask versus hard clip; compatible geometry requirements |
| [CSS Images 4](https://drafts.csswg.org/css-images-4/#interpolating-gradients) | Gradient interpolation is a separate concern; a draft algorithm is not browser evidence |
| [CSS Motion Path](https://drafts.csswg.org/motion-1/), [CSS Transforms 2](https://drafts.csswg.org/css-transforms-2/) | Path/orientation and perspective are platform mechanisms, not reasons for synonym presets |

Animista was attempted, but its fetched page exposed mostly surrounding site text and the entrances endpoint failed. Its interactive effect catalog was **not** treated as inspected evidence. No claims depend on remembering its effect names.

No appendix of suspected bad existing keyframes is included: that would reopen the deliberately deferred quality pass. The deduplication and asymmetry observations above are sufficient for deciding whether a proposed concept is actually missing.
