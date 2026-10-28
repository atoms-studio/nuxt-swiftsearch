import type {
  IndexWidget,
  InstantSearch,
  InstantSearchStatus,
  Widget,
} from "instantsearch.js/es/types";
import { hash } from "ohash";
import { waitForResults, getInitialResults } from "instantsearch.js/es/lib/server";
import { isIndexWidget } from "instantsearch.js/es/lib/utils";
import { computed, inject, nextTick, provide, shallowRef, triggerRef, type Ref } from "vue";
import { useState, createError } from "nuxt/app";

import { type InitialResults } from "instantsearch.js/es";

const STATUS_KEY = "swiftsearchStatus";
const ERROR_KEY = "swiftsearchError";

export const useInstantSearch = (instance?: Ref<InstantSearch> | null) => {
  const _searchInstance =
    instance ?? (inject<Ref<InstantSearch | null>>("searchInstance") as Ref<InstantSearch>);

  let status = inject<Ref<InstantSearchStatus> | null>(STATUS_KEY, null);
  let error = inject<Ref<Error | undefined> | null>(ERROR_KEY, null);
  if (!status || !error) {
    status = shallowRef<InstantSearchStatus>("idle");
    error = shallowRef<Error | undefined>(undefined);
    provide(STATUS_KEY, status);
    provide(ERROR_KEY, error);
  }

  const getInstance = () => {
    if (!_searchInstance || _searchInstance.value === null) {
      throw new Error("instantiate instantsearch first");
    }
    return _searchInstance as Ref<InstantSearch>;
  };

  const parentIndex = computed(() => {
    return getInstance().value.mainIndex;
  });
  const setup = async (widgets: Array<Widget | IndexWidget>, instanceKey: string = "") => {
    const _results = useState<InitialResults | null>(`instantsearch_ssr_results_${instanceKey}`);
    const instance = getInstance();
    const mainIndex = instance.value.mainIndex;

    if (!mainIndex.getWidgets().length) {
      mainIndex.addWidgets(widgets);
    } else {
      applyWidgetDiff(mainIndex, widgets);
    }

    if (!instance.value.started && !_results.value) {
      instance.value.start();
      instance.value.started = false;
      const params = await waitForResults(instance.value);
      _results.value = getInitialResults(instance.value.mainIndex, params);
    }
    if (!_results.value && import.meta.client) {
      // navigating to another page client side
      // can i await results?
      // awaiting for search queue empty before page change
      await nextTick(async () => {
        await new Promise((resolve) => {
          if (!instance.value.mainHelper!.hasPendingRequests()) resolve(true);
          instance.value.mainHelper!.once("searchQueueEmpty", () => resolve(true));
        });
      });
    }
    // if on client and we find results from server
    if (_results.value && import.meta.client) {
      instance.value._initialResults = _results.value;
      // clear results in case of page change
      _results.value = null;
    }

    if (!instance.value.started && import.meta.client) {
      nextTick(async () => {
        instance.value.mainHelper?.on("searchQueueEmpty", () => {
          instance.value.once("render", () => {
            triggerRef(_searchInstance);
          });
        });
      });

      instance.value.on("error", ({ error: searchError }) => {
        error!.value = searchError;
        status!.value = "error";
        throw createError({
          statusCode: 500,
          statusMessage: searchError,
        });
      });
      instance.value.start();
      attachStatusListeners(instance.value, status!, error!);
    }
  };

  return {
    getInstance,
    parentIndex,
    setup,
    status,
    error,
  };
};

type DiffableWidget = (Widget | IndexWidget) & {
  $$widgetId?: string;
  $$widgetParams?: unknown;
};

const widgetIdentity = (widget: DiffableWidget) => {
  if (isIndexWidget(widget)) return `index:${widget.getIndexId()}`;
  if (widget.$$widgetId) return `id:${widget.$$type}:${widget.$$widgetId}`;
  return `params:${widget.$$type}:${hash(widget.$$widgetParams ?? null)}`;
};

// Brings the widgets of `parent` in line with `nextWidgets`, a freshly built
// widget tree. Widgets match by id (by params when they have no id):
// - same params: the current widget stays, and the new object is dropped.
// - other params: updateWidget swaps it in place and keeps its UI state.
// - index widgets: the diff continues into their children.
// Removed widgets clean their own refinements on dispose. The refinements of
// all other widgets stay.
const applyWidgetDiff = (parent: IndexWidget, nextWidgets: Array<Widget | IndexWidget>) => {
  const current = new Map<string, DiffableWidget>();
  for (const widget of parent.getWidgets() as DiffableWidget[]) {
    current.set(widgetIdentity(widget), widget);
  }

  const toAdd: Array<Widget | IndexWidget> = [];
  for (const next of nextWidgets as DiffableWidget[]) {
    const identity = widgetIdentity(next);
    const existing = current.get(identity);
    current.delete(identity);

    if (!existing) {
      toAdd.push(next);
    } else if (isIndexWidget(existing) && isIndexWidget(next)) {
      applyWidgetDiff(existing, next.getWidgets());
    } else if (hash(existing.$$widgetParams ?? null) !== hash(next.$$widgetParams ?? null)) {
      parent.updateWidget(existing, next);
    }
  }

  if (current.size) parent.removeWidgets([...current.values()]);
  if (toAdd.length) parent.addWidgets(toAdd);
};

type StatusInternals = {
  __swiftsearchStatusAttached?: boolean;
};

// InstantSearch core maintains its own `status` and `error` on the instance and
// emits a `render` event whenever they change. We mirror them into the injected
// refs on every render. Listening to the helper's `search` event is unreliable
// here: instantsearch.js drives normal queries through `searchOnlyWithDerivedHelpers`,
// which only emits `search` on derived helpers — never on the main helper this
// composable sees. That is why the status stayed permanently `idle` for
// `AisStateResults` consumers (see issue #53).
const attachStatusListeners = (
  instance: InstantSearch,
  status: Ref<InstantSearchStatus>,
  error: Ref<Error | undefined>,
) => {
  const tagged = instance as InstantSearch & StatusInternals;
  if (tagged.__swiftsearchStatusAttached) return;
  tagged.__swiftsearchStatusAttached = true;

  const sync = () => {
    status.value = instance.status;
    error.value = instance.error;
  };

  sync();
  instance.on("render", sync);
};
