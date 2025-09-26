import { describe, it, expect, beforeAll } from "vitest";
import { fileURLToPath } from 'node:url'
import { setup, createPage, $fetch } from "@nuxt/test-utils/e2e";
import {
  collectNormalizedMarkup,
  extractTestIdInnerHtml,
} from "./utils/html";

const PORT = 7780;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;


type TestPage = Awaited<ReturnType<typeof createPage>>;

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



const runWidgetInteractions = async (page: TestPage) => {
  const searchInput = page
    .getByTestId("searchbox")
    .locator("input[type='search'], input[type='text']")
    .first();
  await searchInput.fill("apple");
  await searchInput.press("Enter");
  await page.waitForLoadState("networkidle");


  const brandFilter = page
    .getByTestId("refinementlist")
    .locator("label")
    .filter({ hasText: "Apple" })
    .first();
  await brandFilter.click();
  await page.waitForLoadState("networkidle");

  const toggleControl = page
    .getByTestId("togglerefinement")
    .locator("input[type='checkbox'], button")
    .first();
  await toggleControl.click();
  await page.waitForLoadState("networkidle");
};

const captureState = async (route: string) => {
  const page = await createPage(getTestUrl(route));
  await page.waitForLoadState("networkidle");
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
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/parity', import.meta.url)),
    browser: true,
    server: true,
    port: PORT,
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
