import type {
  IndexWidget,
  InstantSearch,
  Widget,
} from "instantsearch.js/es/types";
import isEqual from "lodash.isequal";
import {
  waitForResults,
  getInitialResults,
} from "instantsearch.js/es/lib/server";
import {
  clearRefinements,
  getRefinements,
} from "instantsearch.js/es/lib/utils";
import { computed, triggerRef, inject, nextTick, type Ref } from "vue";
import { useState, createError } from "nuxt/app";

import { type InitialResults } from "instantsearch.js/es";

export const useInstantSearch = (instance?: Ref<InstantSearch> | null) => {
  const _searchInstance =
    instance ??
    (inject<Ref<InstantSearch | null>>("searchInstance") as Ref<InstantSearch>);
  const _results = useState<InitialResults | null>(
    "_instantsearch_ssr_results",
  );

  const getInstance = () => {
    if (_searchInstance!.value === null) {
      throw new Error("instantiate instantsearch first");
    }
    return _searchInstance as Ref<InstantSearch>;
  };

  const parentIndex = computed(() => {
    return getInstance().value.mainIndex;
  });
  const setup = async (widgets: Array<Widget | IndexWidget>) => {
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
          instance.value.mainHelper!.once("searchQueueEmpty", () =>
            resolve(true),
          );
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

      instance.value.on("error", ({ error }) => {
        throw createError({
          statusCode: 500,
          statusMessage: error,
        });
      });
      instance.value.start();
    }
  };

  return {
    getInstance,
    parentIndex,
    setup,
  };
};
