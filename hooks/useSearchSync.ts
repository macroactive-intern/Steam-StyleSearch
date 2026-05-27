"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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

export function useSearchSync(delay = 300) {
  const { filters, setters } = useGameFilters();
  const urlSearchValue = useMemo(() => filtersToSearchValue(filters), [filters]);
  const [state, setState] = useState<SearchSyncState>({
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
    setState({
      ...state,
      lastUrlSearchValue: urlSearchValue,
      value: state.isFocused ? state.value : urlSearchValue,
    });
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

      setState((current) => ({ ...current, value: nextValue }));
      scheduleUrlUpdate(nextValue);
    },
    [scheduleUrlUpdate],
  );

  const handleClear = useCallback(() => {
    clearPendingUpdate();
    setState((current) => ({ ...current, value: "" }));
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

  return {
    value: state.value,
    handleChange,
    handleClear,
    handleKeyDown,
    handleFocus: () =>
      setState((current) => ({
        ...current,
        isFocused: true,
        value: urlSearchValue,
      })),
    handleBlur: () =>
      setState((current) => ({
        ...current,
        isFocused: false,
        value: urlSearchValue,
      })),
  };
}
