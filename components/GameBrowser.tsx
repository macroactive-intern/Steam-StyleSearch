"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { FilterPanel } from "@/components/FilterPanel";
import { SavedFilterPresets } from "@/components/SavedFilterPresets";
import { SearchInput } from "@/components/SearchInput";
import { VirtualGameList } from "@/components/VirtualGameList";
import { Button } from "@/components/ui/button";
import { useGameFilters } from "@/hooks/useGameFilters";
import { filterGames } from "@/lib/filterGames";
import { sanitizeGamesResponse } from "@/lib/gameApi";
import type { Game } from "@/types/game";

export interface GameBrowserProps {
  initialGames: Game[];
  platforms: string[];
  genres: string[];
  tags: string[];
  releaseYearRange: { min: number; max: number };
}

export function GameBrowser({
  initialGames,
  platforms,
  genres,
  tags,
  releaseYearRange,
}: GameBrowserProps) {
  const { filters } = useGameFilters();
  const [games, setGames] = useState<Game[]>(initialGames);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const abortControllerRef = useRef<AbortController | null>(null);
  const filteredGames = useMemo(
    () => filterGames(games, filters),
    [games, filters],
  );

  const loadGames = useCallback(async () => {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await Promise.resolve();

      if (controller.signal.aborted) {
        return;
      }

      setIsLoading(true);
      setError(undefined);

      const response = await fetch("/api/games", {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Unable to load games.");
      }

      const data: unknown = await response.json();
      setGames(sanitizeGamesResponse(data).games);
    } catch (loadError) {
      if (controller.signal.aborted) {
        return;
      }

      setError(
        loadError instanceof Error ? loadError.message : "Unable to load games.",
      );
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
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
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {error}
                </p>
                <Button type="button" variant="outline" onClick={loadGames}>
                  Try again
                </Button>
              </div>
            </section>
          ) : (
            <VirtualGameList games={filteredGames} />
          )}
        </main>
      </div>
    </div>
  );
}
