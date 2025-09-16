import type { PluginAPI, PluginCreator } from "tailwindcss/types/config";

import { addTransformUtilities } from "./utilities/transforms";
import { addEffectUtilities } from "./utilities/effects";
import { addPropertyUtilities } from "./utilities/properties";
import { variables } from "./config/variables";

/**
 * Jumi - TailwindCSS Animation Plugin
 *
 * A comprehensive CSS animation library that provides:
 * - Rich timing utilities (duration, delay, easing curves)
 * - Transform animations (translate, rotate, scale) with composability
 * - Effect animations (bounce, fade, slide, zoom)
 * - Property animations (width, height, colors, borders)
 * - Composable animation system with CSS custom properties
 * - Enhanced architecture inspired by TailwindCSS core plugins
 *
 * @param options Configuration options for the plugin
 */
const jumiPlugin: PluginCreator = (api) => {
  const { addBase, addVariant } = api;

  // addBase(generateTransformKeyframes());
  addBase({
    ".animate": variables,
  });

  addTransformUtilities(api);
  addEffectUtilities(api);
  addPropertyUtilities(api);

  addVariant("animate-hover", "&:hover");
  addVariant("group-animate-hover", ":merge(.group):hover &");
}

export default jumiPlugin;