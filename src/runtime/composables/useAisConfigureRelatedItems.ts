import { EXPERIMENTAL_connectConfigureRelatedItems } from "instantsearch.js/es/connectors/index.umd";
import type { ConfigureRelatedItemsConnectorParams } from "instantsearch.js/es/connectors/configure-related-items/connectConfigureRelatedItems";
import type { ConfigureRenderState } from "instantsearch.js/es/connectors/configure/connectConfigure";
import type { Renderer } from "instantsearch.js/es/types";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisConfigureRelatedItems = (
  widgetParams: ConfigureRelatedItemsConnectorParams,
  widgetId: string = "",
) => {
  const widgetIdScope = createWidgetIdScope(widgetId);

  const renderConfigureRelatedItems: Renderer<
    ConfigureRenderState,
    ConfigureRelatedItemsConnectorParams
  > = () => {
    return () => {};
  };

  const customConfigureRelatedItems = EXPERIMENTAL_connectConfigureRelatedItems(
    renderConfigureRelatedItems,
  );

  return {
    ...customConfigureRelatedItems(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
