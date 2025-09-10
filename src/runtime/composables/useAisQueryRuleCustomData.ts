import { connectQueryRules } from "instantsearch.js/es/connectors";
import type {
  QueryRulesRenderState,
  QueryRulesConnectorParams,
} from "instantsearch.js/es/connectors/query-rules/connectQueryRules";
import type { Renderer } from "instantsearch.js/es/types";
import { provide, ref } from "vue";

export const useAisQueryRuleCustomData = (
  widgetParams: QueryRulesConnectorParams = {},
  id: string = ""
) => {
  const stateRef = ref<QueryRulesRenderState | null>();

  const renderQueryRules: Renderer<QueryRulesRenderState, QueryRulesConnectorParams> = (
    renderState,
    isFirstRender
  ) => {
    stateRef.value = renderState;

    if (isFirstRender) {
      provide(`queryRules-${id}`, stateRef);
    }

    return () => { };
  };

  const customQueryRules = connectQueryRules(renderQueryRules);

  return {
    ...customQueryRules(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: id,
  };
};
