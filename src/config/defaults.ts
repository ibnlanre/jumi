import { JumiTheme } from "../types";
import { easings } from "./easings";
import { getAllKeyframes, keyframes } from "./keyframes";

/**
 * Default theme configuration for Jumi animations
 * This provides the base values that users can override
 */

export const defaultTheme: JumiTheme = {
  // Animation durations in milliseconds and seconds
  durations: {
    // Milliseconds (for quick micro-interactions)
    "25": "25ms",
    "50": "50ms",
    "75": "75ms",
    "100": "100ms",
    "150": "150ms",
    "200": "200ms",
    "300": "300ms",
    "400": "400ms",
    "500": "500ms",
    "600": "600ms",
    "700": "700ms",
    "800": "800ms",
    "900": "900ms",

    // Seconds (for longer animations)
    "1": "1s",
    "1.5": "1.5s",
    "2": "2s",
    "2.5": "2.5s",
    "3": "3s",
    "4": "4s",
    "5": "5s",
    "6": "6s",
    "7": "7s",
    "8": "8s",
    "9": "9s",
    "10": "10s",
  },

  // Animation delays
  delays: {
    "0": "0s",
    "25": "25ms",
    "50": "50ms",
    "75": "75ms",
    "100": "100ms",
    "150": "150ms",
    "200": "200ms",
    "300": "300ms",
    "400": "400ms",
    "500": "500ms",
    "600": "600ms",
    "700": "700ms",
    "800": "800ms",
    "900": "900ms",
    "1": "1s",
    "1.5": "1.5s",
    "2": "2s",
    "2.5": "2.5s",
    "3": "3s",
    "4": "4s",
    "5": "5s",
  },

  // Easing functions
  timingFunctions: easings,

  // Animation directions
  directions: {
    normal: "normal",
    reverse: "reverse",
    alternate: "alternate",
    "alternate-reverse": "alternate-reverse",
  },

  // Animation iteration counts
  iterationCounts: {
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "10": "10",
    infinite: "infinite",
  },

  // Animation fill modes
  fillModes: {
    none: "none",
    forwards: "forwards",
    backwards: "backwards",
    both: "both",
  },

  // Animation play states
  playStates: {
    running: "running",
    paused: "paused",
  },

  // Opacity values for effects
  opacity: {
    "0": "0",
    "5": "0.05",
    "10": "0.1",
    "20": "0.2",
    "25": "0.25",
    "30": "0.3",
    "40": "0.4",
    "50": "0.5",
    "60": "0.6",
    "70": "0.7",
    "75": "0.75",
    "80": "0.8",
    "90": "0.9",
    "95": "0.95",
    "100": "1",
  },

  // Blur values for effects
  blur: {
    "0": "0",
    sm: "4px",
    DEFAULT: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "40px",
    "3xl": "64px",
  },

  // Size values for width/height animations
  sizes: {
    "0": "0px",
    auto: "auto",
    full: "100%",
    screen: "100vw",
    min: "min-content",
    max: "max-content",
    fit: "fit-content",
  },

  // Border radius values
  borderRadius: {
    none: "0px",
    sm: "0.125rem",
    DEFAULT: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },

  // Border width values
  borderWidths: {
    "0": "0px",
    DEFAULT: "1px",
    "2": "2px",
    "4": "4px",
    "8": "8px",
  },

  // Box shadow values
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    none: "0 0 #0000",
  },

  // Font size values
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem",
  },

  // Line height values
  lineHeights: {
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "7": "1.75rem",
    "8": "2rem",
    "9": "2.25rem",
    "10": "2.5rem",
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },

  // Filter values
  filters: {
    "blur-none": "blur(0)",
    "blur-sm": "blur(4px)",
    blur: "blur(8px)",
    "blur-md": "blur(12px)",
    "blur-lg": "blur(16px)",
    "blur-xl": "blur(24px)",
    "blur-2xl": "blur(40px)",
    "blur-3xl": "blur(64px)",
    "brightness-0": "brightness(0)",
    "brightness-50": "brightness(.5)",
    "brightness-75": "brightness(.75)",
    "brightness-90": "brightness(.9)",
    "brightness-95": "brightness(.95)",
    "brightness-100": "brightness(1)",
    "brightness-105": "brightness(1.05)",
    "brightness-110": "brightness(1.1)",
    "brightness-125": "brightness(1.25)",
    "brightness-150": "brightness(1.5)",
    "brightness-200": "brightness(2)",
  },

  // Backdrop filter values
  backdrops: {
    "backdrop-blur-none": "blur(0)",
    "backdrop-blur-sm": "blur(4px)",
    "backdrop-blur": "blur(8px)",
    "backdrop-blur-md": "blur(12px)",
    "backdrop-blur-lg": "blur(16px)",
    "backdrop-blur-xl": "blur(24px)",
    "backdrop-blur-2xl": "blur(40px)",
    "backdrop-blur-3xl": "blur(64px)",
  },

  // Transform origin values
  origins: {
    center: "center",
    top: "top",
    "top-right": "top right",
    right: "right",
    "bottom-right": "bottom right",
    bottom: "bottom",
    "bottom-left": "bottom left",
    left: "left",
    "top-left": "top left",
  },

  // Transform distances (percentage-based like original)
  distances: {
    "1": "5%",
    "2": "10%",
    "3": "15%",
    "4": "20%",
    "5": "25%",
    "6": "30%",
    "7": "35%",
    "8": "40%",
    "9": "45%",
    "10": "50%",
    "11": "55%",
    "12": "60%",
    "13": "65%",
    "14": "70%",
    "15": "75%",
    "16": "80%",
    "17": "85%",
    "18": "90%",
    "19": "95%",
    "20": "100%",

    // Additional common values
    full: "100%",
    screen: "100vh",
    px: "1px",
    "0.5": "2.5%",
    "1.5": "7.5%",
    "2.5": "12.5%",
  },

  // Rotation values in degrees
  rotations: {
    "1": "18deg", // 360/20
    "2": "36deg",
    "3": "54deg",
    "4": "72deg",
    "5": "90deg",
    "6": "108deg",
    "7": "126deg",
    "8": "144deg",
    "9": "162deg",
    "10": "180deg",
    "11": "198deg",
    "12": "216deg",
    "13": "234deg",
    "14": "252deg",
    "15": "270deg",
    "16": "288deg",
    "17": "306deg",
    "18": "324deg",
    "19": "342deg",
    "20": "360deg",

    // Common rotation values
    "45": "45deg",
    "90": "90deg",
    "180": "180deg",
    "270": "270deg",
    "360": "360deg",
    "-45": "-45deg",
    "-90": "-90deg",
    "-180": "-180deg",
  },

  // Scale values
  scales: {
    "0": "0",
    "25": "0.25",
    "50": "0.5",
    "75": "0.75",
    "90": "0.9",
    "95": "0.95",
    "100": "1",
    "105": "1.05",
    "110": "1.1",
    "125": "1.25",
    "150": "1.5",
    "200": "2",
    "300": "3",
    "400": "4",
    "500": "5",
  },

  // Perspective values for 3D transforms
  perspectives: {
    "1": "100px",
    "2": "200px",
    "3": "300px",
    "4": "400px",
    "5": "500px",
    "6": "600px",
    "7": "700px",
    "8": "800px",
    "9": "900px",
    "10": "1000px",
    "15": "1500px",
    "20": "2000px",
    none: "none",
  },

  properties: {
    name: "name",
    duration: "duration",
    delay: "delay",
    "timing-function": "timing-function",
    direction: "direction",
    "iteration-count": "iteration-count",
    "fill-mode": "fill-mode",
    "play-state": "play-state",
    composition: "composition",
  },

  // Animation effects (predefined keyframes)
  effects: getAllKeyframes(),
};
