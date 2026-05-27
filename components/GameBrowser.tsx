"use client";

import { useEffect, useMemo, useState } from "react";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { FilterPanel } from "@/components/FilterPanel";
import { SavedFilterPresets } from "@/components/SavedFilterPresets";
import { SearchInput } from "@/components/SearchInput";
import { VirtualGameList } from "@/components/VirtualGameList";
import { useGameFilters } from "@/hooks/useGameFilters";
import { filterGames } from "@/lib/filterGames";
import type { Game } from "@/types/game";

export interface GameBrowserProps {
  platforms: string[];
  genres: string[];
  tags: string[];
  releaseYearRange: { min: number; max: number };
}

interface GamesResponse {
  games?: Game[];
}

export function GameBrowser({
  platforms,
  genres,
  tags,
  releaseYearRange,
}: GameBrowserProps) {
  const { filters } = useGameFilters();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const filteredGames = useMemo(
    () => filterGames(games, filters),
    [games, filters],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadGames() {
      try {
        const response = await fetch("/api/games", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load games.");
        }

        const data = (await response.json()) as GamesResponse;
        setGames(Array.isArray(data.games) ? data.games : []);
        setError(undefined);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError instanceof Error ? loadError.message : "Unable to load games.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadGames();

    return () => controller.abort();
  }, []);

  return (
    <div
      data-js-enhanced
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

      {/* Keep overflow classes off this shell so the sidebar can stick to the page scroll root. */}
      <div className="grid flex-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          data-sticky-filter-sidebar
          className="space-y-4 lg:sticky lg:top-6 lg:self-start"
        >
          <SavedFilterPresets />
          <FilterPanel
            platforms={platforms}
            genres={genres}
            tags={tags}
            releaseYearRange={releaseYearRange}
          />
        </aside>

        <main className="min-w-0 space-y-4">
          <SearchInput />
          <ActiveFilterChips />
          {isLoading ? (
            <section className="flex min-h-64 items-center justify-center rounded-lg border bg-muted/30 p-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Loading games...
              </p>
            </section>
          ) : error ? (
            <section className="flex min-h-64 items-center justify-center rounded-lg border bg-muted/30 p-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {error}
              </p>
            </section>
          ) : (
            <VirtualGameList games={filteredGames} />
          )}
        </main>
      </div>
    </div>
  );
}
