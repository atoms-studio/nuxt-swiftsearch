import isEqual from "lodash.isequal";
import { useState } from "#app";

import type {
  InfiniteHitsCache,
  InfiniteHitsCachedHits,
} from "instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits";
import type { PlainSearchParameters } from "algoliasearch-helper";
import type { BaseHit } from "instantsearch.js";

function getStateWithoutPage(state: PlainSearchParameters) {
  const { page, ...rest } = state || {};
  return rest;
}

const KEY = "ais.infiniteHits";
function getKeyFromState(state: PlainSearchParameters, key?: string) {
  return `${key ?? KEY}`;
}

const _storage = () =>
  import.meta.server
    ? ref<Record<string, any>>({})
    : useState<Record<string, any>>("_instantsearchStorageState", () => ({}));

export const useAisInfiniteHitsStatefulCache = (key?: string) => {
  const ssrPage = useState(`${key ?? KEY}-server-page`, () => 0);
  const sessionStorage: Omit<Storage, "length" | "clear" | "key"> = {
    getItem(key: string) {
      return _storage().value[key];
    },
    setItem(key: string, value: any) {
      return (_storage().value[key] = value);
    },
    removeItem(key: string) {
      if (_storage().value?.[key]) delete _storage().value[key];
    },
  };
  const cache: InfiniteHitsCache = {
    read: ({ state }) => {
      try {
        const cache = sessionStorage.getItem(getKeyFromState(state, key));
        const maxPage = Math.max(ssrPage.value, state.page ?? 0);
        return cache && isEqual(cache.state, getStateWithoutPage(state))
          ? (Object.fromEntries(
              Object.entries(cache.hits).slice(0, maxPage),
            ) as InfiniteHitsCachedHits<BaseHit>)
          : null;
      } catch (error) {
        console.error(error);
        if (error instanceof SyntaxError) {
          try {
            sessionStorage.removeItem(KEY);
          } catch (err) {
            // do nothing
          }
        }
        return null;
      }
    },
    write: ({ state, hits }) => {
      if (import.meta.server) ssrPage.value = state.page!;
      try {
        const currentHits =
          sessionStorage.getItem(getKeyFromState(state, key))?.hits ?? {};
        const hitsToWrite = { ...currentHits, ...hits };
        sessionStorage.setItem(getKeyFromState(state, key), {
          state: getStateWithoutPage(state),
          hits: hitsToWrite,
        });
      } catch (error) {
        console.error(error);
        // do nothing
      }
    },
  };
  return cache;
};
