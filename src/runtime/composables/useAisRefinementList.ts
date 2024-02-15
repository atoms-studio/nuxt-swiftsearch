import { connectRefinementList } from "instantsearch.js/es/connectors";
import type {
  RefinementListRenderState,
  RefinementListConnectorParams,
} from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "nuxt/app";

export const useAisRefinementListRenderState = () =>
  useState<Record<string, RefinementListRenderState>>(
    "ais_refinement_render_state",
    () => ({}),
  );
export const useAisRefinementList = (
  widgetParams: RefinementListConnectorParams,
) => {
  const refinementRenderState = useAisRefinementListRenderState();
  // 1. Create a render function
  const renderRefinementList: Renderer<
    RefinementListRenderState,
    RefinementListConnectorParams
  > = (renderOptions, _) => {
    // save renderState
    if (import.meta.client) {
      refinementRenderState.value[widgetParams.attribute] = renderOptions;
    }
    // render nothing
    return () => null;
  };

  // 2. Create the custom widget
  const customRefinementList = connectRefinementList(renderRefinementList);

  // 3. Instantiate
  return customRefinementList(widgetParams);
};
