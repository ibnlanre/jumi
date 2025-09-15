import type { PropertiesHyphen } from "csstype";
import type {
  KeyValuePair,
  RecursiveKeyValuePair,
  ThemeConfig,
  ValueType,
} from "tailwindcss/types/config";

type BorderRadius =
  | "border-radius"
  | "border-start-start-radius" // top-left
  | "border-start-end-radius" // top-right
  | "border-end-start-radius" // bottom-left
  | "border-end-end-radius" // bottom-right
  | "border-top-left-radius"
  | "border-top-right-radius"
  | "border-bottom-left-radius"
  | "border-bottom-right-radius"
  | "border-block-start-radius" // top
  | "border-block-end-radius" // bottom
  | "border-inline-start-radius" // left
  | "border-inline-end-radius" // right
  | "border-top-radius"
  | "border-bottom-radius"
  | "border-left-radius"
  | "border-right-radius";

type BorderWidth =
  | "border-width"
  | "border-block-width" // top-bottom
  | "border-inline-width" // left-right
  | "border-block-start-width" // top
  | "border-block-end-width" // bottom
  | "border-inline-start-width" // left
  | "border-inline-end-width" // right
  | "border-top-width"
  | "border-bottom-width"
  | "border-left-width"
  | "border-right-width";

type BorderLength =
  | "border-length"
  | "border-block-length" // top-bottom
  | "border-inline-length" // left-right
  | "border-top-length"
  | "border-bottom-length"
  | "border-left-length"
  | "border-right-length";

type Height = "height" | "min-height" | "max-height";
type Width = "width" | "min-width" | "max-width";

export type Property =
  | BorderRadius
  | BorderWidth
  | BorderLength
  | Height
  | Width
  | "opacity";

type Animate =
  | "animate"
  | "animate-duration"
  | "animate-timing-function"
  | "animate-delay"
  | "animate-direction"
  | "animate-iteration-count"
  | "animate-fill-mode"
  | "animate-play-state"
  | "animate-composition";

type Animation = `animate-${Property}`;

export interface Options {
  respectPrefix: boolean;
  respectImportant: boolean;
  type: ValueType | ValueType[];
  values: KeyValuePair<string, string>;
  modifiers: "any" | KeyValuePair<string, string>;
  supportsNegativeValues: boolean;
}

export interface MatchProperty extends Partial<Options> {
  name: Animate | Animation;
  property: (value: string) => Record<string, string>;
  key?: keyof ThemeConfig;
}

export type Utility = RecursiveKeyValuePair<string, string | string[] | null>;

export interface AddProperty {
  name: "animate" | "animate-transform" | Property;
  values: Utility;
}

export type Keyframes = Record<string, PropertiesHyphen>;

type X = Record<string, string | number>;
type Y = [1, 2, 3];
// type Xs<T extends Record<PropertyKey, number>> = {
//   [K in ]
// }

const primitiveDataTypes = [
  "string",
  "number",
  "bigint",
  "null",
  "undefined",
  "boolean",
  "symbol",
];
let a: Record<string, string> | number = { b: "c" };
let referenceDataTypes = ["array", a];
let d = a;
a = 8;

function record(key, value) {
  return {
    key: value,
  };
}

export interface AnimationKeyframes {
  name: Property;
  keyframes: Keyframes;
}

// Jumi specific types
export interface JumiTheme {
  durations: Record<string, string>;
  delays: Record<string, string>;
  timingFunctions: Record<string, string>;
  directions: Record<string, string>;
  iterationCounts: Record<string, string>;
  fillModes: Record<string, string>;
  playStates: Record<string, string>;
  distances: Record<string, string>;
  rotations: Record<string, string>;
  scales: Record<string, string>;
  perspectives: Record<string, string>;
  effects: Record<string, string>;
  opacity: Record<string, string>;
  blur: Record<string, string>;
  sizes: Record<string, string>;
  borderRadius: Record<string, string>;
  borderWidths: Record<string, string>;
  shadows: Record<string, string>;
  fontSizes: Record<string, string>;
  lineHeights: Record<string, string>;
  filters: Record<string, string>;
  backdrops: Record<string, string>;
  origins: Record<string, string>;
  properties: Record<string, string>;
  spacing: Record<string, string>;
  fontWeights: Record<string, string>;
  letterSpacing: Record<string, string>;
  textShadow: Record<string, string>;
  flexGrow: Record<string, string>;
  flexShrink: Record<string, string>;
  flexBasis: Record<string, string>;
  gap: Record<string, string>;
  order: Record<string, string>;
  zIndex: Record<string, string>;
  outlineWidth: Record<string, string>;
  outlineOffset: Record<string, string>;
  backgroundSize: Record<string, string>;
  backgroundPosition: Record<string, string>;
  strokeWidth: Record<string, string>;
  minWidth: Record<string, string>;
  maxWidth: Record<string, string>;
  minHeight: Record<string, string>;
  maxHeight: Record<string, string>;
  colors: Record<string, string | Record<string, string>>;
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

export type KeyframeDefinition = Record<string, Record<string, any>>;

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
