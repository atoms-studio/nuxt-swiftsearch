import { connectStats } from "instantsearch.js/es/connectors";
import type {
  StatsConnectorParams,
  StatsRenderState,
} from "instantsearch.js/es/connectors/stats/connectStats";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisStats = (
  widgetParams: StatsConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<StatsRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderStats: Renderer<StatsRenderState, StatsConnectorParams> = (
    renderState,
    isFirstRender,
  ) => {
    stateRef.value = renderState;
    if (isFirstRender) {
      widgetIdScope.provideWidgetState("stats", stateRef);
    }

    return () => {};
  };

  const customStats = connectStats(renderStats);

  return {
    ...customStats(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
