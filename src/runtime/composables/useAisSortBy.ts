import { connectSortBy } from "instantsearch.js/es/connectors/index.umd";
import type {
  SortByConnectorParams,
  SortByRenderState,
} from "instantsearch.js/es/connectors/sort-by/connectSortBy";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisSortBy = (
  widgetParams: SortByConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<SortByRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderSortBy: Renderer<SortByRenderState, SortByConnectorParams> = (
    renderState,
    isFirstRender,
  ) => {
    stateRef.value = renderState;
    if (isFirstRender) {
      widgetIdScope.provideWidgetState("sortBy", stateRef);
    }

    return () => {};
  };

  const customSortBy = connectSortBy(renderSortBy);

  return {
    ...customSortBy(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
