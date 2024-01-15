import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

import react from "@vitejs/plugin-react";

/**
 * @type {import("vitest/config").Config}
 */
export default defineConfig({
  plugins: [
    react({
      // babel: {
      //   plugins: ["@babel/plugin-transform-modules-commonjs"],
      // },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
});
