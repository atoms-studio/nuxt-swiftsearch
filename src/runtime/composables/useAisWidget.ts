import type { RenderState } from "instantsearch.js";
import { computed, inject, watch, ref, type Ref, triggerRef } from "vue";
import { useAisInstantSearch } from "./useAisInstantSearch";
import { useState } from "nuxt/app";

export const useAisWidget = <const TWidget extends keyof RenderState["string"]>(
  widgetName: TWidget,
  widgetId?: string, // is used for getting a widget with multiple widget instances like clearRefinements
) => {
  const { getInstance } = useAisInstantSearch();
  const instance = getInstance();

  const maybeInjectedIndexName = inject<string | undefined>("index", undefined);
  const maybeInjectedIndexId = inject<string | undefined>("indexId", undefined);

  const indexScope =
    maybeInjectedIndexId ?? maybeInjectedIndexName ?? instance.value.indexName;
  const index = indexScope;
  type _TWidgetRenderState =
    (typeof instance.value.renderState)[typeof index][typeof widgetName];

  type TWidgetRenderState = Ref<NonNullable<_TWidgetRenderState>>;
  const _state = (
    widgetId
      ? inject<any>(`${widgetName}-${indexScope}-${widgetId}`, undefined) ??
        inject<any>(`${widgetName}-${widgetId}`, undefined)
      : ref(instance.value.renderState[index][widgetName]!)
  ) as TWidgetRenderState;

  // cache injected values on client via useState
  const state = import.meta.server
    ? _state
    : widgetId
      ? useState(`${widgetName}-${indexScope}-${widgetId}`, () => _state)
      : _state;
  watch(
    instance,
    () => {
      if (!widgetId) {
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
