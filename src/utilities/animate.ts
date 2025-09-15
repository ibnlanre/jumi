import type { PluginAPI } from "tailwindcss/types/config";

export function addAnimateUtilities({ addUtilities }: PluginAPI) {
  addUtilities({
    ".animate": {
      "animation-name": "var(--jumi-animation-name)",
      "animation-duration": "var(--jumi-animation-duration)",
      "animation-timing-function": "var(--jumi-animation-timing-function)",
      "animation-delay": "var(--jumi-animation-delay)",
      "animation-direction": "var(--jumi-animation-direction)",
      "animation-iteration-count": "var(--jumi-animation-iteration-count)",
      "animation-fill-mode": "var(--jumi-animation-fill-mode)",
      "animation-play-state": "var(--jumi-animation-play-state)",
      "animation-composition": "var(--jumi-animation-composition)",
      transform: "var(--jumi-transform)",
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
    "--jumi-animation-name": animationName,
  };

  // Add optional per-animation timing properties
  if (options.duration) {
    styles["--jumi-animation-duration"] = options.duration;
  }
  if (options.timingFunction) {
    styles["--jumi-animation-timing-function"] = options.timingFunction;
  }
  if (options.delay) {
    styles["--jumi-animation-delay"] = options.delay;
  }
  if (options.direction) {
    styles["--jumi-animation-direction"] = options.direction;
  }
  if (options.iterationCount) {
    styles["--jumi-animation-iteration-count"] = options.iterationCount;
  }
  if (options.fillMode) {
    styles["--jumi-animation-fill-mode"] = options.fillMode;
  }
  if (options.playState) {
    styles["--jumi-animation-play-state"] = options.playState;
  }

  // Add custom properties for this specific animation
  Object.assign(styles, customProperties);

  return styles;
}
