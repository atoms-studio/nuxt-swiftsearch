import { connectQueryRules } from "instantsearch.js/es/connectors/index.umd";
import type {
  QueryRulesConnectorParams,
  QueryRulesRenderState,
} from "instantsearch.js/es/connectors/query-rules/connectQueryRules";
import type { Renderer } from "instantsearch.js/es/types";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisQueryRuleContext = (
  widgetParams: QueryRulesConnectorParams,
  widgetId: string = "",
) => {
  const widgetIdScope = createWidgetIdScope(widgetId);

  const renderQueryRules: Renderer<
    QueryRulesRenderState,
    QueryRulesConnectorParams
  > = () => {
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
