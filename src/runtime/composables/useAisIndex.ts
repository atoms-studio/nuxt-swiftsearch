import { index } from "instantsearch.js/es/widgets";
import type { IndexWidgetParams } from "instantsearch.js/es/widgets/index/index";
import type { ScopedWidget } from "./widgetIdScope";

export const useAisIndex = (widgetParams: IndexWidgetParams) => {
  const widget = index(widgetParams);
  const indexScope = widgetParams.indexId ?? widgetParams.indexName ?? "";
  const _addWidgets = widget.addWidgets.bind(widget);

  const scopeWidget = (childWidget: ScopedWidget | ScopedWidget[]) => {
    if (Array.isArray(childWidget)) {
      childWidget.forEach(scopeWidget);
      return;
    }

    childWidget.$$setIndexScope?.(indexScope);
  };

  widget.addWidgets = (widgets) => {
    widgets.forEach((childWidget) => {
      scopeWidget(childWidget as ScopedWidget | ScopedWidget[]);
    });

    return _addWidgets(widgets);
  };

  return widget;
};
