import { PluginAPI } from "../types";
import { defaultTheme } from "../config/defaults";

/**
 * Animation timing utilities (duration, delay, timing-function)
 * Plus arbitrary value utilities for manual animation composition
 */
export function addAnimationUtilities({
  addBase,
  matchUtilities,
  theme,
}: PluginAPI) {
  addBase({
    ".animate": {
      "--jumi-animation": "none",
      "--jumi-duration": "1s",
      "--jumi-timing-function": "ease",
      "--jumi-delay": "0s",
      "--jumi-direction": "normal",
      "--jumi-iteration-count": "1",
      "--jumi-fill-mode": "forwards",
      "--jumi-play-state": "running",
    },
  });

  matchUtilities(
    {
      "animate-duration": (value: string) => ({
        "--jumi-duration": value,
      }),
    },
    {
      values: theme("jumi.durations") ?? defaultTheme.durations,
    }
  );

  matchUtilities(
    {
      "animate-delay": (value: string) => ({
        "--jumi-delay": value,
      }),
    },
    {
      values: theme("jumi.delays") ?? defaultTheme.delays,
    }
  );

  matchUtilities(
    {
      "animate-ease": (value: string) => ({
        "--jumi-timing-function": value,
      }),
    },
    {
      values: theme("jumi.easings") ?? defaultTheme.easings,
    }
  );

  const directionUtilities = {
    ".animate-reverse": {
      "--jumi-direction": "reverse",
    },
    ".animate-alternate": {
      "--jumi-direction": "alternate",
    },
    ".animate-alternate-reverse": {
      "--jumi-direction": "alternate-reverse",
    },
  };

  const fillModeUtilities = {
    ".animate-fill-none": {
      "--jumi-fill-mode": "none",
    },
    ".animate-fill-forwards": {
      "--jumi-fill-mode": "forwards",
    },
    ".animate-fill-backwards": {
      "--jumi-fill-mode": "backwards",
    },
    ".animate-fill-both": {
      "--jumi-fill-mode": "both",
    },
  };

  const playStateUtilities = {
    ".animate-play": {
      "--jumi-play-state": "running",
    },
    ".animate-pause": {
      "--jumi-play-state": "paused",
    },
  };

  const iterationUtilities = {
    ".animate-once": {
      "--jumi-iteration-count": "1",
    },
    ".animate-twice": {
      "--jumi-iteration-count": "2",
    },
    ".animate-thrice": {
      "--jumi-iteration-count": "3",
    },
    ".animate-infinite": {
      "--jumi-iteration-count": "infinite",
    },
  };

  matchUtilities(
    {
      "animate-repeat": (value: string) => ({
        "--jumi-iteration-count": value,
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

  matchUtilities({
    "animation-name": (value: string) => ({
      "animation-name": value,
    }),
  });

  matchUtilities({
    "animation-duration": (value: string) => ({
      "animation-duration": value,
    }),
  });

  matchUtilities({
    "animation-timing-function": (value: string) => ({
      "animation-timing-function": value,
    }),
  });

  matchUtilities({
    "animation-delay": (value: string) => ({
      "animation-delay": value,
    }),
  });

  matchUtilities({
    "animation-iteration-count": (value: string) => ({
      "animation-iteration-count": value,
    }),
  });

  matchUtilities({
    "animation-direction": (value: string) => ({
      "animation-direction": value,
    }),
  });

  matchUtilities({
    "animation-fill-mode": (value: string) => ({
      "animation-fill-mode": value,
    }),
  });

  matchUtilities({
    "animation-play-state": (value: string) => ({
      "animation-play-state": value,
    }),
  });

  matchUtilities({
    animation: (value: string) => ({
      animation: value,
    }),
  });
}
