import { isFilterSort, type FilterSort, type GameFilters } from "@/types/game";

export type PageSearchParamsValue = string | string[] | undefined;
export type ResolvedPageSearchParams = Record<string, PageSearchParamsValue>;

function readFirst(searchParams: ResolvedPageSearchParams, key: string) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function readAll(searchParams: ResolvedPageSearchParams, key: string) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}

function readNumber(searchParams: ResolvedPageSearchParams, key: string) {
  const value = readFirst(searchParams, key);

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function readBoolean(searchParams: ResolvedPageSearchParams, key: string) {
  const value = readFirst(searchParams, key);

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function readSort(searchParams: ResolvedPageSearchParams): FilterSort | undefined {
  const sort = readFirst(searchParams, "sort");

  return isFilterSort(sort) ? sort : undefined;
}

export function getPageNumber(searchParams: ResolvedPageSearchParams) {
  const page = readFirst(searchParams, "page");
  const parsedPage = Number(page);

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

export function getFallbackFilters(
  searchParams: ResolvedPageSearchParams,
): GameFilters {
  return {
    q: readFirst(searchParams, "q"),
    platform: readFirst(searchParams, "platform"),
    genre: readFirst(searchParams, "genre"),
    tag: readAll(searchParams, "tag"),
    minRating: readNumber(searchParams, "minRating"),
    maxRating: readNumber(searchParams, "maxRating"),
    yearFrom: readNumber(searchParams, "yearFrom"),
    yearTo: readNumber(searchParams, "yearTo"),
    featured: readBoolean(searchParams, "featured"),
    sort: readSort(searchParams),
  };
}
