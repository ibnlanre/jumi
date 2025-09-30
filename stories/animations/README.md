# Jumi Animation Categories

This document organizes all 200+ Jumi animations into logical categories for documentation and Storybook stories.

## 📂 Category Structure

### 🎭 **Entrance Animations** (`entrance/`)
Animations that bring elements into view with smooth, engaging motion.

#### **Fade Family**
- `fade-in` - Simple opacity transition
- `fade-in-blur` - Fade with blur transition  
- `fade-in-down` - Fade while moving down
- `fade-in-left` - Fade while moving from left
- `fade-in-right` - Fade while moving from right
- `fade-in-up` - Fade while moving up

#### **Slide Family**
- `slide-in-down` - Slide from top
- `slide-in-down-elastic` - Elastic slide from top
- `slide-in-left` - Slide from left
- `slide-in-right` - Slide from right
- `slide-in-up` - Slide from bottom
- `slide-in-up-elastic` - Elastic slide from bottom
- `slide-in-up-left` - Diagonal slide from bottom-left
- `slide-in-up-right` - Diagonal slide from bottom-right

#### **Bounce Family**
- `bounce-in` - Central bounce entrance
- `bounce-in-down` - Bounce from top
- `bounce-in-left` - Bounce from left
- `bounce-in-right` - Bounce from right
- `bounce-in-up` - Bounce from bottom

#### **Zoom Family**
- `zoom-in` - Scale-based entrance
- `zoom-in-down` - Zoom while moving down
- `zoom-in-elastic` - Elastic zoom entrance
- `zoom-in-left` - Zoom while moving from left
- `zoom-in-right` - Zoom while moving from right
- `zoom-in-up` - Zoom while moving up
- `zoom-tilt-in` - Zoom with rotation

#### **Arc Family** (Physics-Based)
- `arc-bottom-left` - Parabolic motion from bottom-left
- `arc-bottom-right` - Parabolic motion from bottom-right
- `arc-top-left` - Parabolic motion from top-left
- `arc-top-right` - Parabolic motion from top-right

#### **Circle/Mask Family**
- `circle-in` - Circular reveal from center
- `circle-in-bottom-left` - Circle from bottom-left
- `circle-in-bottom-right` - Circle from bottom-right
- `circle-in-top-left` - Circle from top-left
- `circle-in-top-right` - Circle from top-right
- `mask` - General mask reveal
- `mask-bottom`, `mask-left`, `mask-right`, `mask-top` - Directional masks
- `mask-bottom-left`, `mask-bottom-right`, `mask-top-left`, `mask-top-right` - Corner masks

#### **Geometric Shapes**
- `diamond-in` - Diamond-shaped reveal
- `square-in` - Square reveal from center
- `square-in-bottom-left`, `square-in-bottom-right`, `square-in-top-left`, `square-in-top-right` - Corner squares
- `triangle-in` - Triangle reveal
- `triangle-in-bottom-left`, `triangle-in-bottom-right`, `triangle-in-top-left`, `triangle-in-top-right` - Corner triangles

#### **Flip/Rotation Entrances**
- `flip-in-bottom` - Flip from bottom edge
- `flip-in-left` - Flip from left edge
- `flip-in-right` - Flip from right edge
- `flip-in-top` - Flip from top edge
- `flip-in-x` - Flip on X-axis
- `flip-in-y` - Flip on Y-axis

#### **Spiral/Twist Family**
- `spiral-in` - Spiral entrance
- `spiral-back-in` - Reverse spiral
- `twist-in` - Twist entrance motion

#### **Special Entrances**
- `back-in` - Back easing entrance
- `back-in-down`, `back-in-left`, `back-in-right`, `back-in-up` - Directional back easing
- `blur-in` - Pure blur transition
- `reveal-down`, `reveal-left`, `reveal-right`, `reveal-up` - Reveal animations
- `reveal-swipe` - Swipe reveal
- `rush-in-down`, `rush-in-left`, `rush-in-right`, `rush-in-up` - Rush entrances
- `skew-in` - Skew-based entrance
- `fold-in` - Folding entrance
- `unfold-x`, `unfold-y` - Unfolding entrances

### 🚪 **Exit Animations** (`exit/`)
Smooth departure animations for elements leaving the view.

#### **Fade Exit Family**
- `fade-out` - Simple opacity exit
- `fade-out-blur` - Fade with blur
- `fade-out-down`, `fade-out-left`, `fade-out-right`, `fade-out-up` - Directional fades

#### **Slide Exit Family**  
- `slide-out-down`, `slide-out-left`, `slide-out-right`, `slide-out-up` - Directional slides

#### **Bounce Exit Family**
- `bounce-out` - Central bounce exit
- `bounce-out-down`, `bounce-out-left`, `bounce-out-right`, `bounce-out-up` - Directional bounces

#### **Zoom Exit Family**
- `zoom-out` - Scale-based exit
- `zoom-out-down`, `zoom-out-elastic`, `zoom-out-left`, `zoom-out-right`, `zoom-out-up` - Zoom variations
- `zoom-tilt-out` - Zoom with rotation exit

#### **Geometric Exit Shapes**
- `circle-out` - Circular collapse
- `circle-out-bottom-left`, `circle-out-bottom-right`, `circle-out-top-left`, `circle-out-top-right` - Corner circles
- `diamond-out`, `square-out`, `triangle-out` - Shape-based exits
- `square-out-bottom-left`, `square-out-bottom-right`, `square-out-top-left`, `square-out-top-right` - Corner squares
- `triangle-out-bottom-left`, `triangle-out-bottom-right`, `triangle-out-top-left`, `triangle-out-top-right` - Corner triangles

#### **Special Exits**
- `blur-out` - Pure blur exit
- `fold-out` - Folding exit
- `rush-out-down`, `rush-out-left`, `rush-out-right`, `rush-out-up` - Rush exits
- `skew-out` - Skew-based exit
- `spiral-out`, `spiral-back-out` - Spiral exits
- `twist-out` - Twist exit
- `unmask` - Mask removal
- `unmask-bottom`, `unmask-left`, `unmask-right`, `unmask-top` - Directional unmasks
- `unmask-bottom-left`, `unmask-bottom-right`, `unmask-top-left`, `unmask-top-right` - Corner unmasks

### 🎯 **Attention-Seeking Animations** (`attention/`)
Looping or repeating animations designed to draw user attention.

#### **Shake/Wobble Family**
- `shake` - Horizontal shake
- `wobble` - Multi-directional wobble
- `wobbling` - Continuous wobbling
- `wiggle` - Gentle wiggle motion
- `jello` - Jello-like wobble

#### **Pulse/Heartbeat Family**
- `pulsing` - Rhythmic pulsing
- `heart-beat` - Heartbeat rhythm
- `zoom-pulse` - Zoom-based pulse
- `zoom-pulse-grow` - Growing pulse
- `zoom-pulse-shrink` - Shrinking pulse

#### **Rotation Family**
- `spin` - Continuous spin
- `rotate-left` - Left rotation
- `rotate-right` - Right rotation

#### **Swing/Movement**
- `swing` - Pendulum swing
- `float` - Gentle floating
- `tada` - Celebration animation
- `lift` - Lifting motion

#### **Flicker/Blink**
- `blink` - Blinking effect
- `flicker` - Random flicker

### 🔄 **Transform Animations** (`transforms/`)
Pure transform-based animations focusing on position, rotation, and scale.

#### **Flip Family**
- `flip-x` - X-axis flip
- `flip-y` - Y-axis flip
- `flip-x-elastic` - Elastic X flip
- `flip-y-elastic` - Elastic Y flip
- `flip-card-x` - Card flip X
- `flip-card-y` - Card flip Y
- `flip-diagonal` - Diagonal flip
- `flip-wobble-x` - Wobbling X flip
- `flip-wobble-y` - Wobbling Y flip
- `flip-zoom-x` - Zoom with X flip
- `flip-zoom-y` - Zoom with Y flip

#### **Skew Family**
- `skew-x` - X-axis skew
- `skew-y` - Y-axis skew

#### **Tilt/Rotation**
- `tilt` - Tilting motion
- `twist` - Twisting motion

#### **Expand Family**
- `expand-down` - Expand downward
- `expand-left` - Expand leftward
- `expand-right` - Expand rightward
- `expand-up` - Expand upward

#### **Spring Family**
- `spring-down` - Spring motion down
- `spring-left` - Spring motion left
- `spring-right` - Spring motion right  
- `spring-up` - Spring motion up

#### **Throw/Fall Family**
- `throw-down`, `throw-left`, `throw-right`, `throw-up` - Throwing motions
- `fall-down`, `fall-left`, `fall-right`, `fall-up` - Falling motions

### 🎨 **Specialized Effects** (`specialized/`)
Advanced visual effects and unique animations.

#### **Physics-Based**
- `bubble` - Bubble effect
- `ripple` - Ripple spreading
- `wave` - Wave motion
- `splash` - Splash effect
- `magnetic` - Magnetic attraction
- `elastic` - Elastic deformation

#### **Visual Effects**
- `glitch` - Digital glitch
- `neon` - Neon glow effect
- `glow` - Soft glow
- `shimmer` - Shimmering effect
- `shadow` - Shadow effects
- `distort` - Distortion effect
- `morph` - Morphing transition
- `melt` - Melting effect
- `drip` - Dripping effect

#### **Power/Electronic**
- `power-on` - Power-up effect
- `power-off` - Power-down effect

#### **Special Motions**
- `accordion` - Accordion folding
- `explode` - Explosion effect
- `implode` - Implosion effect
- `scatter` - Scattering effect
- `figure-eight` - Figure-8 motion
- `spiral` - Spiral motion
- `spiral-path` - Spiral path following

#### **Slide Variations**
- `slide-peek-down`, `slide-peek-left`, `slide-peek-right`, `slide-peek-up` - Peek animations
- `slide-stack` - Stacking slide

#### **Typography-Specific**
- `typing` - Typewriter effect
- `letter-space-in` - Letter spacing in
- `letter-space-out` - Letter spacing out
- `word-slide` - Word sliding
- `hue-shift` - Color shifting

## 🎯 Documentation Strategy

### Story Organization
Each category will have its own story file with:
- **Overview** - Category description and use cases
- **Animation Grid** - Visual showcase of all effects
- **Individual Examples** - Detailed documentation per animation
- **Timing Variations** - Different durations and delays
- **Best Practices** - UX guidelines and accessibility

### Technical Documentation
- **Performance Notes** - GPU acceleration and optimization
- **Browser Support** - Compatibility information
- **Accessibility** - Motion preference compliance
- **Implementation** - CSS custom properties and keyframes

### Interactive Features
- **Live Playground** - Test animations with controls
- **Comparison Tools** - Side-by-side effect comparisons
- **Timing Adjustment** - Real-time duration/delay tuning
- **Code Examples** - Copy-paste ready implementations