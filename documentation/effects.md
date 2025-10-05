# Jumi Effect Animations

This document provides a comprehensive overview of the Jumi animation library. The effects are organized into distinct categories based on their purpose and behavior, providing a versatile toolkit for creating dynamic and engaging user interfaces.

---

## Organized by category

* [Entrance](#entrance-effects): Elements appearing on screen
* [Exit](#exit-effects): Elements leaving the screen
* [Attention](#attention-effects): Drawing focus to elements (looping)
* [Emphasis](#emphasis-effects): Highlighting or reinforcing elements (one-time)
* [Presentation](#presentation-effects): Sophisticated reveals and transitions using masks/clip-paths
* [Transition](#transition-effects): Morphing and state-change animations

---

## Entrance Effects

These effects are designed to bring elements into view. They are triggered when an element first appears on the screen, creating a smooth and visually appealing introduction.

### Basic Entrances

Simple and clean entrances that combine opacity with subtle motion.

* **`fade-in`**: The element gently fades from transparent to fully opaque.
* **`fade-in-up`**: The element fades in while sliding up from a position slightly below its final location.
* **`fade-in-down`**: The element fades in while sliding down from a position slightly above its final location.
* **`fade-in-left`**: The element fades in while sliding in from the right.
* **`fade-in-right`**: The element fades in while sliding in from the left.

### Slide Entrances

Pure motion-based entrances where elements slide into place without any change in opacity.

* **`slide-in-up`**: The element slides into view from below.
* **`slide-in-down`**: The element slides into view from above.
* **`slide-in-left`**: The element slides into view from the right.
* **`slide-in-right`**: The element slides into view from the left.

### Zoom Entrances

Effects that scale elements into view, creating a sense of depth and focus.

* **`zoom-in`**: The element scales up from a smaller size to its final size, originating from the center.
* **`zoom-in-up`**: The element scales up while moving upwards into its final position.
* **`zoom-in-down`**: The element scales up while moving downwards into its final position.
* **`zoom-in-left`**: The element scales up while moving in from the right.
* **`zoom-in-right`**: The element scales up while moving in from the left.

### Bounce Entrances

Energetic entrances that conclude with a bouncing motion, adding a playful feel.

* **`bounce-in`**: The element drops in from the center and bounces to a stop.
* **`bounce-in-up`**: The element bounces in from below.
* **`bounce-in-down`**: The element bounces in from above.
* **`bounce-in-left`**: The element bounces in from the right.
* **`bounce-in-right`**: The element bounces in from the left.

### Rush Entrances

Fast, high-energy entrances with a swift motion curve, perfect for impactful reveals.

* **`rush-in`**: The element quickly appears from the center with a slight overshoot.
* **`rush-in-up`**: The element rushes in from below.
* **`rush-in-down`**: The element rushes in from above.
* **`rush-in-left`**: The element rushes in from the right.
* **`rush-in-right`**: The element rushes in from the left.

### Flip Entrances

3D rotational effects where elements flip into view.

* **`flip-in-x`**: The element flips into view around a central horizontal (X) axis.
* **`flip-in-y`**: The element flips into view around a central vertical (Y) axis.
* **`flip-in-top`**: The element flips down into view as if hinged at its top edge.
* **`flip-in-bottom`**: The element flips up into view as if hinged at its bottom edge.
* **`flip-in-left`**: The element flips in from the left as if hinged at its left edge.
* **`flip-in-right`**: The element flips in from the right as if hinged at its right edge.

### Peek Entrances

Subtle entrances where an element appears from behind the edge of its container.

* **`peek-in-top`**: The element slides down from behind the top edge.
* **`peek-in-bottom`**: The element slides up from behind the bottom edge.
* **`peek-in-left`**: The element slides in from behind the left edge.
* **`peek-in-right`**: The element slides in from behind the right edge.

### Spring Entrances

Burst into view with elastic resistance and a bouncy finish.

* **`spring-down`**: The element springs down into place with a bouncy effect.
* **`spring-left`**: The element springs in from the left with a bouncy effect.
* **`spring-right`**: The element springs in from the right with a bouncy effect.
* **`spring-up`**: The element springs up into place with a bouncy effect.

### Rotate Entrances

2D rotation effects where elements roll into place.

* **`roll-in-left`**: The element rolls in from the left while rotating clockwise.
* **`roll-in-right`**: The element rolls in from the right while rotating counter-clockwise.

### Back Entrances

Perspective-based entrances where elements appear to emerge from a point deep in the background.

* **`back-in-up`**: The element enters from below, scaling up from a small size as it moves.
* **`back-in-down`**: The element enters from above, scaling up from a small size as it moves.
* **`back-in-left`**: The element enters from the right, scaling up from a small size as it moves.
* **`back-in-right`**: The element enters from the left, scaling up from a small size as it moves.

### Arc Entrances

Physics-inspired entrances where elements follow a curved path into their final position.

* **`arc-in-top-left`**: The element enters from the top-left, following a downward arc.
* **`arc-in-top-right`**: The element enters from the top-right, following a downward arc.
* **`arc-in-bottom-left`**: The element enters from the bottom-left, following an upward arc.
* **`arc-in-bottom-right`**: The element enters from the bottom-right, following an upward arc.

### Special Entrances

Unique and stylized entrance effects for special occasions.

* **`blur-in`**: The element comes into focus from a blurred state.
* **`skew-in`**: The element appears skewed and then straightens out into its final form.
* **`fold-in`**: The element unfolds into view like a piece of paper.
* **`twist-in`**: The element spins into view along the Z-axis while scaling up.
* **`spiral-in`**: The element enters the screen following a spiral path.

---

## Exit Effects

These effects are designed to remove elements from view. They are the inverse of the entrance effects and provide a graceful way for elements to disappear.

### Basic Exits

* **`fade-out`**: The element gently fades from opaque to fully transparent.
* **`fade-out-up`**: The element fades out while sliding upwards.
* **`fade-out-down`**: The element fades out while sliding downwards.
* **`fade-out-left`**: The element fades out while sliding to the left.
* **`fade-out-right`**: The element fades out while sliding to the right.

### Slide Exits

* **`slide-out-up`**: The element slides out of view upwards.
* **`slide-out-down`**: The element slides out of view downwards.
* **`slide-out-left`**: The element slides out of view to the left.
* **`slide-out-right`**: The element slides out of view to the right.

### Zoom Exits

* **`zoom-out`**: The element scales down to a smaller size and disappears at the center.
* **`zoom-out-up`**: The element scales down while moving upwards.
* **`zoom-out-down`**: The element scales down while moving downwards.
* **`zoom-out-left`**: The element scales down while moving to the left.
* **`zoom-out-right`**: The element scales down while moving to the right.

### Bounce Exits

* **`bounce-out`**: The element scales down and bounces out toward the center.
* **`bounce-out-up`**: The element bounces out towards the top of the screen.
* **`bounce-out-down`**: The element bounces out towards the bottom of the screen.
* **`bounce-out-left`**: The element bounces out towards the left of the screen.
* **`bounce-out-right`**: The element bounces out towards the right of the screen.

### Rush Exits

* **`rush-out`**: The element quickly exits towards the center.
* **`rush-out-up`**: The element rushes out towards the top.
* **`rush-out-down`**: The element rushes out towards the bottom.
* **`rush-out-left`**: The element rushes out towards the left.
* **`rush-out-right`**: The element rushes out towards the right.

### Flip Exits

* **`flip-out-x`**: The element flips out of view around a central horizontal (X) axis.
* **`flip-out-y`**: The element flips out of view around a central vertical (Y) axis.
* **`flip-out-top`**: The element flips up and out of view, hinged at its top edge.
* **`flip-out-bottom`**: The element flips down and out of view, hinged at its bottom edge.
* **`flip-out-left`**: The element flips out to the left, hinged at its left edge.
* **`flip-out-right`**: The element flips out to the right, hinged at its right edge.

### Peek Exits

* **`peek-out-top`**: The element slides up to hide behind the top edge.
* **`peek-out-bottom`**: The element slides down to hide behind the bottom edge.
* **`peek-out-left`**: The element slides out to hide behind the left edge.
* **`peek-out-right`**: The element slides out to hide behind the right edge.

### Rotate Exits

* **`roll-out-left`**: The element rolls out to the left while rotating counter-clockwise.
* **`roll-out-right`**: The element rolls out to the right while rotating clockwise.

### Arc Exits

* **`arc-out-top-left`**: The element exits towards the top-left, following an upward arc.
* **`arc-out-top-right`**: The element exits towards the top-right, following an upward arc.
* **`arc-out-bottom-left`**: The element exits towards the bottom-left, following a downward arc.
* **`arc-out-bottom-right`**: The element exits towards the bottom-right, following a downward arc.

### Special Exits

* **`blur-out`**: The element blurs into obscurity.
* **`skew-out`**: The element skews and then fades or slides out.
* **`fold-out`**: The element folds up like a piece of paper and disappears.
* **`twist-out`**: The element spins on the Z-axis while shrinking.
* **`spiral-out`**: The element exits the screen following a spiral path.

---

## Attention Effects

These are looping animations designed to continuously draw the user's focus to a particular element.

### Pulsing & Breathing

* **`heart-beat`**: The element rhythmically scales up and down, simulating a heartbeat.
* **`glow`**: A soft, pulsing outer shadow or color effect is applied to the element.

### Shaking & Vibrating

* **`shake`**: The element rapidly shakes back and forth horizontally.
* **`wiggle`**: A playful, jelly-like side-to-side rotation.
* **`wobble`**: A top-heavy shaking motion, as if the element is about to fall over.
* **`jello`**: The entire element distorts and wobbles like gelatin.

### Rocking & Swinging

* **`swing`**: The element swings back and forth from a central anchor point at the top.
* **`tada`**: A celebratory burst of motion, combining a quick wiggle and a scale pop.
* **`tilt`**: The element gently rocks back and forth.

### Floating & Hovering

* **`bob`**: A gentle and continuous up-and-down floating motion.
* **`lift`**: The element slowly lifts up and lowers back down in a loop.

### Flashing & Blinking

* **`blink`**: The element smoothly fades in and out at a regular interval.
* **`flicker`**: The element blinks erratically, simulating a faulty light source.
* **`shimmer`**: A bright, glossy highlight sweeps across the surface of the element.
* **`glitch`**: Simulates a digital distortion effect with rapid jumps, color aberrations, and blockiness.
* **`neon`**: The element's border or text pulses with a vibrant, neon-like glow.

### Ripple & Wave

* **`ripple`**: A circular wave continuously expands outwards from the element's center.
* **`wave`**: A sine wave distortion travels across the element horizontally or vertically.

### Special Attention

* **`implode`**: The element quickly shrinks and snaps back to its original size in a loop.
* **`explode`**: The element quickly expands and snaps back to its original size in a loop.

---

## Emphasis Effects

These are one-time animations used to highlight an element in response to a user action, such as a click or hover.

### Bounce & Spring

* **`spring`**: The element quickly scales up and bounces back to its original size.
* **`elastic`**: An exaggerated rubber-band effect where the element overshoots its target size before settling.

### Flash & Pop

* **`flash`**: A quick, bright flash of light on the element.
* **`pop`**: The element quickly scales up and back down to create a "pop" effect.

### Rotate & Spin

* **`spin-clockwise`**: The element completes one full 360-degree rotation clockwise.
* **`spin-counter-clockwise`**: The element completes one full 360-degree rotation counter-clockwise.

### Scale Effects

* **`grow`**: The element scales up slightly to emphasize it.
* **`shrink`**: The element scales down slightly to de-emphasize it.

---

## Presentation Effects

These are sophisticated reveals and transitions that use masks or `clip-path` properties to progressively show or hide content, often used for cinematic scene changes or dynamic content reveals. The point of origin is a key component of the effect's visual narrative.

### Wipe Reveals

These effects reveal content by sliding a straight edge across the element.

* **`wipe-in-right`**: Reveals the element with a mask moving from left to right.
* **`wipe-in-up`**: Reveals the element with a mask moving from bottom to top.
* **`wipe-in-down`**: Reveals the element with a mask moving from top to bottom.
* **`wipe-in-left`**: Reveals the element with a mask moving from right to left.
* **`wipe-out-left`**: Hides the element with a mask moving from right to left.
* **`wipe-out-up`**: Hides the element with a mask moving from top to bottom.
* **`wipe-out-down`**: Hides the element with a mask moving from bottom to top.
* **`wipe-out-right`**: Hides the element with a mask moving from left to right.

### Diagonal Wipes

A wipe that traverses the element at a 45-degree angle.

* **`wipe-in-top-left`**: Reveals content with a wipe from the top-left corner.
* **`wipe-in-top-right`**: Reveals content with a wipe from the top-right corner.
* **`wipe-in-bottom-left`**: Reveals content with a wipe from the bottom-left corner.
* **`wipe-in-bottom-right`**: Reveals content with a wipe from the bottom-right corner.
* **`wipe-out-top-left`**: Hides content with a wipe towards the top-left corner.
* **`wipe-out-top-right`**: Hides content with a wipe towards the top-right corner.
* **`wipe-out-bottom-left`**: Hides content with a wipe towards the bottom-left corner.
* **`wipe-out-bottom-right`**: Hides content with a wipe towards the bottom-right corner.s

### Split Reveals

These effects split the content either horizontally or vertically, revealing or hiding it in a dynamic way.

* **`split-in-x`**: Reveals content from the vertical centerline outwards.
* **`split-in-y`**: Reveals content from the horizontal centerline outwards.
* **`split-out-x`**: Hides content by collapsing it towards the vertical centerline.
* **`split-out-y`**: Hides content by collapsing it towards the horizontal centerline.

### Iris Reveals

Uses a circular mask that expands or contracts from a specific point.

* **`iris-in`**: Reveals content with an expanding circular mask from the **center**.
* **`iris-in-top-left`**: Reveals content with a circle that expands from the **top-left corner**.
* **`iris-in-top-right`**: Reveals content with a circle that expands from the **top-right corner**.
* **`iris-in-bottom-left`**: Reveals content with a circle that expands from the **bottom-left corner**.
* **`iris-in-bottom-right`**: Reveals content with a circle that expands from the **bottom-right corner**.
* **`iris-out`**: Hides content with a circle that contracts towards the **center**.
* **`iris-out-top-left`**: Hides content with a circle that contracts towards the **top-left corner**.
* **`iris-out-top-right`**: Hides content with a circle that contracts towards the **top-right corner**.
* **`iris-out-bottom-left`**: Hides content with a circle that contracts towards the **bottom-left corner**.
* **`iris-out-bottom-right`**: Hides content with a circle that contracts towards the **bottom-right corner**.

### Box Reveals

Uses a rectangular mask that expands or contracts from a specific point.

* **`box-in`**: Reveals content with an expanding square mask from the **center**.
* **`box-in-top-left`**: Reveals content with a square that expands from the **top-left corner**.
* **`box-in-top-right`**: Reveals content with a square that expands from the **top-right corner**.
* **`box-in-bottom-left`**: Reveals content with a square that expands from the **bottom-left corner**.
* **`box-in-bottom-right`**: Reveals content with a square that expands from the **bottom-right corner**.
* **`box-out`**: Hides content with a square that contracts towards the **center**.
* **`box-out-top-left`**: Hides content with a square that contracts towards the **top-left corner**.
* **`box-out-top-right`**: Hides content with a square that contracts towards the **top-right corner**.
* **`box-out-bottom-left`**: Hides content with a square that contracts towards the **bottom-left corner**.
* **`box-out-bottom-right`**: Hides content with a square that contracts towards the **bottom-right corner**.

### Diamond Reveals

Uses a diamond-shaped (a rotated square) mask for the reveal.

* **`diamond-in`**: Reveals content with a diamond shape that expands from the **center**.
* **`diamond-out`**: Hides content with a diamond shape that contracts towards the **center**.

### Triangle Reveals

Uses a triangular mask that expands or contracts to the sides of the element.

* **`triangle-in-top`**: Reveals content with a triangle that expands from the **top center**.
* **`triangle-in-bottom`**: Reveals content with a triangle that expands from the **bottom center**.
* **`triangle-in-left`**: Reveals content with a triangle that expands from the **left center**.
* **`triangle-in-right`**: Reveals content with a triangle that expands from the **right center**.
* **`triangle-out-top`**: Hides content with a triangle that contracts towards the **top center**.
* **`triangle-out-bottom`**: Hides content with a triangle that contracts towards the **bottom center**.
* **`triangle-out-left`**: Hides content with a triangle that contracts towards the **left center**.
* **`triangle-out-right`**: Hides content with a triangle that contracts towards the **right center**.

### Clock

These effects use a circular wipe that rotates around the center of the element.

* **`clock-in`**: A classic transition where a wipe rotates 360 degrees from a central point to reveal content.
* **`clock-out`**: Hides content using a 360-degree rotational wipe.

### Curtain Effects

These effects mimic curtains opening or closing from the edges toward the center.

* **`curtain-in-x`**: Reveals content like curtains opening horizontally from the edges to the center.
* **`curtain-in-y`**: Reveals content like curtains opening vertically from the edges to the center.
* **`curtain-out-x`**: Hides content like curtains closing horizontally from the center to the edges.
* **`curtain-out-y`**: Hides content like curtains closing vertically from the center to the edges.

### Barn Door Effects

These effects simulate barn doors opening or closing from the center.

* **`barn-door-in-x`**: A two-panel reveal that opens horizontally from the center, like barn doors.
* **`barn-door-in-y`**: A two-panel reveal that opens vertically from the center.
* **`barn-door-out-x`**: A two-panel hide that closes horizontally towards the center.
* **`barn-door-out-y`**: A two-panel hide that closes vertically towards the center.

### Plus/Cross Reveals

These effects reveal or hide content in a four-way motion from the center.

* **`cross-in`**: Reveals content with a cross-shaped mask expanding from the center.
* **`cross-out`**: Hides content with a cross-shaped mask contracting towards the center.

### Venetian Blind Effects

These effects simulate the opening and closing of venetian blinds.

* **`blinds-in-x`**: Reveals content through horizontal slats, like opening venetian blinds.
* **`blinds-in-y`**: Reveals content through vertical slats.
* **`blinds-out-x`**: Hides content by closing horizontal slats.
* **`blinds-out-y`**: Hides content by closing vertical slats.

### Checkerboard Reveals

These effects use a grid-based mask to reveal or hide content in an alternating pattern.

* **`checkerboard-in`**: Reveals content in a grid, with alternating squares appearing in a checkerboard pattern.
* **`checkerboard-out`**: Hides content in a grid, with alternating squares disappearing in a checkerboard pattern.

### Pixelate Effects

These effects use a pixelated mosaic to reveal or hide content.

* **`pixelate-in`**: The element is revealed by transitioning from a heavily pixelated state to a clear one.
* **`pixelate-out`**: The element is hidden by transitioning into a pixelated mosaic.

---

## Transition Effects

These effects are designed for elements that are changing state, such as morphing between two different shapes or undergoing a visual transformation.

### Morphing

* **`morph`**: Smoothly transforms the element from one SVG shape (`path`) to another.
* **`distort`**: Applies a fluid, non-uniform distortion to the element as it changes.
* **`bubble`**: The element transitions with a bubbly, blob-like animation.

### Color Transitions

* **`hue-shift`**: Animates the element's color by cycling through the hue spectrum.
* **`color-pulse`**: The element's color smoothly transitions between two specified colors.
* **`gradient-shift`**: The element's background gradient smoothly transitions through multiple colors.

### Power Effects

* **`power-on`**: Simulates a CRT monitor powering on, with a bright line expanding to reveal the element.
* **`power-off`**: Simulates a CRT monitor powering off, with the element collapsing into a bright line and disappearing.

### Accordion & Expand

* **`accordion`**: A vertical collapse/expand animation, typically used for toggling content visibility.
* **`expand-up`**: The element's height animates from zero to full, revealing it from bottom to top.
* **`expand-down`**: The element's height animates from zero to full, revealing it from top to bottom.
* **`expand-left`**: The element's width animates from zero to full, revealing it from right to left.
* **`expand-right`**: The element's width animates from zero to full, revealing it from left to right.
