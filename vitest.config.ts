import { defineVitestConfig } from "@nuxt/test-utils/config";
import "dotenv/config";

export default defineVitestConfig({
  resolve: {
    alias: {
      // vite-node inlines @vue/compiler-sfc's CJS build and breaks its
      // require("magic-string") interop (compileScript throws "MagicString is
      // not a constructor"). The self-contained ESM build has no bare requires.
      "@vue/compiler-sfc": "@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js",
    },
  },
  test: {
    testTimeout: 180000,
    fileParallelism: false,
    maxWorkers: 1,
    sequence: {
      concurrent: false,
    },
  },
});
