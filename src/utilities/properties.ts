import type { PluginAPI } from "tailwindcss/types/config";

import { addProperties, matchProperties } from "@/config/properties";
import { defaultTheme } from "@/config/defaults";
import { mergeTheme } from "@/utils/merge-theme";

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
  addUtilities,
  matchUtilities,
  theme,
}: PluginAPI) {
  addUtilities(addProperties);

  matchProperties.forEach((item) => {
    const { property, name, key, values, ...options } = item;

    matchUtilities(
      { [name]: property },
      {
        values: mergeTheme(theme(key), values),
        ...options,
      }
    );
  });

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
}
