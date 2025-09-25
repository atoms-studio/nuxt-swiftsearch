import type { RouterProps } from "instantsearch.js/es/middlewares";

export const useCustomRouting = () => {
  const router = useRouter();
  const algoliaRouter: Ref<Pick<Required<RouterProps>, "router">> = ref({
    router: {
      read() {
        const query = router.currentRoute.value.query;
        const isPagedRoute =
          router.currentRoute.value.name === "pagination-page-page";

        const queryObj = Array.isArray(query) ? query[0] : query;
        return isPagedRoute
          ? { ...queryObj, page: parseInt(router.currentRoute.value.params.page! as string) }
          : queryObj;
      },
      write(routeState: Record<string, unknown>) {
        console.log(routeState, "write");
        // if I have a page
        const iHavePage = !!routeState?.page;
        console.log(iHavePage);
        iHavePage
          ? router.push({
              name: "pagination-page-page",
              query: { ...routeState, page: undefined },
              params: { page: routeState.page as string },
            })
          : // @ts-ignore
            router.push({ query: { ...routeState } });
      },
      createURL(routeState: Record<string, unknown>) {
        console.log(routeState, "createUrl");
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
