import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { setup, createPage } from "@nuxt/test-utils/e2e";
import { ensureNuxtBuild } from "./utils/prebuild";

const PORT = 7782;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;
const fixtureRoot = fileURLToPath(new URL("./fixtures/parity", import.meta.url));

describe("swiftsearch index isolation", async () => {
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

  it("keeps refinements isolated across indexId scopes", async () => {
    const page = await createPage("/");
    await page.goto(getTestUrl("/swift/index-isolation"), {
      waitUntil: "hydration",
      timeout: 60000,
    });
    await page.waitForLoadState("networkidle");

    const indexOne = page.getByTestId("index-1");
    const indexTwo = page.getByTestId("index-2");

    await indexOne.locator("input[type='checkbox']").first().check();
    await page.waitForTimeout(300);

    const indexOneSelectedAfterFirstRefine = await indexOne
      .locator(".ais-RefinementList-item--selected")
      .count();
    const indexTwoSelectedAfterFirstRefine = await indexTwo
      .locator(".ais-RefinementList-item--selected")
      .count();

    expect(indexOneSelectedAfterFirstRefine).toBeGreaterThan(0);
    expect(indexTwoSelectedAfterFirstRefine).toBe(0);

    await indexOne.locator("input[type='checkbox']").first().uncheck();
    await page.waitForTimeout(300);

    await indexTwo.locator("input[type='checkbox']").first().check();
    await page.waitForTimeout(400);

    const indexOneSelected = await indexOne
      .locator(".ais-RefinementList-item--selected")
      .count();
    const indexTwoSelected = await indexTwo
      .locator(".ais-RefinementList-item--selected")
      .count();

    expect(indexOneSelected).toBe(0);
    expect(indexTwoSelected).toBeGreaterThan(0);

    await page.close();
  });
});
