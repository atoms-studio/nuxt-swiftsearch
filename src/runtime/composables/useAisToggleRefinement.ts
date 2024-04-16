import { connectToggleRefinement } from "instantsearch.js/es/connectors";
import type {
  ToggleRefinementConnectorParams,
  ToggleRefinementRenderState,
} from "instantsearch.js/es/connectors/toggle-refinement/connectToggleRefinement";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisToggleRefinement = (
  widgetParams: ToggleRefinementConnectorParams,
  id: string = ""
) => {
  const stateRef = ref<ToggleRefinementRenderState | null>();
  // 1. Create a render function
  const renderToggleRefinement: Renderer<
    ToggleRefinementRenderState,
    ToggleRefinementConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`toggleRefinements-${id}`, stateRef);
    }
    // render nothing
    return () => { };
  };

  // 2. Create the custom widget
  const customToggleRefinement = connectToggleRefinement(
    renderToggleRefinement,
  );

  // 3. Instantiate
  return {
    ...customToggleRefinement(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: id
  };
};
