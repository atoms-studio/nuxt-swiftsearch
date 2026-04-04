import { connectPoweredBy } from "instantsearch.js/es/connectors/index.umd";
import type {
  PoweredByConnectorParams,
  PoweredByRenderState,
} from "instantsearch.js/es/connectors/powered-by/connectPoweredBy";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisPoweredBy = (
  widgetParams: PoweredByConnectorParams = {},
  widgetId: string = "",
) => {
  const stateRef = ref<PoweredByRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  const renderPoweredBy: Renderer<
    PoweredByRenderState,
    PoweredByConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("poweredBy", stateRef);
    }

    return () => {};
  };

  const customPoweredBy = connectPoweredBy(renderPoweredBy);

  return {
    ...customPoweredBy(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
