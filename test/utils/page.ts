import { createPage as createNuxtPage } from "@nuxt/test-utils/e2e";
import { onTestFailed } from "vitest";

type NuxtPage = Awaited<ReturnType<typeof createNuxtPage>>;

// Records what the browser saw. When the current test fails, the record is
// printed with the visible page text, so that a CI failure shows its cause.
const trackPage = (page: NuxtPage) => {
  const events: string[] = [];
  const time = () => new Date().toISOString().slice(11, 23);

  page.on("pageerror", (error) => events.push(`${time()} page error: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      events.push(`${time()} console ${message.type()}: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    events.push(`${time()} request failed: ${request.url()} (${request.failure()?.errorText})`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      events.push(`${time()} HTTP ${response.status()}: ${response.url()}`);
    }
  });

  onTestFailed(async () => {
    const text = await page
      .locator("body")
      .innerText({ timeout: 2000 })
      .catch(() => "(page closed)");
    console.error(
      [
        `[e2e diagnostics] ${page.url()}`,
        ...(events.length ? events : ["no errors, failed requests or HTTP errors recorded"]),
        `visible text: ${text.replace(/\s+/g, " ").slice(0, 600)}`,
      ].join("\n  "),
    );
  });

  return page;
};

export const createPage: typeof createNuxtPage = async (...args) =>
  trackPage(await createNuxtPage(...args));
