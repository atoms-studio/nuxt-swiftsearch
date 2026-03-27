import { connectRelevantSort } from "instantsearch.js/es/connectors/index.umd";
import type {
  RelevantSortConnectorParams,
  RelevantSortRenderState,
} from "instantsearch.js/es/connectors/relevant-sort/connectRelevantSort";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisRelevantSort = (
  widgetParams: RelevantSortConnectorParams = {},
  widgetId: string = "",
) => {
  const stateRef = ref<RelevantSortRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  const renderRelevantSort: Renderer<
    RelevantSortRenderState,
    RelevantSortConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("relevantSort", stateRef);
    }

    return () => {};
  };

  const customRelevantSort = connectRelevantSort(renderRelevantSort);

  return {
    ...customRelevantSort(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
