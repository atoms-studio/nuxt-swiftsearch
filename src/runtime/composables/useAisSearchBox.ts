import { connectSearchBox } from "instantsearch.js/es/connectors";
import type {
  SearchBoxConnectorParams,
  SearchBoxRenderState,
} from "instantsearch.js/es/connectors/search-box/connectSearchBox";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisSearchBox = (widgetParams: SearchBoxConnectorParams) => {
  // 1. Create a render function
  const renderSearchBox: Renderer<
    SearchBoxRenderState,
    SearchBoxConnectorParams
  > = (_, __) => {
    // render nothing
    return () => null;
  };

  // 2. Create the custom widget
  const customSearchBox = connectSearchBox(renderSearchBox);

  // 3. Instantiate
  return customSearchBox(widgetParams);
};
