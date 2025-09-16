const jumiPlugin = require("../dist/index.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./tests/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [jumiPlugin],
};
