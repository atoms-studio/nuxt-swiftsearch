import type { RenderState } from "instantsearch.js";
import { computed, inject } from "vue";
import { useInstantSearch } from "./useInstantSearch";

export const useAisWidget = <const TWidget extends keyof RenderState["string"]>(
  widgetName: TWidget,
) => {
  const { getInstance } = useInstantSearch();
  const instance = getInstance();

  const maybeInjectedIndex = inject<string | undefined>("index", undefined);

  const state = computed(() => {
    const index = maybeInjectedIndex ?? instance.value.indexName;
    return instance.value.renderState[index][widgetName]!;
  });

  if (!state.value)
    throw new Error(
      `Connector for component ${widgetName} not found, did you forget to add the proper widget?`,
    );

  const widgetParams = computed(() => state.value.widgetParams);

  return {
    instance,
    state,
    widgetParams,
  };
};
