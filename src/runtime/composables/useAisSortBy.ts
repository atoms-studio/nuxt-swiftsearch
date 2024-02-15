import { connectSortBy } from "instantsearch.js/es/connectors";
import type {
  SortByConnectorParams,
  SortByRenderState,
} from "instantsearch.js/es/connectors/sort-by/connectSortBy";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisSortBy = (widgetParams: SortByConnectorParams) => {
  // 1. Create a render function
  const renderSortBy: Renderer<SortByRenderState, SortByConnectorParams> = (
    _,
    __,
  ) => {
    // render nothing
    return () => { };
  };

  // 2. Create the custom widget
  const customSortBy = connectSortBy(renderSortBy);

  // 3. Instantiate
  return customSortBy(widgetParams);
};
