import { PluginAPI } from "../types";
import { defaultTheme } from "../config/defaults";
import { getAllKeyframes } from "../config/keyframes";

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
      "--jumi-direction": "alternate-reverse",
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
  matchUtilities(
    {
      "animation-name": (value: string) => ({
        "animation-name": value,
      }),
    },
    {
      values: {
        // All available effect keyframes
        ...(theme("jumi.effects") ?? getAllKeyframes()),
        // Common CSS animation names
        none: "none",
        // Allow custom arbitrary values
      },
      type: "any",
    }
  );

  matchUtilities(
    {
      "animation-duration": (value: string) => ({
        "animation-duration": value,
      }),
    },
    {
      values: {
        // All available durations
        ...(theme("jumi.durations") ?? defaultTheme.durations),
        // Common additional durations
        "0.5s": "0.5s",
        "1.5s": "1.5s",
        "2.5s": "2.5s",
        "4s": "4s",
        "5s": "5s",
      },
      type: "any",
    }
  );

  matchUtilities(
    {
      "animation-timing-function": (value: string) => ({
        "animation-timing-function": value,
      }),
    },
    {
      values: {
        // All available timing functions
        ...(theme("jumi.timingFunctions") ?? defaultTheme.timingFunctions),
        // Additional common easing functions
        linear: "linear",
        "ease-in": "ease-in",
        "ease-out": "ease-out",
        "ease-in-out": "ease-in-out",
      },
      type: "any",
    }
  );

  matchUtilities(
    {
      "animation-delay": (value: string) => ({
        "animation-delay": value,
      }),
    },
    {
      values: {
        // All available delays
        ...(theme("jumi.delays") ?? defaultTheme.delays),
      },
      type: "any",
    }
  );

  matchUtilities(
    {
      "animation-iteration-count": (value: string) => ({
        "animation-iteration-count": value,
      }),
    },
    {
      values: {
        // All available iteration counts
        ...(theme("jumi.iterationCounts") ?? defaultTheme.iterationCounts),
        // Additional common values
        "0": "0",
        "0.5": "0.5",
        "1.5": "1.5",
        "2.5": "2.5",
      },
      type: "number",
    }
  );

  matchUtilities(
    {
      "animation-direction": (value: string) => ({
        "animation-direction": value,
      }),
    },
    {
      values: {
        // All available directions
        ...(theme("jumi.directions") ?? defaultTheme.directions),
      },
      type: "any",
    }
  );

  matchUtilities(
    {
      "animation-fill-mode": (value: string) => ({
        "animation-fill-mode": value,
      }),
    },
    {
      values: {
        // All available fill modes
        ...(theme("jumi.fillModes") ?? defaultTheme.fillModes),
      },
      type: "any",
    }
  );

  matchUtilities(
    {
      "animation-play-state": (value: string) => ({
        "animation-play-state": value,
      }),
    },
    {
      values: {
        // All available play states
        ...(theme("jumi.playStates") ?? defaultTheme.playStates),
      },
      type: "any",
    }
  );

  // Animation shorthand utility for full animation definitions
  matchUtilities(
    {
      animation: (value: string) => ({
        animation: value,
      }),
    },
    {
      type: "any",
    }
  );
}
