"use client";

import { useMemo } from "react";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { FilterPanel } from "@/components/FilterPanel";
import { SavedFilterPresets } from "@/components/SavedFilterPresets";
import { SearchInput } from "@/components/SearchInput";
import { VirtualGameList } from "@/components/VirtualGameList";
import { useGameFilters } from "@/hooks/useGameFilters";
import { filterGames } from "@/lib/filterGames";
import type { Game } from "@/types/game";

export interface GameBrowserProps {
  games: readonly Game[];
}

export function GameBrowser({ games }: GameBrowserProps) {
  const { filters } = useGameFilters();
  const filteredGames = useMemo(
    () =>
      filterGames(games, {
        q: filters.q,
        platform: filters.platform,
        genre: filters.genre,
        tag: filters.tag,
        minRating: filters.minRating,
        maxRating: filters.maxRating,
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
        featured: filters.featured,
        sort: filters.sort,
      }),
    [games, filters],
  );

  return (
    <div
      data-js-enhanced
      className="mx-auto hidden w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Steam Style Search
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Game Browser
        </h1>
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <SavedFilterPresets />
          <FilterPanel />
        </aside>

        <main className="min-w-0 space-y-4">
          <SearchInput />
          <ActiveFilterChips />
          <VirtualGameList games={filteredGames} />
        </main>
      </div>
    </div>
  );
}
