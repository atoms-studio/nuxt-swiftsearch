import { connectNumericMenu } from "instantsearch.js/es/connectors";
import type {
  NumericMenuRenderState,
  NumericMenuConnectorParams,
} from "instantsearch.js/es/connectors/numeric-menu/connectNumericMenu";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "#app";
import { provide, ref } from "vue";

export const useAisNumericMenuRenderState = (key: string = "") =>
  useState<Record<string, NumericMenuRenderState>>(
    `ais_numeric_menu_render_state${key}`,
    () => ({})
  );
export const useAisNumericMenu = (
  widgetParams: NumericMenuConnectorParams,
  id: string = ""
) => {
  const stateRef = ref<NumericMenuRenderState | null>();
  const numericMenuRenderState = useAisNumericMenuRenderState(id);
  const renderNumericMenu: Renderer<NumericMenuRenderState, NumericMenuConnectorParams> = (
    renderState,
    isFirstRender
  ) => {
    stateRef.value = renderState;
    if (import.meta.client) {
      numericMenuRenderState.value[widgetParams.attribute] = renderState;
    }
    if (isFirstRender) {
      provide(`numericMenu-${id}`, stateRef);
    }
    return () => { };
  };
  const customConfigure = connectNumericMenu(renderNumericMenu);
  return {
    ...customConfigure(widgetParams),
    $$widgetParams: widgetParams,
  };
};
