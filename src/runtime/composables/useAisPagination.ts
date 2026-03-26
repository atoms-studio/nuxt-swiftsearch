import { connectPagination } from "instantsearch.js/es/connectors";
import type {
  PaginationConnectorParams,
  PaginationRenderState,
} from "instantsearch.js/es/connectors/pagination/connectPagination";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisPagination = (
  widgetParams: PaginationConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<PaginationRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderPagination: Renderer<
    PaginationRenderState,
    PaginationConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    if (isFirstRender) {
      widgetIdScope.provideWidgetState("pagination", stateRef);
    }

    return () => {};
  };

  // 2. Create the custom widget
  const customPagination = connectPagination(renderPagination);

  return {
    ...customPagination(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
