import type { LocationQueryRaw } from "#vue-router";
import { useRouter } from "nuxt/app";
import { ref } from "vue";
export const useAisRouter = () => {
  const router = useRouter();
  const algoliaRouter = ref<Record<string, any>>({
    router: {
      read() {
        return router.currentRoute.value.query;
      },
      write(routeState: LocationQueryRaw) {
        router.push({ query: routeState });
      },
      createURL(routeState: LocationQueryRaw) {
        return router.resolve({
          query: routeState,
        }).href;
      },
      onUpdate(cb: any) {
        if (typeof window === "undefined") return;
        this._removeAfterEach = router.afterEach((to, from) => {
          cb(this.read());
        });

        this._onPopState = () => {
          cb(this.read());
        };
        window.addEventListener("popstate", this._onPopState);
      },
      dispose() {
        if (typeof window === "undefined") {
          return;
        }
        if (this._onPopState) {
          window.removeEventListener("popstate", this._onPopState);
        }
        if (this._removeAfterEach) {
          this._removeAfterEach();
        }
      },
    },
  });

  return algoliaRouter;
};
