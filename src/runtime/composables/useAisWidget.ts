import type { RenderState } from "instantsearch.js";
import { computed, inject, watch, ref, type Ref, triggerRef } from "vue";
import { useInstantSearch } from "./useInstantSearch";
import { useState } from "nuxt/app";

export const useAisWidget = <const TWidget extends keyof RenderState["string"]>(
  widgetName: TWidget,
  widgetId?: string, // is used for getting a widget with multiple widget instances like clearRefinements
) => {
  const { getInstance } = useInstantSearch();
  const instance = getInstance();

  const maybeInjectedIndexName = inject<string | undefined>("index", undefined);
  const maybeInjectedIndexId = inject<string | undefined>("indexId", undefined);
  const maybeInjectedInstanceKey = inject<string | undefined>("instanceKey", undefined);

  const indexScope = maybeInjectedIndexId ?? maybeInjectedIndexName ?? instance.value.indexName;
  const index = indexScope;
  type _TWidgetRenderState = (typeof instance.value.renderState)[typeof index][typeof widgetName];

  type TWidgetRenderState = Ref<NonNullable<_TWidgetRenderState>>;
  const _state = (
    widgetId
      ? (inject<any>(`${widgetName}-${indexScope}-${widgetId}`, undefined) ??
        inject<any>(`${widgetName}-${widgetId}`, undefined))
      : ref(instance.value.renderState[index][widgetName]!)
  ) as TWidgetRenderState;

  // Suffix the cache key with the InstantSearch instance key so widgets with
  // the same widgetName + index + widgetId on different pages do not share
  // Nuxt's app-level useState cache. provide/inject is already scoped to the
  // component tree, but useState is global.
  const instanceSuffix = maybeInjectedInstanceKey ? `-${maybeInjectedInstanceKey}` : "";

  // cache injected values on client via useState
  const state = import.meta.server
    ? _state
    : widgetId
      ? useState(`${widgetName}-${indexScope}-${widgetId}${instanceSuffix}`, () => _state)
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
