import { variables } from "../config/variables";
import { PluginAPI } from "../types";
import {
  createJumiUtilityPlugin,
  createTransformUtilities,
  createFilterUtilities,
} from "./createJumiUtilityPlugin";
import {
  transformValue,
  filterValue,
  backdropFilterValue,
} from "./cssComposition";

/**
 * Enhanced Jumi utilities using TailwindCSS patterns
 * This file demonstrates the new architecture inspired by TailwindCSS core plugins
 */

/**
 * Property-based animation utilities using the new plugin system
 */
export const enhancedPropertyUtilities = {
  // Opacity animations
  "animate-opacity": createJumiUtilityPlugin(
    "opacity",
    [
      {
        classPrefix: "animate-opacity",
        properties: ["opacity"],
      },
    ],
    {
      type: "number",
      valueTransformer: (value: string) => value,
      defaultProperties: {
        "--jumi-opacity-from": "0",
        "--jumi-opacity-to": "1",
      },
    }
  ),

  // Dimension animations
  "animate-width": createJumiUtilityPlugin(
    "width",
    [
      {
        classPrefix: "animate-w",
        properties: ["width"],
      },
    ],
    {
      type: "length",
      supportsNegativeValues: false,
    }
  ),

  "animate-height": createJumiUtilityPlugin(
    "height",
    [
      {
        classPrefix: "animate-h",
        properties: ["height"],
      },
    ],
    {
      type: "length",
      supportsNegativeValues: false,
    }
  ),

  // Position animations
  "animate-position": createJumiUtilityPlugin(
    "position",
    [
      { classPrefix: "animate-top", properties: ["top"] },
      { classPrefix: "animate-right", properties: ["right"] },
      { classPrefix: "animate-bottom", properties: ["bottom"] },
      { classPrefix: "animate-left", properties: ["left"] },
    ],
    {
      type: "length",
      supportsNegativeValues: true,
    }
  ),

  // Color animations
  "animate-colors": createJumiUtilityPlugin(
    "colors",
    [
      { classPrefix: "animate-text", properties: ["color"] },
      { classPrefix: "animate-bg", properties: ["background-color"] },
      { classPrefix: "animate-border", properties: ["border-color"] },
    ],
    {
      type: "color",
    }
  ),

  // Border animations
  "animate-border-width": createJumiUtilityPlugin(
    "borderWidth",
    [
      {
        classPrefix: "animate-border-w",
        properties: ["border-width"],
      },
    ],
    {
      type: "length",
      supportsNegativeValues: false,
    }
  ),

  "animate-border-radius": createJumiUtilityPlugin(
    "borderRadius",
    [
      {
        classPrefix: "animate-rounded",
        properties: ["border-radius"],
      },
    ],
    {
      type: "length",
      supportsNegativeValues: false,
    }
  ),
};

/**
 * Core animation property utilities
 */
export const coreAnimationUtilities = {
  // Animation timing and control
  "animation-duration": createJumiUtilityPlugin(
    "durations",
    [
      {
        classPrefix: "animate-duration",
        properties: ["animation-duration"],
      },
    ],
    {
      type: "any",
    }
  ),

  "animation-delay": createJumiUtilityPlugin(
    "delays",
    [
      {
        classPrefix: "animate-delay",
        properties: ["animation-delay"],
      },
    ],
    {
      type: "any",
    }
  ),

  "animation-timing-function": createJumiUtilityPlugin("timingFunctions", [
    {
      classPrefix: "animate-ease",
      properties: ["animation-timing-function"],
    },
  ]),

  "animation-iteration-count": createJumiUtilityPlugin(
    "iterationCounts",
    [
      {
        classPrefix: "animate-repeat",
        properties: ["animation-iteration-count"],
      },
    ],
    {
      type: "number",
    }
  ),

  "animation-direction": createJumiUtilityPlugin("directions", [
    {
      classPrefix: "animate-direction",
      properties: ["animation-direction"],
    },
  ]),

  "animation-fill-mode": createJumiUtilityPlugin("fillModes", [
    {
      classPrefix: "animate-fill",
      properties: ["animation-fill-mode"],
    },
  ]),

  "animation-play-state": createJumiUtilityPlugin("playStates", [
    {
      classPrefix: "animate-play",
      properties: ["animation-play-state"],
    },
  ]),
};

/**
 * Generate keyframes for composed CSS custom property animations
 */
export function generateComposedKeyframes(): (api: PluginAPI) => void {
  return function ({ addBase }: PluginAPI) {
    addBase({
      // Transform keyframes using CSS custom properties
      "@keyframes jumi-translate-x": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-translate-y": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-translate-z": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-rotate": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-rotate-x": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-rotate-y": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-rotate-z": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-scale-uniform": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-scale-x": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-scale-y": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-scale-z": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-skew-x": {
        to: { transform: transformValue },
      },
      "@keyframes jumi-skew-y": {
        to: { transform: transformValue },
      },

      // Filter keyframes using CSS custom properties
      "@keyframes jumi-blur": {
        to: { filter: filterValue },
      },
      "@keyframes jumi-brightness": {
        to: { filter: filterValue },
      },
      "@keyframes jumi-contrast": {
        to: { filter: filterValue },
      },
      "@keyframes jumi-grayscale": {
        to: { filter: filterValue },
      },
      "@keyframes jumi-hue-rotate": {
        to: { filter: filterValue },
      },
      "@keyframes jumi-invert": {
        to: { filter: filterValue },
      },
      "@keyframes jumi-saturate": {
        to: { filter: filterValue },
      },
      "@keyframes jumi-sepia": {
        to: { filter: filterValue },
      },

      // Backdrop filter keyframes
      "@keyframes jumi-backdrop-blur": {
        to: { backdropFilter: backdropFilterValue },
      },
      "@keyframes jumi-backdrop-brightness": {
        to: { backdropFilter: backdropFilterValue },
      },
      "@keyframes jumi-backdrop-contrast": {
        to: { backdropFilter: backdropFilterValue },
      },
      "@keyframes jumi-backdrop-grayscale": {
        to: { backdropFilter: backdropFilterValue },
      },
      "@keyframes jumi-backdrop-hue-rotate": {
        to: { backdropFilter: backdropFilterValue },
      },
      "@keyframes jumi-backdrop-invert": {
        to: { backdropFilter: backdropFilterValue },
      },
      "@keyframes jumi-backdrop-saturate": {
        to: { backdropFilter: backdropFilterValue },
      },
      "@keyframes jumi-backdrop-sepia": {
        to: { backdropFilter: backdropFilterValue },
      },
    });
  };
}

/**
 * Add global CSS custom property defaults
 */
export function addJumiDefaults(): (api: PluginAPI) => void {
  return function ({ addBase }: PluginAPI) {
    addBase({
      ".animate": variables,
    });
  };
}

/**
 * Complete enhanced utilities integration
 * This combines all the new patterns into a cohesive system
 */
export function createEnhancedJumiUtilities(): (api: PluginAPI) => void {
  return function (api: PluginAPI) {
    // Add global defaults
    addJumiDefaults()(api);

    // Add composed keyframes
    generateComposedKeyframes()(api);

    // Add composable transform utilities
    createTransformUtilities()(api);

    // Add composable filter utilities
    createFilterUtilities()(api);

    // Add all enhanced property utilities
    Object.values(enhancedPropertyUtilities).forEach((utility) => {
      utility(api);
    });

    // Add core animation utilities
    Object.values(coreAnimationUtilities).forEach((utility) => {
      utility(api);
    });
  };
}

/**
 * Example usage patterns for the new system
 *
 * Basic property animation:
 * <div class="animate-opacity-50 animate-duration-300 animate-ease-out">
 *
 * Composed transform animation:
 * <div class="animate-translate-x-4 animate-rotate-45 animate-scale-110">
 *
 * Complex filter animation:
 * <div class="animate-blur-sm animate-brightness-110 animate-saturate-150">
 *
 * Combined animation with custom properties:
 * <div class="animate-translate-x-8 animate-duration-500 animate-ease-bounce">
 *
 * Multiple simultaneous animations:
 * <div class="animate-w-64 animate-h-32 animate-bg-blue-500 animate-duration-1000">
 */
