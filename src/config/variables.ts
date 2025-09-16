import {
  animationRange,
  animationRangeEnd,
  animationRangeStart,
} from "@/composition/animation-range";
import { animationTimelineInset } from "@/composition/animation-timeline";
import { aspectRatio } from "@/composition/aspect-ratio";
import { backdropFilter } from "@/composition/backdrop-filter";
import { filter } from "@/composition/filter";
import { transform, transformGpu } from "@/composition/transform";

export const variables = {
  // Animation defaults
  "--jumi-animation-name": "none",
  "--jumi-animation-duration": "1s",
  "--jumi-animation-timing-function": "ease",
  "--jumi-animation-delay": "0s",
  "--jumi-animation-direction": "alternate-reverse",
  "--jumi-animation-iteration-count": "1",
  "--jumi-animation-fill-mode": "forwards",
  "--jumi-animation-play-state": "running",
  "--jumi-animation-composition": "replace",
  "--jumi-animation-timeline-inset": animationTimelineInset,
  "--jumi-animation-range": animationRange,
  "--jumi-animation-range-start": animationRangeStart,
  "--jumi-animation-range-end": animationRangeEnd,
  "--jumi-aspect-ratio-width": "auto",
  "--jumi-aspect-ratio-height": "auto",
  "--jumi-aspect-ratio": aspectRatio,

  // Transform defaults
  "--jumi-transform": transform,
  "--jumi-transform-gpu": transformGpu,
  "--jumi-translate-x": "0",
  "--jumi-translate-y": "0",
  "--jumi-translate-z": "0",
  "--jumi-rotate": "0deg",
  "--jumi-rotate-x": "0deg",
  "--jumi-rotate-y": "0deg",
  "--jumi-rotate-z": "0deg",
  "--jumi-skew-x": "0deg",
  "--jumi-skew-y": "0deg",
  "--jumi-scale-x": "1",
  "--jumi-scale-y": "1",
  "--jumi-scale-z": "1",
  "--jumi-transform-style": "flat",
  "--jumi-transform-origin": "center",
  "--jumi-transform-origin-x": "50%",
  "--jumi-transform-origin-y": "50%",
  "--jumi-transform-origin-z": "0px",
  "--jumi-perspective": "none",
  "--jumi-perspective-origin": "center",

  // Filter defaults
  "--jumi-filter": filter,
  "--jumi-blur": "blur(0)",
  "--jumi-brightness": "brightness(1)",
  "--jumi-contrast": "contrast(1)",
  "--jumi-grayscale": "grayscale(0)",
  "--jumi-hue-rotate": "hue-rotate(0deg)",
  "--jumi-invert": "invert(0)",
  "--jumi-saturate": "saturate(1)",
  "--jumi-sepia": "sepia(0)",
  "--jumi-drop-shadow": "drop-shadow(0 0 0 transparent)",

  // Backdrop filter defaults
  "--jumi-backdrop-filter": backdropFilter,
  "--jumi-backdrop-blur": "blur(0)",
  "--jumi-backdrop-brightness": "brightness(1)",
  "--jumi-backdrop-contrast": "contrast(1)",
  "--jumi-backdrop-grayscale": "grayscale(0)",
  "--jumi-backdrop-hue-rotate": "hue-rotate(0deg)",
  "--jumi-backdrop-invert": "invert(0)",
  "--jumi-backdrop-opacity": "opacity(1)",
  "--jumi-backdrop-saturate": "saturate(1)",
  "--jumi-backdrop-sepia": "sepia(0)",

  // Property animation defaults (for our animate-{property} utilities)
  "--jumi-width": "auto",
  "--jumi-height": "auto",
  "--jumi-opacity": "1",
  "--jumi-color": "inherit",
  "--jumi-bg-color": "transparent",
  "--jumi-border-color": "currentColor",
  "--jumi-border-width": "0",
  "--jumi-border-radius": "0",
  "--jumi-shadow": "0 0 0 0 transparent",
  "--jumi-font-size": "1rem",
  "--jumi-line-height": "1.5",
  "--jumi-font-weight": "400",
  "--jumi-letter-spacing": "0em",
  "--jumi-text-shadow": "none",

  // Positioning defaults
  "--jumi-top": "auto",
  "--jumi-right": "auto",
  "--jumi-bottom": "auto",
  "--jumi-left": "auto",
  "--jumi-z-index": "auto",

  // Flexbox defaults
  "--jumi-flex-grow": "0",
  "--jumi-flex-shrink": "1",
  "--jumi-flex-basis": "auto",
  "--jumi-gap": "0",
  "--jumi-order": "0",

  // Outline defaults
  "--jumi-outline-width": "0",
  "--jumi-outline-color": "currentColor",
  "--jumi-outline-offset": "0",

  // Background defaults
  "--jumi-bg-size": "auto",
  "--jumi-bg-position": "0% 0%",

  // SVG defaults
  "--jumi-fill": "currentColor",
  "--jumi-stroke": "none",
  "--jumi-stroke-width": "1",
};
