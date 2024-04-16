import { connectStats } from "instantsearch.js/es/connectors";
import type {
  StatsConnectorParams,
  StatsRenderState,
} from "instantsearch.js/es/connectors/stats/connectStats";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisStats = (widgetParams: StatsConnectorParams, id: string = "") => {
  const stateRef = ref<StatsRenderState | null>();
  // 1. Create a render function
  const renderStats: Renderer<StatsRenderState, StatsConnectorParams> = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`stats-${id}`, stateRef);
    }
    // render nothing
    return () => { };
  };

  // 2. Create the custom widget
  const customStats = connectStats(renderStats);

  // 3. Instantiate
  return { ...customStats(widgetParams), $$widgetParams: widgetParams, $$widgetId: id };
};
