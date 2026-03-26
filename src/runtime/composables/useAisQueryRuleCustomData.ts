import { connectQueryRules } from "instantsearch.js/es/connectors";
import type {
  QueryRulesRenderState,
  QueryRulesConnectorParams,
} from "instantsearch.js/es/connectors/query-rules/connectQueryRules";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisQueryRuleCustomData = (
  widgetParams: QueryRulesConnectorParams = {},
  widgetId: string = "",
) => {
  const stateRef = ref<QueryRulesRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  const renderQueryRules: Renderer<
    QueryRulesRenderState,
    QueryRulesConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("queryRules", stateRef);
    }

    return () => {};
  };

  const customQueryRules = connectQueryRules(renderQueryRules);

  return {
    ...customQueryRules(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
