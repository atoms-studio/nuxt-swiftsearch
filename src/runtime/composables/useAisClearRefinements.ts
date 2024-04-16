import { connectClearRefinements } from "instantsearch.js/es/connectors";
import type {
  ClearRefinementsConnectorParams,
  ClearRefinementsRenderState,
} from "instantsearch.js/es/connectors/clear-refinements/connectClearRefinements";
import type { Renderer } from "instantsearch.js/es/types";
import { provide, ref } from "vue";

export const useAisClearRefinements = (
  widgetParams: ClearRefinementsConnectorParams,
  id: string = "",
) => {
  const stateRef = ref<ClearRefinementsRenderState | null>();
  // 1. Create a render function
  const renderClearRefinements: Renderer<
    ClearRefinementsRenderState,
    ClearRefinementsConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`clearRefinements-${id}`, stateRef);
    }
    return () => null;
  };

  // 2. Create the custom widget
  const customClearRefinements = connectClearRefinements(
    renderClearRefinements,
  );

  // 3. Instantiate
  return {
    ...customClearRefinements(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: id,
  };
};
