/**
 * Enhanced CSS value composition system for Jumi animations
 * Inspired by TailwindCSS's cssTransformValue pattern but optimized for animations
 */

/**
 * Composed CSS transform value using CSS custom properties
 * This allows multiple transform utilities to work together seamlessly
 */
export const cssJumiTransformValue = [
  "translateX(var(--jumi-translate-x, 0))",
  "translateY(var(--jumi-translate-y, 0))",
  "translateZ(var(--jumi-translate-z, 0))",
  "rotate(var(--jumi-rotate, 0deg))",
  "rotateX(var(--jumi-rotate-x, 0deg))",
  "rotateY(var(--jumi-rotate-y, 0deg))",
  "rotateZ(var(--jumi-rotate-z, 0deg))",
  "skewX(var(--jumi-skew-x, 0deg))",
  "skewY(var(--jumi-skew-y, 0deg))",
  "scaleX(var(--jumi-scale-x, 1))",
  "scaleY(var(--jumi-scale-y, 1))",
  "scaleZ(var(--jumi-scale-z, 1))",
].join(" ");

/**
 * Composed CSS filter value using CSS custom properties
 */
export const cssJumiFilterValue = [
  "var(--jumi-blur, blur(0))",
  "var(--jumi-brightness, brightness(1))",
  "var(--jumi-contrast, contrast(1))",
  "var(--jumi-grayscale, grayscale(0))",
  "var(--jumi-hue-rotate, hue-rotate(0deg))",
  "var(--jumi-invert, invert(0))",
  "var(--jumi-saturate, saturate(1))",
  "var(--jumi-sepia, sepia(0))",
  "var(--jumi-drop-shadow, drop-shadow(0 0 0 transparent))",
].join(" ");

/**
 * Composed CSS backdrop filter value
 */
export const cssJumiBackdropFilterValue = [
  "var(--jumi-backdrop-blur, blur(0))",
  "var(--jumi-backdrop-brightness, brightness(1))",
  "var(--jumi-backdrop-contrast, contrast(1))",
  "var(--jumi-backdrop-grayscale, grayscale(0))",
  "var(--jumi-backdrop-hue-rotate, hue-rotate(0deg))",
  "var(--jumi-backdrop-invert, invert(0))",
  "var(--jumi-backdrop-opacity, opacity(1))",
  "var(--jumi-backdrop-saturate, saturate(1))",
  "var(--jumi-backdrop-sepia, sepia(0))",
].join(" ");

/**
 * Transform origin composition for more granular control
 */
export const cssJumiTransformOriginValue =
  "var(--jumi-transform-origin-x, 50%) var(--jumi-transform-origin-y, 50%) var(--jumi-transform-origin-z, 0px)";

/**
 * Animation composition for complex animations
 */
export const cssJumiAnimationValue = [
  "var(--jumi-animation-name, none)",
  "var(--jumi-animation-duration, 1s)",
  "var(--jumi-animation-timing-function, ease)",
  "var(--jumi-animation-delay, 0s)",
  "var(--jumi-animation-iteration-count, 1)",
  "var(--jumi-animation-direction, normal)",
  "var(--jumi-animation-fill-mode, both)",
  "var(--jumi-animation-play-state, running)",
].join(" ");

/**
 * Default values for all Jumi CSS custom properties
 * Similar to TailwindCSS's @defaults system
 */
export const jumiDefaults = {
  // Transform defaults
  "--jumi-translate-x": "0",
  "--jumi-translate-y": "0",
  "--jumi-translate-z": "0",
  "--jumi-rotate": "0deg",
  "--jumi-rotate-x": "0deg",
  "--jumi-rotate-y": "0deg",
  "--jumi-rotate-z": "0deg",
  "--jumi-skew-x": "0deg",
  "--jumi-skew-y": "0deg",
  "--jumi-scale-x": "1",
  "--jumi-scale-y": "1",
  "--jumi-scale-z": "1",

  // Transform origin defaults
  "--jumi-transform-origin-x": "50%",
  "--jumi-transform-origin-y": "50%",
  "--jumi-transform-origin-z": "0px",

  // Filter defaults
  "--jumi-blur": "blur(0)",
  "--jumi-brightness": "brightness(1)",
  "--jumi-contrast": "contrast(1)",
  "--jumi-grayscale": "grayscale(0)",
  "--jumi-hue-rotate": "hue-rotate(0deg)",
  "--jumi-invert": "invert(0)",
  "--jumi-saturate": "saturate(1)",
  "--jumi-sepia": "sepia(0)",
  "--jumi-drop-shadow": "drop-shadow(0 0 0 transparent)",

  // Backdrop filter defaults
  "--jumi-backdrop-blur": "blur(0)",
  "--jumi-backdrop-brightness": "brightness(1)",
  "--jumi-backdrop-contrast": "contrast(1)",
  "--jumi-backdrop-grayscale": "grayscale(0)",
  "--jumi-backdrop-hue-rotate": "hue-rotate(0deg)",
  "--jumi-backdrop-invert": "invert(0)",
  "--jumi-backdrop-opacity": "opacity(1)",
  "--jumi-backdrop-saturate": "saturate(1)",
  "--jumi-backdrop-sepia": "sepia(0)",

  // Animation defaults
  "--jumi-animation-name": "none",
  "--jumi-animation-duration": "1s",
  "--jumi-animation-timing-function": "ease",
  "--jumi-animation-delay": "0s",
  "--jumi-animation-iteration-count": "1",
  "--jumi-animation-direction": "normal",
  "--jumi-animation-fill-mode": "both",
  "--jumi-animation-play-state": "running",

  // Property animation defaults (for our animate-{property} utilities)
  "--jumi-width": "auto",
  "--jumi-height": "auto",
  "--jumi-opacity": "1",
  "--jumi-color": "inherit",
  "--jumi-bg-color": "transparent",
  "--jumi-border-color": "currentColor",
  "--jumi-border-width": "0",
  "--jumi-border-radius": "0",
  "--jumi-shadow": "0 0 0 0 transparent",
  "--jumi-font-size": "1rem",
  "--jumi-line-height": "1.5",
  "--jumi-font-weight": "400",
  "--jumi-letter-spacing": "0em",
  "--jumi-text-shadow": "none",

  // Positioning defaults
  "--jumi-top": "auto",
  "--jumi-right": "auto",
  "--jumi-bottom": "auto",
  "--jumi-left": "auto",
  "--jumi-z-index": "auto",

  // Flexbox defaults
  "--jumi-flex-grow": "0",
  "--jumi-flex-shrink": "1",
  "--jumi-flex-basis": "auto",
  "--jumi-gap": "0",
  "--jumi-order": "0",

  // Outline defaults
  "--jumi-outline-width": "0",
  "--jumi-outline-color": "currentColor",
  "--jumi-outline-offset": "0",

  // Background defaults
  "--jumi-bg-size": "auto",
  "--jumi-bg-position": "0% 0%",

  // SVG defaults
  "--jumi-fill": "currentColor",
  "--jumi-stroke": "none",
  "--jumi-stroke-width": "1",
};

/**
 * Utility class definitions that use the composed values
 */
export const jumiUtilityClasses = {
  // Transform classes
  ".jumi-transform": {
    "@defaults jumi-transform": {},
    transform: cssJumiTransformValue,
  },
  ".jumi-transform-gpu": {
    "@defaults jumi-transform": {},
    transform: cssJumiTransformValue.replace(
      "translateX(var(--jumi-translate-x, 0)) translateY(var(--jumi-translate-y, 0)) translateZ(var(--jumi-translate-z, 0))",
      "translate3d(var(--jumi-translate-x, 0), var(--jumi-translate-y, 0), var(--jumi-translate-z, 0))"
    ),
  },
  ".jumi-transform-none": {
    transform: "none",
  },

  // Filter classes
  ".jumi-filter": {
    "@defaults jumi-filter": {},
    filter: cssJumiFilterValue,
  },
  ".jumi-filter-none": {
    filter: "none",
  },

  // Backdrop filter classes
  ".jumi-backdrop": {
    "@defaults jumi-backdrop": {},
    "backdrop-filter": cssJumiBackdropFilterValue,
    "-webkit-backdrop-filter": cssJumiBackdropFilterValue,
  },
  ".jumi-backdrop-none": {
    "backdrop-filter": "none",
    "-webkit-backdrop-filter": "none",
  },

  // Animation base class
  ".animate": {
    "@defaults jumi-animation": {},
    "animation-name": "var(--jumi-animation-name)",
    "animation-duration": "var(--jumi-animation-duration)",
    "animation-timing-function": "var(--jumi-animation-timing-function)",
    "animation-delay": "var(--jumi-animation-delay)",
    "animation-iteration-count": "var(--jumi-animation-iteration-count)",
    "animation-direction": "var(--jumi-animation-direction)",
    "animation-fill-mode": "var(--jumi-animation-fill-mode)",
    "animation-play-state": "var(--jumi-animation-play-state)",
  },
};
