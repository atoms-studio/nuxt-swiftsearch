import { connectCurrentRefinements } from "instantsearch.js/es/connectors";
import type {
  CurrentRefinementsConnectorParams,
  CurrentRefinementsRenderState,
} from "instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisCurrentRefinements = (
  widgetParams: CurrentRefinementsConnectorParams,
  id: string = "",
) => {
  const stateRef = ref<CurrentRefinementsRenderState | null>();
  // 1. Create a render function
  const renderCurrentRefinements: Renderer<
    CurrentRefinementsRenderState,
    CurrentRefinementsConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`currentRefinements-${id}`, stateRef);
    }
    // render nothing
    return () => null;
  };

  // 2. Create the custom widget
  const customCurrentRefinements = connectCurrentRefinements(
    renderCurrentRefinements,
  );

  // 3. Instantiate
  return {
    ...customCurrentRefinements(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: id
  };
};
