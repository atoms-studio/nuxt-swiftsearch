import { connectPagination } from "instantsearch.js/es/connectors";
import type {
  PaginationConnectorParams,
  PaginationRenderState,
} from "instantsearch.js/es/connectors/pagination/connectPagination";
import type { Renderer } from "instantsearch.js/es/types";
import { provide, ref } from "vue";

export const useAisPagination = (
  widgetParams: PaginationConnectorParams,
  id: string = "",
) => {
  const stateRef = ref<PaginationRenderState | null>();
  // 1. Create a render function
  const renderPagination: Renderer<
    PaginationRenderState,
    PaginationConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`pagination-${id}`, stateRef);
    }
    // render nothing
    return () => { };
  };

  // 2. Create the custom widget
  const customPagination =
  connectPagination(renderPagination);

  // 3. Instantiate
  return { ...customPagination(widgetParams), $$widgetParams: widgetParams, $$widgetId: id };
};
