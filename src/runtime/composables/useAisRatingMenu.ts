import { connectRatingMenu } from "instantsearch.js/es/connectors/index.umd";
import type {
  RatingMenuRenderState,
  RatingMenuConnectorParams,
} from "instantsearch.js/es/connectors/rating-menu/connectRatingMenu";
import type { Renderer } from "instantsearch.js/es/types";
import { useState } from "#app";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisRatingMenuRenderState = (key: string = "") =>
  useState<Record<string, RatingMenuRenderState>>(
    `ais_rating_menu_render_state${key}`,
    () => ({})
  );
export const useAisRatingMenu = (
  widgetParams: RatingMenuConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<RatingMenuRenderState | null>();
  const ratingMenuRenderState = useAisRatingMenuRenderState(widgetId);
  const widgetIdScope = createWidgetIdScope(widgetId);

  const renderRatingMenu: Renderer<
    RatingMenuRenderState,
    RatingMenuConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;

    if (import.meta.client) {
      ratingMenuRenderState.value[widgetParams.attribute] = renderState;
    }

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("ratingMenu", stateRef);
    }

    return () => {};
  };

  const customConfigure = connectRatingMenu(renderRatingMenu);

  return {
    ...customConfigure(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
