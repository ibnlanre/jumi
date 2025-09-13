import { Options } from "tsup";

export default {
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  external: ["tailwindcss"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"',
    };
  },
} satisfies Options;
