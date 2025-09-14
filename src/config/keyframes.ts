import { KeyframeDefinition } from "../types";

/**
 * Keyframe definitions for animation effects
 * Based on the existing Sass keyframes but optimized for TailwindCSS
 */
export const keyframes: Record<string, KeyframeDefinition> = {
  // Bounce effects
  "bounce-in": {
    "from, 20%, 40%, 60%, 80%, to": {
      animationTimingFunction: "cubic-bezier(0.215, 0.61, 0.355, 1)",
    },
    "0%": {
      transform: "scale3d(0.3, 0.3, 0.3)",
    },
    "20%": {
      transform: "scale3d(1.1, 1.1, 1.1)",
    },
    "40%": {
      transform: "scale3d(0.9, 0.9, 0.9)",
    },
    "60%": {
      transform: "scale3d(1.03, 1.03, 1.03)",
    },
    "80%": {
      transform: "scale3d(0.97, 0.97, 0.97)",
    },
    to: {
      transform: "scale3d(1, 1, 1)",
    },
  },

  "bounce-out": {
    "20%": {
      transform: "scale3d(0.9, 0.9, 0.9)",
    },
    "50%, 55%": {
      transform: "scale3d(1.1, 1.1, 1.1)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3)",
    },
  },

  // Fade effects
  "fade-in": {
    from: {
      opacity: "0",
    },
    to: {
      opacity: "1",
    },
  },

  "fade-out": {
    from: {
      opacity: "1",
    },
    to: {
      opacity: "0",
    },
  },

  "fade-up": {
    from: {
      opacity: "0",
      transform: "translate3d(0, 40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-down": {
    from: {
      opacity: "0",
      transform: "translate3d(0, -40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-left": {
    from: {
      opacity: "0",
      transform: "translate3d(-40px, 0, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-right": {
    from: {
      opacity: "0",
      transform: "translate3d(40px, 0, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-up-right": {
    from: {
      opacity: "0",
      transform: "translate3d(40px, 40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-up-left": {
    from: {
      opacity: "0",
      transform: "translate3d(-40px, 40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-down-right": {
    from: {
      opacity: "0",
      transform: "translate3d(40px, -40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-down-left": {
    from: {
      opacity: "0",
      transform: "translate3d(-40px, -40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  // Slide effects
  "slide-in-up": {
    from: {
      transform: "translate3d(0, 100%, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  "slide-in-down": {
    from: {
      transform: "translate3d(0, -100%, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  "slide-in-left": {
    from: {
      transform: "translate3d(-100%, 0, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  "slide-in-right": {
    from: {
      transform: "translate3d(100%, 0, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  // Zoom effects
  "zoom-in": {
    from: {
      transform: "scale3d(0.3, 0.3, 0.3)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05)",
    },
    to: {
      transform: "scale3d(1, 1, 1)",
    },
  },

  "zoom-in-up": {
    from: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(0, 100%, 0)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05) translate3d(0, -60%, 0)",
    },
    to: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
  },

  "zoom-in-down": {
    from: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(0, -100%, 0)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05) translate3d(0, 60%, 0)",
    },
    to: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
  },

  "zoom-in-left": {
    from: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(-100%, 0, 0)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05) translate3d(60%, 0, 0)",
    },
    to: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
  },

  "zoom-in-right": {
    from: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(100%, 0, 0)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05) translate3d(-60%, 0, 0)",
    },
    to: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
  },

  "zoom-out": {
    from: {
      transform: "scale3d(1, 1, 1)",
    },
    "50%": {
      transform: "scale3d(0.95, 0.95, 0.95)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3)",
    },
  },

  "zoom-out-up": {
    from: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
    "50%": {
      transform: "scale3d(0.95, 0.95, 0.95) translate3d(0, -60%, 0)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(0, -100%, 0)",
    },
  },

  "zoom-out-down": {
    from: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
    "50%": {
      transform: "scale3d(0.95, 0.95, 0.95) translate3d(0, 60%, 0)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(0, 100%, 0)",
    },
  },

  "zoom-out-left": {
    from: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
    "50%": {
      transform: "scale3d(0.95, 0.95, 0.95) translate3d(-60%, 0, 0)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(-100%, 0, 0)",
    },
  },

  "zoom-out-right": {
    from: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
    "50%": {
      transform: "scale3d(0.95, 0.95, 0.95) translate3d(60%, 0, 0)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(100%, 0, 0)",
    },
  },

  // Flip effects
  "flip-x": {
    from: {
      transform: "perspective(400px) rotateX(-90deg)",
      animationTimingFunction: "ease-in",
    },
    "40%": {
      transform: "perspective(400px) rotateX(-20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateX(10deg)",
    },
    "80%": {
      transform: "perspective(400px) rotateX(-5deg)",
    },
    to: {
      transform: "perspective(400px) rotateX(0deg)",
    },
  },

  "flip-y": {
    from: {
      transform: "perspective(400px) rotateY(-90deg)",
      animationTimingFunction: "ease-in",
    },
    "40%": {
      transform: "perspective(400px) rotateY(-20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateY(10deg)",
    },
    "80%": {
      transform: "perspective(400px) rotateY(-5deg)",
    },
    to: {
      transform: "perspective(400px) rotateY(0deg)",
    },
  },

  "flip-up": {
    from: {
      transform: "perspective(400px) rotateX(90deg)",
      animationTimingFunction: "ease-in",
      opacity: "0",
    },
    "40%": {
      transform: "perspective(400px) rotateX(-20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateX(10deg)",
      opacity: "1",
    },
    "80%": {
      transform: "perspective(400px) rotateX(-5deg)",
    },
    to: {
      transform: "perspective(400px)",
    },
  },

  "flip-down": {
    from: {
      transform: "perspective(400px) rotateX(-90deg)",
      animationTimingFunction: "ease-in",
      opacity: "0",
    },
    "40%": {
      transform: "perspective(400px) rotateX(20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateX(-10deg)",
      opacity: "1",
    },
    "80%": {
      transform: "perspective(400px) rotateX(5deg)",
    },
    to: {
      transform: "perspective(400px)",
    },
  },

  "flip-left": {
    from: {
      transform: "perspective(400px) rotateY(-90deg)",
      animationTimingFunction: "ease-in",
      opacity: "0",
    },
    "40%": {
      transform: "perspective(400px) rotateY(20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateY(-10deg)",
      opacity: "1",
    },
    "80%": {
      transform: "perspective(400px) rotateY(5deg)",
    },
    to: {
      transform: "perspective(400px)",
    },
  },

  "flip-right": {
    from: {
      transform: "perspective(400px) rotateY(90deg)",
      animationTimingFunction: "ease-in",
      opacity: "0",
    },
    "40%": {
      transform: "perspective(400px) rotateY(-20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateY(10deg)",
      opacity: "1",
    },
    "80%": {
      transform: "perspective(400px) rotateY(-5deg)",
    },
    to: {
      transform: "perspective(400px)",
    },
  },

  // Special effects
  shake: {
    "from, to": {
      transform: "translate3d(0, 0, 0)",
    },
    "10%, 30%, 50%, 70%, 90%": {
      transform: "translate3d(-10px, 0, 0)",
    },
    "20%, 40%, 60%, 80%": {
      transform: "translate3d(10px, 0, 0)",
    },
  },

  pulse: {
    from: {
      transform: "scale3d(1, 1, 1)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05)",
    },
    to: {
      transform: "scale3d(1, 1, 1)",
    },
  },

  swing: {
    "20%": {
      transform: "rotateZ(15deg)",
    },
    "40%": {
      transform: "rotateZ(-10deg)",
    },
    "60%": {
      transform: "rotateZ(5deg)",
    },
    "80%": {
      transform: "rotateZ(-5deg)",
    },
    to: {
      transform: "rotateZ(0deg)",
    },
  },

  wobble: {
    from: {
      transform: "translate3d(0, 0, 0)",
    },
    "15%": {
      transform: "translate3d(-25%, 0, 0) rotateZ(-5deg)",
    },
    "30%": {
      transform: "translate3d(20%, 0, 0) rotateZ(3deg)",
    },
    "45%": {
      transform: "translate3d(-15%, 0, 0) rotateZ(-3deg)",
    },
    "60%": {
      transform: "translate3d(10%, 0, 0) rotateZ(2deg)",
    },
    "75%": {
      transform: "translate3d(-5%, 0, 0) rotateZ(-1deg)",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  // Back effects (similar to existing jumi back-in/back-out)
  "back-in": {
    "0%": {
      transform: "scale(0) rotateZ(-360deg)",
    },
    "100%": {
      transform: "scale(1) rotateZ(0deg)",
    },
  },

  "back-out": {
    "0%": {
      transform: "scale(1) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) rotateZ(360deg)",
    },
  },
};

/**
 * Helper function to get all keyframe names
 */
export function getAllKeyframes() {
  return Object.fromEntries(Object.keys(keyframes).map((key) => [key, key]));
}

/**
 * Helper function to get keyframes as CSS-in-JS format
 */
export function getKeyframesAsCSS(): Record<string, Record<string, any>> {
  return Object.fromEntries(
    Object.entries(keyframes).map(([name, keyframes]) => [
      `@keyframes ${name}`,
      keyframes,
    ])
  );
}
