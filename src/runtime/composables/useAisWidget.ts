import type { RenderState } from "instantsearch.js";
import { computed, inject, watch, ref } from "vue";
import { useInstantSearch } from "./useInstantSearch";

export const useAisWidget = <const TWidget extends keyof RenderState["string"]>(
  widgetName: TWidget,
  id?: string, // is used for getting a widget with multiple widget instances like clearRefinements
) => {
  const { getInstance } = useInstantSearch();
  const instance = getInstance();

  const maybeInjectedIndex = inject<string | undefined>("index", undefined);

  const index = maybeInjectedIndex ?? instance.value.indexName;
  type _TWidgetRenderState =
    (typeof instance.value.renderState)[typeof index][typeof widgetName];

  type TWidgetRenderState = Ref<NonNullable<_TWidgetRenderState>>;
  const state = (
    id
      ? inject<TWidgetRenderState>(`${widgetName}-${id}`)
      : ref(instance.value.renderState[index][widgetName]!)
  ) as TWidgetRenderState;

  watch(
    instance,
    () => {
      if (!id) {
        // @ts-ignore
        state.value = instance.value.renderState[index][widgetName]!;
      } else {
        triggerRef(state);
      }
    },
    { deep: true },
  );

  if (!state.value)
    throw new Error(
      `Connector for component ${widgetName} not found, did you forget to add the proper widget?`,
    );

  const widgetParams = computed(() => state.value!.widgetParams);

  return {
    instance,
    state,
    widgetParams,
  };
};
