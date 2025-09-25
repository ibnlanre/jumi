import type { Config } from 'tailwindcss'

import jumi from './dist/index.js'

const config = {
  content: [
    './stories/**/*.{js,jsx,ts,tsx}',
    './.storybook/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [
    jumi,
  ],
} satisfies Config

export default config as Config
