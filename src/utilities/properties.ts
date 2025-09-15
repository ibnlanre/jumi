import { PluginAPI } from "../types";
import { defaultTheme } from "../config/defaults";

/**
 * Property-based animation utilities with current state → target state paradigm
 * - animate-w-96 means animate from current width to w-96
 * - animate-h-80 means animate from current height to h-80
 */

/**
 * Helper function to create composable property animations that work with timing utilities
 */
function createPropertyAnimation(
  animationName: string,
  cssProperty: string,
  value: string
) {
  return {
    "animation-name": animationName,
    [cssProperty]: value,
  };
}

export function addPropertyUtilities({
  addBase,
  matchUtilities,
  theme,
}: PluginAPI) {
  // Width animation utilities
  matchUtilities(
    {
      "animate-w": (value: string) =>
        createPropertyAnimation("jumi-width", "--jumi-width", value),
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
      "animate-h": (value: string) =>
        createPropertyAnimation("jumi-height", "--jumi-height", value),
    },
    {
      values: {
        ...(theme("height") ?? {}),
        ...(theme("jumi.sizes") ?? defaultTheme.sizes),
      },
      type: "length",
    }
  );

  // === MIN/MAX DIMENSION UTILITIES ===

  // Min-width animation utilities
  matchUtilities(
    {
      "animate-min-w": (value: string) =>
        createPropertyAnimation("jumi-min-width", "--jumi-min-width", value),
    },
    {
      values: {
        "0": "0px",
        full: "100%",
        min: "min-content",
        max: "max-content",
        fit: "fit-content",
        ...(theme("minWidth") ?? {}),
        ...(theme("width") ?? {}),
      },
      type: "length",
    }
  );

  // Max-width animation utilities
  matchUtilities(
    {
      "animate-max-w": (value: string) =>
        createPropertyAnimation("jumi-max-width", "--jumi-max-width", value),
    },
    {
      values: {
        ...(theme("maxWidth") ?? {}),
        ...(theme("jumi.maxWidth") ?? defaultTheme.maxWidth),
      },
      type: "length",
    }
  );

  // Min-height animation utilities
  matchUtilities(
    {
      "animate-min-h": (value: string) =>
        createPropertyAnimation("jumi-min-height", "--jumi-min-height", value),
    },
    {
      values: {
        ...(theme("minHeight") ?? {}),
        ...(theme("height") ?? {}),
        ...(theme("jumi.minHeight") ?? defaultTheme.minHeight),
      },
      type: "length",
    }
  );

  // Max-height animation utilities
  matchUtilities(
    {
      "animate-max-h": (value: string) =>
        createPropertyAnimation("jumi-max-height", "--jumi-max-height", value),
    },
    {
      values: {
        ...(theme("maxHeight") ?? {}),
        ...(theme("jumi.maxHeight") ?? defaultTheme.maxHeight),
      },
      type: "length",
    }
  );

  // Border radius animation utilities
  matchUtilities(
    {
      "animate-rounded": (value: string) =>
        createPropertyAnimation(
          "jumi-border-radius",
          "--jumi-border-radius",
          value
        ),
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

  // === ADVANCED TYPOGRAPHY UTILITIES ===

  // Font weight animation utilities
  matchUtilities(
    {
      "animate-font-weight": (value: string) =>
        createPropertyAnimation(
          "jumi-font-weight",
          "--jumi-font-weight",
          value
        ),
    },
    {
      values: {
        ...(theme("fontWeight") ?? {}),
        ...(theme("jumi.fontWeights") ?? defaultTheme.fontWeights),
      },
      type: "number",
    }
  );

  // Letter spacing animation utilities
  matchUtilities(
    {
      "animate-tracking": (value: string) =>
        createPropertyAnimation(
          "jumi-letter-spacing",
          "--jumi-letter-spacing",
          value
        ),
    },
    {
      values: {
        ...(theme("letterSpacing") ?? {}),
        ...(theme("jumi.letterSpacing") ?? defaultTheme.letterSpacing),
      },
      type: "length",
    }
  );

  // Text shadow animation utilities
  matchUtilities(
    {
      "animate-text-shadow": (value: string) =>
        createPropertyAnimation(
          "jumi-text-shadow",
          "--jumi-text-shadow",
          value
        ),
    },
    {
      values: {
        ...(theme("textShadow") ?? {}),
        ...(theme("jumi.textShadow") ?? defaultTheme.textShadow),
      },
      type: "shadow",
    }
  );

  // Spacing animation utilities (margin/padding) - individual directions
  const spacingValues = {
    ...(theme("spacing") ?? {}),
    ...(theme("jumi.spacing") ?? defaultTheme.spacing),
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

  // === POSITIONING UTILITIES ===

  // Position animation utilities (top, right, bottom, left)
  const positionValues = {
    ...(theme("spacing") ?? {}),
    ...(theme("jumi.spacing") ?? defaultTheme.spacing),
  };

  matchUtilities(
    {
      "animate-top": (value: string) =>
        createPropertyAnimation("jumi-top", "--jumi-top", value),
    },
    {
      values: positionValues,
      type: "length",
    }
  );

  matchUtilities(
    {
      "animate-right": (value: string) =>
        createPropertyAnimation("jumi-right", "--jumi-right", value),
    },
    {
      values: positionValues,
      type: "length",
    }
  );

  matchUtilities(
    {
      "animate-bottom": (value: string) =>
        createPropertyAnimation("jumi-bottom", "--jumi-bottom", value),
    },
    {
      values: positionValues,
      type: "length",
    }
  );

  matchUtilities(
    {
      "animate-left": (value: string) =>
        createPropertyAnimation("jumi-left", "--jumi-left", value),
    },
    {
      values: positionValues,
      type: "length",
    }
  );

  // Z-index animation utilities
  matchUtilities(
    {
      "animate-z": (value: string) =>
        createPropertyAnimation("jumi-z-index", "--jumi-z-index", value),
    },
    {
      values: {
        ...(theme("zIndex") ?? {}),
        ...(theme("jumi.zIndex") ?? defaultTheme.zIndex),
      },
      type: "number",
    }
  );

  // === FLEXBOX LAYOUT UTILITIES ===

  // Flex grow animation utilities
  matchUtilities(
    {
      "animate-flex-grow": (value: string) =>
        createPropertyAnimation("jumi-flex-grow", "--jumi-flex-grow", value),
    },
    {
      values: {
        ...(theme("flexGrow") ?? {}),
        ...(theme("jumi.flexGrow") ?? defaultTheme.flexGrow),
      },
      type: "number",
    }
  );

  // Flex shrink animation utilities
  matchUtilities(
    {
      "animate-flex-shrink": (value: string) =>
        createPropertyAnimation(
          "jumi-flex-shrink",
          "--jumi-flex-shrink",
          value
        ),
    },
    {
      values: {
        ...(theme("flexShrink") ?? {}),
        ...(theme("jumi.flexShrink") ?? defaultTheme.flexShrink),
      },
      type: "number",
    }
  );

  // Flex basis animation utilities
  matchUtilities(
    {
      "animate-flex-basis": (value: string) =>
        createPropertyAnimation("jumi-flex-basis", "--jumi-flex-basis", value),
    },
    {
      values: {
        ...(theme("flexBasis") ?? {}),
        ...(theme("jumi.flexBasis") ?? defaultTheme.flexBasis),
      },
      type: "length",
    }
  );

  // Gap animation utilities
  matchUtilities(
    {
      "animate-gap": (value: string) =>
        createPropertyAnimation("jumi-gap", "--jumi-gap", value),
    },
    {
      values: {
        ...(theme("gap") ?? {}),
        ...(theme("jumi.gap") ?? defaultTheme.gap),
      },
      type: "length",
    }
  );

  // Order animation utilities
  matchUtilities(
    {
      "animate-order": (value: string) =>
        createPropertyAnimation("jumi-order", "--jumi-order", value),
    },
    {
      values: {
        ...(theme("order") ?? {}),
        ...(theme("jumi.order") ?? defaultTheme.order),
      },
      type: "number",
    }
  );

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
  const colorValues = theme("colors") ?? defaultTheme.colors;

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

  // Text color animation (standardized as animate-color)
  matchUtilities(
    {
      "animate-color": (value: string) =>
        createPropertyAnimation("jumi-color", "--jumi-color", value),
    },
    {
      values: flatColorValues,
      type: "color",
    }
  );

  // SVG fill color animation
  matchUtilities(
    {
      "animate-fill": (value: string) =>
        createPropertyAnimation("jumi-fill", "--jumi-fill", value),
    },
    {
      values: flatColorValues,
      type: "color",
    }
  );

  // Background color animation
  matchUtilities(
    {
      "animate-bg": (value: string) =>
        createPropertyAnimation("jumi-bg-color", "--jumi-bg-color", value),
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

  // === OUTLINE UTILITIES ===

  // Outline width animation utilities
  matchUtilities(
    {
      "animate-outline": (value: string) =>
        createPropertyAnimation(
          "jumi-outline-width",
          "--jumi-outline-width",
          value
        ),
    },
    {
      values: {
        ...(theme("outlineWidth") ?? {}),
        ...(theme("jumi.outlineWidth") ?? defaultTheme.outlineWidth),
      },
      type: "line-width",
    }
  );

  // Outline color animation utilities
  matchUtilities(
    {
      "animate-outline-color": (value: string) =>
        createPropertyAnimation(
          "jumi-outline-color",
          "--jumi-outline-color",
          value
        ),
    },
    {
      values: flatColorValues,
      type: "color",
    }
  );

  // Outline offset animation utilities
  matchUtilities(
    {
      "animate-outline-offset": (value: string) =>
        createPropertyAnimation(
          "jumi-outline-offset",
          "--jumi-outline-offset",
          value
        ),
    },
    {
      values: {
        ...(theme("outlineOffset") ?? {}),
        ...(theme("jumi.outlineOffset") ?? defaultTheme.outlineOffset),
      },
      type: "length",
    }
  );

  // === BACKGROUND UTILITIES ===

  // Background size animation utilities
  matchUtilities(
    {
      "animate-bg-size": (value: string) =>
        createPropertyAnimation("jumi-bg-size", "--jumi-bg-size", value),
    },
    {
      values: {
        ...(theme("backgroundSize") ?? {}),
        ...(theme("jumi.backgroundSize") ?? defaultTheme.backgroundSize),
      },
      type: "length",
    }
  );

  // Background position animation utilities
  matchUtilities(
    {
      "animate-bg-position": (value: string) =>
        createPropertyAnimation(
          "jumi-bg-position",
          "--jumi-bg-position",
          value
        ),
    },
    {
      values: {
        ...(theme("backgroundPosition") ?? {}),
        ...(theme("jumi.backgroundPosition") ??
          defaultTheme.backgroundPosition),
      },
      type: "position",
    }
  );

  // === SVG UTILITIES ===

  // SVG stroke color animation utilities
  matchUtilities(
    {
      "animate-stroke": (value: string) =>
        createPropertyAnimation("jumi-stroke", "--jumi-stroke", value),
    },
    {
      values: flatColorValues,
      type: "color",
    }
  );

  // SVG stroke width animation utilities
  matchUtilities(
    {
      "animate-stroke-width": (value: string) =>
        createPropertyAnimation(
          "jumi-stroke-width",
          "--jumi-stroke-width",
          value
        ),
    },
    {
      values: {
        ...(theme("strokeWidth") ?? {}),
        ...(theme("jumi.strokeWidth") ?? defaultTheme.strokeWidth),
      },
      type: "number",
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
    "@keyframes jumi-color": {
      to: { color: "var(--jumi-color)" },
    },
    "@keyframes jumi-fill": {
      to: { fill: "var(--jumi-fill)" },
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

    // === NEW ANIMATION KEYFRAMES ===

    // Min/Max dimension keyframes
    "@keyframes jumi-min-width": {
      to: { "min-width": "var(--jumi-min-width)" },
    },
    "@keyframes jumi-max-width": {
      to: { "max-width": "var(--jumi-max-width)" },
    },
    "@keyframes jumi-min-height": {
      to: { "min-height": "var(--jumi-min-height)" },
    },
    "@keyframes jumi-max-height": {
      to: { "max-height": "var(--jumi-max-height)" },
    },

    // Positioning keyframes
    "@keyframes jumi-top": {
      to: { top: "var(--jumi-top)" },
    },
    "@keyframes jumi-right": {
      to: { right: "var(--jumi-right)" },
    },
    "@keyframes jumi-bottom": {
      to: { bottom: "var(--jumi-bottom)" },
    },
    "@keyframes jumi-left": {
      to: { left: "var(--jumi-left)" },
    },
    "@keyframes jumi-z-index": {
      to: { "z-index": "var(--jumi-z-index)" },
    },

    // Typography keyframes
    "@keyframes jumi-font-weight": {
      to: { "font-weight": "var(--jumi-font-weight)" },
    },
    "@keyframes jumi-letter-spacing": {
      to: { "letter-spacing": "var(--jumi-letter-spacing)" },
    },
    "@keyframes jumi-text-shadow": {
      to: { "text-shadow": "var(--jumi-text-shadow)" },
    },

    // Flexbox keyframes
    "@keyframes jumi-flex-grow": {
      to: { "flex-grow": "var(--jumi-flex-grow)" },
    },
    "@keyframes jumi-flex-shrink": {
      to: { "flex-shrink": "var(--jumi-flex-shrink)" },
    },
    "@keyframes jumi-flex-basis": {
      to: { "flex-basis": "var(--jumi-flex-basis)" },
    },
    "@keyframes jumi-gap": {
      to: { gap: "var(--jumi-gap)" },
    },
    "@keyframes jumi-order": {
      to: { order: "var(--jumi-order)" },
    },

    // Outline keyframes
    "@keyframes jumi-outline-width": {
      to: { "outline-width": "var(--jumi-outline-width)" },
    },
    "@keyframes jumi-outline-color": {
      to: { "outline-color": "var(--jumi-outline-color)" },
    },
    "@keyframes jumi-outline-offset": {
      to: { "outline-offset": "var(--jumi-outline-offset)" },
    },

    // Background keyframes
    "@keyframes jumi-bg-size": {
      to: { "background-size": "var(--jumi-bg-size)" },
    },
    "@keyframes jumi-bg-position": {
      to: { "background-position": "var(--jumi-bg-position)" },
    },

    // SVG keyframes
    "@keyframes jumi-stroke": {
      to: { stroke: "var(--jumi-stroke)" },
    },
    "@keyframes jumi-stroke-width": {
      to: { "stroke-width": "var(--jumi-stroke-width)" },
    },
  };
}
