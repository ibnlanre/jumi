import { defineConfig, Options } from "tsup";

const esm: Options = {
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  entry: ["src/index.ts"],
  outDir: "dist/esm",
  external: ["react"],
};

const cjs: Options = {
  format: ["cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  entry: ["src/index.ts"],
  outDir: "dist/cjs",
  external: ["react"],
};

export default defineConfig([esm, cjs]);
