"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useGameFilters, type UrlGameFilters } from "@/hooks/useGameFilters";
import { cn } from "@/lib/utils";
import { parseQuery } from "@/lib/parseQuery";

export interface SearchInputProps {
  id?: string;
  className?: string;
  delay?: number;
  placeholder?: string;
}

function formatTerm(value: string): string {
  const term = value.trim().replaceAll('"', "");

  return /\s/.test(term) ? `"${term}"` : term;
}

function filtersToSearchValue(filters: UrlGameFilters): string {
  const tokens = [
    filters.platform ? `platform:${formatTerm(filters.platform)}` : undefined,
    typeof filters.minRating === "number" ? `rating:>${filters.minRating}` : undefined,
    typeof filters.maxRating === "number" ? `rating:<${filters.maxRating}` : undefined,
    filters.yearFrom && filters.yearFrom === filters.yearTo
      ? `year:${filters.yearFrom}`
      : undefined,
    ...filters.tag.map((tag) => `tag:${formatTerm(tag)}`),
    filters.q ? formatTerm(filters.q) : undefined,
  ];

  return tokens.filter(Boolean).join(" ");
}

export function SearchInput({
  id = "game-search",
  className,
  delay = 300,
  placeholder = 'Search games or use platform:PC rating:>8 tag:rpg "dark souls"',
}: SearchInputProps) {
  const { filters, setters } = useGameFilters();
  const urlSearchValue = useMemo(() => filtersToSearchValue(filters), [filters]);
  const [value, setValue] = useState(urlSearchValue);
  const debouncedValue = useDebounce(value, delay);
  const controlledFiltersKey = useMemo(
    () =>
      JSON.stringify({
        q: filters.q,
        platform: filters.platform,
        tag: filters.tag,
        minRating: filters.minRating,
        maxRating: filters.maxRating,
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
      }),
    [filters],
  );

  useEffect(() => {
    const parsed = parseQuery(debouncedValue);
    const updates = {
      q: parsed.terms.join(" ") || undefined,
      platform: parsed.filters.platform,
      tag: parsed.filters.tags,
      minRating: parsed.filters.minRating,
      maxRating: parsed.filters.maxRating,
      yearFrom: parsed.filters.yearFrom,
      yearTo: parsed.filters.yearTo,
    };

    if (JSON.stringify(updates) === controlledFiltersKey) {
      return;
    }

    setters.setFilters(updates);
  }, [controlledFiltersKey, debouncedValue, setters]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
  }

  function handleClear() {
    setValue("");
    setters.setFilters({
      q: undefined,
      platform: undefined,
      tag: [],
      minRating: undefined,
      maxRating: undefined,
      yearFrom: undefined,
      yearTo: undefined,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && value) {
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
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pr-10 pl-9"
        autoComplete="off"
        spellCheck={false}
      />
      {value ? (
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
