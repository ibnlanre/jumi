# Jumi Studio specification

## Product

A motion authoring workspace at `/studio/`. The first screen is the tool: a real hero scene, its layers, the selected object's controls, and a timeline. Visual language follows Jumi's ink/chartreuse palette, with compact panels, restrained outlines, and an uncluttered light canvas. No marketing hero inside the workspace.

## First milestone

1. Load the existing twelve-petal hero study, or the included mixed HTML/SVG scene.
2. Navigate/collapse the actual hierarchy; canvas click and tree selection agree. Shift-click selects siblings together. Hover highlights; lock prevents canvas selection. Breadcrumbs allow moving to ancestors.
3. Isolate selection, selection plus direct children, or subtree. Choose sibling ghosting and parent bounds context without changing structure/layout.
4. Add tracks from a searchable registry-derived property inspector. Show the utility, underlying CSS property, accepted types, available keywords, and an arbitrary value field.
5. Edit percentage keyframes, add at playhead, remove selected frames, drag their times, and shift-select multiple keyframes. Arrow keys nudge frames; snap is optional. Reorder tracks.
6. Edit public motion names and duration/delay/easing plus composition, iterations, direction and fill. Apply timing to selected tracks and stagger sibling starts.
7. Play/pause, seek, jump start/end, adjust project duration, zoom the timeline, and loop the project preview. Pan/zoom canvas, fit scene or selection, adjust scene dimensions, toggle grid/background, and see origin/bounds.
8. Inspect/copy classes, formatted HTML, authored base CSS, and raw compiled CSS. Download a complete standalone HTML export. Import/export project JSON and restore local work. Limited phrase-class reverse parsing is explicit.
9. Validate exported motion in an independent frame compiled afresh with the shipped build path.

## Layout

Top bar: Jumi Studio identity, scene selector, project save/load, undo/redo, export. Left: collapsible layers and isolation tools. Center: breadcrumbs, canvas toolbar, framed browser scene with selection overlays, concise contextual actions. Right: selection geometry; searchable add-property controls; selected track timing; selected keyframe value. Bottom: transport, ruler/playhead, vertically grouped property tracks and draggable diamonds. Output drawer below the timeline with tabs for classes/markup/CSS. Panels scroll independently; at narrow widths stack panels without losing access to controls.

## Interaction contracts

- Canvas click selects the actual target; double-click drills into a container's first unlocked child. Shift-click toggles selection. Tree click selects, caret collapses, separate buttons lock/hide.
- Space toggles playback outside text fields. Home/End seek endpoints. Delete/Backspace remove selected keyframes, never while typing. Left/Right nudge selected frames (Shift for larger steps). Escape exits isolation. Cmd/Ctrl-Z and Shift-Z undo/redo authoring edits.
- Drag a timeline diamond to move its time. Shift-click adds a frame to selection. Clicking a ruler seeks; inserting a frame uses the current playhead relative to its track's delay and duration. Value changes compile automatically.
- Canvas wheel zooms; middle-button drag pans. Fit buttons reset framing. Origin overlay refers to the browser's computed transform-origin; base origin edits are native CSS author intent, not an animation approximation.
- Input errors remain visible. Invalid project/markup imports do not replace existing work. Export is disabled while motion compilation is stale.
- Playback starts paused, including for reduced-motion visitors; motion is opt-in through the transport. All controls have labels and keyboard focus.

## State and output

`StudioProject` is versioned intent, separate from emitted CSS and runtime objects. Each animation track holds public Jumi utility, optional name, keyframes, and controls. A name does not imply a global group: sharing controls edits each selected element explicitly. Isolation/locks are editor-only. Base scene CSS is formatted separately; motion output uses phrases and public controls. Identical phrase identities with conflicting timing are rejected with a useful message.

## Later milestones

- Transition states and native `@starting-style`, with their own state-change preview.
- Scroll timelines/ranges, explicit shared timeline sources, and view-transition pseudo trees.
- Path guides/editing, geometry editing, richer SVG import, and arbitrary external scene containment.
- Per-segment easing only when the public output model supports it soundly.
- More complete reverse parsing, theme editing, and named choreography presets.

## Verification acceptance

Unit coverage for serialization, parse/round-trip boundaries, validation and frame movement. Browser script drives selection, isolation (including stable layout), keyframe creation/edit/drag, seeking, independent siblings, duration/delay, project restore, and exports. For final parity, compile exported class candidates with a fresh Node Tailwind/Jumi compiler, mount the exported markup/base CSS without editor CSS, seek both at multiple times, and compare computed HTML and SVG properties/bounds. Browser interpolation is never emulated for the comparison. Record screenshots of desktop and narrow layouts and fix clipping/interaction failures.
