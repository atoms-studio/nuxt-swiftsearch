import { connectBreadcrumb } from "instantsearch.js/es/connectors/index.umd";
import type {
  BreadcrumbConnectorParams,
  BreadcrumbRenderState,
} from "instantsearch.js/es/connectors/breadcrumb/connectBreadcrumb";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "nuxt/app";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

const getBreadcrumbAttribute = (widgetParams: BreadcrumbConnectorParams) => {
  return widgetParams.attributes[0] || "";
};

export const useAisBreadcrumbRenderState = (key: string = "") =>
  useState<Record<string, BreadcrumbRenderState>>(
    `ais_breadcrumb_render_state${key}`,
    () => ({}),
  );

export const useAisBreadcrumb = (
  widgetParams: BreadcrumbConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<BreadcrumbRenderState | null>();
  const breadcrumbRenderState = useAisBreadcrumbRenderState(widgetId);
  const widgetIdScope = createWidgetIdScope(widgetId);

  const renderBreadcrumb: Renderer<
    BreadcrumbRenderState,
    BreadcrumbConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;

    if (import.meta.client) {
      breadcrumbRenderState.value[getBreadcrumbAttribute(widgetParams)] = renderState;
    }

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("breadcrumb", stateRef);
    }

    return () => {};
  };

  const customBreadcrumb = connectBreadcrumb(renderBreadcrumb);

  return {
    ...customBreadcrumb(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
