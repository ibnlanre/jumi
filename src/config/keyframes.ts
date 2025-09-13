import { KeyframeDefinition } from "../types";

/**
 * Keyframe definitions for animation effects
 * Based on the existing Sass keyframes but optimized for TailwindCSS
 */

export const keyframes: Record<string, KeyframeDefinition> = {
  // Bounce effects
  "bounce-in": {
    name: "bounce-in",
    keyframes: {
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
  },

  "bounce-out": {
    name: "bounce-out",
    keyframes: {
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
  },

  // Fade effects
  "fade-in": {
    name: "fade-in",
    keyframes: {
      from: {
        opacity: "0",
      },
      to: {
        opacity: "1",
      },
    },
  },

  "fade-out": {
    name: "fade-out",
    keyframes: {
      from: {
        opacity: "1",
      },
      to: {
        opacity: "0",
      },
    },
  },

  // Slide effects
  "slide-in-up": {
    name: "slide-in-up",
    keyframes: {
      from: {
        transform: "translate3d(0, 100%, 0)",
        visibility: "visible",
      },
      to: {
        transform: "translate3d(0, 0, 0)",
      },
    },
  },

  "slide-in-down": {
    name: "slide-in-down",
    keyframes: {
      from: {
        transform: "translate3d(0, -100%, 0)",
        visibility: "visible",
      },
      to: {
        transform: "translate3d(0, 0, 0)",
      },
    },
  },

  "slide-in-left": {
    name: "slide-in-left",
    keyframes: {
      from: {
        transform: "translate3d(-100%, 0, 0)",
        visibility: "visible",
      },
      to: {
        transform: "translate3d(0, 0, 0)",
      },
    },
  },

  "slide-in-right": {
    name: "slide-in-right",
    keyframes: {
      from: {
        transform: "translate3d(100%, 0, 0)",
        visibility: "visible",
      },
      to: {
        transform: "translate3d(0, 0, 0)",
      },
    },
  },

  // Zoom effects
  "zoom-in": {
    name: "zoom-in",
    keyframes: {
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
  },

  "zoom-out": {
    name: "zoom-out",
    keyframes: {
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
  },

  // Flip effects
  "flip-x": {
    name: "flip-x",
    keyframes: {
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
  },

  "flip-y": {
    name: "flip-y",
    keyframes: {
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
  },

  // Special effects
  shake: {
    name: "shake",
    keyframes: {
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
  },

  pulse: {
    name: "pulse",
    keyframes: {
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
  },

  swing: {
    name: "swing",
    keyframes: {
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
  },

  wobble: {
    name: "wobble",
    keyframes: {
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
  },

  // Back effects (similar to existing jumi back-in/back-out)
  "back-in": {
    name: "back-in",
    keyframes: {
      "0%": {
        transform: "scale(0) rotateZ(-360deg)",
      },
      "100%": {
        transform: "scale(1) rotateZ(0deg)",
      },
    },
  },

  "back-out": {
    name: "back-out",
    keyframes: {
      "0%": {
        transform: "scale(1) rotateZ(0deg)",
      },
      "100%": {
        transform: "scale(0) rotateZ(360deg)",
      },
    },
  },
};

/**
 * Helper function to get all keyframe names
 */
export function getKeyframeNames(): string[] {
  return Object.keys(keyframes);
}

/**
 * Helper function to get keyframes as CSS-in-JS format
 */
export function getKeyframesAsCSS(): Record<string, Record<string, any>> {
  return Object.fromEntries(
    Object.entries(keyframes).map(([name, def]) => [
      `@keyframes ${def.name}`,
      def.keyframes,
    ])
  );
}
