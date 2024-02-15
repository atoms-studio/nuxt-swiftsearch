import { connectConfigure } from "instantsearch.js/es/connectors";
import type {
  ConfigureConnectorParams,
  ConfigureRenderState,
} from "instantsearch.js/es/connectors/configure/connectConfigure";
import type { Renderer } from "instantsearch.js/es/types";

export const useAisConfigure = (widgetParams: ConfigureConnectorParams) => {
  // 1. Create a render function
  const renderConfigure: Renderer<
    ConfigureRenderState,
    ConfigureConnectorParams
  > = (renderOptions, isFirstRender) => {
    // render nothing
    return () => { };
  };

  // 2. Create the custom widget
  const customConfigure = connectConfigure(renderConfigure);

  // 3. Instantiate
  return customConfigure(widgetParams);
};
