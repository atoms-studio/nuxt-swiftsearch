import { connectStats } from "instantsearch.js/es/connectors";
import type {
  StatsConnectorParams,
  StatsRenderState,
} from "instantsearch.js/es/connectors/stats/connectStats";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisStats = (widgetParams: StatsConnectorParams) => {
  // 1. Create a render function
  const renderStats: Renderer<StatsRenderState, StatsConnectorParams> = (
    _,
    __,
  ) => {
    // render nothing
    return () => { };
  };

  // 2. Create the custom widget
  const customStats = connectStats(renderStats);

  // 3. Instantiate
  return { ...customStats(widgetParams), $$widgetParams: widgetParams };
};
