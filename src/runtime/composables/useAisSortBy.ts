import { connectSortBy } from "instantsearch.js/es/connectors";
import type {
  SortByConnectorParams,
  SortByRenderState,
} from "instantsearch.js/es/connectors/sort-by/connectSortBy";
import type { Renderer } from "instantsearch.js/es/types";
import { provide, ref } from "vue";

export const useAisSortBy = (widgetParams: SortByConnectorParams, id: string = "") => {
  const stateRef = ref<SortByRenderState | null>();
  // 1. Create a render function
  const renderSortBy: Renderer<SortByRenderState, SortByConnectorParams> = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`sortBy-${id}`, stateRef);
    }
    // render nothing
    return () => { };
  };

  // 2. Create the custom widget
  const customSortBy = connectSortBy(renderSortBy);

  // 3. Instantiate
  return { ...customSortBy(widgetParams), $$widgetParams: widgetParams, $$widgetId: id,
  };
};
