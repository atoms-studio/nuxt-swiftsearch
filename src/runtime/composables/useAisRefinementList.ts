import { connectRefinementList } from "instantsearch.js/es/connectors";
import type {
  RefinementListRenderState,
  RefinementListConnectorParams,
} from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "nuxt/app";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisRefinementListRenderState = (key: string = "") =>
  useState<Record<string, RefinementListRenderState>>(
    `ais_refinement_render_state${key}`,
    () => ({}),
  );
export const useAisRefinementList = (
  widgetParams: RefinementListConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<RefinementListRenderState | null>();
  const refinementRenderState = useAisRefinementListRenderState(widgetId);
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderRefinementList: Renderer<
    RefinementListRenderState,
    RefinementListConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // save renderState
    if (import.meta.client) {
      refinementRenderState.value[widgetParams.attribute] = renderState;
    }

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("refinementList", stateRef);
    }

    return () => null;
  };

  // 2. Create the custom widget
  const customRefinementList = connectRefinementList(renderRefinementList);

  // 3. Instantiate
  return {
    ...customRefinementList(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
