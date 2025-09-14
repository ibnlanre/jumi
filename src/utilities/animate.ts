import { PluginAPI } from "../types";

/**
 * Composable animation system - Base animate class and infrastructure
 * Inspired by TailwindCSS transform pattern for combining multiple animations
 */

export function addAnimateUtilities({ addUtilities }: PluginAPI) {
  // Main animate class that enables composable animations
  addUtilities({
    ".animate": {
      "animation-name": "var(--jumi-animation)",
      "animation-duration": "var(--jumi-duration)",
      "animation-timing-function": "var(--jumi-timing-function)",
      "animation-delay": "var(--jumi-delay)",
      "animation-direction": "var(--jumi-direction)",
      "animation-iteration-count": "var(--jumi-iteration-count)",
      "animation-fill-mode": "var(--jumi-fill-mode)",
      "animation-play-state": "var(--jumi-play-state)",
    },
  });
}

/**
 * Helper function to create additive animation utilities
 * This will be used by transform, property, and effect utilities
 */
export function createAdditiveAnimation(
  animationName: string,
  customProperties: Record<string, string> = {},
  options: {
    duration?: string;
    timingFunction?: string;
    delay?: string;
    direction?: string;
    iterationCount?: string;
    fillMode?: string;
    playState?: string;
  } = {}
): Record<string, string> {
  const styles: Record<string, string> = {
    "--jumi-animation": animationName,
  };

  // Add optional per-animation timing properties
  if (options.duration) {
    styles["--jumi-duration"] = options.duration;
  }
  if (options.timingFunction) {
    styles["--jumi-timing-function"] = options.timingFunction;
  }
  if (options.delay) {
    styles["--jumi-delay"] = options.delay;
  }
  if (options.direction) {
    styles["--jumi-direction"] = options.direction;
  }
  if (options.iterationCount) {
    styles["--jumi-iteration-count"] = options.iterationCount;
  }
  if (options.fillMode) {
    styles["--jumi-fill-mode"] = options.fillMode;
  }
  if (options.playState) {
    styles["--jumi-play-state"] = options.playState;
  }

  // Add custom properties for this specific animation
  Object.assign(styles, customProperties);

  return styles;
}
