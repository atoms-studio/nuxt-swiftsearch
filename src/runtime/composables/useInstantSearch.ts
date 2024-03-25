import type {
  IndexWidget,
  InstantSearch,
  Widget,
} from "instantsearch.js/es/types";
import {
  waitForResults,
  getInitialResults,
} from "instantsearch.js/es/lib/server";
import { computed, triggerRef, inject, nextTick, type Ref } from "vue";
import { useState } from "nuxt/app";

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
    // adding widgetse to instance if not presents
    if (!instance.value.mainIndex.getWidgets().length) {
      instance.value.addWidgets(widgets);
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
      nextTick(async () => {
        await new Promise((resolve) => {
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
