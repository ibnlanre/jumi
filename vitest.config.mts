import tsconfigPaths from "vite-tsconfig-paths";

import { defineConfig, defaultExclude } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      clean: true,
      exclude: defaultExclude.concat([
        "**/*.{test,json}.*",
        "**/types/**",
        "**/*.d.ts",
      ]),
      include: ["**/*.ts"],
    },
    environment: "happy-dom",
    globals: true,
    logHeapUsage: false,
    setupFiles: "vitest.setup.ts",
    reporters: ["default"],
    exclude: defaultExclude.concat(["**/*.ssr.test.ts"]),
  },
});
