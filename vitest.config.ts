import { defineVitestConfig } from "@nuxt/test-utils/config";
import "dotenv/config";

export default defineVitestConfig({
  test: {
    testTimeout: 180000,
    fileParallelism: false,
    maxWorkers: 1,
    sequence: {
      concurrent: false,
    },
  },
});
