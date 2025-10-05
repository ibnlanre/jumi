/* eslint-disable */

/**
 * Jumi Effect Animations
 * 
 * Organized by category:
 * - Entrance: Elements appearing on screen
 * - Exit: Elements leaving the screen
 * - Attention: Drawing focus to elements (looping)
 * - Emphasis: Highlighting or reinforcing elements (one-time)
 * - Presentation: Sophisticated reveals and transitions using masks/clip-paths
 */

export type Effect =
  // ============================================================
  // ENTRANCE EFFECTS
  // ============================================================
  
  // --- Basic Entrances ---
  | 'fade-in'
  | 'fade-in-down'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'fade-in-up'
  
  // --- Slide Entrances ---
  | 'slide-in-down'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'slide-in-up'
  | 'slide-in-down-elastic'
  | 'slide-in-up-elastic'
  
  // --- Zoom Entrances ---
  | 'zoom-in'
  | 'zoom-in-down'
  | 'zoom-in-left'
  | 'zoom-in-right'
  | 'zoom-in-up'
  | 'zoom-in-elastic'
  
  // --- Bounce Entrances ---
  | 'bounce-in'
  | 'bounce-in-down'
  | 'bounce-in-left'
  | 'bounce-in-right'
  | 'bounce-in-up'
  
  // --- Flip Entrances ---
  | 'flip-in-x'
  | 'flip-in-y'
  | 'flip-in-top'
  | 'flip-in-bottom'
  | 'flip-in-left'
  | 'flip-in-right'
  
  // --- Rotate Entrances ---
  | 'rotate-in-left'
  | 'rotate-in-right'
  
  // --- Back Entrances (with perspective) ---
  | 'back-in'
  | 'back-in-down'
  | 'back-in-left'
  | 'back-in-right'
  | 'back-in-up'
  
  // --- Arc Entrances (physics-based) ---
  | 'arc-in-bottom-left'
  | 'arc-in-bottom-right'
  | 'arc-in-top-left'
  | 'arc-in-top-right'
  
  // --- Special Entrances ---
  | 'blur-in'
  | 'fold-in'
  | 'twist-in'
  | 'spiral-in'
  | 'skew-in'
  
  // ============================================================
  // EXIT EFFECTS
  // ============================================================
  
  // --- Basic Exits ---
  | 'fade-out'
  | 'fade-out-down'
  | 'fade-out-left'
  | 'fade-out-right'
  | 'fade-out-up'
  
  // --- Slide Exits ---
  | 'slide-out-down'
  | 'slide-out-left'
  | 'slide-out-right'
  | 'slide-out-up'
  
  // --- Zoom Exits ---
  | 'zoom-out'
  | 'zoom-out-down'
  | 'zoom-out-left'
  | 'zoom-out-right'
  | 'zoom-out-up'
  
  // --- Bounce Exits ---
  | 'bounce-out'
  | 'bounce-out-down'
  | 'bounce-out-left'
  | 'bounce-out-right'
  | 'bounce-out-up'
  
  // --- Arc Exits (physics-based) ---
  | 'arc-out-bottom-left'
  | 'arc-out-bottom-right'
  | 'arc-out-top-left'
  | 'arc-out-top-right'
  
  // --- Special Exits ---
  | 'blur-out'
  | 'fold-out'
  | 'twist-out'
  | 'spiral-out'
  | 'skew-out'
  
  // ============================================================
  // ATTENTION EFFECTS (looping/repeating)
  // ============================================================
  
  // --- Pulsing & Breathing ---
  | 'pulse'
  | 'heart-beat'
  | 'glow'
  
  // --- Shaking & Vibrating ---
  | 'shake'
  | 'wiggle'
  | 'wobble'
  | 'jello'
  
  // --- Rocking & Swinging ---
  | 'swing'
  | 'tada'
  | 'tilt'
  
  // --- Floating & Hovering ---
  | 'float'
  | 'lift'
  
  // --- Flashing & Blinking ---
  | 'blink'
  | 'flicker'
  
  // --- Special Attention ---
  | 'shimmer'
  | 'glitch'
  | 'neon'
  | 'ripple'
  | 'wave'
  
  // ============================================================
  // EMPHASIS EFFECTS (one-time highlights)
  // ============================================================
  
  // --- Bounce & Spring ---
  | 'bounce'
  | 'spring'
  | 'elastic'
  
  // --- Flash & Pop ---
  | 'flash'
  | 'pop'
  
  // --- Rotate & Spin ---
  | 'spin'
  | 'spin-clockwise'
  | 'spin-counter-clockwise'
  
  // --- Flip Effects ---
  | 'flip-x'
  | 'flip-y'
  | 'flip-diagonal'
  
  // --- Scale Effects ---
  | 'grow'
  | 'shrink'
  
  // ============================================================
  // PRESENTATION EFFECTS (mask/clip-path reveals)
  // ============================================================
  
  // --- Wipe Reveals (directional) ---
  | 'wipe-in-down'
  | 'wipe-in-left'
  | 'wipe-in-right'
  | 'wipe-in-up'
  | 'wipe-out-down'
  | 'wipe-out-left'
  | 'wipe-out-right'
  | 'wipe-out-up'
  
  // --- Diagonal Wipes ---
  | 'wipe-in-top-left'
  | 'wipe-in-top-right'
  | 'wipe-in-bottom-left'
  | 'wipe-in-bottom-right'
  | 'wipe-out-top-left'
  | 'wipe-out-top-right'
  | 'wipe-out-bottom-left'
  | 'wipe-out-bottom-right'
  
  // --- Circle Reveals (iris) ---
  | 'iris-in-center'
  | 'iris-in-top-left'
  | 'iris-in-top-right'
  | 'iris-in-bottom-left'
  | 'iris-in-bottom-right'
  | 'iris-out-center'
  | 'iris-out-top-left'
  | 'iris-out-top-right'
  | 'iris-out-bottom-left'
  | 'iris-out-bottom-right'
  
  // --- Square/Rectangle Reveals ---
  | 'box-in-center'
  | 'box-in-top-left'
  | 'box-in-top-right'
  | 'box-in-bottom-left'
  | 'box-in-bottom-right'
  | 'box-out-center'
  | 'box-out-top-left'
  | 'box-out-top-right'
  | 'box-out-bottom-left'
  | 'box-out-bottom-right'
  
  // --- Diamond Reveals ---
  | 'diamond-in-center'
  | 'diamond-out-center'
  
  // --- Polygon Reveals ---
  | 'polygon-in-center'
  | 'polygon-out-center'
  | 'hexagon-in-center'
  | 'hexagon-out-center'
  | 'star-in-center'
  | 'star-out-center'
  
  // --- Split Reveals ---
  | 'split-in-horizontal'
  | 'split-in-vertical'
  | 'split-out-horizontal'
  | 'split-out-vertical'
  
  // --- Clock Wipe ---
  | 'clock-wipe-in'
  | 'clock-wipe-out'
  
  // --- Curtain Effects ---
  | 'curtain-in-horizontal'
  | 'curtain-in-vertical'
  | 'curtain-out-horizontal'
  | 'curtain-out-vertical'
  
  // --- Barn Door ---
  | 'barn-door-in-horizontal'
  | 'barn-door-in-vertical'
  | 'barn-door-out-horizontal'
  | 'barn-door-out-vertical'
  
  // --- Plus/Cross Reveals ---
  | 'cross-in-center'
  | 'cross-out-center'
  
  // --- Venetian Blind ---
  | 'blinds-in-horizontal'
  | 'blinds-in-vertical'
  | 'blinds-out-horizontal'
  | 'blinds-out-vertical'
  
  // --- Checkerboard ---
  | 'checkerboard-in'
  | 'checkerboard-out'
  
  // --- Pixelate ---
  | 'pixelate-in'
  | 'pixelate-out'
  
  // --- Wave/Ripple Masks ---
  | 'wave-in-horizontal'
  | 'wave-in-vertical'
  | 'wave-out-horizontal'
  | 'wave-out-vertical'
  
  // ============================================================
  // TRANSITION EFFECTS (state changes)
  // ============================================================
  
  // --- Morphing ---
  | 'morph'
  | 'distort'
  | 'bubble'
  
  // --- Color Transitions ---
  | 'hue-shift'
  
  // --- Power Effects ---
  | 'power-on'
  | 'power-off'
  
  // --- Accordion & Expand ---
  | 'accordion'
  | 'expand-down'
  | 'expand-left'
  | 'expand-right'
  | 'expand-up'
  
  // --- Unfold Effects ---
  | 'unfold-x'
  | 'unfold-y'