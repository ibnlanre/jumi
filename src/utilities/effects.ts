import { PluginAPI } from "../types";
import { defaultTheme } from "../config/defaults";
import { keyframes, getKeyframesAsCSS } from "../config/keyframes";

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

  // Get available effects from theme or defaults
  const effects: string[] = theme("jumi.effects") ?? defaultTheme.effects;

  // Individual effect utilities with intelligent naming
  effects.forEach((effectName) => {
    matchUtilities(
      {
        [`animate-${effectName}`]: () => ({
          "animation-name": effectName,
        }),
      },
      {
        values: { DEFAULT: "DEFAULT" },
      }
    );
  });

  // Opacity-based effects (fade utilities)
  const opacityValues = {
    "0": "0",
    "5": "0.05",
    "10": "0.1",
    "20": "0.2",
    "25": "0.25",
    "30": "0.3",
    "40": "0.4",
    "50": "0.5",
    "60": "0.6",
    "70": "0.7",
    "75": "0.75",
    "80": "0.8",
    "90": "0.9",
    "95": "0.95",
    "100": "1",
  };

  matchUtilities(
    {
      "animate-opacity": (value: string) => ({
        "animation-name": "jumi-opacity",
        "--jumi-opacity": value,
      }),
    },
    {
      values: opacityValues,
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
  const blurValues = {
    "0": "0",
    sm: "4px",
    DEFAULT: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "40px",
    "3xl": "64px",
  };

  matchUtilities(
    {
      "animate-blur": (value: string) => ({
        "animation-name": "jumi-blur",
        "--jumi-blur": value,
      }),
    },
    {
      values: blurValues,
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
      values: theme("colors") ?? {},
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

  // Text color animation utilities
  matchUtilities(
    {
      "animate-text": (value: string) => ({
        "animation-name": "jumi-text",
        "--jumi-text": value,
      }),
    },
    {
      values: theme("colors") ?? {},
      type: "color",
    }
  );

  // Add custom text color keyframe
  addBase({
    "@keyframes jumi-text": {
      to: {
        color: "var(--jumi-text)",
      },
    },
  });
}
