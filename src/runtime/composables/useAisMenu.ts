import { connectMenu } from "instantsearch.js/es/connectors/index.umd";
import type {
  MenuRenderState,
  MenuConnectorParams,
} from "instantsearch.js/es/connectors/menu/connectMenu";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "#app";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisMenuRenderState = (key: string = "") =>
  useState<Record<string, MenuRenderState>>(
    `ais_menu_render_state${key}`,
    () => ({})
  );
export const useAisMenu = (
  widgetParams: MenuConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<MenuRenderState | null>();
  const menuRenderState = useAisMenuRenderState(widgetId);
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderMenu: Renderer<MenuRenderState, MenuConnectorParams> = (
    renderState,
    isFirstRender,
  ) => {
    stateRef.value = renderState;
    // save renderState
    if (import.meta.client) {
      menuRenderState.value[widgetParams.attribute] = renderState;
    }

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("menu", stateRef);
    }

    return () => {};
  };

  const customConfigure = connectMenu(renderMenu);

  return {
    ...customConfigure(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
