import type { RenderState } from "instantsearch.js";
import { computed, inject, watch, ref, type Ref, triggerRef } from "vue";
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
  const _state = (
    id
      ? inject<any>(`${widgetName}-${id}`, undefined)
      : ref(instance.value.renderState[index][widgetName]!)
  ) as TWidgetRenderState;

  // cache injected values on client via useState
  const state = import.meta.server
    ? _state
    : id
      ? useState(`${widgetName}-${id}`, () => _state)
      : _state;
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
