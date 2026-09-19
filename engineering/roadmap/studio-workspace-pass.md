# Jumi Studio — workspace pass

## Decisions before implementation

Preserve the current DOM sandbox, compiler worker and visual language. The shell is a viewport grid: a header, a flexible central row, and one bottom dock. Dock sizes and active tabs are workspace preferences, persisted separately from the portable motion project. Separators support pointer and keyboard resizing. Collapsing a dock preserves its contents and scroll state. Narrow screens use overlay side docks so the canvas remains usable.

## Identity and picking

SceneNode.id is the canonical identity. It already maps directly to the iframe element ID; the HTML view will render source rows from that same tree and attach the same ID as editor metadata. Metadata never enters exported markup. Selection expands ancestors in the layer tree and reveals the matching source row. Source hover shares the existing overlay channel. Alt-click cycles the browser's elementsFromPoint stack, augmented with ancestors, excluding locked/hidden nodes. Ordinary clicks retain browser picking.

## Minimal public serialization

Read semantic defaults from src/variables/property.ts, never computed styles: 1s duration, ease timing, normal direction, one iteration, forwards fill, replace composition. Zero delay is conditional: Jumi's default reads stagger delay. Compare effective authored controls with these values and emit only differences when the scene has no competing Jumi control declarations. Conservatively retain explicit controls when base classes/CSS can change fallback resolution, including property-addressed names and stagger. Import absent controls using Jumi defaults, not Studio's new-track defaults. Compile and preview the exact same minimized class list as export.

## Easing and timing

Presets come from Jumi's actual animationTimingFunction theme. A cubic-bezier editor synchronizes handles, four numeric coordinates and raw CSS. X handles stay in [0,1]; Y may overshoot. Unsupported/non-cubic CSS remains editable as raw text. Phrase serialization currently encodes offsets and values, without keyframe timing declarations; segment easing will not be exposed in this pass.

Scene time starts at zero. Negative delay means the motion has already progressed at scene zero; label the advance on its track. An explicit pre-roll toggle reveals negative time for editing earlier frames. Local motion time is scene time minus delay, displayed with the selected motion. No change to browser playback semantics.

## Timeline and inspector

Group rows by scene element, then motion name, then property. Preserve individual property tracks and their controls. Element selection opens the Element inspector; selecting a track opens Motion; selecting a diamond opens Keyframe. Tabs keep exact-control editing available without one long column. Isolation settings occupy their own left tab; breadcrumbs continue to navigate ancestors.

## Direct manipulation

The origin handle uses browser geometry and invertible 2D transforms, with one history entry per drag. Geometry conversion belongs to the sandbox; UI handles use a shared pointer-drag lifecycle. Native transform-origin declarations remain in base CSS. Do not guess coordinates for perspective or motion-path transforms.

## Risks and verification

CSS cascade makes removing defaults context-sensitive; conservative retention is preferable to losing explicit overrides. SVG reference boxes differ from HTML border boxes. Pointer capture must survive inspector updates and iframe boundaries. Hidden tabs must retain state. Test dock resize/collapse, source/tree/canvas synchronization, overlap cycling, easing drag, origin drag, grouped timelines and negative delays. Keep the independent export/recompile/browser comparison as the final correctness gate.

## Implemented and verified

The workspace now has independent resizable/collapsible docks, keyboard-operable tabs/separators, a source selection view, Alt-click overlap cycling, semantic-default pruning, Jumi presets with Bézier editing, contextual inspectors, element/name/property timeline grouping, explicit pre-roll and a draggable origin. Source scrolling is remembered per output tab. Narrow-screen side docks are exclusive overlays and collapse on entering the narrow breakpoint.

Validation: 10 serializer/model unit tests; TypeScript check; scoped ESLint; Astro production build; 46 Chromium browser assertions in `scripts/studio-check.mjs`. The browser gate exercises both HTML and SVG, numeric easing persistence, origin-pointer geometry, independent sibling timing, and a fresh external compilation at eight scene times. Run the complete gate with `pnpm studio:check`; screenshots are written to `artifacts/studio/`.

Scope limits: the HTML view supports structural selection, not arbitrary text editing. Per-segment easing remains unavailable because current phrases do not serialize it. Origin handles deliberately omit unsupported 3D/path geometry. Default pruning retains controls conservatively when authored CSS/classes can alter Jumi fallback values. Browser verification covers Chromium; Firefox and Safari have not been run in this pass.
