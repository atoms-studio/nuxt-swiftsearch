import type {
  DynamicWidgetsConnectorParams,
  DynamicWidgetsRenderState,
} from "instantsearch.js/es/connectors/dynamic-widgets/connectDynamicWidgets";
import type { IndexRenderState, WidgetRenderState } from "instantsearch.js/es/types";
import { computed, inject, shallowRef, watchEffect, type Ref } from "vue";
import { useInstantSearch } from "./useInstantSearch";
import { getWidgetStateRegistry, widgetStateKey } from "./widgetStateRegistry";

// instantsearch.js does not list `dynamicWidgets` in IndexRenderState, but the
// connector stores its render state under that key.
export type AisIndexRenderState = IndexRenderState & {
  dynamicWidgets?: WidgetRenderState<DynamicWidgetsRenderState, DynamicWidgetsConnectorParams>;
};

export const useAisWidget = <const TWidget extends keyof AisIndexRenderState>(
  widgetName: TWidget,
  widgetId?: string, // is used for getting a widget with multiple widget instances like clearRefinements
) => {
  const { getInstance } = useInstantSearch();
  const instance = getInstance();

  const injectedIndexScope =
    inject<string | undefined>("indexId", undefined) ??
    inject<string | undefined>("index", undefined);
  const indexScope = injectedIndexScope ?? instance.value.indexName;

  type TWidgetRenderState = NonNullable<AisIndexRenderState[TWidget]>;
  let state: Ref<TWidgetRenderState | undefined>;

  if (widgetId) {
    // The widget wrote its state ref into the registry on its first render.
    // The computed tracks the key, so it also resolves a widget that registers later.
    const registry = getWidgetStateRegistry(instance.value);
    state = computed(
      () =>
        (
          registry[widgetStateKey(widgetName, injectedIndexScope ?? "", widgetId)] ??
          registry[widgetStateKey(widgetName, "", widgetId)]
        )?.value as TWidgetRenderState | undefined,
    );
  } else {
    // Without an id there is one widget of this type per index: read its render
    // state again each time the instance is triggered after a render.
    const unkeyedState = shallowRef<TWidgetRenderState | undefined>();
    watchEffect(() => {
      const indexRenderState = instance.value.renderState[indexScope] as
        | AisIndexRenderState
        | undefined;
      unkeyedState.value = indexRenderState?.[widgetName] as TWidgetRenderState | undefined;
    });
    state = unkeyedState;
  }

  if (!state.value) {
    throw new Error(
      `Connector for component ${widgetName} not found, did you forget to add the proper widget? ` +
        `Common causes: the widget lives in a child component (enable the swiftsearch.childWidgetDiscovery module option, ` +
        `or declare the widget in the file containing <AisInstantSearch>), the component could not be resolved to a file, ` +
        `or the build logged a "[nuxt-swiftsearch]" warning for this element. See the declarative transform docs.`,
    );
  }

  type TWidgetParams = TWidgetRenderState extends { widgetParams: infer P } ? P : unknown;
  const widgetParams = computed(
    () => (state.value as { widgetParams?: TWidgetParams } | undefined)?.widgetParams,
  );

  return {
    instance,
    state: state as Ref<TWidgetRenderState>,
    widgetParams,
  };
};
