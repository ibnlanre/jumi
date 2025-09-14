import { PluginAPI } from "../types";
import { defaultTheme } from "../config/defaults";
import { getKeyframesAsCSS } from "../config/keyframes";

/**
 * Effect utilities (bounce, fade, slide, zoom, etc.)
 */

export function addEffectUtilities({
  addBase,
  matchUtilities,
  theme,
}: PluginAPI) {
  // Add all keyframes as base styles
  addBase(getKeyframesAsCSS());

  matchUtilities(
    {
      animate: (value: string) => {
        return {
          "animation-name": value,
        };
      },
    },
    {
      values: theme("jumi.effects") ?? defaultTheme.effects,
    }
  );

  // Opacity-based effects (fade utilities)
  matchUtilities(
    {
      "animate-opacity": (value: string) => ({
        "animation-name": "jumi-opacity",
        "--jumi-opacity": value,
      }),
    },
    {
      values: theme("jumi.opacity") ?? defaultTheme.opacity,
      type: "number",
    }
  );

  // Add custom fade keyframe
  addBase({
    "@keyframes jumi-opacity": {
      to: {
        opacity: "var(--jumi-opacity, 1)",
      },
    },
  });

  // Blur effect utilities
  matchUtilities(
    {
      "animate-blur": (value: string) => ({
        "animation-name": "jumi-blur",
        "--jumi-blur": value,
      }),
    },
    {
      values: theme("jumi.blur") ?? defaultTheme.blur,
      type: "length",
    }
  );

  // Add custom blur keyframe
  addBase({
    "@keyframes jumi-blur": {
      to: {
        filter: "blur(var(--jumi-blur, 0))",
      },
    },
  });

  // Background color animation utilities
  matchUtilities(
    {
      "animate-bg": (value: string) => ({
        "animation-name": "jumi-bg",
        "--jumi-bg": value,
      }),
    },
    {
      values: theme("colors"),
      type: "color",
    }
  );

  // Add custom background color keyframe
  addBase({
    "@keyframes jumi-bg": {
      to: {
        "background-color": "var(--jumi-bg)",
      },
    },
  });
}
