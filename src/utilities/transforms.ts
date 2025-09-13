import { PluginAPI, Direction, DirectionConfig } from "../types";
import { defaultTheme } from "../config/defaults";

/**
 * Transform utilities (translate, rotate, scale, perspective)
 */

// Direction mappings for transforms
const directionMappings: Record<Direction, DirectionConfig> = {
  x: { x: 1, y: 0, z: 0, axis: "x" }, // right
  y: { x: 0, y: 1, z: 0, axis: "y" }, // down
  z: { x: 0, y: 0, z: 1, axis: "z" }, // forward
  t: { x: 0, y: -1, z: 0, axis: "y" }, // top
  r: { x: 1, y: 0, z: 0, axis: "x" }, // right
  b: { x: 0, y: 1, z: 0, axis: "y" }, // bottom
  l: { x: -1, y: 0, z: 0, axis: "x" }, // left
  tl: { x: -1, y: -1, z: 0, axis: "d" }, // top-left
  tr: { x: 1, y: -1, z: 0, axis: "d" }, // top-right
  bl: { x: -1, y: 1, z: 0, axis: "d" }, // bottom-left
  br: { x: 1, y: 1, z: 0, axis: "d" }, // bottom-right
  c: { x: 0, y: 0, z: 0, axis: "x" }, // center (for rotation)
};

export function addTransformUtilities({
  addBase,
  matchUtilities,
  theme,
}: PluginAPI) {
  // Add CSS custom properties base for transforms
  addBase({
    ":root, .animate-reset": {
      "--jumi-translate-x": "0",
      "--jumi-translate-y": "0",
      "--jumi-translate-z": "0",
      "--jumi-rotate-x": "0deg",
      "--jumi-rotate-y": "0deg",
      "--jumi-rotate-z": "0deg",
      "--jumi-scale-x": "1",
      "--jumi-scale-y": "1",
      "--jumi-scale-z": "1",
      "--jumi-perspective": "none",
      "--jumi-transform-origin": "center",
      "--jumi-perspective-origin": "center",
      "--jumi-transform-style": "flat",
    },
  });

  // Translate utilities
  Object.entries(directionMappings).forEach(([direction, config]) => {
    if (direction === "c") return; // Skip center for translate

    const { x, y, z, axis } = config;

    matchUtilities(
      {
        [`animate-translate-${direction}`]: (value: string) => {
          const styles: Record<string, string> = {
            "animation-name": `jumi-translate-${direction}`,
            "animation-duration": "var(--jumi-duration)",
            "animation-timing-function": "var(--jumi-timing-function)",
            "animation-delay": "var(--jumi-delay)",
            "animation-direction": "var(--jumi-direction)",
            "animation-iteration-count": "var(--jumi-iteration-count)",
            "animation-fill-mode": "var(--jumi-fill-mode)",
            "animation-play-state": "var(--jumi-play-state)",
          };

          // Set CSS variables for the transform
          if (x !== 0) styles["--jumi-translate-x"] = `calc(${value} * ${x})`;
          if (y !== 0) styles["--jumi-translate-y"] = `calc(${value} * ${y})`;
          if (z !== 0) styles["--jumi-translate-z"] = `calc(${value} * ${z})`;

          return styles;
        },
      },
      {
        values: theme("jumi.distances") ?? defaultTheme.distances,
        type: "length",
      }
    );

    // Base (immediate) translate utilities
    matchUtilities(
      {
        [`animate-translate-${direction}-base`]: (value: string) => {
          const styles: Record<string, string> = {};

          if (x !== 0) styles["--jumi-translate-x"] = `calc(${value} * ${x})`;
          if (y !== 0) styles["--jumi-translate-y"] = `calc(${value} * ${y})`;
          if (z !== 0) styles["--jumi-translate-z"] = `calc(${value} * ${z})`;

          styles["transform"] =
            "translate3d(var(--jumi-translate-x), var(--jumi-translate-y), var(--jumi-translate-z))";

          return styles;
        },
      },
      {
        values: theme("jumi.distances") ?? defaultTheme.distances,
        type: "length",
      }
    );
  });

  // Rotate utilities
  Object.entries(directionMappings).forEach(([direction, config]) => {
    const { x, y, z } = config;

    matchUtilities(
      {
        [`animate-rotate-${direction}`]: (value: string) => {
          const styles: Record<string, string> = {
            "animation-name": `jumi-rotate-${direction}`,
            "animation-duration": "var(--jumi-duration)",
            "animation-timing-function": "var(--jumi-timing-function)",
            "animation-delay": "var(--jumi-delay)",
            "animation-direction": "var(--jumi-direction)",
            "animation-iteration-count": "var(--jumi-iteration-count)",
            "animation-fill-mode": "var(--jumi-fill-mode)",
            "animation-play-state": "var(--jumi-play-state)",
          };

          // For rotation, we typically use z-axis for 2D rotation (center)
          if (direction === "c" || (x === 0 && y === 0)) {
            styles["--jumi-rotate-z"] = value;
          } else if (x !== 0) {
            styles["--jumi-rotate-x"] = value;
          } else if (y !== 0) {
            styles["--jumi-rotate-y"] = value;
          }

          return styles;
        },
      },
      {
        values: theme("jumi.rotations") ?? defaultTheme.rotations,
        type: "angle",
      }
    );
  });

  // Scale utilities
  const scaleDirections = ["x", "y", "z", "uniform"];
  scaleDirections.forEach((direction) => {
    matchUtilities(
      {
        [`animate-scale-${direction}`]: (value: string) => {
          const styles: Record<string, string> = {
            "animation-name": `jumi-scale-${direction}`,
            "animation-duration": "var(--jumi-duration)",
            "animation-timing-function": "var(--jumi-timing-function)",
            "animation-delay": "var(--jumi-delay)",
            "animation-direction": "var(--jumi-direction)",
            "animation-iteration-count": "var(--jumi-iteration-count)",
            "animation-fill-mode": "var(--jumi-fill-mode)",
            "animation-play-state": "var(--jumi-play-state)",
          };

          if (direction === "uniform") {
            styles["--jumi-scale-x"] = value;
            styles["--jumi-scale-y"] = value;
            styles["--jumi-scale-z"] = value;
          } else {
            styles[`--jumi-scale-${direction}`] = value;
          }

          return styles;
        },
      },
      {
        values: theme("jumi.scales") ?? defaultTheme.scales,
      }
    );
  });

  // Perspective utilities
  matchUtilities(
    {
      "animate-perspective": (value: string) => ({
        "--jumi-perspective": value,
        perspective: value,
      }),
    },
    {
      values: theme("jumi.perspectives") ?? defaultTheme.perspectives,
      type: "length",
    }
  );

  // Transform origin utilities
  const origins = {
    center: "center",
    top: "top",
    "top-right": "top right",
    right: "right",
    "bottom-right": "bottom right",
    bottom: "bottom",
    "bottom-left": "bottom left",
    left: "left",
    "top-left": "top left",
  };

  matchUtilities(
    {
      "animate-origin": (value: string) => ({
        "--jumi-transform-origin": value,
        "transform-origin": value,
      }),
    },
    {
      values: origins,
    }
  );

  // Perspective origin utilities
  matchUtilities(
    {
      "animate-perspective-origin": (value: string) => ({
        "--jumi-perspective-origin": value,
        "perspective-origin": value,
      }),
    },
    {
      values: origins,
    }
  );

  // Transform style utilities
  const transformStyleUtilities = {
    ".animate-flat": {
      "--jumi-transform-style": "flat",
      "transform-style": "flat",
    },
    ".animate-preserve-3d": {
      "--jumi-transform-style": "preserve-3d",
      "transform-style": "preserve-3d",
    },
  };

  Object.entries(transformStyleUtilities).forEach(([selector, styles]) => {
    matchUtilities(
      { [selector.substring(1)]: () => styles },
      { values: { DEFAULT: "DEFAULT" } }
    );
  });
}

/**
 * Generate keyframes for transform animations
 */
export function generateTransformKeyframes() {
  const keyframes: Record<string, Record<string, any>> = {};

  // Generate translate keyframes
  Object.entries(directionMappings).forEach(([direction]) => {
    if (direction === "c") return;

    keyframes[`@keyframes jumi-translate-${direction}`] = {
      to: {
        transform:
          "translate3d(var(--jumi-translate-x), var(--jumi-translate-y), var(--jumi-translate-z))",
      },
    };
  });

  // Generate rotate keyframes
  Object.entries(directionMappings).forEach(([direction]) => {
    keyframes[`@keyframes jumi-rotate-${direction}`] = {
      to: {
        transform:
          "rotateX(var(--jumi-rotate-x)) rotateY(var(--jumi-rotate-y)) rotateZ(var(--jumi-rotate-z))",
      },
    };
  });

  // Generate scale keyframes
  const scaleDirections = ["x", "y", "z", "uniform"];
  scaleDirections.forEach((direction) => {
    keyframes[`@keyframes jumi-scale-${direction}`] = {
      to: {
        transform:
          "scale3d(var(--jumi-scale-x), var(--jumi-scale-y), var(--jumi-scale-z))",
      },
    };
  });

  return keyframes;
}
