import type { Properties } from "csstype";
import type { AnimationKeyframes, PropertyKeyframes } from "@/types";

type Keyframes = Record<string, Properties<string | number>>;

export const propertyKeyframes: PropertyKeyframes = {
  "@keyframes jumi-align-content": {
    to: {
      "align-content": "var(--jumi-align-content)",
    },
  },
  "@keyframes jumi-align-items": {
    to: {
      "align-items": "var(--jumi-align-items)",
    },
  },
  "@keyframes jumi-align-self": {
    to: {
      "align-self": "var(--jumi-align-self)",
    },
  },
  "@keyframes jumi-alignment-baseline": {
    to: {
      "alignment-baseline": "var(--jumi-alignment-baseline)",
    },
  },
  "@keyframes jumi-width": {
    to: { width: "var(--jumi-width)" },
  },
  "@keyframes jumi-min-width": {
    to: { "min-width": "var(--jumi-min-width)" },
  },
  "@keyframes jumi-height": {
    to: { height: "var(--jumi-height)" },
  },
  "@keyframes jumi-border-radius": {
    to: { "border-radius": "var(--jumi-border-radius)" },
  },
  "@keyframes jumi-border-start-start-radius": {
    to: {
      "border-start-start-radius": "var(--jumi-border-start-start-radius)",
    },
  },
  "@keyframes jumi-border-start-end-radius": {
    to: { "border-start-end-radius": "var(--jumi-border-start-end-radius)" },
  },
  "@keyframes jumi-border-end-start-radius": {
    to: { "border-end-start-radius": "var(--jumi-border-end-start-radius)" },
  },
  "@keyframes jumi-border-end-end-radius": {
    to: { "border-end-end-radius": "var(--jumi-border-end-end-radius)" },
  },
  "@keyframes jumi-border-top-left-radius": {
    to: { "border-top-left-radius": "var(--jumi-border-top-left-radius)" },
  },
  "@keyframes jumi-border-top-right-radius": {
    to: { "border-top-right-radius": "var(--jumi-border-top-right-radius)" },
  },
  "@keyframes jumi-border-bottom-left-radius": {
    to: {
      "border-bottom-left-radius": "var(--jumi-border-bottom-left-radius)",
    },
  },
  "@keyframes jumi-border-bottom-right-radius": {
    to: {
      "border-bottom-right-radius": "var(--jumi-border-bottom-right-radius)",
    },
  },
  "@keyframes jumi-border-block-start-radius": {
    to: {
      "border-start-start-radius": "var(--jumi-border-start-start-radius)",
      "border-start-end-radius": "var(--jumi-border-start-end-radius)",
    },
  },
  "@keyframes jumi-border-block-end-radius": {
    to: {
      "border-end-start-radius": "var(--jumi-border-end-start-radius)",
      "border-end-end-radius": "var(--jumi-border-end-end-radius)",
    },
  },
  "@keyframes jumi-border-inline-start-radius": {
    to: {
      "border-start-start-radius": "var(--jumi-border-start-start-radius)",
      "border-end-start-radius": "var(--jumi-border-end-start-radius)",
    },
  },
  "@keyframes jumi-border-inline-end-radius": {
    to: {
      "border-start-end-radius": "var(--jumi-border-start-end-radius)",
      "border-end-end-radius": "var(--jumi-border-end-end-radius)",
    },
  },
  "@keyframes jumi-border-top-radius": {
    to: {
      "border-top-left-radius": "var(--jumi-border-top-left-radius)",
      "border-top-right-radius": "var(--jumi-border-top-right-radius)",
    },
  },
  "@keyframes jumi-border-bottom-radius": {
    to: {
      "border-bottom-left-radius": "var(--jumi-border-bottom-left-radius)",
      "border-bottom-right-radius": "var(--jumi-border-bottom-right-radius)",
    },
  },
  "@keyframes jumi-border-left-radius": {
    to: {
      "border-top-left-radius": "var(--jumi-border-top-left-radius)",
      "border-bottom-left-radius": "var(--jumi-border-bottom-left-radius)",
    },
  },
  "@keyframes jumi-border-right-radius": {
    to: {
      "border-top-right-radius": "var(--jumi-border-top-right-radius)",
      "border-bottom-right-radius": "var(--jumi-border-bottom-right-radius)",
    },
  },
  "@keyframes jumi-border-width": {
    to: { "border-width": "var(--jumi-border-width)" },
  },
  "@keyframes jumi-border-block-width": {
    to: {
      "border-block-start-width": "var(--jumi-border-block-start-width)",
      "border-block-end-width": "var(--jumi-border-block-end-width)",
    },
  },

  "@keyframes jumi-border-inline-width": {
    to: {
      "border-inline-start-width": "var(--jumi-border-inline-start-width)",
      "border-inline-end-width": "var(--jumi-border-inline-end-width)",
    },
  },
  "@keyframes jumi-border-block-start-width": {
    to: {
      "border-block-start-width": "var(--jumi-border-block-start-width)",
    },
  },
  "@keyframes jumi-border-block-end-width": {
    to: {
      "border-block-end-width": "var(--jumi-border-block-end-width)",
    },
  },
  "@keyframes jumi-border-inline-start-width": {
    to: {
      "border-inline-start-width": "var(--jumi-border-inline-start-width)",
    },
  },
  "@keyframes jumi-border-inline-end-width": {
    to: {
      "border-inline-end-width": "var(--jumi-border-inline-end-width)",
    },
  },
  "@keyframes jumi-border-top-width": {
    to: {
      "border-top-width": "var(--jumi-border-top-width)",
    },
  },
  "@keyframes jumi-border-bottom-width": {
    to: {
      "border-bottom-width": "var(--jumi-border-bottom-width)",
    },
  },
  "@keyframes jumi-border-left-width": {
    to: {
      "border-left-width": "var(--jumi-border-left-width)",
    },
  },
  "@keyframes jumi-border-right-width": {
    to: {
      "border-right-width": "var(--jumi-border-right-width)",
    },
  },
  "@keyframes jumi-border-top-length": {
    from: { width: "0%" },
    to: { width: "100%" },
  },
  "@keyframes jumi-border-bottom-length": {
    from: { width: "0%" },
    to: { width: "100%" },
  },
  "@keyframes jumi-border-left-length": {
    from: { height: "0%" },
    to: { height: "100%" },
  },
  "@keyframes jumi-border-right-length": {
    from: { height: "0%" },
    to: { height: "100%" },
  },
  "@keyframes jumi-shadow": {
    to: { "box-shadow": "var(--jumi-shadow)" },
  },
  "@keyframes jumi-opacity": {
    to: { opacity: "var(--jumi-opacity)" },
  },
  "@keyframes jumi-font-size": {
    to: { "font-size": "var(--jumi-font-size)" },
  },
  "@keyframes jumi-line-height": {
    to: { "line-height": "var(--jumi-line-height)" },
  },
  "@keyframes jumi-filter": {
    to: { filter: "var(--jumi-filter)" },
  },
  "@keyframes jumi-backdrop-filter": {
    to: { "backdrop-filter": "var(--jumi-backdrop-filter)" },
  },
  "@keyframes jumi-color": {
    to: { color: "var(--jumi-color)" },
  },
  "@keyframes jumi-background-color": {
    to: { "background-color": "var(--jumi-background-color)" },
  },
  "@keyframes jumi-border-color": {
    to: { "border-color": "var(--jumi-border-color)" },
  },
  "@keyframes jumi-margin": {
    to: { margin: "var(--jumi-margin)" },
  },
  "@keyframes jumi-margin-top": {
    to: { "margin-top": "var(--jumi-margin-top)" },
  },
  "@keyframes jumi-margin-right": {
    to: { "margin-right": "var(--jumi-margin-right)" },
  },
  "@keyframes jumi-margin-bottom": {
    to: { "margin-bottom": "var(--jumi-margin-bottom)" },
  },
  "@keyframes jumi-margin-left": {
    to: { "margin-left": "var(--jumi-margin-left)" },
  },
  "@keyframes jumi-margin-inline": {
    to: {
      "margin-left": "var(--jumi-margin-inline)",
      "margin-right": "var(--jumi-margin-inline)",
    },
  },
  "@keyframes jumi-margin-block": {
    to: {
      "margin-top": "var(--jumi-margin-block)",
      "margin-bottom": "var(--jumi-margin-block)",
    },
  },
  "@keyframes jumi-padding": {
    to: { padding: "var(--jumi-padding)" },
  },
  "@keyframes jumi-padding-top": {
    to: { "padding-top": "var(--jumi-padding-top)" },
  },
  "@keyframes jumi-padding-right": {
    to: { "padding-right": "var(--jumi-padding-right)" },
  },
  "@keyframes jumi-padding-bottom": {
    to: { "padding-bottom": "var(--jumi-padding-bottom)" },
  },
  "@keyframes jumi-padding-left": {
    to: { "padding-left": "var(--jumi-padding-left)" },
  },
  "@keyframes jumi-padding-inline": {
    to: {
      "padding-left": "var(--jumi-padding-inline)",
      "padding-right": "var(--jumi-padding-inline)",
    },
  },
  "@keyframes jumi-padding-block": {
    to: {
      "padding-top": "var(--jumi-padding-block)",
      "padding-bottom": "var(--jumi-padding-block)",
    },
  },
  "@keyframes jumi-top": {
    to: { top: "var(--jumi-top)" },
  },
  "@keyframes jumi-right": {
    to: { right: "var(--jumi-right)" },
  },
  "@keyframes jumi-bottom": {
    to: { bottom: "var(--jumi-bottom)" },
  },
  "@keyframes jumi-left": {
    to: { left: "var(--jumi-left)" },
  },
  "@keyframes jumi-z-index": {
    to: { "z-index": "var(--jumi-z-index)" },
  },
  "@keyframes jumi-font-weight": {
    to: { "font-weight": "var(--jumi-font-weight)" },
  },
  "@keyframes jumi-letter-spacing": {
    to: { "letter-spacing": "var(--jumi-letter-spacing)" },
  },
  "@keyframes jumi-text-shadow": {
    to: { "text-shadow": "var(--jumi-text-shadow)" },
  },
  "@keyframes jumi-flex-grow": {
    to: { "flex-grow": "var(--jumi-flex-grow)" },
  },
  "@keyframes jumi-flex-shrink": {
    to: { "flex-shrink": "var(--jumi-flex-shrink)" },
  },
  "@keyframes jumi-flex-basis": {
    to: { "flex-basis": "var(--jumi-flex-basis)" },
  },
  "@keyframes jumi-gap": {
    to: { gap: "var(--jumi-gap)" },
  },
  "@keyframes jumi-order": {
    to: { order: "var(--jumi-order)" },
  },
  "@keyframes jumi-outline-width": {
    to: { "outline-width": "var(--jumi-outline-width)" },
  },
  "@keyframes jumi-outline-color": {
    to: { "outline-color": "var(--jumi-outline-color)" },
  },
  "@keyframes jumi-outline-offset": {
    to: { "outline-offset": "var(--jumi-outline-offset)" },
  },
  "@keyframes jumi-background-size": {
    to: { "background-size": "var(--jumi-background-size)" },
  },
  "@keyframes jumi-background-position": {
    to: { "background-position": "var(--jumi-background-position)" },
  },
};

/**
 * Keyframe definitions for animation effects
 * Based on the existing Sass keyframes but optimized for TailwindCSS
 */
export const keyframes: AnimationKeyframes = {
  // Bounce effects
  "@keyframes bounce-in": {
    "from, 20%, 40%, 60%, 80%, to": {
      animationTimingFunction: "cubic-bezier(0.215, 0.61, 0.355, 1)",
    },
    "0%": {
      transform: "scale3d(0.3, 0.3, 0.3)",
    },
    "20%": {
      transform: "scale3d(1.1, 1.1, 1.1)",
    },
    "40%": {
      transform: "scale3d(0.9, 0.9, 0.9)",
    },
    "60%": {
      transform: "scale3d(1.03, 1.03, 1.03)",
    },
    "80%": {
      transform: "scale3d(0.97, 0.97, 0.97)",
    },
    to: {
      transform: "scale3d(1, 1, 1)",
    },
  },

  "@keyframes bounce-out": {
    "20%": {
      transform: "scale3d(0.9, 0.9, 0.9)",
    },
    "50%, 55%": {
      transform: "scale3d(1.1, 1.1, 1.1)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3)",
    },
  },

  // Fade effects
  "@keyframes fade-in": {
    from: {
      opacity: "0",
    },
    to: {
      opacity: "1",
    },
  },

  "@keyframes fade-out": {
    from: {
      opacity: "1",
    },
    to: {
      opacity: "0",
    },
  },

  "@keyframes fade-up": {
    from: {
      opacity: "0",
      transform: "translate3d(0, 40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes fade-down": {
    from: {
      opacity: "0",
      transform: "translate3d(0, -40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes fade-left": {
    from: {
      opacity: "0",
      transform: "translate3d(-40px, 0, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes fade-right": {
    from: {
      opacity: "0",
      transform: "translate3d(40px, 0, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes fade-up-right": {
    from: {
      opacity: "0",
      transform: "translate3d(40px, 40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes fade-up-left": {
    from: {
      opacity: "0",
      transform: "translate3d(-40px, 40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes fade-down-right": {
    from: {
      opacity: "0",
      transform: "translate3d(40px, -40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes fade-down-left": {
    from: {
      opacity: "0",
      transform: "translate3d(-40px, -40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  // Slide effects
  "@keyframes slide-in-up": {
    from: {
      transform: "translate3d(0, 100%, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes slide-in-down": {
    from: {
      transform: "translate3d(0, -100%, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes slide-in-left": {
    from: {
      transform: "translate3d(-100%, 0, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes slide-in-right": {
    from: {
      transform: "translate3d(100%, 0, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  // Zoom effects
  "@keyframes zoom-in": {
    from: {
      transform: "scale3d(0.3, 0.3, 0.3)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05)",
    },
    to: {
      transform: "scale3d(1, 1, 1)",
    },
  },

  "@keyframes zoom-in-up": {
    from: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(0, 100%, 0)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05) translate3d(0, -60%, 0)",
    },
    to: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
  },

  "@keyframes zoom-in-down": {
    from: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(0, -100%, 0)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05) translate3d(0, 60%, 0)",
    },
    to: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
  },

  "@keyframes zoom-in-left": {
    from: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(-100%, 0, 0)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05) translate3d(60%, 0, 0)",
    },
    to: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
  },

  "@keyframes zoom-in-right": {
    from: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(100%, 0, 0)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05) translate3d(-60%, 0, 0)",
    },
    to: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
  },

  "@keyframes zoom-out": {
    from: {
      transform: "scale3d(1, 1, 1)",
    },
    "50%": {
      transform: "scale3d(0.95, 0.95, 0.95)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3)",
    },
  },

  "@keyframes zoom-out-up": {
    from: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
    "50%": {
      transform: "scale3d(0.95, 0.95, 0.95) translate3d(0, -60%, 0)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(0, -100%, 0)",
    },
  },

  "@keyframes zoom-out-down": {
    from: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
    "50%": {
      transform: "scale3d(0.95, 0.95, 0.95) translate3d(0, 60%, 0)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(0, 100%, 0)",
    },
  },

  "@keyframes zoom-out-left": {
    from: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
    "50%": {
      transform: "scale3d(0.95, 0.95, 0.95) translate3d(-60%, 0, 0)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(-100%, 0, 0)",
    },
  },

  "@keyframes zoom-out-right": {
    from: {
      transform: "scale3d(1, 1, 1) translate3d(0, 0, 0)",
    },
    "50%": {
      transform: "scale3d(0.95, 0.95, 0.95) translate3d(60%, 0, 0)",
    },
    to: {
      transform: "scale3d(0.3, 0.3, 0.3) translate3d(100%, 0, 0)",
    },
  },

  // Flip effects
  "@keyframes flip-x": {
    from: {
      transform: "perspective(400px) rotateX(-90deg)",
      animationTimingFunction: "ease-in",
    },
    "40%": {
      transform: "perspective(400px) rotateX(-20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateX(10deg)",
    },
    "80%": {
      transform: "perspective(400px) rotateX(-5deg)",
    },
    to: {
      transform: "perspective(400px) rotateX(0deg)",
    },
  },

  "@keyframes flip-y": {
    from: {
      transform: "perspective(400px) rotateY(-90deg)",
      animationTimingFunction: "ease-in",
    },
    "40%": {
      transform: "perspective(400px) rotateY(-20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateY(10deg)",
    },
    "80%": {
      transform: "perspective(400px) rotateY(-5deg)",
    },
    to: {
      transform: "perspective(400px) rotateY(0deg)",
    },
  },

  "@keyframes flip-up": {
    from: {
      transform: "perspective(400px) rotateX(90deg)",
      animationTimingFunction: "ease-in",
      opacity: "0",
    },
    "40%": {
      transform: "perspective(400px) rotateX(-20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateX(10deg)",
      opacity: "1",
    },
    "80%": {
      transform: "perspective(400px) rotateX(-5deg)",
    },
    to: {
      transform: "perspective(400px)",
    },
  },

  "@keyframes flip-down": {
    from: {
      transform: "perspective(400px) rotateX(-90deg)",
      animationTimingFunction: "ease-in",
      opacity: "0",
    },
    "40%": {
      transform: "perspective(400px) rotateX(20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateX(-10deg)",
      opacity: "1",
    },
    "80%": {
      transform: "perspective(400px) rotateX(5deg)",
    },
    to: {
      transform: "perspective(400px)",
    },
  },

  "@keyframes flip-left": {
    from: {
      transform: "perspective(400px) rotateY(-90deg)",
      animationTimingFunction: "ease-in",
      opacity: "0",
    },
    "40%": {
      transform: "perspective(400px) rotateY(20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateY(-10deg)",
      opacity: "1",
    },
    "80%": {
      transform: "perspective(400px) rotateY(5deg)",
    },
    to: {
      transform: "perspective(400px)",
    },
  },

  "@keyframes flip-right": {
    from: {
      transform: "perspective(400px) rotateY(90deg)",
      animationTimingFunction: "ease-in",
      opacity: "0",
    },
    "40%": {
      transform: "perspective(400px) rotateY(-20deg)",
      animationTimingFunction: "ease-in",
    },
    "60%": {
      transform: "perspective(400px) rotateY(10deg)",
      opacity: "1",
    },
    "80%": {
      transform: "perspective(400px) rotateY(-5deg)",
    },
    to: {
      transform: "perspective(400px)",
    },
  },

  // Special effects
  "@keyframes shake": {
    "from, to": {
      transform: "translate3d(0, 0, 0)",
    },
    "10%, 30%, 50%, 70%, 90%": {
      transform: "translate3d(-10px, 0, 0)",
    },
    "20%, 40%, 60%, 80%": {
      transform: "translate3d(10px, 0, 0)",
    },
  },

  "@keyframes pulse": {
    from: {
      transform: "scale3d(1, 1, 1)",
    },
    "50%": {
      transform: "scale3d(1.05, 1.05, 1.05)",
    },
    to: {
      transform: "scale3d(1, 1, 1)",
    },
  },

  "@keyframes swing": {
    "20%": {
      transform: "rotateZ(15deg)",
    },
    "40%": {
      transform: "rotateZ(-10deg)",
    },
    "60%": {
      transform: "rotateZ(5deg)",
    },
    "80%": {
      transform: "rotateZ(-5deg)",
    },
    to: {
      transform: "rotateZ(0deg)",
    },
  },

  "@keyframes wobble": {
    from: {
      transform: "translate3d(0, 0, 0)",
    },
    "15%": {
      transform: "translate3d(-25%, 0, 0) rotateZ(-5deg)",
    },
    "30%": {
      transform: "translate3d(20%, 0, 0) rotateZ(3deg)",
    },
    "45%": {
      transform: "translate3d(-15%, 0, 0) rotateZ(-3deg)",
    },
    "60%": {
      transform: "translate3d(10%, 0, 0) rotateZ(2deg)",
    },
    "75%": {
      transform: "translate3d(-5%, 0, 0) rotateZ(-1deg)",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  "@keyframes tada": {
    from: {
      transform: "scale3d(1, 1, 1)",
    },
    "10%, 20%": {
      transform: "scale3d(0.9, 0.9, 0.9) rotateZ(-3deg)",
    },
    "30%, 50%, 70%, 90%": {
      transform: "scale3d(1.1, 1.1, 1.1) rotateZ(3deg)",
    },
    "40%, 60%, 80%": {
      transform: "scale3d(0.9, 0.9, 0.9) rotateZ(-3deg)",
    },
    to: {
      transform: "scale3d(1, 1, 1)",
    },
  },

  "@keyframes jello": {
    from: {
      transform: "none",
    },
    "11.1%": {
      transform: "skewX(-12.5deg) skewY(-12.5deg)",
    },
    "22.2%": {
      transform: "skewX(6.25deg) skewY(6.25deg)",
    },
    "33.3%": {
      transform: "skewX(-3.125deg) skewY(-3.125deg)",
    },
    "44.4%": {
      transform: "skewX(1.5625deg) skewY(1.5625deg)",
    },
    "55.5%": {
      transform: "skewX(-0.78125deg) skewY(-0.78125deg)",
    },
    "66.6%": {
      transform: "skewX(0.390625deg) skewY(0.390625deg)",
    },
    "77.7%": {
      transform: "skewX(-0.1953125deg) skewY(-0.1953125deg)",
    },
    "88.8%": {
      transform: "skewX(0.09765625deg) skewY(0.09765625deg)",
    },
    to: {
      transform: "none",
    },
  },

  "@keyframes heart-beat": {
    from: {
      transform: "scale3d(1, 1, 1)",
    },
    "14%": {
      transform: "scale3d(1.3, 1.3, 1.3)",
    },
    "28%": {
      transform: "scale3d(1, 1, 1)",
    },
    "42%": {
      transform: "scale3d(1.3, 1.3, 1.3)",
    },
    "70%": {
      transform: "scale3d(1, 1, 1)",
    },
  },

  "@keyframes back-in-left": {
    "0%": {
      transform: "scale(0) translateX(-2000px) rotateZ(-360deg)",
    },
    "100%": {
      transform: "scale(1) translateX(0) rotateZ(0deg)",
    },
  },

  "@keyframes back-in-right": {
    "0%": {
      transform: "scale(0) translateX(2000px) rotateZ(360deg)",
    },
    "100%": {
      transform: "scale(1) translateX(0) rotateZ(0deg)",
    },
  },

  "@keyframes back-in-down": {
    "0%": {
      transform: "scale(0) translateY(-2000px) rotateZ(-360deg)",
    },
    "100%": {
      transform: "scale(1) translateY(0) rotateZ(0deg)",
    },
  },

  "@keyframes back-in-up": {
    "0%": {
      transform: "scale(0) translateY(2000px) rotateZ(360deg)",
    },
    "100%": {
      transform: "scale(1) translateY(0) rotateZ(0deg)",
    },
  },

  "@keyframes back-in": {
    "0%": {
      transform: "scale(0) rotateZ(-360deg)",
    },
    "100%": {
      transform: "scale(1) rotateZ(0deg)",
    },
  },

  "@keyframes back-out-left": {
    "0%": {
      transform: "scale(1) translateX(0) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) translateX(-2000px) rotateZ(-360deg)",
    },
  },

  "@keyframes back-out-right": {
    "0%": {
      transform: "scale(1) translateX(0) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) translateX(2000px) rotateZ(360deg)",
    },
  },

  "@keyframes back-out-down": {
    "0%": {
      transform: "scale(1) translateY(0) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) translateY(2000px) rotateZ(360deg)",
    },
  },

  "@keyframes back-out-up": {
    "0%": {
      transform: "scale(1) translateY(0) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) translateY(-2000px) rotateZ(-360deg)",
    },
  },

  "@keyframes back-out": {
    "0%": {
      transform: "scale(1) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) rotateZ(360deg)",
    },
  },
};
