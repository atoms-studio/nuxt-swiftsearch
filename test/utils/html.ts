import type { NuxtPage } from "@nuxt/test-utils";
export const stripHtmlComments = (html: string) => {
  return html.replaceAll("<!--[-->", "").replaceAll("<!--]-->", "").replaceAll("<!---->", "");
};

export const normalizeWhitespace = (html: string) => {
  return (
    html
      // collapse whitespace between tags
      .replace(/>\s+</g, "><")
      // trim leading whitespace at the start of any text node:  ...>   foo
      .replace(/>\s+/g, ">")
      // trim trailing whitespace at the end of any text node:  foo   <...
      .replace(/\s+</g, "<")
      // collapse any remaining runs of spaces
      .replace(/\s{2,}/g, " ")
      .trim()
  );
};
// Algolia returns a fresh `processingTimeMS` per request, so two parallel
// search runs (vue-instantsearch fixture vs swift fixture) almost always
// disagree on the millisecond value even when the rest of the markup is
// identical. Normalize it away so parity comparisons stay deterministic.
export const normalizeProcessingTime = (html: string) => {
  return html.replace(/found in [\d,.]+ms/g, "found in <T>ms");
};

// Vue 3's compiled-template output and vue-instantsearch's pre-built JS disagree
// on whether `style="display: none"` keeps the space after the colon. The
// rendered visual is identical; collapse it so parity diffs don't trip on it.
export const normalizeStyleAttributes = (html: string) => {
  return html.replace(
    /style="([^"]*)"/g,
    (_match, value: string) =>
      `style="${value
        .replace(/\s*:\s*/g, ":")
        .replace(/\s*;\s*/g, ";")
        .trim()}"`,
  );
};

export const normalizeHtml = (html: string) => {
  return normalizeStyleAttributes(
    normalizeProcessingTime(normalizeWhitespace(stripHtmlComments(html))),
  ).replace(/\u00a0/g, "");
};

export const extractTestIdInnerHtml = (markup: string, testId: string) => {
  const pattern = new RegExp(`<[^>]*data-testid=["']${testId}["'][^>]*>([\\s\\S]*?)</[^>]+>`, "i");
  const match = markup.match(pattern);
  return match ? normalizeHtml(match[1]) : null;
};

export const collectNormalizedMarkup = async (page: NuxtPage, testIds: string[]) => {
  const result: Record<string, string> = {};

  for (const testId of testIds) {
    const element = page.getByTestId(testId);
    const markup = await element.innerHTML();
    result[testId] = normalizeHtml(markup);
  }

  return result;
};
