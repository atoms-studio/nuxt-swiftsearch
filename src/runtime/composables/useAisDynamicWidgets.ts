import { connectDynamicWidgets } from "instantsearch.js/es/connectors/index.umd";
import type {
  DynamicWidgetsConnectorParams,
  DynamicWidgetsRenderState,
} from "instantsearch.js/es/connectors/dynamic-widgets/connectDynamicWidgets";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisDynamicWidgets = (
  widgetParams: Partial<DynamicWidgetsConnectorParams> = {},
  widgetId: string = "",
) => {
  const stateRef = ref<DynamicWidgetsRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  const renderDynamicWidgets: Renderer<DynamicWidgetsRenderState, DynamicWidgetsConnectorParams> = (
    renderState,
    isFirstRender,
  ) => {
    stateRef.value = renderState;

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("dynamicWidgets", stateRef);
    }

    return () => {};
  };

  const customDynamicWidgets = connectDynamicWidgets(renderDynamicWidgets);
  const resolvedWidgetParams: DynamicWidgetsConnectorParams = {
    widgets: [],
    ...widgetParams,
  };

  return {
    ...customDynamicWidgets(resolvedWidgetParams),
    $$widgetParams: resolvedWidgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
