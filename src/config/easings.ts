import { EasingDefinition } from "../types";

/**
 * Comprehensive easing curve definitions
 * Based on the existing Sass variables but expanded for TailwindCSS
 */

export const easingCurves: Record<string, EasingDefinition> = {
  // Linear
  linear: {
    name: "linear",
    value: "linear",
    category: "ease-in",
  },

  // Default CSS easings
  ease: {
    name: "ease",
    value: "ease",
    category: "ease-in-out",
  },
  "ease-in": {
    name: "ease-in",
    value: "ease-in",
    category: "ease-in",
  },
  "ease-out": {
    name: "ease-out",
    value: "ease-out",
    category: "ease-out",
  },
  "ease-in-out": {
    name: "ease-in-out",
    value: "ease-in-out",
    category: "ease-in-out",
  },

  // Custom ease-in curves
  "ease-in-quad": {
    name: "ease-in-quad",
    value: "cubic-bezier(0.11, 0, 0.5, 0)",
    category: "ease-in",
  },
  "ease-in-cubic": {
    name: "ease-in-cubic",
    value: "cubic-bezier(0.32, 0, 0.67, 0)",
    category: "ease-in",
  },
  "ease-in-quart": {
    name: "ease-in-quart",
    value: "cubic-bezier(0.5, 0, 0.75, 0)",
    category: "ease-in",
  },
  "ease-in-quint": {
    name: "ease-in-quint",
    value: "cubic-bezier(0.64, 0, 0.78, 0)",
    category: "ease-in",
  },
  "ease-in-sine": {
    name: "ease-in-sine",
    value: "cubic-bezier(0.12, 0, 0.39, 0)",
    category: "ease-in",
  },
  "ease-in-expo": {
    name: "ease-in-expo",
    value: "cubic-bezier(0.7, 0, 0.84, 0)",
    category: "ease-in",
  },
  "ease-in-circ": {
    name: "ease-in-circ",
    value: "cubic-bezier(0.55, 0, 1, 0.45)",
    category: "ease-in",
  },
  "ease-in-back": {
    name: "ease-in-back",
    value: "cubic-bezier(0.36, 0, 0.66, -0.56)",
    category: "ease-in",
  },

  // Custom ease-out curves
  "ease-out-quad": {
    name: "ease-out-quad",
    value: "cubic-bezier(0.5, 1, 0.89, 1)",
    category: "ease-out",
  },
  "ease-out-cubic": {
    name: "ease-out-cubic",
    value: "cubic-bezier(0.33, 1, 0.68, 1)",
    category: "ease-out",
  },
  "ease-out-quart": {
    name: "ease-out-quart",
    value: "cubic-bezier(0.25, 1, 0.5, 1)",
    category: "ease-out",
  },
  "ease-out-quint": {
    name: "ease-out-quint",
    value: "cubic-bezier(0.22, 1, 0.36, 1)",
    category: "ease-out",
  },
  "ease-out-sine": {
    name: "ease-out-sine",
    value: "cubic-bezier(0.61, 1, 0.88, 1)",
    category: "ease-out",
  },
  "ease-out-expo": {
    name: "ease-out-expo",
    value: "cubic-bezier(0.16, 1, 0.3, 1)",
    category: "ease-out",
  },
  "ease-out-circ": {
    name: "ease-out-circ",
    value: "cubic-bezier(0, 0.55, 0.45, 1)",
    category: "ease-out",
  },
  "ease-out-back": {
    name: "ease-out-back",
    value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    category: "ease-out",
  },

  // Custom ease-in-out curves
  "ease-in-out-quad": {
    name: "ease-in-out-quad",
    value: "cubic-bezier(0.45, 0, 0.55, 1)",
    category: "ease-in-out",
  },
  "ease-in-out-cubic": {
    name: "ease-in-out-cubic",
    value: "cubic-bezier(0.65, 0, 0.35, 1)",
    category: "ease-in-out",
  },
  "ease-in-out-quart": {
    name: "ease-in-out-quart",
    value: "cubic-bezier(0.76, 0, 0.24, 1)",
    category: "ease-in-out",
  },
  "ease-in-out-quint": {
    name: "ease-in-out-quint",
    value: "cubic-bezier(0.83, 0, 0.17, 1)",
    category: "ease-in-out",
  },
  "ease-in-out-sine": {
    name: "ease-in-out-sine",
    value: "cubic-bezier(0.37, 0, 0.63, 1)",
    category: "ease-in-out",
  },
  "ease-in-out-expo": {
    name: "ease-in-out-expo",
    value: "cubic-bezier(0.87, 0, 0.13, 1)",
    category: "ease-in-out",
  },
  "ease-in-out-circ": {
    name: "ease-in-out-circ",
    value: "cubic-bezier(0.85, 0, 0.15, 1)",
    category: "ease-in-out",
  },
  "ease-in-out-back": {
    name: "ease-in-out-back",
    value: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
    category: "ease-in-out",
  },
};

/**
 * Helper function to get easing curves by category
 */
export function getEasingsByCategory(
  category: "ease-in" | "ease-out" | "ease-in-out"
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(easingCurves)
      .filter(([, easing]) => easing.category === category)
      .map(([key, easing]) => [key, easing.value])
  );
}

/**
 * Helper function to get all easing values
 */
export function getAllEasings(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(easingCurves).map(([key, easing]) => [key, easing.value])
  );
}
