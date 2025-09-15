import type { Properties } from "csstype";
import { animationName } from "./animation-name";
import type { AnimationKeyframes } from "@/types";

type AnimationName = keyof typeof animationName;
type Keyframes = Record<string, Properties<string | number>>;

export const propertyKeyframes: Array<AnimationKeyframes> = [
  {
    name: "width",
    keyframes: {
      to: { width: "var(--jumi-width)" },
    },
  },
  {
    name: "height",
    keyframes: {
      to: { height: "var(--jumi-height)" },
    },
  },
  {
    name: "border-radius",
    keyframes: {
      to: { "border-radius": "var(--jumi-border-radius)" },
    },
  },
  {
    name: "border-start-start-radius",
    keyframes: {
      to: {
        "border-start-start-radius": "var(--jumi-border-start-start-radius)",
      },
    },
  },
  {
    name: "border-start-end-radius",
    keyframes: {
      to: { "border-start-end-radius": "var(--jumi-border-start-end-radius)" },
    },
  },
  {
    name: "border-end-start-radius",
    keyframes: {
      to: { "border-end-start-radius": "var(--jumi-border-end-start-radius)" },
    },
  },
  {
    name: "border-end-end-radius",
    keyframes: {
      to: { "border-end-end-radius": "var(--jumi-border-end-end-radius)" },
    },
  },
  {
    name: "border-top-left-radius",
    keyframes: {
      to: { "border-top-left-radius": "var(--jumi-border-top-left-radius)" },
    },
  },
  {
    name: "border-top-right-radius",
    keyframes: {
      to: { "border-top-right-radius": "var(--jumi-border-top-right-radius)" },
    },
  },
  {
    name: "border-bottom-left-radius",
    keyframes: {
      to: {
        "border-bottom-left-radius": "var(--jumi-border-bottom-left-radius)",
      },
    },
  },
];

let x = {
  "@keyframes jumi-border-width": {
    to: { "border-width": "var(--jumi-border-width)" },
  },

  // Border reveal keyframes - animated border drawing effects
  "@keyframes jumi-border-reveal-top": {
    "0%": { width: "0%" },
    "100%": { width: "100%" },
  },
  "@keyframes jumi-border-reveal-right": {
    "0%": { height: "0%" },
    "100%": { height: "100%" },
  },
  "@keyframes jumi-border-reveal-bottom": {
    "0%": { width: "0%" },
    "100%": { width: "100%" },
  },
  "@keyframes jumi-border-reveal-left": {
    "0%": { height: "0%" },
    "100%": { height: "100%" },
  },
  "@keyframes jumi-shadow": {
    to: { "box-shadow": "var(--jumi-shadow)" },
  },
  "@keyframes jumi-opacity": {
    to: { opacity: "var(--jumi-opacity)" },
  },

  // Typography
  "@keyframes jumi-font-size": {
    to: { "font-size": "var(--jumi-font-size)" },
  },
  "@keyframes jumi-line-height": {
    to: { "line-height": "var(--jumi-line-height)" },
  },

  // Advanced visual effects
  "@keyframes jumi-filter": {
    to: { filter: "var(--jumi-filter)" },
  },
  "@keyframes jumi-backdrop-filter": {
    to: { "backdrop-filter": "var(--jumi-backdrop-filter)" },
  },

  // Color animations
  "@keyframes jumi-color": {
    to: { color: "var(--jumi-color)" },
  },
  "@keyframes jumi-fill": {
    to: { fill: "var(--jumi-fill)" },
  },
  "@keyframes jumi-bg-color": {
    to: { "background-color": "var(--jumi-bg-color)" },
  },
  "@keyframes jumi-border-color": {
    to: { "border-color": "var(--jumi-border-color)" },
  },

  // Margin keyframes
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
  "@keyframes jumi-margin-x": {
    to: {
      "margin-left": "var(--jumi-margin-x)",
      "margin-right": "var(--jumi-margin-x)",
    },
  },
  "@keyframes jumi-margin-y": {
    to: {
      "margin-top": "var(--jumi-margin-y)",
      "margin-bottom": "var(--jumi-margin-y)",
    },
  },

  // Padding keyframes
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
  "@keyframes jumi-padding-x": {
    to: {
      "padding-left": "var(--jumi-padding-x)",
      "padding-right": "var(--jumi-padding-x)",
    },
  },
  "@keyframes jumi-padding-y": {
    to: {
      "padding-top": "var(--jumi-padding-y)",
      "padding-bottom": "var(--jumi-padding-y)",
    },
  },

  // Min/Max dimension keyframes
  "@keyframes jumi-min-width": {
    to: { "min-width": "var(--jumi-min-width)" },
  },
  "@keyframes jumi-max-width": {
    to: { "max-width": "var(--jumi-max-width)" },
  },
  "@keyframes jumi-min-height": {
    to: { "min-height": "var(--jumi-min-height)" },
  },
  "@keyframes jumi-max-height": {
    to: { "max-height": "var(--jumi-max-height)" },
  },

  // Positioning keyframes
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

  // Typography keyframes
  "@keyframes jumi-font-weight": {
    to: { "font-weight": "var(--jumi-font-weight)" },
  },
  "@keyframes jumi-letter-spacing": {
    to: { "letter-spacing": "var(--jumi-letter-spacing)" },
  },
  "@keyframes jumi-text-shadow": {
    to: { "text-shadow": "var(--jumi-text-shadow)" },
  },

  // Flexbox keyframes
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

  // Outline keyframes
  "@keyframes jumi-outline-width": {
    to: { "outline-width": "var(--jumi-outline-width)" },
  },
  "@keyframes jumi-outline-color": {
    to: { "outline-color": "var(--jumi-outline-color)" },
  },
  "@keyframes jumi-outline-offset": {
    to: { "outline-offset": "var(--jumi-outline-offset)" },
  },

  // Background keyframes
  "@keyframes jumi-bg-size": {
    to: { "background-size": "var(--jumi-bg-size)" },
  },
  "@keyframes jumi-bg-position": {
    to: { "background-position": "var(--jumi-bg-position)" },
  },

  // SVG keyframes
  "@keyframes jumi-stroke": {
    to: { stroke: "var(--jumi-stroke)" },
  },
  "@keyframes jumi-stroke-width": {
    to: { "stroke-width": "var(--jumi-stroke-width)" },
  },
};

export const animationKeyframes: Array<AnimationKeyframes> = [];

/**
 * Keyframe definitions for animation effects
 * Based on the existing Sass keyframes but optimized for TailwindCSS
 */
export const keyframes: Record<AnimationName, Keyframes> = {
  // Bounce effects
  "bounce-in": {
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

  "bounce-out": {
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
  "fade-in": {
    from: {
      opacity: "0",
    },
    to: {
      opacity: "1",
    },
  },

  "fade-out": {
    from: {
      opacity: "1",
    },
    to: {
      opacity: "0",
    },
  },

  "fade-up": {
    from: {
      opacity: "0",
      transform: "translate3d(0, 40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-down": {
    from: {
      opacity: "0",
      transform: "translate3d(0, -40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-left": {
    from: {
      opacity: "0",
      transform: "translate3d(-40px, 0, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-right": {
    from: {
      opacity: "0",
      transform: "translate3d(40px, 0, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-up-right": {
    from: {
      opacity: "0",
      transform: "translate3d(40px, 40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-up-left": {
    from: {
      opacity: "0",
      transform: "translate3d(-40px, 40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-down-right": {
    from: {
      opacity: "0",
      transform: "translate3d(40px, -40px, 0)",
    },
    to: {
      opacity: "1",
      transform: "translate3d(0, 0, 0)",
    },
  },

  "fade-down-left": {
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
  "slide-in-up": {
    from: {
      transform: "translate3d(0, 100%, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  "slide-in-down": {
    from: {
      transform: "translate3d(0, -100%, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  "slide-in-left": {
    from: {
      transform: "translate3d(-100%, 0, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  "slide-in-right": {
    from: {
      transform: "translate3d(100%, 0, 0)",
      visibility: "visible",
    },
    to: {
      transform: "translate3d(0, 0, 0)",
    },
  },

  // Zoom effects
  "zoom-in": {
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

  "zoom-in-up": {
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

  "zoom-in-down": {
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

  "zoom-in-left": {
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

  "zoom-in-right": {
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

  "zoom-out": {
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

  "zoom-out-up": {
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

  "zoom-out-down": {
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

  "zoom-out-left": {
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

  "zoom-out-right": {
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
  "flip-x": {
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

  "flip-y": {
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

  "flip-up": {
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

  "flip-down": {
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

  "flip-left": {
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

  "flip-right": {
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
  shake: {
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

  pulse: {
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

  swing: {
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

  wobble: {
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

  tada: {
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

  jello: {
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

  "heart-beat": {
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

  "back-in-left": {
    "0%": {
      transform: "scale(0) translateX(-2000px) rotateZ(-360deg)",
    },
    "100%": {
      transform: "scale(1) translateX(0) rotateZ(0deg)",
    },
  },

  "back-in-right": {
    "0%": {
      transform: "scale(0) translateX(2000px) rotateZ(360deg)",
    },
    "100%": {
      transform: "scale(1) translateX(0) rotateZ(0deg)",
    },
  },

  "back-in-down": {
    "0%": {
      transform: "scale(0) translateY(-2000px) rotateZ(-360deg)",
    },
    "100%": {
      transform: "scale(1) translateY(0) rotateZ(0deg)",
    },
  },

  "back-in-up": {
    "0%": {
      transform: "scale(0) translateY(2000px) rotateZ(360deg)",
    },
    "100%": {
      transform: "scale(1) translateY(0) rotateZ(0deg)",
    },
  },

  "back-in": {
    "0%": {
      transform: "scale(0) rotateZ(-360deg)",
    },
    "100%": {
      transform: "scale(1) rotateZ(0deg)",
    },
  },

  "back-out-left": {
    "0%": {
      transform: "scale(1) translateX(0) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) translateX(-2000px) rotateZ(-360deg)",
    },
  },

  "back-out-right": {
    "0%": {
      transform: "scale(1) translateX(0) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) translateX(2000px) rotateZ(360deg)",
    },
  },

  "back-out-down": {
    "0%": {
      transform: "scale(1) translateY(0) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) translateY(2000px) rotateZ(360deg)",
    },
  },

  "back-out-up": {
    "0%": {
      transform: "scale(1) translateY(0) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) translateY(-2000px) rotateZ(-360deg)",
    },
  },

  "back-out": {
    "0%": {
      transform: "scale(1) rotateZ(0deg)",
    },
    "100%": {
      transform: "scale(0) rotateZ(360deg)",
    },
  },
};

/**
 * Helper function to get all keyframe names
 */
export function getAllKeyframes() {
  return Object.fromEntries(Object.keys(keyframes).map((key) => [key, key]));
}

/**
 * Helper function to get keyframes as CSS-in-JS format
 */
export function getKeyframesAsCSS(): Record<string, Record<string, any>> {
  return Object.fromEntries(
    Object.entries(keyframes).map(([name, keyframes]) => [
      `@keyframes ${name}`,
      keyframes,
    ])
  );
}
