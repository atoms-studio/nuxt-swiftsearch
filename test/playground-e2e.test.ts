import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { setup, createPage, $fetch } from "@nuxt/test-utils/e2e";
import { ensureNuxtBuild } from "./utils/prebuild";

const PORT = 7783;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;
const playgroundRoot = fileURLToPath(new URL("../playground", import.meta.url));

describe("playground e2e", async () => {
  ensureNuxtBuild(playgroundRoot);

  await setup({
    rootDir: playgroundRoot,
    browser: true,
    server: true,
    dev: false,
    build: false,
    nuxtConfig: {
      nitro: {
        output: {
          dir: resolve(playgroundRoot, ".output"),
        },
      },
    } as any,
    port: PORT,
  });

  it("keeps home page refinements isolated across declarative index scopes", async () => {
    const page = await createPage("/");
    await page.goto(getTestUrl("/"), { waitUntil: "hydration" });
    await page.waitForLoadState("networkidle");

    const indexOne = page.getByTestId("index-1");
    const indexTwo = page.getByTestId("index-2");

    const indexTwoCheckbox = indexTwo.locator("input[type='checkbox']").first();
    await indexTwoCheckbox.waitFor({ state: "visible" });
    await indexTwoCheckbox.check();
    await page.waitForTimeout(500);

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

  it("keeps manual widgets syntax interoperable on /search", async () => {
    const page = await createPage("/");
    await page.goto(getTestUrl("/search"), { waitUntil: "hydration" });
    await page.waitForLoadState("networkidle");

    await page.getByTestId("manual-page").waitFor({ state: "visible" });

    const searchInput = page
      .getByTestId("manual-searchbox")
      .locator("input[type='search']")
      .first();
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill("apple");
    await searchInput.press("Enter");
    await page.waitForTimeout(800);

    expect(decodeURIComponent(page.url())).toContain("query=apple");

    const manualHitsCount = await page
      .getByTestId("manual-main-item")
      .count();
    expect(manualHitsCount).toBeGreaterThan(0);

    await page.getByTestId("manual-index-hits").waitFor({ state: "visible" });
    await page.close();
  });

  it("renders autocomplete slot and index groups", async () => {
    const page = await createPage("/");
    await page.goto(getTestUrl("/autocomplete"), {
      waitUntil: "hydration",
      timeout: 60000,
    });
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByTestId("autocomplete-input");
    await searchInput.waitFor({ state: "visible", timeout: 60000 });
    await searchInput.fill("star");
    await page.waitForTimeout(800);

    expect(await searchInput.inputValue()).toBe("star");

    const autocompleteIndices = await page.getByTestId("autocomplete-index").count();
    expect(autocompleteIndices).toBeGreaterThan(0);
    await page.close();
  });

  it("restores pagination page from URL", async () => {
    const page = await createPage("/");
    await page.goto(getTestUrl("/pagination/page/3"), {
      waitUntil: "hydration",
      timeout: 60000,
    });
    await page.waitForLoadState("networkidle");

    const selectedPage = page
      .getByTestId("pagination-control")
      .locator(".ais-Pagination-item--selected")
      .first();
    await selectedPage.waitFor({ state: "visible" });
    const selectedPageText = (await selectedPage.textContent())?.trim();

    expect(selectedPageText).toBe("3");

    await page.close();
  });

  it("updates catchall brand filter from route params", async () => {
    const samsungHtml = await $fetch<string>("/test/Samsung");
    expect(samsungHtml).toContain("brand:Samsung");

    const appleHtml = await $fetch<string>("/test/Apple");
    expect(appleHtml).toContain("brand:Apple");
  });

  it("renders parity showcase route with new widgets", async () => {
    const page = await createPage("/");
    const pageErrors: string[] = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(getTestUrl("/showcase"), {
      waitUntil: "hydration",
      timeout: 60000,
    });
    await page.waitForLoadState("networkidle");

    await page.getByTestId("showcase-page").waitFor({ state: "visible" });

    const searchInput = page
      .getByTestId("showcase-searchbox")
      .locator("input[type='search']")
      .first();
    await searchInput.waitFor({ state: "visible", timeout: 60000 });

    const hitsPerPageOptions = await page
      .getByTestId("showcase-hitspage")
      .locator("option")
      .count();
    expect(hitsPerPageOptions).toBeGreaterThan(1);

    const voiceButton = page
      .getByTestId("showcase-voicesearch")
      .locator("button")
      .first();
    await voiceButton.waitFor({ state: "visible" });

    const dynamicWidgets = await page
      .getByTestId("showcase-dynamicwidgets")
      .locator(".ais-DynamicWidgets-widget")
      .count();
    expect(dynamicWidgets).toBeGreaterThan(0);

    const snippetText = (await page.getByTestId("showcase-snippet").innerText()).trim();
    expect(snippetText.length).toBeGreaterThan(0);

    await page.close();

    if (pageErrors.length) {
      throw new Error(`Page errors on /showcase: ${pageErrors.join(" | ")}`);
    }
  });
});
