import { PluginAPI } from "../types";

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
  const sizeValues = {
    ...(theme("width") ?? {}),
    "0": "0px",
    auto: "auto",
    full: "100%",
    screen: "100vw",
    min: "min-content",
    max: "max-content",
    fit: "fit-content",
  };

  matchUtilities(
    {
      "animate-w": (value: string) => ({
        "animation-name": "jumi-width",
        "--jumi-width": value,
      }),
    },
    {
      values: sizeValues,
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
        "0": "0px",
        auto: "auto",
        full: "100%",
        screen: "100vh",
        min: "min-content",
        max: "max-content",
        fit: "fit-content",
      },
      type: "length",
    }
  );

  // Border radius animation utilities
  const borderRadiusValues = {
    ...(theme("borderRadius") ?? {}),
    none: "0px",
    sm: "0.125rem",
    DEFAULT: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  };

  matchUtilities(
    {
      "animate-rounded": (value: string) => ({
        "animation-name": "jumi-border-radius",
        "--jumi-border-radius": value,
      }),
    },
    {
      values: borderRadiusValues,
      type: "length",
    }
  );

  // Border width animation utilities
  const borderWidthValues = {
    ...(theme("borderWidth") ?? {}),
    "0": "0px",
    "2": "2px",
    "4": "4px",
    "8": "8px",
    DEFAULT: "1px",
  };

  matchUtilities(
    {
      "animate-border": (value: string) => ({
        "animation-name": "jumi-border-width",
        "--jumi-border-width": value,
      }),
    },
    {
      values: borderWidthValues,
      type: "line-width",
    }
  );

  // Shadow animation utilities
  const shadowValues = {
    ...(theme("boxShadow") ?? {}),
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    none: "0 0 #0000",
  };

  matchUtilities(
    {
      "animate-shadow": (value: string) => ({
        "animation-name": "jumi-shadow",
        "--jumi-shadow": value,
      }),
    },
    {
      values: shadowValues,
      type: "shadow",
    }
  );

  // === EXPANDED PROPERTY COVERAGE ===

  // Opacity animation utilities
  const opacityValues = {
    ...(theme("opacity") ?? {}),
    "0": "0",
    "5": "0.05",
    "10": "0.1",
    "20": "0.2",
    "25": "0.25",
    "30": "0.3",
    "40": "0.4",
    "50": "0.5",
    "60": "0.6",
    "70": "0.7",
    "75": "0.75",
    "80": "0.8",
    "90": "0.9",
    "95": "0.95",
    "100": "1",
  };

  matchUtilities(
    {
      "animate-opacity": (value: string) => ({
        "animation-name": "jumi-opacity",
        "--jumi-opacity": value,
      }),
    },
    {
      values: opacityValues,
      type: "number",
    }
  );

  // Font size animation utilities
  const fontSizeValues = {
    ...(theme("fontSize") ?? {}),
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem",
  };

  matchUtilities(
    {
      "animate-text": (value: string) => {
        // Handle array values from theme (fontSize can be [size, lineHeight])
        const fontSize = Array.isArray(value) ? value[0] : value;
        return {
          "animation-name": "jumi-font-size",
          "--jumi-font-size": fontSize,
        };
      },
    },
    {
      values: fontSizeValues,
      type: "absolute-size",
    }
  );

  // Line height animation utilities
  const lineHeightValues = {
    ...(theme("lineHeight") ?? {}),
    "3": ".75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "7": "1.75rem",
    "8": "2rem",
    "9": "2.25rem",
    "10": "2.5rem",
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  };

  matchUtilities(
    {
      "animate-leading": (value: string) => ({
        "animation-name": "jumi-line-height",
        "--jumi-line-height": value,
      }),
    },
    {
      values: lineHeightValues,
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
  const filterValues = {
    ...(theme("filter") ?? {}),
    none: "none",
    blur: "blur(8px)",
    "blur-sm": "blur(4px)",
    "blur-md": "blur(12px)",
    "blur-lg": "blur(16px)",
    "blur-xl": "blur(24px)",
    "blur-2xl": "blur(40px)",
    "blur-3xl": "blur(64px)",
    brightness: "brightness(1.25)",
    "brightness-50": "brightness(0.5)",
    "brightness-75": "brightness(0.75)",
    "brightness-90": "brightness(0.9)",
    "brightness-105": "brightness(1.05)",
    "brightness-110": "brightness(1.1)",
    "brightness-125": "brightness(1.25)",
    "brightness-150": "brightness(1.5)",
    "brightness-200": "brightness(2)",
    contrast: "contrast(1.25)",
    "contrast-50": "contrast(0.5)",
    "contrast-75": "contrast(0.75)",
    "contrast-125": "contrast(1.25)",
    "contrast-150": "contrast(1.5)",
    "contrast-200": "contrast(2)",
    grayscale: "grayscale(100%)",
    "grayscale-50": "grayscale(50%)",
    invert: "invert(100%)",
    "invert-50": "invert(50%)",
    sepia: "sepia(100%)",
    "sepia-50": "sepia(50%)",
    "hue-rotate-15": "hue-rotate(15deg)",
    "hue-rotate-30": "hue-rotate(30deg)",
    "hue-rotate-60": "hue-rotate(60deg)",
    "hue-rotate-90": "hue-rotate(90deg)",
    "hue-rotate-180": "hue-rotate(180deg)",
    saturate: "saturate(1.5)",
    "saturate-50": "saturate(0.5)",
    "saturate-150": "saturate(1.5)",
    "saturate-200": "saturate(2)",
  };

  matchUtilities(
    {
      "animate-filter": (value: string) => ({
        "animation-name": "jumi-filter",
        "--jumi-filter": value,
      }),
    },
    {
      values: filterValues,
      type: "any",
    }
  );

  // Backdrop filter animation utilities
  const backdropFilterValues = {
    ...(theme("backdropFilter") ?? {}),
    none: "none",
    blur: "blur(8px)",
    "blur-sm": "blur(4px)",
    "blur-md": "blur(12px)",
    "blur-lg": "blur(16px)",
    "blur-xl": "blur(24px)",
    "blur-2xl": "blur(40px)",
    "blur-3xl": "blur(64px)",
    brightness: "brightness(1.25)",
    "brightness-50": "brightness(0.5)",
    "brightness-75": "brightness(0.75)",
    "brightness-125": "brightness(1.25)",
    "brightness-150": "brightness(1.5)",
    "brightness-200": "brightness(2)",
    contrast: "contrast(1.25)",
    "contrast-50": "contrast(0.5)",
    "contrast-75": "contrast(0.75)",
    "contrast-125": "contrast(1.25)",
    "contrast-150": "contrast(1.5)",
    "contrast-200": "contrast(2)",
    grayscale: "grayscale(100%)",
    invert: "invert(100%)",
    sepia: "sepia(100%)",
    "hue-rotate-15": "hue-rotate(15deg)",
    "hue-rotate-30": "hue-rotate(30deg)",
    "hue-rotate-60": "hue-rotate(60deg)",
    "hue-rotate-90": "hue-rotate(90deg)",
    "hue-rotate-180": "hue-rotate(180deg)",
    saturate: "saturate(1.5)",
    "saturate-50": "saturate(0.5)",
    "saturate-150": "saturate(1.5)",
    "saturate-200": "saturate(2)",
  };

  matchUtilities(
    {
      "animate-backdrop": (value: string) => ({
        "animation-name": "jumi-backdrop-filter",
        "--jumi-backdrop-filter": value,
      }),
    },
    {
      values: backdropFilterValues,
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
