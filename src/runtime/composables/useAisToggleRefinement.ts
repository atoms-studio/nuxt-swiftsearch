import { connectToggleRefinement } from "instantsearch.js/es/connectors";
import type {
  ToggleRefinementConnectorParams,
  ToggleRefinementRenderState,
} from "instantsearch.js/es/connectors/toggle-refinement/connectToggleRefinement";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisToggleRefinement = (
  widgetParams: ToggleRefinementConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<ToggleRefinementRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderToggleRefinement: Renderer<
    ToggleRefinementRenderState,
    ToggleRefinementConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    if (isFirstRender) {
      widgetIdScope.provideWidgetState("toggleRefinement", stateRef);
    }

    return () => {};
  };

  // 2. Create the custom widget
  const customToggleRefinement = connectToggleRefinement(
    renderToggleRefinement,
  );

  // 3. Instantiate
  return {
    ...customToggleRefinement(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
