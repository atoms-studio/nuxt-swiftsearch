import { connectInfiniteHitsWithInsights } from "instantsearch.js/es/connectors/index.umd";
import type {
  InfiniteHitsConnectorParams,
  InfiniteHitsRenderState,
} from "instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisInfiniteHits = (
  widgetParams: InfiniteHitsConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<InfiniteHitsRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderInfiniteHits: Renderer<InfiniteHitsRenderState, InfiniteHitsConnectorParams> = (
    renderState,
    isFirstRender,
  ) => {
    stateRef.value = renderState;
    if (isFirstRender) {
      widgetIdScope.provideWidgetState("infiniteHits", stateRef);
    }

    return () => {};
  };

  // 2. Create the custom widget
  const customInfiniteHits = connectInfiniteHitsWithInsights(renderInfiniteHits);

  const significantParams = {
    ...widgetParams,
    cache: false,
    transformItems: null,
  };
  // 3. Instantiate
  return {
    ...customInfiniteHits(widgetParams),
    $$widgetParams: significantParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
