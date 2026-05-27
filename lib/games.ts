import gamesData from "@/data/games.json";
import { filterGames, type FilterGamesFilters } from "@/lib/filterGames";
import type { Game, GameFilters } from "@/types/game";

export interface GetGamesOptions extends GameFilters {
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

const releaseYears = games.map((game) => game.releaseYear);

export const PLATFORMS = uniqueSorted(games.map((game) => game.platform));
export const GENRES = uniqueSorted(games.map((game) => game.genre));
export const TAGS = uniqueSorted(games.flatMap((game) => game.tags));
export const RELEASE_YEAR_RANGE = {
  min: Math.min(...releaseYears),
  max: Math.max(...releaseYears),
};

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

export function getGameById(id: string): Game | undefined {
  const game = games.find((game) => game.id === id);

  return game ? copyGame(game) : undefined;
}
