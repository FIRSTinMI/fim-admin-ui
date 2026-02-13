import { GridApi, GridInitialState } from "@mui/x-data-grid";
import { RefObject, useCallback, useLayoutEffect, useState } from "react";

type StoredTableState = {
  version: number,
  state: GridInitialState
};

/**
 * Save a datagrid's state to localstorage
 * @param apiRef DataGrid
 * @param storageKey What key in local storage to use
 * @param version Increment this to invalidate all users saved state
 * @param defaultState What to use if there's nothing saved
 */
export default function usePersistTableState(apiRef: RefObject<GridApi> | null, storageKey: string, version: number, defaultState: GridInitialState) {
  const [initialState, setInitialState] = useState<GridInitialState | null>(null);
  const saveSnapshot = useCallback(() => {
    if (apiRef?.current?.exportState && localStorage) {
      const currentState = apiRef.current.exportState();
      if (!currentState) return;
      localStorage.setItem(storageKey, JSON.stringify({
        version: version,
        state: currentState
      } as StoredTableState));
    }
  }, [apiRef]);

  useLayoutEffect(() => {
    const stateFromLocalStorage = localStorage?.getItem(storageKey);
    const parsedLocalStorageState: StoredTableState = stateFromLocalStorage ? JSON.parse(stateFromLocalStorage) : null;
    const effectiveState = parsedLocalStorageState?.version === version ? parsedLocalStorageState.state : defaultState;
    setInitialState(effectiveState);

    // handle refresh and navigating away/refreshing
    window.addEventListener('visibilitychange', saveSnapshot);

    return () => {
      // in case of an SPA remove the event-listener
      window.removeEventListener('visibilitychange', saveSnapshot);
      saveSnapshot();
    };
  }, [saveSnapshot]);
  
  return initialState;
}