import { connectRange } from "instantsearch.js/es/connectors";
import type {
  RangeRenderState,
  RangeConnectorParams,
} from "instantsearch.js/es/connectors/range/connectRange";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "nuxt/app";

export const useAisRangeInputRenderState = () =>
  useState<Record<string, RangeRenderState>>(
    "ais_range_render_state",
    () => ({}),
  );
export const useAisRangeInput = (
  widgetParams: RangeConnectorParams,
) => {
  const rangeRenderState = useAisRangeInputRenderState();
  // 1. Create a render function
  const renderRange: Renderer<
  RangeRenderState,
  RangeConnectorParams
  > = (renderOptions, _) => {
    // save renderState
    if (import.meta.client) {
      rangeRenderState.value[widgetParams.attribute] = renderOptions;
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
  };
};
