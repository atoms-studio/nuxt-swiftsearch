import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { setup, createPage } from "@nuxt/test-utils/e2e";
import { ensureNuxtBuild } from "./utils/prebuild";

/* eslint-disable jest/valid-describe-callback */

const PORT = 7784;
const getTestUrl = (route: string) => `http://127.0.0.1:${PORT}${route}`;
const fixtureRoot = fileURLToPath(new URL("./fixtures/parity", import.meta.url));

describe("AisStateResults status transitions during a slow search", async () => {
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

  it("transitions to loading/stalled while a refinement-triggered search is in flight", async () => {
    const page = await createPage("/");
    await page.goto(getTestUrl("/swift/state-results-status"), {
      waitUntil: "hydration",
      timeout: 60000,
    });
    await page.waitForLoadState("networkidle");

    const statusEl = page.getByTestId("status");
    await statusEl.waitFor({ state: "visible", timeout: 120000 });

    // After SSR + hydration the search has resolved, so we expect idle baseline.
    await page.waitForFunction(
      () => document.querySelector('[data-testid="status"]')?.textContent?.trim() === "idle",
      null,
      { timeout: 5000 },
    );

    const checkbox = page.getByTestId("status-page").locator("input[type='checkbox']").first();
    await checkbox.waitFor({ state: "visible", timeout: 60000 });

    // Trigger a new client-side search. The wrapped client delays each response
    // by 600ms, which is well above the default 200ms stalled threshold, so the
    // status must transition through loading/stalled before settling back to idle.
    await checkbox.check();

    // Must transition to a non-idle status while the search is in flight.
    await page.waitForFunction(
      () => {
        const text = document.querySelector('[data-testid="status"]')?.textContent?.trim();
        return text === "loading" || text === "stalled";
      },
      null,
      { timeout: 1500 },
    );
    const inFlightStatus = (await statusEl.textContent())?.trim();
    expect(inFlightStatus).toMatch(/loading|stalled/);

    // Eventually returns to idle once the slow search completes.
    await page.waitForFunction(
      () => document.querySelector('[data-testid="status"]')?.textContent?.trim() === "idle",
      null,
      { timeout: 5000 },
    );
    const settledStatus = (await statusEl.textContent())?.trim();
    expect(settledStatus).toBe("idle");

    await page.close();
  });
});
