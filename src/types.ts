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
}

export interface JumiConfig {
  theme?: JumiTheme;
  prefix?: string;
  respectPrefix?: boolean;
  respectImportant?: boolean;
}

export interface EasingDefinition {
  name: string;
  value: string;
  category: "ease-in" | "ease-out" | "ease-in-out";
}

export interface KeyframeDefinition {
  name: string;
  keyframes: Record<string, Record<string, any>>;
}

export interface TransformUtility {
  property: string;
  values: Record<string, string>;
  transform: (value: string) => string;
}

// Direction mappings for transforms
export type Direction =
  | "x"
  | "y"
  | "z"
  | "t"
  | "r"
  | "b"
  | "l"
  | "tl"
  | "tr"
  | "bl"
  | "br"
  | "c";

export interface DirectionConfig {
  x: number;
  y: number;
  z: number;
  axis: "x" | "y" | "z" | "d";
}

// Plugin configuration
export interface JumiPluginOptions extends JumiConfig {
  enableHover?: boolean;
  enableGroup?: boolean;
  enableResponsive?: boolean;
  enableDark?: boolean;
}
