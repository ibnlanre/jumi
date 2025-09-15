import { JumiPluginOptions, PluginAPI } from "./types";
import { defaultTheme } from "./config/defaults";
import { addAnimationUtilities } from "./utilities/animation";
import { createEnhancedJumiUtilities } from "./utils/enhancedUtilities";

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
function jumiPlugin(api: PluginAPI, options: JumiPluginOptions = {}) {
  const { addVariant } = api;

  // Add core animation timing utilities (duration, delay, easing)
  addAnimationUtilities(api);

  // Add all enhanced utilities with the new composable architecture
  createEnhancedJumiUtilities()(api);

  // Add hover variants if enabled (default: true)
  if (options.enableHover !== false) {
    addVariant("animate-hover", "&:hover");
  }

  // Add group hover variants if enabled (default: true)
  if (options.enableGroup !== false) {
    addVariant("group-animate-hover", ":merge(.group):hover &");
  }

  // Add responsive variants if enabled (default: true)
  // These are automatically handled by TailwindCSS's responsive system

  // Add dark mode variants if enabled (default: false)
  if (options.enableDark === true) {
    addVariant("dark-animate", ":merge(.dark) &");
    addVariant("dark-animate-hover", ":merge(.dark) &:hover");
  }
}

// Plugin with configuration function
function jumiPluginWithConfig(options: JumiPluginOptions = {}) {
  return {
    handler: (api: PluginAPI) => jumiPlugin(api, options),
    config: {
      theme: {
        extend: {
          // Merge user theme with defaults
          jumi: {
            ...defaultTheme,
            ...(options.theme || {}),
          },
        },
      },
    },
  };
}

export default jumiPluginWithConfig;

export {
  jumiPlugin,
  jumiPluginWithConfig,
  defaultTheme,
  addAnimationUtilities,
  createEnhancedJumiUtilities,
};

// Type exports
export type {
  JumiPluginOptions,
  JumiTheme,
  KeyframeDefinition,
  Direction,
  DirectionConfig,
} from "./types";
