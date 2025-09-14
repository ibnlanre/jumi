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
      "animate-timing": (value: string) => ({
        "--jumi-timing-function": value,
      }),
    },
    {
      values: theme("jumi.timingFunctions") ?? defaultTheme.timingFunctions,
    }
  );

  matchUtilities(
    {
      "animate-direction": (value: string) => ({
        "--jumi-direction": value,
      }),
    },
    {
      values: theme("jumi.directions") ?? defaultTheme.directions,
    }
  );

  matchUtilities(
    {
      "animate-fill": (value: string) => ({
        "--jumi-fill-mode": value,
      }),
    },
    {
      values: theme("jumi.fillModes") ?? defaultTheme.fillModes,
    }
  );

  matchUtilities(
    {
      "animate-play": (value: string) => ({
        "--jumi-play-state": value,
      }),
    },
    {
      values: theme("jumi.playStates") ?? defaultTheme.playStates,
    }
  );

  matchUtilities(
    {
      "animate-count": (value: string) => ({
        "--jumi-iteration-count": value,
      }),
    },
    {
      values: theme("jumi.iterationCounts") ?? defaultTheme.iterationCounts,
    }
  );

  // Arbitrary value utilities for direct CSS animation properties
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
