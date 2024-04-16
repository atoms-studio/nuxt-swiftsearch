import { connectHitsWithInsights } from "instantsearch.js/es/connectors";
import type {
  HitsConnectorParams,
  HitsRenderState,
} from "instantsearch.js/es/connectors/hits/connectHits";
import type { Renderer } from "instantsearch.js/es/types";
import { provide, ref } from "vue";

export const useAisHits = (
  widgetParams: HitsConnectorParams,
  id: string = "",
) => {
  const stateRef = ref<HitsRenderState | null>();
  // 1. Create a render function
  const renderHits: Renderer<
    HitsRenderState,
    HitsConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`hits-${id}`, stateRef);
    }
    // render nothing
    return () => { };
  };

  // 2. Create the custom widget
  const customHits =
    connectHitsWithInsights(renderHits);

  // 3. Instantiate
  return { ...customHits(widgetParams), $$widgetParams: widgetParams, $$widgetId: id };
};
