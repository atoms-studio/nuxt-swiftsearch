import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { setup, createPage } from "@nuxt/test-utils/e2e";
import { ensureNuxtBuild } from "./utils/prebuild";

/* eslint-disable jest/valid-describe-callback */

const PORT = 7783;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;
const fixtureRoot = fileURLToPath(new URL("./fixtures/parity", import.meta.url));

describe("swiftsearch widget state collision across pages", async () => {
  ensureNuxtBuild(fixtureRoot);

  await setup({
    rootDir: fixtureRoot,
    browser: true,
    server: true,
    dev: false,
    build: false,
    nuxtConfig: {
      nitro: {
        output: {
          dir: resolve(fixtureRoot, ".output"),
        },
      },
    } as any,
    port: PORT,
  });

  it("does not leak refinements between pages sharing the same widget id + index", async () => {
    const page = await createPage("/");
    await page.goto(getTestUrl("/swift/state-collision/a"), {
      waitUntil: "hydration",
      timeout: 60000,
    });
    await page.waitForLoadState("networkidle");

    const pageA = page.getByTestId("page-a");
    await pageA
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });

    await pageA.locator("input[type='checkbox']").first().check();
    await page.waitForTimeout(400);

    const selectedOnA = await pageA.locator(".ais-RefinementList-item--selected").count();
    expect(selectedOnA).toBeGreaterThan(0);

    // SPA navigate to page B — same widget id + same index but different instance key.
    await page.getByTestId("go-to-b").click();
    await page.waitForLoadState("networkidle");

    const pageB = page.getByTestId("page-b");
    await pageB
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });
    await page.waitForTimeout(400);

    // Page B has its own AisInstantSearch instance — no refinement should be active here.
    const selectedOnB = await pageB.locator(".ais-RefinementList-item--selected").count();
    expect(selectedOnB).toBe(0);

    await page.close();
  });
});
