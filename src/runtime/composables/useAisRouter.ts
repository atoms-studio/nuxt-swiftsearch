import { useRouter, useNuxtApp } from "nuxt/app";
import { ref } from "vue";
import type { Ref } from "vue";
import type { RouterProps } from "instantsearch.js/es/middlewares";

function stripUndefined(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => v !== undefined),
  );
}
export const useAisRouter = () => {
  const router = useRouter();
  const app = useNuxtApp();
  const prevState = ref<Record<string, any>>({})
  const algoliaRouter: Ref<Pick<Required<RouterProps>, "router">> = ref({
    router: {
      read() {
        const query = router.currentRoute.value.query;
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
          prevState.value = stripUndefined(routeState)
          return;
        }
        const prevStateKeys = Object.keys(prevState.value)
        const queryStateToAppend = Object.fromEntries(Object.entries(currentQueryState).filter(([k, v]) => !prevStateKeys.includes(k)))

        // @ts-ignore ignoring because uiState is compatible with query after introducing qs as a query param parser
        router.push({
          query: { ...queryStateToAppend, ...stripUndefined(routeState) },
        });
        // saving previous state
        prevState.value = stripUndefined(routeState)
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
