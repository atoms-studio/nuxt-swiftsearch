import { connectRatingMenu } from "instantsearch.js/es/connectors";
import type {
  RatingMenuRenderState,
  RatingMenuConnectorParams,
} from "instantsearch.js/es/connectors/rating-menu/connectRatingMenu";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "#app";
import { provide, ref } from "vue";

export const useAisRatingMenuRenderState = (key: string = "") =>
  useState<Record<string, RatingMenuRenderState>>(
    `ais_rating_menu_render_state${key}`,
    () => ({})
  );
export const useAisRatingMenu = (
  widgetParams: RatingMenuConnectorParams,
  id: string = ""
) => {
  const stateRef = ref<RatingMenuRenderState | null>();
  const ratingMenuRenderState = useAisRatingMenuRenderState(id);
  const renderRatingMenu: Renderer<RatingMenuRenderState, RatingMenuConnectorParams> = (
    renderState,
    isFirstRender
  ) => {
    stateRef.value = renderState;
    if (import.meta.client) {
      ratingMenuRenderState.value[widgetParams.attribute] = renderState;
    }
    if (isFirstRender) {
      provide(`ratingMenu-${id}`, stateRef);
    }
    return () => { };
  };
  const customConfigure = connectRatingMenu(renderRatingMenu);
  return {
    ...customConfigure(widgetParams),
    $$widgetParams: widgetParams,
  };
};
