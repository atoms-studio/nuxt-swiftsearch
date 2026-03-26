import { connectClearRefinements } from "instantsearch.js/es/connectors";
import type {
  ClearRefinementsConnectorParams,
  ClearRefinementsRenderState,
} from "instantsearch.js/es/connectors/clear-refinements/connectClearRefinements";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisClearRefinements = (
  widgetParams: ClearRefinementsConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<ClearRefinementsRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderClearRefinements: Renderer<
    ClearRefinementsRenderState,
    ClearRefinementsConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    if (isFirstRender) {
      widgetIdScope.provideWidgetState("clearRefinements", stateRef);
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
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
