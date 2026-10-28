import { toRaw, type Ref } from "vue";
import { getWidgetStateRegistry, widgetStateKey } from "./widgetStateRegistry";

export type ScopedWidget = {
  $$setIndexScope?: (scope: string) => void;
};

export const createWidgetIdScope = (widgetId: string) => {
  let indexScope = "";

  const setIndexScope = (scope: string) => {
    indexScope = scope;
  };

  // Call on the first render, after the render state is stored in `stateRef`.
  // Every connector passes `instantSearchInstance` in its render state, so
  // the registry of the right instance is found without any global state.
  const provideWidgetState = (widgetName: string, stateRef: Ref<unknown>) => {
    if (!widgetId) return;

    const renderState = toRaw(stateRef.value) as { instantSearchInstance?: object } | null;
    const instance = renderState?.instantSearchInstance;
    if (!instance) return;

    getWidgetStateRegistry(instance)[widgetStateKey(widgetName, indexScope, widgetId)] = stateRef;
  };

  return {
    setIndexScope,
    provideWidgetState,
  };
};
