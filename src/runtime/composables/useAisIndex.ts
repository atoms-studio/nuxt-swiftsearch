import { index } from "instantsearch.js/es/widgets/index.js";
import type { IndexWidgetParams } from "instantsearch.js/es/widgets/index/index";
import type { ScopedWidget } from "./widgetIdScope";

export const useAisIndex = (widgetParams: IndexWidgetParams) => {
  const widget = index(widgetParams);
  const indexScope = widgetParams.indexId ?? widgetParams.indexName ?? "";
  const addWidgets = widget.addWidgets.bind(widget);
  const updateWidget = widget.updateWidget.bind(widget);

  const scopeWidget = (childWidget: ScopedWidget | ScopedWidget[]) => {
    if (Array.isArray(childWidget)) {
      childWidget.forEach(scopeWidget);
      return;
    }

    childWidget.$$setIndexScope?.(indexScope);
  };

  // Every way a child widget enters this index sets its index scope first, so
  // that it registers its state under the scoped key.
  widget.addWidgets = (widgets) => {
    widgets.forEach((childWidget) => {
      scopeWidget(childWidget as ScopedWidget | ScopedWidget[]);
    });

    return addWidgets(widgets);
  };

  widget.updateWidget = (previousWidget, nextWidget) => {
    scopeWidget(nextWidget as ScopedWidget);
    return updateWidget(previousWidget, nextWidget);
  };

  return widget;
};
