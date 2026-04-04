import { connectAutocomplete } from "instantsearch.js/es/connectors/index.umd";
import type {
  AutocompleteConnectorParams,
  AutocompleteRenderState,
} from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

export const useAisAutocomplete = (
  widgetParams: AutocompleteConnectorParams,
  widgetId: string = "",
) => {
  const stateRef = ref<AutocompleteRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  // 1. Create a render function
  const renderAutocomplete: Renderer<
    AutocompleteRenderState,
    AutocompleteConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    if (isFirstRender) {
      widgetIdScope.provideWidgetState("autocomplete", stateRef);
    }

    return () => null;
  };

  const customAutocomplete = connectAutocomplete(renderAutocomplete);

  return {
    ...customAutocomplete(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
