import type {
  IndexWidget,
  InstantSearch,
  InstantSearchStatus,
  Widget,
} from "instantsearch.js/es/types";
import { isEqual } from "ohash";
import { waitForResults, getInitialResults } from "instantsearch.js/es/lib/server";
import { clearRefinements, getRefinements } from "instantsearch.js/es/lib/utils";
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
    // adding widgets to instance if not presents (new instance)
    if (!instance.value.mainIndex.getWidgets().length) {
      instance.value.addWidgets(widgets);
      // }
    } else {
      const oldWidgets = instance.value.mainIndex.getWidgets();
      // compare widgets
      const widgetsToAdd = widgets.filter(
        (newW) =>
          !oldWidgets.some(
            // @ts-ignore
            (oldW) => isEqual(oldW.$$widgetParams, newW.$$widgetParams),
          ),
      );
      const widgetsToRemove = oldWidgets.filter(
        (oldW) =>
          !widgets.some((newW) =>
            // @ts-ignore
            isEqual(oldW.$$widgetParams, newW.$$widgetParams),
          ),
      );

      if (widgetsToAdd.length || widgetsToRemove.length) {
        // clear refinements
        const refs = getRefinements(
          instance.value.mainIndex.getScopedResults()![0].results,
          instance.value.mainIndex!.getScopedResults()![0].helper.state,
          true,
        );

        instance.value.helper!.setState(
          clearRefinements({
            helper: instance.value.mainHelper!,
            attributesToClear: refs.map((refinement) => refinement.attribute),
          }),
        );
      }

      if (widgetsToRemove.length) instance.value.removeWidgets(widgetsToRemove);
      if (widgetsToAdd.length) instance.value.addWidgets(widgetsToAdd);
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
