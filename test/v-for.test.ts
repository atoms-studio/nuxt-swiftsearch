import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { setup, url } from "@nuxt/test-utils/e2e";
import { createPage } from "./utils/page";

// createPage adds the "hydration" wait state, which the plain playwright Page type does not have.
type Page = Awaited<ReturnType<typeof createPage>>;
import { ensureNuxtBuild } from "./utils/prebuild";

/* eslint-disable jest/valid-describe-callback */

const fixtureRoot = fileURLToPath(new URL("./fixtures/parity", import.meta.url));

const openPage = async (page: Page, errors: string[]) => {
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(url("/swift/v-for"), {
    waitUntil: "hydration",
    timeout: 60000,
  });
  await page.waitForLoadState("networkidle");
};

describe("swiftsearch declarative v-for (issue #58)", async () => {
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
  });

  it("renders looped refinement lists via SSR and refines them independently", async () => {
    const errors: string[] = [];
    const page = await createPage("/");
    await openPage(page, errors);

    const brand = page.getByTestId("refinement-brand");
    const categories = page.getByTestId("refinement-categories");

    await brand
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });
    await categories
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });

    await categories.locator("input[type='checkbox']").first().check();
    await page.waitForTimeout(300);

    expect(await categories.locator(".ais-RefinementList-item--selected").count()).toBeGreaterThan(
      0,
    );
    expect(await brand.locator(".ais-RefinementList-item--selected").count()).toBe(0);

    expect(errors).toEqual([]);
    await page.close();
  });

  // Widgets registered after instance.start() reach their components through
  // the per-instance widget state registry. These tests cover that path: a
  // v-for source growing client-side, and a v-if branch that turns on after
  // the initial search.
  it("mounts a working refinement list when the source array grows client-side", async () => {
    const errors: string[] = [];
    const page = await createPage("/");
    await openPage(page, errors);

    const brand = page.getByTestId("refinement-brand");
    await brand
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });
    await brand.locator("input[type='checkbox']").first().check();
    await page.waitForTimeout(300);

    await page.getByTestId("add-attribute").click();

    const freeShipping = page.getByTestId("refinement-free_shipping");
    await freeShipping
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });

    await freeShipping.locator("input[type='checkbox']").first().check();
    await page.waitForTimeout(300);

    expect(
      await freeShipping.locator(".ais-RefinementList-item--selected").count(),
    ).toBeGreaterThan(0);
    // adding a widget keeps the refinements of the widgets that stay
    expect(await brand.locator(".ais-RefinementList-item--selected").count()).toBeGreaterThan(0);

    expect(errors).toEqual([]);
    await page.close();
  });

  it("mounts a working refinement list when a v-if branch turns on after the initial search", async () => {
    const errors: string[] = [];
    const page = await createPage("/");
    await openPage(page, errors);

    await page
      .getByTestId("refinement-brand")
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });

    await page.getByTestId("toggle-extra").click();

    const extra = page.getByTestId("refinement-extra");
    await extra
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });

    await extra.locator("input[type='checkbox']").first().check();
    await page.waitForTimeout(300);

    expect(await extra.locator(".ais-RefinementList-item--selected").count()).toBeGreaterThan(0);

    expect(errors).toEqual([]);
    await page.close();
  });

  it("disposes a refinement list when the source array shrinks client-side", async () => {
    const errors: string[] = [];
    const page = await createPage("/");
    await openPage(page, errors);

    const brand = page.getByTestId("refinement-brand");
    await brand
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });

    await page.getByTestId("remove-attribute").click();
    await page.waitForTimeout(400);

    expect(await page.getByTestId("refinement-categories").count()).toBe(0);

    // the remaining list must still refine
    await brand.locator("input[type='checkbox']").first().check();
    await page.waitForTimeout(300);
    expect(await brand.locator(".ais-RefinementList-item--selected").count()).toBeGreaterThan(0);

    expect(errors).toEqual([]);
    await page.close();
  });

  it("keeps the state of the other widgets when the first item is removed", async () => {
    const errors: string[] = [];
    const page = await createPage("/");
    await openPage(page, errors);

    // ids follow the :key, so removing "brand" does not shift the id of "categories"
    const categories = page.getByTestId("refinement-categories");
    await categories
      .locator("input[type='checkbox']")
      .first()
      .waitFor({ state: "visible", timeout: 120000 });
    await categories.locator("input[type='checkbox']").first().check();
    await page.waitForTimeout(300);

    await page.getByTestId("remove-first-attribute").click();
    await page.waitForTimeout(400);

    expect(await page.getByTestId("refinement-brand").count()).toBe(0);
    expect(await categories.locator(".ais-RefinementList-item--selected").count()).toBeGreaterThan(
      0,
    );

    // the remaining list still refines
    await categories.locator("input[type='checkbox']").nth(1).check();
    await page.waitForTimeout(300);
    expect(await categories.locator(".ais-RefinementList-item--selected").count()).toBeGreaterThan(
      1,
    );

    expect(errors).toEqual([]);
    await page.close();
  });
});
