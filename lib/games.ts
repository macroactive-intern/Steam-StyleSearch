import gamesData from "@/data/games.json";
import { filterGames, type FilterGamesFilters } from "@/lib/filterGames";
import type { Game } from "@/types/game";

export interface GetGamesOptions extends FilterGamesFilters {
  search?: string;
}

const games: readonly Game[] = gamesData;

function copyGame(game: Game): Game {
  return {
    ...game,
    tags: [...game.tags],
  };
}

function uniqueSorted(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort((first, second) =>
    first.localeCompare(second),
  );
}

function toFilterGamesFilters({
  search,
  ...filters
}: GetGamesOptions): FilterGamesFilters {
  return {
    ...filters,
    q: filters.q ?? search,
  };
}

export function getGames(filters: GetGamesOptions = {}): Game[] {
  return filterGames(games, toFilterGamesFilters(filters)).map(copyGame);
}

export function getPlatforms(): string[] {
  return uniqueSorted(games.map((game) => game.platform));
}

export function getGenres(): string[] {
  return uniqueSorted(games.map((game) => game.genre));
}

export function getTags(): string[] {
  return uniqueSorted(games.flatMap((game) => game.tags));
}

export function getReleaseYearRange(): { min: number; max: number } {
  const releaseYears = games.map((game) => game.releaseYear);

  return {
    min: Math.min(...releaseYears),
    max: Math.max(...releaseYears),
  };
}
