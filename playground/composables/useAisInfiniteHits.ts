import { connectInfiniteHitsWithInsights } from "instantsearch.js/es/connectors";
import type {
  InfiniteHitsConnectorParams,
  InfiniteHitsRenderState,
} from "instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisInfiniteHits = (
  widgetParams: InfiniteHitsConnectorParams,
) => {
  // 1. Create a render function
  const renderInfiniteHits: Renderer<
    InfiniteHitsRenderState,
    InfiniteHitsConnectorParams
  > = (renderOptions, isFirstRender) => {
    // render nothing
    return () => { };
  };

  // 2. Create the custom widget
  const customInfiniteHits =
    connectInfiniteHitsWithInsights(renderInfiniteHits);

  // 3. Instantiate
  return customInfiniteHits(widgetParams);
};
