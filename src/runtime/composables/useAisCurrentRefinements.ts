import { connectCurrentRefinements } from "instantsearch.js/es/connectors/index.umd";
import type {
  CurrentRefinementsConnectorParams,
  CurrentRefinementsRenderState,
} from "instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisCurrentRefinements = (
  widgetParams: CurrentRefinementsConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<CurrentRefinementsRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderCurrentRefinements: Renderer<
    CurrentRefinementsRenderState,
    CurrentRefinementsConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    if (isFirstRender) {
      widgetIdScope.provideWidgetState("currentRefinements", stateRef);
    }

    return () => null;
  };

  // 2. Create the custom widget
  const customCurrentRefinements = connectCurrentRefinements(renderCurrentRefinements);

  // 3. Instantiate
  return {
    ...customCurrentRefinements(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
