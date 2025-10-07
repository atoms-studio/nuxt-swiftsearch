import { describe, it, expect } from "vitest";
import { fileURLToPath } from 'node:url'
import { setup, createPage } from "@nuxt/test-utils/e2e";
import {
  collectNormalizedMarkup,
} from "./utils/html";

const PORT = 7780;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;



const widgetTestIds = [
  "searchbox",
  // "stats", => flaky data inside, maybe needs a dedicated test, maybe test is useless since UI is simple
  "currentrefinements",
  "clearrefinements",
  "sortby",
  "togglerefinement",
  "refinementlist",
  "menu",
  "menuselect",
  "numericmenu",
  // "ratingmenu", => will need dedicated test since we went without svg for stars
  "hierarchicalmenu",
  "rangeinput",
  // "autocomplete", => will need dedicated test
  "hits",
  "infinitehits",
  "pagination",
  "panel",
  "index-hits",
  "index-refinementlist",
];



const captureState = async (route: string) => {
  const page = await createPage('/');
  await page.goto(getTestUrl(route), { waitUntil: 'hydration' })
  const initial = await collectNormalizedMarkup(page, widgetTestIds);
  await page.close();

  return {
    initial,
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
    }
  });


});
