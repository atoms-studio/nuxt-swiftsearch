import { describe, it, expect } from "vitest";
import { fileURLToPath } from 'node:url'
import { setup, createPage } from "@nuxt/test-utils/e2e";

const PORT = 7777;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;
const stripHTMLComments = (htmlString: string) => {
  return htmlString.replace(/<!--([\s\S]*?)-->/g, "");
};

const componentsTestIds = ["infinitehits", "refinementlist"];

describe("vue-instantsearch-snapshots", async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    browser: true,
    server: true,
    port: PORT,
  });

  it("matches instantsearch snapshots", async () => {
    const page = await createPage(getTestUrl("/instantsearch"));
    await page.waitForLoadState("networkidle");

    for await (const testId of componentsTestIds) {
      const comp = stripHTMLComments(
        await page.getByTestId(testId).innerHTML(),
      );
      await expect(comp).toMatchFileSnapshot(`./snapshots/${testId}`);
    }
  });

  it("matches UI between implementations", async () => {
    const page = await createPage(getTestUrl("/swiftsearch"));

    for await (const testId of componentsTestIds) {
      const comp = stripHTMLComments(
        await page.getByTestId(testId).innerHTML(),
      );
      await expect(comp).toMatchFileSnapshot(`./snapshots/${testId}`);
    }
  });
});
