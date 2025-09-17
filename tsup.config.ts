import type { Options } from 'tsup'

const options: Options = {
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    }
  },
  external: ['tailwindcss'],
  format: ['cjs', 'esm'],
  sourcemap: true,
  splitting: false,
}

export default options
