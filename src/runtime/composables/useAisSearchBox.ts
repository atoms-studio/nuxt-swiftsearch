import { connectSearchBox } from "instantsearch.js/es/connectors";
import type {
  SearchBoxConnectorParams,
  SearchBoxRenderState,
} from "instantsearch.js/es/connectors/search-box/connectSearchBox";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisSearchBox = (widgetParams: SearchBoxConnectorParams, id: string = "") => {
  const stateRef = ref<SearchBoxRenderState | null>();
  // 1. Create a render function
  const renderSearchBox: Renderer<
    SearchBoxRenderState,
    SearchBoxConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`searchBox-${id}`, stateRef);
    }
    // render nothing
    return () => null;
  };

  // 2. Create the custom widget
  const customSearchBox = connectSearchBox(renderSearchBox);

  // 3. Instantiate
  return { ...customSearchBox(widgetParams), $$widgetParams: widgetParams, $$widgetId: id };
};
