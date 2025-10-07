import { defineVitestConfig } from "@nuxt/test-utils/config";
import "dotenv/config";

export default defineVitestConfig({
  test: {
    testTimeout: 120000,
    sequence: {
      concurrent: false,
    },
  },
});
