import { defineVitestConfig } from "@nuxt/test-utils/config";
import "dotenv/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    testTimeout: 30000,
    browser: {
      enabled: true,
      headless: true,
      name: "chromium",
      provider: "playwright",
    },
    setupFiles: ["./test/setup/browser.ts"],
    sequence: {
      concurrent: false,
    },
  },
});
