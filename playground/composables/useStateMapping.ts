import type { IndexUiState, UiState, StateMapping } from "instantsearch.js";

export const useStateMapping = () => {
  function getIndexStateWithoutConfigure<TIndexUiState extends IndexUiState>(
    uiState: TIndexUiState,
  ): TIndexUiState {
    const { configure, ...trackedUiState } = uiState;
    return trackedUiState as TIndexUiState;
  }

  function customStateMapping<TUiState extends UiState = UiState>(
    indexName: keyof TUiState,
  ): StateMapping<TUiState, TUiState> {
    return {
      $$type: "ais.singleIndex",
      stateToRoute(uiState) {
        const stateWithoutConfigure = getIndexStateWithoutConfigure(
          uiState[indexName] || {},
        );
        return stateWithoutConfigure as unknown as TUiState;
      },
      routeToState(routeState = {} as TUiState) {
        const stateWithoutConfigure = getIndexStateWithoutConfigure(routeState);
        return {
          [indexName]: stateWithoutConfigure,
        } as unknown as TUiState;
      },
    };
  }

  return customStateMapping;
};