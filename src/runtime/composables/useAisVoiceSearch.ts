import { connectVoiceSearch } from "instantsearch.js/es/connectors/index.umd";
import type {
  VoiceSearchConnectorParams,
  VoiceSearchRenderState,
} from "instantsearch.js/es/connectors/voice-search/connectVoiceSearch";
import type { Renderer } from "instantsearch.js/es/types";
import { ref } from "vue";
import { createWidgetIdScope } from "./widgetIdScope";

const createServerVoiceSearchWidget = (
  widgetParams: VoiceSearchConnectorParams,
  widgetId: string,
  setIndexScope: (scope: string) => void,
) => {
  const renderState: VoiceSearchRenderState & { widgetParams: VoiceSearchConnectorParams } = {
    isBrowserSupported: false,
    isListening: false,
    toggleListening: () => {},
    voiceListeningState: {
      status: "initial",
      transcript: "",
      isSpeechFinal: false,
      errorCode: undefined,
    },
    widgetParams,
  };

  return {
    $$type: "ais.voiceSearch",
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: setIndexScope,
    init() {},
    render() {},
    dispose({ state }: { state: unknown }) {
      return state;
    },
    getRenderState(renderStateMap: Record<string, unknown>) {
      return {
        ...renderStateMap,
        voiceSearch: renderState,
      };
    },
    getWidgetRenderState() {
      return renderState;
    },
    getWidgetUiState(uiState: Record<string, unknown>) {
      return uiState;
    },
    getWidgetSearchParameters(searchParameters: unknown) {
      return searchParameters;
    },
  };
};

export const useAisVoiceSearch = (
  widgetParams: VoiceSearchConnectorParams = {},
  widgetId: string = "",
) => {
  const stateRef = ref<VoiceSearchRenderState | null>();
  const widgetIdScope = createWidgetIdScope(widgetId);

  if (import.meta.server) {
    return createServerVoiceSearchWidget(
      widgetParams,
      widgetId,
      widgetIdScope.setIndexScope,
    );
  }

  const renderVoiceSearch: Renderer<
    VoiceSearchRenderState,
    VoiceSearchConnectorParams
  > = (renderState, isFirstRender) => {
    stateRef.value = renderState;

    if (isFirstRender) {
      widgetIdScope.provideWidgetState("voiceSearch", stateRef);
    }

    return () => {};
  };

  const customVoiceSearch = connectVoiceSearch(renderVoiceSearch);

  return {
    ...customVoiceSearch(widgetParams),
    $$widgetParams: widgetParams,
    $$widgetId: widgetId,
    $$setIndexScope: widgetIdScope.setIndexScope,
  };
};
