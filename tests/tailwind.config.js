/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./tests/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("../dist/index.js")({
      // Plugin options
      enableHover: true,
      enableGroup: true,
      enableDark: false,
      theme: {
        // Custom theme overrides
        durations: {
          "ultra-fast": "50ms",
          "super-slow": "5s",
        },
        distances: {
          huge: "200%",
        },
      },
    }),
  ],
};
