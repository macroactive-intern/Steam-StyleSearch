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
import { filterGames } from "@/lib/filterGames";
import { JS_ENHANCEMENT_SCRIPT } from "@/lib/progressiveEnhancement";

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

export default async function Home({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const page = getPageNumber(resolvedSearchParams);
  const allGames = getGames();
  const fallbackGames = filterGames(
    allGames,
    getFallbackFilters(resolvedSearchParams),
  );
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
