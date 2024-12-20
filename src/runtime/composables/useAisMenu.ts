import { connectMenu } from "instantsearch.js/es/connectors";
import type {
  MenuRenderState,
  MenuConnectorParams,
} from "instantsearch.js/es/connectors/menu/connectMenu";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "#app";
import { provide, ref } from "vue";

export const useAisMenuRenderState = (key: string = "") =>
  useState<Record<string, MenuRenderState>>(
    `ais_menu_render_state${key}`,
    () => ({})
  );
export const useAisMenu = (
  widgetParams: MenuConnectorParams,
  id: string = ""
) => {
  const stateRef = ref<MenuRenderState | null>();
  const menuRenderState = useAisMenuRenderState(id);
  // 1. Create a render function
  const renderMenu: Renderer<MenuRenderState, MenuConnectorParams> = (
    renderState,
    isFirstRender
  ) => {
    stateRef.value = renderState;
    // save renderState
    if (import.meta.client) {
      menuRenderState.value[widgetParams.attribute] = renderState;
    }
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`menu-${id}`, stateRef);
    }
    // render nothing, provide render state
    return () => {};
  };
  // 2. Create the custom widget
  const customConfigure = connectMenu(renderMenu);
  // 3. Instantiate
  return {
    ...customConfigure(widgetParams),
    $$widgetParams: widgetParams,
  };
};
