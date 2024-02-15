import { index } from "instantsearch.js/es/widgets";
import type { IndexWidgetParams } from "instantsearch.js/es/widgets/index/index";

export const useAisIndex = (widgetParams: IndexWidgetParams) => {
  return index(widgetParams);
};
