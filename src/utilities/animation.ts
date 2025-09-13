import { PluginAPI } from "../types";
import { defaultTheme } from "../config/defaults";

/**
 * Animation timing utilities (duration, delay, timing-function)
 */

export function addAnimationUtilities({
  addBase,
  matchUtilities,
  theme,
}: PluginAPI) {
  // Add CSS custom properties base
  addBase({
    ":root": {
      "--jumi-duration": "1s",
      "--jumi-timing-function": "ease",
      "--jumi-delay": "0s",
      "--jumi-direction": "normal",
      "--jumi-iteration-count": "1",
      "--jumi-fill-mode": "forwards",
      "--jumi-play-state": "running",
    },

    // Reset class for composable animations
    ".animate-reset": {
      "--jumi-duration": "1s",
      "--jumi-timing-function": "ease",
      "--jumi-delay": "0s",
      "--jumi-direction": "normal",
      "--jumi-iteration-count": "1",
      "--jumi-fill-mode": "forwards",
      "--jumi-play-state": "running",
    },
  });

  // Duration utilities
  matchUtilities(
    {
      "animate-duration": (value: string) => ({
        "--jumi-duration": value,
        "animation-duration": value,
      }),
    },
    {
      values: theme("jumi.durations") ?? defaultTheme.durations,
      type: "time",
    }
  );

  // Delay utilities
  matchUtilities(
    {
      "animate-delay": (value: string) => ({
        "--jumi-delay": value,
        "animation-delay": value,
      }),
    },
    {
      values: theme("jumi.delays") ?? defaultTheme.delays,
      type: "time",
    }
  );

  // Timing function utilities
  matchUtilities(
    {
      "animate-ease": (value: string) => ({
        "--jumi-timing-function": value,
        "animation-timing-function": value,
      }),
    },
    {
      values: theme("jumi.easings") ?? defaultTheme.easings,
    }
  );

  // Direction utilities
  const directionUtilities = {
    ".animate-reverse": {
      "--jumi-direction": "reverse",
      "animation-direction": "reverse",
    },
    ".animate-alternate": {
      "--jumi-direction": "alternate",
      "animation-direction": "alternate",
    },
    ".animate-alternate-reverse": {
      "--jumi-direction": "alternate-reverse",
      "animation-direction": "alternate-reverse",
    },
  };

  // Fill mode utilities
  const fillModeUtilities = {
    ".animate-fill-none": {
      "--jumi-fill-mode": "none",
      "animation-fill-mode": "none",
    },
    ".animate-fill-forwards": {
      "--jumi-fill-mode": "forwards",
      "animation-fill-mode": "forwards",
    },
    ".animate-fill-backwards": {
      "--jumi-fill-mode": "backwards",
      "animation-fill-mode": "backwards",
    },
    ".animate-fill-both": {
      "--jumi-fill-mode": "both",
      "animation-fill-mode": "both",
    },
  };

  // Play state utilities
  const playStateUtilities = {
    ".animate-play": {
      "--jumi-play-state": "running",
      "animation-play-state": "running",
    },
    ".animate-pause": {
      "--jumi-play-state": "paused",
      "animation-play-state": "paused",
    },
  };

  // Iteration count utilities
  const iterationUtilities = {
    ".animate-once": {
      "--jumi-iteration-count": "1",
      "animation-iteration-count": "1",
    },
    ".animate-twice": {
      "--jumi-iteration-count": "2",
      "animation-iteration-count": "2",
    },
    ".animate-thrice": {
      "--jumi-iteration-count": "3",
      "animation-iteration-count": "3",
    },
    ".animate-infinite": {
      "--jumi-iteration-count": "infinite",
      "animation-iteration-count": "infinite",
    },
  };

  // Custom iteration count
  matchUtilities(
    {
      "animate-repeat": (value: string) => ({
        "--jumi-iteration-count": value,
        "animation-iteration-count": value,
      }),
    },
    {
      values: {
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5": "5",
        "10": "10",
        infinite: "infinite",
      },
    }
  );

  // Add all static utilities
  const allUtilities = {
    ...directionUtilities,
    ...fillModeUtilities,
    ...playStateUtilities,
    ...iterationUtilities,
  };

  Object.entries(allUtilities).forEach(([selector, styles]) => {
    matchUtilities(
      { [selector.substring(1)]: () => styles },
      { values: { DEFAULT: "DEFAULT" } }
    );
  });
}
