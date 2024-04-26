import { connectInfiniteHitsWithInsights } from "instantsearch.js/es/connectors";
import type {
  InfiniteHitsConnectorParams,
  InfiniteHitsRenderState,
} from "instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits";
import type { Renderer } from "instantsearch.js/es/types";
import { provide, ref } from "vue";

export const useAisInfiniteHits = (
  widgetParams: InfiniteHitsConnectorParams,
  id: string = "",
) => {
  const stateRef = ref<InfiniteHitsRenderState | null>();
  // 1. Create a render function
  const renderInfiniteHits: Renderer<
    InfiniteHitsRenderState,
    InfiniteHitsConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`infiniteHits-${id}`, stateRef);
    }
    // render nothing
    return () => {};
  };

  // 2. Create the custom widget
  const customInfiniteHits =
    connectInfiniteHitsWithInsights(renderInfiniteHits);

  const significantParams = {
    ...widgetParams,
    cache: false,
    transformItems: null,
  };
  // 3. Instantiate
  return {
    ...customInfiniteHits(widgetParams),
    $$widgetParams: significantParams,
    $$widgetId: id,
  };
};
