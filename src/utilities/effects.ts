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
  const effects = theme("jumi.effects") ?? defaultTheme.effects;

  // Generate effect utilities
  matchUtilities(
    {
      animate: (value: string) => {
        // Check if it's a predefined effect
        if (keyframes[value]) {
          return {
            "animation-name": value,
            "animation-duration": "var(--jumi-duration)",
            "animation-timing-function": "var(--jumi-timing-function)",
            "animation-delay": "var(--jumi-delay)",
            "animation-direction": "var(--jumi-direction)",
            "animation-iteration-count": "var(--jumi-iteration-count)",
            "animation-fill-mode": "var(--jumi-fill-mode)",
            "animation-play-state": "var(--jumi-play-state)",
          };
        }

        // Fallback for custom animation names
        return {
          "animation-name": value,
          "animation-duration": "var(--jumi-duration)",
          "animation-timing-function": "var(--jumi-timing-function)",
          "animation-delay": "var(--jumi-delay)",
          "animation-direction": "var(--jumi-direction)",
          "animation-iteration-count": "var(--jumi-iteration-count)",
          "animation-fill-mode": "var(--jumi-fill-mode)",
          "animation-play-state": "var(--jumi-play-state)",
        };
      },
    },
    {
      values: effects,
    }
  );

  // Individual effect utilities for better naming
  Object.keys(keyframes).forEach((effectName) => {
    matchUtilities(
      {
        [`animate-${effectName}`]: () => ({
          "animation-name": effectName,
          "animation-duration": "var(--jumi-duration)",
          "animation-timing-function": "var(--jumi-timing-function)",
          "animation-delay": "var(--jumi-delay)",
          "animation-direction": "var(--jumi-direction)",
          "animation-iteration-count": "var(--jumi-iteration-count)",
          "animation-fill-mode": "var(--jumi-fill-mode)",
          "animation-play-state": "var(--jumi-play-state)",
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
      "animate-fade-to": (value: string) => ({
        "animation-name": "jumi-fade-to",
        "animation-duration": "var(--jumi-duration)",
        "animation-timing-function": "var(--jumi-timing-function)",
        "animation-delay": "var(--jumi-delay)",
        "animation-direction": "var(--jumi-direction)",
        "animation-iteration-count": "var(--jumi-iteration-count)",
        "animation-fill-mode": "var(--jumi-fill-mode)",
        "animation-play-state": "var(--jumi-play-state)",
        "--jumi-fade-to-opacity": value,
      }),
    },
    {
      values: opacityValues,
    }
  );

  // Add custom fade-to keyframe
  addBase({
    "@keyframes jumi-fade-to": {
      to: {
        opacity: "var(--jumi-fade-to-opacity, 1)",
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
      "animate-blur-to": (value: string) => ({
        "animation-name": "jumi-blur-to",
        "animation-duration": "var(--jumi-duration)",
        "animation-timing-function": "var(--jumi-timing-function)",
        "animation-delay": "var(--jumi-delay)",
        "animation-direction": "var(--jumi-direction)",
        "animation-iteration-count": "var(--jumi-iteration-count)",
        "animation-fill-mode": "var(--jumi-fill-mode)",
        "animation-play-state": "var(--jumi-play-state)",
        "--jumi-blur-to": value,
      }),
    },
    {
      values: blurValues,
      type: "length",
    }
  );

  // Add custom blur-to keyframe
  addBase({
    "@keyframes jumi-blur-to": {
      to: {
        filter: "blur(var(--jumi-blur-to, 0))",
      },
    },
  });

  // Background color animation utilities
  matchUtilities(
    {
      "animate-bg-to": (value: string) => ({
        "animation-name": "jumi-bg-to",
        "animation-duration": "var(--jumi-duration)",
        "animation-timing-function": "var(--jumi-timing-function)",
        "animation-delay": "var(--jumi-delay)",
        "animation-direction": "var(--jumi-direction)",
        "animation-iteration-count": "var(--jumi-iteration-count)",
        "animation-fill-mode": "var(--jumi-fill-mode)",
        "animation-play-state": "var(--jumi-play-state)",
        "--jumi-bg-to": value,
      }),
    },
    {
      values: theme("colors") ?? {},
      type: "color",
    }
  );

  // Add custom background color keyframe
  addBase({
    "@keyframes jumi-bg-to": {
      to: {
        "background-color": "var(--jumi-bg-to)",
      },
    },
  });

  // Text color animation utilities
  matchUtilities(
    {
      "animate-text-to": (value: string) => ({
        "animation-name": "jumi-text-to",
        "animation-duration": "var(--jumi-duration)",
        "animation-timing-function": "var(--jumi-timing-function)",
        "animation-delay": "var(--jumi-delay)",
        "animation-direction": "var(--jumi-direction)",
        "animation-iteration-count": "var(--jumi-iteration-count)",
        "animation-fill-mode": "var(--jumi-fill-mode)",
        "animation-play-state": "var(--jumi-play-state)",
        "--jumi-text-to": value,
      }),
    },
    {
      values: theme("colors") ?? {},
      type: "color",
    }
  );

  // Add custom text color keyframe
  addBase({
    "@keyframes jumi-text-to": {
      to: {
        color: "var(--jumi-text-to)",
      },
    },
  });
}
