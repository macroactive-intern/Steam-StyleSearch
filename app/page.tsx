import { Suspense } from "react";
import { GameBrowser } from "@/components/GameBrowser";
import { PaginatedGameFallback } from "@/components/PaginatedGameFallback";
import {
  getGames,
  getGenres,
  getPlatforms,
  getReleaseYearRange,
  getTags,
} from "@/lib/games";
import type { FilterSort, GameFilters } from "@/types/game";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;
type ResolvedSearchParams = Awaited<PageSearchParams>;

const SORT_VALUES = new Set<FilterSort>([
  "rating_desc",
  "rating_asc",
  "title_asc",
  "year_desc",
]);

function readFirst(searchParams: ResolvedSearchParams, key: string) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function readAll(searchParams: ResolvedSearchParams, key: string) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}

function readNumber(searchParams: ResolvedSearchParams, key: string) {
  const value = readFirst(searchParams, key);

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function readBoolean(searchParams: ResolvedSearchParams, key: string) {
  const value = readFirst(searchParams, key);

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function readSort(searchParams: ResolvedSearchParams): FilterSort | undefined {
  const sort = readFirst(searchParams, "sort");

  return SORT_VALUES.has(sort as FilterSort) ? (sort as FilterSort) : undefined;
}

function getPageNumber(searchParams: ResolvedSearchParams) {
  const page = searchParams.page;
  const pageValue = Array.isArray(page) ? page[0] : page;
  const parsedPage = Number(pageValue);

  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function getFallbackFilters(
  searchParams: ResolvedSearchParams,
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

export default async function Home({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const page = getPageNumber(resolvedSearchParams);
  const fallbackGames = getGames(getFallbackFilters(resolvedSearchParams));
  const filterOptions = {
    platforms: getPlatforms(),
    genres: getGenres(),
    tags: getTags(),
    releaseYearRange: getReleaseYearRange(),
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('js-enabled');",
        }}
      />
      <PaginatedGameFallback
        games={fallbackGames}
        page={page}
        searchParams={resolvedSearchParams}
      />
      <Suspense fallback={null}>
        <GameBrowser {...filterOptions} />
      </Suspense>
    </>
  );
}
