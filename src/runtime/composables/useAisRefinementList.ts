import { connectRefinementList } from "instantsearch.js/es/connectors";
import type {
  RefinementListRenderState,
  RefinementListConnectorParams,
} from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "nuxt/app";
import { provide, ref } from "vue";

export const useAisRefinementListRenderState = () =>
  useState<Record<string, RefinementListRenderState> | null>(
    "ais_refinement_render_state",
    () => ({}),
  );
export const useAisRefinementList = (
  widgetParams: RefinementListConnectorParams,
  id: string = "",
) => {
  const stateRef = ref<RefinementListRenderState | null>();
  const refinementRenderState = useAisRefinementListRenderState();
  // 1. Create a render function
  const renderRefinementList: Renderer<
    RefinementListRenderState,
    RefinementListConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // save renderState
    if (import.meta.client) {
      if (!refinementRenderState.value)
        // @ts-ignore
        refinementRenderState.value = {};
      // @ts-ignore
      refinementRenderState.value[widgetParams.attribute] = renderState;
    }
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`refinementList-${id}`, stateRef);
    }
    // render nothing
    return () => null;
  };

  // 2. Create the custom widget
  const customRefinementList = connectRefinementList(renderRefinementList);

  // 3. Instantiate
  return {
    ...customRefinementList(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: id,
  };
};
