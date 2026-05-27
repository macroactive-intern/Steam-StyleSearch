import { Suspense } from "react";
import { GameBrowser } from "@/components/GameBrowser";
import { PaginatedGameFallback } from "@/components/PaginatedGameFallback";
import {
  GENRES,
  getGames,
  PLATFORMS,
  RELEASE_YEAR_RANGE,
  TAGS,
} from "@/lib/games";
import { JS_ENHANCEMENT_SCRIPT } from "@/lib/progressiveEnhancement";
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

function GameBrowserSuspenseFallback() {
  return (
    <section
      data-js-enhanced
      aria-busy="true"
      className="mx-auto hidden w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Steam Style Search
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          Game Browser
        </h2>
      </header>

      <section className="flex min-h-64 items-center justify-center rounded-lg border bg-muted/30 p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Loading game browser...
        </p>
      </section>
    </section>
  );
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
    platforms: PLATFORMS,
    genres: GENRES,
    tags: TAGS,
    releaseYearRange: RELEASE_YEAR_RANGE,
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JS_ENHANCEMENT_SCRIPT,
        }}
      />
      <PaginatedGameFallback
        games={fallbackGames}
        page={page}
        searchParams={resolvedSearchParams}
      />
      <Suspense fallback={<GameBrowserSuspenseFallback />}>
        <GameBrowser {...filterOptions} />
      </Suspense>
    </>
  );
}
