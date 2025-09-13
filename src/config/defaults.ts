import { JumiTheme } from "../types";
import { getAllEasings } from "./easings";

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
  easings: getAllEasings(),

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

  // Predefined effect animations
  effects: {
    "bounce-in": "bounce-in",
    "bounce-out": "bounce-out",
    "fade-in": "fade-in",
    "fade-out": "fade-out",
    "slide-in-up": "slide-in-up",
    "slide-in-down": "slide-in-down",
    "slide-in-left": "slide-in-left",
    "slide-in-right": "slide-in-right",
    "zoom-in": "zoom-in",
    "zoom-out": "zoom-out",
    "flip-x": "flip-x",
    "flip-y": "flip-y",
    shake: "shake",
    pulse: "pulse",
    swing: "swing",
    wobble: "wobble",
  },
};
