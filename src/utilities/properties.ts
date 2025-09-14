import { PluginAPI } from "../types";
import { defaultTheme } from "../config/defaults";

/**
 * Property-based animation utilities with current state → target state paradigm
 * - animate-w-96 means animate from current width to w-96
 * - animate-h-80 means animate from current height to h-80
 */

export function addPropertyUtilities({
  addBase,
  matchUtilities,
  theme,
}: PluginAPI) {
  // Width animation utilities
  matchUtilities(
    {
      "animate-w": (value: string) => ({
        "animation-name": "jumi-width",
        "--jumi-width": value,
      }),
    },
    {
      values: {
        ...(theme("width") ?? {}),
        ...(theme("jumi.sizes") ?? defaultTheme.sizes),
      },
      type: "length",
    }
  );

  // Height animation utilities
  matchUtilities(
    {
      "animate-h": (value: string) => ({
        "animation-name": "jumi-height",
        "--jumi-height": value,
      }),
    },
    {
      values: {
        ...(theme("height") ?? {}),
        ...(theme("jumi.sizes") ?? defaultTheme.sizes),
      },
      type: "length",
    }
  );

  // Border radius animation utilities
  matchUtilities(
    {
      "animate-rounded": (value: string) => ({
        "animation-name": "jumi-border-radius",
        "--jumi-border-radius": value,
      }),
    },
    {
      values: {
        ...(theme("borderRadius") ?? {}),
        ...(theme("jumi.borderRadius") ?? defaultTheme.borderRadius),
      },
      type: "length",
    }
  );

  // Border width animation utilities
  matchUtilities(
    {
      "animate-border": (value: string) => ({
        "animation-name": "jumi-border-width",
        "--jumi-border-width": value,
      }),
    },
    {
      values: {
        ...(theme("borderWidth") ?? {}),
        ...(theme("jumi.borderWidths") ?? defaultTheme.borderWidths),
      },
      type: "line-width",
    }
  );

  // Border reveal animation utilities - directional border drawing effects
  matchUtilities(
    {
      "animate-border-reveal-top": (value: string) => ({
        position: "relative",
        "&::before": {
          content: "''",
          position: "absolute",
          top: "0",
          left: "0",
          width: "0%",
          height: value,
          backgroundColor: "var(--jumi-border-color, currentColor)",
          animationName: "jumi-border-reveal-top",
        },
      }),
    },
    {
      values: {
        ...(theme("borderWidth") ?? {}),
        ...(theme("jumi.borderWidths") ?? defaultTheme.borderWidths),
      },
      type: "line-width",
    }
  );

  matchUtilities(
    {
      "animate-border-reveal-right": (value: string) => ({
        position: "relative",
        "&::before": {
          content: "''",
          position: "absolute",
          top: "0",
          right: "0",
          width: value,
          height: "0%",
          backgroundColor: "var(--jumi-border-color, currentColor)",
          animationName: "jumi-border-reveal-right",
        },
      }),
    },
    {
      values: {
        ...(theme("borderWidth") ?? {}),
        ...(theme("jumi.borderWidths") ?? defaultTheme.borderWidths),
      },
      type: "line-width",
    }
  );

  matchUtilities(
    {
      "animate-border-reveal-bottom": (value: string) => ({
        position: "relative",
        "&::before": {
          content: "''",
          position: "absolute",
          bottom: "0",
          right: "0",
          width: "0%",
          height: value,
          backgroundColor: "var(--jumi-border-color, currentColor)",
          animationName: "jumi-border-reveal-bottom",
        },
      }),
    },
    {
      values: {
        ...(theme("borderWidth") ?? {}),
        ...(theme("jumi.borderWidths") ?? defaultTheme.borderWidths),
      },
      type: "line-width",
    }
  );

  matchUtilities(
    {
      "animate-border-reveal-left": (value: string) => ({
        position: "relative",
        "&::before": {
          content: "''",
          position: "absolute",
          bottom: "0",
          left: "0",
          width: value,
          height: "0%",
          backgroundColor: "var(--jumi-border-color, currentColor)",
          animationName: "jumi-border-reveal-left",
        },
      }),
    },
    {
      values: {
        ...(theme("borderWidth") ?? {}),
        ...(theme("jumi.borderWidths") ?? defaultTheme.borderWidths),
      },
      type: "line-width",
    }
  );

  // Shadow animation utilities
  matchUtilities(
    {
      "animate-shadow": (value: string) => ({
        "animation-name": "jumi-shadow",
        "--jumi-shadow": value,
      }),
    },
    {
      values: {
        ...(theme("boxShadow") ?? {}),
        ...(theme("jumi.shadows") ?? defaultTheme.shadows),
      },
      type: "shadow",
    }
  );

  // === EXPANDED PROPERTY COVERAGE ===

  // Opacity animation utilities
  matchUtilities(
    {
      "animate-opacity": (value: string) => ({
        "animation-name": "jumi-opacity",
        "--jumi-opacity": value,
      }),
    },
    {
      values: {
        ...(theme("opacity") ?? {}),
        ...(theme("jumi.opacity") ?? defaultTheme.opacity),
      },
      type: "number",
    }
  );

  // Font size animation utilities
  matchUtilities(
    {
      "animate-text": (value: string) => ({
        "animation-name": "jumi-font-size",
        "--jumi-font-size": value,
      }),
    },
    {
      values: {
        ...(theme("fontSize") ?? {}),
        ...(theme("jumi.fontSizes") ?? defaultTheme.fontSizes),
      },
      type: "length",
    }
  );

  // Line height animation utilities
  matchUtilities(
    {
      "animate-leading": (value: string) => ({
        "animation-name": "jumi-line-height",
        "--jumi-line-height": value,
      }),
    },
    {
      values: {
        ...(theme("lineHeight") ?? {}),
        ...(theme("jumi.lineHeights") ?? defaultTheme.lineHeights),
      },
      type: "length",
    }
  );

  // Spacing animation utilities (margin/padding) - individual directions
  const spacingValues = theme("spacing") ?? {
    "0": "0px",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
    "32": "8rem",
  };

  // Margin utilities
  ["m", "mt", "mr", "mb", "ml", "mx", "my"].forEach((variant) => {
    const propertyName =
      {
        m: "margin",
        mt: "margin-top",
        mr: "margin-right",
        mb: "margin-bottom",
        ml: "margin-left",
        mx: "margin-x",
        my: "margin-y",
      }[variant] || "margin";

    matchUtilities(
      {
        [`animate-${variant}`]: (value: string) => ({
          "animation-name": `jumi-${propertyName}`,
          [`--jumi-${propertyName}`]: value,
        }),
      },
      {
        values: spacingValues,
        type: "length",
      }
    );
  });

  // Padding utilities
  ["p", "pt", "pr", "pb", "pl", "px", "py"].forEach((variant) => {
    const propertyName =
      {
        p: "padding",
        pt: "padding-top",
        pr: "padding-right",
        pb: "padding-bottom",
        pl: "padding-left",
        px: "padding-x",
        py: "padding-y",
      }[variant] || "padding";

    matchUtilities(
      {
        [`animate-${variant}`]: (value: string) => ({
          "animation-name": `jumi-${propertyName}`,
          [`--jumi-${propertyName}`]: value,
        }),
      },
      {
        values: spacingValues,
        type: "length",
      }
    );
  });

  // === ADVANCED VISUAL EFFECTS ===

  // Filter animation utilities
  matchUtilities(
    {
      "animate-filter": (value: string) => ({
        "animation-name": "jumi-filter",
        "--jumi-filter": value,
      }),
    },
    {
      values: {
        ...(theme("filter") ?? {}),
        ...(theme("jumi.filters") ?? defaultTheme.filters),
      },
      type: "any",
    }
  );

  // Backdrop filter animation utilities
  matchUtilities(
    {
      "animate-backdrop": (value: string) => ({
        "animation-name": "jumi-backdrop-filter",
        "--jumi-backdrop-filter": value,
      }),
    },
    {
      values: {
        ...(theme("backdropFilter") ?? {}),
        ...(theme("jumi.backdrops") ?? defaultTheme.backdrops),
      },
      type: "any",
    }
  );

  // Color animation utilities (text, background, border colors)
  const colorValues = theme("colors") ?? {
    transparent: "transparent",
    current: "currentColor",
    black: "#000000",
    white: "#ffffff",
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
    red: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    blue: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    green: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },
  };

  // Flatten nested color objects for utility generation
  const flattenColors = (colors: any, prefix = ""): Record<string, string> => {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(colors)) {
      const newKey = prefix ? `${prefix}-${key}` : key;

      if (typeof value === "string") {
        result[newKey] = value;
      } else if (typeof value === "object" && value !== null) {
        Object.assign(result, flattenColors(value, newKey));
      }
    }

    return result;
  };

  const flatColorValues = flattenColors(colorValues);

  // Text color animation
  matchUtilities(
    {
      "animate-text-color": (value: string) => ({
        "animation-name": "jumi-text-color",
        "--jumi-text-color": value,
      }),
    },
    {
      values: flatColorValues,
      type: "color",
    }
  );

  // Background color animation
  matchUtilities(
    {
      "animate-bg": (value: string) => ({
        "animation-name": "jumi-bg-color",
        "--jumi-bg-color": value,
      }),
    },
    {
      values: flatColorValues,
      type: "color",
    }
  );

  // Border color animation
  matchUtilities(
    {
      "animate-border-color": (value: string) => ({
        "animation-name": "jumi-border-color",
        "--jumi-border-color": value,
      }),
    },
    {
      values: flatColorValues,
      type: "color",
    }
  );

  // Generate all the keyframes for property animations
  addBase(generatePropertyKeyframes());
}

// Generate keyframes for all property animations
function generatePropertyKeyframes() {
  return {
    // Basic properties
    "@keyframes jumi-width": {
      to: { width: "var(--jumi-width)" },
    },
    "@keyframes jumi-height": {
      to: { height: "var(--jumi-height)" },
    },
    "@keyframes jumi-border-radius": {
      to: { "border-radius": "var(--jumi-border-radius)" },
    },
    "@keyframes jumi-border-width": {
      to: { "border-width": "var(--jumi-border-width)" },
    },

    // Border reveal keyframes - animated border drawing effects
    "@keyframes jumi-border-reveal-top": {
      "0%": { width: "0%" },
      "100%": { width: "100%" },
    },
    "@keyframes jumi-border-reveal-right": {
      "0%": { height: "0%" },
      "100%": { height: "100%" },
    },
    "@keyframes jumi-border-reveal-bottom": {
      "0%": { width: "0%" },
      "100%": { width: "100%" },
    },
    "@keyframes jumi-border-reveal-left": {
      "0%": { height: "0%" },
      "100%": { height: "100%" },
    },
    "@keyframes jumi-shadow": {
      to: { "box-shadow": "var(--jumi-shadow)" },
    },
    "@keyframes jumi-opacity": {
      to: { opacity: "var(--jumi-opacity)" },
    },

    // Typography
    "@keyframes jumi-font-size": {
      to: { "font-size": "var(--jumi-font-size)" },
    },
    "@keyframes jumi-line-height": {
      to: { "line-height": "var(--jumi-line-height)" },
    },

    // Advanced visual effects
    "@keyframes jumi-filter": {
      to: { filter: "var(--jumi-filter)" },
    },
    "@keyframes jumi-backdrop-filter": {
      to: { "backdrop-filter": "var(--jumi-backdrop-filter)" },
    },

    // Color animations
    "@keyframes jumi-text-color": {
      to: { color: "var(--jumi-text-color)" },
    },
    "@keyframes jumi-bg-color": {
      to: { "background-color": "var(--jumi-bg-color)" },
    },
    "@keyframes jumi-border-color": {
      to: { "border-color": "var(--jumi-border-color)" },
    },

    // Margin keyframes
    "@keyframes jumi-margin": {
      to: { margin: "var(--jumi-margin)" },
    },
    "@keyframes jumi-margin-top": {
      to: { "margin-top": "var(--jumi-margin-top)" },
    },
    "@keyframes jumi-margin-right": {
      to: { "margin-right": "var(--jumi-margin-right)" },
    },
    "@keyframes jumi-margin-bottom": {
      to: { "margin-bottom": "var(--jumi-margin-bottom)" },
    },
    "@keyframes jumi-margin-left": {
      to: { "margin-left": "var(--jumi-margin-left)" },
    },
    "@keyframes jumi-margin-x": {
      to: {
        "margin-left": "var(--jumi-margin-x)",
        "margin-right": "var(--jumi-margin-x)",
      },
    },
    "@keyframes jumi-margin-y": {
      to: {
        "margin-top": "var(--jumi-margin-y)",
        "margin-bottom": "var(--jumi-margin-y)",
      },
    },

    // Padding keyframes
    "@keyframes jumi-padding": {
      to: { padding: "var(--jumi-padding)" },
    },
    "@keyframes jumi-padding-top": {
      to: { "padding-top": "var(--jumi-padding-top)" },
    },
    "@keyframes jumi-padding-right": {
      to: { "padding-right": "var(--jumi-padding-right)" },
    },
    "@keyframes jumi-padding-bottom": {
      to: { "padding-bottom": "var(--jumi-padding-bottom)" },
    },
    "@keyframes jumi-padding-left": {
      to: { "padding-left": "var(--jumi-padding-left)" },
    },
    "@keyframes jumi-padding-x": {
      to: {
        "padding-left": "var(--jumi-padding-x)",
        "padding-right": "var(--jumi-padding-x)",
      },
    },
    "@keyframes jumi-padding-y": {
      to: {
        "padding-top": "var(--jumi-padding-y)",
        "padding-bottom": "var(--jumi-padding-y)",
      },
    },
  };
}
