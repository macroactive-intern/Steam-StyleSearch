"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { EMPTY_GAME_FILTER_UPDATES, useGameFilters } from "@/hooks/useGameFilters";
import { parseQuery } from "@/lib/parseQuery";
import { filtersToSearchValue } from "@/lib/searchValue";

function searchValueToFilterUpdates(value: string) {
  const parsed = parseQuery(value);

  return {
    q: parsed.terms.join(" ") || undefined,
    platform: parsed.filters.platform,
    genre: parsed.filters.genre,
    tag: parsed.filters.tags,
    minRating: parsed.filters.minRating,
    maxRating: parsed.filters.maxRating,
    yearFrom: parsed.filters.yearFrom,
    yearTo: parsed.filters.yearTo,
  };
}

interface SearchSyncState {
  isFocused: boolean;
  lastUrlSearchValue: string;
  value: string;
}

type SearchSyncAction =
  | { type: "urlChanged"; value: string }
  | { type: "inputChanged"; value: string }
  | { type: "focus"; value: string }
  | { type: "blur"; value: string }
  | { type: "clear" };

function searchSyncReducer(
  state: SearchSyncState,
  action: SearchSyncAction,
): SearchSyncState {
  switch (action.type) {
    case "urlChanged":
      return {
        ...state,
        lastUrlSearchValue: action.value,
        value: state.isFocused ? state.value : action.value,
      };
    case "inputChanged":
      return {
        ...state,
        value: action.value,
      };
    case "focus":
      return {
        ...state,
        isFocused: true,
        value: action.value,
      };
    case "blur":
      return {
        ...state,
        isFocused: false,
        value: action.value,
      };
    case "clear":
      return {
        ...state,
        value: "",
      };
  }
}

export function useSearchSync(delay = 300) {
  const { filters, setters } = useGameFilters();
  const urlSearchValue = useMemo(() => filtersToSearchValue(filters), [filters]);
  const [state, dispatch] = useReducer(searchSyncReducer, {
    isFocused: false,
    lastUrlSearchValue: urlSearchValue,
    value: urlSearchValue,
  });
  const pendingUpdateRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const controlledFiltersKey = useMemo(
    () => JSON.stringify(searchValueToFilterUpdates(urlSearchValue)),
    [urlSearchValue],
  );

  const clearPendingUpdate = useCallback(() => {
    if (pendingUpdateRef.current !== undefined) {
      clearTimeout(pendingUpdateRef.current);
      pendingUpdateRef.current = undefined;
    }
  }, []);

  useEffect(() => clearPendingUpdate, [clearPendingUpdate]);

  useEffect(() => {
    clearPendingUpdate();
  }, [clearPendingUpdate, urlSearchValue]);

  if (urlSearchValue !== state.lastUrlSearchValue) {
    dispatch({ type: "urlChanged", value: urlSearchValue });
  }

  const scheduleUrlUpdate = useCallback(
    (nextValue: string) => {
      clearPendingUpdate();
      pendingUpdateRef.current = setTimeout(() => {
        const updates = searchValueToFilterUpdates(nextValue);

        pendingUpdateRef.current = undefined;

        if (JSON.stringify(updates) === controlledFiltersKey) {
          return;
        }

        setters.setFilters(updates);
      }, delay);
    },
    [clearPendingUpdate, controlledFiltersKey, delay, setters],
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      dispatch({ type: "inputChanged", value: nextValue });
      scheduleUrlUpdate(nextValue);
    },
    [scheduleUrlUpdate],
  );

  const handleClear = useCallback(() => {
    clearPendingUpdate();
    dispatch({ type: "clear" });
    setters.setFilters(EMPTY_GAME_FILTER_UPDATES);
  }, [clearPendingUpdate, setters]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape" && event.currentTarget.value) {
        event.preventDefault();
        handleClear();
      }
    },
    [handleClear],
  );

  // Intentionally resets the displayed value to the URL-committed state on
  // focus/blur so the input always reflects what's actually in the URL when
  // the user starts or finishes editing. Any in-progress draft is discarded.
  const handleFocus = useCallback(() => {
    dispatch({ type: "focus", value: urlSearchValue });
  }, [urlSearchValue]);

  const handleBlur = useCallback(() => {
    dispatch({ type: "blur", value: urlSearchValue });
  }, [urlSearchValue]);

  return {
    value: state.value,
    handleChange,
    handleClear,
    handleKeyDown,
    handleFocus,
    handleBlur,
  };
}
