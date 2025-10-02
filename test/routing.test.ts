import { describe, it, expect, beforeAll } from "vitest";
import { setup, createPage, $fetch } from "@nuxt/test-utils/e2e";

const PORT = 7781;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;
const fixtureRoot = decodeURIComponent(
  new URL("./fixtures/parity", import.meta.url).pathname,
);

const decodeUrl = (url: string) => decodeURIComponent(url);

describe("swiftsearch routing", async () => {
  await setup({
    rootDir: fixtureRoot,
    browser: true,
    server: true,
    dev: false,
    port: PORT,
  });

  it("hydrates search parameters from the incoming URL", async () => {
    const route = "/swift/router?instant_search%5Bquery%5D=Samsung";
    const html = await $fetch<string>(route);
    expect(html).toContain("value=\"Samsung\"");

    const page = await createPage('/');
    await page.goto(getTestUrl(route), { waitUntil: 'hydration' })

    await page.waitForLoadState("networkidle");
    const searchValue = await page
      .getByTestId("router-searchbox")
      .locator("input[type='search'], input[type='text']")
      .inputValue();
    expect(searchValue).toBe("Samsung");
    await page.close();
  });

  it("syncs refinements into the URL and restores them on reload", async () => {
    const page = await createPage('/');
    await page.goto(getTestUrl("/swift/router"), { waitUntil: 'hydration' })

    await page.waitForLoadState("networkidle");

    const searchInput = page
      .getByTestId("router-searchbox")
      .locator("input[type='search'], input[type='text']")
      .first();
    await searchInput.fill("tv");
    await searchInput.press("Enter");
    await page.waitForTimeout(600);

    const toggle = page
      .getByTestId("router-togglerefinement")
      .locator("input[type='checkbox'], button")
      .first();
    await toggle.click();
    await page.waitForTimeout(600);

    const refinedUrl = decodeUrl(page.url());
    expect(refinedUrl).toContain("instant_search[toggle][free_shipping]=true");
    expect(refinedUrl).toContain("instant_search[query]=tv");

    await page.reload({ waitUntil: "networkidle" });
    const currentRefinements = await page
      .getByTestId("router-currentrefinements")
      .innerHTML();
    expect(currentRefinements).toContain("Free_shipping");
    await page.close();
  });

  it("keeps InstantSearch state across route navigation", async () => {
    const page = await createPage('/');
    await page.goto(getTestUrl("/swift/router"), { waitUntil: 'hydration' })

    await page.waitForLoadState("networkidle");

    await page.getByText("Samsung route").click();
    await page.waitForLoadState("networkidle");

    const heading = await page.getByTestId("brand-heading").textContent();
    expect(heading).toBe("Samsung");
    expect(decodeUrl(page.url())).toContain("/swift/router/Samsung");

    await page.goBack();
    await page.waitForLoadState("networkidle");
    expect(decodeUrl(page.url())).toContain("/swift/router");

    const currentRefinements = await page
      .getByTestId("router-currentrefinements")
      .innerHTML();
    expect(currentRefinements).not.toBe("");
    await page.close();
  });
});
