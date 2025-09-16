import type { AddProperty, MatchProperty } from "@/types";

import { animationName } from "./theme/animation-name";
import { animationPlayState } from "./theme/animation-play-state";
import { animationDuration } from "./theme/animation-duration";
import { animationTimingFunction } from "./theme/animation-timing-function";
import { animationDelay } from "./theme/animation-delay";
import { animationIterationCount } from "./theme/animation-iteration-count";
import { animationFillMode } from "./theme/animation-fill-mode";
import { animationComposition } from "./theme/animation-composition";
import { alignContent } from "./theme/align-content";
import { alignItems } from "./theme/align-items";
import { alignSelf } from "./theme/align-self";
import { alignmentBaseline } from "./theme/alignment-baseline";
import { animationTimeline } from "./theme/animation-timeline";
import { animationTimelineAxis } from "./theme/animation-timeline-axis";
import { animationTimelineScroller } from "./theme/animation-timeline-scroller";
import { animationTimelineInset } from "./theme/animation-timeline-inset";
import { animationRange } from "./theme/animation-range";
import { percentage } from "./theme/percentage";

export const addProperties: Array<AddProperty> = [
  {
    name: "animate",
    values: {
      "animation-name": "var(--jumi-animation-name)",
      "animation-duration": "var(--jumi-animation-duration)",
      "animation-timing-function": "var(--jumi-animation-timing-function)",
      "animation-delay": "var(--jumi-animation-delay)",
      "animation-direction": "var(--jumi-animation-direction)",
      "animation-iteration-count": "var(--jumi-animation-iteration-count)",
      "animation-fill-mode": "var(--jumi-animation-fill-mode)",
      "animation-play-state": "var(--jumi-animation-play-state)",
      "animation-composition": "var(--jumi-animation-composition)",
      "animation-timeline": "var(--jumi-animation-timeline, auto)",
      "animation-range": "var(--jumi-animation-range, normal)",
      "animation-range-start": "var(--jumi-animation-range-start, normal)",
      "animation-range-end": "var(--jumi-animation-range-end, normal)",
      transform: "var(--jumi-transform)",
    },
  },
  {
    name: "animate-transform",
    values: {
      transform: "var(--jumi-transform)",
    },
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
    name: "animate-accent-color",
    property: (value) => ({ "--jumi-accent-color": value }),
    key: "accentColor",
    values: { auto: "auto" },
  },
  {
    name: "animate-align-content",
    property: (value) => ({ "--jumi-align-content": value }),
    values: alignContent,
  },
  {
    name: "animate-align-items",
    property: (value) => ({ "--jumi-align-items": value }),
    values: alignItems,
  },
  {
    name: "animate-align-self",
    property: (value) => ({ "--jumi-align-self": value }),
    values: alignSelf,
  },
  {
    name: "animate-alignment-baseline",
    property: (value) => ({ "--jumi-alignment-baseline": value }),
    values: alignmentBaseline,
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
    name: "animate-border-length",
    property: (value) => ({
      position: "relative",
      "&::before": {
        content: "''",
        position: "absolute",
        inset: "0",
        width: value,
        height: value,
        "background-color": "var(--jumi-border-color, currentColor)",
        "animation-name": "jumi-border-length",
      },
    }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-top-length",
    property: (value) => ({
      position: "relative",
      "&::before": {
        content: "''",
        position: "absolute",
        top: "0",
        left: "0",
        width: "0%",
        height: value,
        "background-color": "var(--jumi-border-color, currentColor)",
        "animation-name": "jumi-border-top-length",
      },
    }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-bottom-length",
    property: (value) => ({
      position: "relative",
      "&::before": {
        content: "''",
        position: "absolute",
        bottom: "0",
        right: "0",
        width: "0%",
        height: value,
        "background-color": "var(--jumi-border-color, currentColor)",
        "animation-name": "jumi-border-bottom-length",
      },
    }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-right-length",
    property: (value) => ({
      position: "relative",
      "&::before": {
        content: "''",
        position: "absolute",
        top: "0",
        right: "0",
        width: value,
        height: "0%",
        "background-color": "var(--jumi-border-color, currentColor)",
        "animation-name": "jumi-border-right-length",
      },
    }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-border-left-length",
    property: (value) => ({
      position: "relative",
      "&::before": {
        content: "''",
        position: "absolute",
        bottom: "0",
        left: "0",
        width: value,
        height: "0%",
        "background-color": "var(--jumi-border-color, currentColor)",
        "animation-name": "jumi-border-left-length",
      },
    }),
    key: "borderWidth",
    type: ["line-width", "length"],
  },
  {
    name: "animate-composition",
    property: (value) => ({ "--jumi-animation-composition": value }),
    values: animationComposition,
  },
  {
    name: "animate-delay",
    property: (value) => ({ "--jumi-animation-delay": value }),
    values: animationDelay,
  },
  {
    name: "animate-direction",
    property: (value) => ({ "--jumi-animation-direction": value }),
    values: animationDuration,
  },
  {
    name: "animate-duration",
    property: (value) => ({ "--jumi-animation-duration": value }),
    values: animationDuration,
  },
  {
    name: "animate-fill-mode",
    property: (value) => ({ "--jumi-animation-fill-mode": value }),
    values: animationFillMode,
  },
  {
    name: "animate-iteration-count",
    property: (value) => ({ "--jumi-animation-iteration-count": value }),
    values: animationIterationCount,
    type: "number",
  },
  {
    name: "animate-play-state",
    property: (value) => ({ "--jumi-animation-play-state": value }),
    values: animationPlayState,
  },
  {
    name: "animate-range",
    property: (value) => ({ "--jumi-animation-range": value }),
    values: animationRange,
  },
  {
    name: "animate-range-end",
    property: (value) => ({ "--jumi-animation-range-end-name": value }),
    values: animationRange,
  },
  {
    name: "animate-range-end",
    property: (value) => ({ "--jumi-animation-range-end-percentage": value }),
    values: percentage,
    type: "percentage",
  },
  {
    name: "animate-range-start",
    property: (value) => ({ "--jumi-animation-range-start-name": value }),
    values: animationRange,
  },
  {
    name: "animate-range-start",
    property: (value) => ({ "--jumi-animation-range-start-percentage": value }),
    values: percentage,
    type: "percentage",
  },
  {
    name: "animate-timeline",
    property: (value) => ({ "--jumi-animation-timeline": value }),
    values: animationTimeline,
  },
  {
    name: "animate-timeline-axis",
    property: (value) => ({ "--jumi-animation-timeline-axis": value }),
    values: animationTimelineAxis,
  },
  {
    name: "animate-timeline-scroller",
    property: (value) => ({ "--jumi-animation-timeline-scroller": value }),
    values: animationTimelineScroller,
    type: "length",
  },
  {
    name: "animate-timeline-inset-start",
    property: (value) => ({ "--jumi-animation-timeline-inset-start": value }),
    values: animationTimelineInset,
    type: "length",
  },
  {
    name: "animate-timeline-inset-end",
    property: (value) => ({ "--jumi-animation-timeline-inset-end": value }),
    values: animationTimelineInset,
    type: "length",
  },
  {
    name: "animate-timing-function",
    property: (value) => ({ "--jumi-animation-timing-function": value }),
    values: animationTimingFunction,
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
