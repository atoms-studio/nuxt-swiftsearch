import type {
  InstantSearch,
  InstantSearchOptions,
} from "instantsearch.js/es/types";
import {
  waitForResults,
  getInitialResults,
} from "instantsearch.js/es/lib/server";
import { ref, computed, triggerRef, type Ref } from "vue";
import { useState } from "nuxt/app";

import instantsearch, { type InitialResults } from "instantsearch.js/es";

const _searchInstance = ref<InstantSearch | null>(null);

export const useInstantSearch = () => {
  const _results = useState<InitialResults>("_instantsearch_ssr_results");

  const _instantiate = (config: InstantSearchOptions) => {
    _searchInstance.value = instantsearch(config);
  };

  const getInstance = (config?: InstantSearchOptions) => {
    if (config) {
      _instantiate(config);
    }
    if (_searchInstance.value === null) {
      throw new Error("instantiate instantsearch first");
    }
    return _searchInstance as Ref<InstantSearch>;
  };

  const parentIndex = computed(() => {
    return getInstance().value.mainIndex;
  });
  const setup = async () => {
    const instance = getInstance();
    if (import.meta.server) {
      instance.value.start();
      instance.value.started = false;
      const params = await waitForResults(instance.value);
      _results.value = getInitialResults(instance.value.mainIndex, params);
    }

    instance.value._initialResults = _results.value;
    instance.value.on("render", () => {
      triggerRef(_searchInstance);
    });
    instance.value.start();
  };
  return {
    getInstance,
    parentIndex,
    setup,
  };
};
