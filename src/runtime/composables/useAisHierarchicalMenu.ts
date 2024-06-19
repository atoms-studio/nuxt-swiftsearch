import { connectHierarchicalMenu } from "instantsearch.js/es/connectors";
import type {
  HierarchicalMenuRenderState,
  HierarchicalMenuConnectorParams,
} from "instantsearch.js/es/connectors/hierarchical-menu/connectHierarchicalMenu";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "nuxt/app";
import { provide, ref } from "vue";

export const useAisHierarchicalMenuRenderState = () =>
  useState<Record<string, HierarchicalMenuRenderState> | null>(
    "ais_hierarchical_menu_render_state",
    () => ({}),
  );
export const useAisHierarchicalMenu = (
  widgetParams: HierarchicalMenuConnectorParams,
  id: string = "",
) => {
  const stateRef = ref<HierarchicalMenuRenderState | null>();
  const hierarchicalRenderState = useAisHierarchicalMenuRenderState();
  // 1. Create a render function
  const renderHierarchicalMenu: Renderer<
    HierarchicalMenuRenderState,
    HierarchicalMenuConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // save renderState
    if (import.meta.client) {
      if (!hierarchicalRenderState.value) {
        hierarchicalRenderState.value = {};
      }
      hierarchicalRenderState.value[widgetParams.attributes[0]] = renderState;
    }
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`hierarchical-menu-${id}`, stateRef);
    }
    // render nothing
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
    $$widgetId: id,
  };
};
