import { defineConfig } from "tsup";

export default defineConfig({
  outDir: "cjs",
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  legacyOutput: true,
});
