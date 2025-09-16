import type { Property } from "@/types";

export type PropertyVariable = `var(--jumi-${Property}, ${string})`;

const properties: Array<PropertyVariable> = [
  // Border radius
  "var(--jumi-border-radius, 0)",

  // Logical border radius
  "var(--jumi-border-start-start-radius, 0)",
  "var(--jumi-border-start-end-radius, 0)",
  "var(--jumi-border-end-start-radius, 0)",
  "var(--jumi-border-end-end-radius, 0)",

  // Physical border radius
  "var(--jumi-border-top-left-radius, 0)",
  "var(--jumi-border-top-right-radius, 0)",
  "var(--jumi-border-bottom-left-radius, 0)",
  "var(--jumi-border-bottom-right-radius, 0)",

  // Shorthand logical border radius
  "var(--jumi-border-block-start-radius, 0)",
  "var(--jumi-border-block-end-radius, 0)",
  "var(--jumi-border-inline-start-radius, 0)",
  "var(--jumi-border-inline-end-radius, 0)",

  // Shorthand physical border radius
  "var(--jumi-border-top-radius, 0)",
  "var(--jumi-border-bottom-radius, 0)",
  "var(--jumi-border-left-radius, 0)",
  "var(--jumi-border-right-radius, 0)",

  // Height
  "var(--jumi-height, auto)",
  "var(--jumi-min-height, 0)",
  "var(--jumi-max-height, none)",

  // Opacity
  "var(--jumi-opacity, 1)",

  // Width
  "var(--jumi-width, auto)",
  "var(--jumi-min-width, 0)",
  "var(--jumi-max-width, none)",
];

export const animation = properties.join(", ");
