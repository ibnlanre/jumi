import type { Options } from 'tsup'

const options: Options = {
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/postcss.ts', 'src/vite.ts'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    }
  },
  external: ['@tailwindcss/postcss', '@tailwindcss/vite', 'postcss', 'tailwindcss', 'vite'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  splitting: false,
}

export default options
