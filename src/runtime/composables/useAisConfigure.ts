import { connectConfigure } from "instantsearch.js/es/connectors";
import type {
  ConfigureConnectorParams,
  ConfigureRenderState,
} from "instantsearch.js/es/connectors/configure/connectConfigure";
import type { Renderer } from "instantsearch.js/es/types";
import { provide, ref } from "vue";

export const useAisConfigure = (widgetParams: ConfigureConnectorParams, id: string = "") => {
  const stateRef = ref<ConfigureRenderState | null>();
  // 1. Create a render function
  const renderConfigure: Renderer<
    ConfigureRenderState,
    ConfigureConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;
    // render nothing, provide render state
    if (isFirstRender) {
      provide(`configure-${id}`, stateRef);
    }
    return () => { };
  };

  // 2. Create the custom widget
  const customConfigure = connectConfigure(renderConfigure);

  // 3. Instantiate
  return { ...customConfigure(widgetParams), $$widgetParams: widgetParams, $$widgetId: id};
};
