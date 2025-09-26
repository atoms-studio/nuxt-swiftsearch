import { describe, it, expect, beforeAll } from "vitest";
import { fileURLToPath } from "node:url";
import { setup, createPage, $fetch } from "@nuxt/test-utils/e2e";
import type { Page } from "playwright-core";
import {
  collectNormalizedMarkup,
  extractTestIdInnerHtml,
} from "./utils/html";

const PORT = 7780;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;

const widgetTestIds = [
  "searchbox",
  "stats",
  "currentrefinements",
  "clearrefinements",
  "sortby",
  "togglerefinement",
  "refinementlist",
  "menu",
  "menuselect",
  "numericmenu",
  "ratingmenu",
  "hierarchicalmenu",
  "rangeinput",
  "autocomplete",
  "hits",
  "infinitehits",
  "pagination",
  "panel",
  "index-hits",
  "index-refinementlist",
];

const waitForResults = async (page: Page) => {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
};

const runWidgetInteractions = async (page: Page) => {
  const searchInput = page
    .getByTestId("searchbox")
    .locator("input[type='search'], input[type='text']")
    .first();
  await searchInput.fill("apple");
  await searchInput.press("Enter");
  await waitForResults(page);

  const brandFilter = page
    .getByTestId("refinementlist")
    .locator("label")
    .filter({ hasText: "Apple" })
    .first();
  await brandFilter.click();
  await waitForResults(page);

  const toggleControl = page
    .getByTestId("togglerefinement")
    .locator("input[type='checkbox'], button")
    .first();
  await toggleControl.click();
  await waitForResults(page);
};

const captureState = async (route: string) => {
  const page = await createPage(getTestUrl(route));
  await waitForResults(page);
  const initial = await collectNormalizedMarkup(page, widgetTestIds);
  await runWidgetInteractions(page);
  const afterInteractions = await collectNormalizedMarkup(page, widgetTestIds);
  await page.close();

  return {
    initial,
    afterInteractions,
  };
};

describe("swiftsearch parity", async () => {
  beforeAll(async () => {
    await setup({
      rootDir: fileURLToPath(new URL("./fixtures/parity", import.meta.url)),
      browser: true,
      server: true,
      dev: false,
      port: PORT,
    });
  });

  it("matches vue-instantsearch markup before and after interactions", async () => {
    const originalState = await captureState("/original/full");
    const swiftState = await captureState("/swift/full");

    for (const testId of widgetTestIds) {
      expect(swiftState.initial[testId]).toBe(originalState.initial[testId]);
      expect(swiftState.afterInteractions[testId]).toBe(
        originalState.afterInteractions[testId],
      );
    }
  });

  it("renders swift pages with SSR markup that matches hydrated DOM", async () => {
    const swiftState = await captureState("/swift/full");
    const ssrHtml = await $fetch<string>("/swift/full");

    for (const testId of widgetTestIds) {
      const ssrFragment = extractTestIdInnerHtml(ssrHtml, testId);
      expect(ssrFragment).toBeTruthy();
      expect(swiftState.initial[testId]).toBe(ssrFragment);
    }
  });
});
