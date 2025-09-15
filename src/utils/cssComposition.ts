/**
 * Enhanced CSS value composition system for Jumi animations
 * Inspired by TailwindCSS's cssTransformValue pattern but optimized for animations
 */

/**
 * Composed CSS transform value using CSS custom properties
 * This allows multiple transform utilities to work together seamlessly
 */
export const transformValue = [
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
export const filterValue = [
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
export const backdropFilterValue = [
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
 * Utility class definitions that use the composed values
 */
export const jumiUtilityClasses = {
  // Transform classes
  ".jumi-transform": {
    "@defaults jumi-transform": {},
    transform: transformValue,
  },
  ".jumi-transform-gpu": {
    "@defaults jumi-transform": {},
    transform: transformValue.replace(
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
    filter: filterValue,
  },
  ".jumi-filter-none": {
    filter: "none",
  },

  // Backdrop filter classes
  ".jumi-backdrop": {
    "@defaults jumi-backdrop": {},
    "backdrop-filter": backdropFilterValue,
    "-webkit-backdrop-filter": backdropFilterValue,
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
