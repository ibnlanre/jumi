import jumiPlugin from '../dist/index.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./examples/**/*.{html,js}'],
  plugins: [jumiPlugin],
}
