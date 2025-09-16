import { defaultTheme } from "../config/defaults";
import { createAdditiveAnimation } from "./animate";
import { mergeTheme } from "../utils/merge-theme";
import type { Direction, DirectionConfig } from "@/types";
import type { PluginAPI } from "tailwindcss/types/config";

/**
 * Transform utilities with intelligent defaults
 * - animate-scale-{value} implies uniform scaling
 * - animate-rotate-{value} implies z-axis clockwise
 * - animate-translate-{direction}-{value} requires explicit direction
 */

// Direction mappings for transforms
const directionMappings: Record<Direction, DirectionConfig> = {
  // Axis-based (explicit)
  x: { x: 1, y: 0, z: 0, axis: "x" },
  y: { x: 0, y: 1, z: 0, axis: "y" },
  z: { x: 0, y: 0, z: 1, axis: "z" },

  // Semantic directions (physical)
  top: { x: 0, y: -1, z: 0, axis: "y" },
  right: { x: 1, y: 0, z: 0, axis: "x" },
  bottom: { x: 0, y: 1, z: 0, axis: "y" },
  left: { x: -1, y: 0, z: 0, axis: "x" },

  // Logical directions (i18n-friendly)
  start: { x: -1, y: 0, z: 0, axis: "x" }, // Maps to left in LTR, right in RTL
  end: { x: 1, y: 0, z: 0, axis: "x" }, // Maps to right in LTR, left in RTL

  // Diagonal directions (physical)
  "top-left": { x: -1, y: -1, z: 0, axis: "d" },
  "top-right": { x: 1, y: -1, z: 0, axis: "d" },
  "bottom-left": { x: -1, y: 1, z: 0, axis: "d" },
  "bottom-right": { x: 1, y: 1, z: 0, axis: "d" },

  // Diagonal directions (logical)
  "top-start": { x: -1, y: -1, z: 0, axis: "d" },
  "top-end": { x: 1, y: -1, z: 0, axis: "d" },
  "bottom-start": { x: -1, y: 1, z: 0, axis: "d" },
  "bottom-end": { x: 1, y: 1, z: 0, axis: "d" },
  "start-start": { x: -1, y: -1, z: 0, axis: "d" }, // Alternative naming
  "start-end": { x: -1, y: 1, z: 0, axis: "d" },
  "end-start": { x: 1, y: -1, z: 0, axis: "d" },
  "end-end": { x: 1, y: 1, z: 0, axis: "d" },
};

export function addTransformUtilities({ matchUtilities, theme }: PluginAPI) {
  // === SCALE UTILITIES ===

  // Uniform scale (default behavior) - Additive approach
  matchUtilities(
    {
      "animate-scale": (value: string) =>
        createAdditiveAnimation("jumi-scale-uniform", {
          "--jumi-scale": value,
        }),
    },
    {
      values: mergeTheme(defaultTheme.scales, theme("jumi.scales")),
      supportsNegativeValues: true,
      type: "number",
    }
  );

  // Axis-specific scale - Additive approach
  ["x", "y", "z"].forEach((axis) => {
    matchUtilities(
      {
        [`animate-scale-${axis}`]: (value: string) =>
          createAdditiveAnimation(`jumi-scale-${axis}`, {
            [`--jumi-scale-${axis}`]: value,
          }),
      },
      {
        values: mergeTheme(defaultTheme.scales, theme("jumi.scales")),
        supportsNegativeValues: true,
        type: "number",
      }
    );
  });

  // === ROTATION UTILITIES ===

  // Default rotation (z-axis clockwise) - Additive approach
  matchUtilities(
    {
      "animate-rotate": (value: string) =>
        createAdditiveAnimation("jumi-rotate-z", { "--jumi-rotate-z": value }),
    },
    {
      values: mergeTheme(defaultTheme.rotations, theme("jumi.rotations")),
      supportsNegativeValues: true,
      type: "any",
    }
  );

  // Counter-clockwise rotation - Additive approach
  matchUtilities(
    {
      "animate-rotate-ccw": (value: string) =>
        createAdditiveAnimation("jumi-rotate-z", {
          "--jumi-rotate-z": `calc(-1 * ${value})`,
        }),
    },
    {
      values: mergeTheme(defaultTheme.rotations, theme("jumi.rotations")),
      supportsNegativeValues: true,
      type: "any",
    }
  );

  // Axis-specific rotation - Additive approach
  ["x", "y", "z"].forEach((axis) => {
    matchUtilities(
      {
        [`animate-rotate-${axis}`]: (value: string) =>
          createAdditiveAnimation(`jumi-rotate-${axis}`, {
            [`--jumi-rotate-${axis}`]: value,
          }),
      },
      {
        values: mergeTheme(defaultTheme.rotations, theme("jumi.rotations")),
        type: "any",
      }
    );
  });

  // === SKEW UTILITIES (Legacy, Non-Additive) ===

  ["x", "y"].forEach((axis) => {
    matchUtilities(
      {
        [`animate-skew-${axis}`]: (value: string) => ({
          "animation-name": `jumi-skew-${axis}`,
          [`--jumi-skew-${axis}`]: value,
        }),
      },
      {
        values: mergeTheme(defaultTheme.rotations, theme("jumi.rotations")),
        supportsNegativeValues: true,
        type: "any",
      }
    );
  });

  // === TRANSLATE UTILITIES (Explicit Direction Required) ===

  Object.entries(directionMappings).forEach(([direction, config]) => {
    const { x, y, z } = config;

    matchUtilities(
      {
        [`animate-translate-${direction}`]: (value: string) => {
          const styles: Record<string, string> = {
            "animation-name": `jumi-translate-${direction}`,
          };

          // Set the target translate values
          if (x !== 0) styles["--jumi-translate-x"] = `calc(${value} * ${x})`;
          if (y !== 0) styles["--jumi-translate-y"] = `calc(${value} * ${y})`;
          if (z !== 0) styles["--jumi-translate-z"] = `calc(${value} * ${z})`;

          return styles;
        },
      },
      {
        values: mergeTheme(defaultTheme.distances, theme("jumi.distances")),
        supportsNegativeValues: true,
        type: "length",
      }
    );
  });

  // === PERSPECTIVE UTILITIES ===

  matchUtilities(
    {
      "animate-perspective": (value: string) => ({
        "animation-name": "jumi-perspective",
        "--jumi-perspective": value,
      }),
    },
    {
      values: mergeTheme(defaultTheme.perspectives, theme("jumi.perspectives")),
      type: "length",
    }
  );

  // Transform origin utilities
  matchUtilities(
    {
      "animate-origin": (value: string) => ({
        "animation-name": "jumi-origin",
        "--jumi-transform-origin": value,
      }),
    },
    {
      values: mergeTheme(defaultTheme.origins, theme("jumi.origins")),
      type: "lookup",
    }
  );
}

// Generate transform keyframes for the new system
export function generateTransformKeyframes(): Record<string, any> {
  const keyframes: Record<string, any> = {};

  // Scale keyframes
  keyframes["@keyframes jumi-scale-uniform"] = {
    to: {
      transform: "scale(var(--jumi-scale, 1))",
    },
  };

  ["x", "y", "z"].forEach((axis) => {
    const scaleFunc =
      axis === "z" ? "scaleZ" : axis === "y" ? "scaleY" : "scaleX";

    keyframes[`@keyframes jumi-scale-${axis}`] = {
      to: {
        transform: `${scaleFunc}(var(--jumi-scale-${axis}, 1))`,
      },
    };
  });

  // Rotation keyframes
  ["x", "y", "z"].forEach((axis) => {
    const rotateFunc =
      axis === "z" ? "rotateZ" : axis === "y" ? "rotateY" : "rotateX";
    keyframes[`@keyframes jumi-rotate-${axis}`] = {
      to: {
        transform: `${rotateFunc}(var(--jumi-rotate-${axis}, 0deg))`,
      },
    };
  });

  // Translation keyframes
  Object.keys(directionMappings).forEach((direction) => {
    keyframes[`@keyframes jumi-translate-${direction}`] = {
      to: {
        transform:
          "translate3d(var(--jumi-translate-x, 0), var(--jumi-translate-y, 0), var(--jumi-translate-z, 0))",
      },
    };
  });

  // Perspective keyframes
  keyframes["@keyframes jumi-perspective"] = {
    to: {
      perspective: "var(--jumi-perspective, none)",
    },
  };

  // Transform origin keyframes
  keyframes["@keyframes jumi-origin"] = {
    to: {
      "transform-origin": "var(--jumi-transform-origin, center)",
    },
  };

  return keyframes;
}
