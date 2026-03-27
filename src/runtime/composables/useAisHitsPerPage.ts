import { connectHitsPerPage } from "instantsearch.js/es/connectors/index.umd";
import type {
  HitsPerPageConnectorParams,
  HitsPerPageRenderState,
} from "instantsearch.js/es/connectors/hits-per-page/connectHitsPerPage";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisHitsPerPage = (
  widgetParams: HitsPerPageConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<HitsPerPageRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  const renderHitsPerPage: Renderer<
    HitsPerPageRenderState,
    HitsPerPageConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("hitsPerPage", stateRef);
    }

    return () => {};
  };

  const customHitsPerPage = connectHitsPerPage(renderHitsPerPage);

  return {
    ...customHitsPerPage(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
