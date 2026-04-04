import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  deps: {
    skipNodeModulesBundle: true,
  },
  dts: true,
  entry: [
    "src/module.ts",
    "src/runtime/composables/**/*.ts",
    "src/runtime/types/**/*.ts",
    "src/runtime/utils/**/*.ts",
  ],
  format: "es",
  outDir: "dist",
  root: "src",
  target: "node20.19",
  unbundle: true,
  copy: [
    {
      from: "src/runtime/components/*",
      to: "dist/runtime/components",
      flatten: true,
    },
  ],
});
