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
import {
  getFallbackFilters,
  getPageNumber,
  type ResolvedPageSearchParams,
} from "@/lib/pageSearchParams";
import { JS_ENHANCEMENT_SCRIPT } from "@/lib/progressiveEnhancement";
import type { GameFilters } from "@/types/game";

type PageSearchParams = Promise<ResolvedPageSearchParams>;

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

function hasFallbackFilters(filters: GameFilters) {
  return Boolean(
    filters.q ||
      filters.platform ||
      filters.genre ||
      filters.tag?.length ||
      typeof filters.minRating === "number" ||
      typeof filters.maxRating === "number" ||
      typeof filters.yearFrom === "number" ||
      typeof filters.yearTo === "number" ||
      filters.featured !== undefined ||
      filters.sort,
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const page = getPageNumber(resolvedSearchParams);
  const fallbackFilters = getFallbackFilters(resolvedSearchParams);
  const allGames = getGames();
  const fallbackGames = hasFallbackFilters(fallbackFilters)
    ? getGames(fallbackFilters)
    : allGames;
  const filterOptions = {
    initialGames: allGames,
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
