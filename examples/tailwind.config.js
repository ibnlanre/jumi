import jumiPlugin from '../dist/index.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./tests/**/*.{html,js}'],
  plugins: [jumiPlugin],
}
