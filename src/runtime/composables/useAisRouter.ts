import { useRouter, useNuxtApp } from "nuxt/app";
import { ref } from "vue";
import type { Ref } from "vue";
import type { RouterProps } from "instantsearch.js/es/middlewares";
import { parseURL, parseQuery, type ParsedQuery } from "ufo"
import type { LocationQuery } from "#vue-router";

type QueryObject = {
  [x:string]: QueryObject | string | string[] | number | boolean
}

const stripUndefined = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => k !== 'sortBy')
  )
}

const convertToNestedObject = (query: ParsedQuery): QueryObject => {
  const result: QueryObject = {}

  Object.keys(query).forEach(key => {
      const value = query[key]
      const keys = key.split(/[[\]]+/).filter(k => k)

      let currentLevel: QueryObject = result

      keys.forEach((k, index) => {
          if (index === keys.length - 1) {
              currentLevel[k] = value
          } else {
              if (!currentLevel[k]) {
                // @ts-ignore
                  currentLevel[k] = isNaN(keys[index + 1]) ? {} : []
              }
              // @ts-ignore
              currentLevel = currentLevel[k]
          }
      });
  });

  return result
}

const containsBrackets = (obj: LocationQuery) => {
  return Object.keys(obj).some(key => key.includes('[') || key.includes(']'))
}

export const useAisRouter = () => {
  const router = useRouter();
  const app = useNuxtApp();
  const algoliaRouter: Ref<Pick<Required<RouterProps>, "router">> = ref({
    router: {
      read() {
        const currentRoute = router.currentRoute.value
        let query
        if(containsBrackets(currentRoute.query)){
          const urlParsed = parseURL(currentRoute.fullPath)
          const queryParsed = parseQuery(urlParsed.search)
          query = convertToNestedObject(queryParsed)
        } else {
          query = currentRoute.query
        }
        const normalizedQuery = Array.isArray(query) ? query[0] : query;
        return stripUndefined(normalizedQuery);
      },
      write(routeState) {
        // strip routeState and query from possible undefined values
        const currentQueryState = this.read();
        if (
          JSON.stringify(currentQueryState) ===
          JSON.stringify(stripUndefined(routeState))
        ) {
          return;
        }
        // @ts-ignore ignoring because uiState is compatible with query after introducing qs as a query param parser
        router.push({
          query: { ...currentQueryState, ...stripUndefined(routeState) },
        });
      },
      createURL(routeState) {
        return router.resolve({
          // @ts-ignore see comment above
          query: routeState,
        }).href;
      },
      onUpdate(cb: any) {
        if (typeof window === "undefined") return;
        // @ts-ignore
        this._removeAfterEach = router.afterEach((to, from) => {
          if (to.path === from.path) cb(this.read());
        });
        app.hook("page:finish", () => {
          cb(this.read());
        });
      },
      dispose() {
        if (typeof window === "undefined") {
          return;
        }
        // @ts-ignore
        if (this._removeAfterEach) {
          // @ts-ignore
          this._removeAfterEach();
        }
      },
    },
  });

  return algoliaRouter;
};
