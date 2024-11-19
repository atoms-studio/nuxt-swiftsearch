import { connectRange } from "instantsearch.js/es/connectors";
import type {
  RangeRenderState,
  RangeConnectorParams,
} from "instantsearch.js/es/connectors/range/connectRange";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "nuxt/app";
import { provide, ref } from "vue";

export const useAisRangeInputRenderState = (key: string = "") =>
  useState<Record<string, RangeRenderState>>(
    `ais_range_render_state${key}`,
    () => ({}),
  );
export const useAisRangeInput = (
  widgetParams: RangeConnectorParams,
  id: string = ""
) => {
  const stateRef = ref<RangeRenderState | null>();
  const rangeRenderState = useAisRangeInputRenderState(id);
  // 1. Create a render function
  const renderRange: Renderer<
  RangeRenderState,
  RangeConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // save renderState
    if (import.meta.client) {
      rangeRenderState.value[widgetParams.attribute] = renderState;
    }
    if (isFirstRender) {
      provide(`rangeInput-${id}`, stateRef);
    }
    // render nothing
    return () => null;
  };

  // 2. Create the custom widget
  const customRange = connectRange(renderRange);

  // 3. Instantiate
  return {
    ...customRange(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: id
  };
};
