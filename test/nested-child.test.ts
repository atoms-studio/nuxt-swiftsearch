import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { setup, createPage } from "@nuxt/test-utils/e2e";
import { ensureNuxtBuild } from "./utils/prebuild";

/* eslint-disable jest/valid-describe-callback */

const PORT = 7786;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;
const fixtureRoot = fileURLToPath(new URL("./fixtures/parity", import.meta.url));

describe("swiftsearch cross-file widget discovery (issue #58, nested components)", async () => {
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

  it("renders and refines widgets that live inside a child component", async () => {
    const errors: string[] = [];
    const consoleErrors: string[] = [];
    const page = await createPage("/");
    page.on("pageerror", (error) => errors.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        consoleErrors.push(message.text());
      }
    });

    await page.goto(getTestUrl("/swift/nested-child"), {
      waitUntil: "hydration",
      timeout: 60000,
    });
    await page.waitForLoadState("networkidle");

    const brand = page.getByTestId("nested-refinement-brand");
    const categories = page.getByTestId("nested-refinement-categories");

    await brand
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });
    await categories
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });

    // the stats widget inside the child resolves its connector too
    await page.getByTestId("nested-stats").waitFor({ state: "visible", timeout: 60000 });

    await brand.locator("input[type='checkbox']").first().check();
    await page.waitForTimeout(300);

    expect(await brand.locator(".ais-RefinementList-item--selected").count()).toBeGreaterThan(0);
    expect(await categories.locator(".ais-RefinementList-item--selected").count()).toBe(0);

    expect(errors).toEqual([]);
    expect(
      consoleErrors.filter((text) => text.includes("Extraneous non-props attributes")),
    ).toEqual([]);

    await page.close();
  });
});
