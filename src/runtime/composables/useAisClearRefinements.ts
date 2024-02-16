import { connectClearRefinements } from "instantsearch.js/es/connectors";
import type {
  ClearRefinementsConnectorParams,
  ClearRefinementsRenderState,
} from "instantsearch.js/es/connectors/clear-refinements/connectClearRefinements";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisClearRefinements = (
  widgetParams: ClearRefinementsConnectorParams,
) => {
  // 1. Create a render function
  const renderClearRefinements: Renderer<
    ClearRefinementsRenderState,
    ClearRefinementsConnectorParams
  > = (_, __) => {
    // render nothing
    return () => null;
  };

  // 2. Create the custom widget
  const customClearRefinements = connectClearRefinements(
    renderClearRefinements,
  );

  // 3. Instantiate
  return customClearRefinements(widgetParams);
};
