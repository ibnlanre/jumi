import type { AddProperty, MatchProperty } from "@/types";

import { animationName } from "./animation-name";
import { animationPlayState } from "./animation-play-state";
import { animationDuration } from "./animation-duration";
import { animationTimingFunction } from "./animation-timing-function";
import { animationDelay } from "./animation-delay";
import { animationIterationCount } from "./animation-iteration-count";
import { animationFillMode } from "./animation-fill-mode";
import { animationComposition } from "./animation-composition";
import { animate } from "./animate";

export const addProperties: Array<AddProperty> = [
  {
    name: "animate",
    values: animate,
  },
];

export const matchProperties: Array<MatchProperty> = [
  {
    name: "animate",
    property: (value) => ({ animation: value }),
    key: "animation",
    values: animationName,
  },
  {
    name: "animate-play-state",
    property: (value) => ({ "--jumi-animation-play-state": value }),
    values: animationPlayState,
  },
  {
    name: "animate-duration",
    property: (value) => ({ "--jumi-animation-duration": value }),
    values: animationDuration,
  },
  {
    name: "animate-timing-function",
    property: (value) => ({ "--jumi-animation-timing-function": value }),
    values: animationTimingFunction,
  },
  {
    name: "animate-delay",
    property: (value) => ({ "--jumi-animation-delay": value }),
    values: animationDelay,
  },
  {
    name: "animate-iteration-count",
    property: (value) => ({ "--jumi-animation-iteration-count": value }),
    values: animationIterationCount,
    type: "number",
  },
  {
    name: "animate-direction",
    property: (value) => ({ "--jumi-animation-direction": value }),
    values: animationDuration,
  },
  {
    name: "animate-fill-mode",
    property: (value) => ({ "--jumi-animation-fill-mode": value }),
    values: animationFillMode,
  },
  {
    name: "animate-composition",
    property: (value) => ({ "--jumi-animation-composition": value }),
    values: animationComposition,
  },
  {
    name: "animate-border-radius",
    property: (value) => ({ "--jumi-border-radius": value }),
    key: "borderRadius",
  },
  {
    name: "animate-border-start-start-radius",
    property: (value) => ({ "--jumi-border-start-start-radius": value }),
    key: "borderRadius",
  },
  {
    name: "animate-border-start-end-radius",
    property: (value) => ({ "--jumi-border-start-end-radius": value }),
    key: "borderRadius",
  },
  {
    name: "animate-border-end-start-radius",
    property: (value) => ({ "--jumi-border-end-start-radius": value }),
    key: "borderRadius",
  },
  {
    name: "animate-border-end-end-radius",
    property: (value) => ({ "--jumi-border-end-end-radius": value }),
    key: "borderRadius",
  },
  {
    name: "animate-border-top-left-radius",
    property: (value) => ({ "--jumi-border-top-left-radius": value }),
    key: "borderRadius",
  },
  {
    name: "animate-border-top-right-radius",
    property: (value) => ({ "--jumi-border-top-right-radius": value }),
    key: "borderRadius",
  },
  {
    name: "animate-border-bottom-left-radius",
    property: (value) => ({ "--jumi-border-bottom-left-radius": value }),
    key: "borderRadius",
  },
  {
    name: "animate-border-bottom-right-radius",
    property: (value) => ({ "--jumi-border-bottom-right-radius": value }),
    key: "borderRadius",
  },
  {
    name: "animate-border-block-start-radius",
    property: (value) => ({
      "--jumi-border-start-start-radius": value,
      "--jumi-border-start-end-radius": value,
    }),
    key: "borderRadius",
  },
  {
    name: "animate-border-block-end-radius",
    property: (value) => ({
      "--jumi-border-end-start-radius": value,
      "--jumi-border-end-end-radius": value,
    }),
    key: "borderRadius",
  },
  {
    name: "animate-border-inline-start-radius",
    property: (value) => ({
      "--jumi-border-start-start-radius": value,
      "--jumi-border-end-start-radius": value,
    }),
    key: "borderRadius",
  },
  {
    name: "animate-border-inline-end-radius",
    property: (value) => ({
      "--jumi-border-start-end-radius": value,
      "--jumi-border-end-end-radius": value,
    }),
    key: "borderRadius",
  },
  {
    name: "animate-border-top-radius",
    property: (value) => ({
      "--jumi-border-top-left-radius": value,
      "--jumi-border-top-right-radius": value,
    }),
    key: "borderRadius",
  },
  {
    name: "animate-border-bottom-radius",
    property: (value) => ({
      "--jumi-border-bottom-left-radius": value,
      "--jumi-border-bottom-right-radius": value,
    }),
    key: "borderRadius",
  },
  {
    name: "animate-border-left-radius",
    property: (value) => ({
      "--jumi-border-top-left-radius": value,
      "--jumi-border-bottom-left-radius": value,
    }),
    key: "borderRadius",
  },
  {
    name: "animate-border-right-radius",
    property: (value) => ({
      "--jumi-border-top-right-radius": value,
      "--jumi-border-bottom-right-radius": value,
    }),
    key: "borderRadius",
  },
  {
    name: "animate-border-width",
    property: (value) => ({ "--jumi-border-width": value }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-block-width",
    property: (value) => ({
      "--jumi-border-block-start-width": value,
      "--jumi-border-block-end-width": value,
    }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-inline-width",
    property: (value) => ({
      "--jumi-border-inline-start-width": value,
      "--jumi-border-inline-end-width": value,
    }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-block-start-width",
    property: (value) => ({ "--jumi-border-block-start-width": value }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-block-end-width",
    property: (value) => ({ "--jumi-border-block-end-width": value }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-inline-start-width",
    property: (value) => ({ "--jumi-border-inline-start-width": value }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-inline-end-width",
    property: (value) => ({ "--jumi-border-inline-end-width": value }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-top-width",
    property: (value) => ({ "--jumi-border-top-width": value }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-bottom-width",
    property: (value) => ({ "--jumi-border-bottom-width": value }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-left-width",
    property: (value) => ({ "--jumi-border-left-width": value }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-right-width",
    property: (value) => ({ "--jumi-border-right-width": value }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-top-length",
    property: (value) => ({ "--jumi-border-top-length": value }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-height",
    property: (value) => ({ "--jumi-height": value }),
    key: "height",
  },
  {
    name: "animate-min-height",
    property: (value) => ({ "--jumi-min-height": value }),
    key: "minHeight",
  },
  {
    name: "animate-max-height",
    property: (value) => ({ "--jumi-max-height": value }),
    key: "maxHeight",
  },
  {
    name: "animate-opacity",
    property: (value) => ({ "--jumi-opacity": value }),
    key: "opacity",
  },
  {
    name: "animate-width",
    property: (value) => ({ "--jumi-width": value }),
    key: "width",
  },
  {
    name: "animate-min-width",
    property: (value) => ({ "--jumi-min-width": value }),
    key: "minWidth",
  },
  {
    name: "animate-max-width",
    property: (value) => ({ "--jumi-max-width": value }),
    key: "maxWidth",
  },
];
