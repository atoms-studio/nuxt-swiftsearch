import { connectHitsWithInsights } from "instantsearch.js/es/connectors";
import type {
  HitsConnectorParams,
  HitsRenderState,
} from "instantsearch.js/es/connectors/hits/connectHits";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisHits = (
  widgetParams: HitsConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<HitsRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderHits: Renderer<
    HitsRenderState,
    HitsConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    if (isFirstRender) {
      widgetIdScope.provideWidgetState("hits", stateRef);
    }

    return () => {};
  };

  // 2. Create the custom widget
  const customHits =
    connectHitsWithInsights(renderHits);

  // 3. Instantiate
  return {
    ...customHits(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
