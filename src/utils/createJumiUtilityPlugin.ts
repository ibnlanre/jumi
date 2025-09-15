import { MatchUtilitiesType, PluginAPI } from "../types";
import { defaultTheme } from "../config/defaults";

/**
 * Enhanced utility plugin creator inspired by TailwindCSS's createUtilityPlugin
 * but optimized for Jumi's animation-focused utilities
 */

export interface JumiUtilityOptions {
  /**
   * Whether the utility supports negative values
   */
  supportsNegativeValues?: boolean;

  /**
   * CSS property types for validation
   */
  type?: MatchUtilitiesType;

  /**
   * Whether to filter out DEFAULT values
   */
  filterDefault?: boolean;

  /**
   * Whether this utility should respect prefix
   */
  respectPrefix?: boolean;

  /**
   * Whether this utility should respect important
   */
  respectImportant?: boolean;

  /**
   * Custom value transformer function
   */
  valueTransformer?: (value: string) => string;

  /**
   * Default CSS custom properties to set
   */
  defaultProperties?: Record<string, string>;
}

export interface JumiUtilityVariation {
  /**
   * CSS class prefix (e.g., 'animate-w' for width animations)
   */
  classPrefix: string;

  /**
   * CSS properties to set or animation name
   */
  properties: string[] | string;

  /**
   * Optional default property values
   */
  defaults?: Record<string, string>;
}

/**
 * Transform theme values based on the property type
 */
function transformThemeValue(themeKey: string): (value: string) => string {
  const transformers: Record<string, (value: string) => string> = {
    // Animation-specific transformers
    "animation-name": (value: string) => value,
    "animation-duration": (value: string) => value,
    "animation-timing-function": (value: string) => value,
    "animation-delay": (value: string) => value,

    // Transform-specific transformers
    translate: (value: string) => value,
    rotate: (value: string) => (value.includes("deg") ? value : `${value}deg`),
    scale: (value: string) => value,
    skew: (value: string) => (value.includes("deg") ? value : `${value}deg`),

    // Filter transformers
    blur: (value: string) =>
      value.includes("px") ? `blur(${value})` : `blur(${value}px)`,
    brightness: (value: string) => `brightness(${value})`,
    contrast: (value: string) => `contrast(${value})`,
    grayscale: (value: string) => `grayscale(${value})`,
    "hue-rotate": (value: string) =>
      value.includes("deg")
        ? `hue-rotate(${value})`
        : `hue-rotate(${value}deg)`,
    invert: (value: string) => `invert(${value})`,
    saturate: (value: string) => `saturate(${value})`,
    sepia: (value: string) => `sepia(${value})`,

    // Property-specific transformers
    opacity: (value: string) => value,
    "z-index": (value: string) => value,
    "font-weight": (value: string) => value,
    "border-width": (value: string) => value,

    // Color transformers
    color: (value: string) => value,
    "background-color": (value: string) => value,
    "border-color": (value: string) => value,
    "outline-color": (value: string) => value,
    fill: (value: string) => value,
    stroke: (value: string) => value,

    // Length transformers
    width: (value: string) => value,
    height: (value: string) => value,
    "min-width": (value: string) => value,
    "max-width": (value: string) => value,
    "min-height": (value: string) => value,
    "max-height": (value: string) => value,
    top: (value: string) => value,
    right: (value: string) => value,
    bottom: (value: string) => value,
    left: (value: string) => value,
    "font-size": (value: string) => value,
    "line-height": (value: string) => value,
    "letter-spacing": (value: string) => value,
    "border-radius": (value: string) => value,
    "outline-width": (value: string) => value,
    "outline-offset": (value: string) => value,
    "flex-basis": (value: string) => value,
    gap: (value: string) => value,
    "stroke-width": (value: string) => value,

    // Default transformer
    default: (value: string) => value,
  };

  return transformers[themeKey] || transformers.default;
}

/**
 * Create a standardized Jumi utility plugin
 */
export function createJumiUtilityPlugin(
  themeKey: string,
  utilityVariations: JumiUtilityVariation[] = [
    {
      classPrefix: themeKey,
      properties: [themeKey],
    },
  ],
  options: JumiUtilityOptions = {}
): (api: PluginAPI) => void {
  const transformValue =
    options.valueTransformer || transformThemeValue(themeKey);

  return function ({ matchUtilities, theme, addBase }: PluginAPI) {
    // // Add default CSS custom properties if specified
    // if (options.defaultProperties) {
    //   addDefaults(`jumi-${themeKey}`, options.defaultProperties);
    // }

    for (const variation of utilityVariations) {
      const { classPrefix, properties, defaults } = variation;

      // Add defaults for this variation if specified
      if (defaults) {
        addBase({
          [`.${classPrefix}-defaults`]: defaults,
        });
      }

      matchUtilities(
        {
          [classPrefix]: (value: string) => {
            const transformedValue = transformValue(value);

            if (Array.isArray(properties)) {
              // Multiple CSS properties
              return properties.reduce((styles, property) => {
                styles[property] = transformedValue;
                return styles;
              }, {} as Record<string, string>);
            } else {
              // Animation name or single property
              return {
                "animation-name": properties,
                [`--jumi-${themeKey}`]: transformedValue,
              };
            }
          },
        },
        {
          values: options.filterDefault
            ? Object.fromEntries(
                Object.entries(
                  theme(themeKey) ??
                    theme(`jumi.${themeKey}`) ??
                    (defaultTheme as any)[themeKey] ??
                    {}
                ).filter(([modifier]) => modifier !== "DEFAULT")
              )
            : {
                ...(theme(themeKey) ?? {}),
                ...(theme(`jumi.${themeKey}`) ?? {}),
                ...((defaultTheme as any)[themeKey] ?? {}),
              },
          // type: options.type,
          supportsNegativeValues: options.supportsNegativeValues,
          respectPrefix: options.respectPrefix,
          respectImportant: options.respectImportant,
        }
      );
    }
  };
}

/**
 * Create composable transform utilities that work together
 */
export function createTransformUtilities(): (api: PluginAPI) => void {
  return function ({ matchUtilities, theme }: PluginAPI) {
    // Translation utilities
    matchUtilities(
      {
        "animate-translate-x": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-translate-x": value,
          "animation-name": "jumi-translate-x",
        }),
        "animate-translate-y": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-translate-y": value,
          "animation-name": "jumi-translate-y",
        }),
        "animate-translate-z": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-translate-z": value,
          "animation-name": "jumi-translate-z",
        }),
      },
      {
        values: {
          ...(theme("translate") ?? {}),
          ...(theme("jumi.distances") ?? defaultTheme.distances),
        },
        supportsNegativeValues: true,
        type: "length",
      }
    );

    // Rotation utilities
    matchUtilities(
      {
        "animate-rotate": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-rotate": value,
          "animation-name": "jumi-rotate",
        }),
        "animate-rotate-x": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-rotate-x": value,
          "animation-name": "jumi-rotate-x",
        }),
        "animate-rotate-y": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-rotate-y": value,
          "animation-name": "jumi-rotate-y",
        }),
        "animate-rotate-z": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-rotate-z": value,
          "animation-name": "jumi-rotate-z",
        }),
      },
      {
        values: {
          ...(theme("rotate") ?? {}),
          ...(theme("jumi.rotations") ?? defaultTheme.rotations),
        },
        supportsNegativeValues: true,
        type: "any",
      }
    );

    // Scale utilities
    matchUtilities(
      {
        "animate-scale": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-scale-x": value,
          "--jumi-scale-y": value,
          "animation-name": "jumi-scale-uniform",
        }),
        "animate-scale-x": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-scale-x": value,
          "animation-name": "jumi-scale-x",
        }),
        "animate-scale-y": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-scale-y": value,
          "animation-name": "jumi-scale-y",
        }),
        "animate-scale-z": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-scale-z": value,
          "animation-name": "jumi-scale-z",
        }),
      },
      {
        values: {
          ...(theme("scale") ?? {}),
          ...(theme("jumi.scales") ?? defaultTheme.scales),
        },
        supportsNegativeValues: true,
        type: "number",
      }
    );

    // Skew utilities
    matchUtilities(
      {
        "animate-skew-x": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-skew-x": value,
          "animation-name": "jumi-skew-x",
        }),
        "animate-skew-y": (value: string) => ({
          "@defaults jumi-transform": {},
          "--jumi-skew-y": value,
          "animation-name": "jumi-skew-y",
        }),
      },
      {
        values: {
          ...(theme("skew") ?? {}),
          ...(theme("jumi.rotations") ?? defaultTheme.rotations),
        },
        supportsNegativeValues: true,
        type: "any",
      }
    );
  };
}

/**
 * Create composable filter utilities
 */
export function createFilterUtilities(): (api: PluginAPI) => void {
  return function ({ matchUtilities, theme }: PluginAPI) {
    // Filter utilities
    const filterUtilities = {
      "animate-blur": "blur",
      "animate-brightness": "brightness",
      "animate-contrast": "contrast",
      "animate-grayscale": "grayscale",
      "animate-hue-rotate": "hue-rotate",
      "animate-invert": "invert",
      "animate-saturate": "saturate",
      "animate-sepia": "sepia",
    };

    Object.entries(filterUtilities).forEach(([className, filterType]) => {
      matchUtilities(
        {
          [className]: (value: string) => {
            const transformedValue = transformThemeValue(filterType)(value);
            return {
              "@defaults jumi-filter": {},
              [`--jumi-${filterType}`]: transformedValue,
              "animation-name": `jumi-${filterType}`,
            };
          },
        },
        {
          values: {
            ...(theme(filterType) ?? {}),
            ...(theme(`jumi.${filterType}`) ?? {}),
            ...((defaultTheme as any)[filterType] ?? {}),
          },
          type: "any",
        }
      );
    });
  };
}

/**
 * Parse animation values similar to TailwindCSS parseAnimationValue
 * Handles complex animation strings like "fadeIn 1s ease-in-out infinite"
 */
export function parseJumiAnimationValue(value: string) {
  const animations = value.split(",").map((animation) => animation.trim());

  return animations.map((animation) => {
    const parts = animation.split(/\s+/);
    const name = parts[0];
    const properties = parts.slice(1);

    return {
      name,
      value: animation,
      duration: properties.find((p) => p.match(/^\d+\.?\d*(s|ms)$/)),
      timingFunction: properties.find(
        (p) =>
          ["ease", "ease-in", "ease-out", "ease-in-out", "linear"].includes(
            p
          ) || p.startsWith("cubic-bezier")
      ),
      delay: properties.find(
        (p) =>
          p.match(/^\d+\.?\d*(s|ms)$/) &&
          p !== properties.find((p) => p.match(/^\d+\.?\d*(s|ms)$/))
      ),
      iterationCount: properties.find(
        (p) => ["infinite"].includes(p) || p.match(/^\d+$/)
      ),
      direction: properties.find((p) =>
        ["normal", "reverse", "alternate", "alternate-reverse"].includes(p)
      ),
      fillMode: properties.find((p) =>
        ["none", "forwards", "backwards", "both"].includes(p)
      ),
      playState: properties.find((p) => ["running", "paused"].includes(p)),
    };
  });
}
