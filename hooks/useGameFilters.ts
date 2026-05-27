"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isFilterSort, type FilterSort } from "@/types/game";

const FILTER_KEYS = [
  "q",
  "platform",
  "genre",
  "tag",
  "minRating",
  "maxRating",
  "yearFrom",
  "yearTo",
  "sort",
  "featured",
] as const;

const PAGE_PARAM = "page";

export type GameFilterKey = (typeof FILTER_KEYS)[number];

export interface UrlGameFilters {
  q?: string;
  platform?: string;
  genre?: string;
  tag: string[];
  minRating?: number;
  maxRating?: number;
  yearFrom?: number;
  yearTo?: number;
  sort?: FilterSort;
  featured?: boolean;
}

type FilterValue = string | number | boolean | readonly string[] | null | undefined;
type SearchParamsReader = Pick<URLSearchParams, "get" | "getAll">;

export const EMPTY_GAME_FILTER_UPDATES: Partial<
  Record<GameFilterKey, FilterValue>
> = {
  q: undefined,
  platform: undefined,
  genre: undefined,
  tag: [],
  minRating: undefined,
  maxRating: undefined,
  yearFrom: undefined,
  yearTo: undefined,
  sort: undefined,
  featured: undefined,
};

function readNumber(params: SearchParamsReader, key: GameFilterKey): number | undefined {
  const value = params.get(key);

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function readBoolean(params: SearchParamsReader, key: GameFilterKey): boolean | undefined {
  const value = params.get(key);

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function readString(params: SearchParamsReader, key: GameFilterKey): string | undefined {
  return params.get(key)?.trim() || undefined;
}

function readSort(params: SearchParamsReader): FilterSort | undefined {
  const value = readString(params, "sort");

  return isFilterSort(value) ? value : undefined;
}

function applyParam(params: URLSearchParams, key: GameFilterKey, value: FilterValue) {
  params.delete(key);

  if (Array.isArray(value)) {
    value.filter(Boolean).forEach((item) => params.append(key, String(item)));
    return;
  }

  if (value === undefined || value === null || value === "") {
    return;
  }

  params.set(key, String(value));
}

export function parseUrlGameFilters(params: SearchParamsReader): UrlGameFilters {
  return {
    q: readString(params, "q"),
    platform: readString(params, "platform"),
    genre: readString(params, "genre"),
    tag: params.getAll("tag").filter(Boolean),
    minRating: readNumber(params, "minRating"),
    maxRating: readNumber(params, "maxRating"),
    yearFrom: readNumber(params, "yearFrom"),
    yearTo: readNumber(params, "yearTo"),
    sort: readSort(params),
    featured: readBoolean(params, "featured"),
  };
}

export function applyGameFilterUpdates(
  currentSearch: string,
  updates: Partial<Record<GameFilterKey, FilterValue>>,
): string {
  const params = new URLSearchParams(currentSearch);

  params.delete(PAGE_PARAM);

  for (const [key, value] of Object.entries(updates)) {
    applyParam(params, key as GameFilterKey, value);
  }

  return params.toString();
}

export function clearGameFilterParams(currentSearch: string): string {
  const params = new URLSearchParams(currentSearch);

  FILTER_KEYS.forEach((key) => params.delete(key));
  params.delete(PAGE_PARAM);

  return params.toString();
}

export function removeGameFilterTag(currentSearch: string, tagToRemove: string): string {
  const filters = parseUrlGameFilters(new URLSearchParams(currentSearch));

  return applyGameFilterUpdates(currentSearch, {
    tag: filters.tag.filter((tag) => tag !== tagToRemove),
  });
}

export function useGameFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const searchParamsRef = useRef(searchParamsString);

  useEffect(() => {
    searchParamsRef.current = searchParamsString;
  }, [searchParamsString]);

  const filters = useMemo(
    () => parseUrlGameFilters(searchParams),
    [searchParams],
  );

  const updateUrl = useCallback(
    (updates: Partial<Record<GameFilterKey, FilterValue>>) => {
      const query = applyGameFilterUpdates(searchParamsRef.current, updates);
      searchParamsRef.current = query;
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const clearFilter = useCallback(
    (key: GameFilterKey) => updateUrl({ [key]: undefined }),
    [updateUrl],
  );

  const removeTag = useCallback(
    (tag: string) => {
      const query = removeGameFilterTag(searchParamsRef.current, tag);
      searchParamsRef.current = query;
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const clearAll = useCallback(() => {
    const query = clearGameFilterParams(searchParamsRef.current);
    searchParamsRef.current = query;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router]);

  const setters = useMemo(
    () => ({
      setFilters: updateUrl,
      setQ: (value?: string) => updateUrl({ q: value }),
      setPlatform: (value?: string) => updateUrl({ platform: value }),
      setGenre: (value?: string) => updateUrl({ genre: value }),
      setTag: (value: readonly string[]) => updateUrl({ tag: value }),
      removeTag,
      setMinRating: (value?: number) => updateUrl({ minRating: value }),
      setMaxRating: (value?: number) => updateUrl({ maxRating: value }),
      setYearFrom: (value?: number) => updateUrl({ yearFrom: value }),
      setYearTo: (value?: number) => updateUrl({ yearTo: value }),
      setSort: (value?: FilterSort) => updateUrl({ sort: value }),
      setFeatured: (value?: boolean) => updateUrl({ featured: value }),
    }),
    [removeTag, updateUrl],
  );

  return {
    filters,
    setters,
    clearFilter,
    clearAll,
  };
}
