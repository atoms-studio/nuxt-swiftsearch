import { connectSearchBox } from "instantsearch.js/es/connectors/index.umd";
import type {
  SearchBoxConnectorParams,
  SearchBoxRenderState,
} from "instantsearch.js/es/connectors/search-box/connectSearchBox";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisSearchBox = (
  widgetParams: SearchBoxConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<SearchBoxRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderSearchBox: Renderer<
    SearchBoxRenderState,
    SearchBoxConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    if (isFirstRender) {
      widgetIdScope.provideWidgetState("searchBox", stateRef);
    }

    return () => null;
  };

  const customSearchBox = connectSearchBox(renderSearchBox);

  return {
    ...customSearchBox(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
