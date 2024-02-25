import { useRouter } from "nuxt/app";
import { ref } from "vue";
import type { Ref } from "vue";
import type { RouterProps } from "instantsearch.js/es/middlewares";
export const useAisRouter = () => {
  const router = useRouter();
  const algoliaRouter: Ref<RouterProps> = ref({
    router: {
      read() {
        const query = router.currentRoute.value.query;
        return Array.isArray(query) ? query[0] : query;
      },
      write(routeState) {
        // @ts-ignore ignoring because uiState is compatible with query after introducing qs as a query param parser
        router.push({ query: routeState });
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
          cb(this.read());
        });

        // @ts-ignore
        this._onPopState = () => {
          cb(this.read());
        };
        // @ts-ignore
        window.addEventListener("popstate", this._onPopState);
      },
      dispose() {
        if (typeof window === "undefined") {
          return;
        }
        // @ts-ignore
        if (this._onPopState) {
          // @ts-ignore
          window.removeEventListener("popstate", this._onPopState);
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
