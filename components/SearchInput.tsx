"use client";

import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameFilters } from "@/hooks/useGameFilters";
import { cn } from "@/lib/utils";
import { parseQuery } from "@/lib/parseQuery";
import { filtersToSearchValue } from "@/lib/searchValue";

export interface SearchInputProps {
  id?: string;
  className?: string;
  delay?: number;
  placeholder?: string;
}

export function SearchInput({
  id = "game-search",
  className,
  delay = 300,
  placeholder = 'Search games or use platform:PC genre:rpg year:2018-2022 rating:>8 tag:rpg "dark souls"',
}: SearchInputProps) {
  const { filters, setters } = useGameFilters();
  const urlSearchValue = useMemo(() => filtersToSearchValue(filters), [filters]);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingUpdateRef = useRef<number | undefined>(undefined);
  const controlledFiltersKey = useMemo(
    () =>
      JSON.stringify({
        q: filters.q,
        platform: filters.platform,
        genre: filters.genre,
        tag: filters.tag,
        minRating: filters.minRating,
        maxRating: filters.maxRating,
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
      }),
    [filters],
  );

  const clearPendingUpdate = useCallback(() => {
    if (pendingUpdateRef.current !== undefined) {
      window.clearTimeout(pendingUpdateRef.current);
      pendingUpdateRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    clearPendingUpdate();

    if (inputRef.current) {
      inputRef.current.value = urlSearchValue;
    }

    return clearPendingUpdate;
  }, [clearPendingUpdate, urlSearchValue]);

  const scheduleUrlUpdate = useCallback(
    (nextValue: string) => {
      clearPendingUpdate();
      pendingUpdateRef.current = window.setTimeout(() => {
        const parsed = parseQuery(nextValue);
        const updates = {
          q: parsed.terms.join(" ") || undefined,
          platform: parsed.filters.platform,
          genre: parsed.filters.genre,
          tag: parsed.filters.tags,
          minRating: parsed.filters.minRating,
          maxRating: parsed.filters.maxRating,
          yearFrom: parsed.filters.yearFrom,
          yearTo: parsed.filters.yearTo,
        };

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
      scheduleUrlUpdate(event.target.value);
    },
    [scheduleUrlUpdate],
  );

  function handleClear() {
    clearPendingUpdate();

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setters.setFilters({
      q: undefined,
      platform: undefined,
      genre: undefined,
      tag: [],
      minRating: undefined,
      maxRating: undefined,
      yearFrom: undefined,
      yearTo: undefined,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && event.currentTarget.value) {
      event.preventDefault();
      handleClear();
    }
  }

  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor={id} className="sr-only">
        Search games
      </label>
      <Search
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
      />
      <Input
        id={id}
        ref={inputRef}
        type="search"
        defaultValue={urlSearchValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pr-10 pl-9"
        autoComplete="off"
        spellCheck={false}
      />
      {urlSearchValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear search"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2"
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
