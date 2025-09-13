/**
 * Jumi - TailwindCSS Animation Plugin
 * A comprehensive CSS animation library built as a TailwindCSS plugin
 */

// Core TailwindCSS types
export interface PluginAPI {
  addBase: (base: Record<string, any>) => void;
  addUtilities: (
    utilities: Record<string, any>,
    options?: { respectPrefix?: boolean; respectImportant?: boolean }
  ) => void;
  matchUtilities: (
    utilities: Record<string, (value: string) => Record<string, any>>,
    options?: MatchUtilitiesOptions
  ) => void;
  addComponents: (
    components: Record<string, any>,
    options?: { respectPrefix?: boolean; respectImportant?: boolean }
  ) => void;
  addVariant: (
    name: string,
    definition: string | string[] | (() => string)
  ) => void;
  theme: (path?: string) => any;
  config: (path?: string) => any;
  corePlugins: (path: string) => boolean;
  e: (className: string) => string;
}

export interface MatchUtilitiesOptions {
  respectPrefix?: boolean;
  respectImportant?: boolean;
  type?: string | string[];
  values?: Record<string, string>;
}

// Jumi specific types
export interface JumiTheme {
  durations?: Record<string, string>;
  delays?: Record<string, string>;
  easings?: Record<string, string>;
  distances?: Record<string, string>;
  rotations?: Record<string, string>;
  scales?: Record<string, string>;
  perspectives?: Record<string, string>;
  effects?: Record<string, string>;

  // Extended property theme support
  filters?: Record<string, string>;
  backdropFilters?: Record<string, string>;
  colors?: Record<string, string | Record<string, string>>;
  spacing?: Record<string, string>;
  fontSizes?: Record<string, string | [string, string]>;
  lineHeights?: Record<string, string>;
  borderRadius?: Record<string, string>;
  borderWidth?: Record<string, string>;
  boxShadow?: Record<string, string>;
  opacity?: Record<string, string>;
}

export interface JumiConfig {
  theme?: JumiTheme;
  prefix?: string;
  respectPrefix?: boolean;
  respectImportant?: boolean;

  // Animation behavior configuration
  defaultDuration?: string;
  defaultEasing?: string;
  defaultDelay?: string;
  defaultDirection?: string;
  defaultIterationCount?: string;
  defaultFillMode?: string;
  defaultPlayState?: string;
}

export interface EasingDefinition {
  name: string;
  value: string;
  category: "ease-in" | "ease-out" | "ease-in-out" | "linear" | "custom";
}

export interface KeyframeDefinition {
  name: string;
  keyframes: Record<string, Record<string, any>>;
}

// Enhanced property type definitions
export interface PropertyUtility {
  property: string;
  cssProperty: string;
  values: Record<string, string>;
  type?: "length" | "color" | "number" | "angle" | "percentage";
  supportsNegative?: boolean;
}

// Transform utilities with intelligent defaults
export interface TransformUtility {
  property: string;
  cssProperty: string;
  values: Record<string, string>;
  defaultBehavior: "uniform" | "axis-specific" | "directional";
  transform: (value: string) => string;
}

// Direction mappings for transforms (enhanced with semantic and logical directions)
export type Direction =
  // Axis-based directions (explicit)
  | "x"
  | "y"
  | "z"
  // Physical directions (semantic)
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  // Logical directions (i18n-friendly)
  | "start"
  | "end"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "start-start"
  | "start-end"
  | "end-start"
  | "end-end";

export interface DirectionConfig {
  x: number;
  y: number;
  z: number;
  axis: "x" | "y" | "z" | "d"; // d = diagonal
  semantic?: boolean; // indicates if this is a semantic direction
}

// Animation categories for better organization
export type AnimationCategory =
  | "transform" // scale, rotate, translate, perspective
  | "property" // width, height, margin, padding, etc.
  | "effect" // fade, blur, tracking, bounce, etc.
  | "visual" // filter, backdrop-filter, shadow
  | "color" // text, background, border colors
  | "typography" // font-size, line-height
  | "layout"; // margin, padding, spacing

// Property animation types (new naming convention)
export type PropertyAnimationType =
  // Layout & sizing
  | "w"
  | "h" // width, height
  | "m"
  | "mt"
  | "mr"
  | "mb"
  | "ml"
  | "mx"
  | "my" // margin variants
  | "p"
  | "pt"
  | "pr"
  | "pb"
  | "pl"
  | "px"
  | "py" // padding variants

  // Visual properties
  | "opacity" // opacity
  | "rounded" // border-radius
  | "border" // border-width
  | "shadow" // box-shadow

  // Typography
  | "text" // font-size
  | "leading" // line-height

  // Colors
  | "text-color" // text color
  | "bg" // background color
  | "border-color" // border color

  // Advanced effects
  | "filter" // CSS filter
  | "backdrop"; // backdrop-filter

// Transform animation types (intelligent defaults)
export type TransformAnimationType =
  // Scale (intelligent: uniform by default)
  | "scale" // uniform scaling (default)
  | "scale-x" // x-axis scaling (explicit)
  | "scale-y" // y-axis scaling (explicit)
  | "scale-z" // z-axis scaling (explicit)

  // Rotate (intelligent: z-axis clockwise by default)
  | "rotate" // z-axis clockwise (default)
  | "rotate-ccw" // z-axis counter-clockwise
  | "rotate-x" // x-axis rotation (explicit)
  | "rotate-y" // y-axis rotation (explicit)
  | "rotate-z" // z-axis rotation (explicit)

  // Translate (explicit direction required)
  | "translate-top"
  | "translate-right"
  | "translate-bottom"
  | "translate-left"
  | "translate-start"
  | "translate-end"
  | "translate-top-left"
  | "translate-top-right"
  | "translate-bottom-left"
  | "translate-bottom-right"
  | "translate-top-start"
  | "translate-top-end"
  | "translate-bottom-start"
  | "translate-bottom-end"
  | "translate-start-start"
  | "translate-start-end"
  | "translate-end-start"
  | "translate-end-end"
  | "translate-x"
  | "translate-y"
  | "translate-z"

  // Perspective & origin
  | "perspective"
  | "origin";

// Plugin configuration with enhanced options
export interface JumiPluginOptions extends JumiConfig {
  // Variant support
  enableHover?: boolean;
  enableGroup?: boolean;
  enableResponsive?: boolean;
  enableDark?: boolean;
  enableFocus?: boolean;
  enableActive?: boolean;

  // Feature toggles
  enableTransforms?: boolean;
  enableProperties?: boolean;
  enableEffects?: boolean;
  enableColors?: boolean;
  enableAdvanced?: boolean;

  // Naming conventions
  useIntelligentDefaults?: boolean; // animate-scale vs animate-scale-uniform
  removeRedundantWords?: boolean; // animate-rotate vs animate-rotate-c
  useSemanticDirections?: boolean; // top/right vs t/r
}
