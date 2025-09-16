import type { PropertiesHyphen } from "csstype";
import type {
  CSSRuleObject,
  KeyValuePair,
  RecursiveKeyValuePair,
  ThemeConfig,
  ValueType,
} from "tailwindcss/types/config";
import type { animationName } from "./config/theme/animation-name";

export type Property =
  | "accent-color"
  | "align-content"
  | "align-items"
  | "align-self"
  | "alignment-baseline"
  | "all"
  | "appearance"
  | "aspect-ratio"
  | "backdrop-filter"
  | "backdrop-blur"
  | "backdrop-brightness"
  | "backdrop-contrast"
  | "backdrop-grayscale"
  | "backdrop-hue-rotate"
  | "backdrop-invert"
  | "backdrop-opacity"
  | "backdrop-saturate"
  | "backdrop-sepia"
  | "background-color"
  | "background-position"
  | "background-size"
  | "background-clip"
  | "background-origin"
  | "background-image"
  | "border-color"
  | "border-style"
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
  | "border-right-radius"
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
  | "border-right-width"
  | "border-length"
  | "border-block-length" // top-bottom
  | "border-inline-length" // left-right
  | "border-block-start-length" // top
  | "border-block-end-length" // bottom
  | "border-inline-start-length" // left
  | "border-inline-end-length" // right
  | "border-top-length"
  | "border-bottom-length"
  | "border-left-length"
  | "border-right-length"
  | "shadow"
  | "box-shadow"
  | "caret-color"
  | "color"
  | "column-gap"
  | "columns"
  | "column-width"
  | "column-count"
  | "contrast"
  | "cursor"
  | "display"
  | "drop-shadow"
  | "fill"
  | "filter"
  | "flex"
  | "flex-direction"
  | "flex-wrap"
  | "flex-flow"
  | "flex-basis"
  | "flex-grow"
  | "flex-shrink"
  | "font-family"
  | "font-size"
  | "font-smoothing"
  | "font-style"
  | "font-variant-numeric"
  | "font-weight"
  | "gap"
  | "grid-auto-columns"
  | "grid-auto-flow"
  | "grid-auto-rows"
  | "grid-column"
  | "grid-column-end"
  | "grid-column-start"
  | "grid-row"
  | "grid-row-end"
  | "grid-row-start"
  | "grid-template-columns"
  | "grid-template-rows"
  | "height"
  | "inset"
  | "inset-block"
  | "inset-block-start"
  | "inset-block-end"
  | "inset-inline"
  | "inset-inline-start"
  | "inset-inline-end"
  | "inset-top"
  | "inset-bottom"
  | "inset-left"
  | "inset-right"
  | "isolation"
  | "justify-content"
  | "justify-items"
  | "justify-self"
  | "letter-spacing"
  | "line-height"
  | "list-style-type"
  | "margin"
  | "margin-block"
  | "margin-block-start"
  | "margin-block-end"
  | "margin-inline"
  | "margin-inline-start"
  | "margin-inline-end"
  | "margin-top"
  | "margin-bottom"
  | "margin-left"
  | "margin-right"
  | "max-height"
  | "max-width"
  | "min-height"
  | "min-width"
  | "object-fit"
  | "object-position"
  | "opacity"
  | "order"
  | "outline-color"
  | "outline-offset"
  | "outline-style"
  | "outline-width"
  | "overflow"
  | "overflow-x"
  | "overflow-y"
  | "padding"
  | "padding-block"
  | "padding-block-start"
  | "padding-block-end"
  | "padding-inline"
  | "padding-inline-start"
  | "padding-inline-end"
  | "padding-top"
  | "padding-bottom"
  | "padding-left"
  | "padding-right"
  | "perspective"
  | "perspective-origin"
  | "place-content"
  | "place-items"
  | "place-self"
  | "position"
  | "resize"
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "scroll-margin"
  | "scroll-margin-block"
  | "scroll-margin-block-start"
  | "scroll-margin-block-end"
  | "scroll-margin-inline"
  | "scroll-margin-inline-start"
  | "scroll-margin-inline-end"
  | "scroll-margin-top"
  | "scroll-margin-bottom"
  | "scroll-margin-left"
  | "scroll-margin-right"
  | "scroll-padding"
  | "scroll-padding-block"
  | "scroll-padding-block-start"
  | "scroll-padding-block-end"
  | "scroll-padding-inline"
  | "scroll-padding-inline-start"
  | "scroll-padding-inline-end"
  | "scroll-padding-top"
  | "scroll-padding-bottom"
  | "scroll-padding-left"
  | "scroll-padding-right"
  | "shape-outside"
  | "stroke"
  | "stroke-width"
  | "table-layout"
  | "text-align"
  | "text-decoration-color"
  | "text-decoration-thickness"
  | "text-indent"
  | "text-shadow"
  | "text-transform"
  | "transform-origin"
  | "transform-style"
  | "transition-property"
  | "transition-timing-function"
  | "transition-duration"
  | "transition-delay"
  | "user-select"
  | "vertical-align"
  | "visibility"
  | "white-space"
  | "width"
  | "word-break"
  | "z-index";

type Animate =
  | "animate"
  | "animate-timeline"
  | "animate-timeline-scroller"
  | "animate-timeline-axis"
  | "animate-timeline-inset"
  | "animate-timeline-inset-start"
  | "animate-timeline-inset-end"
  | "animate-range"
  | "animate-range-start"
  | "animate-range-end"
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
  property: (value: string) => CSSRuleObject;
  key?: keyof ThemeConfig;
}

export type Utility = RecursiveKeyValuePair<string, string | string[] | null>;

type AddPropertyKeys =
  | "animate"
  | "animate-transform"
  | "animate-transform-gpu"
  | Property;

export type AddProperty = {
  [K in AddPropertyKeys as `.${K}`]?: Utility;
};

export type Keyframes = Record<
  string,
  PropertiesHyphen | Record<string & {}, string>
>;

export type PropertyKeyframes = {
  [K in Property as `@keyframes jumi-${K}`]?: Keyframes;
};

type AnimationName = keyof typeof animationName;
export type AnimationKeyframes = {
  [K in AnimationName as `@keyframes ${K}`]?: Keyframes;
};

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
