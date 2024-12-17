import { connectAutocomplete } from "instantsearch.js/es/connectors";
import type {
  AutocompleteConnectorParams,
  AutocompleteRenderState,
} from "instantsearch.js/es/connectors/autocomplete/connectAutocomplete";
import type { Renderer } from "instantsearch.js/es/types";
import { provide, ref } from "vue";

export const useAisAutocomplete = (widgetParams: AutocompleteConnectorParams, id: string = "") => {
  const stateRef = ref<AutocompleteRenderState | null>();
  // 1. Create a render function
  const renderAutocomplete: Renderer<
    AutocompleteRenderState,
    AutocompleteConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`autocomplete-${id}`, stateRef);
    }
    // render nothing
    return () => null;
  };

  // 2. Create the custom widget
  const customAutocomplete = connectAutocomplete(renderAutocomplete);

  // 3. Instantiate
  return { ...customAutocomplete(widgetParams), $$widgetParams: widgetParams, $$widgetId: id };
};
