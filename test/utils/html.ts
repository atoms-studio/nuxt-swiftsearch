export const stripHtmlComments = (html: string) => {
  return html.replace(/<!--([\s\S]*?)-->/g, "");
};

export const normalizeWhitespace = (html: string) => {
  return html
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
};

export const normalizeHtml = (html: string) => {
  return normalizeWhitespace(stripHtmlComments(html)).replace(/\u00a0/g, " ");
};

export const extractTestIdInnerHtml = (markup: string, testId: string) => {
  const pattern = new RegExp(
    `<[^>]*data-testid=["']${testId}["'][^>]*>([\\s\\S]*?)</[^>]+>`,
    "i",
  );
  const match = markup.match(pattern);
  return match ? normalizeHtml(match[1]) : null;
};

export const collectNormalizedMarkup = async (page: any, testIds: string[]) => {
  const result: Record<string, string> = {};

  for (const testId of testIds) {
    const element = page.getByTestId(testId);
    const markup = await element.innerHTML();
    result[testId] = normalizeHtml(markup);
  }

  return result;
};
