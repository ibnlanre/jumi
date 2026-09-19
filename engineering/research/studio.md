# Jumi Studio research

Date: 2026-09-14. Written before the production implementation.

## Current repository, not the original docs snapshot

The website is a static Astro 7 site under `docs/`, with plain TypeScript for interactive demos. `docs/astro.config.ts` uses the vendored Jumi Vite integration. There is no current Sites hosting manifest in this checkout. Studio belongs at `/studio/` with its own layout and styles, linked from the existing navigation. It should not load editor code on documentation routes.

Jumi now ships as `@ibnlanre/jumi`. `src/helpers/create/index.ts` is the Tailwind adapter; `src/core/index.ts` is the actual semantic model; `src/properties/tween.ts` and `controls.ts` register the vocabulary. `src/helpers/carriers/index.ts` finalizes the generated stylesheet into element-local animation lists. There is no `animations` opt-in in the current API. Studio must run this finalizer, not just Tailwind generation.

## Public vocabulary audit

- Phrases: `animate-opacity-[0:0|40:0.8|100:1]`. Offsets are percentages without `%`, pipes separate frames, commas share a value among offsets. The core normalizes duplicates and ordering. Spaces are encoded as underscores in arbitrary class values.
- Named motions: append `/enter` to a phrase; controls address the same name, e.g. `animation-duration-[1200ms]/enter`. Names are element-local, not a global timeline binding. Shared choreography must write controls to each participating element. Property scope and global defaults are separate fallback links.
- `duration`, `delay`, `timing-function`, `iteration-count`, `direction`, `fill-mode`, `play-state`, `composition`, `timeline`, and `range` are slot-level controls. Current code supports scoped longhand composition; the older review no longer applies.
- Every typed tween has a phrase-only handler alongside the scalar type handler. Older architecture prose about a 221-property limitation is superseded by `scripts/phrase-check.mjs` and adapter registration.
- Transform subparts compose through the core. Two independently authored tracks that write the same underlying property may compete under replace; Studio must show the underlying property and expose composition, not pretend two transform axes are independent CSS properties.
- `animation-range-entry:` and related variants qualify an individual motion. Scroll and view-transition support include finalizer behavior and separate runtime/pseudo-element concerns. Keep extension points, defer their UI in milestone one.
- Motion paths are ordinary registered offset properties. SVG fill/stroke, perspective and 3D, and discrete CSS values are in the registry. A registration is not a promise of smooth interpolation or browser support.
- Theme sources are resolved by `src/helpers/create/theme.ts`, including token namespaces and spacing formulas. Do not copy theme scales or animation property lists into the editor.
- A phrase has no public per-frame easing grammar. First milestone exposes slot easing only. Per-segment easing, transitions, `@starting-style`, and view-transition authoring remain explicitly deferred.

## Measured browser probes

`experiments/studio/probe.mjs` compiles with the shipped Tailwind/Jumi/finalizer path, then renders HTML and SVG in `sandbox="allow-same-origin"` (without scripts). At 600ms with 200ms delay, the phrase `0:0|40:0.8|100:1`, duration 1000ms, linear, reports opacity **0.8 on both HTML and SVG**. Editor-page `div { opacity: .123 !important }` does not cross the iframe boundary.

Paint-only visibility isolation preserves the selected HTML element's bounds (0,0,100,100) and its original parent. A hidden ancestor can have a visible descendant. Do not use `display:none`, reparenting, or ancestor opacity to isolate a descendant.

`experiments/studio/compiler-probe.mjs` demonstrates the actual Tailwind compiler + Jumi adapter + finalizer bundled for the browser. It emitted a real CSS animation in **63ms on the initial local probe** (one measurement, not a benchmark). The 500ms default-ease sample was 0.802403, correctly different from a linear interpolation. This establishes that we can keep the website static and do compilation in a dedicated worker. WAAPI is only the transport; no `Element.animate()` interpolation engine is needed.

## Scene architecture decision

Use a mirrored working scene in a script-disabled same-origin `srcdoc` iframe. The canonical scene is a serializable DOM/SVG tree with explicit author-provided attributes and base CSS. Render it once on scene load; patch classes after authoring changes. Scrubbing changes only CSSAnimation.currentTime. The original website DOM is never edited.

The iframe contains scene CSS, compiled Jumi CSS, and a separate temporary editor-only visibility stylesheet. CSP denies network and scripts. Only known-safe HTML/SVG tags/attributes are allowed when importing markup/projects; no event handlers, embedded browsing contexts, resource URLs, or executable markup. Parent code can inspect the iframe because `allow-same-origin` is granted without `allow-scripts`.

Alternatives: same-document rendering risks CSS contamination; Shadow DOM complicates inherited theme and CSS registration boundaries; a custom renderer would disagree with CSS; reparenting changes transform and containing-block semantics. An opaque-origin iframe is stronger containment but prevents direct inspection without a script bridge. A future untrusted full-document importer should use an opaque origin plus a narrowly defined bridge.

## Isolation and geometry

Selection, tree hover, collapse, locking, and visibility are editor state. Isolation hides non-selected paint with visibility, restores selected nodes (optionally direct children/subtree), and may show unrelated sibling branches at low opacity. Never put opacity on an ancestor of the selected element. Parent context is drawn as a ghosted bounds overlay, avoiding contamination of the child's opacity/compositing. Persistent scene visibility remains separate from temporary editor isolation; neither should silently become an authored animation.

Read bounds for selected/hovered elements on selection, resize, pan/zoom, and playhead changes. Cache the tree; no MutationObserver is necessary for controlled rendering. ResizeObserver handles surface dimensions. SVG reports `getBBox()` as local geometry alongside client bounds.

## Seeking

Collect CSSAnimation instances with `document.getAnimations()` after style application, pause them, set every currentTime to the same project time (milliseconds). CSS itself accounts for delay, iterations, direction, fill, composition, and easing. On play, synchronize the animations to the iframe document timeline and let the browser run them. The editor updates only the playhead and selected bounds, not the DOM or computed property inventory, each frame.

Compilation runs in a worker on edits, never on scrub. Requests are revisioned; discard stale responses. Fresh compiler instances bound candidate accumulation. Keep the last valid scene during errors and report them. Export must not be available as a fresh result while compilation is pending or rejected.

## Proposed project state

Versioned `StudioProject`: scene (tree + base CSS + dimensions), animation tracks (node id, utility, public motion name, percentage keyframes, CSS control values), project duration, editor selections/isolation/locks/visibility, and viewport. `kind: 'animation'` is explicit. Future transition/state and scroll tracks should be separate discriminated variants, not squeezed into this track shape. Computed style, animation objects, generated CSS, and iframe nodes are caches, never canonical state.

Each track serializes to one phrase plus public named controls. Shared timing edits apply the same controls to selected tracks; stagger writes real delays for the chosen sibling tracks in the first milestone (with explicit per-track output). Export includes clean HTML with classes, authored base CSS, and optional complete compiled CSS for a standalone document. No editor-only variables or isolation styles enter the export.

## Risks and boundaries

- Complex values need careful escaping; reject grammar-breaking input and unsupported parsing rather than silently altering it.
- Import of arbitrary existing classes is limited to reliably parsed plain phrases and controls. Preserve base classes and report unsupported motions; do not claim universal reverse parsing.
- Browser CSS support and discrete behavior remain the source of truth. Show the CSS attribute/type and offer arbitrary values; don't invent numeric interpolation.
- Two tracks with identical property/phrase identity but different names share Jumi's underlying slot. Detect ambiguous duplicates rather than claiming independent controls.
- Full editor/compiler bundle is larger than a demo. Load it only on `/studio/` and compile in a worker.
- Local project persistence is device-local; downloadable project JSON is the portable backup. No cloud storage is implied.
- Verify independent fresh Tailwind/Jumi compilation of exported classes, not only reusing Studio's cached CSS.

## References

- [Morphable](https://www.morphable.video/): hierarchy, direct manipulation, and timeline patterns; its video engine is not the target architecture.
- [Animation.currentTime](https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime): seek real CSS animations in milliseconds.
- [iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe): containment and permission boundaries.
- `engineering/architecture/phrases.md`, current `src/core/index.ts`, `src/helpers/create/index.ts`, `src/properties/{tween,controls}.ts`, and existing browser checks are the implementation evidence.
