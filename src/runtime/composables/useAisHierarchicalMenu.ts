import { connectHierarchicalMenu } from "instantsearch.js/es/connectors/index.umd";
import type {
  HierarchicalMenuRenderState,
  HierarchicalMenuConnectorParams,
} from "instantsearch.js/es/connectors/hierarchical-menu/connectHierarchicalMenu";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "nuxt/app";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisHierarchicalMenuRenderState = (key: string = "") =>
  useState<Record<string, HierarchicalMenuRenderState>>(
    `ais_hierarchical_menu_render_state${key}`,
    () => ({}),
  );
export const useAisHierarchicalMenu = (
  widgetParams: HierarchicalMenuConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<HierarchicalMenuRenderState | null>();
  const hierarchicalRenderState = useAisHierarchicalMenuRenderState(widgetId);
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderHierarchicalMenu: Renderer<
    HierarchicalMenuRenderState,
    HierarchicalMenuConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // save renderState
    if (import.meta.client) {
      hierarchicalRenderState.value[widgetParams.attributes[0]] = renderState;
    }

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("hierarchicalMenu", stateRef);
    }

    return () => null;
  };

  // 2. Create the custom widget
  const customHierarchicalMenu = connectHierarchicalMenu(
    renderHierarchicalMenu,
  );

  // 3. Instantiate
  return {
    ...customHierarchicalMenu(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
