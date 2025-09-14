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
    }),
  ],
};
