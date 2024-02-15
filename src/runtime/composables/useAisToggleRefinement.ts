import { connectToggleRefinement } from "instantsearch.js/es/connectors";
import type {
  ToggleRefinementConnectorParams,
  ToggleRefinementRenderState,
} from "instantsearch.js/es/connectors/toggle-refinement/connectToggleRefinement";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisToggleRefinement = (
  widgetParams: ToggleRefinementConnectorParams,
) => {
  // 1. Create a render function
  const renderToggleRefinement: Renderer<
    ToggleRefinementRenderState,
    ToggleRefinementConnectorParams
  > = (renderOptions, isFirstRender) => {
    // render nothing
    return () => { };
  };

  // 2. Create the custom widget
  const customToggleRefinement = connectToggleRefinement(
    renderToggleRefinement,
  );

  // 3. Instantiate
  return customToggleRefinement(widgetParams);
};
