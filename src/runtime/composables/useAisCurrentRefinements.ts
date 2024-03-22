import { connectCurrentRefinements } from "instantsearch.js/es/connectors";
import type {
  CurrentRefinementsConnectorParams,
  CurrentRefinementsRenderState,
} from "instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisCurrentRefinements = (
  widgetParams: CurrentRefinementsConnectorParams,
) => {
  // 1. Create a render function
  const renderCurrentRefinements: Renderer<
    CurrentRefinementsRenderState,
    CurrentRefinementsConnectorParams
  > = (_, __) => {
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
  };
};
