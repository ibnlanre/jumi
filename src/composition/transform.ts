/**
 * Composed CSS transform value using CSS custom properties
 * This allows multiple transform utilities to work together seamlessly
 */
export const transform = [
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
