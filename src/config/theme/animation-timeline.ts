import {
  animationTimelineView,
  animationTimelineScroll,
} from "@/composition/animation-timeline";

export const animationTimeline = {
  auto: "auto",
  scroll: "scroll(" + animationTimelineScroll + ")",
  view: "view(" + animationTimelineView + ")",
  none: "none",
};
