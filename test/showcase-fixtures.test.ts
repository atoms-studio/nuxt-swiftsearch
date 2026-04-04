import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { setup, createPage } from "@nuxt/test-utils/e2e";
import { ensureNuxtBuild } from "./utils/prebuild";

/* eslint-disable jest/valid-describe-callback */

const PORT = 7784;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;
const fixtureRoot = fileURLToPath(new URL("./fixtures/parity", import.meta.url));

type ShowcaseSnapshot = {
  hitsPerPageOptions: string[];
  breadcrumbItems: string[];
  poweredByHref: string;
  voiceButtonTitle: string;
  dynamicWidgetsCount: number;
  experimentalDynamicWidgetsCount: number;
  snippetText: string;
};

const captureShowcase = async (route: string): Promise<ShowcaseSnapshot> => {
  const page = await createPage("/");
  const pageErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto(getTestUrl(route), {
    waitUntil: "hydration",
    timeout: 60000,
  });
  await page.waitForLoadState("networkidle");

  await page
    .getByTestId("showcase-searchbox")
    .locator("input[type='search'], input[type='text']")
    .first()
    .waitFor({ state: "visible", timeout: 120000 });

  const hitsPerPageOptions = (
    await page.getByTestId("showcase-hitspage").locator("option").allTextContents()
  ).map((value) => value.trim());

  const breadcrumbItems = (
    await page.getByTestId("showcase-breadcrumb").locator(".ais-Breadcrumb-item").allTextContents()
  ).map((value) => value.replace(/\s+/g, " ").trim());

  const poweredByHref = await page
    .getByTestId("showcase-poweredby")
    .locator("a")
    .first()
    .getAttribute("href");

  const voiceButtonTitle = await page
    .getByTestId("showcase-voicesearch")
    .locator("button")
    .first()
    .getAttribute("title");

  const dynamicWidgetsCount = await page
    .getByTestId("showcase-dynamicwidgets")
    .locator(".ais-DynamicWidgets-widget")
    .count();

  const experimentalDynamicWidgetsCount = await page
    .getByTestId("showcase-exp-dynamicwidgets")
    .locator(".ais-DynamicWidgets-widget")
    .count();

  const snippetText = (await page.getByTestId("showcase-snippet").innerText())
    .replace(/\s+/g, " ")
    .trim();

  await page.close();

  if (pageErrors.length) {
    throw new Error(`Page errors on ${route}: ${pageErrors.join(" | ")}`);
  }

  return {
    hitsPerPageOptions,
    breadcrumbItems,
    poweredByHref: poweredByHref || "",
    voiceButtonTitle: voiceButtonTitle || "",
    dynamicWidgetsCount,
    experimentalDynamicWidgetsCount,
    snippetText,
  };
};

describe("showcase fixture coverage", async () => {
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

  it("covers newly added parity widgets in both fixtures", async () => {
    const swift = await captureShowcase("/swift/showcase");
    const original = await captureShowcase("/original/showcase");

    expect(swift.hitsPerPageOptions).toEqual(original.hitsPerPageOptions);

    expect(swift.breadcrumbItems.length).toBeGreaterThan(0);
    expect(original.breadcrumbItems.length).toBeGreaterThan(0);

    expect(swift.poweredByHref).toContain("algolia.com");
    expect(original.poweredByHref).toContain("algolia.com");

    expect(swift.voiceButtonTitle).toContain("Search by voice");
    expect(original.voiceButtonTitle).toContain("Search by voice");

    expect(swift.dynamicWidgetsCount).toBeGreaterThan(0);
    expect(original.dynamicWidgetsCount).toBeGreaterThan(0);

    expect(swift.experimentalDynamicWidgetsCount).toBeGreaterThan(0);
    expect(original.experimentalDynamicWidgetsCount).toBeGreaterThan(0);

    expect(swift.snippetText.length).toBeGreaterThan(0);
    expect(original.snippetText.length).toBeGreaterThan(0);
  });
});
