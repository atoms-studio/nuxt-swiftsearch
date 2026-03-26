import { provide } from "vue";

export type ScopedWidget = {
  $$setIndexScope?: (scope: string) => void;
};

export const createWidgetIdScope = (widgetId: string) => {
  let indexScope = "";

  const setIndexScope = (scope: string) => {
    indexScope = scope;
  };

  const provideWidgetState = (widgetName: string, stateRef: unknown) => {
    if (!widgetId) return;

    const key = indexScope
      ? `${widgetName}-${indexScope}-${widgetId}`
      : `${widgetName}-${widgetId}`;

    provide(key, stateRef);
  };

  return {
    setIndexScope,
    provideWidgetState,
  };
};
