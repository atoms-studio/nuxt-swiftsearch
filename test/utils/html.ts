import type { NuxtPage } from '@nuxt/test-utils'
export const stripHtmlComments = (html: string) => {
  return html.replaceAll('<!--[-->', '').replaceAll('<!--]-->', '').replaceAll('<!---->', '')
};

export const normalizeWhitespace = (html: string) => {
  return html
    // collapse whitespace between tags
    .replace(/>\s+</g, "><")
    // trim leading whitespace at the start of any text node:  ...>   foo
    .replace(/>\s+/g, ">")
    // trim trailing whitespace at the end of any text node:  foo   <...
    .replace(/\s+</g, "<")
    // collapse any remaining runs of spaces
    .replace(/\s{2,}/g, " ")
    .trim();
};
export const normalizeHtml = (html: string) => {
  return normalizeWhitespace(stripHtmlComments(html)).replace(/\u00a0/g, "");
};

export const extractTestIdInnerHtml = (markup: string, testId: string) => {
  const pattern = new RegExp(
    `<[^>]*data-testid=["']${testId}["'][^>]*>([\\s\\S]*?)</[^>]+>`,
    "i",
  );
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
