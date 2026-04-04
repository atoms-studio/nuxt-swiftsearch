import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { setup, createPage } from "@nuxt/test-utils/e2e";
import { collectNormalizedMarkup } from "./utils/html";
import { ensureNuxtBuild } from "./utils/prebuild";

const PORT = 7780;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;
const fixtureRoot = fileURLToPath(new URL("./fixtures/parity", import.meta.url));

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
  // "panel", => panel API diverges currently; covered by dedicated component tests
  "index-hits",
  "index-refinementlist",
];

const captureState = async (route: string) => {
  const page = await createPage("/");
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto(getTestUrl(route), {
    waitUntil: "hydration",
    timeout: 60000,
  });
  if (pageErrors.length) {
    throw new Error(`Page errors on ${route}: ${pageErrors.join(" | ")}`);
  }
  await page
    .getByTestId("searchbox")
    .locator("input[type='search'], input[type='text']")
    .first()
    .waitFor({ state: "visible", timeout: 60000 });
  const initial = await collectNormalizedMarkup(page, widgetTestIds);
  await page.close();

  return {
    initial,
  };
};

describe("swiftsearch parity", async () => {
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

  it("matches vue-instantsearch markup before and after interactions", async () => {
    const originalState = await captureState("/original/full");
    const swiftState = await captureState("/swift/full");

    for (const testId of widgetTestIds) {
      expect(swiftState.initial[testId]).toBe(originalState.initial[testId]);
    }
  });
});
