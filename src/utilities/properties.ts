import { PluginAPI } from "../types";

/**
 * Property-based animation utilities (width, height, border, etc.)
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
      "animate-w-to": (value: string) => ({
        "animation-name": "jumi-width-to",
        "animation-duration": "var(--jumi-duration)",
        "animation-timing-function": "var(--jumi-timing-function)",
        "animation-delay": "var(--jumi-delay)",
        "animation-direction": "var(--jumi-direction)",
        "animation-iteration-count": "var(--jumi-iteration-count)",
        "animation-fill-mode": "var(--jumi-fill-mode)",
        "animation-play-state": "var(--jumi-play-state)",
        "--jumi-width-to": value,
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
      "animate-h-to": (value: string) => ({
        "animation-name": "jumi-height-to",
        "animation-duration": "var(--jumi-duration)",
        "animation-timing-function": "var(--jumi-timing-function)",
        "animation-delay": "var(--jumi-delay)",
        "animation-direction": "var(--jumi-direction)",
        "animation-iteration-count": "var(--jumi-iteration-count)",
        "animation-fill-mode": "var(--jumi-fill-mode)",
        "animation-play-state": "var(--jumi-play-state)",
        "--jumi-height-to": value,
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
      "animate-rounded-to": (value: string) => ({
        "animation-name": "jumi-border-radius-to",
        "animation-duration": "var(--jumi-duration)",
        "animation-timing-function": "var(--jumi-timing-function)",
        "animation-delay": "var(--jumi-delay)",
        "animation-direction": "var(--jumi-direction)",
        "animation-iteration-count": "var(--jumi-iteration-count)",
        "animation-fill-mode": "var(--jumi-fill-mode)",
        "animation-play-state": "var(--jumi-play-state)",
        "--jumi-border-radius-to": value,
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
      "animate-border-to": (value: string) => ({
        "animation-name": "jumi-border-width-to",
        "animation-duration": "var(--jumi-duration)",
        "animation-timing-function": "var(--jumi-timing-function)",
        "animation-delay": "var(--jumi-delay)",
        "animation-direction": "var(--jumi-direction)",
        "animation-iteration-count": "var(--jumi-iteration-count)",
        "animation-fill-mode": "var(--jumi-fill-mode)",
        "animation-play-state": "var(--jumi-play-state)",
        "--jumi-border-width-to": value,
      }),
    },
    {
      values: borderWidthValues,
      type: "length",
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
      "animate-shadow-to": (value: string) => ({
        "animation-name": "jumi-shadow-to",
        "animation-duration": "var(--jumi-duration)",
        "animation-timing-function": "var(--jumi-timing-function)",
        "animation-delay": "var(--jumi-delay)",
        "animation-direction": "var(--jumi-direction)",
        "animation-iteration-count": "var(--jumi-iteration-count)",
        "animation-fill-mode": "var(--jumi-fill-mode)",
        "animation-play-state": "var(--jumi-play-state)",
        "--jumi-shadow-to": value,
      }),
    },
    {
      values: shadowValues,
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
      "animate-text-size-to": (value: string) => {
        // Handle array values from theme (fontSize can be [size, lineHeight])
        const fontSize = Array.isArray(value) ? value[0] : value;
        return {
          "animation-name": "jumi-font-size-to",
          "animation-duration": "var(--jumi-duration)",
          "animation-timing-function": "var(--jumi-timing-function)",
          "animation-delay": "var(--jumi-delay)",
          "animation-direction": "var(--jumi-direction)",
          "animation-iteration-count": "var(--jumi-iteration-count)",
          "animation-fill-mode": "var(--jumi-fill-mode)",
          "animation-play-state": "var(--jumi-play-state)",
          "--jumi-font-size-to": fontSize,
        };
      },
    },
    {
      values: fontSizeValues,
      type: "length",
    }
  );

  // Spacing animation utilities (margin/padding)
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

  ["m", "p"].forEach((property) => {
    const propertyName = property === "m" ? "margin" : "padding";

    matchUtilities(
      {
        [`animate-${property}-to`]: (value: string) => ({
          "animation-name": `jumi-${propertyName}-to`,
          "animation-duration": "var(--jumi-duration)",
          "animation-timing-function": "var(--jumi-timing-function)",
          "animation-delay": "var(--jumi-delay)",
          "animation-direction": "var(--jumi-direction)",
          "animation-iteration-count": "var(--jumi-iteration-count)",
          "animation-fill-mode": "var(--jumi-fill-mode)",
          "animation-play-state": "var(--jumi-play-state)",
          [`--jumi-${propertyName}-to`]: value,
        }),
      },
      {
        values: spacingValues,
        type: "length",
      }
    );
  });

  // Add all the keyframes for property animations
  addBase({
    "@keyframes jumi-width-to": {
      to: { width: "var(--jumi-width-to)" },
    },
    "@keyframes jumi-height-to": {
      to: { height: "var(--jumi-height-to)" },
    },
    "@keyframes jumi-border-radius-to": {
      to: { "border-radius": "var(--jumi-border-radius-to)" },
    },
    "@keyframes jumi-border-width-to": {
      to: { "border-width": "var(--jumi-border-width-to)" },
    },
    "@keyframes jumi-shadow-to": {
      to: { "box-shadow": "var(--jumi-shadow-to)" },
    },
    "@keyframes jumi-font-size-to": {
      to: { "font-size": "var(--jumi-font-size-to)" },
    },
    "@keyframes jumi-margin-to": {
      to: { margin: "var(--jumi-margin-to)" },
    },
    "@keyframes jumi-padding-to": {
      to: { padding: "var(--jumi-padding-to)" },
    },
  });
}
